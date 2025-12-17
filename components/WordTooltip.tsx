import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Annotation } from '../types';

interface WordTooltipProps {
  annotation: Annotation;
  isVisible: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const WordTooltip: React.FC<WordTooltipProps> = ({ annotation, isVisible, onMouseEnter, onMouseLeave }) => {
  const { t } = useLanguage();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showBelow, setShowBelow] = useState(false);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      // Check if tooltip would be cut off at the top
      const spaceAbove = rect.top;
      const tooltipHeight = rect.height;
      
      // If there's not enough space above (less than tooltip height + 20px buffer)
      setShowBelow(spaceAbove < tooltipHeight + 20);
    }
  }, [isVisible]);

  return (
    <div 
      ref={tooltipRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        absolute left-0 z-50 
        transform transition-all duration-200
        ${showBelow 
          ? 'top-full mt-1 origin-top-left' 
          : 'bottom-full mb-1 origin-bottom-left'
        }
        ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none'}
        ${showBelow ? (isVisible ? 'translate-y-0' : '-translate-y-2') : (isVisible ? 'translate-y-0' : 'translate-y-2')}
      `}
    >
      <div className="bg-slate-800 text-white text-sm px-4 py-3 rounded-lg shadow-xl ring-1 ring-white/10 w-[min(85vw,400px)] md:w-[min(450px,90vw)] select-text">
        {/* 英汉释义 */}
        <div className="font-medium text-base mb-2 text-white">
          {annotation.definition}
        </div>
        
        {/* 英英释义 */}
        {annotation.definitionEn && annotation.definitionEn.trim() !== '' && (
          <div className="text-xs text-slate-300 mb-2 leading-relaxed italic">
            <span className="text-slate-400 not-italic">English: </span>
            {annotation.definitionEn}
          </div>
        )}
        
        {/* 音节 */}
        {annotation.syllables && annotation.syllables.trim() !== '' && (
          <div className="text-xs text-slate-300 mb-1.5">
            <span className="text-slate-400">{t.wordTooltip.syllables}: </span>
            <span className="font-mono text-brand-300">{annotation.syllables}</span>
          </div>
        )}
        
        {/* 词根 */}
        {annotation.roots && annotation.roots.trim() !== '' && (
          <div className="text-xs text-slate-300 mb-1.5">
            <span className="text-slate-400">{t.wordTooltip.roots}: </span>
            <span>{annotation.roots}</span>
          </div>
        )}
        
        {/* 词缀 */}
        {annotation.affixes && annotation.affixes.trim() !== '' && (
          <div className="text-xs text-slate-300 mb-1.5">
            <span className="text-slate-400">{t.wordTooltip.affixes}: </span>
            <span>{annotation.affixes}</span>
          </div>
        )}
        
        {/* 近义词 */}
        {annotation.synonyms && annotation.synonyms.length > 0 && (
          <div className="text-xs text-slate-300 mb-1.5">
            <span className="text-slate-400">{t.wordTooltip.synonyms}: </span>
            <span className="text-emerald-300">{annotation.synonyms.join(', ')}</span>
          </div>
        )}
        
        {/* 近义词辨析 */}
        {annotation.synonymAnalysis && annotation.synonymAnalysis.trim() !== '' && (
          <div className="text-xs text-slate-300 mb-1.5 leading-relaxed">
            <span className="text-slate-400">{t.wordTooltip.analysis}: </span>
            {annotation.synonymAnalysis}
          </div>
        )}
        
        {/* 反义词 */}
        {annotation.antonyms && annotation.antonyms.length > 0 && (
          <div className="text-xs text-slate-300 mb-1.5">
            <span className="text-slate-400">{t.wordTooltip.antonyms}: </span>
            <span className="text-rose-300">{annotation.antonyms.join(', ')}</span>
          </div>
        )}
        
        {/* 联想词 */}
        {annotation.associations && annotation.associations.length > 0 && (
          <div className="text-xs text-slate-300 mb-1.5">
            <span className="text-slate-400">{t.wordTooltip.associations}: </span>
            <span className="text-purple-300">{annotation.associations.join(', ')}</span>
          </div>
        )}
        
        {/* 常用词组 */}
        {annotation.phrases && annotation.phrases.length > 0 && (
          <div className="text-xs text-slate-300">
            <span className="text-slate-400">{t.wordTooltip.phrases}: </span>
            <div className="mt-1 space-y-0.5">
              {annotation.phrases.map((phrase, idx) => (
                <div key={idx} className="text-amber-300">• {phrase}</div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tooltip Arrow */}
        <div className={`absolute left-4 -translate-x-1/2 text-slate-800 ${
          showBelow 
            ? 'bottom-full -mb-[4px]' 
            : 'top-full -mt-[4px]'
        }`}>
          <div className="w-2 h-2 bg-slate-800 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default WordTooltip;
