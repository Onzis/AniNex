"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Play, Star, Heart, Filter, Moon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface HeaderProps {
  showSearch?: boolean;
  showLogo?: boolean;
  currentPage?: string;
}

export function Header({ showSearch = true, showLogo = true, currentPage }: HeaderProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { toast } = useToast();
  const { favorites, getFavoritesCount } = useFavorites();

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await fetch(`/api/anime/search?q=${encodeURIComponent(searchTerm)}&limit=20`);

      if (response.ok) {
        const data = await response.json();
        setShowSearchDropdown(false);
        setSearchTerm("");
        setSearchResults([]);
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
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
    }
  };

  const handleSearchResultClick = (animeId: number) => {
    setShowSearchDropdown(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(`/anime/${animeId}`);
  };

  const handleFavoritesClick = () => {
    router.push("/favorites");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Логотип */}
          {showLogo && (
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHomeClick}>
              <Play className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">AniNex</h1>
            </div>
          )}

          {/* Текущая страница (если указана) */}
          {currentPage && (
            <div className="hidden md:block">
              <span className="text-muted-foreground">/</span>
              <span className="ml-2 text-lg font-medium">{currentPage}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Поиск с выпадающим списком */}
          {showSearch && (
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
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((anime) => (
                    <div
                      key={anime.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSearchResultClick(anime.id)}
                    >
                      <img
                        src={`https://shikimori.one${anime.image.original}`}
                        alt={anime.russian || anime.name}
                        className="w-12 h-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/seed/anime-${anime.id}/48/64`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {anime.russian || anime.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {anime.score || "N/A"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {anime.episodes || anime.episodes_aired || "?"} эп.
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Кнопка избранного */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleFavoritesClick}
            className="relative"
          >
            <Heart className="h-5 w-5" />
            {getFavoritesCount() > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-5"
              >
                {getFavoritesCount()}
              </Badge>
            )}
          </Button>
          
          {/* Переключатель темы */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}