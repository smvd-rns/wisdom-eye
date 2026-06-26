// Cache key: playlistId -> { videos, lastFetched }
const videosCache = new Map();
const playlistCache = new Map();
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

async function resolvePlaylistId(channelUrl, apiKey) {
  if (!channelUrl) return 'UU9Pap1xwEQAo7X1tKqpcpWg';
  
  if (playlistCache.has(channelUrl)) {
    return playlistCache.get(channelUrl);
  }

  try {
    const cleanUrl = channelUrl.trim();

    // 1. Match UC/UU channel/playlist ID anywhere in the URL string
    const channelIdMatch = cleanUrl.match(/(UC|UU)([a-zA-Z0-9_-]{22})/);
    if (channelIdMatch) {
      const playlistId = 'UU' + channelIdMatch[2];
      playlistCache.set(channelUrl, playlistId);
      return playlistId;
    }

    // 3. Try to extract username or handle
    let handle = null;
    let username = null;

    if (cleanUrl.includes('@')) {
      const handleMatch = cleanUrl.match(/@([a-zA-Z0-9_-]+)/);
      if (handleMatch) handle = '@' + handleMatch[1];
    } else {
      const cMatch = cleanUrl.match(/\/(?:c|user)\/([a-zA-Z0-9_-]+)/);
      if (cMatch) {
        username = cMatch[1];
      } else {
        const parts = cleanUrl.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart !== 'youtube.com' && lastPart !== 'www.youtube.com') {
          if (lastPart.startsWith('@')) {
            handle = lastPart;
          } else {
            handle = '@' + lastPart;
            username = lastPart;
          }
        }
      }
    }

    let resolvedChannelId = null;

    if (handle) {
      const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?handle=${encodeURIComponent(handle)}&part=contentDetails&key=${apiKey}`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.items && apiData.items.length > 0) {
          resolvedChannelId = apiData.items[0].id;
        }
      }
    }

    if (!resolvedChannelId && username) {
      const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?forUsername=${encodeURIComponent(username)}&part=contentDetails&key=${apiKey}`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.items && apiData.items.length > 0) {
          resolvedChannelId = apiData.items[0].id;
        }
      }
    }

    if (!resolvedChannelId) {
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(handle || username || cleanUrl)}&type=channel&part=snippet&key=${apiKey}`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          resolvedChannelId = searchData.items[0].id.channelId;
        }
      }
    }

    if (resolvedChannelId && resolvedChannelId.startsWith('UC')) {
      const playlistId = 'UU' + resolvedChannelId.substring(2);
      playlistCache.set(channelUrl, playlistId);
      return playlistId;
    }
  } catch (err) {
    console.error('Error resolving playlist ID from channel URL:', err);
  }

  return 'UU9Pap1xwEQAo7X1tKqpcpWg';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const channelUrlParam = searchParams.get('channelUrl');
  const channelIdParam = searchParams.get('channelId');
  const videoUrl = searchParams.get('url');

  if (videoUrl) {
    try {
      const videoId = extractVideoId(videoUrl);
      if (videoId) {
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

  try {
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(request);
    const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyBMh3y_e7r18Dr7JSOoZGPYIe-ZZ7mp3zc';
    
    let playlistId;
    
    if (channelIdParam) {
      // Direct channel ID provided (e.g. UC9Pap1xwEQAo7X1tKqpcpWg) → convert to uploads playlist
      const rawId = channelIdParam.trim();
      if (rawId.startsWith('UC') && rawId.length === 24) {
        playlistId = 'UU' + rawId.substring(2);
      } else if (rawId.startsWith('UU') && rawId.length === 24) {
        playlistId = rawId;
      } else {
        // Treat it as a URL/handle and resolve
        playlistId = await resolvePlaylistId(rawId, apiKey);
      }
    } else if (channelUrlParam) {
      // Full URL or handle provided via query param
      playlistId = await resolvePlaylistId(channelUrlParam, apiKey);
    } else {
      // Fall back to the tenant's saved youtube_url from DB
      const youtubeUrl = tenant?.youtube_url;
      playlistId = await resolvePlaylistId(youtubeUrl, apiKey);
    }

    const now = Date.now();
    const cached = videosCache.get(playlistId);
    
    if (cached && (now - cached.lastFetched < CACHE_DURATION)) {
      return Response.json(cached.videos, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        }
      });
    }
    
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
    
    videosCache.set(playlistId, { videos, lastFetched: now });
    
    return Response.json(videos, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      }
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    return Response.json({ error: error.message }, { status: 500 });
  }
}
