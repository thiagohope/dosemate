// src/AboutPage.jsx
// Componente de página "Sobre" (About)

import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

// Mapeamento de cor para a categoria "electrolytes" (azul-claro/ciano), 
// que é o tema da aplicação.
const ABOUT_STYLE = { 
  bg: 'bg-cyan-50', 
  text: 'text-cyan-800', 
  border: 'border-cyan-300' 
};

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Cartão Principal de Conteúdo */}
        <div className={`shadow-xl rounded-lg overflow-hidden border ${ABOUT_STYLE.bg} p-6`}>
          
          {/* Título */}
          <h1 className={`text-4xl font-extrabold ${ABOUT_STYLE.text} mb-4 border-b pb-2`}>
            {t('about_page_title')}
          </h1>
          
          {/* Corpo: O que é DoseMate/BrainboxMed */}
          <div className="space-y-6 text-gray-700 leading-relaxed">
            
            <h2 className="text-2xl font-bold text-gray-800">{t('about_section_mission_title')}</h2>
            
            <p itemProp="about"> {/* COMENTÁRIO SEO: itemProp para indicar o tópico da página */}
              <span>{t('about_mission_part_1_start')}</span>
              
              {/* Nome da Marca com Cores e Estilos - Otimizado para SEO/E-A-T */}
              {/* COMENTÁRIO SEO: Adiciona Schema.org/Organization e Person para Autoria/Confiança (E-A-T) em um span pai para manter o estilo */}
              <span 
                itemScope itemProp="provider" itemType="http://schema.org/Organization"
              >
                <span itemProp="name" className="sr-only">BrainboxMed</span> {/* Nome completo para bots, escondido */}
                <span style={{ color: '#5e3e94', fontWeight: 700 }} aria-hidden="true">Brainbox</span>
                <span style={{ color: '#f39c12', fontWeight: 700 }} aria-hidden="true">Med</span>
              </span>
              <sup className="text-xs font-semibold">™</sup> {/* Marca Registrada */ }
              
              <span>{t('about_mission_part_1_end')}</span>
            </p>            
            <p>
              {t('about_section_mission_text_2')}
            </p>

            {/* AVISO LEGAL E SEGURANÇA (Destaque) - OTIMIZADO PARA SEO/E-E-A-T */}
            <div 
                className="mt-8 text-sm text-red-700 leading-relaxed p-4 bg-red-100 rounded-lg border border-red-300 shadow-md"
                // COMENTÁRIO SEO: Usando o Schema.org/WebPageElement para sinalizar um bloco de Aviso/Alerta
                itemScope itemType="http://schema.org/Disclaimer" 
                itemProp="publisherImprint" // Define isso como uma 'impressão' regulamentar do editor
            >
                <p 
                    className="font-semibold text-lg"
                    itemProp="headline" // O título do Aviso
                >
                    {t('safety_warning_title_02')}
                </p>
                <p className="mt-2">{t('about_disclaimer_text_1')}</p>
                <p className="mt-2">{t('about_disclaimer_text_2')}</p>
            </div>
          </div>
        </div>

        {/* Informações de Contato / Versão */}
        <div className="mt-8 text-center text-xs text-gray-500">
            <p>{t('about_version', { version: '1.0.0' })}</p>
            <p className="mt-1">© 2025 Eficácia Quotidiana Lda</p>
            <p className="mt-1">{t('about_contact_prompt')}: <a href="mailto:contact@brainboxmed.com" className="text-cyan-600 hover:underline">contact@brainboxmed.com</a></p>
        </div>

      </main>
    </div>
  );
}