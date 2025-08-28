import { NextRequest, NextResponse } from 'next/server';

const KodikToken = "447d179e875efe44217f20d1ee2146be";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('animeId');
  const episode = searchParams.get('episode') || '1';

  if (!animeId) {
    return NextResponse.json({ error: 'Anime ID is required' }, { status: 400 });
  }

  try {
    // Получаем kinopoisk_id через Kodik API
    const kodikResponse = await fetch(`https://kodikapi.com/search?token=${KodikToken}&shikimori_id=${animeId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!kodikResponse.ok) {
      throw new Error(`Failed to fetch from Kodik API: ${kodikResponse.status}`);
    }

    const kodikData = await kodikResponse.json();
    
    if (!kodikData.results || kodikData.results.length === 0) {
      return NextResponse.json({ error: 'No results found for this anime' }, { status: 404 });
    }

    const { kinopoisk_id } = kodikData.results[0];
    
    if (!kinopoisk_id) {
      return NextResponse.json({ error: 'No kinopoisk_id found' }, { status: 404 });
    }

    // Получаем данные из Kinobox API
    const kinoboxUrl = `https://api.kinobox.tv/api/players?kinopoisk=${kinopoisk_id}`;
    
    const kinoboxResponse = await fetch(kinoboxUrl, {
      headers: {
        Referer: "https://kinohost.web.app/",
        Origin: "https://kinohost.web.app",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
    });

    if (!kinoboxResponse.ok) {
      throw new Error(`Failed to fetch from Kinobox API: ${kinoboxResponse.status}`);
    }

    const kinoboxData = await kinoboxResponse.json();
    
    if (!kinoboxData.data || kinoboxData.data.length === 0) {
      return NextResponse.json({ error: 'No players found' }, { status: 404 });
    }

    const lumexPlayer = kinoboxData.data.find((player: any) => player.type === "Lumex");
    
    if (!lumexPlayer || !lumexPlayer.iframeUrl) {
      return NextResponse.json({ error: 'Lumex player not found' }, { status: 404 });
    }

    // Добавляем параметр эпизода, если он есть
    let playerUrl = lumexPlayer.iframeUrl;
    if (episode && episode !== '1') {
      playerUrl += (playerUrl.includes("?") ? "&" : "?") + "episode=" + episode;
    }
    
    return NextResponse.json({
      playerUrl,
      type: 'lumex',
      animeId,
      episode
    });
  } catch (error) {
    console.error('Error fetching Lumex player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Lumex player' },
      { status: 500 }
    );
  }
}