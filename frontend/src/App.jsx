import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { CartProvider } from './contexts/CartContext'; // 1. IMPORTAMOS O CART PROVIDER
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductPage from './pages/ProductPage';
import ProducerPanel from './pages/ProducerPanel';
import ProtectedRoute from './components/ProtectedRoute';
import MyOrders from './pages/MyOrders';
import OrderDetailPage from './pages/OrderDetailPage';
import ProducerProfilePage from './pages/ProducerProfilePage';
import ConsumerPanel from './pages/ConsumerPanel';

import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        {/* 2. ENVOLVEMOS O APP COM O CART PROVIDER */}
        <CartProvider>
          <Router>
            <Header />
            <main className="main-content">
              <Routes>
                {/* --- ROTAS PÚBLICAS --- */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/produtor/:producerId" element={<ProducerProfilePage />} />

                {/* --- ROTAS PROTEGIDAS PARA CONSUMIDORES --- */}
                <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
                  <Route path="/meu-painel" element={<ConsumerPanel />} />
                  <Route path="/meus-pedidos" element={<MyOrders />} />
                </Route>

                {/* --- ROTAS PROTEGIDAS PARA PRODUTORES --- */}
                <Route element={<ProtectedRoute allowedRoles={['producer']} />}>
                  <Route path="/panel" element={<ProducerPanel />} />
                </Route>

                {/* --- ROTAS PROTEGIDAS COMPARTILHADAS (Produtor e Consumidor) --- */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/pedidos/:orderId" element={<OrderDetailPage />} /> 
                </Route>
                
              </Routes>
            </main>
          </Router>
        </CartProvider>
      </SearchProvider>
    </AuthProvider>
  );
}
export default App;