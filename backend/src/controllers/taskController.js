// backend/src/controllers/taskController.js
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

const createTask = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, status, dueDate } = req.body;
    try {
        const task = new Task({
            title,
            description,
            status,
            dueDate,
            owner: req.user._id,
        });
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        next(error);
    }
};

const getTasks = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const baseAccessQuery = {
            $or: [
                { owner: userId },
                { sharedWith: userId }
            ]
        };
        const filterClauses = [baseAccessQuery];

        if (req.query.search) {
            const searchQuery = req.query.search.trim();
            filterClauses.push({
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                ]
            });
        }

        if (req.query.status) {
            const statusQuery = req.query.status.trim();
            const validStatuses = ['Pending', 'In Progress', 'Completed', 'Working', 'Finished']; 
            if (validStatuses.includes(statusQuery)) {
                filterClauses.push({ status: statusQuery });
            } else {
                console.warn(`Invalid status filter received in getTasks: ${statusQuery}`);
            }
        }

        const finalQuery = filterClauses.length > 1 ? { $and: filterClauses } : filterClauses[0];
        const tasks = await Task.find(finalQuery)
            .sort({ createdAt: -1 })
            .populate('owner', 'name email')
            .populate('sharedWith', 'name email');
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('sharedWith', 'name email');

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const userIdString = req.user._id.toString();
        const isOwner = task.owner._id.toString() === userIdString;
        const isSharedWithUser = task.sharedWith.some(user => user._id.toString() === userIdString); 

        if (!isOwner && !isSharedWithUser) {
            res.status(403);
            throw new Error('User not authorized to view this task');
        }
        res.json(task);
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, status, dueDate } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        if (task.owner.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to update this task');
        }
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (dueDate !== undefined) task.dueDate = dueDate;

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate('owner', 'name email')
            .populate('sharedWith', 'name email');
        res.json(populatedTask);
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        if (task.owner.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to delete this task');
        }
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        next(error);
    }
};

const getTaskStats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const totalTasks = await Task.countDocuments({ owner: userId });
        const completedTasks = await Task.countDocuments({
            owner: userId,
            status: 'Finished'
        });
        res.json({
            totalTasks,
            completedTasks
        });
    } catch (error) {
        console.error('Error fetching task stats:', error);
        next(error);
    }
};

const shareTask = async (req, res, next) => {
    const { userIdToShareWith } = req.body;
    if (!userIdToShareWith || (Array.isArray(userIdToShareWith) && userIdToShareWith.length === 0)) {
        return res.status(400).json({ message: 'User ID (userIdToShareWith) to share with is required' });
    }
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        if (task.owner.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to share this task');
        }
        const usersToShare = Array.isArray(userIdToShareWith) ? userIdToShareWith : [userIdToShareWith];
        usersToShare.forEach(shareId => {
            if (shareId.toString() !== task.owner.toString() && !task.sharedWith.map(id => id.toString()).includes(shareId.toString())) {
                task.sharedWith.push(shareId);
            }
        });
        await task.save();
        const updatedTask = await Task.findById(task._id)
            .populate('owner', 'name email')
            .populate('sharedWith', 'name email');
        res.json(updatedTask);
    } catch (error) {
        if (error.name === 'CastError' && error.path === '_id' && error.kind === 'ObjectId') { 
             return res.status(400).json({ message: 'Invalid user ID format provided for sharing.' });
        }
        next(error);
    }
};

const getSharedTasksWithUser = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const sharedTasks = await Task.find({
            sharedWith: userId,
            owner: { $ne: userId }
        })
        .sort({ createdAt: -1 })
        .populate('owner', 'name email')
        .populate('sharedWith', 'name email');
        res.json(sharedTasks);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats,
    shareTask,
    getSharedTasksWithUser
};