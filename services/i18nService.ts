import { Language } from '../i18n/translations';

// 根据语言获取对应的语言名称（用于prompt）
export const getTargetLanguageName = (lang: Language): string => {
  const languageMap: Record<Language, string> = {
    zh: 'Chinese',
    ja: 'Japanese', 
    vi: 'Vietnamese'
  };
  return languageMap[lang];
};

// 根据语言获取对应的语言标识符（用于prompt指定返回语言）
export const getTargetLanguageCode = (lang: Language): string => {
  const languageMap: Record<Language, string> = {
    zh: 'Chinese (简体中文)',
    ja: 'Japanese (日本語)',
    vi: 'Vietnamese (Tiếng Việt)'
  };
  return languageMap[lang];
};
