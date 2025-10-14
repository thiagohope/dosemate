// src/SettingsPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar'; 

// Assume que as configurações globais viriam de um Context ou Redux (simulado com estado local por enquanto)
export default function SettingsPage() {
    const { t } = useTranslation();

    // Estado simulado para as configurações do usuário
    const [settings, setSettings] = useState({
        // Peso padrão do paciente (em kg)
        defaultWeight: 70, 
        // Opção para usar sempre a Concentração Padrão (True/False)
        useDefaultConcentration: true, 
        // Concentração de KCl a ser usada na calculadora (mEq/mL ou %)
        kclConcentrationSetting: '2_meq_per_ml',
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Opções de concentração de KCl (simuladas, mas baseadas no seu drug_database)
    const kclOptions = [
        { value: '2_meq_per_ml', label: t('kcl_conc_2meq') },
        { value: '4_meq_per_ml', label: t('kcl_conc_4meq') },
    ];
    
    // CLASSE DE ESTILO ALTO CONTRASTE PADRÃO DA CALCULADORA
    const inputStyle = "text-white bg-cyan-700 font-bold border-cyan-800 shadow-md focus:border-cyan-500 focus:ring-cyan-500";


    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <h1 className="text-3xl font-extrabold text-cyan-700 mb-6 border-b pb-3">
                        {t('settings_page_title')}
                    </h1>
                    
                    <dl className="divide-y divide-gray-200">
                        {/* Configuração 1: Peso Padrão */}
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                                {t('setting_default_weight_title')}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={settings.defaultWeight}
                                    onChange={(e) => handleSettingChange('defaultWeight', Number(e.target.value))}
                                    // APLICAÇÃO DO ESTILO ALTO CONTRASTE (Fundo Escuro, Letra Clara)
                                    className={`block w-24 rounded-md border-2 sm:text-lg p-2 transition-colors ${inputStyle}`}
                                />
                                <span className="text-gray-500">kg</span>
                            </dd>
                        </div>

                        {/* Configuração 2: Concentração Padrão */}
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                                {t('setting_use_default_conc_title')}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.useDefaultConcentration}
                                        onChange={(e) => handleSettingChange('useDefaultConcentration', e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-cyan-600 rounded"
                                    />
                                    <span className="ml-2 text-gray-700">{t('setting_use_default_conc_label')}</span>
                                </label>
                            </dd>
                        </div>
                        
                        {/* Configuração 3: Concentração de KCl */}
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                                {t('setting_kcl_conc_title')}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <select
                                    value={settings.kclConcentrationSetting}
                                    onChange={(e) => handleSettingChange('kclConcentrationSetting', e.target.value)}
                                    // APLICAÇÃO DO ESTILO ALTO CONTRASTE (Fundo Escuro, Letra Clara)
                                    className={`block w-full rounded-md border-2 p-2 transition-colors ${inputStyle}`}
                                >
                                    {kclOptions.map(option => (
                                        // O texto dentro do <option> não pode ser estilizado, mas o <select> sim.
                                        <option key={option.value} value={option.value} className="text-gray-800 bg-white">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-400">{t('setting_kcl_conc_description')}</p>
                            </dd>
                        </div>
                    </dl>
                    
                    {/* Botão Salvar (Simulado) */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => console.log('Configurações Salvas:', settings)}
                            className="w-full justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
                        >
                            {t('setting_save_button')}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}