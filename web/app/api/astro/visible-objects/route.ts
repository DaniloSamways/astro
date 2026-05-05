import { NextRequest } from 'next/server';
import { proxyRequest } from '../_proxy';

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'visible-objects');
}