import { Link } from 'react-router-dom';
import React, { useMemo, useState, useEffect } from "react";
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

function PillButton({ children, to, variant = "primary" }) {
  const styles = variant === "primary"
    ? { background: brand.primary, color: "#fff", border: `1px solid ${brand.primary}` }
    : { background: "#fff", color: brand.primary, border: `1px solid ${brand.primary}` };
  return (
    <Link to={to} className="inline-flex items-center justify-center px-4 py-3 rounded-2xl font-semibold" style={styles}>
      {children}
    </Link>
  );
}

export default function DoseMateHome({ allDrugs = [], isFullList = false }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const TRIAL_DAYS = 7;
  const TRIAL_KEY = 'dosemate_trial_start';
  const PERMANENT_KEY = 'dosemate_master_license'; 
  const MASTER_KEY_SECRET = 'brainboxmed';

  // 1. LÓGICA DE LICENÇA (Permanente, Master Key, ou Trial)
  const [isTrialActive, setIsTrialActive] = useState(false);

  const isPremium = useMemo(() => {
    if (typeof window === 'undefined') return false; 
    
    // A. Acesso Permanente (Master Key)
    if (localStorage.getItem(PERMANENT_KEY) === 'true') {
      return true;
    }

    // B. Verifica a chave mestra na URL (Uso único para ativar a licença permanente)
    const params = new URLSearchParams(window.location.search);
    const hasMasterKey = params.get('masterkey') === MASTER_KEY_SECRET;
    if (hasMasterKey) {
        return true; // Ativa temporariamente até que o useEffect salve e recarregue
    }

    // C. Verifica o Trial (Se não tiver licença permanente)
    const trialStart = localStorage.getItem(TRIAL_KEY);
    if (trialStart) {
        const startDate = new Date(trialStart).getTime();
        const expirationDate = startDate + TRIAL_DAYS * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        
        const isActive = now < expirationDate;
        setIsTrialActive(isActive);
        return isActive;
    }
    
    return false; // Usuário não é Premium nem Trial
  }, []); 

// 2. EFEITO PARA INICIAR O TRIAL ou ATIVAR A LICENÇA PERMANENTE
useEffect(() => {
  // 1. Ativação da Licença Permanente (Master Key)
  // Comentário: A Master Key deve ser validada e removida ANTES de qualquer outra coisa.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('masterkey') === MASTER_KEY_SECRET) {
    // Comentário: Master Key encontrada e validada.
    localStorage.setItem(PERMANENT_KEY, 'true'); 
    
    // Comentário: Limpa a URL e recarrega a página no caminho base para garantir que a chave não fique.
    // Isso garante a "segurança de acesso único" impedindo o compartilhamento do link secreto.
    window.location.replace(window.location.pathname + window.location.hash); 
    return; // Para o restante do código.
  }
  
  // 2. Inicia o Trial (Se não tiver Trial ativo e não for Premium)
  const trialStart = localStorage.getItem(TRIAL_KEY);
  if (!trialStart && !localStorage.getItem(PERMANENT_KEY) && !isPremium) {
      localStorage.setItem(TRIAL_KEY, new Date().toISOString());
      // Comentário: O próximo render lerá o estado do Trial
  }
}, [isPremium]); // Depende de isPremium para garantir que o Trial não inicie se for Master Key
  
  // LÓGICA DO FILTRO DE MEDICAMENTOS (Limita a 5 se não for Premium)
  const drugListToShow = useMemo(() => {

    // Permite a lista completa se for Premium OU se estiver na rota /med
    if (isPremium || isFullList) {
        return allDrugs; 
    }
    // Usa apenas as primeiras 5 drogas para usuários FREE (as "iscas")
    return allDrugs.slice(0, 5); 
  }, [allDrugs, isFullList, isPremium]);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // 1. Filtra a lista visível (limitada a 5 se não for premium)
    const filteredDrugs = drugListToShow.filter(d => d.drug && d.drug.toLowerCase().includes(q));

    // 2. Ordena alfabeticamente
    return filteredDrugs.sort((a, b) => {
      if (a.drug < b.drug) return -1;
      if (a.drug > b.drug) return 1;
      return 0;
    });

  }, [query, drugListToShow]);
  return (
    <div className="min-h-screen" style={{ background: brand.bg, color: brand.text }}>
     <Navbar />

        {/* Hero / CTA Principal e Metadados SEO (AGORA É UM LINK GRANDE) */}
              <section 
                className="max-w-3xl mx-auto px-4 py-6"
                itemScope itemType="http://schema.org/SoftwareApplication" 
                >
                
                  {/* Cartão principal agora é um LINK. Hover/Active simula um botão, tornando-o PROEMINENTE. */}
                  <Link 
                    to="/calculator" 
                    // O hover, o active (clique) e a transição dão o efeito de botão
                    className="block rounded-3xl p-5 md:p-6 shadow-xl border hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300" 
                    style={{ 
                        background: brand.card, 
                        borderColor: brand.primary, 
                        cursor: 'pointer',
                    }}
                    aria-label="Open DoseMate Free Calculator"
                  >
                  {/* 1. TÍTULO E DESCRIÇÃO DE ASO/UX */}
                  <div className="text-center">
                    <h1 
                      className="text-3xl font-extrabold mb-2" 
                      style={{ color: brand.primaryDark }}
                      itemProp="name"
                      aria-label="DoseMate Continuous Infusion Calculator"
                    >
                      {t('home_title')}
                    </h1>
                    <p 
                      className="text-lg font-medium" // Aumenta o destaque da descrição para o usuário FREE
                      style={{ color: brand.subtle }}
                      itemProp="description"
                    >
                      {t('home_subtitle_converted')} 
                    </p>
                  </div>
                </Link>
              </section>

        {/* Bloco de Publicidade / Cross-Promotion BrainboxMed */}
      <section className="max-w-3xl mx-auto px-4 py-4"> 
        <a 
          href="https://www.brainboxmed.com"
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full rounded-3xl p-5 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] border border-transparent" 
          style={{ background: '#5e3e94', color: '#fff' }}
          aria-label="Access BrainboxMed Question Bank"
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

      {/* Banco de Drogas / Pesquisa Rápida */}
      <section className="max-w-3xl mx-auto px-4 pb-4">
        <div className="rounded-3xl p-5 shadow-sm border" style={{ background: brand.card, borderColor: brand.line }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold">{t('drug_database_title')}</h2>
            <Link to="/med" className="text-sm font-semibold" style={{ color: brand.primary }}>{t('view_all_link')}</Link>
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
                <Link to={d.detail_path || `/med/${d.slug}`} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{d.drug}</div>
                    <div className="text-xs text-gray-500 truncate">{t('drug_list_concentration_details')}</div>
                  </div>
                  <div className="text-gray-400"><ChevronRight /></div>
                </Link>
              </li>
            ))}
          </ul>      
        </div>
      </section>

      {/* Links Rápidos */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/calculator" 
            className="rounded-3xl p-4 text-center font-semibold" 
            style={{ background: brand.card, border: `1px solid ${brand.line}` }}
            itemProp="feature" 
            aria-label="Infusion Rate Calculator"
          >
            {t('nav_calculator')}
          </Link>
          <Link 
            to="/med" 
            className="rounded-3xl p-4 text-center font-semibold" 
            style={{ background: brand.card, border: `1px solid ${brand.line}` }}
            itemProp="feature" 
            aria-label="Drug Database"
          >
            {t('nav_drug_database')}
          </Link>
        </div>
      </section>
    </div>
  );
}

