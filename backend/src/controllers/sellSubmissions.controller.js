// controllers/sellSubmission.controller.js
import SellNow from '../models/sell.model.js';
import { Op } from 'sequelize';

// Get sell submissions stats
export const getSellSubmissionsStats = async (req, res) => {
  try {
    const totalSubmissions = await SellNow.count();
    
    const pendingSubmissions = await SellNow.count({
      where: { offerStatus: 'Pending' }
    });
    
    const offersSent = await SellNow.count({
      where: { offerStatus: 'Offer Sent' }
    });
    
    const acceptedOffers = await SellNow.count({
      where: { offerStatus: 'Accepted' }
    });
    
    const rejectedOffers = await SellNow.count({
      where: { offerStatus: 'Rejected' }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        offersSent,
        acceptedOffers,
        rejectedOffers
      }
    });
  } catch (error) {
    console.error('Error fetching sell submissions stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sell submissions stats'
    });
  }
};

// Get paginated sell submissions with optional status filter
export const getSellSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    if (status && status !== 'all') {
      whereClause.offerStatus = status;
    }

    const { count, rows: submissions } = await SellNow.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          total: count,
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sell submissions:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sell submissions'
    });
  }
};

// Update sell submission status
export const updateSellSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Offer Sent', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Pending, Offer Sent, Accepted, Rejected'
      });
    }

    const submission = await SellNow.findByPk(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.offerStatus = status;
    await submission.save();

    return res.status(200).json({
      success: true,
      message: `Submission status updated to ${status}`,
      data: submission
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update submission status'
    });
  }
};

// Send offer to customer
export const sendOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { offerAmount } = req.body;

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid offer amount is required'
      });
    }

    const submission = await SellNow.findByPk(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.offerAmount = parseFloat(offerAmount);
    submission.offerStatus = 'Offer Sent';
    submission.offerSentDate = new Date();
    await submission.save();

    // TODO: Send email to customer with offer details
    // await sendOfferEmail(submission.emailAddress, {
    //   name: submission.fullName,
    //   carDetails: `${submission.carMake} ${submission.carModel} ${submission.yearOfManufacture}`,
    //   offerAmount: offerAmount
    // });

    return res.status(200).json({
      success: true,
      message: 'Offer sent successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error sending offer:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send offer'
    });
  }
};

// Delete sell submission
export const deleteSellSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await SellNow.findByPk(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    await submission.destroy();

    return res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete submission'
    });
  }
};