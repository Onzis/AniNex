"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Star, Heart, Calendar, Clock, Film, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useFavorites } from "@/hooks/use-favorites";
import { PlayerStatus } from "@/components/player-status";
import { ScreenshotsGallery } from "@/components/screenshots-gallery";
import { Header } from "@/components/header";

interface Anime {
  id: number;
  name: string;
  russian: string;
  image: {
    original: string;
    preview: string;
  };
  episodes: number;
  episodes_aired?: number;
  status: string;
  score: number;
  aired_on?: string;
  released_on?: string;
  genres?: Array<{
    id: number;
    name: string;
    russian: string;
  }>;
  studios?: Array<{
    id: number;
    name: string;
  }>;
  description?: string;
  duration?: number;
  rating?: string;
  english?: string;
  japanese?: string;
  synonyms?: string[];
}

interface Player {
  type: string;
  iframeUrl?: string;
  name: string;
}

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { showSuccess, showError, showInfo } = useNotifications();
  const { toggleFavorite, isFavorite } = useFavorites();
  const animeId = params.id as string;
  
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<string>("auto");
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [relatedAnimes, setRelatedAnimes] = useState<Anime[]>([]);
  const [playerLoading, setPlayerLoading] = useState<boolean>(false);
  const [activePlayerType, setActivePlayerType] = useState<string>("");

  // Токены для плееров
  const KodikToken = "447d179e875efe44217f20d1ee2146be";
  const AllohaToken = "96b62ea8e72e7452b652e461ab8b89";

  useEffect(() => {
    loadAnimeDetails();
    loadAnimeScreenshots();
    loadRelatedAnimes();
  }, [animeId]);

  useEffect(() => {
    if (anime) {
      loadPlayer();
    }
  }, [anime, currentPlayer, currentEpisode]);

  const loadAnimeDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/anime/${animeId}`);

      if (response.ok) {
        const data = await response.json();
        setAnime(data);
      } else {
        throw new Error("Failed to fetch anime details");
      }
    } catch (error) {
      console.error("Error loading anime details:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить информацию об аниме.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnimeScreenshots = async () => {
    try {
      const response = await fetch(`/api/anime/${animeId}/screenshots`);

      if (response.ok) {
        const data = await response.json();
        setScreenshots(data);
      }
    } catch (error) {
      console.error("Error loading screenshots:", error);
    }
  };

  const loadRelatedAnimes = async () => {
    try {
      const response = await fetch(`/api/anime/${animeId}/similar`);

      if (response.ok) {
        const data = await response.json();
        setRelatedAnimes(data.slice(0, 6));
      }
    } catch (error) {
      console.error("Error loading related animes:", error);
    }
  };

  const loadPlayer = async () => {
    if (!anime) return;

    setPlayerLoading(true);
    
    try {
      if (currentPlayer === "auto") {
        // Автоматическое переключение между плеерами: Turbo > Lumex > Alloha > Kodik
        await autoPlayerChain();
      } else {
        // Ручной выбор плеера
        await manualSwitchPlayer(currentPlayer);
      }
    } catch (error) {
      console.error("Error loading player:", error);
      showError("Не удалось загрузить плеер. Попробуйте другой.");
    } finally {
      setPlayerLoading(false);
    }
  };

  const autoPlayerChain = async () => {
    const playerOrder = ["turbo", "lumex", "alloha", "kodik"];
    
    for (const playerType of playerOrder) {
      try {
        const response = await fetch(`/api/player/${playerType}?animeId=${animeId}&episode=${currentEpisode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.playerUrl) {
            setPlayerUrl(data.playerUrl);
            setActivePlayerType(playerType);
            setCurrentPlayer(playerType);
            showSuccess(`Используется ${playerType.charAt(0).toUpperCase() + playerType.slice(1)} плеер`);
            return;
          }
        }
      } catch (error) {
        console.warn(`${playerType} player failed:`, error);
      }
    }
    
    throw new Error("Все плееры недоступны");
  };

  const manualSwitchPlayer = async (playerType: string) => {
    try {
      const response = await fetch(`/api/player/${playerType}?animeId=${animeId}&episode=${currentEpisode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.playerUrl) {
          setPlayerUrl(data.playerUrl);
          setActivePlayerType(playerType);
          showSuccess(`Выбран ${playerType.charAt(0).toUpperCase() + playerType.slice(1)} плеер`);
        } else {
          throw new Error("Player URL not found");
        }
      } else {
        throw new Error(`Failed to fetch ${playerType} player`);
      }
    } catch (error) {
      console.error(`Error loading ${playerType} player:`, error);
      showError(`${playerType.charAt(0).toUpperCase() + playerType.slice(1)} плеер недоступен`);
      throw error;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "anons": return "Анонс";
      case "ongoing": return "Онгоинг";
      case "released": return "Завершено";
      default: return status;
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case "g": return "G";
      case "pg": return "PG";
      case "pg_13": return "PG-13";
      case "r": return "R";
      case "r_plus": return "R+";
      case "rx": return "RX";
      default: return rating;
    }
  };

  const handleFavoriteClick = () => {
    if (!anime) return;
    
    const added = toggleFavorite(anime);
    if (added) {
      showSuccess(`${anime.russian || anime.name} добавлено в избранное`);
    } else {
      showInfo(`${anime.russian || anime.name} удалено из избранного`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Аниме не найдено</h1>
          <Button onClick={() => router.push("/")}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Шапка сайта */}
      <Header currentPage={anime.russian || anime.name} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - информация */}
          <div className="lg:col-span-1 space-y-6">
            {/* Постер */}
            <Card>
              <img
                src={`https://shikimori.one${anime.image.original}`}
                alt={anime.russian || anime.name}
                className="w-full rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/anime-${anime.id}/300/450`;
                }}
              />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    {anime.score || "N/A"}
                  </Badge>
                  <Badge variant={anime.status === "ongoing" ? "default" : "secondary"}>
                    {getStatusText(anime.status)}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{anime.episodes || anime.episodes_aired || "?"} эп.</span>
                  </div>
                  
                  {anime.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{anime.duration} мин.</span>
                    </div>
                  )}
                  
                  {anime.aired_on && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{new Date(anime.aired_on).getFullYear()}</span>
                    </div>
                  )}
                  
                  {anime.rating && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{getRatingText(anime.rating)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button className="w-full" onClick={() => {
                    document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <Play className="mr-2 h-4 w-4" />
                    Смотреть
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleFavoriteClick}>
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite(Number(animeId)) ? 'fill-current text-red-500' : ''}`} />
                    {isFavorite(Number(animeId)) ? 'В избранном' : 'В избранное'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Студии */}
            {anime.studios && anime.studios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Студия</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{anime.studios[0].name}</p>
                </CardContent>
              </Card>
            )}

            {/* Жанры */}
            {anime.genres && anime.genres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Жанры</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre.id} variant="outline">
                        {genre.russian || genre.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Правая колонка - контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Заголовок и описание */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{anime.russian || anime.name}</h1>
              {anime.english && (
                <p className="text-muted-foreground mb-4">{anime.english}</p>
              )}
              {anime.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {anime.description}
                  </p>
                </div>
              )}
            </div>

            {/* Плеер */}
            <div id="player-section">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Онлайн просмотр</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={currentPlayer} onValueChange={(value) => {
                        setCurrentPlayer(value);
                        if (value !== "auto") {
                          setActivePlayerType(value);
                        }
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Авто</SelectItem>
                          <SelectItem value="turbo">Turbo</SelectItem>
                          <SelectItem value="lumex">Lumex</SelectItem>
                          <SelectItem value="alloha">Alloha</SelectItem>
                          <SelectItem value="kodik">Kodik</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {anime.episodes && anime.episodes > 1 && (
                        <Select value={currentEpisode.toString()} onValueChange={(value) => setCurrentEpisode(parseInt(value))}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: anime.episodes }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <PlayerStatus
                      isLoading={playerLoading}
                      playerUrl={playerUrl}
                      activePlayerType={activePlayerType}
                      currentPlayer={currentPlayer}
                    />
                  </div>
                  
                  {activePlayerType && (
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Активный плеер: {activePlayerType.charAt(0).toUpperCase() + activePlayerType.slice(1)}</span>
                      {currentPlayer === "auto" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Автовыбор</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Скриншоты */}
            {screenshots.length > 0 && (
              <ScreenshotsGallery screenshots={screenshots} />
            )}

            {/* Похожие аниме */}
            {relatedAnimes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Похожие аниме</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {relatedAnimes.map((related) => (
                      <div
                        key={related.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/anime/${related.id}`)}
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                          <img
                            src={`https://shikimori.one${related.image.preview}`}
                            alt={related.russian || related.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="text-sm font-medium line-clamp-2">
                          {related.russian || related.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{getStatusText(related.status)}</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {related.score || "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}