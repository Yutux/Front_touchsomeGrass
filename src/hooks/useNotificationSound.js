import { useRef, useCallback } from 'react';

/**
 * Hook pour jouer des sons de notification
 * 
 * Usage:
 * const { playMessageSound, playNotificationSound } = useNotificationSound();
 * playMessageSound(); // Joue le son de message
 */
export default function useNotificationSound() {
  const audioRef = useRef(null);

  // Créer un son à partir d'un fichier audio
  const playSound = useCallback((soundFile) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current = new Audio(soundFile);
      audioRef.current.volume = 0.5; // Volume à 50%
      audioRef.current.play().catch((error) => {
        console.warn('Impossible de jouer le son:', error);
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  }, []);

  // Son de nouveau message
  const playMessageSound = useCallback(() => {
    // Option 1: Utiliser un fichier audio local
    // playSound('/sounds/message.mp3');

    // Option 2: Utiliser Web Audio API pour générer un son
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configuration du son (note C5, 523.25 Hz)
      oscillator.frequency.value = 523.25;
      oscillator.type = 'sine';

      // Envelope (fade in/out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      // Second beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.frequency.value = 659.25; // Note E5
        oscillator2.type = 'sine';

        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.2);
      }, 100);
    } catch (error) {
      console.error('Erreur Web Audio API:', error);
    }
  }, []);

  // Son de notification (plus subtil)
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // Note A4
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error('Erreur Web Audio API:', error);
    }
  }, []);

  return {
    playMessageSound,
    playNotificationSound,
    playSound,
  };
}