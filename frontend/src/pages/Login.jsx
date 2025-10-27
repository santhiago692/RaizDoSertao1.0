import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.type === 'producer') navigate('/panel');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível conectar ao servidor.");
    }
  };

  return (
    // --- CORREÇÃO AQUI: Usa a mesma estrutura do Register.jsx ---
    <div className="auth-page-container">
      {/* Coluna Visual Esquerda */}
      <div className="auth-visual-side">
         {/* Conteúdo removido */}
      </div>

      {/* Coluna do Formulário Direita */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-auth">Login</button>
          </form>
          <div className="auth-links">
            <Link to="#">Esqueci minha senha</Link> | <Link to="/register">Não tenho uma conta</Link>
          </div>
        </div>
      </div>
    </div>
    // --- FIM DA CORREÇÃO ---
  );
}
export default Login;