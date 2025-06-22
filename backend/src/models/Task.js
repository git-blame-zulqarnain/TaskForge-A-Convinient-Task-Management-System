const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Working', 'Finished'], 
    default: 'Pending',
  },
  dueDate: {
    type: Date,
    required: false,
  },
  sharedWith:[{
    type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);