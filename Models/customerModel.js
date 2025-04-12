import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const customerSchema = new mongoose.Schema({
    cus_id: { type: String,unique: true },
    username: { type: String, required: true, unique: true },
    f_name: { type: String, required: true },
    l_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact_no: { type: String, required: true },
});

const generateCusId = () => {
    return uuidv4(); // Generate a unique ID using uuid
};

// Middleware to auto-generate cus_id before saving
customerSchema.pre('save', function (next) {
    if (!this.cus_id) {
        this.cus_id = generateCusId(); // Call the function to generate cus_id
    }
    next(); 
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;