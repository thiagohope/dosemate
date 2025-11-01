import React, { useMemo, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

// Fatores de Conversão para BASE (mcg/kg/min). Retorna 0 para U/mEq para forçar a lógica de cálculo não-massa.
function factorToMcgPerKgPerMin(unit, weightKg) {
  if (unit.includes("U/") || unit.includes("mEq/")) return 0; 
  
  // 1. Determina o fator de tempo (minutos)
  let factorTime = unit.includes("/h") ? 1 / 60 : 1; // Se for /h, divide por 60 para obter /min

  // 2. Determina o fator de massa (mg para mcg)
  let factorMass = unit.startsWith("mg/") ? 1000 : 1;

  // 3. Determina o fator de peso (se a dose NÃO for por kg)
  // Se a unidade não tiver /kg/, a conversão base por peso é 1 / weightKg.
  let factorWeight = 1;
  if (!unit.includes("/kg")) {
      // Se a dose for mcg/min ou mg/min, o peso se torna o divisor:
      factorWeight = 1 / (weightKg || 1); 
  }
  
  // Combina fatores para obter mcg/kg/min
  return factorTime * factorMass * factorWeight;
}
// Converte a quantidade de droga para microgramas (mcg) ou mantém a unidade original (U/mEq)
function convertToMcg(amount, unit) {
  if (!amount) return 0;
  switch (unit) {
    case 'g':
      return amount * 1000000;
    case 'mg':
      return amount * 1000;
    case 'mcg':
      return amount;
    // Não converte U/mEq para massa
    case 'U':
    case 'mEq':
    default:
      return amount; 
  }
}

export default function InfusionCalculator({ allDrugs = [] }) {
  const { t, i18n } = useTranslation();
  
  const TRIAL_DAYS = 7;
  const TRIAL_KEY = 'dosemate_trial_start';
  const PERMANENT_KEY = 'dosemate_master_license'; 
  const MASTER_KEY_SECRET = 'brainboxmed';

  // NOVO: Estado para rastrear o status do Trial na UI
  const [isTrialActive, setIsTrialActive] = useState(false);

  // 1. LÓGICA DE LICENÇA (Permanente, Master Key, ou Trial)
  const isPremium = useMemo(() => {
    if (typeof window === 'undefined') return false; 
    
    // A. Acesso Permanente (Master Key)
    if (localStorage.getItem(PERMANENT_KEY) === 'true') {
      return true;
    }

    // B. Verifica a chave mestra na URL
    const params = new URLSearchParams(window.location.search);
    const hasMasterKey = params.get('masterkey') === MASTER_KEY_SECRET;
    if (hasMasterKey) {
        return true; 
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
    
    return false;
  }, []); 
  
  // EFEITO PARA INICIAR O TRIAL ou ATIVAR A LICENÇA PERMANENTE
  useEffect(() => {
    // 1. Ativação da Licença Permanente (Master Key)
    if (isPremium && window.location.search.includes('masterkey')) {
      localStorage.setItem(PERMANENT_KEY, 'true'); 
      
      const newUrl = window.location.pathname + window.location.hash;
      window.location.replace(newUrl); 
      return;
    }
    
    // 2. Inicia o Trial (Se não tiver Trial ativo e não for Premium)
    const trialStart = localStorage.getItem(TRIAL_KEY);
    if (!trialStart && !localStorage.getItem(PERMANENT_KEY)) {
        localStorage.setItem(TRIAL_KEY, new Date().toISOString());
    }
  }, [isPremium]);

  // Calcula os dias restantes para o Trial
  const daysLeft = useMemo(() => {
      if (!isTrialActive) return 0;
      
      const trialStart = localStorage.getItem(TRIAL_KEY);
      if (!trialStart) return 0;

      const startDate = new Date(trialStart).getTime();
      const expirationDate = startDate + TRIAL_DAYS * 24 * 60 * 60 * 1000;
      const now = new Date().getTime();

      const millisecondsLeft = expirationDate - now;
      
      return Math.ceil(millisecondsLeft / (24 * 60 * 60 * 1000));
  }, [isTrialActive]);
  
  const DOSE_UNITS = [ 
    "mcg/kg/min", "mcg/kg/h", "mg/kg/min", "mg/kg/h", "mcg/min", "mg/min", "mcg/h", "mg/h",
    "U/kg/min", "U/kg/h", "U/min", "U/h",
    "mEq/kg/min", "mEq/kg/h", "mEq/min", "mEq/h"
  ];
  const formatNumber = (n, digits = 2) => {
    if (n === null || n === undefined || isNaN(n) || n === '') return "";
    const num = typeof n === 'string'
                ? parseFloat(n.replace(',', '.'))
                : Number(n);
    const fixed = num.toFixed(digits);
    if (i18n.language === 'en') {
      return fixed;
    } else {
      let localized = fixed.replace('.', ',');
      return localized.replace(/,00$/, "").replace(/(\,\d)0$/, "$1");
    }
  };

  const formatNumberForDisplay = (n, digits = 2) => {
    if (n === null || n === undefined || isNaN(n) || n === '') return "";
    const num = typeof n === 'string'
                ? parseFloat(n.replace(',', '.'))
                : Number(n);
    return num.toFixed(digits);
  };

  // -----------------------------------------------------------------------------------
  // ESTADOS
  // -----------------------------------------------------------------------------------
  const [selectedDrugSlug, setSelectedDrugSlug] = useState(allDrugs[0]?.slug || "");
  const [isCustomConc, setIsCustomConc] = useState(false);
  const [weight, setWeight] = useState("70"); 
  const [concDrugAmount, setConcDrugAmount] = useState(''); 
  const [concDrugUnit, setConcDrugUnit] = useState('mg');   
  const [concTotalVolume, setConcTotalVolume] = useState(''); 
  const [doseVal, setDoseVal] = useState("0.05");
  const [doseUnit, setDoseUnit] = useState("mcg/kg/min");
  const [mlPerH, setMlPerH] = useState("");
  
  const selectedDrug = useMemo(
    () => allDrugs.find((d) => d.slug === selectedDrugSlug),
    [selectedDrugSlug, allDrugs]
  );

  const defaultConcentration = useMemo(() => {
    if (!selectedDrug || !selectedDrug.concentrations) return null;
    return selectedDrug.concentrations.find(c => c.is_default) || selectedDrug.concentrations[0];
  }, [selectedDrug]);

  useEffect(() => {
      if (defaultConcentration) {
        setConcDrugAmount(String(defaultConcentration.drug_amount || ''));
        setConcDrugUnit(defaultConcentration.drug_unit || 'mg');
        setConcTotalVolume(String(defaultConcentration.total_volume || ''));
        setIsCustomConc(false);
      }
      if (!selectedDrugSlug && allDrugs.length > 0) {
        setSelectedDrugSlug(allDrugs[0].slug);
      }
      // Lógica para predefinir a unidade correta (U/mEq) ao selecionar a droga
      if (defaultConcentration?.drug_unit && ['U', 'mEq'].includes(defaultConcentration.drug_unit)) {
          // Assume uma unidade base U/h ou mEq/h para drogas não-massa
          const newUnit = defaultConcentration.drug_unit === 'U' ? 'U/h' : 'mEq/h';
          setDoseUnit(newUnit);
          setDoseVal('10'); // Valor padrão para U/h ou mEq/h
      } else if (defaultConcentration?.drug_unit) {
          // Volta para mcg/kg/min para drogas de massa
          setDoseUnit('mcg/kg/min');
          setDoseVal('0.05');
      }
    }, [selectedDrug, defaultConcentration, selectedDrugSlug, allDrugs]);

  const parseNumericState = (stateValue) => {
    if (stateValue === '' || stateValue === null) {
        return 0;
    }
    if (typeof stateValue === 'string') {
      return parseFloat(stateValue.replace(',', '.'));
    }
    return parseFloat(stateValue);
  };

  const handleNumericInput = (setter) => (e) => {
    let value = e.target.value.replace(',', '.');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    setter(value);
  };

  // Concentração em Unidade Base (mcg/mL, U/mL, mEq/mL)
  const baseConcentrationPerMl = useMemo(() => {
    const amount = parseNumericState(concDrugAmount);
    const volume = parseNumericState(concTotalVolume);
    const unit = concDrugUnit;
    
    if (isNaN(amount) || isNaN(volume) || volume === 0) return { value: 0, unit: '' };
    
    if (['mcg', 'mg', 'g'].includes(unit)) {
        const ugAmount = convertToMcg(amount, unit); 
        return { value: ugAmount / volume, unit: 'mcg/mL' };
    }
    else if (unit === 'U') {
        return { value: amount / volume, unit: 'U/mL' };
    }
    else if (unit === 'mEq') {
        return { value: amount / volume, unit: 'mEq/mL' };
    }
    
    return { value: 0, unit: '' };
  }, [concDrugAmount, concDrugUnit, concTotalVolume]);
  
  // Slugs das 3 drogas essenciais que SÃO GRATUITAS para cálculo
  const FREE_CALC_SLUGS = ['norepinephrine', 'midazolam', 'dopamine']; 

  // Variável para verificar se a droga atual deve ser bloqueada
  const isDrugCalculationLocked = useMemo(() => {
    // Se o usuário não for Premium E a droga não estiver na lista FREE, bloqueia.
    return !isPremium && !FREE_CALC_SLUGS.includes(selectedDrugSlug);
  }, [isPremium, selectedDrugSlug]);


// CÁLCULO PRINCIPAL (DOSE -> mL/h)
const mlh = useMemo(() => {
  if (isDrugCalculationLocked) return "🔒";

  const val = parseNumericState(doseVal);
  const w = parseNumericState(weight);
  const conc = baseConcentrationPerMl.value;
  const isMassUnit = !doseUnit.includes("U/") && !doseUnit.includes("mEq/");

  if (isNaN(val) || isNaN(conc) || conc === 0) return "";
  
  // Se a unidade for por KG e o peso for zero, retorne vazio.
  if (doseUnit.includes("/kg") && (isNaN(w) || w === 0)) return "";

  if (isMassUnit) {
    // 1. Converte a dose de entrada (val) para a unidade base / HORA (mcg/h)
    let doseInMcgPerHour = val;
    
    // Converte de mg para mcg
    if (doseUnit.startsWith("mg/")) {
        doseInMcgPerHour = doseInMcgPerHour * 1000;
    }
    // Converte de /min para /h
    if (doseUnit.includes("/min")) {
        doseInMcgPerHour = doseInMcgPerHour * 60;
    }
    
    // 2. Multiplica pelo peso (SE for por peso)
    // ESTE É O BLOCO CHAVE. Ele SÓ aplica o peso se tiver /kg.
    if (doseUnit.includes("/kg")) {
        doseInMcgPerHour = doseInMcgPerHour * w;
    }
    
    // 3. Aplica a concentração e converte para mL/h
    const result = doseInMcgPerHour / conc;
    return formatNumberForDisplay(result, 2);

  } else {
    // Lógica para U/mEq (mantida)
    let doseBasePerHour = val;
    if (doseUnit.includes("/min")) {
      doseBasePerHour = val * 60;
    }
    if (doseUnit.includes("/kg")) {
      doseBasePerHour = doseBasePerHour * w;
    }
    const result = doseBasePerHour / conc;
    return formatNumberForDisplay(result, 2);
  }
}, [doseVal, doseUnit, weight, baseConcentrationPerMl]);

// CÁLCULO INVERSO (mL/h -> DOSE)
const doseFromMlH = useMemo(() => {
  if (isDrugCalculationLocked) return "🔒";

  const val = parseNumericState(mlPerH); // ml/h
  const w = parseNumericState(weight);
  const conc = baseConcentrationPerMl.value; // unidade base/mL (ex: mcg/mL ou U/mL)
  const isMassUnit = !doseUnit.includes("U/") && !doseUnit.includes("mEq/");
  const isDoseByWeight = doseUnit.includes("/kg");

  // --- Lógica de Validação Melhorada ---
  if (isNaN(val) || isNaN(conc) || conc === 0) return "";
  if (isDoseByWeight && (isNaN(w) || w === 0)) return "";

  // 1. Calcula a quantidade TOTAL de droga infundida por HORA na unidade base (mcg/h ou U/h ou mEq/h)
  const totalBasePerHour = val * conc; 

  // 2. Remove o peso (se for uma dose /kg)
  let doseTargetPerHour = totalBasePerHour; 
  if (isDoseByWeight) {
    doseTargetPerHour = totalBasePerHour / w; 
  }
  
  // 3. Converte a dose (Base/h ou Base/kg/h) para a unidade de DOSE ALVO
  let out = doseTargetPerHour; 

  // Converte de /h para /min (se necessário)
  if (doseUnit.includes("/min")) {
    out = out / 60;
  }
  
  // Converte de mcg para mg (APENAS se for uma unidade de massa)
  if (isMassUnit && doseUnit.startsWith("mg/")) {
    out = out / 1000;
  }

  return formatNumberForDisplay(out, 2);
  
}, [mlPerH, weight, baseConcentrationPerMl, doseUnit, isDrugCalculationLocked, isPremium]);  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div 
        className="max-w-3xl mx-auto p-4 space-y-6"
        itemScope itemType="http://schema.org/SoftwareApplication"
      >
        <div className="rounded-2xl shadow-xl p-4 md:p-6 bg-white border border-gray-200">
          <h2 
            className="text-xl md:text-2xl font-bold mb-4 text-cyan-700"
            itemProp="name" 
            aria-label="Continuous Infusion Calculator"
          >
            {t('calculator_params_title')}
          </h2>
          
          {/* GRUPO 1: DROGA & CONCENTRAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Seletor de Droga */}
            <div>
              <label className="block text-sm mb-1 text-gray-600">{t('drug_label')}</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white shadow-sm"
                value={selectedDrugSlug}
                onChange={(e) => setSelectedDrugSlug(e.target.value)}
              >
                {allDrugs
                    .slice()
                    .sort((a, b) => a.drug.localeCompare(b.drug))
                    .map((d) => (
                      <option key={d.slug} value={d.slug}>{d.drug}</option>
                ))}
              </select>
            </div>

            {/* Concentração */}
            <div>
              <label className="block text-sm mb-1 text-gray-600">{t('concentration_label')}</label>
              
              {/* BLOCO DE CUSTOMIZAÇÃO (VISÍVEL SOMENTE SE PREMIUM) */}
              {(isCustomConc && isPremium) ? (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 text-gray-500">{t('amount_label')}</label>
                    <input
                      type="text"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 4"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                      value={concDrugAmount}
                      onChange={handleNumericInput(setConcDrugAmount)}
                    />
                  </div>
                  <div className="w-16">
                    <label className="block text-xs mb-1 text-gray-500">{t('unit_label')}</label>
                    <select
                      className="w-full rounded-xl border border-gray-300 px-1 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white shadow-sm"
                      value={concDrugUnit}
                      onChange={(e) => setConcDrugUnit(e.target.value)}
                    >
                      <option value="mcg">mcg</option>
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="U">U</option>
                      <option value="mEq">mEq</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs mb-1 text-gray-500">{t('volume_ml_label')}</label>
                    <input
                      type="text"
                      step="1"
                      min="1"
                      placeholder="mL"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                      value={concTotalVolume}
                      onChange={handleNumericInput(setConcTotalVolume)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomConc(false)}
                    className="p-1 text-sm text-red-600 hover:text-red-700"
                    title={t('conc_custom_hint')}
                  >
                    X
                  </button>
                </div>
              ) : (
                /* BLOCO DE VISUALIZAÇÃO (PADRÃO OU PAYWALL) */
                <div
                  className={`w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 shadow-sm ${isPremium ? 'cursor-pointer hover:border-cyan-500 transition-colors' : ''}`}
                  onClick={() => {
                    if (isPremium) {
                      setIsCustomConc(true);
                    } else {
                      // Usuário gratuito: Mostra o Paywall Alert
                      alert(t('premium_feature_alert')); 
                    }
                  }}
                  title={isPremium ? t('conc_custom_hint') : t('premium_feature_locked')}
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {defaultConcentration?.label || t('default_concentration_label')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('', {
                      amount: formatNumber(concDrugAmount, 3), 
                      unit: concDrugUnit,
                      volume: formatNumber(concTotalVolume, 0),
                    })}
                    ({t('concentration_label')}: {formatNumber(baseConcentrationPerMl.value, 0)} {baseConcentrationPerMl.unit}) 
                  </p>
                  <span 
                    className={`text-xs ml-2 font-medium`} 
                    style={{ color: isPremium ? 'var(--primary-color)' : 'var(--subtle-color)' }}
                  >
                    ({isPremium ? t('edit') : t('upgrade_to_edit')})
                  </span>
                </div>
              )}
            </div>
          </div>  
          {/* GRUPO 2: PESO */}
          <div className="flex justify-center md:justify-start mb-6 border-b pb-4 border-gray-200">
            <div className="w-full max-w-[150px]">
              <label className="block text-sm mb-1 text-gray-600">{t('weight_kg_label')}</label>
              <input
                type="text"
                step="0.1"
                min="1"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                value={weight}
                onChange={handleNumericInput(setWeight)}
              />
            </div>
          </div>
          
          {/* GRUPO 3: CÁLCULOS PRINCIPAIS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Coluna Esquerda: Dose & Resultado Direto */}
            <div className="space-y-4">
              {/* Dose */}
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-3">
                  <label className="block text-sm mb-1 text-gray-600">{t('dose_label')}</label>
                  <input
                    type="text"
                    step="0.001"
                    min="0"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                    value={doseVal}
                    onChange={handleNumericInput(setDoseVal)}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white shadow-sm"
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                  >
                    {DOSE_UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
              </div>

              {/* Área de Resultado */}
              <div 
                className={`p-4 rounded-2xl flex flex-col md:flex-row gap-3 md:items-center md:justify-between border ${isDrugCalculationLocked ? 'bg-red-50 border-red-300 cursor-pointer' : 'bg-cyan-100 border-cyan-300'}`}
                onClick={() => {
                  if (isDrugCalculationLocked) {
                    alert(t('premium_feature_alert'));
                  }
                }}
              >
                <div>
                  <div className="text-sm text-cyan-700 font-medium">{t('infusion_rate_label')}</div>
                  <div className="text-2xl font-bold" style={{ color: isDrugCalculationLocked ? '#dc2626' : '#0891b2' }}>
                    {mlh || "—"} <span className="text-base font-normal">mL/h</span>
                  </div>
                </div>
                {/* Os botões de link/copiar devem ser bloqueados também */}
                <div className="flex gap-2">
                  <Link 
                    to={`/med/${selectedDrug?.slug}`} 
                    className={`px-4 py-2 rounded-xl font-medium shadow-sm ${isDrugCalculationLocked ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-white text-cyan-600 border border-cyan-600 hover:bg-gray-50 transition-colors'}`}
                    style={{ pointerEvents: isDrugCalculationLocked ? 'none' : 'auto' }}
                  >
                    {t('drug_page_link')}
                  </Link>
                  <button
                    className={`px-4 py-2 rounded-xl font-medium shadow-md ${isDrugCalculationLocked ? 'bg-gray-400 text-white cursor-default' : 'bg-cyan-600 text-white hover:bg-cyan-700 transition-colors'}`}
                    onClick={() => {
                       if (isDrugCalculationLocked) {
                          alert(t('premium_feature_alert'));
                       } else {
                          // TODO: Add copy functionality here if needed.
                       }
                    }}
                    disabled={isDrugCalculationLocked}
                  >
                    {t('copy_button')}
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Cálculo Inverso - PREMIUM FEATURE */}
            <div className="space-y-4">
              <div 
                className={`border border-gray-200 p-4 rounded-2xl shadow-sm bg-white ${!isPremium ? 'opacity-50 cursor-pointer' : ''}`}
                onClick={() => {
                    if (!isPremium) {
                        alert(t('premium_feature_alert'));
                    }
                }}
              >
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-cyan-700">
                  {t('inverse_calc_title')}
                </h3>
                
                {!isPremium && (
                  <p className="text-red-500 font-bold mb-3">{t('upgrade_to_edit')}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-sm mb-1 text-gray-600">{t('ml_per_h_label')}</label>
                    <div className="max-w-xs">
                      <input
                        type="text"
                        step="0.01"
                        min="0"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                        value={mlPerH || ""}
                        onChange={handleNumericInput(setMlPerH)}
                        disabled={!isPremium}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <div className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50">
                      <div className="text-sm text-gray-500">{t('resulting_dose_label')}</div>
                      <div className="text-xl font-bold text-gray-700">
                        {isPremium ? (doseFromMlH || "—") : "🔒"} {doseUnit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>          
          </div>
          
          {/* Bloco de Aviso */}
          <div className="mt-8 text-xs text-gray-600 leading-relaxed p-3 bg-red-50 rounded-lg border border-red-300">
            <p className="font-semibold text-red-700">⚠️ {t('professional_warning_title')}</p>
            <p className="mt-1">{t('professional_warning_message')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}