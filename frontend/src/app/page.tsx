'use client';

import React, { useState, useEffect } from 'react';
import { Question, GradingResult, PassPredictionResult, SubjectInfo } from '../types/exam';
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
  RefreshCw, 
  Layers, 
  Target, 
  Hash, 
  ChevronRight, 
  ChevronDown, 
  Video, 
  Lightbulb, 
  Bookmark, 
  Flame
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8081';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'WRITTEN' | 'PRACTICAL' | 'SUBJECTS' | 'PREDICTION'>('SUBJECTS');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // 5대 과목 아코디언/토글 상태 관리
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    SYS_SEC: true,
    NET_SEC: true,
    APP_SEC: false,
    GEN_SEC: false,
    LAW_MGT: false,
  });

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/questions?cert_id=is_engineer`),
        fetch(`${API_BASE}/api/subjects?cert_id=is_engineer`),
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(qData);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubjects(sData);
        // 기본으로 첫 번째 토픽들은 펼침 처리
        const initialTopicState: Record<string, boolean> = {};
        sData.forEach((sub: SubjectInfo) => {
          sub.key_topics.forEach((t) => {
            initialTopicState[t.id] = true;
          });
        });
        setExpandedTopics(initialTopicState);
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (code: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const filteredQuestions = questions
    .filter((q) => q.exam_type === activeTab)
    .filter((q) => selectedSubjectCode === 'ALL' || q.subject_code === selectedSubjectCode);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 상단 헤더 */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
              PassForge : 정보보안기사
            </h1>
            <p className="text-xs text-slate-400">유튜브 명강의 요약 · 두음 암기비법 · AI 실기 채점 합격전략 플랫폼</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('SUBJECTS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'SUBJECTS'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            5대 과목 토글 족보
          </button>
          <button
            onClick={() => setActiveTab('WRITTEN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'WRITTEN'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            필기 CBT 모의고사
          </button>
          <button
            onClick={() => setActiveTab('PRACTICAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'PRACTICAL'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            실기 AI 서술형 채점
          </button>
          <button
            onClick={() => setActiveTab('PREDICTION')}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'PREDICTION'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            합격/과락 예측
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p>5대 과목 족보 및 문항 데이터 로딩 중...</p>
          </div>
        ) : activeTab === 'SUBJECTS' ? (
          /* ================= 5대 과목 토글 형식 지식베이스 브라우저 ================= */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  정보보안기사 5대 영역 핵심 족보 & 유튜브 특강 요약
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  과목 및 세부 주제를 <strong>클릭(토글)</strong>하여 핵심 이론, 수제비/알기사 두음 암기 비법, 실기 합격 포인트를 학습하세요.
                </p>
              </div>

              {/* 전체 펼치기 / 접기 토글 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allOpen: Record<string, boolean> = {};
                    subjects.forEach((s) => (allOpen[s.code] = true));
                    setExpandedSubjects(allOpen);
                  }}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-800 transition"
                >
                  과목 전체 펼치기
                </button>
                <button
                  onClick={() => setExpandedSubjects({})}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-800 transition"
                >
                  전체 접기
                </button>
              </div>
            </div>

            {/* 과목 목록 (대단원 아코디언) */}
            <div className="space-y-4">
              {subjects.map((sub) => {
                const isSubOpen = expandedSubjects[sub.code] ?? false;

                return (
                  <div
                    key={sub.code}
                    className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all"
                  >
                    {/* 과목 헤더 (토글 버튼) */}
                    <button
                      onClick={() => toggleSubject(sub.code)}
                      className="w-full p-5 flex items-center justify-between bg-slate-900 hover:bg-slate-850/80 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black text-sm">
                          {sub.subject_no}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-bold text-white">{sub.name}</h3>
                            <span className="text-xs font-mono text-slate-500">[{sub.code}]</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{sub.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-400 font-semibold hidden sm:inline">
                          토픽 {sub.key_topics.length}개
                        </span>
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                          {isSubOpen ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>

                    {/* 과목 내용 (펼쳐졌을 때) */}
                    {isSubOpen && (
                      <div className="p-5 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                        {sub.key_topics.map((t) => {
                          const isTopicOpen = expandedTopics[t.id] ?? true;

                          return (
                            <div
                              key={t.id}
                              className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden transition hover:border-slate-700"
                            >
                              {/* 세부 토픽 헤더 (소단원 토글) */}
                              <button
                                onClick={() => toggleTopic(t.id)}
                                className="w-full p-4 flex items-center justify-between bg-slate-950 hover:bg-slate-900/60 transition text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Bookmark className="w-4 h-4 text-indigo-400" />
                                  <span className="text-sm font-bold text-slate-200">{t.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-semibold flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-amber-400" />
                                    출제 {t.probability}
                                  </span>
                                  {isTopicOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                </div>
                              </button>

                              {/* 세부 토픽 내용 (토글 본문) */}
                              {isTopicOpen && (
                                <div className="p-4 pt-1 border-t border-slate-900 space-y-3.5 text-xs">
                                  {/* 1. 핵심 이론 요약 */}
                                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 leading-relaxed text-slate-300">
                                    <strong className="text-indigo-300 block mb-1">📖 핵심 개념 이론:</strong>
                                    {t.core_concepts}
                                  </div>

                                  {/* 2. 유튜브 명강의 발췌 요약 및 두음 암기 비법 */}
                                  {t.youtube_tips && (
                                    <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-2">
                                      <div className="flex items-center justify-between text-rose-300 font-bold">
                                        <div className="flex items-center gap-1.5">
                                          <Video className="w-4 h-4 text-rose-500" />
                                          <span>유튜브 명강의 요약 특강</span>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-300">
                                          출처: {t.youtube_tips.channel}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 p-2 bg-rose-950/40 rounded-lg border border-rose-800/40 text-rose-200 font-semibold">
                                        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                        <span>두음 암기 공식: {t.youtube_tips.mnemonic}</span>
                                      </div>

                                      <div className="text-slate-300 whitespace-pre-line leading-relaxed font-sans pl-1">
                                        {t.youtube_tips.lecture_summary}
                                      </div>
                                    </div>
                                  )}

                                  {/* 3. 실기 시험 대비 포인트 */}
                                  <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/30 text-emerald-300/90 leading-relaxed">
                                    <strong className="text-emerald-300 block mb-1">🎯 실기 서술/단답형 합격 포인트:</strong>
                                    {t.practical_point}
                                  </div>

                                  {/* 4. 관련 키워드 태그 */}
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] text-slate-400 font-semibold mr-1">연관 키워드:</span>
                                    {t.related_terms.map((term, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[11px] px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-md font-mono"
                                      >
                                        #{term}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
          /* ================= 문제 풀이 영역 (필기 CBT or 실기 서술형) ================= */
          <div className="space-y-6">
            {/* 과목 필터 버튼 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">과목 필터:</span>
              <button
                onClick={() => setSelectedSubjectCode('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedSubjectCode === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                전체 과목
              </button>
              {subjects.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSelectedSubjectCode(s.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    selectedSubjectCode === s.code
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* 문항 목록 */}
            <div className="space-y-8">
              {filteredQuestions.map((q) => {
                const result = gradingResults[q.id];
                const isGrading = gradingLoading[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
                  >
                    {/* 문항 헤더 */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-md">
                          {q.subject_code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">#{q.question_number}번 문항</span>
                        <span className="text-xs text-slate-300 font-semibold">| {q.topic_title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.probability && (
                          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            출제 {q.probability}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-400">배점 {q.points}점</span>
                      </div>
                    </div>

                    {/* 지문 */}
                    <div className="text-base text-slate-200 font-medium mb-6 leading-relaxed whitespace-pre-wrap">
                      {q.stem}
                    </div>

                    {/* 객관식 보기 */}
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

                    {/* 실기 서술형 에디터 */}
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

                    {/* 제출 버튼 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleGrade(q)}
                        disabled={isGrading}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                      >
                        {isGrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        답안 제출 및 분석 확인
                      </button>
                    </div>

                    {/* ================= 문제 풀이 후 연계 학습 분석 피드백 ================= */}
                    {result && (
                      <div className="mt-6 space-y-4">
                        {/* 1. 채점 결과 & 피드백 */}
                        <div
                          className={`p-5 rounded-xl border transition-all ${
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

                          <div className="text-xs text-slate-300 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 leading-relaxed">
                            <strong className="text-indigo-300 block mb-1">💡 상세 정답 및 해설:</strong>
                            {result.explanation}
                          </div>
                        </div>

                        {/* 2. 지식 연계 분석 카드 */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              연계 과목 및 출제 경향 심층 분석
                            </h4>
                            <span className="text-xs text-slate-400">
                              소속 과목: <strong className="text-slate-200">{result.subject_name || q.subject_code}</strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-850">
                              <span className="text-[11px] text-slate-400 block mb-1 font-medium">출제 빈도 & 가능성</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-300">{result.frequency}</span>
                                <span className="text-xs text-slate-400">| 예상 확률 {result.probability}</span>
                              </div>
                            </div>

                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-850">
                              <span className="text-[11px] text-slate-400 block mb-1 font-medium">연계 핵심 토픽</span>
                              <span className="text-xs font-bold text-slate-200">{result.topic_title}</span>
                            </div>
                          </div>

                          {/* 유튜브 명강의 요약 및 암기비법 */}
                          {result.youtube_tips && (
                            <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                                <div className="flex items-center gap-1.5">
                                  <Video className="w-4 h-4 text-rose-500" />
                                  <span>유튜브 명강의 발췌 요약</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-300">
                                  {result.youtube_tips.channel}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 p-2 bg-rose-950/40 rounded-lg border border-rose-800/40 text-xs text-rose-200 font-semibold">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                <span>암기 팁: {result.youtube_tips.mnemonic}</span>
                              </div>

                              <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                                {result.youtube_tips.lecture_summary}
                              </div>
                            </div>
                          )}

                          {result.core_concepts && (
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 leading-relaxed">
                              <strong className="text-slate-200 block mb-1">📚 관련 학습 핵심 내용:</strong>
                              {result.core_concepts}
                            </div>
                          )}

                          {result.practical_point && (
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850 text-xs text-emerald-300/90 leading-relaxed">
                              <strong className="text-emerald-300 block mb-1">🎯 실기 시험 대비 포인트:</strong>
                              {result.practical_point}
                            </div>
                          )}

                          {result.related_terms && result.related_terms.length > 0 && (
                            <div className="pt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 font-semibold mr-1">연관 주제/용어:</span>
                              {result.related_terms.map((term, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md font-mono"
                                >
                                  #{term}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        PassForge Framework © 2026 — 유튜브 명강의 요약 & 국가공인 IT자격증 합격전략 플랫폼
      </footer>
    </div>
  );
}
