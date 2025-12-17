import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language, languageFlags, languageNames } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const languages: Language[] = ['zh', 'ja', 'vi'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all text-sm text-slate-700 hover:text-slate-900"
        >
          <span className="text-lg">{languageFlags[language]}</span>
          <span className="hidden sm:inline">{languageNames[language]}</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[160px]">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleSelect(lang)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                  ${language === lang 
                    ? 'bg-brand-50 text-brand-700 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-lg">{languageFlags[lang]}</span>
                <span>{languageNames[lang]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
