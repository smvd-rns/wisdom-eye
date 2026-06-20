let cachedVideos = null;
let lastFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function extractVideoId(url) {
  if (!url) return null;
  // Match standard, live, premier, shorts, embed, and playlist-associated youtube URLs
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (videoUrl) {
    try {
      const videoId = extractVideoId(videoUrl);
      if (videoId) {
        // Fetch via YouTube Data API (unblocked domain 'googleapis.com') to get both title and duration
        const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyBMh3y_e7r18Dr7JSOoZGPYIe-ZZ7mp3zc';
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;
        const apiRes = await fetch(apiUrl);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.items && apiData.items.length > 0) {
            const item = apiData.items[0];
            const title = item.snippet.title;
            const isoDuration = item.contentDetails?.duration || '';
            const durationSeconds = parseISO8601Duration(isoDuration);
            return Response.json({
              title,
              duration: durationSeconds || null,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
            });
          }
        }
      }

      // Fallback: Fetch via noembed.com (unblocked proxy service) to resolve at least the title
      const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`;
      const res = await fetch(noembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          return Response.json({
            title: data.title,
            duration: null,
            thumbnail: data.thumbnail_url
          });
        }
      }

      return Response.json({ error: 'Failed to retrieve video metadata' }, { status: 400 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

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
