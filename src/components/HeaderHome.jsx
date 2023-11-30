import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { definirToken } from '../redux/loginSlice';


const HeaderHome = () => {
  const dispatch = useDispatch();
  
  return (
    <header className={`header`}>
      <a className="header-button-sobre" onClick={ () => dispatch(definirToken("")) }>Sair</a>
      <div className="header-title">Sistema de Gerenciamento</div>
      <a className="header-button-sobre" href="sobre">Sobre</a>
    </header>
  );
};

export default HeaderHome;