"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, Star, Clock, Heart, Filter, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";
import { ThemeToggle } from "@/components/theme-toggle";

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

export default function Home() {
  const router = useRouter();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const { favorites, toggleFavorite, isFavorite, getFavoritesCount } = useFavorites();

  // Загрузка популярных аниме
  useEffect(() => {
    loadPopularAnimes();
  }, [currentPage, statusFilter]);

  // Обработка поиска с дебаунсингом
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearchDropdown(searchTerm);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadPopularAnimes = async () => {
    setLoading(true);
    try {
      let apiUrl = `/api/anime/popular?limit=20&page=${currentPage}&order=popularity`;
      
      if (statusFilter !== "all") {
        apiUrl += `&status=${statusFilter}`;
      }

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setAnimes(data);
        setTotalPages(Math.ceil(data.length / 20));
      } else {
        throw new Error("Failed to fetch animes");
      }
    } catch (error) {
      console.error("Error loading animes:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить аниме. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPopularAnimes();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/anime/search?q=${encodeURIComponent(searchTerm)}&limit=20`);

      if (response.ok) {
        const data = await response.json();
        setAnimes(data);
        setShowSearchDropdown(false);
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

  const handleSearchDropdown = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      const response = await fetch(`/api/anime/search?q=${encodeURIComponent(term)}&limit=8`);

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error("Error searching dropdown:", error);
    }
  };

  const handleSearchResultClick = (animeId: number) => {
    setShowSearchDropdown(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(`/anime/${animeId}`);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Навигация */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Логотип */}
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">AniNex</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Поиск с выпадающим списком */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск аниме..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-64 pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Выпадающий список результатов поиска */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {/* Здесь будут динамически добавляться результаты поиска */}
                  <div className="p-2 text-sm text-muted-foreground">
                    Нажмите Enter для поиска "{searchTerm}"
                  </div>
                </div>
              )}
            </div>
            
            {/* Переключатель темы */}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Главный баннер */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10" />
        <img
          src="https://picsum.photos/seed/anime-banner/1920/400"
          alt="Featured Anime"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Аниме портал с плеерами Kodik и Alloha
              </h2>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Лучшие аниме с высоким качеством видео
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Play className="mr-2 h-5 w-5" />
                  Смотреть
                </Button>
                <Button variant="secondary" size="lg">
                  Подробнее
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Контент */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="popular" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="popular">Популярные</TabsTrigger>
              <TabsTrigger value="ongoing">Онгоинги</TabsTrigger>
              <TabsTrigger value="new">Новинки</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
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
          </div>

          <TabsContent value="popular" className="mt-0">
            <AnimeGrid
              animes={animes}
              loading={loading}
              onAnimeClick={handleAnimeClick}
              onFavoriteClick={handleFavoriteClick}
              getStatusText={getStatusText}
              isFavorite={isFavorite}
            />
          </TabsContent>
          
          <TabsContent value="ongoing" className="mt-0">
            <AnimeGrid
              animes={animes.filter(a => a.status === "ongoing")}
              loading={loading}
              onAnimeClick={handleAnimeClick}
              onFavoriteClick={handleFavoriteClick}
              getStatusText={getStatusText}
              isFavorite={isFavorite}
            />
          </TabsContent>
          
          <TabsContent value="new" className="mt-0">
            <AnimeGrid
              animes={animes}
              loading={loading}
              onAnimeClick={handleAnimeClick}
              onFavoriteClick={handleFavoriteClick}
              getStatusText={getStatusText}
              isFavorite={isFavorite}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface AnimeGridProps {
  animes: Anime[];
  loading: boolean;
  onAnimeClick: (id: number) => void;
  onFavoriteClick: (anime: Anime, e: React.MouseEvent) => void;
  getStatusText: (status: string) => string;
  isFavorite: (id: number) => boolean;
}

function AnimeGrid({ animes, loading, onAnimeClick, onFavoriteClick, getStatusText, isFavorite }: AnimeGridProps) {
  if (loading) {
    return (
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
    );
  }

  if (animes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Аниме не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {animes.map((anime) => (
        <Card 
          key={anime.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
          onClick={() => onAnimeClick(anime.id)}
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
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Badge variant="secondary" className="bg-black/80 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {anime.score || "N/A"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-black/80 hover:bg-black/90 text-white hover:text-white"
                onClick={(e) => onFavoriteClick(anime, e)}
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
  );
}