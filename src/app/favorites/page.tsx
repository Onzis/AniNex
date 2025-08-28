"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, Clock, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, isLoading, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  const handleAnimeClick = (animeId: number) => {
    router.push(`/anime/${animeId}`);
  };

  const handleRemoveFavorite = (anime: any, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromFavorites(anime.id);
    toast({
      title: "Удалено из избранного",
      description: `${anime.russian || anime.name} удалено из избранного`,
    });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Шапка сайта */}
      <Header currentPage="Избранное" showSearch={false} />

      <div className="container mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Избранное пусто</h2>
            <p className="text-muted-foreground mb-6">
              Вы еще не добавили ни одного аниме в избранное
            </p>
            <Button onClick={() => router.push("/")}>
              Перейти к аниме
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Ваши избранные аниме ({favorites.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((anime) => (
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
                      <Heart className="h-8 w-8 text-red-500 fill-current" />
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
                        onClick={(e) => handleRemoveFavorite(anime, e)}
                      >
                        <Heart className="h-4 w-4 fill-current text-red-500" />
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
                      <span>{anime.episodes || "?"} эп.</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Добавлено: {new Date(anime.addedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}