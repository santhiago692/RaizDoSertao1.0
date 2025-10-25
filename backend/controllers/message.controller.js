const Message = require('../models/message.model');
const Order = require('../models/order.model');

// --- Enviar uma nova mensagem ---
exports.sendMessage = async (req, res) => {
  try {
    const { orderId, senderId, receiverId, content } = req.body;

    // Opcional: Validações
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    // Adicionar mais validações (ex: verificar se senderId/receiverId são os corretos para a ordem)

    const newMessage = new Message({
      orderId,
      senderId,
      receiverId,
      content,
      isSystemMessage: false 
    });

    const savedMessage = await newMessage.save();
    res.status(201).json({ message: "Mensagem enviada com sucesso!", msg: savedMessage });

  } catch (error) {
    res.status(500).json({ message: "Erro ao enviar mensagem.", error: error.message });
  }
};

// --- Buscar todas as mensagens de um pedido ---
exports.getMessagesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const messages = await Message.find({ orderId: orderId }).sort({ createdAt: 'asc' });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar mensagens.", error: error.message });
  }
};