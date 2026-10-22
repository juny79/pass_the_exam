'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import confetti from 'canvas-confetti';
import { SubjectInfo, KeyTopic } from '../types/exam';
import {
  Layers,
  FolderTree,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  BookOpen,
  Compass,
  Lightbulb,
  Video,
  Hash
} from 'lucide-react';

interface MindMapViewerProps {
  subjects: SubjectInfo[];
  selectedSubjectCode: string;
  onSelectSubjectCode: (code: string) => void;
  masteredTopics: Record<string, boolean>;
  onToggleMastery: (topicId: string) => void;
}

// 1. Root 과목 커스텀 노드
function RootSubjectNode({ data }: { data: any }) {
  return (
    <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-2xl border-2 border-indigo-400/50 min-w-[240px] text-center transition-all hover:scale-105">
      <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1 flex items-center justify-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-blue-300" />
        {data.code}
      </div>
      <div className="text-base font-extrabold tracking-tight leading-snug drop-shadow-sm">
        {data.label}
      </div>
      <div className="mt-2 text-[11px] text-indigo-100/90 bg-white/10 rounded-full px-3 py-0.5 inline-block font-medium">
        총 {data.subcatCount}개 카테고리 · {data.topicCount}개 토픽
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white" />
    </div>
  );
}

// 2. 세부 카테고리 커스텀 노드
function SubcategoryNode({ data }: { data: any }) {
  return (
    <div
      onClick={data.onToggleExpand}
      className={`relative px-4 py-3 rounded-xl border transition-all cursor-pointer min-w-[220px] max-w-[280px] shadow-md hover:shadow-lg ${
        data.isExpanded
          ? 'bg-slate-900 border-indigo-500 text-white shadow-indigo-500/20'
          : 'bg-slate-900/90 border-slate-750 text-slate-200 hover:border-slate-500'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderTree className={`w-3.5 h-3.5 shrink-0 ${data.isExpanded ? 'text-indigo-400' : 'text-slate-400'}`} />
          <span className="text-xs font-bold truncate">{data.label}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0 ${
          data.isExpanded ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'
        }`}>
          {data.topicCount}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900" />
    </div>
  );
}

// 3. 기출 토픽 노드
function TopicNode({ data }: { data: any }) {
  const isMastered = !!data.isMastered;

  return (
    <div
      onClick={data.onClick}
      className={`relative px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer min-w-[200px] max-w-[260px] text-left shadow-sm ${
        isMastered
          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 hover:bg-emerald-900/50 shadow-emerald-500/10'
          : 'bg-slate-900/85 border-slate-800 text-slate-300 hover:border-blue-500 hover:bg-slate-850'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-400 !border !border-slate-900" />
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className={`w-3.5 h-3.5 shrink-0 ${isMastered ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span className="text-xs font-semibold truncate leading-tight">{data.label}</span>
        </div>
        {isMastered ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono shrink-0">
            {data.probability}
          </span>
        )}
      </div>
      <div className="text-[10px] text-slate-400 line-clamp-1">
        {data.summary}
      </div>
    </div>
  );
}

const nodeTypes = {
  rootSubject: RootSubjectNode,
  subcategory: SubcategoryNode,
  topic: TopicNode,
};

export default function MindMapViewer({
  subjects,
  selectedSubjectCode,
  onSelectSubjectCode,
  masteredTopics,
  onToggleMastery,
}: MindMapViewerProps) {
  // 현재 과목 선택
  const currentSubject = useMemo(() => {
    if (!subjects || subjects.length === 0) return null;
    if (selectedSubjectCode === 'ALL') return subjects[0];
    return subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];
  }, [subjects, selectedSubjectCode]);

  // 카테고리 펼침 상태
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // 상세 보기 모달/드로어 토픽
  const [activeTopic, setActiveTopic] = useState<{
    subject: SubjectInfo;
    categoryTitle: string;
    topic: KeyTopic;
  } | null>(null);

  // 과목 변경 시 첫 3개 카테고리 자동 펼침
  React.useEffect(() => {
    if (currentSubject?.subcategories) {
      const initial: Record<string, boolean> = {};
      currentSubject.subcategories.slice(0, 3).forEach((cat) => {
        initial[cat.cat_id] = true;
      });
      setExpandedCats(initial);
    }
  }, [currentSubject?.code]);

  const toggleCategoryExpand = useCallback((catId: string) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  }, []);

  // 그래프 노드 & 엣지 계산 (수평 계층 레이아웃)
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!currentSubject) return { initialNodes: [], initialEdges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const subcats = currentSubject.subcategories || [];
    const totalTopicsCount = subcats.reduce((sum, c) => sum + (c.topics?.length || 0), 0);

    const rootId = `root_${currentSubject.code}`;
    const rootX = 40;

    let currentY = 0;
    const catGapY = 100;
    const topicGapY = 65;

    const catPositions: { id: string; x: number; y: number }[] = [];

    subcats.forEach((cat) => {
      const catId = cat.cat_id;
      const isExpanded = !!expandedCats[catId];
      const topics = cat.topics || [];

      const startY = currentY;
      const catNodeY = startY + 15;

      catPositions.push({
        id: catId,
        x: 390,
        y: catNodeY,
      });

      if (isExpanded) {
        topics.forEach((topic, tIdx) => {
          const topicId = topic.id;
          const isMastered = !!masteredTopics[topicId];
          const topicY = startY + tIdx * topicGapY;

          nodes.push({
            id: topicId,
            type: 'topic',
            position: { x: 730, y: topicY },
            data: {
              label: topic.title,
              summary: topic.core_concepts,
              probability: topic.probability,
              isMastered,
              onClick: () => {
                setActiveTopic({
                  subject: currentSubject,
                  categoryTitle: cat.cat_name,
                  topic,
                });
              },
            },
          });

          // Edge: Cat -> Topic
          edges.push({
            id: `edge_${catId}_${topicId}`,
            source: catId,
            target: topicId,
            type: 'smoothstep',
            animated: isMastered,
            style: {
              stroke: isMastered ? '#10b981' : '#475569',
              strokeWidth: isMastered ? 2 : 1.5,
            },
          });
        });

        const expandedHeight = Math.max(topics.length * topicGapY, catGapY);
        currentY += expandedHeight + 30;
      } else {
        currentY += catGapY;
      }
    });

    const rootY = currentY > 0 ? (currentY / 2) - 40 : 200;

    // Root Node
    nodes.push({
      id: rootId,
      type: 'rootSubject',
      position: { x: rootX, y: rootY },
      data: {
        code: currentSubject.code,
        label: currentSubject.name,
        subcatCount: subcats.length,
        topicCount: totalTopicsCount,
      },
    });

    // Cat Nodes & Root -> Cat Edges
    subcats.forEach((cat, catIdx) => {
      const catId = cat.cat_id;
      const pos = catPositions[catIdx];
      const isExpanded = !!expandedCats[catId];

      nodes.push({
        id: catId,
        type: 'subcategory',
        position: { x: pos.x, y: pos.y },
        data: {
          label: cat.cat_name,
          topicCount: cat.topics?.length || 0,
          isExpanded,
          onToggleExpand: () => toggleCategoryExpand(catId),
        },
      });

      edges.push({
        id: `edge_root_${catId}`,
        source: rootId,
        target: catId,
        type: 'smoothstep',
        animated: isExpanded,
        style: {
          stroke: isExpanded ? '#6366f1' : '#334155',
          strokeWidth: isExpanded ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isExpanded ? '#6366f1' : '#334155',
          width: 14,
          height: 14,
        },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [currentSubject, expandedCats, masteredTopics, toggleCategoryExpand]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // 마스터리 축하 폭죽 효과
  const triggerMasteryCelebration = (topicId: string) => {
    const isNowMastered = !masteredTopics[topicId];
    onToggleMastery(topicId);

    if (isNowMastered) {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6'],
      });
    }
  };

  // 과목 진도율 계산
  const currentMasteryStats = useMemo(() => {
    if (!currentSubject) return { total: 0, mastered: 0, percentage: 0 };
    let total = 0;
    let mastered = 0;
    currentSubject.subcategories?.forEach((cat) => {
      cat.topics?.forEach((t) => {
        total++;
        if (masteredTopics[t.id]) mastered++;
      });
    });
    return {
      total,
      mastered,
      percentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  }, [currentSubject, masteredTopics]);

  return (
    <div className="relative w-full h-[780px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* 1. 상단 컨트롤 헤더 (2열 배치: 과목 탭 전폭 스크롤 + 통계/도구 바) */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur z-10 shrink-0">
        {/* 상단 1행: 과목 선택 탭 (가려짐 방지 및 부드러운 스크롤) */}
        <div className="px-5 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {subjects.map((sub) => {
            const isSelected =
              (selectedSubjectCode === 'ALL' && subjects[0]?.code === sub.code) ||
              selectedSubjectCode === sub.code;
            return (
              <button
                key={sub.code}
                onClick={() => onSelectSubjectCode(sub.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-blue-400'
                    : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-mono">
                  {sub.subject_no}
                </span>
                <span>{sub.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/25 font-mono text-slate-300">
                  {sub.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* 상단 2행: 현재 과목 안내 + 과목 정복률 게이지 */}
        <div className="px-5 py-2 border-t border-slate-800/70 bg-slate-950/60 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300 min-w-0">
            <span className="font-bold text-indigo-400 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {currentSubject?.name}
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
              {currentSubject?.description}
            </span>
          </div>

          {/* 정복률 & 진도율 바 */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">정복률</span>
              <span className="text-emerald-400 font-mono font-extrabold">{currentMasteryStats.percentage}%</span>
              <span className="text-slate-400 text-[11px] font-normal">
                ({currentMasteryStats.mastered}/{currentMasteryStats.total})
              </span>
            </div>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${currentMasteryStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. React Flow 캔버스 영역 */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-950"
        >
          <Background color="#334155" gap={24} size={1.2} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-white rounded-xl shadow-xl fill-white" />
        </ReactFlow>

        {/* 캔버스 하단 조작 가이드 팁 */}
        <div className="absolute bottom-4 left-6 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur text-[11px] text-slate-400">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>마우스 휠로 줌/패닝 · 카테고리 클릭 시 하위 토픽 펼침 · 토픽 클릭 시 족보 상세 확인</span>
        </div>
      </div>

      {/* 3. 우측 슬라이드 드로어 (토픽 상세 정보 & 마스터리 체크) */}
      {activeTopic && (
        <div className="absolute top-16 right-0 bottom-0 w-full sm:w-[460px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 p-6 shadow-2xl z-20 overflow-y-auto flex flex-col transition-all animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                {activeTopic.subject.code}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[240px]">
                {activeTopic.categoryTitle}
              </span>
            </div>
            <button
              onClick={() => setActiveTopic(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-6 flex-1">
            {/* 토픽 헤더 */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  출제 {activeTopic.topic.probability}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white leading-snug">
                {activeTopic.topic.title}
              </h3>
            </div>

            {/* 핵심 이론 */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-inner">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                핵심 개념 이론
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {activeTopic.topic.core_concepts}
              </p>
            </div>

            {/* 유튜브 명강의 요약 특강 */}
            {activeTopic.topic.youtube_tips && (
              <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-900/40 space-y-2.5">
                <div className="flex items-center justify-between text-rose-300 font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>유튜브 명강의 요약 특강</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-300">
                    {activeTopic.topic.youtube_tips.channel}
                  </span>
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {activeTopic.topic.youtube_tips.lecture_summary}
                </div>
              </div>
            )}

            {/* 실기 서술/단답형 합격 포인트 */}
            {activeTopic.topic.practical_point && (
              <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-900/40">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                  실기 서술/단답형 합격 포인트
                </div>
                <p className="text-sm text-emerald-100/90 leading-relaxed font-sans">
                  {activeTopic.topic.practical_point}
                </p>
              </div>
            )}

            {/* 연관 키워드 태그 */}
            {activeTopic.topic.related_terms && activeTopic.topic.related_terms.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-500" />
                  <span>연관 키워드</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTopic.topic.related_terms.map((term, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 bg-slate-800/80 text-slate-300 border border-slate-700/50 rounded-lg font-mono"
                    >
                      #{term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 하단 마스터리 완료 버튼 */}
          {(() => {
            const topicId = activeTopic.topic.id;
            const isMastered = !!masteredTopics[topicId];

            return (
              <div className="pt-4 border-t border-slate-800 mt-6 shrink-0">
                <button
                  onClick={() => triggerMasteryCelebration(topicId)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isMastered
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isMastered ? '정복 완료됨 (다시 복습하기)' : '이 토픽 완벽 정복! (마스터 체크)'}
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
