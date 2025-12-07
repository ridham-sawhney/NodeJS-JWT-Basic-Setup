const Shipment = require('../models/Shipment');

const getAllShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find();
        if (!shipments || shipments.length === 0) {
            return res.status(200).json({
                responseCode: "NO_SHIPMENTS_FOUND",
                message: "No shipments available",
                data: []
            });
        }

        res.status(200).json({
            responseCode: "SHIPMENTS_FETCHED_SUCCESSFULLY",
            data: shipments,
            count: shipments.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode: "SERVER_ERROR", message: 'Server error' });
    }
};

const createShipment = async (req, res) => {
    const { origin, destination, status } = req.body;
    if (!origin || !destination || !status) {
        return res.status(400).json({ responseCode: "ALL_FIELDS_REQUIRED", message: 'All fields are required' });
    }
    try {
        const newShipment = new Shipment({ origin, destination, status });
        const savedShipment = await newShipment.save();
        res.status(201).json({ responseCode: "SHIPMENT_CREATED_SUCCESSFULLY", message: 'Shipment created successfully', data: savedShipment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};

const deleteShipments = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ responseCode: "IDS_REQUIRED", message: 'Array of shipment IDs is required' });
    }   
    try {
        const result = await Shipment.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ responseCode: "SHIPMENTS_DELETED_SUCCESSFULLY", message: `${result.deletedCount} shipments deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};


const getShipmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const shipment = await Shipment.findById(id);
        if (!shipment) {
            return res.status(404).json({ responseCode: "SHIPMENT_NOT_FOUND", message: 'Shipment not found' });
        }
        res.status(200).json({responseCode:"SHIPMENT_FETCHED_SUCCESSFULLY", data: shipment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};

const updateShipmentById = async (req, res) => {
    const { id } = req.params;
    const { origin, destination, status } = req.body;

    //atleast one field to update
    if (!origin && !destination && !status) {
        return res.status(400).json({ responseCode: "ATLEAST_ONE_FIELD_REQUIRED", message: 'At least one field (origin, destination, status) is required to update' });
    }

    try {
        //only update provided fields
        const updatedShipment = await Shipment.findByIdAndUpdate(
            id,
            { $set: { ...(origin && { origin }), ...(destination && { destination }), ...(status && { status }) } },
            { new: true }
        );
        if (!updatedShipment) {
            return res.status(404).json({ responseCode: "SHIPMENT_NOT_FOUND", message: 'Shipment not found' });
        }   
        res.status(200).json({ responseCode: "SHIPMENT_UPDATED_SUCCESSFULLY", message: 'Shipment updated successfully', data: updatedShipment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};

const deleteShipmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedShipment = await Shipment.findByIdAndDelete(id);
        if (!deletedShipment) {
            return res.status(404).json({ responseCode: "SHIPMENT_NOT_FOUND", message: 'Shipment not found' });
        }   
        res.status(200).json({ responseCode: "SHIPMENT_DELETED_SUCCESSFULLY", message: 'Shipment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};



module.exports = {
    getAllShipments,
    createShipment,
    deleteShipments,
    getShipmentById,
    updateShipmentById,
    deleteShipmentById
};



