"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const router = useRouter();
  const [popularAnimes, setPopularAnimes] = useState<Anime[]>([]);
  const [ongoingAnimes, setOngoingAnimes] = useState<Anime[]>([]);
  const [newAnimes, setNewAnimes] = useState<Anime[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingOngoing, setLoadingOngoing] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingMorePopular, setLoadingMorePopular] = useState(false);
  const [loadingMoreOngoing, setLoadingMoreOngoing] = useState(false);
  const [loadingMoreNew, setLoadingMoreNew] = useState(false);
  const [popularPage, setPopularPage] = useState(1);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [newPage, setNewPage] = useState(1);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [hasMoreOngoing, setHasMoreOngoing] = useState(true);
  const [hasMoreNew, setHasMoreNew] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("popular");
  const { toast } = useToast();
  const { favorites, toggleFavorite, isFavorite, getFavoritesCount } = useFavorites();

  // Загрузка популярных аниме
  useEffect(() => {
    loadPopularAnimes();
    loadOngoingAnimes();
    loadNewAnimes();
  }, []);

  // Обновление популярных аниме при изменении фильтра
  useEffect(() => {
    setPopularPage(1);
    setPopularAnimes([]);
    setHasMorePopular(true);
    loadPopularAnimes();
  }, [statusFilter]);

  // Обработка бесконечного скролла
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 1000) { // 1000px до конца
        if (activeTab === "popular" && !loadingPopular && !loadingMorePopular && hasMorePopular) {
          loadMorePopularAnimes();
        } else if (activeTab === "ongoing" && !loadingOngoing && !loadingMoreOngoing && hasMoreOngoing) {
          loadMoreOngoingAnimes();
        } else if (activeTab === "new" && !loadingNew && !loadingMoreNew && hasMoreNew) {
          loadMoreNewAnimes();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, loadingPopular, loadingOngoing, loadingNew, loadingMorePopular, loadingMoreOngoing, loadingMoreNew, hasMorePopular, hasMoreOngoing, hasMoreNew]);

  const loadPopularAnimes = async (reset = true) => {
    if (reset) {
      setLoadingPopular(true);
      setPopularPage(1);
      setPopularAnimes([]);
    } else {
      setLoadingMorePopular(true);
    }
    
    try {
      const page = reset ? 1 : popularPage;
      let apiUrl = `/api/anime/popular?limit=20&page=${page}&order=popularity`;
      
      if (statusFilter !== "all") {
        apiUrl += `&status=${statusFilter}`;
      }

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setPopularAnimes(data);
        } else {
          setPopularAnimes(prev => [...prev, ...data]);
        }
        
        // Если получили меньше 20 аниме, значит это последняя страница
        if (data.length < 20) {
          setHasMorePopular(false);
        } else {
          setPopularPage(prev => prev + 1);
        }
      } else {
        throw new Error("Failed to fetch popular animes");
      }
    } catch (error) {
      console.error("Error loading popular animes:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить популярные аниме. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      if (reset) {
        setLoadingPopular(false);
      } else {
        setLoadingMorePopular(false);
      }
    }
  };

  const loadMorePopularAnimes = async () => {
    await loadPopularAnimes(false);
  };

  const loadOngoingAnimes = async (reset = true) => {
    if (reset) {
      setLoadingOngoing(true);
      setOngoingPage(1);
      setOngoingAnimes([]);
    } else {
      setLoadingMoreOngoing(true);
    }
    
    try {
      const page = reset ? 1 : ongoingPage;
      const response = await fetch(`/api/anime/popular?limit=20&page=${page}&order=popularity&status=ongoing`);

      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setOngoingAnimes(data);
        } else {
          setOngoingAnimes(prev => [...prev, ...data]);
        }
        
        // Если получили меньше 20 аниме, значит это последняя страница
        if (data.length < 20) {
          setHasMoreOngoing(false);
        } else {
          setOngoingPage(prev => prev + 1);
        }
      } else {
        throw new Error("Failed to fetch ongoing animes");
      }
    } catch (error) {
      console.error("Error loading ongoing animes:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить онгоинги. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      if (reset) {
        setLoadingOngoing(false);
      } else {
        setLoadingMoreOngoing(false);
      }
    }
  };

  const loadMoreOngoingAnimes = async () => {
    await loadOngoingAnimes(false);
  };

  const loadNewAnimes = async (reset = true) => {
    if (reset) {
      setLoadingNew(true);
      setNewPage(1);
      setNewAnimes([]);
    } else {
      setLoadingMoreNew(true);
    }
    
    try {
      // Получаем анонсы - самые ожидаемые новинки
      const page = reset ? 1 : newPage;
      const response = await fetch(`/api/anime/popular?limit=15&page=${page}&status=anons&order=id`);
      
      let data;
      if (response.ok) {
        const anons = await response.json();
        
        // Получаем онгоинги - текущие новинки
        const ongoingResponse = await fetch(`/api/anime/popular?limit=15&page=${page}&status=ongoing&order=id`);
        
        if (ongoingResponse.ok) {
          const ongoing = await ongoingResponse.json();
          
          // Объединяем анонсы и онгоинги, сортируем по ID (новые выше)
          const combined = [...anons, ...ongoing]
            .sort((a, b) => b.id - a.id) // Сортировка по ID в обратном порядке
            .slice(0, 20); // Берем только 20 самых свежих
            
          data = combined;
        } else {
          // Если не удалось получить онгоинги, используем только анонсы
          data = anons;
        }
      } else {
        // Если не удалось получить анонсы, пробуем получить самые свежие по ID
        const fallbackResponse = await fetch(`/api/anime/popular?limit=20&page=${page}&order=id`);
        if (fallbackResponse.ok) {
          data = await fallbackResponse.json();
          // Реверсируем массив, чтобы самые новые были первыми
          data = data.reverse();
        } else {
          throw new Error("Failed to fetch new animes");
        }
      }
      
      if (reset) {
        setNewAnimes(data);
      } else {
        setNewAnimes(prev => [...prev, ...data]);
      }
      
      // Если получили мало аниме, значит это последняя страница
      if (data.length < 15) {
        setHasMoreNew(false);
      } else {
        setNewPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error loading new animes:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить новинки. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      if (reset) {
        setLoadingNew(false);
      } else {
        setLoadingMoreNew(false);
      }
    }
  };

  const loadMoreNewAnimes = async () => {
    await loadNewAnimes(false);
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
      {/* Шапка сайта */}
      <Header />

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
        <Tabs defaultValue="popular" className="w-full" onValueChange={(value) => setActiveTab(value)}>
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
              animes={popularAnimes}
              loading={loadingPopular}
              loadingMore={loadingMorePopular}
              hasMore={hasMorePopular}
              onAnimeClick={handleAnimeClick}
              onFavoriteClick={handleFavoriteClick}
              getStatusText={getStatusText}
              isFavorite={isFavorite}
            />
          </TabsContent>
          
          <TabsContent value="ongoing" className="mt-0">
            <AnimeGrid
              animes={ongoingAnimes}
              loading={loadingOngoing}
              loadingMore={loadingMoreOngoing}
              hasMore={hasMoreOngoing}
              onAnimeClick={handleAnimeClick}
              onFavoriteClick={handleFavoriteClick}
              getStatusText={getStatusText}
              isFavorite={isFavorite}
            />
          </TabsContent>
          
          <TabsContent value="new" className="mt-0">
            <AnimeGrid
              animes={newAnimes}
              loading={loadingNew}
              loadingMore={loadingMoreNew}
              hasMore={hasMoreNew}
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
  loadingMore?: boolean;
  hasMore?: boolean;
  onAnimeClick: (id: number) => void;
  onFavoriteClick: (anime: Anime, e: React.MouseEvent) => void;
  getStatusText: (status: string) => string;
  isFavorite: (id: number) => boolean;
}

function AnimeGrid({ animes, loading, loadingMore = false, hasMore = true, onAnimeClick, onFavoriteClick, getStatusText, isFavorite }: AnimeGridProps) {
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
    <div className="space-y-6">
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
      
      {/* Индикатор загрузки дополнительных данных */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Сообщение о завершении загрузки */}
      {!hasMore && animes.length > 0 && !loading && (
        <div className="text-center py-4 text-muted-foreground">
          Вы просмотрели все доступные аниме
        </div>
      )}
    </div>
  );
}