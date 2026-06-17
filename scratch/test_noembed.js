async function test() {
  const videoId = 'dQw4w9WgXcQ';
  const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url);
    console.log('noembed status:', res.status);
    const data = await res.json();
    console.log('noembed data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
