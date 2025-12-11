// controllers/broadcast.controller.js
import Broadcast from '../models/broadcast.model.js';
import Newsletter from '../models/news.model.js';
import Admin from '../models/admin.model.js';
import cloudinary from '../lib/cloudinary.js';
import zohoMailService from '../services/zoho.service.js'

const uploadImageToCloudinary = async (base64Image) => {
    if (!base64Image) return null;

    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'car-dealership/broadcasts',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

// Create and send broadcast
export const createBroadcast = async (req, res) => {
    try {
        const { title, content, imageUrl, sentById } = req.body;
        // const { id } = req.user; // Assuming req.user is set by auth middleware

        // Validation
        if (!title || !content || !sentById) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and sentById are required',
            });
        }

        // Upload image if provided
        let uploadedImageUrl = null;
        if (imageUrl && imageUrl.startsWith('data:image')) {
            uploadedImageUrl = await uploadImageToCloudinary(imageUrl);
        }

        // Get all active newsletter subscribers
        const subscribers = await Newsletter.findAll({
            where: {
                unsubscribedAt: null,
            },
            attributes: ['email', 'userName'],
        });

        const subscribersCount = subscribers.length;

        if (subscribersCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active subscribers found to send broadcast',
            });
        }

        // Create broadcast record with status 'pending'
        const broadcast = await Broadcast.create({
            subject: title, // Changed from 'title' to 'subject'
            content,
            imageUrl: uploadedImageUrl,
            sentById,
            recipientCount: subscribersCount, // Changed from 'subscribersSent'
            successCount: 0,
            failureCount: 0,
            status: 'pending',
            sentAt: new Date(),
        });

        // Get sender info
        const sender = await Admin.findByPk(sentById, {
            attributes: ['username', 'email'],
        });

        // Send emails to all subscribers (in batches)
        const batchSize = 50;
        let successCount = 0;
        let failureCount = 0;
        const failedEmails = [];

        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            const batchPromises = batch.map((subscriber) =>
                zohoMailService.sendBroadcastEmail({
                    to: subscriber.email,
                    subject: title,
                    content: content,
                    imageUrl: uploadedImageUrl,
                    subscriberName: subscriber.userName,
                    senderName: sender?.username,
                }).catch((error) => {
                    console.error(`Failed to send email to ${subscriber.email}:`, error);
                    return { success: false, error: true, email: subscriber.email };
                })
            );

            const results = await Promise.all(batchPromises);

            // Count successes and failures
            results.forEach((result) => {
                if (result.success) {
                    successCount++;
                } else {
                    failureCount++;
                    failedEmails.push(result.email);
                }
            });
        }

        // Update broadcast with final counts and status
        await broadcast.update({
            successCount,
            failureCount,
            status: failureCount === subscribersCount ? 'failed' : 'completed',
        });

        res.status(201).json({
            success: true,
            message: `Broadcast sent successfully to ${successCount} of ${subscribersCount} subscribers`,
            data: {
                broadcast,
                recipientCount: subscribersCount,
                successCount,
                failureCount,
                failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
            },
        });
    } catch (error) {
        console.error('Error creating broadcast:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create and send broadcast',
        });
    }
};

// Get all broadcasts
export const getBroadcasts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: broadcasts } = await Broadcast.findAndCountAll({
            include: [
                {
                    model: Admin,
                    as: 'sender',
                    attributes: ['id', 'username', 'email'],
                },
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['sentAt', 'DESC']],
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                broadcasts,
                pagination: {
                    total: count,
                    currentPage: parseInt(page),
                    totalPages,
                    limit: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch broadcasts',
        });
    }
};

// Get broadcast by ID
export const getBroadcastById = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await Broadcast.findByPk(id, {
            include: [
                {
                    model: Admin,
                    as: 'sender',
                    attributes: ['id', 'username', 'email', 'avatar'],
                },
            ],
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found',
            });
        }

        res.status(200).json({
            success: true,
            data: broadcast,
        });
    } catch (error) {
        console.error('Error fetching broadcast:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch broadcast',
        });
    }
};

// Delete broadcast
export const deleteBroadcast = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await Broadcast.findByPk(id);

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found',
            });
        }

        // Delete image from Cloudinary if exists
        if (broadcast.imageUrl) {
            try {
                const urlParts = broadcast.imageUrl.split('/');
                const publicIdWithExt = urlParts.slice(urlParts.indexOf('car-dealership')).join('/');
                const publicId = publicIdWithExt.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        await broadcast.destroy();

        res.status(200).json({
            success: true,
            message: 'Broadcast deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting broadcast:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete broadcast',
        });
    }
};

// Get broadcast statistics
export const getBroadcastStats = async (req, res) => {
    try {
        const totalBroadcasts = await Broadcast.count();
        const totalRecipients = await Broadcast.sum('recipientCount') || 0;
        const totalSuccessful = await Broadcast.sum('successCount') || 0;
        const totalFailed = await Broadcast.sum('failureCount') || 0;

        // Get status breakdown
        const statusBreakdown = await Broadcast.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true,
        });

        const recentBroadcasts = await Broadcast.findAll({
            limit: 5,
            order: [['sentAt', 'DESC']],
            attributes: ['id', 'subject', 'sentAt', 'recipientCount', 'successCount', 'failureCount', 'status'],
        });

        res.status(200).json({
            success: true,
            data: {
                totalBroadcasts,
                totalRecipients,
                totalSuccessful,
                totalFailed,
                successRate: totalRecipients > 0
                    ? ((totalSuccessful / totalRecipients) * 100).toFixed(2)
                    : 0,
                statusBreakdown,
                recentBroadcasts,
            },
        });
    } catch (error) {
        console.error('Error fetching broadcast stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch broadcast statistics',
        });
    }
};