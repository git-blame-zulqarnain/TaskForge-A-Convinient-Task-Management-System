const Task =require('../models/Task');
const {validationResult}=require('express-validator');

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
                user:req.user._id
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
    const queryConditions = { user: req.user._id };

    if (req.query.search) {
      const searchQuery = req.query.search.trim();
      queryConditions.$or = [ 
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    if (req.query.status) {
      const statusQuery = req.query.status.trim();
      if (['Pending', 'In Progress', 'Completed'].includes(statusQuery)) 
        {
        queryConditions.status = statusQuery;
      } 
      else {
        console.warn(`Invalid status filter received: ${statusQuery}`);
      }
    }

    const tasks = await Task.find(queryConditions).sort({ createdAt: -1 }); 

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById=async(req,res,next)=>{
    try{
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
        task.title=title||task.title;
        task.description=description!==undefined?description:task.description;
        task.dueDate=dueDate||task.dueDate;
        task.status=status||task.status;

        const updatedTask=await task.save();
        res.json(updatedTask);
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

module.exports={
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
};