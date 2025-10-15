// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importa o banco de dados. O nome está ok para o desenvolvimento.
import drugDatabase from './drug_database.json'; 

// Importa os componentes da aplicação
import DoseMateHome from './DoseMateHome'; 
import InfusionCalculator from './InfusionCalculator';
import DrugDetailPage from './DrugDetailPage';
import AboutPage from './AboutPage';
import IncompatibilityMatrixPage from './IncompatibilityMatrixPage';
import SettingsPage from './SettingsPage'; 

function App() {
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    // Carrega os dados do JSON no início da aplicação
    setDrugs(drugDatabase);
  }, []);

  return (
    <Router basename="/dosemate/"> 
      <Routes>
        {/* Rota principal (Home/Busca) */}
        <Route path="/" element={<DoseMateHome allDrugs={drugs} />} />
        
        {/* Rota da Lista Completa de Drogas (Correção para o link /med) */}
        <Route path="/med" element={<DoseMateHome allDrugs={drugs} isFullList={true} />} />

        {/* Rota da Calculadora */}
        <Route path="/calculator" element={<InfusionCalculator allDrugs={drugs} />} />
        
        {/* Rota para Detalhes da Droga (Usa o slug na URL, ex: /med/norepinephrine) */}
        <Route path="/med/:slug" element={<DrugDetailPage allDrugs={drugs} />} />
        
        {/*  /drugs/  */}
        <Route path="/drugs/:slug" element={<DrugDetailPage allDrugs={drugs} />} />
        
        {/* Rota da Página "Sobre" (About) */}
        <Route path="/about" element={<AboutPage />} /> 

        {/* Rota da Matriz de Incompatibilidade */}
        <Route path="/matrix" element={<IncompatibilityMatrixPage allDrugs={drugs} />} /> {/* <-- NOVA ROTA */}

        {/* Rota da Página de Configurações */}
        <Route path="/settings" element={<SettingsPage />} /> 

        {/* Futuras rotas aqui (Ex: /about, /settings) */}
      </Routes>
    </Router>
  );
}

export default App;
