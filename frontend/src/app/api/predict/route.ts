import { NextRequest, NextResponse } from 'next/server';
import examData from '@/data/exam_data.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cert_id, subject_scores } = body;

    const cert = examData.certifications.find((c: any) => c.id === cert_id);
    if (!cert) {
      return NextResponse.json({ error: '자격증을 찾을 수 없습니다.' }, { status: 404 });
    }

    const scores = Object.values(subject_scores || {}).map((s: any) => Number(s) || 0);
    if (scores.length === 0) {
      return NextResponse.json({
        is_passed: false,
        average_score: 0.0,
        has_failing_subject: true,
        failing_subjects: [],
        pass_probability_pct: 0.0,
        ai_recommendation: '모든 과목의 예상 점수를 입력해주세요.',
      });
    }

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const failingSubjects: string[] = [];

    cert.subjects?.forEach((s: any) => {
      const score = Number(subject_scores[s.code]) || 0;
      if (score < 40) {
        failingSubjects.push(`${s.name} (${score}점 - 과락 기준 40점 미만)`);
      }
    });

    const hasFailing = failingSubjects.length > 0;
    const isPassed = !hasFailing && avg >= 60;

    let prob = 0.0;
    if (avg >= 80 && !hasFailing) prob = 95.0;
    else if (avg >= 70 && !hasFailing) prob = 85.0;
    else if (avg >= 60 && !hasFailing) prob = 65.0;
    else if (avg >= 55) prob = 40.0;
    else prob = 20.0;

    let recommendation = '';
    if (isPassed) {
      recommendation = `🎉 축하합니다! 현재 모의 점수 기준 평균 ${avg.toFixed(1)}점으로 합격권입니다. 취약 영역의 오답을 점검하며 실전 감각을 유지하세요.`;
    } else if (hasFailing) {
      recommendation = `⚠️ 과락 위험 과목(${failingSubjects.join(', ')})이 발견되었습니다! 평균 60점을 넘기더라도 한 과목이라도 40점 미만이면 불합격 처리되므로 해당 과목 집중 보완이 시급합니다.`;
    } else {
      recommendation = `💪 평균 점수(${avg.toFixed(1)}점)가 합격 기준(60점)에 다소 미달합니다. 빈출도가 높은 70% 이상 핵심 토픽을 우선 암기하여 평균을 60점 이상으로 끌어올리세요.`;
    }

    return NextResponse.json({
      is_passed: isPassed,
      average_score: Math.round(avg * 10) / 10,
      has_failing_subject: hasFailing,
      failing_subjects: failingSubjects,
      pass_probability_pct: prob,
      ai_recommendation: recommendation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
