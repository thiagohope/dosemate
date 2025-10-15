// src/Navbar.jsx
// Componente de Navegação Global (Header)

import { Link } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next'; // Para suportar a tradução
import LanguageSelector from './LanguageSelector'; // Seu seletor de idioma
import icon from './assets/icon.png'; // Seu ícone (logo)

// As classes aqui tornam o cabeçalho mais evidente e usam o Tailwind
// de forma padronizada, eliminando estilos em linha complexos.
function Navbar() {
  const { t } = useTranslation();

  return (
    // Fundo branco, sombra sutil, fixo no topo
    <header className="sticky top-0 z-20 bg-white shadow-md border-b border-gray-200"> 
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        
        {/* Logo/Ícone - Tornado mais evidente com classes */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={icon} alt="DoseMate Icon" className="w-10 h-10" /> 
          <div className="text-2xl font-bold text-cyan-600">DoseMate</div> 
        </Link>

        {/* Seletor de Idioma */}
        <div className="ml-4">
            <LanguageSelector />
        </div>
        
        {/* Links de Navegação Principal */}
        <nav 
          className="ml-auto hidden sm:flex gap-4 text-sm font-semibold text-gray-700"
          // COMENTÁRIO SEO: Adiciona aria-label para acessibilidade e clareza para bots (em inglês)
          aria-label="Main Medical Navigation"
        >
          {/* Adicionando aria-label (em inglês) para cada link para clareza contextual */}
          <Link 
            to="/calculator" 
            className="hover:text-cyan-600 transition-colors"
            aria-label="Infusion Calculator"
          >
            {t('nav_calculator')}
          </Link>
          <Link 
            to="/med" 
            className="hover:text-cyan-600 transition-colors"
            aria-label="Drug Database"
          >
            {t('nav_drug_database')}
          </Link>
          <Link 
            to="/matrix" 
            className="hover:text-cyan-600 transition-colors font-bold"
            aria-label="Drug Incompatibility Matrix"
          >
            {t('nav_matrix')}
          </Link> 
          <Link 
            to="/about" 
            className="hover:text-cyan-600 transition-colors"
            aria-label="About DoseMate"
          >
            {t('nav_about')}
          </Link>
        </nav>      
      </div>  
    </header>
  );
}

export default Navbar;

