const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler'); 

const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('relatedTask', 'title') 
        .populate('relatedUser', 'name email'); 

    res.json(notifications);
});

const markNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { notificationIds } = req.body; 

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ message: 'Notification IDs are required as an array.' });
    }

    try {
        const result = await Notification.updateMany(
            { _id: { $in: notificationIds }, user: userId, isRead: false }, 
            { $set: { isRead: true } }
        );

        if (result.matchedCount === 0 && result.modifiedCount === 0) {
             return res.status(404).json({ message: 'No unread notifications found matching the provided IDs for this user, or they were already read.' });
        }
        
        res.json({ message: `${result.modifiedCount} notifications marked as read.` });

    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ message: "Failed to mark notifications as read."});
    }
});


module.exports = {
    getNotifications,
    markNotificationsAsRead
};