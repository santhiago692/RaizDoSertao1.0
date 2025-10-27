import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import InputMask from 'react-input-mask'; // Importa o componente da máscara

const API_URL = 'http://localhost:5000/api/users/register';

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'consumer', name: '', email: '', password: '', phone: '', city: '', address: '', storeName: ''
  });

  const handleChange = (e) => {
    // Para o InputMask, o valor já vem formatado, mas podemos limpar se quisermos antes de enviar
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Remove a máscara antes de validar/enviar para o backend (opcional, mas recomendado)
    const cleanedPhone = formData.phone.replace(/\D/g, ''); // Remove tudo que não for dígito

    if (cleanedPhone.length !== 11) { // Validação do comprimento (já que a máscara exige 11)
       return setError("Número de telefone inválido. Use o formato (DD) 9NNNN-NNNN.");
    }
    if (formData.password.length < 8) return setError("Senha deve ter no mínimo 8 caracteres.");
    if (formData.type === 'producer' && !formData.storeName) return setError("Nome da loja é obrigatório para Vendedor.");

    // Envia os dados com o telefone já formatado pela máscara ou limpo (cleanedPhone)
    // Vamos enviar o formatado, pois o backend já espera um formato válido
    const dataToSend = { ...formData }; 

    try {
      const response = await axios.post(API_URL, dataToSend);
      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      // Exibe a mensagem de erro específica do backend, se houver
       setError(err.response?.data?.message || 'Ocorreu um erro ao tentar cadastrar.');
    }
  };

  return (
    <div className="auth-page-container">
      {/* Coluna Visual Esquerda */}
      <div className="auth-visual-side">
         {/* Conteúdo removido */}
      </div>

      {/* Coluna do Formulário Direita */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <h2>Crie sua Conta</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Nome Completo</label>
            <input id="name" name="name" className="form-control" onChange={handleChange} required />

            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="form-control" onChange={handleChange} required />

            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" className="form-control" placeholder="Mín. 8 caracteres" onChange={handleChange} required />

            {/* --- ALTERAÇÃO AQUI: Usando InputMask para o telefone --- */}
            <label htmlFor="phone">Telefone</label>
            <InputMask
              mask="(99) 99999-9999" // Define a máscara desejada
              maskChar={null} // Não mostra placeholder (_) quando vazio (opcional)
              id="phone"
              name="phone"
              className="form-control"
              value={formData.phone} // Controla o valor pelo estado
              onChange={handleChange}
              required
            />
            {/* --- FIM DA ALTERAÇÃO --- */}

            <label htmlFor="city">Cidade</label>
            <input id="city" name="city" className="form-control" onChange={handleChange} required />

            <label htmlFor="address">Endereço</label>
            <input id="address" name="address" className="form-control" onChange={handleChange} required />

            {/* Seleção de tipo de usuário */}
            <div className="user-type-selection">
              <label>Eu sou:</label>
              <div className="user-type-options">
                <div>
                  <input type="radio" id="consumer" name="type" value="consumer" checked={formData.type === 'consumer'} onChange={handleChange}/>
                  <label htmlFor="consumer">Consumidor</label>
                </div>
                <div>
                  <input type="radio" id="producer" name="type" value="producer" checked={formData.type === 'producer'} onChange={handleChange}/>
                  <label htmlFor="producer">Vendedor</label>
                </div>
              </div>
            </div>

            {formData.type === 'producer' && (
              <>
                <label htmlFor="storeName">Nome da Loja</label>
                <input id="storeName" name="storeName" className="form-control" onChange={handleChange} required />
              </>
            )}

            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
            <button type="submit" className="btn btn-auth">Se cadastrar</button>
          </form>
          <div className="auth-links">
            <Link to="/login">Já tenho uma conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Register;