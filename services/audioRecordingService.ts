// Audio Recording Service with Voice Activity Detection (VAD)

export interface RecordingResult {
  audioBlob: Blob;
  duration: number; // in seconds
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private isRecording = false;

  // VAD parameters
  private silenceThreshold = 0.02; // Volume threshold for silence detection
  private silenceDuration = 1500; // ms of silence before stopping
  private maxRecordingTime = 30000; // Maximum recording time (30 seconds)
  private minRecordingTime = 500; // Minimum recording time before silence detection kicks in

  /**
   * Play a short beep sound to indicate recording start
   */
  async playBeep(): Promise<void> {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    await new Promise(resolve => setTimeout(resolve, 250));
    audioContext.close();
  }

  /**
   * Start recording with Voice Activity Detection
   * Returns a promise that resolves with the recorded audio when silence is detected
   */
  async recordWithVAD(
    onRecordingStart?: () => void,
    onRecordingStop?: () => void
  ): Promise<RecordingResult> {
    return new Promise(async (resolve, reject) => {
      try {
        // Request microphone access
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        // Setup audio context for VAD
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        source.connect(this.analyser);

        // Setup MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
        this.chunks = [];

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.chunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.chunks, { type: mimeType });
          const duration = (Date.now() - recordingStartTime) / 1000;
          this.cleanup();
          onRecordingStop?.();
          resolve({ audioBlob, duration });
        };

        // Start recording
        this.mediaRecorder.start(100); // Collect data every 100ms
        this.isRecording = true;
        const recordingStartTime = Date.now();
        onRecordingStart?.();

        // VAD monitoring
        let silenceStart: number | null = null;
        let hasSpeechStarted = false;

        const checkVolume = () => {
          if (!this.isRecording || !this.analyser) return;

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(dataArray);

          // Calculate average volume
          const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
          const normalizedVolume = average / 255;

          const elapsedTime = Date.now() - recordingStartTime;

          // Check for max recording time
          if (elapsedTime >= this.maxRecordingTime) {
            this.stopRecording();
            return;
          }

          // Only check for silence after minimum recording time
          if (elapsedTime >= this.minRecordingTime) {
            if (normalizedVolume > this.silenceThreshold) {
              hasSpeechStarted = true;
              silenceStart = null;
            } else if (hasSpeechStarted) {
              // User has started speaking and now it's quiet
              if (!silenceStart) {
                silenceStart = Date.now();
              } else if (Date.now() - silenceStart >= this.silenceDuration) {
                // Silence duration exceeded, stop recording
                this.stopRecording();
                return;
              }
            }
          }

          // Continue monitoring
          requestAnimationFrame(checkVolume);
        };

        requestAnimationFrame(checkVolume);

      } catch (error) {
        this.cleanup();
        reject(error);
      }
    });
  }

  /**
   * Stop recording manually
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      this.mediaRecorder.stop();
    }
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.isRecording = false;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.analyser = null;
  }
}

// Singleton instance
export const audioRecorder = new AudioRecorder();
