export const baseUrl = 'https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/';



export const baseUrlClientes = baseUrl + 'eletro-clientes';
export const baseUrlEstoque = baseUrl + 'eletro-produtos';
export const baseUrlItems = baseUrl + 'eletro-itens-venda';
export const baseUrlCategorias = baseUrl + 'eletro-categorias';
export const baseUrlVendas = baseUrl + 'eletro-vendas';

export const getParametersVendasPadrao = '?sort=data:desc&populate=*';