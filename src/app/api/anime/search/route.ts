import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '20';
  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let apiUrl = `https://shikimori.one/api/animes?limit=${limit}&page=${page}&search=${encodeURIComponent(query)}`;
    
    if (status && status !== 'all') {
      apiUrl += `&status=${status}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Shikimori API: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching animes:', error);
    return NextResponse.json(
      { error: 'Failed to search animes' },
      { status: 500 }
    );
  }
}