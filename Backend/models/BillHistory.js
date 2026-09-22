import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemCode: { type: String, required: true },
    description: { type: String, required: true },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
});

const billSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    dateTime: { type: Date, required: true },
    customer: {
        name: { type: String, required: true },
        contact: { type: String },
        tier: { type: String, enum: ['STANDARD', 'SILVER', 'GOLD'], default: 'STANDARD' }
    },
    cashier: { type: String, required: true },
    outlet: { type: String, required: true },
    registerNo: { type: String, required: true },
    items: [itemSchema],
    paymentMethod: { type: String, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Refunded', 'Exchanged', 'Completed'], default: 'Completed' }
}, { timestamps: true, collection: 'bills' });

export default mongoose.model('BillHistory', billSchema);