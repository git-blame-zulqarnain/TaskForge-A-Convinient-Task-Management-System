// backend/src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats,
    shareTask,
    getSharedTasksWithUser
} = require('../controllers/taskController');
const { validateTask } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.get('/shared', protect, getSharedTasksWithUser); 
router.get('/summary/stats', protect, getTaskStats);

router.route('/')
    .post(protect, validateTask, createTask)
    .get(protect, getTasks);

router.put('/:id/share', protect, shareTask); 

router.route('/:id') 
    .get(protect, getTaskById)
    .put(protect, validateTask, updateTask)
    .delete(protect, deleteTask);


module.exports = router;