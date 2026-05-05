import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.ASTRO_API_URL ?? 'http://localhost:3001/api/v1';

export async function proxyRequest(request: NextRequest, path: string) {
  const targetUrl = new URL(path.replace(/^\//, ''), `${BACKEND_BASE_URL.replace(/\/$/, '')}/`);
  targetUrl.search = request.nextUrl.search;

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: {
      accept: 'application/json',
    },
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? 'application/json';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type': contentType,
    },
  });
}