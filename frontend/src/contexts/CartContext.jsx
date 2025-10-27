import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Criar o Contexto
const CartContext = createContext();

// 2. Criar o Hook customizado (para facilitar o uso)
export const useCart = () => useContext(CartContext);

// 3. Criar o Provider (o componente que vai "abraçar" o App)
export const CartProvider = ({ children }) => {
  // O estado da sacola será um 'Map'
  // Chave: storeId
  // Valor: { storeName: 'Nome da Loja', products: Map<productId, { product, quantity }> }
  const [cart, setCart] = useState(new Map());

  // Carregar a sacola do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      // JSON não suporta Map, então convertemos de [key, value] arrays
      const parsed = JSON.parse(savedCart);
      const cartMap = new Map(
        parsed.map(([storeId, storeData]) => [
          storeId,
          {
            ...storeData,
            products: new Map(storeData.products),
          },
        ])
      );
      setCart(cartMap);
    }
  }, []);

  // Salvar a sacola no localStorage sempre que ela mudar
  useEffect(() => {
    // Convertemos o Map para um array de [key, value] para poder salvar
    const cartArray = Array.from(cart.entries()).map(([storeId, storeData]) => [
      storeId,
      {
        ...storeData,
        products: Array.from(storeData.products.entries()),
      },
    ]);
    localStorage.setItem('shoppingCart', JSON.stringify(cartArray));
  }, [cart]);

  // --- FUNÇÕES PRINCIPAIS ---

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const { storeId, storeName } = product;

      // 1. Pega a loja (ou cria se não existir)
      const store = newCart.get(storeId) || {
        storeName: storeName || 'Loja não identificada',
        products: new Map(),
      };

      // 2. Pega o produto na loja (ou adiciona)
      const existingProduct = store.products.get(product._id);
      
      if (existingProduct) {
        // Se já existe, apenas soma a quantidade
        existingProduct.quantity += quantity;
      } else {
        // Se não existe, adiciona o produto
        store.products.set(product._id, { product, quantity });
      }

      // 3. Atualiza a loja no carrinho
      newCart.set(storeId, store);
      
      console.log('Sacola atualizada:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId, storeId) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart);
      const store = newCart.get(storeId);

      if (store) {
        // Remove o produto do Map de produtos da loja
        store.products.delete(productId);
        
        // Se a loja ficou sem produtos, remove a loja inteira da sacola
        if (store.products.size === 0) {
          newCart.delete(storeId);
        } else {
          newCart.set(storeId, store);
        }
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart(new Map());
    localStorage.removeItem('shoppingCart');
  };

  // --- FUNÇÕES AUXILIARES ---

  // Retorna o número total de ITENS (soma de quantidades)
  const getTotalItemsCount = () => {
    let count = 0;
    for (const store of cart.values()) {
      for (const item of store.products.values()) {
        count += item.quantity;
      }
    }
    return count;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};