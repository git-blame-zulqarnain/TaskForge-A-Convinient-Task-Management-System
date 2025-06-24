const express = require('express');
const router = express.Router();
const { getTaskOverview, getTaskTrends } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 

router.get('/overview', getTaskOverview);
router.get('/trends', getTaskTrends); 

module.exports = router;