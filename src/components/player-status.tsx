"use client";

import { Loader2, CheckCircle, AlertCircle, Play } from "lucide-react";

interface PlayerStatusProps {
  isLoading: boolean;
  playerUrl: string;
  activePlayerType: string;
  currentPlayer: string;
}

export function PlayerStatus({ isLoading, playerUrl, activePlayerType, currentPlayer }: PlayerStatusProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
          <p>Загрузка плеера...</p>
          {activePlayerType && (
            <p className="text-sm mt-2">Пробуется {activePlayerType.charAt(0).toUpperCase() + activePlayerType.slice(1)} плеер</p>
          )}
        </div>
      </div>
    );
  }

  if (playerUrl) {
    return (
      <iframe
        src={playerUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay *; fullscreen *; encrypted-media"
        frameBorder="0"
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 mx-auto mb-4" />
        <p>Не удалось загрузить плеер</p>
        <p className="text-sm mt-2">Попробуйте выбрать другой плеер</p>
      </div>
    </div>
  );
}