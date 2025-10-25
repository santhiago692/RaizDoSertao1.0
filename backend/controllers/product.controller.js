const Product = require('../models/product.model');
const Store = require('../models/store.model');
const Order = require('../models/order.model');
const mongoose = require('mongoose');

// --- Buscar TODOS os produtos para a vitrine ---
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      
      // --- CORREÇÃO DE SEGURANÇA ---
      // Verifica se storeId é um ObjectId válido antes de buscar
      let storeName = 'Loja não encontrada';
      let producerId = null;

      if (product.storeId && mongoose.Types.ObjectId.isValid(product.storeId)) {
        const store = await Store.findById(product.storeId);
        if (store) {
          storeName = store.name;
          producerId = store.ownerId;
        }
      }
      // --- FIM DA CORREÇÃO ---

      return {
        ...product.toObject(),
        storeName: storeName,
        producerId: producerId
      };
    }));
    res.status(200).json(enrichedProducts.reverse());
  } catch (error) {
    console.error("!!! ERRO na rota getAllProducts:", error);
    res.status(500).json({ message: "Erro ao buscar todos os produtos.", error: error.message });
  }
};

// --- Buscar UM produto pelo seu ID ---
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) { return res.status(404).json({ message: "Produto não encontrado." }); }

    const store = await Store.findById(product.storeId);
    const enrichedProduct = {
      ...product.toObject(),
      storeName: store ? store.name : 'Loja não encontrada',
      producerId: store ? store.ownerId : null // ADICIONADO
    };
    res.status(200).json(enrichedProduct);
  } catch (error) { res.status(500).json({ message: "Erro ao buscar o produto.", error: error.message }); }
};

// --- Criar um novo produto ---
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl, storeId } = req.body;
    const newProduct = new Product({ name, description, price, stock, category, imageUrl, storeId });
    const savedProduct = await newProduct.save();
    res.status(201).json({ message: "Produto criado com sucesso!", product: savedProduct });
  } catch (error) { res.status(500).json({ message: "Erro ao criar produto.", error: error.message }); }
};

// --- Buscar todos os produtos de uma loja específica (pelo storeId) ---
exports.getProductsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const products = await Product.find({ storeId: storeId });
    res.status(200).json(products);
  } catch (error) { res.status(500).json({ message: "Erro ao buscar produtos da loja.", error: error.message }); }
};

// --- NOVA FUNÇÃO ---
// --- Buscar todos os produtos de um produtor específico pelo producerId ---
exports.getProductsByProducer = async (req, res) => {
  try {
    const { producerId } = req.params;
    // 1. Encontrar a loja do produtor para obter o storeId
    const store = await Store.findOne({ ownerId: producerId });
    if (!store) { return res.status(404).json({ message: "Loja do produtor não encontrada." }); }
    
    // 2. Buscar os produtos usando o storeId encontrado
    const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });

    // 3. Adicionar o nome da loja aos produtos
     const enrichedProducts = products.map(product => ({
        ...product.toObject(),
        storeName: store.name,
        producerId: producerId // Adiciona o producerId para consistência
    }));

    res.status(200).json(enrichedProducts);
  } catch (error) {
     if (error.kind === 'ObjectId') { return res.status(404).json({ message: "ID de produtor inválido." }); }
    res.status(500).json({ message: "Erro ao buscar produtos do produtor.", error: error.message });
  }
};


// --- Atualizar um produto ---
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) { return res.status(404).json({ message: "Produto não encontrado." }); }
    res.status(200).json({ message: "Produto atualizado com sucesso!", product: updatedProduct });
  } catch (error) { res.status(500).json({ message: "Erro ao atualizar produto.", error: error.message }); }
};

// --- Deletar um produto ---
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) { return res.status(404).json({ message: "Produto não encontrado." }); }
    res.status(200).json({ message: "Produto deletado com sucesso!" });
  } catch (error) { res.status(500).json({ message: "Erro ao deletar produto.", error: error.message }); }
};

// --- NOVA FUNÇÃO ---
// --- Buscar Produtos Mais Avaliados (Top 4) ---
exports.getTopRatedProducts = async (req, res) => {
  try {
    // 1. Agregação para contar feedbacks e ordenar
    const products = await Product.aggregate([
      // Adiciona um campo 'feedbackCount' com o tamanho do array 'feedbacks'
      // A LINHA CORRIGIDA:
     { $addFields: { feedbackCount: { $size: { $ifNull: [ "$feedbacks", [] ] } } } },
      // Ordena por contagem de feedback (maior primeiro)
      { $sort: { feedbackCount: -1 } },
      // Limita aos top 4
      { $limit: 4 }
    ]);

    // 2. Enriquecer os produtos com o nome da loja (igual ao getAllProducts)
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      
      // Adicionamos a mesma verificação de segurança do getAllProducts
      let storeName = 'Loja não encontrada';
      let producerId = null;

      if (product.storeId && mongoose.Types.ObjectId.isValid(product.storeId)) {
        const store = await Store.findById(product.storeId);
        if (store) {
          storeName = store.name;
          producerId = store.ownerId;
        }
      }

      return {
        ...product, // 'product' já é um objeto, não precisa de .toObject()
        storeName: storeName,
        producerId: producerId
      };
    }));

    res.status(200).json(enrichedProducts);

  } catch (error) {
    console.error("!!! ERRO na rota getTopRatedProducts:", error);
    res.status(500).json({ message: "Erro ao buscar produtos mais avaliados.", error: error.message });
  }
};

// --- NOVA FUNÇÃO ---
// --- Buscar Produtos Mais Vendidos (Top 4) ---
exports.getBestSellingProducts = async (req, res) => {
  try {
    // 1. Agregar Pedidos para encontrar os IDs dos produtos mais vendidos
    const bestSellingStats = await Order.aggregate([
      // Filtrar apenas pedidos que não foram cancelados ou estão pendentes
      { $match: { status: { $nin: ["Cancelado", "Aguardando confirmação do produtor"] } } },
      
      // Agrupar por ID do produto e somar as quantidades
      { $group: { _id: "$productId", totalSold: { $sum: "$quantity" } } },
      
      // Ordenar do mais vendido para o menos vendido
      { $sort: { totalSold: -1 } },
      
      // Limitar aos top 4
      { $limit: 4 }
    ]);

    // 2. Obter a lista de IDs na ordem correta
    const productIds = bestSellingStats.map(item => item._id);

    // 3. Buscar e "enriquecer" os detalhes desses produtos
    // (Usamos Promise.all para manter a ordem dos mais vendidos)
    const bestSellingProducts = await Promise.all(
      productIds.map(async (productId) => {
        const product = await Product.findById(productId);
        if (!product) return null; // Caso o produto tenha sido deletado

        // Lógica de "enriquecimento" (igual à que usamos em getAllProducts)
        let storeName = 'Loja não encontrada';
        let producerId = null;
        if (product.storeId && mongoose.Types.ObjectId.isValid(product.storeId)) {
          const store = await Store.findById(product.storeId);
          if (store) {
            storeName = store.name;
            producerId = store.ownerId;
          }
        }

        return {
          ...product.toObject(),
          storeName: storeName,
          producerId: producerId
        };
      })
    );

    // 4. Filtrar qualquer produto que possa ser nulo (deletado)
    const filteredProducts = bestSellingProducts.filter(p => p !== null);

    res.status(200).json(filteredProducts);

  } catch (error) {
    console.error("!!! ERRO na rota getBestSellingProducts:", error);
    res.status(500).json({ message: "Erro ao buscar produtos mais vendidos.", error: error.message });
  }
};