import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import icon from './assets/icon.png';
import Navbar from './Navbar';

const brand = {
  primary: "#31B4D3",
  primaryDark: "#1D90AB",
  bg: "#F9FBFC",
  card: "#FFFFFF",
  line: "#E6F4F8",
  text: "#0F172A",
  subtle: "#6B7280",
};

function ChevronRight({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PillButton({ children, href, variant = "primary" }) {
  const styles = variant === "primary"
    ? { background: brand.primary, color: "#fff", border: `1px solid ${brand.primary}` }
    : { background: "#fff", color: brand.primary, border: `1px solid ${brand.primary}` };
  return (
    <a href={href} className="inline-flex items-center justify-center px-4 py-3 rounded-2xl font-semibold" style={styles}>
      {children}
    </a>
  );
}

export default function DoseMateHome({ allDrugs = [], isFullList = false }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Se for a rota /med (isFullList=true) e não houver pesquisa (q), ele exibe todas as drogas.
    const listToFilter = allDrugs; 
    
    // 1. Filtrar
    const filteredDrugs = allDrugs.filter(d => d.drug && d.drug.toLowerCase().includes(q));

    // 2. Ordenar alfabeticamente pelo nome da droga ('drug')
    return filteredDrugs.sort((a, b) => {
      if (a.drug < b.drug) return -1;
      if (a.drug > b.drug) return 1;
      return 0;
    });

  }, [query, allDrugs, isFullList]);

  return (
    <div className="min-h-screen" style={{ background: brand.bg, color: brand.text }}>
     <Navbar />

      {/* Hero / Primary CTA e Metadados SEO */}
      <section 
        className="max-w-3xl mx-auto px-4 py-6"
        // COMENTÁRIO SEO: Schema.org principal para a Home, identificando o site como a landing page do App
        itemScope itemType="http://schema.org/SoftwareApplication" 
        >
        <div className="rounded-3xl p-5 md:p-6 shadow-sm border" style={{ background: brand.card, borderColor: brand.line }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              {/* H1 com palavras-chave de ASO e nome do produto */}
              <h1 
                className="text-2xl md:text-3xl font-bold mb-1" 
                style={{ color: brand.primaryDark }}
                itemProp="name" // Nome do Aplicativo
                aria-label="DoseMate Continuous Infusion Calculator"
              >
                {t('home_title')}
              </h1>
              {/* Descrição curta para SEO/ASO */}
              <p 
                className="text-sm md:text-base" 
                style={{ color: brand.subtle }}
                itemProp="description"
              >
                {t('home_subtitle')}
              </p>
            </div>
          </div>

          {/* Ícones de loja lado a lado, sem texto traduzido (pois o ícone já é a CTA) */}
            <div className="flex flex-row items-center justify-center gap-3"> 
              <a 
                href="[LINK_APP_STORE]" 
                aria-label="Download on Apple App Store" // em inglês para ASO/SEO
                className="transition-transform hover:scale-[1.05] active:scale-[0.98]"
              >
                {/* Aumentando a altura da imagem de h-10 para h-14 (56px) */}
                <img src="/assets/apple_store_badge.svg" alt="Baixar na Apple App Store" className="h-14" /> 
              </a>
              <a 
                href="[LINK_PLAY_STORE]" 
                aria-label="Download on Google Play Store" // em inglês para ASO/SEO
                className="transition-transform hover:scale-[1.05] active:scale-[0.98]"
              >
                {/* Aumentando a altura da imagem de h-10 para h-14 (56px) */}
                <img src="/assets/google_play_badge.svg" alt="Baixar no Google Play" className="h-14" />
              </a>
            </div>
          </div>
      </section>

      {/* Bloco de Publicidade / Cross-Promotion BrainboxMed - Inserido entre Calculator e Database */}
      <section className="max-w-3xl mx-auto px-4 py-4"> 
        <a 
          href="[www.brainboxmed.com]"
          className="block w-full rounded-3xl p-5 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] border border-transparent" 
          style={{ background: '#5e3e94', color: '#fff' }} // Cor principal do Brainbox
          aria-label="Access BrainboxMed Question Bank" // em inglês para ASO/SEO
        >
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-semibold mb-1 opacity-80">{t('ad_brainbox_promo')}</p>
            <h3 className="text-2xl font-extrabold tracking-tight">
              Brainbox<span style={{ color: '#f39c12' }}>Med</span> 
              <sup className="text-sm font-semibold ml-1">™</sup>
            </h3>
            <p className="mt-2 text-sm font-medium">{t('ad_brainbox_cta')}</p>
          </div>
        </a>
      </section>

      {/* Database / Quick search */}
      <section className="max-w-3xl mx-auto px-4 pb-4">
        <div className="rounded-3xl p-5 shadow-sm border" style={{ background: brand.card, borderColor: brand.line }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold">{t('drug_database_title')}</h2>
            <a href="/med" className="text-sm font-semibold" style={{ color: brand.primary }}>{t('view_all_link')}</a>
          </div>

          <div className="mb-4">
            <input
              type="search"
              placeholder={t('search_placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border outline-none"
              style={{ borderColor: brand.line, background: brand.bg }}
            />
          </div>

          <ul className="divide-y" style={{ borderColor: brand.line }}>
            {filtered.map((d) => (
              <li key={d.slug}>
                <a href={d.detail_path || `/med/${d.slug}`} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{d.drug}</div>
                    <div className="text-xs text-gray-500 truncate">{t('drug_list_concentration_details')}</div>
                  </div>
                  <div className="text-gray-400"><ChevronRight /></div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

{/* Quick links - Otimizados para Schema/ASO */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="/calculator" 
            className="rounded-3xl p-4 text-center font-semibold" 
            style={{ background: brand.card, border: `1px solid ${brand.line}` }}
            itemProp="feature" 
            aria-label="Infusion Rate Calculator" // em inglês
          >
            {t('nav_calculator')}
          </a>
          <a 
            href="/med" 
            className="rounded-3xl p-4 text-center font-semibold" 
            style={{ background: brand.card, border: `1px solid ${brand.line}` }}
            itemProp="feature" 
            aria-label="Drug Database" // em inglês
          >
            {t('nav_drug_database')}
          </a>
        </div>
      </section>

      {/* Bottom Tab (app-like) - Refatorado para Tailwind puro */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto grid grid-cols-4 text-sm text-gray-500">
          
          {/* 1. CALCULADORA */}
          <a href="/calculator" className="flex flex-col items-center py-2 text-cyan-600 font-semibold hover:text-cyan-600 transition-colors">
            <span>{t('nav_calc_short')}</span>
          </a>
          
          {/* 2. DROGAS */}
          <a href="/med" className="flex flex-col items-center py-2 hover:text-cyan-600 transition-colors">
            <span>{t('nav_drugs')}</span>
          </a>
          
          {/* 3. MATRIZ */}
          <a href="/matrix" className="flex flex-col items-center py-2 hover:text-cyan-600 transition-colors">
            <span>{t('nav_matrix')}</span>
          </a>
          
          {/* 4. CONFIGURAÇÕES */}
          <a href="/settings" className="flex flex-col items-center py-2 hover:text-cyan-600 transition-colors">
            <span>{t('nav_settings')}</span>
          </a>
        </div>
      </nav>    
    </div>
  );
}