import React, { useEffect } from 'react';
import HeaderHome from '../components/HeaderHome.jsx';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { definirToken } from '../redux/loginSlice';


const Botoes = () => {  
  return (
      <div className="button-container">
        <a className="button nova-venda" href="vendas">   Vendas   </a>
        <a className="button estoque" href="estoque">Estoque</a>
        <a className="button relatorio" href="relatorios">Relatórios</a>
        <a className="button clientes" href="clientes">Clientes</a>
      </div>    
  );
};

// Butão "Sobre", apenas para mobile e dispositivos pequenos

const SobreMobile = () => {
  return (
    <a className="button-sobre-mobile" href="sobre">Sobre</a>
  );
};


// Componente principal que será exportado por defaut

const Home = ({ history }) => {  
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login")
      return navigate("/login");
    }
  }, [token]);

  return (
    <main>
      <HeaderHome />      
      <SobreMobile />
      <Botoes />
    </main>
  );
};

export default Home;