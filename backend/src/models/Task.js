const mongoose =require('mongoose');

const taskSchema=new mongoose.Schema({
    title:{
        type: String,required:[true,"Add title"],
        trim: true,

    },

    description:{ type: String,
        required:false, //optional
        trim:true,
    },
    status:{
        type:String,
        enum:['Pending','Working','Finished'],
        default: 'Pending',
    },
    dueDate:{
        type: Date,
        required: false,
    },
},
{
    timestamps: true,
});

module.exports=mongoose.model('Task',taskSchema)