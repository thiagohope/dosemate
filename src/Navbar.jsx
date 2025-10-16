import { Link } from 'react-router-dom';
import React, { useState } from 'react'; // Importa o useState
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import icon from './assets/icon.png';
import googlePlayBadge from './assets/google_play_badge.svg';

function Navbar() {
  const { t } = useTranslation();
  // Estado para controlar a visibilidade do menu móvel
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // O cabeçalho continua fixo no topo
    <header className="sticky top-0 z-20 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Logo/Ícone - Link para a página inicial */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={icon} alt="DoseMate Icon" className="w-10 h-10" />
          <div className="text-2xl font-bold text-cyan-600">DoseMate</div>
        </Link>

{/* Links de Navegação Principal para Desktop */}
        <nav
          className="hidden sm:flex items-center gap-4 text-sm font-semibold text-gray-700 ml-auto" /* ml-auto para empurrar para a esquerda */
          aria-label="Main Medical Navigation"
        >
          <Link to="/calculator" className="hover:text-cyan-600 transition-colors">{t('nav_calculator')}</Link>
          <Link to="/med" className="hover:text-cyan-600 transition-colors">{t('nav_drug_database')}</Link>
          <Link to="/matrix" className="hover:text-cyan-600 transition-colors font-bold">{t('nav_matrix')}</Link>
          <Link to="/about" className="hover:text-cyan-600 transition-colors">{t('nav_about')}</Link>
        </nav>

        {/* Container para CTA de Download, Seletor de Idioma e Botão de Menu (Lado Direito) */}
        <div className="flex items-center gap-2 sm:ml-4">
            
            {/* BOTÃO DE DOWNLOAD DA LOJA */}
            <a 
              href="[LINK_PLAY_STORE]" 
              aria-label="Download DoseMate App on Google Play Store" 
              className="transition-transform hover:scale-[1.1] active:scale-[0.9]"
            >
              <img src={googlePlayBadge}
                alt="Download on Google Play" 
                className="h-12 md:h-12" />
            </a>

            <LanguageSelector />

            {/* Botão Hambúrguer - Visível apenas em telas pequenas (sm:hidden) */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 sm:hidden"
                aria-label="Open main menu"
            >
                {/* Ícone de Hambúrguer ou X, dependendo do estado do menu */}
                {isMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                )}
            </button>
        </div>
        </div>

      {/* Menu Dropdown Móvel - Aparece abaixo do header */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden bg-white border-t border-gray-200`}>
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
            <Link to="/calculator" className="block text-gray-700 font-semibold hover:text-cyan-600">{t('nav_calculator')}</Link>
            <Link to="/med" className="block text-gray-700 font-semibold hover:text-cyan-600">{t('nav_drug_database')}</Link>
            <Link to="/matrix" className="block text-gray-700 font-semibold hover:text-cyan-600">{t('nav_matrix')}</Link>
            <Link to="/about" className="block text-gray-700 font-semibold hover:text-cyan-600">{t('nav_about')}</Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

