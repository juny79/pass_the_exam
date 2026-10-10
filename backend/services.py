from typing import List, Tuple
from schemas import Question, GradingResult, PassPredictionRequest, PassPredictionResult

class GradingEngine:
    """
    다형성 채점 엔진:
    1. 객관식(CBT) 즉시 정답 판정
    2. 실기 주관식/서술형 루브릭 기반 키워드 매칭 및 부분 점수 채점
    """
    
    @staticmethod
    def grade_answer(question: Question, choice: int = None, text: str = None) -> GradingResult:
        if question.question_type == "MULTIPLE_CHOICE":
            correct_opt = next((opt for opt in question.options if opt.is_correct), None)
            is_correct = (choice is not None and correct_opt is not None and choice == correct_opt.option_no)
            score = question.points if is_correct else 0.0
            
            feedback = "정답입니다!" if is_correct else f"오답입니다. (정답: {correct_opt.option_no}번)"
            return GradingResult(
                question_id=question.id,
                is_correct=is_correct,
                score=score,
                max_score=question.points,
                feedback=feedback,
                explanation=question.explanation or ""
            )
            
        elif question.question_type in ["ESSAY", "SHORT_ANSWER"]:
            rubric = question.rubric
            if not rubric or not text:
                return GradingResult(
                    question_id=question.id,
                    is_correct=False,
                    score=0.0,
                    max_score=question.points,
                    feedback="답안이 비어 있거나 채점 기준이 없습니다.",
                    explanation=question.explanation or ""
                )
                
            matched_kws = []
            missing_kws = []
            earned_score = 0.0
            normalized_text = text.lower()
            
            for item in rubric.mandatory_keywords:
                # 본문 내 키워드 또는 유의어 포함 여부 탐색
                all_variants = [item.keyword.lower()] + [s.lower() for s in item.synonyms]
                if any(var in normalized_text for var in all_variants):
                    matched_kws.append(item.keyword)
                    earned_score += item.points
                else:
                    missing_kws.append(item.keyword)
                    
            # 점수 상한 클리핑
            final_score = min(earned_score, question.points)
            is_correct = (final_score >= question.points * 0.7)  # 70% 이상 득점 시 정답/합격권 인정
            
            feedback_parts = []
            if matched_kws:
                feedback_parts.append(f"✅ 포함된 핵심 키워드: {', '.join(matched_kws)}")
            if missing_kws:
                feedback_parts.append(f"⚠️ 누락된 필수 개념: {', '.join(missing_kws)}")
                
            return GradingResult(
                question_id=question.id,
                is_correct=is_correct,
                score=final_score,
                max_score=question.points,
                matched_keywords=matched_kws,
                missing_keywords=missing_kws,
                feedback="\n".join(feedback_parts),
                explanation=question.explanation or ""
            )
            
        return GradingResult(
            question_id=question.id,
            is_correct=False,
            score=0.0,
            max_score=question.points,
            feedback="지원되지 않는 문제 유형입니다.",
            explanation=""
        )


class PredictionEngine:
    """
    자격증 합격 예측 및 과락 위험도 분석 엔진
    """
    @staticmethod
    def predict(req: PassPredictionRequest, passing_criteria: dict) -> PassPredictionResult:
        scores = list(req.subject_scores.values())
        if not scores:
            return PassPredictionResult(
                is_passed=False,
                average_score=0.0,
                has_failing_subject=True,
                failing_subjects=[],
                pass_probability_pct=0.0,
                analysis_report="응시 데이터가 부족합니다."
            )
            
        avg_score = sum(scores) / len(scores)
        failing_limit = passing_criteria.get("failing_subject_min_score", 40)
        passing_avg = passing_criteria.get("passing_avg_score", 60)
        
        failing_subs = [
            sub for sub, score in req.subject_scores.items() if score < failing_limit
        ]
        
        has_failing = len(failing_subs) > 0
        is_passed = (avg_score >= passing_avg) and not has_failing
        
        # 합격 확률 통계 모델(간이 휴리스틱)
        if has_failing:
            prob = max(10.0, (avg_score / 100.0) * 40.0)
            report = f"⚠️ 과락 발생! ({', '.join(failing_subs)}) 과목이 기준점({failing_limit}점) 미만입니다. 해당 과목 집중 보완이 시급합니다."
        elif avg_score >= passing_avg:
            prob = min(98.0, 50.0 + (avg_score - passing_avg) * 2.2)
            report = f"🎉 합격 안정권입니다! (평균 {avg_score:.1f}점). 전과목 과락 없이 안정적인 점수 분포를 보입니다."
        else:
            diff = passing_avg - avg_score
            prob = max(20.0, 50.0 - diff * 3.0)
            report = f"⚡ 합격 커트라인까지 {diff:.1f}점 남았습니다. 점수가 낮은 과목부터 우선 공략하세요."
            
        return PassPredictionResult(
            is_passed=is_passed,
            average_score=round(avg_score, 1),
            has_failing_subject=has_failing,
            failing_subjects=failing_subs,
            pass_probability_pct=round(prob, 1),
            analysis_report=report
        )
