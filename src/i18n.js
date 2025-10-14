import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


// Importando os arquivos de tradução
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationPT from './locales/pt/translation.json';

// Configurando os recursos (as traduções em si)
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  pt: {
    translation: translationPT
  }
};

i18n
  .use(LanguageDetector) // Ativa o detector de idioma
  .use(initReactI18next) // Passa a instância do i18n para o react-i18next
  .init({
    resources,
    supportedLngs: ['en', 'es', 'pt'], // Define os idiomas que nosso app OFICIALMENTE suporta
    fallbackLng: 'en', // Idioma de fallback se a detecção falhar ou não for um idioma suportado
    interpolation: {
      escapeValue: false // O React já faz a proteção contra XSS
    }
  });
  
export default i18n;