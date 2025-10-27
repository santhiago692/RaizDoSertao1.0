import { initialUsers, initialStores, initialProducts, initialOrders } from '../mock/mockData';

// Funções de setup do localStorage (sem alterações)
const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(initialUsers));
  if (!localStorage.getItem('stores')) localStorage.setItem('stores', JSON.stringify(initialStores));
  if (!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(initialProducts));
  if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify(initialOrders));
};
initializeLocalStorage();
const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Função auxiliar para simular a latência da rede
const simulateNetwork = (data, success = true) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject({ message: 'Erro simulado de rede.' });
      }
    }, 500); // Simula um atraso de 500ms
  });
};

export const api = {
  // Funções de usuário agora são assíncronas
  registerUser: async (userData) => {
    const users = getData('users');
    if (users.some(u => u.email === userData.email)) throw new Error("E-mail já cadastrado.");
    const newUser = { ...userData, id: `user-${Date.now()}` };
    if (newUser.type === 'producer') { /* ...lógica da loja... */ }
    users.push(newUser);
    setData('users', users);
    return simulateNetwork(newUser);
  },

  login: async (email, password) => {
    const user = getData('users').find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Credenciais inválidas.");
    return simulateNetwork(user);
  },

  // Funções de produtos agora são assíncronas
  getAllProducts: async () => {
    const products = getData('products');
    const stores = getData('stores');
    const enrichedProducts = products.map(product => ({
      ...product,
      storeName: stores.find(s => s.id === product.storeId)?.name || 'Loja desconhecida'
    }));
    return simulateNetwork(enrichedProducts);
  },

  getProductById: async (productId) => {
    const product = getData('products').find(p => p.id === productId);
    if (product) {
      const store = getData('stores').find(s => s.id === product.storeId);
      return simulateNetwork({ ...product, storeName: store?.name });
    }
    return simulateNetwork(null);
  },

  getProductsByStoreId: async (storeId) => {
    const products = getData('products').filter(p => p.storeId === storeId);
    return simulateNetwork(products);
  },

  // Funções de loja e pedidos também se tornam assíncronas
  getStoreByOwnerId: async (ownerId) => {
    const store = getData('stores').find(s => s.ownerId === ownerId);
    return simulateNetwork(store);
  },

  getOrdersByProducerId: async (producerId) => {
    const orders = getData('orders').filter(o => o.producerId === producerId).reverse();
    return simulateNetwork(orders);
  },

  // Funções que modificam dados também simulam a espera
  addProduct: async (productData) => {
    const products = getData('products');
    const newProduct = { ...productData, id: `prod-${Date.now()}` };
    products.push(newProduct);
    setData('products', products);
    return simulateNetwork(newProduct);
  },

  updateProduct: async (productData) => {
    const products = getData('products').map(p => p.id === productData.id ? { ...p, ...productData } : p);
    setData('products', products);
    return simulateNetwork(productData);
  },

  deleteProduct: async (productId) => {
    const products = getData('products').filter(p => p.id !== productId);
    setData('products', products);
    return simulateNetwork({ success: true });
  },
};