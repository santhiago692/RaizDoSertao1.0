const Feedback = require('../models/feedback.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

// --- Criar um novo feedback ---
exports.createFeedback = async (req, res) => {
  try {
    const { productId, consumerId, rating, comment } = req.body;

    // 1. Validar se os IDs existem (opcional, mas recomendado)
    const product = await Product.findById(productId);
    const consumer = await User.findById(consumerId);
    if (!product || !consumer) {
      return res.status(404).json({ message: "Produto ou consumidor não encontrado." });
    }

    // 2. Criar a instância do feedback
    const newFeedback = new Feedback({
      productId,
      consumerId,
      consumerName: consumer.name, // Pegamos o nome do usuário para exibir
      rating,
      comment,
    });

    // 3. Salvar o feedback no banco
    const savedFeedback = await newFeedback.save();

    // 4. Associar o ID do feedback ao produto correspondente
    // Adicionamos o ID do novo feedback à lista 'feedbacks' do produto
    await Product.findByIdAndUpdate(productId, { $push: { feedbacks: savedFeedback._id } });

    res.status(201).json({ message: "Feedback enviado com sucesso!", feedback: savedFeedback });

  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar feedback.", error: error.message });
  }
};

// --- Buscar todos os feedbacks de um produto ---
exports.getFeedbacksByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        // Busca os feedbacks associados ao productId, ordenados pelos mais recentes
        const feedbacks = await Feedback.find({ productId: productId }).sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar feedbacks.", error: error.message });
    }
};