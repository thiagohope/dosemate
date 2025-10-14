// src/DrugDetailPage.jsx
// Drug detail page component.

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar'; 

// Function to format numbers, ensuring it's self-contained and handles i18n logic.
const formatNumber = (n, i18n, digits = 2) => {
  if (n === null || n === undefined || isNaN(n) || n === '') return "";
  const num = typeof n === 'string' ? parseFloat(n.replace(',', '.')) : Number(n);
  const fixed = num.toFixed(digits);
  
  if (i18n?.language === 'en') {
    return fixed; 
  } else {
    let localized = fixed.replace('.', ',');
    // Keeps 0 for volume and 2-3 for precision, but uses comma
    return localized.replace(/,00$/, "").replace(/(\,\d)0$/, "$1"); 
  }
};

// Normaliza símbolo de micrograma para "mcg"
const normalizeMicro = (val) => {
  if (val == null) return val;
  const s = String(val);
  // Substitui "µg" (U+00B5) e "μg" (U+03BC) por "mcg"
  return s.replace(/(µ|μ)\s*g/gi, 'mcg');
};

// Map colors to clinical drug categories for subtle visual cues.
const CATEGORY_COLORS = {
  vasoactive: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
  snc:       { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  cardio:    { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  electrolytes: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300' },
  antibiotic: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  other:     { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  default:   { bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200' },
};

export default function DrugDetailPage({ allDrugs = [] }) {
  const { t, i18n } = useTranslation(); // Necessary to use t() and i18n
  const { slug } = useParams(); // Gets the slug (identifier) of the drug from the URL

  // Filters the complete list to find the matching drug
  const drug = useMemo(
    () => allDrugs.find((d) => d.slug === slug),
    [slug, allDrugs]
  );
  
  // Find the appropriate style based on drug category
  const drugStyle = CATEGORY_COLORS[drug?.category?.toLowerCase()] || CATEGORY_COLORS.default;

  if (!drug) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <main className="max-w-3xl mx-auto py-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-red-600">{t('drug_not_found')}</h1>
          <p className="mt-4 text-gray-600">{t('drug_not_found_message', { slug })}</p>
          <a href="/" className="mt-6 inline-block text-cyan-600 hover:underline">
            {t('back_to_home')}
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
      {/* Navigational Links for Other Drugs (Nova Sessão - Scroll Horizontal) */}
        {/* Movido para fora do container principal para maior visibilidade */}
        <div className="mb-8"> 
            {/* Container com scroll horizontal */}
            <div className="flex flex-nowrap overflow-x-auto gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200 hide-scrollbar">
                {allDrugs
                    .slice() // Cria uma cópia para não modificar o array original
                    .sort((a, b) => a.drug.localeCompare(b.drug)) // Ordena alfabeticamente
                    .map((d) => (
                  <Link
                    key={d.slug}
                    to={`/med/${d.slug}`}
                    className={`flex-shrink-0 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap transition duration-150 ${
                    d.slug === slug 
                        ? 'bg-cyan-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300' 
                    }`}
                >
                    {d.drug}
                </Link>
                ))}
            </div>
        </div>
        
        {/* Main drug container (Applies subtle conditional background color) */}
        <div className={`shadow-xl rounded-lg overflow-hidden border ${drugStyle.bg} p-6`}>
          
          {/* Main Title */}
          <h1 className={`text-4xl font-extrabold ${drugStyle.text} mb-2`}>
            {drug.drug}
          </h1>
          <p className="text-sm text-gray-500 mb-6 border-b pb-4">
            {t('drug_detail_generic_name', { name: drug.generic_name || 'N/A' })}
          </p>

          {/* Concentrations Section */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            {t('drug_detail_concentrations')}
          </h2>
          
          <div className="space-y-4">

{/* Lists standard concentrations from JSON */}
            {drug.concentrations && drug.concentrations.map((conc, index) => {
              // Lida com nomes de propriedades inconsistentes para unidades por mL
              const unitsPerMl = conc.U_per_ml || conc.U_per_mL;

              return (
                <div key={index} className={`bg-white border ${drugStyle.border} rounded-lg p-4 flex justify-between items-center`}>
                  <div>
                    <p className="font-semibold text-lg text-cyan-800">
                      {conc.label || 
                          `${formatNumber(conc.drug_amount, i18n, 3)} ${normalizeMicro(conc.drug_unit)} in ${formatNumber(conc.total_volume, i18n, 0)} mL`
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('drug_detail_diluent')}: {t(conc.diluent) || t('diluent_default')}
                    </p>

                    {/* Determina a concentração por volume a ser exibida (mEq/mL, U/mL ou mcg/mL) */}
                    {conc.mEq_per_ml > 0 ? (
                      <p className="text-xs text-gray-500 mt-1">
                        ({t('drug_detail_mEq_per_ml')}: {formatNumber(conc.mEq_per_ml, i18n, 2)} mEq/mL)
                      </p>
                    ) : unitsPerMl > 0 ? (
                      <p className="text-xs text-gray-500 mt-1">
                        ({t('drug_detail_units_per_ml')}: {formatNumber(unitsPerMl, i18n, 0)} U/mL)
                      </p>
                    ) : conc.mcg_per_ml > 0 && (
                      /* Exibe mcg/mL APENAS se o valor for > 0 */
                      <p className="text-xs text-gray-500 mt-1">
                        ({t('drug_detail_ug_per_ml')}: {formatNumber(conc.mcg_per_ml, i18n, 0)} mcg/mL)
                      </p>
                    )}
                  </div>
                  {conc.is_default && (
                    <span className="text-xs font-medium bg-cyan-600 text-white px-3 py-1 rounded-full">
                      {t('default_label')}
                    </span>
                  )}
                </div>
              );
            })}
            {!drug.concentrations && (
              <p className="text-gray-500">{t('no_concentrations_available')}</p>
            )}
          </div>
       
          {/* Dosing and Information Section */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 border-b pb-2">
            {t('drug_detail_dosing_info')}
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed"> 
            
            {/* 1. FAIXA DE DOSE (DOSE RANGE) - DESTAQUE */}
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-300 shadow-sm">
                <p className="font-extrabold text-cyan-800">
                    {t('drug_detail_dose_range')}:&nbsp; 
                    <span className="font-normal">{t(drug.dose_range) || t('info_not_specified')}</span>
                </p>
            </div>
            
            {/* 2. Compatibilidade com Diluentes */}
            <p>
              <span className="font-semibold">{t('drug_detail_diluent_compatibility')}:&nbsp;</span> 
              {t(drug.diluent_compatibility) || t('info_not_specified')}
            </p>
            
            {/* 3. Compatibilidade no Sítio de Infusão */}
            <p>
              <span className="font-semibold">{t('drug_detail_site_compatibility')}:&nbsp;</span> 
              {t(drug.site_compatibility) || t('info_not_specified')}
            </p>
            
            {/* 4. Estabilidade da Solução */}
            <p>
              <span className="font-semibold">{t('drug_detail_stability')}:&nbsp;</span> 
              {t(drug.stability) || t('info_not_specified')}
            </p>
            
            {/* 5. Monitoramento */}
            <p>
              <span className="font-semibold">{t('drug_detail_monitoring')}:&nbsp;</span> 
              {t(drug.monitoring) || t('info_not_specified')}
            </p>
            
            {/* 6. Segurança de Uso/Observações Importantes */}
            <p>
              <span className="font-semibold">{t('drug_detail_safety_notes')}:&nbsp;</span> 
              {t(drug.safety_notes) || t('info_not_specified')}
            </p>
            
            
            {/* Safety Warning (Geral) */}
            <div className="mt-6 text-xs text-red-700 leading-relaxed p-3 bg-red-100 rounded-lg border border-red-300">
                <p className="font-semibold">{t('safety_warning_title')}</p>
                <p className="mt-1">{t('safety_warning_message')}</p>
            </div>

            {/* 7. INCOMPATIBILIDADES NO SÍTIO Y (TABELA + RÓTULO) */}
            {drug.incompatibilities && drug.incompatibilities.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                    <p className="font-semibold text-red-700">
                       {t('drug_detail_y_site_incompatibilities')}:
                    </p>
                    <div className="border border-gray-200 rounded-lg shadow-md overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('table_header_medication')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('table_header_type')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('table_header_observations')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {drug.incompatibilities.map((item, index) => (
                                    <tr key={index} className="hover:bg-red-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {t(item.medication_key)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t(item.type_key)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                                            {t(item.observation_key)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Link para a Matriz de Incompatibilidade Cruzada */}
            <div className="pt-4 border-t mt-6 flex flex-col space-y-3">
                <a 
                    href="/matrix" 
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150"
                >
                    {t('matrix_page_link')}
                </a>
                {/* Button to Calculator */}
                <a 
                    href={`/calculator?drug=${drug.slug}`} 
                    className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition duration-150"
                >
                    {t('open_calculator_for_this_drug')}
                </a>
            </div>

          </div>
          
        </div>
      </main>
    </div>
  );
}
