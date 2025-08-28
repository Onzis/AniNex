import { NextRequest, NextResponse } from 'next/server';

const KodikToken = "447d179e875efe44217f20d1ee2146be";
const AllohaToken = "96b62ea8e72e7452b652e461ab8b89";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('animeId');
  const episode = searchParams.get('episode') || '1';

  if (!animeId) {
    return NextResponse.json({ error: 'Anime ID is required' }, { status: 400 });
  }

  try {
    // Сначала получаем kinopoisk_id через Kodik API
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

    const { kinopoisk_id, imdb_id } = kodikData.results[0];
    
    if (!kinopoisk_id && !imdb_id) {
      return NextResponse.json({ error: 'No kinopoisk_id or imdb_id found' }, { status: 404 });
    }

    // Формируем URL для Alloha API
    const allohaUrl = kinopoisk_id
      ? `https://api.alloha.tv?token=${AllohaToken}&kp=${kinopoisk_id}`
      : `https://api.alloha.tv?token=${AllohaToken}&imdb=${imdb_id}`;

    const allohaResponse = await fetch(allohaUrl);

    if (!allohaResponse.ok) {
      throw new Error(`Failed to fetch from Alloha API: ${allohaResponse.status}`);
    }

    const allohaData = await allohaResponse.json();

    if (allohaData.status !== "success" || !allohaData.data?.iframe) {
      return NextResponse.json({ error: 'Failed to get Alloha player URL' }, { status: 404 });
    }

    const playerUrl = `${allohaData.data.iframe}&episode=${episode}&season=1`;
    
    return NextResponse.json({
      playerUrl,
      type: 'alloha',
      animeId,
      episode
    });
  } catch (error) {
    console.error('Error fetching Alloha player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Alloha player' },
      { status: 500 }
    );
  }
}