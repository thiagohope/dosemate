import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar'; 

// Importa a Matriz de Dados
import matrixData from './incompatibilities.json'; 

// Definições de Cores para a Matriz
const INCOMPATIBILITY_COLORS = {
    'P': 'bg-red-700 text-white',      // Precipitação
    'D': 'bg-purple-700 text-white',   // Degradação
    'AKI': 'bg-amber-500 text-gray-900',// Risco AKI
    'CI': 'bg-blue-400 text-white',     // Contraindicação de Linha Y
    'C': 'bg-green-600 text-white',     // Compatível
    'X': 'bg-gray-400 text-white',      // Não Recomendado / Sem Dados
    'header': 'bg-cyan-700 text-white',
    'self': 'bg-gray-200'               // Célula "droga vs. ela mesma"
};

// Mapeamento manual para drogas que não estão no banco de dados principal do DoseMate
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

    // Mapeia o slug para o nome da droga (para exibição e ordenação)
    const drugNameMap = useMemo(() => {
        const map = { ...EXTERNAL_DRUG_NAMES };
        allDrugs.forEach(d => {
            map[d.slug] = d.drug;
        });
        return map;
    }, [allDrugs]);
    
    // Cria um conjunto de slugs que são "clicáveis" (existem no DoseMate)
    const linkableSlugs = useMemo(() => {
        return new Set(allDrugs.map(d => d.slug));
    }, [allDrugs]);

    // Cria a lista de slugs para a tabela, em ordem alfabética pelo nome da droga
    const sortedSlugs = useMemo(() => {
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
                <div className="bg-white p-6 rounded-xl shadow-lg" itemScope itemType="http://schema.org/Dataset">
                    <h1 
                        className="text-3xl font-bold text-cyan-800 mb-6"
                        itemProp="name"
                        aria-label="Drug Incompatibility Matrix for IV Infusion"
                    >
                        {t('incompatibility_matrix_title')}
                    </h1>
                    <p 
                        className="text-gray-600 mb-6"
                        itemProp="description"
                    >
                        {t('matrix_description')}
                    </p>
                    {/* Container de Scroll para a Tabela */}
                    <div className="overflow-auto relative border border-gray-300 rounded-lg" style={{ maxHeight: '75vh' }}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`sticky top-0 z-20 ${INCOMPATIBILITY_COLORS.header}`}>
                                <tr>
                                    {/* Canto superior esquerdo - Fixo em ambas as direções */}
                                    <th scope="col" className={`sticky left-0 top-0 z-30 px-3 py-3 border-r border-b border-dashed border-gray-400 ${INCOMPATIBILITY_COLORS.header}`}></th>
                                    
                                    {/* Cabeçalhos de Coluna (Verticais) */}
                                    {sortedSlugs.map((slug, index) => (
                                        <th 
                                            key={index} 
                                            scope="col" 
                                            className="px-2 py-3 border-r border-b border-dashed border-gray-400 hover:bg-cyan-600 transition-colors align-bottom"
                                        >
                                            <div className="h-48 flex items-end justify-center">
                                                <span className="[writing-mode:vertical-rl] transform rotate-180 whitespace-nowrap">
                                                    {linkableSlugs.has(slug) ? (
                                                        <Link to={`/med/${slug}`} className="hover:underline font-semibold text-xs uppercase tracking-wider">
                                                            {drugNameMap[slug] || slug}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-semibold text-xs uppercase tracking-wider">
                                                            {drugNameMap[slug] || slug}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Linhas de Droga */}
                                {sortedSlugs.map((rowSlug, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {/* Cabeçalho de Linha (Fixo na Esquerda) */}
                                        <th 
                                            scope="row" 
                                            className={`sticky left-0 px-4 py-2 text-sm font-medium text-gray-900 border-r border-b border-dashed border-gray-400 ${INCOMPATIBILITY_COLORS.header} hover:bg-cyan-600 transition-colors whitespace-nowrap z-10`}
                                        >
                                            {linkableSlugs.has(rowSlug) ? (
                                                <Link to={`/med/${rowSlug}`} className="hover:underline font-semibold text-white">
                                                    {drugNameMap[rowSlug] || rowSlug}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-white">
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
                    
                    {/* Legenda */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h3 className="text-xl font-semibold mb-3">{t('matrix_legend_title')}</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {Object.entries(matrixData.key_definitions).map(([key, description]) => (
                                <div key={key} className="flex items-center space-x-2" title={description}>
                                    <span className={`inline-block w-4 h-4 rounded-full ${INCOMPATIBILITY_COLORS[key] || INCOMPATIBILITY_COLORS.X}`}></span>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {key}: {description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Aviso Legal */}
                    <div className="mt-8 text-xs text-red-700 leading-relaxed p-3 bg-red-100 rounded-lg border border-red-300">
                        <p className="font-semibold">{t('safety_warning_title')}</p>
                        <p className="mt-1">{t('matrix_safety_disclaimer')}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

