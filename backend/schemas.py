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

class Question(BaseModel):
    id: str
    cert_id: str
    exam_type: ExamType
    subject_code: str
    topic_title: str
    question_type: QuestionType
    question_number: int
    points: float
    stem: str
    options: Optional[List[QuestionOption]] = None
    rubric: Optional[GradingRubric] = None
    explanation: Optional[str] = None

# 채점 요청 및 응답 모델
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

# 합격 예측 요청/응답 모델
class PassPredictionRequest(BaseModel):
    cert_id: str
    exam_type: ExamType
    subject_scores: Dict[str, float]  # e.g., {"SYS_SEC": 65, "NET_SEC": 55, ...}

class PassPredictionResult(BaseModel):
    is_passed: bool
    average_score: float
    has_failing_subject: bool
    failing_subjects: List[str]
    pass_probability_pct: float
    analysis_report: str
