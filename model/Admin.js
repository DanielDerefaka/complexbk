const mongoose = require("mongoose");
// const { isEmail } = require("validator");
// const  bcrypt  = require('bcrypt');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your name "],
  },
  username: {
    type: String,
    required: [true, "Please Enter your username "],
  },
  email: {
    type: String,
    required: [true, "Please Enter your email "],
    unique: true,
    lowercase: true,
   
  },
  password: {
    type: String,
    required: [true, "Please Enter your password "],
    minlength: [6, "Minimum Length is 6  "],
  },
});

// Function before doc saves to Db
// userSchema.pre('save', async function(next) {
//     const salt = await bcrypt.genSalt();
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// // Function After doc saves to Db
// userSchema.post('save', function (doc, next) {
//     console.log('new user was created', doc);
//     next();

// })



const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
