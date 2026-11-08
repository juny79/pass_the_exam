import { NextResponse } from 'next/server';
import examData from '@/data/exam_data.json';

export async function GET() {
  return NextResponse.json(examData.certifications || []);
}
