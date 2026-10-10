import os
import json
import re
from typing import List, Dict, Any

class ExamDataPipeline:
    """
    자격증 기출/예상 문제 수집 및 정제 파이프라인 (ETL)
    다양한 자격증 데이터를 표준 JSON 스키마로 검증 및 정규화
    """
    
    def __init__(self, seed_path: str):
        self.seed_path = seed_path
        
    def load_seed_data(self) -> Dict[str, Any]:
        with open(self.seed_path, "r", encoding="utf-8") as f:
            return json.load(f)
            
    def validate_question(self, q: Dict[str, Any]) -> bool:
        """문항 유효성 검증"""
        required_fields = ["id", "cert_id", "exam_type", "question_type", "stem", "explanation"]
        for field in required_fields:
            if field not in q:
                raise ValueError(f"문항 검증 실패: 필수 필드 '{field}' 누락 (ID: {q.get('id')})")
                
        if q["question_type"] == "MULTIPLE_CHOICE":
            options = q.get("options", [])
            if len(options) < 2:
                raise ValueError(f"객관식 문항 {q['id']}의 보기가 2개 미만입니다.")
            correct_cnt = sum(1 for opt in options if opt.get("is_correct", False))
            if correct_cnt != 1:
                raise ValueError(f"객관식 문항 {q['id']}의 정답은 정확히 1개여야 합니다 (현재: {correct_cnt}개).")
                
        elif q["question_type"] in ["ESSAY", "SHORT_ANSWER"]:
            if "rubric" not in q:
                raise ValueError(f"주관식/서술형 문항 {q['id']}에 rubric(채점기준)이 누락되었습니다.")
                
        return True

    def process_and_export(self, output_path: str):
        data = self.load_seed_data()
        print(f"[*] 자격증 {len(data['certifications'])}개 로드 완료")
        
        valid_questions = []
        for q in data["sample_questions"]:
            if self.validate_question(q):
                valid_questions.append(q)
                
        print(f"[*] 유효한 문항 {len(valid_questions)}개 검증 완료")
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"[+] 정제된 데이터 내보내기 성공: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    seed_file = os.path.join(base_dir, "data", "seed_data.json")
    out_file = os.path.join(base_dir, "data", "processed_exam_data.json")
    
    pipeline = ExamDataPipeline(seed_file)
    pipeline.process_and_export(out_file)
