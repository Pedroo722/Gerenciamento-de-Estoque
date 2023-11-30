import React from 'react';
import { useDispatch } from 'react-redux';
import { definirToken } from '../redux/loginSlice';

const MenuLateral = ({ menuAberto }) => {
  const dispatch = useDispatch();

  return (
    <div className={`menu-lateral ${menuAberto ? 'aberto' : ''}`}>
      <a className="button nova-venda" href="vendas">Vendas</a>
      <a className="button relatorio" href="relatorios">Relatórios</a>
      <a className="button estoque" href="estoque">Estoque</a>
      <a className="button clientes" href="clientes">Cliente</a>

      <a className="header-button-sobre" onClick={ () => dispatch(definirToken("")) }>Deslogar</a>
    </div>
  );
};

export default MenuLateral;
