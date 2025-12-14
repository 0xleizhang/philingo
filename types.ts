export interface Annotation {
  ipa: string;
  definition: string;
}

export interface WordToken {
  id: string;
  text: string;
  isWord: boolean; // true if it's a clickable word, false if punctuation/whitespace
  status: 'idle' | 'loading' | 'success' | 'error';
  annotation?: Annotation;
  sentenceIndex: number; // Added for TTS sentence tracking
}

export type ViewMode = 'edit' | 'read';

export type InteractionMode = 'reading' | 'listen' | 'test';

export interface WordError {
  word: string;
  issue: string; // e.g., "发音不准", "重音错误"
}

export interface PronunciationFeedback {
  id: string;
  sentence: string;
  timestamp: Date;
  score: number; // 0-100
  feedback: string;
  errors: WordError[];
  audioUrl?: string; // URL for playback of recorded audio
}