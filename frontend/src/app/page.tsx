'use client';

import React, { useState, useEffect } from 'react';
import { Question, GradingResult, PassPredictionResult } from '../types/exam';
import { 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'WRITTEN' | 'PRACTICAL' | 'PREDICTION'>('WRITTEN');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // CBT / 실기 입력 상태
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [gradingResults, setGradingResults] = useState<Record<string, GradingResult>>({});
  const [gradingLoading, setGradingLoading] = useState<Record<string, boolean>>({});

  // 합격 예측 시뮬레이션 상태
  const [subjectScores, setSubjectScores] = useState({
    SYS_SEC: 65,
    NET_SEC: 70,
    APP_SEC: 55,
    GEN_SEC: 60,
    LAW_MGT: 50,
  });
  const [prediction, setPrediction] = useState<PassPredictionResult | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/questions?cert_id=is_engineer`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (question: Question) => {
    setGradingLoading((prev) => ({ ...prev, [question.id]: true }));
    try {
      const payload = {
        question_id: question.id,
        submitted_choice: selectedChoices[question.id] || null,
        submitted_text: essayAnswers[question.id] || null,
      };

      const res = await fetch(`${API_BASE}/api/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result: GradingResult = await res.json();
        setGradingResults((prev) => ({ ...prev, [question.id]: result }));
      }
    } catch (err) {
      console.error('Grading failed:', err);
    } finally {
      setGradingLoading((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handlePredict = async () => {
    setPredictLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cert_id: 'is_engineer',
          exam_type: 'WRITTEN',
          subject_scores: subjectScores,
        }),
      });

      if (res.ok) {
        const data: PassPredictionResult = await res.json();
        setPrediction(data);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setPredictLoading(false);
    }
  };

  const currentQuestions = questions.filter((q) => q.exam_type === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 상단 네비게이션 */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              PassForge : 정보보안기사
            </h1>
            <p className="text-xs text-slate-400">지능형 자격증 합격 전략 & AI 실기 채점 플랫폼</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('WRITTEN')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'WRITTEN'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            필기 CBT 모의고사
          </button>
          <button
            onClick={() => setActiveTab('PRACTICAL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'PRACTICAL'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            실기 AI 서술형 채점
          </button>
          <button
            onClick={() => setActiveTab('PREDICTION')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'PREDICTION'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            합격 및 과락 예측
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p>문항 데이터 로딩 중...</p>
          </div>
        ) : activeTab === 'PREDICTION' ? (
          /* ================= 합격 예측 시뮬레이터 ================= */
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold">5개 과목별 점수 시뮬레이션 (필기 과락/평균 분석)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                  { key: 'SYS_SEC', label: '1. 시스템 보안' },
                  { key: 'NET_SEC', label: '2. 네트워크 보안' },
                  { key: 'APP_SEC', label: '3. 애플리케이션 보안' },
                  { key: 'GEN_SEC', label: '4. 정보보안 일반' },
                  { key: 'LAW_MGT', label: '5. 관리 및 법규' },
                ].map((sub) => (
                  <div key={sub.key} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <label className="text-xs text-slate-400 font-medium block mb-2">{sub.label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subjectScores[sub.key as keyof typeof subjectScores]}
                      onChange={(e) =>
                        setSubjectScores({
                          ...subjectScores,
                          [sub.key]: Math.min(100, Math.max(0, Number(e.target.value))),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-lg font-bold text-center text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="mt-2 text-right">
                      {subjectScores[sub.key as keyof typeof subjectScores] < 40 && (
                        <span className="text-xs text-rose-400 font-medium">⚠️ 과락 기준</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePredict}
                disabled={predictLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {predictLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                합격 가능성 및 과락 위험도 진단하기
              </button>
            </div>

            {prediction && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  AI 분석 리포트 결과
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-slate-400 mb-1">판정 결과</span>
                    <span className={`text-2xl font-black ${prediction.is_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {prediction.is_passed ? '합격 가능권' : '불합격 / 보완 필요'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-slate-400 mb-1">전과목 평균 점수</span>
                    <span className="text-2xl font-black text-indigo-300">{prediction.average_score}점</span>
                    <span className="text-xs text-slate-500 mt-1">기준: 평균 60점 이상</span>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-slate-400 mb-1">합격 확률 추정치</span>
                    <span className="text-2xl font-black text-amber-400">{prediction.pass_probability_pct}%</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
                  {prediction.analysis_report}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= 문제 풀이 영역 (필기 or 실기) ================= */
          <div className="space-y-8">
            {currentQuestions.map((q) => {
              const result = gradingResults[q.id];
              const isGrading = gradingLoading[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
                >
                  {/* 문항 헤더 */}
                  <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-md">
                        {q.subject_code}
                      </span>
                      <span className="text-xs text-slate-400">#{q.question_number}번 문항</span>
                      <span className="text-xs text-slate-500">| {q.topic_title}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">배점 {q.points}점</span>
                  </div>

                  {/* 지문 */}
                  <div className="text-base text-slate-200 font-medium mb-6 leading-relaxed whitespace-pre-wrap">
                    {q.stem}
                  </div>

                  {/* 문항 입력 영역 */}
                  {q.question_type === 'MULTIPLE_CHOICE' && q.options && (
                    <div className="space-y-3 mb-6">
                      {q.options.map((opt) => {
                        const isSelected = selectedChoices[q.id] === opt.option_no;
                        return (
                          <div
                            key={opt.option_no}
                            onClick={() => setSelectedChoices({ ...selectedChoices, [q.id]: opt.option_no })}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-inner'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.option_no}
                              </span>
                              <span className="text-sm font-medium">{opt.content}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.question_type === 'ESSAY' && (
                    <div className="mb-6 space-y-2">
                      <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        실기 서술형 답안 작성 (핵심 키워드 중심 서술)
                      </label>
                      <textarea
                        rows={5}
                        placeholder="공격 명칭, 동작 원리, 커널 파라미터 또는 대응 방안을 키워드 기반으로 서술하세요..."
                        value={essayAnswers[q.id] || ''}
                        onChange={(e) => setEssayAnswers({ ...essayAnswers, [q.id]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                      />
                    </div>
                  )}

                  {/* 제출 및 채점 버튼 */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleGrade(q)}
                      disabled={isGrading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                    >
                      {isGrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      답안 제출 및 AI 채점
                    </button>
                  </div>

                  {/* 채점 결과 피드백 카드 */}
                  {result && (
                    <div
                      className={`mt-6 p-5 rounded-xl border transition-all ${
                        result.is_correct
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : 'bg-rose-950/20 border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {result.is_correct ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <span className="font-bold text-sm">
                            득점: {result.score} / {result.max_score} 점
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 whitespace-pre-line mb-4 font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        {result.feedback}
                      </div>

                      {/* 상세 해설 */}
                      <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        <strong className="text-slate-300 block mb-1">💡 상세 정답 및 해설:</strong>
                        {result.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        PassForge Framework © 2026 — 국가공인 IT자격증 학습전략 및 AI 채점 엔진
      </footer>
    </div>
  );
}
