import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const animeId = id;

  try {
    // Получаем информацию о видео из API Shikimori
    const response = await fetch(`https://shikimori.one/api/animes/${animeId}/videos`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch anime videos: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching anime videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime videos' },
      { status: 500 }
    );
  }
}