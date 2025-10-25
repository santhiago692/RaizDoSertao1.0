const User = require('../models/user.model');
const Store = require('../models/store.model');
const validator = require('validator');

// --- Registrar Usuário ---
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, type, phone, city, address, storeName } = req.body;
    if (!phone || !validator.isMobilePhone(phone, 'pt-BR')) { return res.status(400).json({ message: 'Por favor, insira um número de telefone brasileiro válido (com DDD).' }); }
    const existingUser = await User.findOne({ email });
    if (existingUser) { return res.status(400).json({ message: 'Este e-mail já está cadastrado.' }); }
    const cleanedPhone = phone.replace(/\D/g, '');
    const newUser = new User({ name, email, password, type, phone: cleanedPhone, city, address });
    if (type === 'producer') {
      if (!storeName) { return res.status(400).json({ message: 'O nome da loja é obrigatório para produtores.' }); }
      const existingStore = await Store.findOne({ name: storeName });
      if (existingStore) { return res.status(400).json({ message: 'Este nome de loja já está em uso.' }); }
      const savedUserTentative = await newUser.save();
      const newStore = new Store({ name: storeName, ownerId: savedUserTentative._id });
      const savedStore = await newStore.save();
      savedUserTentative.storeId = savedStore._id;
      const savedUser = await savedUserTentative.save();
      const userResponse = savedUser.toObject(); delete userResponse.password;
      return res.status(201).json({ message: 'Usuário produtor cadastrado com sucesso!', user: userResponse });
    } else {
      const savedUser = await newUser.save();
      const userResponse = savedUser.toObject(); delete userResponse.password;
      res.status(201).json({ message: 'Usuário consumidor cadastrado com sucesso!', user: userResponse });
    }
  } catch (error) { res.status(500).json({ message: 'Erro no servidor ao tentar cadastrar usuário.', error: error.message }); }
};

// --- Login de Usuário ---
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) { return res.status(400).json({ message: "E-mail ou senha inválidos." }); }
    const isMatch = password === user.password;
    if (!isMatch) { return res.status(400).json({ message: "E-mail ou senha inválidos." }); }
    const userPayload = {
      id: user._id, name: user.name, email: user.email, type: user.type,
      phone: user.phone, address: user.address, city: user.city,
      avatarUrl: user.avatarUrl
    };
    if (user.type === 'producer') { userPayload.storeId = user.storeId; }
    res.status(200).json({ message: "Login bem-sucedido!", user: userPayload });
  } catch (error) { res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.', error: error.message }); }
};

// --- Buscar Info Pública Produtor (CORRIGIDO PARA INCLUIR AVATAR) ---
exports.getPublicProducerInfo = async (req, res) => {
  try {
    const { producerId } = req.params;
    // Seleciona também avatarUrl
    const producer = await User.findById(producerId).select('name type city storeId avatarUrl'); // AQUI ESTÁ A CHAVE!
    if (!producer || producer.type !== 'producer') { return res.status(404).json({ message: "Produtor não encontrado." }); }
    const store = await Store.findById(producer.storeId);
    const publicInfo = {
      _id: producer._id, name: producer.name, city: producer.city || 'Não informado',
      storeName: store ? store.name : 'Loja sem nome',
      avatarUrl: producer.avatarUrl // GARANTE QUE A URL SEJA ENVIADA
    };
    res.status(200).json(publicInfo);
  } catch (error) {
    if (error.kind === 'ObjectId') { return res.status(404).json({ message: "ID de produtor inválido." }); }
    res.status(500).json({ message: "Erro ao buscar informações do produtor.", error: error.message });
  }
};
// --- Atualizar a URL do Avatar (CORRIGIDO PARA RETORNAR USUÁRIO) ---
exports.updateAvatarUrl = async (req, res) => {
    try {
        const { userId } = req.params;
        const { avatarUrl } = req.body;

        if (!avatarUrl || typeof avatarUrl !== 'string' /*|| avatarUrl.length < 10*/) { // Validação relaxada da URL
             // Permite salvar URL vazia para voltar ao padrão DiceBear
             // return res.status(400).json({ message: "URL do avatar inválida." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatarUrl: avatarUrl.trim() }, // Salva a URL (ou string vazia)
            { new: true } // Retorna o usuário atualizado
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Monta o payload de resposta igual ao do login, sem a senha
        const userPayload = {
            id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, type: updatedUser.type,
            phone: updatedUser.phone, address: updatedUser.address, city: updatedUser.city,
            avatarUrl: updatedUser.avatarUrl
        };
        if (updatedUser.type === 'producer') { userPayload.storeId = updatedUser.storeId; }

        res.status(200).json({ message: "Avatar atualizado com sucesso!", user: userPayload }); // Retorna o usuário atualizado

    } catch (error) {
         if (error.kind === 'ObjectId') { return res.status(404).json({ message: "ID de usuário inválido." }); }
        res.status(500).json({ message: "Erro ao atualizar avatar.", error: error.message });
    }
};

// --- NOVA FUNÇÃO: ALTERAR SENHA ---
exports.updatePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        // 1. Encontra o usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // 2. Valida a senha atual
        // TODO: Em produção, usaríamos 'bcrypt.compare'
        if (currentPassword !== user.password) {
            return res.status(400).json({ message: "Senha atual incorreta." });
        }
        
        // 3. Validações de nova senha
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "A nova senha deve ter no mínimo 8 caracteres." });
        }

        // 4. Atualiza a senha no banco de dados
        // TODO: Em produção, salvaríamos o HASH da nova senha.
        user.password = newPassword; 
        await user.save();

        res.status(200).json({ message: "Senha alterada com sucesso!" });

    } catch (error) {
        res.status(500).json({ message: "Erro ao tentar alterar a senha.", error: error.message });
    }
};