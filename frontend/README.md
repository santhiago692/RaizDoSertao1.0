# Plataforma de Apoio a Pequenos Produtores Locais (Frontend Demo)

Este é um protótipo de frontend desenvolvido em React para a demonstração funcional de uma plataforma de apoio a pequenos produtores.

## Funcionalidades Implementadas
- Cadastro e Login para Produtores e Consumidores.
- Painel do Produtor com gerenciamento de Loja e Produtos (CRUD completo).
- Catálogo de produtos na Home com busca e filtro por categoria.
- Fluxo de "Pedido" simplificado: conecta consumidor e produtor, exibe contatos e atualiza o estoque (simulado).
- Persistência de dados entre sessões utilizando o `localStorage` do navegador.
- Rotas protegidas para garantir que apenas produtores acessem o painel.

## 🚀 Como Instalar e Rodar

1.  **Clone o repositório ou baixe os arquivos.**
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
4.  Abra [http://localhost:5173](http://localhost:5173) (ou a porta indicada no terminal) para ver a aplicação.

## 📝 Onde Alterar os Dados Mockados

Os dados iniciais da aplicação (produtores, consumidores, lojas e produtos) estão localizados em:
`src/mock/mockData.js`

Você pode editar este arquivo para adicionar, remover ou modificar os dados que são carregados na primeira vez que a aplicação é executada. Para resetar os dados no navegador, limpe o `localStorage` no seu DevTools.


## Credentials de Teste

**Produtor:**
- **Email:** `produtor1@email.com`
- **Senha:** `senha123`

**Consumidor:**
- **Email:** `consumidor1@email.com`
- **Senha:** `senha123`