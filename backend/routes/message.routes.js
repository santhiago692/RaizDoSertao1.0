const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// Rota para ENVIAR uma nova mensagem
// POST /api/messages/
router.post('/', messageController.sendMessage);

// Rota para BUSCAR todas as mensagens de um pedido
// GET /api/messages/:orderId
router.get('/:orderId', messageController.getMessagesByOrder);

module.exports = router;