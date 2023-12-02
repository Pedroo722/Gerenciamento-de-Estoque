import React, { useState } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import './App.css'
import dadosStore from './redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Clientes from './pages/Clientes';
import Estoque from './pages/Estoque';
import Relatorios from './pages/Relatorios';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';

// App

export default function App() {
  let {store, persistor} = dadosStore();
  
  return ( 
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<Home />} />
            <Route path='/sobre' element={<Sobre />} />
            <Route path='/vendas' element={<Cadastro />} />
            <Route path='/relatorios' element={<Relatorios />} />
            <Route path='/estoque' element={<Estoque />} /> 
            <Route path='/clientes' element={<Clientes />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}