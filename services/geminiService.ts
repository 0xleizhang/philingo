import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Annotation, PronunciationFeedback, WordError } from '../types';

// Base64 decode helper for audio data
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert PCM data to WAV format
function pcmToWav(pcmData: ArrayBuffer, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): ArrayBuffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.byteLength;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  const pcmView = new Uint8Array(pcmData);
  const wavView = new Uint8Array(buffer);
  wavView.set(pcmView, headerSize);

  return buffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// TTS audio result type
export interface TTSAudioResult {
  data: ArrayBuffer;
  mimeType: string;
}

// LocalStorage cache entry (stores base64 for persistence)
interface TTSCacheEntry {
  base64: string;
  mimeType: string;
  timestamp: number;
}

// LocalStorage key prefix
const TTS_CACHE_PREFIX = 'vocabflow_tts_';
const TTS_CACHE_INDEX_KEY = 'vocabflow_tts_index';

// Max cache size (limit to ~20 entries to stay within localStorage limits)
const MAX_TTS_CACHE_SIZE = 20;

// In-memory cache for fast access during session
const memoryCache = new Map<string, TTSAudioResult>();

// Generate a cache key from text
function getCacheKey(text: string): string {
  // Use a simple hash to create shorter keys
  let hash = 0;
  const str = text.trim();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return TTS_CACHE_PREFIX + Math.abs(hash).toString(36);
}

// Get cache index (list of cached keys with timestamps)
function getCacheIndex(): { key: string; text: string; timestamp: number }[] {
  try {
    const index = localStorage.getItem(TTS_CACHE_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch {
    return [];
  }
}

// Save cache index
function saveCacheIndex(index: { key: string; text: string; timestamp: number }[]): void {
  try {
    localStorage.setItem(TTS_CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn("Failed to save TTS cache index:", e);
  }
}

// Get cached TTS from localStorage
function getFromLocalStorage(text: string): TTSAudioResult | null {
  const cacheKey = getCacheKey(text);

  // Check memory cache first
  if (memoryCache.has(text.trim())) {
    return memoryCache.get(text.trim())!;
  }

  try {
    const stored = localStorage.getItem(cacheKey);
    if (!stored) return null;

    const entry: TTSCacheEntry = JSON.parse(stored);
    const data = base64ToArrayBuffer(entry.base64);
    const result: TTSAudioResult = { data, mimeType: entry.mimeType };

    // Store in memory cache for faster subsequent access
    memoryCache.set(text.trim(), result);

    return result;
  } catch (e) {
    console.warn("Failed to read TTS from localStorage:", e);
    return null;
  }
}

// Save TTS to localStorage
function saveToLocalStorage(text: string, result: TTSAudioResult): void {
  const cacheKey = getCacheKey(text);
  const textKey = text.trim();

  // Store in memory cache
  memoryCache.set(textKey, result);

  try {
    // Convert ArrayBuffer to base64
    const base64 = arrayBufferToBase64(result.data);
    const entry: TTSCacheEntry = {
      base64,
      mimeType: result.mimeType,
      timestamp: Date.now()
    };

    // Update index
    let index = getCacheIndex();

    // Remove existing entry for this text if present
    index = index.filter(e => e.text !== textKey);

    // Manage cache size - remove oldest entries if full
    while (index.length >= MAX_TTS_CACHE_SIZE) {
      const oldest = index.shift();
      if (oldest) {
        localStorage.removeItem(oldest.key);
        memoryCache.delete(oldest.text);
      }
    }

    // Add new entry
    index.push({ key: cacheKey, text: textKey, timestamp: Date.now() });

    // Save to localStorage
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    saveCacheIndex(index);

    console.log("TTS cached to localStorage:", textKey.slice(0, 30) + "...");
  } catch (e) {
    console.warn("Failed to save TTS to localStorage (quota exceeded?):", e);
    // If storage fails, at least we have it in memory
  }
}

/**
 * Fetch TTS audio from Gemini API with caching (persisted to localStorage)
 * Returns audio data with mimeType
 */
export const fetchTTSAudio = async (text: string, apiKey: string): Promise<TTSAudioResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  // Check cache first (memory + localStorage)
  const cached = getFromLocalStorage(text);
  if (cached) {
    console.log("TTS cache hit:", text.trim().slice(0, 30) + "...");
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: text,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Puck'
            }
          }
        }
      }
    });

    // Extract audio data from response
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data && part?.inlineData?.mimeType) {
      const rawData = base64ToArrayBuffer(part.inlineData.data);
      const mimeType = part.inlineData.mimeType;

      console.log("TTS audio mimeType:", mimeType);

      // Check if it's PCM data and convert to WAV
      let audioData: ArrayBuffer;
      let outputMimeType: string;

      if (mimeType.includes('L16') || mimeType.includes('pcm')) {
        // Parse sample rate from mimeType (e.g., "audio/L16;codec=pcm;rate=24000")
        const rateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

        console.log("Converting PCM to WAV, sampleRate:", sampleRate);
        audioData = pcmToWav(rawData, sampleRate);
        outputMimeType = 'audio/wav';
      } else {
        audioData = rawData;
        outputMimeType = mimeType;
      }

      const result: TTSAudioResult = { data: audioData, mimeType: outputMimeType };

      // Store in cache (memory + localStorage)
      saveToLocalStorage(text, result);

      return result;
    }

    throw new Error("No audio data in response");
  } catch (error) {
    console.error("Error fetching TTS audio:", error);
    throw error;
  }
};

/**
 * Clear the TTS cache (both memory and localStorage)
 */
export const clearTTSCache = () => {
  // Clear memory cache
  memoryCache.clear();

  // Clear localStorage cache
  const index = getCacheIndex();
  for (const entry of index) {
    localStorage.removeItem(entry.key);
  }
  localStorage.removeItem(TTS_CACHE_INDEX_KEY);

  console.log("TTS cache cleared (memory + localStorage)");
};

export const fetchWordAnnotation = async (word: string, contextSentence: string, apiKey: string): Promise<Annotation> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  // Initialize the client dynamically with the user-provided key
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Analyze the English word "${word}".
      Context: "${contextSentence}".
      
      Provide:
      1. The IPA phonetic transcription (British or American general).
      2. A concise Chinese definition (max 10 chars) suitable for this context.
      
      Return as JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ipa: { type: Type.STRING, description: "IPA phonetic transcription, e.g., /həˈləʊ/" },
            definition: { type: Type.STRING, description: "Concise Chinese definition" },
          },
          required: ["ipa", "definition"],
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(jsonText) as Annotation;

  } catch (error) {
    console.error("Error fetching annotation:", error);
    throw error;
  }
};

// Helper: Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Analyze pronunciation by comparing user's audio against the original text
 * Returns feedback with score, comments, and error words
 */
export const analyzePronunciation = async (
  audioBlob: Blob,
  originalText: string,
  apiKey: string
): Promise<PronunciationFeedback> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = arrayBufferToBase64(arrayBuffer);

    const prompt = `You are an English pronunciation coach. Listen to this audio recording where a student reads the following text:

"${originalText}"

Analyze the pronunciation and provide feedback in JSON format with:
1. score: A number from 0-100 rating the overall pronunciation quality
2. feedback: A brief overall comment in Chinese (1-2 sentences)
3. errors: An array of words that had pronunciation issues, each with:
   - word: the mispronounced word (must match exactly a word in the original text)
   - issue: a brief description of the issue in Chinese (e.g., "元音发音不准", "重音位置错误", "尾音不清晰")

Be encouraging but honest. If the pronunciation is good, return an empty errors array.
Focus on significant errors that affect comprehension.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64Audio
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Pronunciation score 0-100" },
            feedback: { type: Type.STRING, description: "Overall feedback in Chinese" },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "The mispronounced word" },
                  issue: { type: Type.STRING, description: "Description of the issue in Chinese" }
                },
                required: ["word", "issue"]
              }
            }
          },
          required: ["score", "feedback", "errors"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(jsonText) as { score: number; feedback: string; errors: WordError[] };

    return {
      id: `feedback-${Date.now()}`,
      sentence: originalText,
      timestamp: new Date(),
      score: result.score,
      feedback: result.feedback,
      errors: result.errors || []
    };

  } catch (error) {
    console.error("Error analyzing pronunciation:", error);
    throw error;
  }
};