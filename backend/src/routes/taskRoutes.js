const express=require('express');
const router=express.Router();

const{
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
}=require('../controllers/taskController');

const {validateTask}=require('../middleware/validationMiddleware');
router.post('/',validateTask,createTask);
router.get('/',getTasks);
router.get('/:id',getTaskById);
router.put('/:id',validateTask,updateTask);
router.delete('/:id',deleteTask);
module.exports=router;