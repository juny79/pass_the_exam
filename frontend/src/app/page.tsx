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
  Flame,
  FolderTree,
  FileText,
  HardHat
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8081';

interface CertConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  subjectsCount: number;
  totalTopics: number;
}

const CERTS: CertConfig[] = [
  {
    id: 'is_engineer',
    title: '정보보안기사',
    subtitle: '5과목 50개 카테고리 250개 기출 토픽 · 유튜브 명강의 핵심 요약 · AI 실기 채점',
    badge: 'KCA 공인',
    subjectsCount: 5,
    totalTopics: 250,
  },
  {
    id: 'ind_safety_engineer',
    title: '산업안전기사',
    subtitle: '6과목 60개 카테고리 300개 기출 토픽 · 복합형(필답/작업형) 대비 · 합격 예측',
    badge: 'Q-Net 국가기술',
    subjectsCount: 6,
    totalTopics: 300,
  },
];

export default function Home() {
  const [selectedCertId, setSelectedCertId] = useState<string>('is_engineer');
  const [activeTab, setActiveTab] = useState<'WRITTEN' | 'PRACTICAL' | 'SUBJECTS' | 'PREDICTION'>('SUBJECTS');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // 1단계(과목) 토글 상태
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // 2단계(세부 카테고리) 토글 상태
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // 3단계(세부 토픽) 토글 상태
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // CBT / 실기 입력 상태
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [gradingResults, setGradingResults] = useState<Record<string, GradingResult>>({});
  const [gradingLoading, setGradingLoading] = useState<Record<string, boolean>>({});

  // 합격 예측 시뮬레이션 상태
  const [subjectScores, setSubjectScores] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<PassPredictionResult | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);

  const currentCert = CERTS.find((c) => c.id === selectedCertId) || CERTS[0];

  useEffect(() => {
    fetchInitialData(selectedCertId);
  }, [selectedCertId]);

  const fetchInitialData = async (certId: string) => {
    setLoading(true);
    setSelectedSubjectCode('ALL');
    setGradingResults({});
    setSelectedChoices({});
    setEssayAnswers({});
    setPrediction(null);

    try {
      const [qRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/questions?cert_id=${certId}`),
        fetch(`${API_BASE}/api/subjects?cert_id=${certId}`),
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(qData);
      }
      if (sRes.ok) {
        const sData: SubjectInfo[] = await sRes.json();
        setSubjects(sData);

        const initialSubState: Record<string, boolean> = {};
        const initialCatState: Record<string, boolean> = {};
        const initialTopicState: Record<string, boolean> = {};
        const initialScores: Record<string, number> = {};

        sData.forEach((sub, sIdx) => {
          initialSubState[sub.code] = sIdx < 2;
          initialScores[sub.code] = 60;
          sub.subcategories.forEach((cat) => {
            initialCatState[cat.cat_id] = true;
            cat.topics.forEach((t) => {
              initialTopicState[t.id] = true;
            });
          });
        });

        setExpandedSubjects(initialSubState);
        setExpandedCategories(initialCatState);
        setExpandedTopics(initialTopicState);
        setSubjectScores(initialScores);
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

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
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
          cert_id: selectedCertId,
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
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            {selectedCertId === 'ind_safety_engineer' ? (
              <HardHat className="w-6 h-6 text-amber-300" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
                PassForge : {currentCert.title}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                {currentCert.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentCert.subtitle}</p>
          </div>
        </div>

        {/* 자격증 선택 드롭다운 & 탭 네비게이션 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedCertId}
              onChange={(e) => setSelectedCertId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs md:text-sm font-bold text-indigo-300 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer shadow-md"
            >
              {CERTS.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                  자격증: {c.title} ({c.subjectsCount}과목 {c.totalTopics}토픽)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

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
              {currentCert.subjectsCount}대 과목 세부 족보
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
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p>{currentCert.title} 세부 카테고리 및 문항 족보 데이터 로딩 중...</p>
          </div>
        ) : activeTab === 'SUBJECTS' ? (
          /* ================= 3단계(과목-세부카테고리-토픽) 토글 브라우저 ================= */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-indigo-400" />
                  {currentCert.title} {currentCert.subjectsCount}대 과목 세부 카테고리별 종합 족보
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>[1단계 과목] → [2단계 세부 카테고리] → [3단계 기출 주제]</strong>의 3계층 아코디언 토글을 통해 출제기준 및 기출·유튜브 명강의 핵심 요약을 학습하세요.
                </p>
              </div>

              {/* 전체 펼치기 / 접기 제어 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allOpenSubs: Record<string, boolean> = {};
                    const allOpenCats: Record<string, boolean> = {};
                    const allOpenTopics: Record<string, boolean> = {};
                    subjects.forEach((s) => {
                      allOpenSubs[s.code] = true;
                      s.subcategories.forEach((c) => {
                        allOpenCats[c.cat_id] = true;
                        c.topics.forEach((t) => (allOpenTopics[t.id] = true));
                      });
                    });
                    setExpandedSubjects(allOpenSubs);
                    setExpandedCategories(allOpenCats);
                    setExpandedTopics(allOpenTopics);
                  }}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-800 transition"
                >
                  모든 단계 전체 펼치기
                </button>
                <button
                  onClick={() => {
                    setExpandedSubjects({});
                    setExpandedCategories({});
                    setExpandedTopics({});
                  }}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-800 transition"
                >
                  전체 접기
                </button>
              </div>
            </div>

            {/* 1단계: 과목 아코디언 */}
            <div className="space-y-4">
              {subjects.map((sub) => {
                const isSubOpen = expandedSubjects[sub.code] ?? false;
                const totalTopics = sub.subcategories.reduce((acc, c) => acc + c.topics.length, 0);

                return (
                  <div
                    key={sub.code}
                    className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all"
                  >
                    {/* 과목 헤더 */}
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

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-indigo-400 font-semibold hidden sm:inline">
                          카테고리 {sub.subcategories.length}개 · 주제 {totalTopics}개
                        </span>
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                          {isSubOpen ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>

                    {/* 2단계: 세부 카테고리 목록 (펼쳐졌을 때) */}
                    {isSubOpen && (
                      <div className="p-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                        {sub.subcategories.map((cat) => {
                          const isCatOpen = expandedCategories[cat.cat_id] ?? true;

                          return (
                            <div
                              key={cat.cat_id}
                              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 transition"
                            >
                              {/* 세부 카테고리 헤더 */}
                              <button
                                onClick={() => toggleCategory(cat.cat_id)}
                                className="w-full p-3.5 px-4 flex items-center justify-between bg-slate-900/90 hover:bg-slate-850 transition text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Layers className="w-4 h-4 text-indigo-400" />
                                  <span className="text-sm font-bold text-indigo-200">{cat.cat_name}</span>
                                  <span className="text-[11px] text-slate-500">({cat.topics.length}개 빈출 주제)</span>
                                </div>
                                <div className="text-slate-400">
                                  {isCatOpen ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                              </button>

                              {/* 3단계: 세부 토픽 목록 */}
                              {isCatOpen && (
                                <div className="p-4 space-y-3 bg-slate-950/60 border-t border-slate-850">
                                  {cat.topics.map((t) => {
                                    const isTopicOpen = expandedTopics[t.id] ?? true;

                                    return (
                                      <div
                                        key={t.id}
                                        className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition hover:border-slate-700"
                                      >
                                        {/* 토픽 헤더 버튼 */}
                                        <button
                                          onClick={() => toggleTopic(t.id)}
                                          className="w-full p-3.5 flex items-center justify-between bg-slate-950 hover:bg-slate-900/50 transition text-left"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Bookmark className="w-4 h-4 text-indigo-400" />
                                            <span className="text-xs md:text-sm font-bold text-slate-200">{t.title}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] md:text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-semibold flex items-center gap-1">
                                              <Flame className="w-3 h-3 text-amber-400" />
                                              출제 {t.probability}
                                            </span>
                                            {isTopicOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                          </div>
                                        </button>

                                        {/* 토픽 본문 (상세 학습 내용 및 유튜브 요약) */}
                                        {isTopicOpen && (
                                          <div className="p-4 pt-1 border-t border-slate-900 space-y-3.5 text-xs">
                                            {/* 핵심 이론 */}
                                            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 leading-relaxed text-slate-300">
                                              <strong className="text-indigo-300 block mb-1">📖 핵심 개념 이론:</strong>
                                              {t.core_concepts}
                                            </div>

                                            {/* 유튜브 명강의 핵심 요약 특강 */}
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

                                                <div className="text-slate-300 whitespace-pre-line leading-relaxed font-sans pl-1">
                                                  {t.youtube_tips.lecture_summary}
                                                </div>
                                              </div>
                                            )}

                                            {/* 실기 시험 대비 포인트 */}
                                            <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/30 text-emerald-300/90 leading-relaxed">
                                              <strong className="text-emerald-300 block mb-1">🎯 실기 서술/단답형 합격 포인트:</strong>
                                              {t.practical_point}
                                            </div>

                                            {/* 관련 키워드 태그 */}
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
                <h2 className="text-xl font-bold">
                  {currentCert.title} {subjects.length}개 과목별 점수 시뮬레이션 (필기 과락/평균 분석)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {subjects.map((sub) => (
                  <div key={sub.code} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <label className="text-xs text-slate-300 font-medium block mb-1.5 truncate">
                      {sub.subject_no}. {sub.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subjectScores[sub.code] ?? 60}
                      onChange={(e) =>
                        setSubjectScores({
                          ...subjectScores,
                          [sub.code]: Math.min(100, Math.max(0, Number(e.target.value))),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-base font-bold text-center text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="mt-1.5 text-right">
                      {(subjectScores[sub.code] ?? 60) < 40 && (
                        <span className="text-[11px] text-rose-400 font-semibold">⚠️ 과락 기준</span>
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
                {currentCert.title} 합격 가능성 및 과락 위험도 진단하기
              </button>
            </div>

            {prediction && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  AI 분석 리포트 결과 ({currentCert.title})
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
                          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-850 gap-2">
                            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              연계 과목 및 출제 경향 심층 분석
                            </h4>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                              <span>과목: <strong className="text-slate-200">{result.subject_name || q.subject_code}</strong></span>
                              {result.cat_name && (
                                <>
                                  <span>&gt;</span>
                                  <span className="text-indigo-300 font-semibold">{result.cat_name}</span>
                                </>
                              )}
                            </div>
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

                          {/* 유튜브 명강의 발췌 요약 */}
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
        PassForge Framework © 2026 — 3단계 세부 카테고리 족보 & 유튜브 특강 요약 에듀테크 플랫폼
      </footer>
    </div>
  );
}
