const mongoose = require('mongoose');

const Schema = mongoose.Schema;
 

const ShipmentSchema = new Schema({
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }}, { timestamps: true });

module.exports = mongoose.model('Shipment', ShipmentSchema, "Shipments");