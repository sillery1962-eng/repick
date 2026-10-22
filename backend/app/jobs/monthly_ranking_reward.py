"""이달의 적립왕 순위 보상 — 매월 1일 예약 실행용 (지난달 최종 1~10위에게 ⭐ 지급). 담당: 오지원

실행 (backend 폴더에서):  .venv\\Scripts\\python -m app.jobs.monthly_ranking_reward
EC2 예약 (매월 1일 0시 5분, 한국 시간 서버 기준):
  5 0 1 * * cd /경로/backend && .venv/bin/python -m app.jobs.monthly_ranking_reward >> logs/ranking_reward.log 2>&1

- 서버 전체(app.main)를 불러오지 않는다 → YOLO 모델이 메모리에 안 올라가서 홈페이지가 느려지지 않음
- 여러 번 실행해도 안전 (이미 받은 사람은 DB 중복 방지 규칙이 거부 → 건너뜀)
"""
import json

from app.routers.ranking import pay_last_month_rewards

if __name__ == "__main__":
    print(json.dumps(pay_last_month_rewards(), ensure_ascii=False))
