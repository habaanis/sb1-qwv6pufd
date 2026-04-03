import { logger } from '../logging/distributedLogger';

interface VoiceSearchOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface VoiceSearchResult {
  transcript: string;
  confidence: number;
  alternatives?: string[];
  isFinal: boolean;
}

type VoiceSearchCallback = (result: VoiceSearchResult) => void;
type VoiceErrorCallback = (error: string) => void;

class VoiceSearchManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private callbacks: VoiceSearchCallback[] = [];
  private errorCallbacks: VoiceErrorCallback[] = [];

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    if (!this.isSupported()) {
      logger.warn('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition ||
                             (window as any).webkitSpeechRecognition;

    this.recognition = new SpeechRecognition();
  }

  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  start(options: VoiceSearchOptions = {}): void {
    if (!this.recognition) {
      const error = 'Voice search not available';
      logger.error(error);
      this.notifyError(error);
      return;
    }

    if (this.isListening) {
      logger.warn('Voice search already active');
      return;
    }

    this.recognition.lang = options.language || 'fr-TN';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || true;
    this.recognition.maxAlternatives = options.maxAlternatives || 3;

    this.recognition.onstart = () => {
      this.isListening = true;
      logger.info('Voice search started');
    };

    this.recognition.onresult = (event: any) => {
      const results = event.results[event.results.length - 1];
      const transcript = results[0].transcript;
      const confidence = results[0].confidence;
      const isFinal = results.isFinal;

      const alternatives = [];
      for (let i = 1; i < results.length; i++) {
        alternatives.push(results[i].transcript);
      }

      const result: VoiceSearchResult = {
        transcript,
        confidence,
        alternatives,
        isFinal
      };

      this.notifyCallbacks(result);

      logger.debug('Voice search result', { transcript, confidence, isFinal });
    };

    this.recognition.onerror = (event: any) => {
      logger.error('Voice search error', new Error(event.error));
      this.notifyError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      logger.info('Voice search ended');
    };

    try {
      this.recognition.start();
    } catch (error) {
      logger.error('Failed to start voice search', error as Error);
      this.notifyError('Failed to start voice recognition');
    }
  }

  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      logger.info('Voice search stopped');
    } catch (error) {
      logger.error('Failed to stop voice search', error as Error);
    }
  }

  onResult(callback: VoiceSearchCallback): void {
    this.callbacks.push(callback);
  }

  onError(callback: VoiceErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  removeCallback(callback: VoiceSearchCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  removeErrorCallback(callback: VoiceErrorCallback): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  private notifyCallbacks(result: VoiceSearchResult): void {
    this.callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        logger.error('Voice search callback error', error as Error);
      }
    });
  }

  private notifyError(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        logger.error('Voice search error callback failed', err as Error);
      }
    });
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }
}

export const voiceSearchManager = new VoiceSearchManager();

export function startVoiceSearch(options?: VoiceSearchOptions): void {
  voiceSearchManager.start(options);
}

export function stopVoiceSearch(): void {
  voiceSearchManager.stop();
}

export function onVoiceResult(callback: VoiceSearchCallback): void {
  voiceSearchManager.onResult(callback);
}

export function onVoiceError(callback: VoiceErrorCallback): void {
  voiceSearchManager.onError(callback);
}

export function isVoiceSearchSupported(): boolean {
  return voiceSearchManager.isSupported();
}

if (typeof window !== 'undefined') {
  (window as any).voiceSearch = voiceSearchManager;
}
