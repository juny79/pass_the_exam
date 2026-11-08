import { NextRequest, NextResponse } from 'next/server';
import examData from '@/data/exam_data.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const certId = searchParams.get('cert_id') || 'is_engineer';

  const cert = examData.certifications.find((c: any) => c.id === certId);
  if (!cert) {
    return NextResponse.json({ error: '자격증을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json(cert.subjects || []);
}
