import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('organization_id', tenant.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to query media library:', error);
      return NextResponse.json({ files: [] });
    }

    return NextResponse.json({ files: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const folderId = process.env.MAIN_DRIVE_FOLDER_ID;

    if (!clientId || !clientSecret || !refreshToken || !folderId) {
      return NextResponse.json({ error: 'Google Drive configuration is incomplete on server.' }, { status: 500 });
    }

    // Resolve active tenant
    const { getActiveTenant } = await import('@/lib/tenant');
    const tenant = await getActiveTenant(req);

    // 1. Get access token from refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to authenticate with Google API.', details: tokenData }, { status: 500 });
    }

    const accessToken = tokenData.access_token;

    // 2. Upload file to Google Drive (Multipart upload)
    const boundary = 'WISDOMEYE_UPLOAD_BOUNDARY';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: `upload_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      mimeType: file.type || 'image/jpeg',
      parents: [folderId],
    };

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const multipartBody = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${metadata.mimeType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data +
      closeDelimiter;

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Failed to upload file to Google Drive.', details: uploadData }, { status: 500 });
    }

    const fileId = uploadData.id;

    // 3. Make file public (Anyone with link can view)
    const permissionRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });

    const permissionData = await permissionRes.json();
    if (!permissionRes.ok) {
      return NextResponse.json({ error: 'Failed to set public view permissions on the uploaded file.', details: permissionData }, { status: 500 });
    }

    // Return the formatted Google CDN direct hotlink
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    // 4. Save to media_library database table
    try {
      await supabase.from('media_library').insert({
        url: directUrl,
        file_name: file.name,
        file_type: file.type || 'image/jpeg',
        organization_id: tenant.id
      });
    } catch (dbErr) {
      console.error('Failed to log to media library:', dbErr);
    }

    return NextResponse.json({ success: true, url: directUrl, fileId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error during upload.', details: error.message }, { status: 500 });
  }
}
