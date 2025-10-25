const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.post('/', orderController.createOrder);
router.get('/my-orders/:consumerId', orderController.getOrdersByConsumer);
router.get('/received/:producerId', orderController.getOrdersByProducer);
router.put('/:orderId/accept', orderController.acceptOrder);
router.put('/:orderId/refuse', orderController.refuseOrder);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId/finalize', orderController.finalizeOrder);
router.put('/:orderId/cancel', orderController.cancelOrder);

// --- NOVA ROTA ---
// Rota para o consumidor CONFIRMAR o recebimento
// PUT /api/orders/:orderId/confirm-delivery
router.put('/:orderId/confirm-delivery', orderController.confirmDelivery);

module.exports = router;