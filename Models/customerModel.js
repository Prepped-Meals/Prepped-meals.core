import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const customerSchema = new mongoose.Schema({
    cus_id: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    f_name: {
        type: String,
        required: true,
    },
    l_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    contact_no: {
        type: String,
        required: true,
    },
    profile_pic: {
        type: String,
        default: "uploads/user.png", 
    },
    
    createdAt: {
        type: Date,
        default: Date.now, 
    }
});

customerSchema.pre('save', function (next) {
    if (!this.cus_id) {
        this.cus_id = uuidv4();
    }
    next();
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
