// src/IncompatibilityMatrixPage.jsx
// Displays a cross-reference table (matrix) of drug incompatibilities.

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar'; 

// Importa a Matriz de Dados Real (Assumindo que está em src/)
import matrixData from './incompatibilities.json'; 

// Definições de Cores e Códigos para o frontend
const INCOMPATIBILITY_COLORS = {
    // Cores definidas conforme o esquema de segurança (Tailwind Classes)
    'P': 'bg-red-700 text-white',      // Precipitação
    'D': 'bg-purple-700 text-white',   // Degradação
    'AKI': 'bg-amber-500 text-gray-900',// Risco AKI
    'CI': 'bg-blue-400 text-white',     // Contraindicação de Linha Y
    'C': 'bg-green-600 text-white',     // Compatível
    'X': 'bg-gray-400 text-white',      // Não Recomendado / Sem Dados
    'header': 'bg-cyan-700 text-white',
    'self': 'bg-gray-200'               // Célula "droga vs. ela mesma"
};

// Mapeia o código para a CHAVE de tradução correspondente (para o tooltip/legenda)
const INCOMPATIBILITY_KEY_MAP = {
    'P': 'P', 
    'D': 'D', 
    'AKI': 'AKI',
    'CI': 'CI',
    'C': 'C',
    'X': 'X'
};

// Mapeamento manual para drogas que não estão no 'drug_database.json' (DoseMate)
const EXTERNAL_DRUG_NAMES = {
    'epinephrine': 'Epinephrine (Adrenaline)', 
    'albumin': 'Albumin',
    'aminoglycosides': 'Aminoglycosides',
    'amphotericin_b': 'Amphotericin B',
    'calcium_chloride': 'Calcium Chloride',
    'isosorbide_dinitrate': 'Isosorbide Dinitrate', 
    'magnesium_sulfate': 'Magnesium Sulfate',
    'metronidazole': 'Metronidazole',
    'phenytoin': 'Phenytoin',
    'quinolones': 'Quinolones',
};


export default function IncompatibilityMatrixPage({ allDrugs = [] }) {
    const { t } = useTranslation();

    // 1. Mapeia o slug para o nome da droga (para exibição e ordenação)
    const drugNameMap = useMemo(() => {
        const map = { ...EXTERNAL_DRUG_NAMES };
        allDrugs.forEach(d => {
            map[d.slug] = d.drug;
        });
        return map;
    }, [allDrugs]);
    
    // 2. Cria um conjunto (Set) de slugs que são linkáveis (existentes no drug_database.json)
    const linkableSlugs = useMemo(() => {
        return new Set(allDrugs.map(d => d.slug));
    }, [allDrugs]);

    // 3. Cria a lista de SLUGS de drogas para cabeçalhos e linhas (em ordem alfabética)
    const sortedSlugs = useMemo(() => {
        // Ordena os slugs da Matriz de Dados alfabeticamente pelo nome amigável
        return matrixData.drug_keys.slice().sort((a, b) => {
            const nameA = drugNameMap[a] || a;
            const nameB = drugNameMap[b] || b;
            return nameA.localeCompare(nameB);
        });
    }, [drugNameMap]); 
    

    if (sortedSlugs.length === 0) {
        return (
            <main className="container mx-auto p-4">
                <p className="text-gray-500">{t('loading_data')}</p>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-cyan-800 mb-6">{t('incompatibility_matrix_title')}</h1>
                    <p className="text-gray-600 mb-6">{t('matrix_description')}</p>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                            <thead className={INCOMPATIBILITY_COLORS.header}>
                                <tr>
                                    {/* Canto superior esquerdo */}
                                    <th scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wider border-r border-b border-dashed border-gray-400"></th>
                                    
                                    {/* Cabeçalhos de Coluna (Nomes Verticais) */}
                                    {sortedSlugs.map((slug, index) => {
                                        const drugName = drugNameMap[slug] || slug;
                                        const isLinkable = linkableSlugs.has(slug); // Verifica se é DoseMate
                                        
                                        // Elemento com o nome da droga renderizado na vertical
                                        const DrugNameElement = (
                                            <span className="text-xs font-semibold whitespace-nowrap align-bottom [writing-mode:vertical-rl] transform rotate-180">
                                                {drugName}
                                            </span>
                                        );
                                        
                                        return (
                                            <th 
                                                key={index} 
                                                scope="col" 
                                                className="px-3 py-3 text-xs font-semibold uppercase tracking-wider border-r border-b border-dashed border-gray-400 h-64 hover:bg-cyan-600 transition-colors"
                                            >
                                                {/* PONTO 15: Aplica o Link se a droga for DoseMate */}
                                                {isLinkable ? (
                                                    // Assumindo a rota /drogas/[slug]
                                                    <a href={`/drogas/${slug}`} className="hover:underline">
                                                        {DrugNameElement}
                                                    </a>
                                                ) : (
                                                    DrugNameElement
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Linhas de Droga */}
                                {sortedSlugs.map((rowSlug, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {/* Cabeçalho de Linha (Nome Horizontal) */}
                                        <th 
                                            scope="row" 
                                            className={`px-4 py-2 text-sm font-medium text-gray-900 border-r border-b border-dashed border-gray-400 ${INCOMPATIBILITY_COLORS.header} hover:bg-cyan-600 transition-colors whitespace-nowrap`}
                                        >
                                            {/* PONTO 15: Aplica o Link se a droga for DoseMate */}
                                            {linkableSlugs.has(rowSlug) ? (
                                                <a href={`/drogas/${rowSlug}`} className="hover:underline font-bold">
                                                    {drugNameMap[rowSlug] || rowSlug}
                                                </a>
                                            ) : (
                                                <span className="font-semibold">
                                                    {drugNameMap[rowSlug] || rowSlug}
                                                </span>
                                            )}
                                        </th>
                                        
                                        {/* Células da Matriz */}
                                        {sortedSlugs.map((colSlug, colIndex) => {
                                            const status = matrixData.matrix[rowSlug]?.[colSlug] || matrixData.matrix[colSlug]?.[rowSlug] || 'X'; 
                                            const statusClass = INCOMPATIBILITY_COLORS[status] || INCOMPATIBILITY_COLORS.X;
                                            
                                            const tooltipDescription = matrixData.key_definitions[status] || t('X'); 
                                            
                                            if (rowSlug === colSlug) {
                                                return <td key={colIndex} className={INCOMPATIBILITY_COLORS.self}></td>;
                                            }

                                            return (
                                                <td 
                                                    key={colIndex} 
                                                    className={`px-4 py-3 whitespace-nowrap text-center text-sm font-medium transition-colors cursor-pointer border-r border-b border-dashed border-gray-400 ${statusClass}`}
                                                    title={tooltipDescription} 
                                                >
                                                    <span className="sr-only">{tooltipDescription}</span> 
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Legenda (Baseada em key_definitions) */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h3 className="text-xl font-semibold mb-3">{t('matrix_legend_title')}</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {/* Renderiza o código e a descrição completa */}
                            {Object.entries(matrixData.key_definitions).map(([key, description]) => (
                                <div key={key} className="flex items-center space-x-2" title={description}>
                                    {/* Exibição da cor na legenda */}
                                    <span className={`inline-block w-4 h-4 rounded-full ${INCOMPATIBILITY_COLORS[key] || INCOMPATIBILITY_COLORS.X}`}></span>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {/* Exibe o código seguido da descrição completa */}
                                        {key}: {description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* AVISO LEGAL E SEGURANÇA */}
                    <div className="mt-8 text-xs text-red-700 leading-relaxed p-3 bg-red-100 rounded-lg border border-red-300">
                        <p className="font-semibold">{t('safety_warning_title')}</p>
                        <p className="mt-1">{t('matrix_safety_disclaimer')}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}