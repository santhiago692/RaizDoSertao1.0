const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Rota para BUSCAR TODOS os produtos
router.get('/', productController.getAllProducts);

// Rota para BUSCAR produtos mais avaliados
router.get('/top-rated', productController.getTopRatedProducts);

// Rota para BUSCAR produtos mais vendidos
router.get('/best-selling', productController.getBestSellingProducts);

// Rota para BUSCAR UM produto pelo seu ID
router.get('/:id', productController.getProductById);

// Rota para CRIAR um novo produto
router.post('/', productController.createProduct);

// Rota para BUSCAR todos os produtos de uma loja pelo storeId
router.get('/store/:storeId', productController.getProductsByStore);

// Rota para ATUALIZAR um produto pelo seu ID
router.put('/:id', productController.updateProduct);

// Rota para DELETAR um produto pelo seu ID
router.delete('/:id', productController.deleteProduct);

// Rota para buscar produtos de um produtor específico pelo producerId
router.get('/producer/:producerId', productController.getProductsByProducer);

module.exports = router;