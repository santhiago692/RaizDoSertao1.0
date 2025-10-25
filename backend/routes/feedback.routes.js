const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Rota para CRIAR um novo feedback
// POST /api/feedbacks/
router.post('/', feedbackController.createFeedback);

// Rota para BUSCAR todos os feedbacks de um produto
// GET /api/feedbacks/product/:productId
router.get('/product/:productId', feedbackController.getFeedbacksByProduct);

module.exports = router;