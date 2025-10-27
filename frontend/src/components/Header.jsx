import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import CartIcon from './CartIcon'; // 1. IMPORTAMOS O NOVO ÍCONE DA SACOLA

function Header() {
  const { user, logout } = useAuth();
  const { setSearchTerm } = useSearch();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 2. LÓGICA PARA O LINK DE PERFIL CORRETO
  const profileLink = user ? (user.type === 'producer' ? '/panel' : '/meu-painel') : '/login';

  return (
    <header className="header-main">
      <div className="header-content">
        <Link to="/" className="logo">
          {/* A logo que você usa */}
          <img src="/images/logo.png" alt="Raiz do Sertão" />
        </Link>

        <div className="search-container-header">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav className="header-nav">
          {user ? (
            <>
              {/* 3. SUBSTITUÍMOS O ÍCONE ANTIGO PELO NOVO COMPONENTE */}
              <div className="icon-btn-wrapper">
                <CartIcon />
              </div>

              {/* 4. USAMOS O LINK DE PERFIL CONDICIONAL */}
              <Link to={profileLink} className="icon-btn" title="Meu Painel">
                <FiUser />
              </Link>
              
              <button onClick={handleLogout} className="icon-btn" title="Sair">
                <FiLogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
export default Header;