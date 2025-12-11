import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db.js'; // Assuming this is your configured Sequelize instance

class SellNow extends Model {}

SellNow.init({
    // --- Contact Information ---
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Full Name is required.' },
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Phone Number is required.' },
            // Basic pattern for numbers
            is: {
                args: /^\+?\d{10,15}$/,
                msg: 'Please enter a valid phone number.',
            },
        },
    },
    emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Could be true, but often users resubmit. Set to false for flexibility.
        validate: {
            isEmail: { msg: 'Please enter a valid email address.' },
        },
    },

    // --- Car Details ---
    carMake: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    carModel: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    yearOfManufacture: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1900,
            max: new Date().getFullYear() + 1, // Allows for the current or upcoming model year
        },
    },
    mileageKm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    condition: {
        type: DataTypes.ENUM('Excellent', 'Good', 'Needs Work'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['Excellent', 'Good', 'Needs Work']],
                msg: "Condition must be 'Excellent', 'Good', or 'Needs Work'.",
            },
        },
    },

    // --- Optional/Additional Fields ---
    uploadPhotos: {
        // Use JSONB or TEXT to store an array of URLs/paths.
        // If your database supports ARRAY (like PostgreSQL), use DataTypes.ARRAY(DataTypes.STRING)
        type: DataTypes.TEXT, 
        allowNull: true,
        get() {
            // Getter to parse the stored string back into an array (for TEXT type)
            const photos = this.getDataValue('uploadPhotos');
            return photos ? JSON.parse(photos) : [];
        },
        set(val) {
            // Setter to serialize the array into a string before saving (for TEXT type)
            this.setDataValue('uploadPhotos', JSON.stringify(val));
        }
    },
    additionalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    // --- Internal/Tracking Fields ---
    offerStatus: {
        type: DataTypes.ENUM('Pending', 'Offer Sent', 'Accepted', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    offerAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    offerSentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'SellNow',
    tableName: 'SellNowForms', // Explicitly name the table
    timestamps: true,
});

export default SellNow;