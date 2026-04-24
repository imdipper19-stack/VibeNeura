'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

export function VoiceInput({ onTranscript, disabled, className }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setProcessing(true);

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              onTranscript(data.text);
            }
          }
        } catch (err) {
          console.error('Transcription failed:', err);
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const handleClick = () => {
    if (disabled || processing) return;
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || processing}
      className={cn(
        'relative p-2 rounded-lg transition-colors',
        recording
          ? 'bg-error/20 text-error'
          : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface',
        (disabled || processing) && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={recording ? 'Stop recording' : 'Start voice input'}
    >
      <AnimatePresence mode="wait">
        {processing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : recording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Square className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Mic className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator pulse */}
      {recording && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-error/20"
          animate={{ opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </button>
  );
}
