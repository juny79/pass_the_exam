import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

from schemas import (
    Question,
    SubjectInfo,
    SubmitAnswerRequest,
    GradingResult,
    PassPredictionRequest,
    PassPredictionResult
)
from services import GradingEngine, PredictionEngine

app = FastAPI(
    title="PassForge API - 자격증 시험 합격전략 플랫폼",
    version="1.1.0"
)

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed_exam_data.json")

def load_data():
    if not os.path.exists(DATA_PATH):
        return {"certifications": [], "sample_questions": []}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "PassForge Backend API"}

@app.get("/api/certifications")
def get_certifications():
    data = load_data()
    return data.get("certifications", [])

@app.get("/api/subjects", response_model=List[SubjectInfo])
def get_subjects(cert_id: str = "is_engineer"):
    data = load_data()
    cert = next((c for c in data.get("certifications", []) if c["id"] == cert_id), None)
    if not cert:
        raise HTTPException(status_code=404, detail="자격증을 찾을 수 없습니다.")
    return cert.get("subjects", [])

@app.get("/api/questions", response_model=List[Question])
def get_questions(cert_id: str = "is_engineer", exam_type: str = None):
    data = load_data()
    questions = data.get("sample_questions", [])
    
    filtered = [q for q in questions if q.get("cert_id") == cert_id]
    if exam_type:
        filtered = [q for q in filtered if q.get("exam_type") == exam_type]
        
    return filtered

@app.post("/api/grade", response_model=GradingResult)
def grade_answer(req: SubmitAnswerRequest):
    data = load_data()
    q_dict = next((q for q in data.get("sample_questions", []) if q["id"] == req.question_id), None)
    
    if not q_dict:
        raise HTTPException(status_code=404, detail="해당 문항을 찾을 수 없습니다.")
        
    question = Question(**q_dict)
    
    # 해당 문항이 속한 과목 및 세부 토픽 정보 탐색
    cert = next((c for c in data.get("certifications", []) if c["id"] == question.cert_id), None)
    subject_name = None
    topic_info = None
    
    if cert:
        sub = next((s for s in cert.get("subjects", []) if s["code"] == question.subject_code), None)
        if sub:
            subject_name = sub.get("name")
            topic_info = next((t for t in sub.get("key_topics", []) if t["id"] == question.topic_id), None)

    result = GradingEngine.grade_answer(
        question=question,
        choice=req.submitted_choice,
        text=req.submitted_text,
        topic_info=topic_info,
        subject_name=subject_name
    )
    return result

@app.post("/api/predict", response_model=PassPredictionResult)
def predict_passing(req: PassPredictionRequest):
    data = load_data()
    cert = next((c for c in data.get("certifications", []) if c["id"] == req.cert_id), None)
    if not cert:
        raise HTTPException(status_code=404, detail="해당 자격증 정보를 찾을 수 없습니다.")
        
    criteria = cert.get("passing_criteria", {}).get(req.exam_type.value.lower(), {})
    return PredictionEngine.predict(req, criteria)
