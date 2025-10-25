const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/producer/:producerId', userController.getPublicProducerInfo);
router.put('/:userId/avatar', userController.updateAvatarUrl);
router.put('/:userId/password', userController.updatePassword);

module.exports = router;