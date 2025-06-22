const Task =require('../models/Task');
const User=require('../models/User');
const {validationResult}=require('express-validator');
const mongoose = require('mongoose');

const createTask=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    const {title,description,status,dueDate}=req.body;

    try{
        const task=new Task(
            {
                title,
                description,
                status,
                dueDate,
                user:req.user._id,
                sharedWith: []
            });
            const createdTask=await task.save();
            res.status(201).json(createdTask);
    }
    catch(error)
    {
        next(error);
    }
};

const getTasks = async (req, res, next) => {
  try {

    const userId= req.user._id;
    const baseAccessQuery={
        $or:[{user:userId},{sharedWith: userId}]
    };

    const filterClauses=[baseAccessQuery];

    if (req.query.search  && req.query.search.trim() !== '') {
      const searchQuery = req.query.search.trim();
        filterClauses.push({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        });
    }

    if (req.query.status  && req.query.status.trim() !== '') {
      const statusQuery = req.query.status.trim();
      if (['Pending', 'Working', 'Finished'].includes(statusQuery)) {
        filterClauses.push({ status: statusQuery });
      } else {
        console.warn(`Invalid status filter received: ${statusQuery}`);
      }
    }

    const finalQuery = filterClauses.length > 1 ? { $and: filterClauses } : (filterClauses[0] ||  {});

    const tasks=await Task.find(finalQuery).sort({ createdAt: -1 }).populate('user', 'name email').populate('sharedWith', 'name email');

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById=async(req,res,next)=>{
    try{
        const task=await Task.findById(req.params.id).populate('user', 'name email').populate('sharedWith', 'name email');

        if(!task)
        {
            res.status(404);
            throw new Error('Error 404: Task not found');
        }
        
        const userIdString = req.user._id.toString();
        const isOwner=task.user&& task.user.toString()===userIdString;

        const isSharedWithUser=Array.isArray(task.sharedWith)&&task.sharedWith&&task.sharedWith.some(sharedUserDoc=>sharedUserDoc.toString()===userIdString);
        
        if(!isOwner&&!isSharedWithUser)
        {
            res.status(401);
            throw new Error('Error 401: Unauthorized access');
        }
        
        res.json(task);
    }
    catch(error)
    {
        next(error);
    }
};
const updateTask=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }
    const {title,description,status,dueDate}=req.body;
    try
    {
        const task=await Task.findById(req.params.id);
        if(!task)
        {
            res.status(404);
            throw new Error('Error 404: Task not found');
        }
        if(task.user.toString()!==req.user._id.toString())
        {
           res.status(401);
              throw new Error('Error 401: Unauthorized access');
        }

        const oldStatus=task.status;
        
        if(title!==undefined)
            task.title=title;

        if(description!==undefined)
            task.description=description;
        if(status!==undefined)
            task.status=status;
        if(dueDate!==undefined)
            task.dueDate=dueDate;

        const updatedTask=await task.save();
        
        const populatedTask = await Task.findById(updatedTask._id).populate('user', 'name email').populate('sharedWith', 'name email');

        if(status!==undefined && oldStatus !== status && req.app.get('socket.io'))
        {
            const io = req.app.get('socket.io');
            const loggedInUsers=req.user;
            const notificationData = {
                    message: `Task "${populatedTask.title}" status updated to "${status}" by ${loggedInUser.name || 'a user'}.`,
                    taskId: populatedTask._id,
                    taskTitle: populatedTask.title,
                    newStatus: status,
                    updatedBy: loggedInUser.name || 'User' 
        };
            if (populatedTask.user && populatedTask.user._id.toString() !== loggedInUser._id.toString()) {
                io.to(populatedTask.user._id.toString()).emit('taskStatusUpdated', notificationData);
                console.log(`SOCKET: Emitted 'taskStatusUpdated' to owner room: ${populatedTask.user._id.toString()}`);
            }
            if (populatedTask.sharedWith && populatedTask.sharedWith.length > 0) {
                populatedTask.sharedWith.forEach(sharedUserDoc => { // Assuming sharedWith is populated with user docs
                    if (sharedUserDoc._id.toString() !== loggedInUser._id.toString()) {
                        io.to(sharedUserDoc._id.toString()).emit('taskStatusUpdated', notificationData);
                        console.log(`SOCKET: Emitted 'taskStatusUpdated' to sharedUser room: ${sharedUserDoc._id.toString()}`);
                    }
                });
            }
        }
        res.json(populatedTask);
    }
    catch(error)
    {
        next(error);
    }
};

const deleteTask=async(req,res,next)=>
{
    try
    {
        const task=await Task.findById(req.params.id);

        if(!task)
        {
            res.status(404);
            throw new Error('Error 404: Task not found');
        }
        if(task.user.toString()!==req.user._id.toString())
        {
            res.status(401);
            throw new Error('Error 401: Unauthorized access');
        }

        await task.deleteOne();
        res.json({message: 'Task removed'});
    }
    catch(error)
    {
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
    let targetUserId = userIdToShareWith;

    if (!targetUserId && emailToShareWith) {
        try {
            const userToShare = await User.findOne({ email: emailToShareWith });
            if (!userToShare) return res.status(404).json({ message: 'User with that email not found to share with.'});
            targetUserId = userToShare._id.toString();
        } catch(e){ next(e); return; }
    }
    
    if (!targetUserId || (Array.isArray(targetUserId) && targetUserId.length === 0)) {
        return res.status(400).json({ message: 'User ID or Email to share with is required' });
    }

    try {
        const task = await Task.findById(req.params.id);
        if (!task) { res.status(404); throw new Error('Task not found'); }
        if (task.user.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error('User not authorized to share this task');
        }

        const usersToProcess = Array.isArray(targetUserId) ? targetUserId : [targetUserId];
        let newlySharedUserIds = [];

        for (const idInput of usersToProcess) {
            const shareIdStr = idInput.toString();
            if (shareIdStr === task.user.toString()) continue;
            const userExists = await User.findById(shareIdStr);
            if (!userExists) {
                console.warn(`User ID ${shareIdStr} for sharing not found in DB.`);
                continue; 
            }
            if (!task.sharedWith.map(id => id.toString()).includes(shareIdStr)) {
                task.sharedWith.push(shareIdStr); 
                newlySharedUserIds.push(shareIdStr);
            }
        }

        if (newlySharedUserIds.length > 0) {
            await task.save();
            const populatedTask = await Task.findById(task._id)
                .populate('user', 'name email')
                .populate('sharedWith', 'name email');
            
            if (req.app.get('socketio')) {
                const io = req.app.get('socketio');
                const sharerUser = req.user; 
                 newlySharedUserIds.forEach(sharedUserId => {
                    io.to(sharedUserId).emit('newTaskShared', {
                        message: `Task "${populatedTask.title}" has been shared with you by ${sharerUser.name || 'a user'}.`,
                        taskId: populatedTask._id, taskTitle: populatedTask.title, sharedBy: sharerUser.name || 'User'
                    });
                });
            }
            res.json(populatedTask);
        } else {
            const currentPopulatedTask = await Task.findById(task._id)
                .populate('user', 'name email')
                .populate('sharedWith', 'name email');
            res.json({ message: 'Task already shared with specified user(s) or no new valid users to share with.', task: currentPopulatedTask });
        }
    } catch (error) {
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
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

module.exports={
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats,
    shareTask,
    getSharedTasksWithUser
};