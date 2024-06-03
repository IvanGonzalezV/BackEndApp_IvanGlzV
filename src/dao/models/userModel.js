import mongoose from "mongoose";

const usersCollection = "users"

const userSchema = mongoose.Schema({

    first_name:{
        type: String,
        require: true,
        minlength: 3
    },
    last_name:{
        type: String,
        require: true,
        minlength: 3
    },
    email:{
        type: String,
        require: true,
        minlength: 3,
        unique: true
    },
    age:{
        type: Number,
        require: true,
        minlength: 2
    },
    password:{
        type: String,
        require: true,
        minlength: 3
    },
    isAdmin:{
        type: Boolean,
        require: true,
        default: false
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    }

})

const userModel = mongoose.model('users', userSchema)

export default userModel