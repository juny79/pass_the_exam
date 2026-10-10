export type ExamType = 'WRITTEN' | 'PRACTICAL';
export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'PRACTICAL_CODE';

export interface QuestionOption {
  option_no: number;
  content: string;
  is_correct?: boolean;
}

export interface KeywordRubric {
  keyword: string;
  points: number;
  synonyms: string[];
}

export interface GradingRubric {
  mandatory_keywords: KeywordRubric[];
  reference_essay: string;
}

export interface KeyTopic {
  id: string;
  title: string;
  frequency: string;
  probability: string;
  core_concepts: string;
  practical_point: string;
  related_terms: string[];
}

export interface SubjectInfo {
  subject_no: number;
  code: string;
  name: string;
  description: string;
  key_topics: KeyTopic[];
}

export interface Question {
  id: string;
  cert_id: string;
  exam_type: ExamType;
  subject_code: string;
  topic_id?: string;
  topic_title: string;
  frequency?: string;
  probability?: string;
  question_type: QuestionType;
  question_number: number;
  points: number;
  stem: string;
  options?: QuestionOption[];
  rubric?: GradingRubric;
  explanation?: string;
}

export interface GradingResult {
  question_id: string;
  is_correct: boolean;
  score: number;
  max_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  feedback: string;
  explanation: string;
  // 문제 풀이 후 연계 학습 정보
  subject_name?: string;
  topic_title?: string;
  frequency?: string;
  probability?: string;
  core_concepts?: string;
  practical_point?: string;
  related_terms?: string[];
}

export interface PassPredictionResult {
  is_passed: boolean;
  average_score: number;
  has_failing_subject: boolean;
  failing_subjects: string[];
  pass_probability_pct: number;
  analysis_report: string;
}
