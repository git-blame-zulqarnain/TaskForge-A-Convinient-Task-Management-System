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
                dueDate
            });
            const createdTask=await task.save();
            res.status(201).json(createdTask);
    }
    catch(error)
    {
        next(error);
    }
};

const getTasks=async(req,res,next)=>{
    try{
        const tasks=await Task.find({});
        res.json(tasks);
    }
    catch(error)
    {
        next(error);
    }
};
const getTaskById=async(req,res,next)=>{
    try{
        const task=await Task.findById(req.params.id);
        if(task)
        {
            res.json(task);
        }
        else
        {
            res.status(404);
            throw new Error('Task not found');
        }
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
        if(task)
        {
            task.title=title||task.title;
            task.description=description!==undefined?description:task.description;
            task.dueDate=dueDate||task.dueDate;
            task.status=status||task.status;

            const updatedTask=await task.save();
            res.json(updatedTask);
        }
        else
        {
            res.status(404);
            throw new Error('Task not found');
        }
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

        if(task)
        {
            await task.deleteOne();
            res.json({message: 'Task removed'});
        }
        else
        {
            res.status(404);
            throw new Error('Task not found');
        }
    }
    catch(error)
    {
        next(error);
    }
};

module.exports={
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};