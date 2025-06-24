const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markNotificationsAsRead,
    markAllNotificationsAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 

router.get('/', getNotifications);
router.put('/mark-read', markNotificationsAsRead);
router.put('/mark-all-read', markAllNotificationsAsRead); 

module.exports = router;