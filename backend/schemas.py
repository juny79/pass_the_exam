from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ExamType(str, Enum):
    WRITTEN = "WRITTEN"
    PRACTICAL = "PRACTICAL"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    SHORT_ANSWER = "SHORT_ANSWER"
    ESSAY = "ESSAY"
    PRACTICAL_CODE = "PRACTICAL_CODE"

class QuestionOption(BaseModel):
    option_no: int
    content: str
    is_correct: Optional[bool] = None

class KeywordRubric(BaseModel):
    keyword: str
    points: float
    synonyms: List[str] = []

class GradingRubric(BaseModel):
    mandatory_keywords: List[KeywordRubric] = []
    reference_essay: str

# 유튜브 명강의 요약 및 암기팁 모델
class YoutubeTip(BaseModel):
    channel: str
    mnemonic: str
    lecture_summary: str

# 과목별 지식 토픽 모델
class KeyTopic(BaseModel):
    id: str
    title: str
    frequency: str
    probability: str
    core_concepts: str
    practical_point: str
    youtube_tips: Optional[YoutubeTip] = None
    related_terms: List[str] = []

class SubjectInfo(BaseModel):
    subject_no: int
    code: str
    name: str
    description: str
    key_topics: List[KeyTopic] = []

class Question(BaseModel):
    id: str
    cert_id: str
    exam_type: ExamType
    subject_code: str
    topic_id: Optional[str] = None
    topic_title: str
    frequency: Optional[str] = None
    probability: Optional[str] = None
    question_type: QuestionType
    question_number: int
    points: float
    stem: str
    options: Optional[List[QuestionOption]] = None
    rubric: Optional[GradingRubric] = None
    explanation: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    question_id: str
    submitted_choice: Optional[int] = None
    submitted_text: Optional[str] = None

class GradingResult(BaseModel):
    question_id: str
    is_correct: bool
    score: float
    max_score: float
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    feedback: str
    explanation: str
    subject_name: Optional[str] = None
    topic_title: Optional[str] = None
    frequency: Optional[str] = None
    probability: Optional[str] = None
    core_concepts: Optional[str] = None
    practical_point: Optional[str] = None
    youtube_tips: Optional[YoutubeTip] = None
    related_terms: List[str] = []

class PassPredictionRequest(BaseModel):
    cert_id: str
    exam_type: ExamType
    subject_scores: Dict[str, float]

class PassPredictionResult(BaseModel):
    is_passed: bool
    average_score: float
    has_failing_subject: bool
    failing_subjects: List[str]
    pass_probability_pct: float
    analysis_report: str
