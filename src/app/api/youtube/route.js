let cachedVideos = null;
let lastFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const now = Date.now();
  
  // Return in-memory cache if fresh
  if (cachedVideos && (now - lastFetched < CACHE_DURATION)) {
    return Response.json(cachedVideos, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      }
    });
  }
  
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyBMh3y_e7r18Dr7JSOoZGPYIe-ZZ7mp3zc';
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID || 'UU9Pap1xwEQAo7X1tKqpcpWg';
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=50&key=${apiKey}`;
    
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      throw new Error(`YouTube API returned status ${res.status}`);
    }
    
    const data = await res.json();
    const videos = data.items?.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt
    })) || [];
    
    cachedVideos = videos;
    lastFetched = now;
    
    return Response.json(videos, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      }
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // Return cached videos as a fallback if the API fails
    if (cachedVideos) {
      return Response.json(cachedVideos, {
        headers: {
          'Cache-Control': 'public, s-maxage=300', // Short cache on failure
        }
      });
    }
    
    return Response.json({ error: error.message }, { status: 500 });
  }
}
