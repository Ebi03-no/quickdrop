export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/upload' && request.method === 'POST') {
      return handleUpload(request, env, corsHeaders);
    }

    if (url.pathname.startsWith('/download/') && request.method === 'GET') {
      return handleDownload(url.pathname.replace('/download/', ''), env);
    }

    if (url.pathname.startsWith('/info/') && request.method === 'GET') {
      return handleInfo(url.pathname.replace('/info/', ''), env, corsHeaders);
    }

    return new Response('Not Found', { status: 404 });
  },
};

const MAX_SIZE = 25 * 1024 * 1024; // سقف KV: ۲۵ مگابایت

async function handleUpload(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return json({ error: 'فایلی ارسال نشده' }, 400, corsHeaders);
    }

    if (file.size > MAX_SIZE) {
      return json({ error: 'حجم فایل بیش از حد مجاز است (۲۵ مگابایت)' }, 400, corsHeaders);
    }

    const fileId = generateId();
    const buffer = await file.arrayBuffer();

    const meta = {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    };

    await Promise.all([
      env.FILES_KV.put('file:' + fileId, buffer),
      env.FILES_KV.put('meta:' + fileId, JSON.stringify(meta)),
    ]);

    return json({
      success: true,
      fileId: fileId,
      fileName: file.name,
      fileSize: file.size,
    }, 200, corsHeaders);
  } catch (err) {
    return json({ error: err.message }, 500, corsHeaders);
  }
}

async function handleDownload(fileId, env) {
  const data = await env.FILES_KV.get('file:' + fileId, 'arrayBuffer');
  if (!data) return new Response('فایل یافت نشد', { status: 404 });

  const meta = await env.FILES_KV.get('meta:' + fileId, 'json');

  return new Response(data, {
    headers: {
      'Content-Type': meta?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(meta?.fileName || 'file')}"`,
      'Content-Length': data.byteLength,
    },
  });
}

async function handleInfo(fileId, env, corsHeaders) {
  const meta = await env.FILES_KV.get('meta:' + fileId, 'json');
  if (!meta) return json({ error: 'not found' }, 404, corsHeaders);
  return json(meta, 200, corsHeaders);
}

function json(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateId() {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}