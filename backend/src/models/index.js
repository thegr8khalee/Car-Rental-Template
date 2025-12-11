import sequelize from '../lib/db.js';
import User from './user.model.js';
import Admin from './admin.model.js';
import Car from './car.model.js';
import Blog from './blog.model.js';
import Comment from './comment.model.js';
import Newsletter from './news.model.js';
import { initializeAssociations, BlogCar } from './associations.js';
import Review from './review.model.js';
import NewsletterBroadcast from './broadcast.model.js';
import SellNow from './sell.model.js';
import Rental from './rental.model.js';

// Initialize associations
initializeAssociations();

// Models object for easy access
const models = {
  User,
  Admin,
  Car,
  Blog,
  Comment,
  Newsletter,
  BlogCar,
  NewsletterBroadcast,
  SellNow,
  Rental,
  sequelize,
};

// Database synchronization function
export const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;

    if (force) {
      console.log('⚠️  WARNING: This will drop all existing tables!');
    }

    await sequelize.sync({ force, alter });

    if (force || alter) {
      console.log('✅ Database synchronized successfully');
    } else {
      console.log('✅ Database connection verified');
    }

    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

// Database connection test
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

// Seed data functions
export const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default admin if not exists
    const [admin, adminCreated] = await Admin.findOrCreate({
      where: { email: 'admin@carblog.com' },
      defaults: {
        username: 'admin',
        email: 'admin@carblog.com',
        passwordHash: '$2b$10$placeholder', // Replace with actual hashed password
        position: 'Site Administrator',
        role: 'super_admin',
        bio: 'Default administrator account for the car blog system.',
      },
    });

    if (adminCreated) {
      console.log('✅ Default admin created');
    }

    // Create a sample user
    const [user, userCreated] = await User.findOrCreate({
      where: { email: 'user@example.com' },
      defaults: {
        username: 'testuser',
        email: 'user@example.com',
        passwordHash: '$2b$10$placeholder', // Replace with actual hashed password
        phoneNumber: '+1234567890',
      },
    });

    if (userCreated) {
      console.log('✅ Sample user created');
    }

    // Create an array of sample cars to seed the database
    const carsToCreate = [
      {
        make: 'Toyota',
        model: 'Camry',
        category: 'comfort',
        year: 2024,
        price: 37000000,
        condition: 'new',
        bodyType: 'sedan',
        fuelType: 'gasoline',
        transmission: 'automatic',
        engineSize: 2.5,
        horsepower: 203,
        torque: 184,
        mileage: 0,
        drivetrain: 'fwd',
        msrp: 25845,
        description:
          'The 2024 Toyota Camry offers a perfect blend of reliability, efficiency, and comfort.',
        imageUrls: [
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591521/Gemini_Generated_Image_2cibe02cibe02cib_c6ykuk.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591520/Gemini_Generated_Image_ti0mjti0mjti0mjt_mx1a5k.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591519/Gemini_Generated_Image_w06jllw06jllw06j_o1leof.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591518/Gemini_Generated_Image_vzn4jxvzn4jxvzn4_d6df3s.webp'
        ],
        interior: ['Leather seats', 'Dual-zone climate control', 'Infotainment system'],
        exterior: ['LED headlights', 'Alloy wheels', 'Sunroof'],
        comfort: ['Heated seats', 'Power-adjustable seats', 'Keyless entry'],
        safety: ['Toyota Safety Sense 2.0', 'Blind spot monitoring', 'Rear cross traffic alert'],
        sold: false,
        door: 4,
        color: 'Midnight Black Metallic',
        cylinder: 4,
        length: 192.10,
        width: 72.40,
        trunkCapacity: 15.10,
        tireSize: 'P215/60R16',
        zeroToHundred: 7.60,
      },
      {
        make: 'Honda',
        model: 'Civic',
        category: 'budget',
        year: 2023,
        price: 41440000,
        condition: 'new',
        bodyType: 'sedan',
        fuelType: 'gasoline',
        transmission: 'cvt',
        engineSize: 2.0,
        horsepower: 158,
        torque: 138,
        mileage: 0,
        drivetrain: 'fwd',
        msrp: 27500,
        description: 'A stylish and reliable compact sedan with great fuel economy.',
        imageUrls: [
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591517/Gemini_Generated_Image_wptstcwptstcwpts_blot2w.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591516/Gemini_Generated_Image_w8h0xiw8h0xiw8h0_oqs9le.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591515/Gemini_Generated_Image_a0yv1za0yv1za0yv_abjb92.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591514/Gemini_Generated_Image_7r4dqv7r4dqv7r4d_gwxb8b.webp'
        ],
        interior: ['Fabric seats', 'Touchscreen display', 'Bluetooth connectivity'],
        exterior: ['LED daytime running lights', '16-inch alloy wheels'],
        comfort: ['Automatic climate control', 'Cruise control'],
        safety: ['Honda Sensing', 'Lane keeping assist', 'Collision mitigation braking system'],
        sold: false,
        door: 4,
        color: 'Lunar Silver Metallic',
        cylinder: 4,
        length: 184.0,
        width: 70.9,
        trunkCapacity: 14.8,
        tireSize: 'P215/55R16',
        zeroToHundred: 8.2,
      },
      {
        make: 'Ford',
        model: 'F-150',
        category: 'pickup',
        year: 2022,
        price: 66600000,
        condition: 'used',
        bodyType: 'truck',
        fuelType: 'gasoline',
        transmission: 'automatic',
        engineSize: 5.0,
        horsepower: 400,
        torque: 410,
        mileage: 15000,
        drivetrain: '4wd',
        msrp: 48000,
        description: 'The best-selling truck in America, built to handle any job.',
        imageUrls: [
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591514/Gemini_Generated_Image_9v4gxv9v4gxv9v4g_wpwvh1.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591514/Gemini_Generated_Image_v0pi7yv0pi7yv0pi_jxl3hp.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591513/Gemini_Generated_Image_aztfdpaztfdpaztf_aomrfx.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591746/Gemini_Generated_Image_7ns1bz7ns1bz7ns1_ayszln.webp'
        ],
        interior: ['Cloth seats', 'Rearview camera', 'SYNC 4 infotainment'],
        exterior: ['Fog lights', 'Tow package', 'Running boards'],
        comfort: ['Adjustable steering wheel', 'Power windows'],
        safety: ['Rearview camera', 'Stability control'],
        sold: false,
        door: 4,
        color: 'Oxford White',
        cylinder: 8,
        length: 231.7,
        width: 79.9,
        trunkCapacity: null,
        tireSize: 'P275/65R18',
        zeroToHundred: 6.5,
      },
      {
        make: 'Tesla',
        model: 'Model 3',
        category: 'ev',
        year: 2024,
        price: 59200000,
        condition: 'new',
        bodyType: 'sedan',
        fuelType: 'electric',
        transmission: 'automatic',
        engineSize: 0,
        horsepower: 283,
        torque: 310,
        mileage: 0,
        drivetrain: 'rwd',
        msrp: 41500,
        description: 'An all-electric sedan with incredible performance and range.',
        imageUrls: [
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591529/Gemini_Generated_Image_1mgk5t1mgk5t1mgk_du7byo.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591528/Gemini_Generated_Image_96hjby96hjby96hj_lm3pd7.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591527/Gemini_Generated_Image_7ncwta7ncwta7ncw_lz4esc.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591526/Gemini_Generated_Image_2c4tne2c4tne2c4t_iucb03.webp'
        ],
        interior: ['Vegan leather seats', 'Touchscreen dashboard', 'Autopilot controls'],
        exterior: ['Glass roof', 'Flush door handles', 'LED taillights'],
        comfort: ['Heated steering wheel', 'Cabin overheat protection'],
        safety: ['Autopilot', 'Automatic emergency braking'],
        sold: false,
        door: 4,
        color: 'Pearl White Multi-Coat',
        cylinder: null,
        length: 184.8,
        width: 72.8,
        trunkCapacity: 15.0,
        tireSize: '235/45R18',
        zeroToHundred: 5.8,
      },
      {
        make: 'Jeep',
        model: 'Wrangler',
        category: 'suv',
        year: 2023,
        price: 62160000,
        condition: 'new',
        bodyType: 'suv',
        fuelType: 'gasoline',
        transmission: 'manual',
        engineSize: 3.6,
        horsepower: 285,
        torque: 260,
        mileage: 0,
        drivetrain: '4wd',
        msrp: 43500,
        description: 'An iconic off-road vehicle with legendary capability.',
        imageUrls: [
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591723/Gemini_Generated_Image_w9f3caw9f3caw9f3_raoqfa.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591721/Gemini_Generated_Image_xl711qxl711qxl71_syj0qa.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591720/Gemini_Generated_Image_qzic8lqzic8lqzic_gl3cfm.webp',
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591718/Gemini_Generated_Image_uue24uuue24uuue2_nf1hjf.webp'
        ],
        interior: ['Wash-out interior', 'Apple CarPlay', 'Uconnect system'],
        exterior: ['Removable roof', 'LED headlights', 'Skid plates'],
        comfort: ['Adjustable seating', 'Easy-clean surfaces'],
        safety: ['Park assist', 'Hill descent control', 'Traction control'],
        sold: false,
        door: 4,
        color: 'Firecracker Red',
        cylinder: 6,
        length: 188.4,
        width: 73.8,
        trunkCapacity: 31.7,
        tireSize: 'P245/75R17',
        zeroToHundred: 7.0,
      },
    ];

    await Car.bulkCreate(carsToCreate, { ignoreDuplicates: true });
    const cars = await Car.findAll({
      attributes: ['id', 'make', 'model', 'year'],
    });

    console.log('✅ Sample cars created and retrieved.');

    // Create an array of sample blogs
    const blogsToCreate = [
      {
        title: 'Toyota Camry Review: A Reliable Choice',
        tagline: 'A comprehensive review of the 2024 Toyota Camry.',
        author: {
          id: user.id,
          name: user.username,
        },
        category: 'reviews',
        status: 'published',
        featuredImage:
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591717/Gemini_Generated_Image_2cibe02cibe02cib_z1y8qo.webp',
        content: `
The 2024 Toyota Camry continues its reputation as one of the most dependable sedans on the market. Known for its refined performance and comfort, the Camry blends practicality with a touch of sportiness. Its updated exterior design — sleek lines, aggressive grille, and LED headlights — gives it a modern yet timeless look that appeals to families and professionals alike.

Inside, the Camry impresses with premium materials and intuitive controls. Toyota’s latest infotainment system includes smartphone integration, a responsive touchscreen, and multiple driver-assist features such as adaptive cruise control and lane-keeping assist. The hybrid version remains one of the most fuel-efficient sedans in its class.

If you’re seeking a car that offers strong resale value, top-tier reliability, and affordable maintenance, the Camry remains a smart and safe investment for Nigerian drivers.
    `,
        carIds: [
          cars.find((c) => c.make === 'Toyota' && c.model === 'Camry')?.id,
        ],
        tags: ['review', 'sedan', 'Toyota', 'Camry'],
        viewCount: 150,
      },
      {
        title: 'Honda Civic vs. Toyota Camry: Which is Better?',
        tagline: 'A head-to-head comparison of two of the most popular sedans.',
        author: {
          id: user.id,
          name: user.username,
        },
        category: 'comparisons',
        status: 'published',
        featuredImage:
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591711/Gemini_Generated_Image_wptstcwptstcwpts_vdtw6q.webp',
        content: `
When it comes to compact and mid-size sedans, the Honda Civic and Toyota Camry often dominate the conversation. The Civic is celebrated for its sporty handling, stylish interior, and impressive fuel economy, while the Camry offers a more spacious cabin and a smooth, refined ride that prioritizes comfort.

In terms of performance, the Civic feels lighter and more agile, making it perfect for city driving, while the Camry’s larger engine and higher horsepower give it a stronger presence on highways. Inside, both cars come with intuitive infotainment systems and advanced driver-assist technologies, but the Camry offers more rear legroom and cargo space.

Ultimately, the Civic appeals to younger drivers looking for fun and efficiency, while the Camry caters to families or anyone prioritizing comfort and reliability. Both stand as excellent long-term investments depending on your driving needs.
    `,
        carIds: [
          cars.find((c) => c.make === 'Honda' && c.model === 'Civic')?.id,
          cars.find((c) => c.make === 'Toyota' && c.model === 'Camry')?.id,
        ],
        tags: ['comparison', 'sedan', 'Honda', 'Toyota', 'Civic'],
        viewCount: 200,
      },
      {
        title: 'The Future of Electric Vehicles',
        tagline: 'An in-depth look at the latest EV technology and trends.',
        author: {
          id: user.id,
          name: user.username,
        },
        category: 'technology',
        status: 'published',
        featuredImage:
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591529/Gemini_Generated_Image_1mgk5t1mgk5t1mgk_du7byo.webp',
        content: `
The electric vehicle (EV) revolution is reshaping the automotive landscape faster than ever before. Brands like Tesla, Rivian, and Hyundai are pushing the boundaries of performance and sustainability. The Tesla Model 3, for instance, combines sleek design with industry-leading battery efficiency, giving drivers both style and peace of mind.

Recent advancements in battery technology have made EVs more practical and affordable. Charging networks are expanding rapidly across Africa, including early efforts in Nigeria to establish public charging hubs in major cities. EVs are no longer a niche luxury — they’re becoming the mainstream choice for environmentally conscious drivers.

Looking ahead, innovations like solid-state batteries, wireless charging, and AI-assisted driving will make EVs even more efficient and accessible. The future is electric, and it’s arriving faster than most people realize.
    `,
        carIds: [
          cars.find((c) => c.make === 'Tesla' && c.model === 'Model 3')?.id,
        ],
        tags: ['EV', 'technology', 'electric', 'Tesla'],
        viewCount: 300,
      },
      {
        title: 'New Jeep Wrangler: What to Expect',
        tagline: 'A preview of the latest features on the new Jeep Wrangler.',
        author: {
          id: user.id,
          name: user.username,
        },
        category: 'news',
        status: 'published',
        featuredImage:
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591723/Gemini_Generated_Image_w9f3caw9f3caw9f3_raoqfa.webp',
        content: `
The Jeep Wrangler has always been the symbol of adventure — and the 2023 model continues that legacy with even more capability and tech upgrades. It retains its rugged body-on-frame design, removable roof panels, and classic seven-slot grille while introducing modern comforts and safety enhancements.

Under the hood, drivers can choose between a fuel-efficient V6, a torquey diesel, or even a plug-in hybrid powertrain for eco-friendly off-roading. Inside, the Wrangler now offers a larger touchscreen with Apple CarPlay, improved seat comfort, and new driver-assist systems that make it equally suited for city commutes and off-road trails.

Whether you’re conquering muddy tracks or cruising through Lagos traffic, the 2023 Wrangler remains one of the most versatile SUVs money can buy.
    `,
        carIds: [
          cars.find((c) => c.make === 'Jeep' && c.model === 'Wrangler')?.id,
        ],
        tags: ['news', 'SUV', 'Jeep', 'off-road'],
        viewCount: 180,
      },
      {
        title: 'Essential Maintenance Tips for Your Truck',
        tagline: 'Keep your Ford F-150 running smoothly with these tips.',
        author: {
          id: user.id,
          name: user.username,
        },
        category: 'maintenance',
        status: 'published',
        featuredImage:
          'https://res.cloudinary.com/dn2tbatgr/image/upload/v1761591706/Gemini_Generated_Image_9v4gxv9v4gxv9v4g_dek36i.webp',
        content: `
Your truck works hard — so keeping it in top shape ensures it lasts for years to come. The Ford F-150, known for its durability and power, benefits greatly from consistent maintenance. Regular oil changes, tire rotations, and brake inspections can prevent costly breakdowns and extend your truck’s lifespan.

Check your fluids often — especially transmission and coolant levels — since trucks that tow or haul regularly experience more strain on their systems. Cleaning and protecting the undercarriage also helps prevent rust, particularly during Nigeria’s rainy season. 

Lastly, listen to your truck. Unusual noises or reduced performance are early signs that something needs attention. Treat your F-150 well, and it will reward you with dependable performance no matter where the road takes you.
    `,
        carIds: [
          cars.find((c) => c.make === 'Ford' && c.model === 'F-150')?.id,
        ],
        tags: ['maintenance', 'truck', 'Ford', 'F-150'],
        viewCount: 120,
      },
    ];

    await Blog.bulkCreate(blogsToCreate, { ignoreDuplicates: true });
    const blogs = await Blog.findAll({ attributes: ['id', 'title'] });

    console.log('✅ Sample blogs created and retrieved.');

    // Create an array of sample comments
    const commentsToCreate = [
      {
        content: 'I love my Camry! Great review.',
        blogId: blogs.find((b) => b.title.includes('Camry Review'))?.id,
        userId: user.id,
        username: user.username,
        status: 'approved',
      },
      {
        content: 'Great comparison! It really helped me make a decision.',
        blogId: blogs.find((b) => b.title.includes('Civic vs. Toyota Camry'))
          ?.id,
        userId: user.id,
        username: user.username,
        status: 'approved',
      },
      {
        content: 'I wish there were more EV charging stations.',
        blogId: blogs.find((b) =>
          b.title.includes('The Future of Electric Vehicles')
        )?.id,
        userId: user.id,
        username: user.username,
        status: 'approved',
      },
      {
        content: 'This is a fantastic blog post. Very informative.',
        blogId: blogs.find((b) => b.title.includes('New Jeep Wrangler'))?.id,
        userId: user.id,
        username: user.username,
        status: 'approved',
      },
      {
        content: 'Thanks for the maintenance tips! I needed this.',
        blogId: blogs.find((b) =>
          b.title.includes('Essential Maintenance Tips')
        )?.id,
        userId: user.id,
        username: user.username,
        status: 'approved',
      },
    ];

    const reviewsToCreate = [
      {
        content:
          'The interior is incredibly comfortable and the performance is smooth. A great daily driver.',
        name: 'Jane Doe',
        interiorRating: 5,
        exteriorRating: 4,
        comfortRating: 5,
        performanceRating: 4,
        carId: cars[0].id, // Replace with a real car ID
        userId: user.id, // Replace with a real user ID
        status: 'approved',
      },
      {
        content:
          'Stunning exterior design, but the comfort is a bit lacking on long trips. Performance is solid.',
        name: 'John Smith',
        interiorRating: 3,
        exteriorRating: 5,
        comfortRating: 3,
        performanceRating: 5,
        carId: cars[1].id, // Replace with a real car ID
        userId: user.id,
        status: 'approved',
      },
      {
        content:
          'This car is a beast! Performance is unmatched. Simple interior, but it gets the job done.',
        name: 'Alice Johnson',
        interiorRating: 2,
        exteriorRating: 4,
        comfortRating: 3,
        performanceRating: 5,
        carId: cars[2].id, // Replace with a real car ID
        userId: user.id,
        status: 'approved',
      },
      {
        content:
          'The comfort and safety features are top-notch. It feels like driving a cloud. The performance is good for a family car.',
        name: 'Michael Brown',
        interiorRating: 5,
        exteriorRating: 4,
        comfortRating: 5,
        performanceRating: 3,
        carId: cars[3].id, // Replace with a real car ID
        userId: user.id,
        status: 'approved',
      },
    ];

    const sellNowEntry = {
      fullName: 'Robert Smith',
      phoneNumber: '5551234567',
      emailAddress: 'robert.smith@sellcar.com',
      carMake: 'Toyota',
      carModel: 'Camry',
      yearOfManufacture: 2020,
      mileageKm: 45000,
      condition: 'Good',
      additionalNotes: 'Minor scratch on the passenger side door.',
      offerStatus: 'Pending',
    };

    await SellNow.findOrCreate({
      where: { emailAddress: sellNowEntry.emailAddress },
      defaults: sellNowEntry,
    });
    console.log('✅ Sample SellNow entry created.');

    await Review.bulkCreate(reviewsToCreate, { ignoreDuplicates: true });
    console.log('✅ Sample reviews created.');



    await Comment.bulkCreate(commentsToCreate, { ignoreDuplicates: true });
    console.log('✅ Sample comments created.');

    console.log('🎉 Database seeding completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Clean up function for development
export const resetDatabase = async () => {
  try {
    console.log('🧹 Resetting database...');
    await syncDatabase({ force: true });
    await seedData();
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
};

// Export models individually for convenience
export { User, Admin, Car, Blog, Comment, Newsletter, BlogCar, Rental, sequelize };

// Default export with all models
export default models;
