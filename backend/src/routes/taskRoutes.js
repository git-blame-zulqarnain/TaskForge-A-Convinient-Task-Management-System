const express = require('express');
const router = express.Router();

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
} = require('../controllers/taskController');

const { validateTask } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, validateTask, createTask)
    .get(protect, getTasks);

router.route('/:id')
    .get(protect, getTaskById)
    .put(protect, validateTask, updateTask)
    .delete(protect, deleteTask);

router.get('/summary/stats', protect, getTaskStats);

module.exports = router;