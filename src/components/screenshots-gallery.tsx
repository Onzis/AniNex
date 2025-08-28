"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScreenshotsGalleryProps {
  screenshots: any[];
}

export function ScreenshotsGallery({ screenshots }: ScreenshotsGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Группируем скриншоты по 3x2 = 6 штук на страницу
  const screenshotsPerPage = 6;
  const totalPages = Math.ceil(screenshots.length / screenshotsPerPage);
  
  const getCurrentPageScreenshots = () => {
    const start = currentIndex * screenshotsPerPage;
    const end = start + screenshotsPerPage;
    return screenshots.slice(start, end);
  };

  const createScreenshotGrid = (pageScreenshots: any[]) => {
    const grid = [];
    for (let i = 0; i < 6; i++) {
      if (i < pageScreenshots.length) {
        grid.push(pageScreenshots[i]);
      } else {
        // Добавляем пустые места для заполнения сетки 3x2
        grid.push(null);
      }
    }
    return grid;
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (index: number) => {
    setCurrentIndex(index);
  };

  // Обработчики для свайпа мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }

    const diff = startX - currentX;
    const threshold = 50; // Порог для свайпа

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Свайп влево - следующая страница
        goToNext();
      } else {
        // Свайп вправо - предыдущая страница
        goToPrev();
      }
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  // Обработчики для тач-событий
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  if (screenshots.length === 0) {
    return null;
  }

  const currentScreenshots = getCurrentPageScreenshots();
  const screenshotGrid = createScreenshotGrid(currentScreenshots);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Скриншоты</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Галерея скриншотов */}
          <div
            ref={containerRef}
            className="relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: 'grab' }}
          >
            {/* Сетка 3x2 */}
            <div className="grid grid-cols-3 gap-2">
              {screenshotGrid.map((screenshot, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {screenshot ? (
                    <img
                      src={`https://shikimori.one${screenshot.original}`}
                      alt={`Скриншот ${currentIndex * screenshotsPerPage + index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/screenshot-${currentIndex * screenshotsPerPage + index + 1}/400/225`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">Нет скриншота</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Кнопки навигации */}
            {totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={goToPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Индикаторы страниц */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Информация о странице */}
          {totalPages > 1 && (
            <div className="text-center text-sm text-muted-foreground">
              Страница {currentIndex + 1} из {totalPages}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}