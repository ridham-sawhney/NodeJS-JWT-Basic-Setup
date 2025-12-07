const express = require('express');
const router = express.Router();
const shipmentsController = require('../../controllers/shipmentsController');
const verifyRoles = require('../../middlewares/verifyRoles');
const { Roles } = require('../../constants/Roles');



router.route('/')
    .get(verifyRoles(Roles.ADMIN, Roles.USER), shipmentsController.getAllShipments)
    .post(verifyRoles(Roles.ADMIN), shipmentsController.createShipment)
    .delete(verifyRoles(Roles.ADMIN), shipmentsController.deleteShipments);

router.route('/:id')
    .get(verifyRoles(Roles.ADMIN, Roles.USER), shipmentsController.getShipmentById)
    .put(verifyRoles(Roles.ADMIN), shipmentsController.updateShipmentById)
    .delete(verifyRoles(Roles.ADMIN), shipmentsController.deleteShipmentById);

module.exports = router; 