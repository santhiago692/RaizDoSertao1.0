import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/users';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) { setUser(JSON.parse(storedUser)); }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const loggedInUser = response.data.user;
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  // --- NOVA FUNÇÃO ---
  // Função para atualizar os dados do usuário no contexto e localStorage
  const updateUserContext = (updatedUserData) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };
  // --- FIM DA NOVA FUNÇÃO ---

  // Adiciona a nova função ao valor do contexto
  const value = { user, isAuthenticated: !!user, login, logout, loading, updateUserContext };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};