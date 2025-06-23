const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const createAndSaveNotification = async (userId, type, message, relatedTaskId = null, relatedUserId = null) => {
    try {
        const notification = new Notification({
            user: userId,
            type: type,
            message: message,
            relatedTask: relatedTaskId,
            relatedUser: relatedUserId
        });
        await notification.save(); 
        console.log(`DB_NOTIFY: Notification saved for user ${userId}: ${message.substring(0, 50)}...`);
    } catch (error) {
        console.error(`DB_NOTIFY_ERROR: Error saving notification for user ${userId}:`, error.message);
    } 
}; 


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
            user: req.user._id,
            sharedWith: []
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
        $or: [{ user: userId }, { sharedWith: userId }]
    };
    const filterClauses = [baseAccessQuery];

    if (req.query.search && req.query.search.trim() !== "") {
      const searchQuery = req.query.search.trim();
        filterClauses.push({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
            ]
        });
    }

    if (req.query.status && req.query.status.trim() !== "") {
      const statusQuery = req.query.status.trim();
      const validStatuses = ['Pending', 'Working', 'Finished'];
      if (validStatuses.includes(statusQuery)) {
        filterClauses.push({ status: statusQuery });
      } else {
        console.warn(`Invalid status filter received in getTasks: ${statusQuery}`);
      }
    }
    const finalQuery = filterClauses.length > 1 ? { $and: filterClauses } : (filterClauses[0] || {});
    const tasks = await Task.find(finalQuery)
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('sharedWith', 'name email');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('user', 'name email')
            .populate('sharedWith', 'name email');

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        const userIdString = req.user._id.toString();
        const isOwner = task.user && task.user._id.toString() === userIdString;
        const isSharedWithUser = Array.isArray(task.sharedWith) && task.sharedWith.some(sharedUserDoc => sharedUserDoc._id.toString() === userIdString);

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
        if (task.user.toString() !== req.user._id.toString()) {
           res.status(403);
           throw new Error('User not authorized to update this task');
        }

        const oldStatus = task.status;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (dueDate !== undefined) task.dueDate = dueDate;

        const updatedTaskResult = await task.save();
        const populatedTask = await Task.findById(updatedTaskResult._id)
            .populate('user', 'name email')
            .populate('sharedWith', 'name email');

        if (status !== undefined && oldStatus !== status) {
            const io = req.app.get('socketio');
            const loggedInUser = req.user;
            const notificationMessage = `Task "${populatedTask.title}" status updated to "${status}" by ${loggedInUser.name || 'a user'}.`;
            const notificationDataForSocket = {
                message: notificationMessage,
                taskId: populatedTask._id,
                taskTitle: populatedTask.title,
                newStatus: status,
                updatedBy: loggedInUser.name || 'User'
            };

            if (populatedTask.user && populatedTask.user._id.toString() !== loggedInUser._id.toString()) {
                if (io) io.to(populatedTask.user._id.toString()).emit('taskStatusUpdated', notificationDataForSocket);
                await createAndSaveNotification(
                    populatedTask.user._id.toString(),
                    'taskStatusUpdated',
                    notificationMessage,
                    populatedTask._id,
                    loggedInUser._id
                );
            }

            if (populatedTask.sharedWith && populatedTask.sharedWith.length > 0) {
                for (const sharedUserDoc of populatedTask.sharedWith) {
                    if (sharedUserDoc._id.toString() !== loggedInUser._id.toString()) {
                        if (io) io.to(sharedUserDoc._id.toString()).emit('taskStatusUpdated', notificationDataForSocket);
                        await createAndSaveNotification(
                            sharedUserDoc._id.toString(),
                            'taskStatusUpdated',
                            notificationMessage,
                            populatedTask._id,
                            loggedInUser._id
                        );
                    }
                }
            }
        }
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
        if (task.user.toString() !== req.user._id.toString()) {
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
        const totalTasks = await Task.countDocuments({ user: userId });
        const completedTasks = await Task.countDocuments({
            user: userId,
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
    const { userIdToShareWith, emailToShareWith } = req.body;
    let targetUserIdentifier = userIdToShareWith || emailToShareWith;

    if (!targetUserIdentifier) {
        return res.status(400).json({ message: 'User identifier (ID or Email) to share with is required' });
    }
    
    try {
        const task = await Task.findById(req.params.id).populate('user', 'name email');
        if (!task) { res.status(404); throw new Error('Task not found'); }
        if (!task.user || task.user._id.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error('User not authorized to share this task');
        }

        const identifiersToProcess = Array.isArray(targetUserIdentifier) ? targetUserIdentifier : [targetUserIdentifier];
        let newlySharedUserDetails = [];

        for (const identifier of identifiersToProcess) {
            let userToShareWithDoc;
            if (mongoose.Types.ObjectId.isValid(identifier)) {
                userToShareWithDoc = await User.findById(identifier).select('_id name email');
            } else if (typeof identifier === 'string' && identifier.includes('@')) {
                userToShareWithDoc = await User.findOne({ email: identifier }).select('_id name email');
            }

            if (!userToShareWithDoc) {
                console.warn(`User not found for identifier: ${identifier}. Skipping.`);
                continue;
            }

            const shareIdStr = userToShareWithDoc._id.toString();

            if (shareIdStr === task.user._id.toString()) continue;

            if (!task.sharedWith.map(id => id.toString()).includes(shareIdStr)) {
                task.sharedWith.push(userToShareWithDoc._id);
                newlySharedUserDetails.push({id: shareIdStr, name: userToShareWithDoc.name });
            }
        }

        if (newlySharedUserDetails.length > 0) {
            await task.save();
            const populatedTask = await Task.findById(task._id)
                .populate('user', 'name email')
                .populate('sharedWith', 'name email');
            
            const io = req.app.get('socketio');
            const sharerUser = req.user;

            for (const sharedUserInfo of newlySharedUserDetails) { 
                const notificationMessage = `Task "${populatedTask.title}" has been shared with you by ${sharerUser.name || 'a user'}.`;
                if (io) {
                    io.to(sharedUserInfo.id).emit('newTaskShared', {
                        message: notificationMessage,
                        taskId: populatedTask._id, taskTitle: populatedTask.title, sharedBy: sharerUser.name || 'User'
                    });
                }

                await createAndSaveNotification(
                    sharedUserInfo.id,
                    'taskShared',
                    notificationMessage,
                    populatedTask._id,
                    sharerUser._id
                );
            }
            res.json(populatedTask);
        } else {
            const currentPopulatedTask = await Task.findById(task._id)
                .populate('user', 'name email')
                .populate('sharedWith', 'name email');
            res.json({ message: 'Task already shared with specified user(s) or no new valid users to share with.', task: currentPopulatedTask });
        }
    } catch (error) {
        if (error.name === 'CastError' && error.message.includes('ObjectId')) {
             return res.status(400).json({ message: 'Invalid user ID format provided.' });
        }
        next(error);
    }
};

const getSharedTasksWithUser = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const sharedTasks = await Task.find({
            sharedWith: userId,
            user: { $ne: userId }
        })
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
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