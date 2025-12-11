import { Rental, Car, User } from '../models/index.js';
import { Op } from 'sequelize';

export const checkAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    const conflictingRentals = await Rental.count({
      where: {
        carId,
        status: { [Op.notIn]: ['cancelled', 'completed'] }, // Only check active/pending rentals
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            startDate: {
              [Op.lte]: startDate,
            },
            endDate: {
              [Op.gte]: endDate,
            },
          },
        ],
      },
    });

    if (conflictingRentals > 0) {
      return res.status(200).json({ available: false, message: 'Car is not available for these dates.' });
    }

    return res.status(200).json({ available: true, message: 'Car is available.' });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
};

export const createRental = async (req, res) => {
  try {
    const { carId, startDate, endDate, paymentMethod } = req.body;
    const userId = req.user.id; // Assuming auth middleware populates req.user

    // 1. Check availability again
    const conflictingRentals = await Rental.count({
      where: {
        carId,
        status: { [Op.notIn]: ['cancelled', 'completed'] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } },
        ],
      },
    });

    if (conflictingRentals > 0) {
      return res.status(400).json({ message: 'Car is no longer available for these dates.' });
    }

    // 2. Calculate total cost
    const car = await Car.findByPk(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    
    if (days <= 0) return res.status(400).json({ message: 'Invalid date range' });

    const totalCost = days * car.dailyRate;

    // 3. Create Rental
    const rental = await Rental.create({
      userId,
      carId,
      startDate,
      endDate,
      totalCost,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
    });

    res.status(201).json({ message: 'Rental booking created', rental });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({ message: 'Error creating rental', error: error.message });
  }
};

export const getUserRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    const rentals = await Rental.findAll({
      where: { userId },
      include: [{ model: Car, as: 'car' }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(rentals);
  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({ message: 'Error fetching rentals', error: error.message });
  }
};

export const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      include: [
        { model: Car, as: 'car' },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(rentals);
  } catch (error) {
    console.error('Get all rentals error:', error);
    res.status(500).json({ message: 'Error fetching rentals', error: error.message });
  }
};
