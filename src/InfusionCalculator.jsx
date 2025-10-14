// src/InfusionCalculator.jsx
// Componente principal para o cálculo de infusão contínua.
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

// Fatores de Conversão para BASE (mcg/kg/min) - Retorna 0 para unidades de Unidades/mEq
// Isso força o useMemo a usar a lógica de cálculo específica (não-massa).
function factorToMcgPerKgPerMin(unit, weightKg) {
  // Se a unidade for U/mEq, retorna 0 para forçar o cálculo na lógica não-massa.
  if (unit.includes("U/") || unit.includes("mEq/")) return 0; 
  
  switch (unit) {
    case "mcg/kg/min":
      return 1;
    case "mcg/kg/h":
      return 1 / 60;
    case "mg/kg/min":
      return 1000;
    case "mg/kg/h":
      return 1000 / 60;
    case "mcg/min":
      return 1 / (weightKg || 1);
    case "mg/min":
      return 1000 / (weightKg || 1);
    default:
      return 1;
  }
}

// Converte a quantidade de droga para microgramas (mcg) ou mantém a unidade (U/mEq)
function convertToMcg(amount, unit) {
  if (!amount) return 0;
  switch (unit) {
    case 'g':
      return amount * 1000000;
    case 'mg':
      return amount * 1000;
    case 'mcg':
      return amount;
    // NÃO CONVERTE U/mEq para massa
    case 'U':
    case 'mEq':
    default:
      return amount; 
  }
}

export default function InfusionCalculator({ allDrugs = [] }) {
  const { t, i18n } = useTranslation();
  
  // UNIDADES DE DOSE SUPORTADAS (Massa, Unidade, Eletrolítica)
  const DOSE_UNITS = [ 
    "mcg/kg/min", "mcg/kg/h", "mg/kg/min", "mg/kg/h", "mcg/min", "mg/min",
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

  // -----------------------------------------------------------------------------------
  // ESTADOS
  // -----------------------------------------------------------------------------------
  const [selectedDrugSlug, setSelectedDrugSlug] = useState(allDrugs[0]?.slug || "");
  const [isCustomConc, setIsCustomConc] = useState(false);
  // CORREÇÃO: Usar o peso padrão (mantido em "70" por enquanto)
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
    // Lógica para predefinir a unidade correta (U/mEq) ao selecionar a droga:
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
    
    // 1. Unidades de Massa (mcg, mg, g) -> Retorna mcg/mL
    if (['mcg', 'mg', 'g'].includes(unit)) {
        const ugAmount = convertToMcg(amount, unit); 
        return { value: ugAmount / volume, unit: 'mcg/mL' };
    }
    // 2. Unidades Não-Massa (U, mEq) -> Retorna U/mL ou mEq/mL
    else if (unit === 'U') {
        return { value: amount / volume, unit: 'U/mL' };
    }
    else if (unit === 'mEq') {
        return { value: amount / volume, unit: 'mEq/mL' };
    }
    
    return { value: 0, unit: '' };
  }, [concDrugAmount, concDrugUnit, concTotalVolume]);
  
  
  // CÁLCULO PRINCIPAL (DOSE -> mL/h)
  const mlh = useMemo(() => {
    const val = parseNumericState(doseVal);
    const w = parseNumericState(weight);
    const conc = baseConcentrationPerMl.value;
    const isMassUnit = !doseUnit.includes("U/") && !doseUnit.includes("mEq/");
    
    if (isNaN(val) || isNaN(w) || isNaN(conc) || w === 0 || conc === 0) return "";
    
    if (isMassUnit) {
      // LÓGICA PARA UNIDADES DE MASSA (mcg/kg/min, etc.)
      const f = factorToMcgPerKgPerMin(doseUnit, w);
      // Fórmula: mL/h = (Dose * Fator * Peso * 60) / Conc(mcg/mL)
      const result = (val * f * w * 60) / conc;
      return formatNumber(result, 2);
      
    } else {
      // LÓGICA PARA UNIDADES NÃO-MASSA (U/h, mEq/min, etc.)
      // 1. Determinar a Dose Base por HORA (U/h ou mEq/h)
      let doseBasePerHour = val;
      if (doseUnit.includes("/min")) {
          doseBasePerHour = val * 60;
      }
      if (doseUnit.includes("/kg")) {
          doseBasePerHour = doseBasePerHour * w;
      }
      
      // 2. Fórmula: mL/h = Dose Base por Hora / Conc(U/mL ou mEq/mL)
      const result = doseBasePerHour / conc;
      return formatNumber(result, 2);
    }
  }, [doseVal, doseUnit, weight, baseConcentrationPerMl]);
  
  
  // CÁLCULO INVERSO (mL/h -> DOSE)
  const doseFromMlH = useMemo(() => {
    const val = parseNumericState(mlPerH);
    const w = parseNumericState(weight);
    const conc = baseConcentrationPerMl.value;
    const isMassUnit = !doseUnit.includes("U/") && !doseUnit.includes("mEq/");

    if (isNaN(val) || isNaN(w) || isNaN(conc) || w === 0 || conc === 0) return "";

    if (isMassUnit) {
        // LÓGICA PARA UNIDADES DE MASSA (mcg/kg/min, etc.)
        // 1. Calcular Dose Base em mcg/kg/min
        const baseMcgPerKgPerMin = (val * conc) / (w * 60);
        let out = baseMcgPerKgPerMin;
        
        // 2. Aplicar Fator Inverso para a unidade de destino
        switch (doseUnit) {
          case "mcg/kg/h": out = baseMcgPerKgPerMin * 60; break;
          case "mg/kg/min": out = baseMcgPerKgPerMin / 1000; break;
          case "mg/kg/h": out = (baseMcgPerKgPerMin * 60) / 1000; break;
          case "mcg/min": out = baseMcgPerKgPerMin * w; break;
          case "mg/min": out = (baseMcgPerKgPerMin * w) / 1000; break;
          default: out = baseMcgPerKgPerMin; // mcg/kg/min
        }
        return formatNumber(out, 3);
        
    } else {
        // LÓGICA PARA UNIDADES NÃO-MASSA (U/h, mEq/min, etc.)
        // 1. Calcular Dose Base por HORA (U/h ou mEq/h)
        // Dose Base por Hora = mL/h * Conc(U/mL ou mEq/mL)
        let doseBasePerHour = val * conc; 
        let out = doseBasePerHour;
        
        // 2. Aplicar Fator Inverso para a unidade de destino
        if (doseUnit.includes("/kg")) {
            out = out / w;
        }
        if (doseUnit.includes("/min")) {
            out = out / 60;
        }
        
        // 3. O 'out' agora é a dose na unidade de destino (ex: U/kg/min ou mEq/h)
        return formatNumber(out, 3);
    }
  }, [mlPerH, weight, baseConcentrationPerMl, doseUnit]);

  // NOVO LAYOUT COMEÇA AQUI
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 space-y-6">{/* Container principal do conteúdo */}
        <div className="rounded-2xl shadow-xl p-4 md:p-6 bg-white border border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-cyan-700">
            {t('calculator_params_title')}
          </h2>
          {/* ----------------------------------------------------------------------------------- */}
          {/* GRUPO 1: DROGA & CONCENTRAÇÃO (2 COLUNAS) */}
          {/* ----------------------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* SELETOR DE DROGA */}
            <div>
              <label className="block text-sm mb-1 text-gray-600">{t('drug_label')}</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-cyan-600 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white shadow-sm"
                value={selectedDrugSlug}
                onChange={(e) => setSelectedDrugSlug(e.target.value)}
              >
                {allDrugs
                    .slice() // Cria uma cópia para não modificar o array original
                    .sort((a, b) => a.drug.localeCompare(b.drug)) // Ordena alfabeticamente
                    .map((d) => (
                      <option key={d.slug} value={d.slug}>{d.drug}</option>
                ))}
              </select>
            </div>
            {/* CONCENTRAÇÃO (3 CAMPOS) */}
            <div>
              <label className="block text-sm mb-1 text-gray-600">{t('concentration_label')}</label>
              {isCustomConc ? (
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
                      // NOVAS UNIDADES DE CONCENTRAÇÃO
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
                <div
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 cursor-pointer hover:border-cyan-500 transition-colors shadow-sm"
                  onClick={() => setIsCustomConc(true)}
                  title={t('conc_custom_hint')}
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
                  <span className="text-xs text-cyan-600 ml-2 font-medium">({t('edit')})</span>
                </div>
              )}
            </div>
          </div>
          {/* FIM: GRUPO 1 */}
          {/* ----------------------------------------------------------------------------------- */}
          {/* GRUPO 2: PESO (CENTRALIZADO E SOZINHO) */}
          {/* ----------------------------------------------------------------------------------- */}
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
          {/* FIM: GRUPO 2 */}
          {/* ----------------------------------------------------------------------------------- */}
          {/* GRUPO 3: CÁLCULOS PRINCIPAIS (DOSE, RESULTADO, INVERSO) (GRID 2 COLUNAS) */}
          {/* ----------------------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUNA ESQUERDA: DOSE & RESULTADO DIRETO */}
            <div className="space-y-4">
              {/* DOSE */}
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
              {/* ÁREA DE RESULTADO (Cálculo Direto) - DESTAQUE */}
              <div className="p-4 rounded-2xl flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-cyan-100 border border-cyan-300">
                <div>
                  <div className="text-sm text-cyan-700 font-medium">{t('infusion_rate_label')}</div>
                  <div className="text-2xl font-bold text-cyan-800">
                    {mlh || "—"} <span className="text-base font-normal">mL/h</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`/med/${selectedDrug?.slug}`} className="px-4 py-2 rounded-xl font-medium bg-white text-cyan-600 border border-cyan-600 hover:bg-gray-50 transition-colors shadow-sm">{t('drug_page_link')}</a>
                  <button
                    className="px-4 py-2 rounded-xl text-white font-medium bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-md"
                    onClick={() => {
                       const tempInput = document.createElement('input');
                       tempInput.value = `${mlh} mL/h`;
                       document.body.appendChild(tempInput);
                       tempInput.select();
                       document.execCommand('copy');
                       document.body.removeChild(tempInput);
                       console.log('Copiado para o clipboard:', `${mlh} mL/h`);
                    }}
                  >
                    {t('copy_button')}
                  </button>
                </div>
              </div>
            </div>
            {/* COLUNA DIREITA: CÁLCULO INVERSO (Simétrico) */}
            <div className="space-y-4">
              {/* CÁLCULO INVERSO */}
              <div className="border border-gray-200 p-4 rounded-2xl shadow-sm bg-white">
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-cyan-700">
                  {t('inverse_calc_title')}
                </h3>
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
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <div className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50">
                      <div className="text-sm text-gray-500">{t('resulting_dose_label')}</div>
                      <div className="text-xl font-bold text-gray-700">
                        {doseFromMlH || "—"} {doseUnit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Espaço vazio para simetria visual com o bloco de resultado direto */}
              <div className="hidden lg:block h-24"></div>
            </div>
            {/* FIM COLUNA DIREITA */}
          </div>
          {/* FIM: GRUPO PRINCIPAL */}
          {/* BLOCO AVISO */}
          <div className="mt-8 text-xs text-gray-600 leading-relaxed p-3 bg-red-50 rounded-lg border border-red-300">
            <p className="font-semibold text-red-700">⚠️ {t('professional_warning_title')}</p>
            <p className="mt-1">{t('professional_warning_message')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}