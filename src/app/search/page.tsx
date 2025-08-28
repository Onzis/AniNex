"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Play, Star, Clock, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";
import { Header } from "@/components/header";

interface Anime {
  id: number;
  name: string;
  russian: string;
  image: {
    original: string;
  };
  episodes: number;
  episodes_aired?: number;
  status: string;
  score: number;
  aired_on?: string;
  genres?: Array<{
    id: number;
    name: string;
    russian: string;
  }>;
  description?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Загрузка результатов поиска
  useEffect(() => {
    if (query) {
      loadSearchResults();
    }
  }, [query, statusFilter]);

  const loadSearchResults = async () => {
    setLoading(true);
    try {
      let apiUrl = `/api/anime/search?q=${encodeURIComponent(query)}&limit=50`;
      
      if (statusFilter !== "all") {
        apiUrl += `&status=${statusFilter}`;
      }

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setAnimes(data);
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      console.error("Error searching animes:", error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleAnimeClick = (animeId: number) => {
    window.location.href = `/anime/${animeId}`;
  };

  const handleFavoriteClick = (anime: Anime, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleFavorite(anime);
    if (added) {
      toast({
        title: "Добавлено в избранное",
        description: `${anime.russian || anime.name} добавлено в избранное`,
      });
    } else {
      toast({
        title: "Удалено из избранного",
        description: `${anime.russian || anime.name} удалено из избранного`,
      });
    }
  };

  const filteredAnimes = useMemo(() => {
    if (statusFilter === "all") return animes;
    return animes.filter(anime => anime.status === statusFilter);
  }, [animes, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Шапка сайта */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок страницы поиска */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Результаты поиска</h1>
          <p className="text-muted-foreground">
            По запросу "{query}" найдено {filteredAnimes.length} аниме
          </p>
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="ongoing">Онгоинги</SelectItem>
              <SelectItem value="released">Завершенные</SelectItem>
              <SelectItem value="anons">Анонсы</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Результаты */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-t-lg" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAnimes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Аниме не найдены</p>
            <Button className="mt-4" onClick={() => window.location.href = "/"}>
              На главную
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAnimes.map((anime) => (
              <Card 
                key={anime.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
                onClick={() => handleAnimeClick(anime.id)}
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={`https://shikimori.one${anime.image.original}`}
                    alt={anime.russian || anime.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/seed/anime-${anime.id}/300/450`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/80 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {anime.score || "N/A"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/80 hover:bg-black/90 text-white hover:text-white"
                      onClick={(e) => handleFavoriteClick(anime, e)}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(anime.id) ? 'fill-current text-red-500' : ''}`} />
                    </Button>
                  </div>
                  {anime.status === "ongoing" && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-600 hover:bg-red-700">
                        <Clock className="h-3 w-3 mr-1" />
                        Онгоинг
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {anime.russian || anime.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{getStatusText(anime.status)}</span>
                    <span>{anime.episodes || anime.episodes_aired || "?"} эп.</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}