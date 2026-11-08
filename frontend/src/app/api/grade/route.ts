import { NextRequest, NextResponse } from 'next/server';
import examData from '@/data/exam_data.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question_id, choice_answer, essay_answer } = body;

    const question = examData.sample_questions.find((q: any) => q.id === question_id);
    if (!question) {
      return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 1. 객관식 채점
    if (question.question_type === 'MULTIPLE_CHOICE') {
      const correctOpt = question.options?.find((o: any) => o.is_correct);
      const isCorrect = choice_answer !== undefined && correctOpt && choice_answer === correctOpt.option_no;
      const score = isCorrect ? (question.points || 1.0) : 0.0;
      const feedback = isCorrect 
        ? '정답입니다! 핵심 개념을 완벽히 이해하고 있습니다.' 
        : `오답입니다. (정답: ${correctOpt?.option_no}번)`;

      return NextResponse.json({
        question_id,
        is_correct: isCorrect,
        score,
        max_score: question.points || 1.0,
        feedback,
        explanation: question.explanation || '',
        topic_title: question.topic_title || '',
        frequency: question.frequency || '',
        probability: question.probability || '',
      });
    }

    // 2. 주관식/서술형 채점
    if (['ESSAY', 'SHORT_ANSWER'].includes(question.question_type)) {
      const rubric = question.rubric;
      const text = (essay_answer || '').trim();

      if (!rubric || !text) {
        return NextResponse.json({
          question_id,
          is_correct: false,
          score: 0.0,
          max_score: question.points || 10.0,
          feedback: '답안이 비어 있거나 채점 기준이 없습니다.',
          explanation: question.explanation || '',
        });
      }

      let matchedScore = 0.0;
      const keywordsMatched: string[] = [];
      const keywordsMissed: string[] = [];

      for (const item of rubric.mandatory_keywords || []) {
        const primary = (item.keyword || '').toLowerCase();
        const synonyms = (item.synonyms || []).map((s: string) => s.toLowerCase());
        const searchPool = [primary, ...synonyms];

        const isHit = searchPool.some((k) => text.toLowerCase().includes(k));
        if (isHit) {
          matchedScore += item.points || 0;
          keywordsMatched.push(item.keyword);
        } else {
          keywordsMissed.push(item.keyword);
        }
      }

      const maxScore = question.points || 10.0;
      matchedScore = Math.min(matchedScore, maxScore);
      const isCorrect = matchedScore >= maxScore * 0.6;

      let feedback = '';
      if (isCorrect) {
        feedback = `우수한 답안입니다! (획득: ${matchedScore.toFixed(1)} / ${maxScore}점)`;
      } else {
        feedback = `부분 점수 부여: ${matchedScore.toFixed(1)} / ${maxScore}점 (핵심 키워드 보완 필요)`;
      }

      return NextResponse.json({
        question_id,
        is_correct: isCorrect,
        score: matchedScore,
        max_score: maxScore,
        feedback,
        explanation: question.explanation || '',
        keywords_matched: keywordsMatched,
        keywords_missed: keywordsMissed,
        reference_essay: rubric.reference_essay || '',
      });
    }

    return NextResponse.json({ error: '지원되지 않는 문제 유형입니다.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
