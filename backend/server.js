const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Importação das rotas
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const messageRoutes = require('./routes/message.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- CORREÇÃO AQUI: Define a variável 'uri' buscando do arquivo .env ---
const uri = process.env.MONGO_URI; 
// --- FIM DA CORREÇÃO ---

// Conexão com o Banco de Dados
mongoose.connect(uri, { 
    serverSelectionTimeoutMS: 5000, // Tempo de espera reduzido
})
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Usar as rotas
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedbacks', feedbackRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});