const mongoose =require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Username"],
        trim: true,
    },
    email:{
        type: String,
        required:[true,"email@xyz.com"],
        unique:true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,'Please add a valid email',],
        trim: true,
        lowercase:true,
    },
    password:{
        type: String,
        required:[true,"Password"],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false, // Exclude password from queries by default
    },
},
{
    timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt); 
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
