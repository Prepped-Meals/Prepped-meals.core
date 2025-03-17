import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    cus_id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    f_name: { type: String, required: true },
    l_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact_no: { type: String, required: true },
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;