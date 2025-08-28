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
    // Сначала получаем информацию из Kodik API
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

    // Возвращаем URL для плеера Kodik
    const playerUrl = `https://kodik.cc/find-player?shikimoriID=${animeId}&episode=${episode}`;
    
    return NextResponse.json({
      playerUrl,
      type: 'kodik',
      animeId,
      episode
    });
  } catch (error) {
    console.error('Error fetching Kodik player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Kodik player' },
      { status: 500 }
    );
  }
}