// ============================================================
// TRAVEL RAVERS — MusicContext
// Global player state: current track, play/pause, expanded UI
// The WebView SoundCloud embed handles actual audio.
// MusicContext is the visual/state layer on top.
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Track = {
  title: string;
  artist: string;
  url: string;
};

type MusicContextValue = {
  isPlaying: boolean;
  currentTrack: Track | null;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  setIsPlaying: (v: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
  togglePlay: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

const DEFAULT_TRACK: Track = {
  title:  'TRAVEL RAVERS MIXES',
  artist: 'soundcloud.com/travel-ravers',
  url:    'https://soundcloud.com/travel-ravers',
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying,    setIsPlayingState]    = useState(false);
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(DEFAULT_TRACK);
  const [isExpanded,   setIsExpandedState]   = useState(false);

  const setIsPlaying    = useCallback((v: boolean)          => setIsPlayingState(v), []);
  const setCurrentTrack = useCallback((track: Track | null) => setCurrentTrackState(track), []);
  const setIsExpanded   = useCallback((v: boolean)          => setIsExpandedState(v), []);
  const togglePlay      = useCallback(()                    => setIsPlayingState(p => !p), []);

  return (
    <MusicContext.Provider value={{
      isPlaying,
      currentTrack,
      isExpanded,
      setIsExpanded,
      setIsPlaying,
      setCurrentTrack,
      togglePlay,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}
