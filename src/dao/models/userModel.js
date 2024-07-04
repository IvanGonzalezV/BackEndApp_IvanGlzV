import mongoose from "mongoose";

const usersCollection = "users"

const userSchema = mongoose.Schema({
  first_name: {
    type: String,
    require: true,
    minlength: 3,
  },
  last_name: {
    type: String,
    require: true,
    minlength: 3,
  },
  email: {
    type: String,
    require: true,
    minlength: 3,
    unique: true,
  },
  age: {
    type: Number,
    require: true,
    min: 16,
  },
  password: {
    type: String,
    require: true,
    minlength: 3,
  },
  isAdmin: {
    type: Boolean,
    require: true,
    default: false,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },

  role: {
    type: String,
    required: true,
    enum: ["user", "premium"], // este asegurara que solo estos 2 roles se puedan asignar
    default: "user",
  }

});

const userModel = mongoose.model('users', userSchema)

export default userModel