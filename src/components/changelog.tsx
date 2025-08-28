"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ChangelogProps {
  className?: string;
}

export function Changelog({ className }: ChangelogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const changelogItems = [
    { version: "v1.29.0", description: "Обновлен интерфейс контейнера" },
    { version: "v1.28.0", description: "Добавлена поддержка Lumex плеера" },
    { version: "v1.27.0", description: "Добавлена поддержка Lumex плеера" },
    { version: "v1.26.0", description: "Улучшена система уведомлений" },
    { version: "v1.25.0", description: "Добавлен выбор плеера через выпадающий список" },
    { version: "v1.24.0", description: "Оптимизирована работа с API Kodik" },
    { version: "v1.23.0", description: "Исправлены ошибки в работе Turbo плеера" },
    { version: "v1.22.0", description: "Добавлено кеширование запросов" },
    { version: "v1.21.0", description: "Улучшена обработка ошибок" },
  ];

  return (
    <Card className={`transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        <div
          className={`bg-black border-b cursor-pointer transition-all duration-300 ${
            isExpanded ? "border-transparent" : "border-gray-800"
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between p-4 hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
              <span className="text-gray-300 font-medium">История изменений</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              asChild
            >
              <a
                href="https://github.com/Onzis/ShikiPlayer"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                GitHub
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
        
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {changelogItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <span className="text-blue-400 font-medium min-w-fit">
                  {item.version}
                </span>
                <span className="text-gray-400">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}