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

router.get('/shared-with-me', protect, getSharedTasksWithUser);
router.get('/share/:id', protect, shareTask);

router.route('/')
    .post(protect, validateTask, createTask)
    .get(protect, getTasks);

router.route('/:id')
    .get(protect, getTaskById)
    .put(protect, validateTask, updateTask)
    .delete(protect, deleteTask);

router.get('/summary/stats', protect, getTaskStats);
router.put('/share/:id', protect, shareTask);

module.exports = router;