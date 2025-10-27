import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { FiArchive, FiShoppingBag, FiEdit, FiEdit3, FiExternalLink } from 'react-icons/fi';

const PRODUCTS_API_URL = 'http://localhost:5000/api/products';
const ORDERS_API_URL = 'http://localhost:5000/api/orders';
const USERS_API_URL = 'http://localhost:5000/api/users';

// --- Subcomponente ProductManagementView ---
const ProductManagementView = ({ storeId, onBack, onEdit, onAdd }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try { setLoading(true); const response = await axios.get(`${PRODUCTS_API_URL}/store/${storeId}`); setProducts(response.data); setError(null); }
    catch (err) { setError("Falha ao carregar produtos."); console.error("Erro fetchProducts:", err);}
    finally { setLoading(false); }
  }, [storeId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try { await axios.delete(`${PRODUCTS_API_URL}/${productId}`); fetchProducts(); }
      catch (err) { alert("Erro ao deletar o produto."); console.error("Erro handleDelete:", err);}
    }
  };

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section className="card">
      <div className="section-header">
        <button onClick={onBack} className="back-button">← Voltar ao Painel</button>
        <button onClick={onAdd} className="btn btn-primary">Adicionar Produto</button>
      </div>
      <h3 style={{ marginTop: 0 }}>Gerenciar Produtos</h3>
      <table className="products-table">
        <thead><tr><th>Nome</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td><td>R$ {p.price.toFixed(2)}</td><td>{p.stock}</td>
                <td className="action-buttons">
                  <button onClick={() => onEdit(p)} className="edit-btn">Editar</button>
                  <button onClick={() => handleDelete(p._id)} className="delete-btn">Excluir</button>
                </td>
              </tr>
            ))
          ) : ( <tr><td colSpan="4">Nenhum produto cadastrado.</td></tr> )}
        </tbody>
      </table>
    </section>
  );
};


// --- Componente Principal do Painel ---
function ProducerPanel() {
  const { user, updateUserContext, login } = useAuth();
  const [view, setView] = useState('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  // Estados para Edição de Perfil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState({ name: '', label: '', value: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);


  // Efeito para buscar os pedidos recebidos (mantido)
  useEffect(() => {
    if (user && user.type === 'producer') {
      const fetchReceivedOrders = async () => {
        try { setOrdersLoading(true); const response = await axios.get(`${ORDERS_API_URL}/received/${user.id}`); setReceivedOrders(response.data); } 
        catch (error) { console.error("Erro ao buscar pedidos recebidos:", error); } 
        finally { setOrdersLoading(false); }
      };
      fetchReceivedOrders();
    }
  }, [user]);

  // Funções para modal de produto
  const openModalForNew = () => { setEditingProduct(null); setIsProductModalOpen(true); };
  const openModalForEdit = (product) => { setEditingProduct(product); setIsProductModalOpen(true); };
  const closeProductModal = () => setIsProductModalOpen(false);

  // Função para salvar produto
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    productData.price = parseFloat(productData.price);
    productData.stock = parseInt(productData.stock, 10);
    try {
      if (editingProduct) { await axios.put(`${PRODUCTS_API_URL}/${editingProduct._id}`, productData); }
      else { await axios.post(PRODUCTS_API_URL, { ...productData, storeId: user.storeId }); }
      
      closeProductModal();
      // Forçamos a View de Gerenciar Produtos a recarregar
      if(view === 'products') { setView('dashboard'); setTimeout(() => setView('products'), 50); }
    } catch (err) {
        console.error("Erro ao salvar produto:", err.response || err);
        let errorMessage = "Erro ao salvar o produto.";
        if (err.response?.data?.message) { errorMessage = `Erro do Servidor: ${err.response.data.message}`; }
        alert(errorMessage);
    }
  };


  // --- LÓGICA DE EDIÇÃO DE PERFIL ---
  const openEditModal = (fieldName, label) => {
    setEditField({ name: fieldName, label: label, value: user[fieldName] || '' });
    setIsEditModalOpen(true);
  };
  
  const handleSaveProfileChange = async (event) => {
    event.preventDefault();
    const newValue = editField.value;
    if (!newValue.trim()) {
      alert(`${editField.label} não pode ser vazio.`);
      return;
    }
    
    // Simulação de atualização (A rota PUT /api/users/:userId para edição de perfil não está no backend!)
    alert(`${editField.label} atualizado com sucesso! (Simulação de API)`);
    
    const updatedUser = { ...user, [editField.name]: newValue };
    updateUserContext(updatedUser); 
    
    setIsEditModalOpen(false);
  };
  
  // Ações de Alterar Senha e Avatar (mantidas)
  const handleChangePassword = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    
    if (newPassword.length < 8) { alert("A nova senha deve ter no mínimo 8 caracteres."); return; }
    if (currentPassword === newPassword) { alert("A nova senha deve ser diferente da senha atual."); return; }

    try {
      await axios.put(`${USERS_API_URL}/${user.id}/password`, { currentPassword, newPassword });
      alert("Senha alterada com sucesso! Você precisará logar novamente.");
      updateUserContext(null);
      window.location.href = '/login';
    } catch (err) {
      alert(err.response?.data?.message || "Erro desconhecido ao alterar senha.");
      console.error("Erro handleChangePassword:", err.response || err);
    }
  };
  
  const handleSaveAvatarUrl = async () => {
    if (!avatarUrlInput.trim() && user.avatarUrl) {
        if(!window.confirm("Deixar a URL vazia removerá sua foto de perfil e voltará para o avatar padrão. Deseja continuar?")){ return; }
    }
    try {
      const response = await axios.put(`${USERS_API_URL}/${user.id}/avatar`, { avatarUrl: avatarUrlInput.trim() });
      alert(response.data.message);

      updateUserContext(response.data.user); 
      
      setShowAvatarInput(false);
      setAvatarUrlInput('');
    } catch (err) {
      alert("Erro ao salvar a URL do avatar.");
      console.error("Erro handleSaveAvatarUrl:", err.response || err);
    }
  };
  
  // --- FIM DA LÓGICA DE EDIÇÃO DE PERFIL ---


  if (!user) { return <div className="main-content"><h2>Carregando painel...</h2></div>; }
  if (user.type !== 'producer' || !user.storeId) { return <div className="main-content"><h2>Erro: Acesso não autorizado ou dados incompletos.</h2></div>; }

  const displayAvatarUrl = user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`;

  return (
    <>
      <div className="panel-container main-content">
        {/* --- COLUNA ESQUERDA: PERFIL DETALHADO --- */}
        <aside className="panel-sidebar card">
          <div className="profile-summary detailed">
            <div className="avatar-container">
              <img src={displayAvatarUrl} alt="Avatar do perfil" className="profile-icon detailed" />
              <button onClick={() => setShowAvatarInput(!showAvatarInput)} className="change-avatar-btn" title="Alterar URL do avatar">
                <FiEdit3 />
              </button>
            </div>
            {/* Input de URL de Avatar */}
            {showAvatarInput && (
               <div className="avatar-url-input">
                 <input type="url" className="form-control" placeholder="Cole a URL da imagem aqui" value={avatarUrlInput} onChange={(e) => setAvatarUrlInput(e.target.value)} />
                 <button onClick={handleSaveAvatarUrl} className="btn btn-primary btn-sm">Salvar URL</button>
               </div>
             )}
            <h3 className="profile-name">{user.name}</h3>
            <p className="profile-role">Vendedor</p>
          </div>
          {/* Detalhes do Perfil (dados puxados do login) */}
          <div className="profile-details-exact">
             <p><strong>Nome:</strong> <span>{user.name}</span></p>
             <p><strong>E-mail:</strong> <span>{user.email}</span></p>
             <p><strong>Telefone:</strong> <span>{user.phone || 'Não informado'}</span></p>
             <p><strong>Endereço:</strong> <span>{user.address || 'Não informado'}</span></p>
             <p><strong>Cidade:</strong> <span>{user.city || 'Não informada'}</span></p>
          </div>
          
          {/* --- NOVO LINK: VER PERFIL PÚBLICO --- */}
          <div className="profile-public-link">
             <Link to={`/produtor/${user.id}`} className="plain-link">
               <FiExternalLink style={{ marginRight: '8px' }}/> Ver Perfil Público
             </Link>
          </div>
          {/* --- FIM DO NOVO LINK --- */}
        </aside>

        {/* --- COLUNA DIREITA: CONTEÚDO PRINCIPAL (Ações) --- */}
        <main className="panel-main-content">
          {/* Visão do Dashboard */}
          {view === 'dashboard' && (
            <div className="dashboard-view">
              {/* Menu Meus Pedidos */}
              <div className="action-menu card">
                <h3><FiArchive className="action-icon"/> Meus Pedidos ({receivedOrders.length})</h3>
                {ordersLoading ? ( <p>Carregando...</p> ) 
                  : receivedOrders.length === 0 ? ( <p>Você ainda não recebeu pedidos.</p> ) 
                  : (
                    <ul className="dashboard-orders-list">
                      {receivedOrders.slice(0, 3).map(order => (
                        <li key={order._id}>
                          <Link to={`/pedidos/${order._id}`}>
                             • Pedido de <strong>{order.consumerId?.name || 'Consumidor'}</strong> - {order.productDetails?.name || 'Produto'} ({order.status})
                          </Link>
                        </li>
                      ))}
                      {receivedOrders.length > 3 && ( <li><Link to="#">• Ver todos os pedidos...</Link></li> )}
                    </ul>
                  )
                }
              </div>

               {/* Menu Meus Produtos (FUNCIONAIS) */}
              <div className="action-menu card">
                 <h3><FiShoppingBag className="action-icon"/> Meus Produtos</h3>
                <ul>
                  {/* CORRIGIDO: Gerenciar meus produtos - AGORA FUNCIONA */}
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setView('products'); }}>• Gerenciar meus produtos</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); openModalForNew(); }}>• Adicionar novo produto</a></li>
                </ul>
              </div>

               {/* --- MENU EDITAR PERFIL (CARD DE AÇÃO NA DIREITA) --- */}
               <div className="action-menu card profile-edit-menu">
                 <h3><FiEdit className="action-icon"/> Editar Perfil</h3>
                 <ul>
                   {/* BOTÕES DE EDIÇÃO AGORA ABREM O MODAL COM O CAMPO CORRESPONDENTE */}
                   <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('name', 'Nome'); }}>• Editar nome</a></li>
                   <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('email', 'E-mail'); }}>• Editar e-mail (Simulação)</a></li>
                   <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('phone', 'Telefone'); }}>• Editar telefone</a></li>
                   <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('address', 'Endereço'); }}>• Editar endereço</a></li>
                   <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('city', 'Cidade'); }}>• Editar cidade</a></li>
                   {/* BOTÃO ALTERAR SENHA */}
                   <li><a href="#" onClick={(e) => { e.preventDefault(); setIsPasswordModalOpen(true); }}>• Alterar senha</a></li>
                 </ul>
               </div>
            </div>
          )}

          {/* Visão de Gerenciar Produtos (A tabela) */}
          {view === 'products' && user.storeId && (
            <ProductManagementView
              storeId={user.storeId}
              onBack={() => setView('dashboard')}
              onEdit={openModalForEdit}
              onAdd={openModalForNew}
            />
          )}
        </main>

        {/* Modais */}
        {/* Modal para Adicionar/Editar Produto */}
        <Modal isOpen={isProductModalOpen} onClose={closeProductModal}>
          <h3>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
          <form onSubmit={handleFormSubmit} className="product-form">
            <input name="name" defaultValue={editingProduct?.name} placeholder="Nome do Produto" className="form-control" required />
            <textarea name="description" defaultValue={editingProduct?.description} placeholder="Descrição" className="form-control" required />
            <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="Preço (R$)" className="form-control" required />
            <input name="stock" type="number" defaultValue={editingProduct?.stock} placeholder="Estoque" className="form-control" required />
            <select name="category" defaultValue={editingProduct?.category || ""} className="form-control" required>
              <option value="" disabled>Selecione uma categoria</option>
              {[ "Frutas e Legumes", "Comidas e Doces", "Laticínios", "Artesanato", "Carnes e Ovos", "Farinhas e Temperos" ].map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
           </select>
           <input name="imageUrl" defaultValue={editingProduct?.imageUrl} placeholder="URL da Imagem" className="form-control" required />
           <div className="form-actions">
              <button type="button" onClick={closeProductModal} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar</button>
           </div>
        </form>
      </Modal>

      {/* Modal para Edição de Perfil Genérica */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h3>Editar {editField.label}</h3>
          <form onSubmit={handleSaveProfileChange}>
              <label htmlFor={editField.name}>{editField.label}</label>
              <input
                  id={editField.name}
                  name={editField.name}
                  className="form-control"
                  value={editField.value}
                  onChange={(e) => setEditField({ ...editField, value: e.target.value })}
                  required
              />
              <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" style={{marginRight: '1rem'}}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
          </form>
        </Modal>

        {/* Modal para Alterar Senha */}
        <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
          <h3>Alterar Senha</h3>
          <form onSubmit={handleChangePassword}>
            <label>Senha Atual</label>
            <input name="currentPassword" type="password" className="form-control" required />
            <label>Nova Senha (Mín. 8 caracteres)</label>
            <input name="newPassword" type="password" className="form-control" required minLength="8" />
            <div className="form-actions">
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Nova Senha</button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

// Estilos do dashboard (injetados no head)
const dashboardStyles = `
.dashboard-orders-list { list-style: none; padding: 0; margin-top: 1rem; }
.dashboard-orders-list li { margin-bottom: 0.75rem; }
.dashboard-orders-list a { text-decoration: none; color: var(--text-color); }
.dashboard-orders-list a:hover { text-decoration: underline; color: var(--primary-color); }
.profile-edit-menu { margin-top: 2rem; }
/* Estilo para o link de perfil público na coluna esquerda */
.profile-public-link { margin-top: 1.5rem; text-align: center; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
.profile-public-link .plain-link { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  text-decoration: none; 
  color: var(--text-color); /* Cor do texto padrão */
  font-weight: 600;
  padding: 8px 0; /* Padding interno */
  border: 1px solid var(--text-color); /* Borda na cor do texto */
  border-radius: 8px;
  transition: background-color 0.2s, color 0.2s;
}
.profile-public-link .plain-link:hover {
  background-color: var(--primary-color);
  color: white; /* Cor branca no hover */
  border-color: var(--primary-color); /* Borda Verde Oliva no hover */
}
`;
let dashStyleSheet = document.getElementById("producerDashStyle");
if (!dashStyleSheet) {
    dashStyleSheet = document.createElement("style");
    dashStyleSheet.id = "producerDashStyle";
    dashStyleSheet.innerText = dashboardStyles;
    document.head.appendChild(dashStyleSheet);
}

export default ProducerPanel;