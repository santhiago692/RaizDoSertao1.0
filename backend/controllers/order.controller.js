const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Store = require('../models/store.model');
const Message = require('../models/message.model');

// --- Criar Pedido ---
exports.createOrder = async (req, res) => {
  try {
    const { consumerId, productId, quantity, deliveryMethod } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produto não encontrado." });
    const consumer = await User.findById(consumerId);
    if (!consumer) return res.status(404).json({ message: "Consumidor não encontrado." });
    const store = await Store.findById(product.storeId);
    if (!store) return res.status(404).json({ message: "Loja do produtor não encontrada." });
    const producerId = store.ownerId;
    const totalPrice = product.price * quantity;

    const newOrder = new Order({
      consumerId, producerId, productId,
      productDetails: { name: product.name, unitPrice: product.price, imageUrl: product.imageUrl },
      quantity, totalPrice, deliveryMethod,
    });
    const savedOrder = await newOrder.save();

    const systemMessageContent = `
      **Novo Pedido Recebido!**\n-----------------------------\n**Cliente:** ${consumer.name}\n**Contato:** ${consumer.phone}\n**Endereço:** ${consumer.address}, ${consumer.city}\n-----------------------------\n**Produto:** ${product.name}\n**Quantidade:** ${quantity}\n**Valor Unitário:** R$ ${product.price.toFixed(2)}\n**Valor Total:** R$ ${totalPrice.toFixed(2)}\n-----------------------------\n**Método de Entrega:** ${deliveryMethod}\n-----------------------------\n*Aguarde a confirmação do produtor.*`;
    const systemMessage = new Message({
      orderId: savedOrder._id, senderId: consumerId, receiverId: producerId,
      content: systemMessageContent, isSystemMessage: true,
    });
    await systemMessage.save();

    res.status(201).json({ message: "Pedido criado com sucesso!", order: savedOrder });
  } catch (error) { res.status(500).json({ message: "Erro ao criar pedido.", error: error.message }); }
};

// --- Buscar Pedidos do Consumidor ---
exports.getOrdersByConsumer = async (req, res) => {
  try {
    const { consumerId } = req.params;
    const orders = await Order.find({ consumerId: consumerId }).sort({ createdAt: -1 }).populate('productId'); 
    res.status(200).json(orders); 
  } catch (error) { res.status(500).json({ message: "Erro ao buscar pedidos.", error: error.message }); }
};

// --- Buscar Pedidos do Produtor ---
exports.getOrdersByProducer = async (req, res) => {
  try {
    const { producerId } = req.params;
    const orders = await Order.find({ producerId: producerId }).sort({ createdAt: -1 }).populate('productId').populate('consumerId', 'name');                             
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: "Erro ao buscar pedidos recebidos.", error: error.message }); }
};

// --- Buscar Pedido por ID ---
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('productId').populate('consumerId', 'name email').populate('producerId', 'name email');                            
    if (!order) return res.status(404).json({ message: "Pedido não encontrado." });
    res.status(200).json(order);
  } catch (error) { res.status(500).json({ message: "Erro ao buscar detalhes do pedido.", error: error.message }); }
};

// --- Aceitar Pedido ---
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "Aceito pelo produtor" }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Pedido não encontrado." });
    res.status(200).json({ message: "Pedido aceito!", order: updatedOrder });
  } catch (error) { res.status(500).json({ message: "Erro ao aceitar pedido.", error: error.message }); }
};

// --- Recusar Pedido ---
exports.refuseOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "Cancelado" }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Pedido não encontrado." });
    res.status(200).json({ message: "Pedido recusado!", order: updatedOrder });
  } catch (error) { res.status(500).json({ message: "Erro ao recusar pedido.", error: error.message }); }
};

// --- Finalizar Pedido ---
exports.finalizeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "Finalizado" }, { new: true } );
    if (!updatedOrder) return res.status(404).json({ message: "Pedido não encontrado." });
    res.status(200).json({ message: "Pedido finalizado!", order: updatedOrder });
  } catch (error) { res.status(500).json({ message: "Erro ao finalizar pedido.", error: error.message }); }
};

// --- Cancelar Pedido ---
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "Cancelado" }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Pedido não encontrado." });
    res.status(200).json({ message: "Pedido cancelado!", order: updatedOrder });
  } catch (error) { res.status(500).json({ message: "Erro ao cancelar pedido.", error: error.message }); }
};

// --- NOVA FUNÇÃO ---
// --- Consumidor confirma o recebimento ---
exports.confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "Entregue" }, { new: true } );
    if (!updatedOrder) return res.status(404).json({ message: "Pedido não encontrado." });
    res.status(200).json({ message: "Recebimento confirmado!", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Erro ao confirmar recebimento.", error: error.message });
  }
};