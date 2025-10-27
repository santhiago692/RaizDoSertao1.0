export const initialUsers = [
  { id: 'user-1', type: 'producer', name: 'Fulano da Silva', email: 'produtor1@email.com', password: 'senha123', phone: '74 99999-9999', city: 'Capim Grosso', address: 'Rua A numero 2', storeId: 'store-1' },
  { id: 'user-2', type: 'producer', name: 'Ciclana Souza', email: 'produtor2@email.com', password: 'senha123', phone: '71 98888-8888', city: 'Salvador', address: 'Avenida B, 45', storeId: 'store-2' },
  { id: 'user-3', type: 'consumer', name: 'Beltrano Costa', email: 'consumidor1@email.com', password: 'senha123', phone: '75 97777-7777', city: 'Feira de Santana', address: 'Praça C, 100' },
];
export const initialStores = [
  { id: 'store-1', ownerId: 'user-1', name: 'Fazenda do Fulano' },
  { id: 'store-2', ownerId: 'user-2', name: 'Horta da Ciclana' },
];

// O array de produtos agora está vazio. O app dependerá 100% do banco de dados.
export const initialProducts = [];

export const initialOrders = [];