import { NextRequest, NextResponse } from 'next/server';
import examData from '@/data/exam_data.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const certId = searchParams.get('cert_id') || 'is_engineer';
  const examType = searchParams.get('exam_type');

  let questions = examData.sample_questions || [];
  questions = questions.filter((q: any) => q.cert_id === certId);

  if (examType) {
    questions = questions.filter((q: any) => q.exam_type === examType);
  }

  return NextResponse.json(questions);
}
