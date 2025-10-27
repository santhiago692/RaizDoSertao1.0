import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { FiArchive, FiEdit, FiEdit3 } from 'react-icons/fi';

// API URLs que vamos usar
const ORDERS_API_URL = 'http://localhost:5000/api/orders';
const USERS_API_URL = 'http://localhost:5000/api/users';

// --- Componente Principal do Painel do Consumidor ---
function ConsumerPanel() {
  const { user, updateUserContext } = useAuth();
  
  // Estados dos Pedidos
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Estados de Edição de Perfil (Reaproveitados)
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState({ name: '', label: '', value: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Efeito para buscar os pedidos FEITOS (comprados)
  useEffect(() => {
    if (user && user.type === 'consumer') {
      const fetchMyOrders = async () => {
        try {
          setOrdersLoading(true);
          // MUDANÇA: Buscamos em /purchased/ em vez de /received/
          const response = await axios.get(`${ORDERS_API_URL}/purchased/${user.id}`);
          setMyOrders(response.data);
        } catch (error) {
          console.error("Erro ao buscar meus pedidos:", error);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [user]);

  // --- LÓGICA DE EDIÇÃO DE PERFIL (Idêntica ao ProducerPanel) ---
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
    
    // Simulação (você precisará da rota no backend)
    alert(`${editField.label} atualizado com sucesso! (Simulação de API)`);
    const updatedUser = { ...user, [editField.name]: newValue };
    updateUserContext(updatedUser); 
    setIsEditModalOpen(false);
  };
  
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
      updateUserContext(null); // Desloga o usuário
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

  // Verificação de acesso
  if (!user) { return <div className="main-content"><h2>Carregando painel...</h2></div>; }
  if (user.type !== 'consumer') { return <div className="main-content"><h2>Erro: Acesso não autorizado.</h2></div>; }

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
            <p className="profile-role">Consumidor</p>
          </div>
          {/* Detalhes do Perfil (dados puxados do login) */}
          <div className="profile-details-exact">
              <p><strong>Nome:</strong> <span>{user.name}</span></p>
              <p><strong>E-mail:</strong> <span>{user.email}</span></p>
              <p><strong>Telefone:</strong> <span>{user.phone || 'Não informado'}</span></p>
              <p><strong>Endereço:</strong> <span>{user.address || 'Não informado'}</span></p>
              <p><strong>Cidade:</strong> <span>{user.city || 'Não informada'}</span></p>
          </div>
          
          {/* REMOVIDO: Link de Perfil Público */}
        </aside>

        {/* --- COLUNA DIREITA: CONTEÚDO PRINCIPAL (Ações) --- */}
        <main className="panel-main-content">
          <div className="dashboard-view">
            
            {/* Menu Meus Pedidos */}
            <div className="action-menu card">
              <h3><FiArchive className="action-icon"/> Meus Pedidos ({myOrders.length})</h3>
              {ordersLoading ? ( <p>Carregando...</p> ) 
                : myOrders.length === 0 ? ( <p>Você ainda não fez nenhum pedido.</p> ) 
                : (
                  <ul className="dashboard-orders-list">
                    {myOrders.slice(0, 3).map(order => (
                      <li key={order._id}>
                        {/* CORRIGIDO: Link para /pedidos/id */}
                        <Link to={`/pedidos/${order._id}`}> 
                          • Pedido de <strong>{order.productDetails?.name || 'Produto'}</strong> com <strong>{order.producerId?.name || 'Vendedor'}</strong> ({order.status})
                        </Link>
                      </li>
                    ))}
                    {myOrders.length > 3 && ( 
                      // ATUALIZADO: Link para a página de lista de pedidos
                      <li><Link to="/meus-pedidos">• Ver todos os pedidos...</Link></li> 
                    )}
                  </ul>
                )
              }
            </div>

            {/* REMOVIDO: Menu Meus Produtos */}

            {/* --- MENU EDITAR PERFIL (Mantido) --- */}
            <div className="action-menu card profile-edit-menu">
              <h3><FiEdit className="action-icon"/> Editar Perfil</h3>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('name', 'Nome'); }}>• Editar nome</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('email', 'E-mail'); }}>• Editar e-mail (Simulação)</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('phone', 'Telefone'); }}>• Editar telefone</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('address', 'Endereço'); }}>• Editar endereço</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openEditModal('city', 'Cidade'); }}>• Editar cidade</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsPasswordModalOpen(true); }}>• Alterar senha</a></li>
              </ul>
            </div>
          </div>
        </main>

        {/* Modais */}
        {/* REMOVIDO: Modal de Produto */}

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
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" style={{marginRight: '10px'}}>Cancelar</button>
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
/* REMOVIDO: Estilo de link de perfil público */
`;
let dashStyleSheet = document.getElementById("consumerDashStyle"); // ID ÚNICO
if (!dashStyleSheet) {
    dashStyleSheet = document.createElement("style");
    dashStyleSheet.id = "consumerDashStyle";
    dashStyleSheet.innerText = dashboardStyles;
    document.head.appendChild(dashStyleSheet);
}

export default ConsumerPanel;