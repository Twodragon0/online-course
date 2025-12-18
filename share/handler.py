"""Lambda 핸들러 - Slack 슬래시 커맨드 처리 (비동기)."""

import json
import os
import logging
import boto3
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import parse_qs

# KST 타임존
KST = timezone(timedelta(hours=9))

# 스케줄 설정 파일 경로
SCHEDULE_FILE = Path(__file__).parent / "data" / "schedule.json"


def load_schedule() -> dict:
    """스케줄 설정 파일 로드."""
    with open(SCHEDULE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_current_week() -> int | None:
    """KST 기준 현재 주차 계산. 스케줄 범위 밖이면 None 반환."""
    schedule_config = load_schedule()
    now = datetime.now(KST)
    today = now.date()

    current_week = None
    for week_str, date_str in schedule_config["schedule"].items():
        week = int(week_str)
        schedule_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        if today >= schedule_date:
            current_week = week

    return current_week


def get_schedule_config() -> dict:
    """스케줄 설정 반환."""
    return load_schedule()

from services.drive_service import share_week_folders
from services.bedrock_service import generate_simple_message
from services.slack_service import send_message, send_error_message, send_to_response_url

# 로깅 설정
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Lambda 클라이언트
lambda_client = boto3.client("lambda")


def parse_slack_command(body: str) -> dict:
    """Slack 슬래시 커맨드 파싱."""
    parsed = parse_qs(body)
    return {
        "command": parsed.get("command", [""])[0],
        "text": parsed.get("text", [""])[0],
        "user_id": parsed.get("user_id", [""])[0],
        "user_name": parsed.get("user_name", [""])[0],
        "channel_id": parsed.get("channel_id", [""])[0],
        "response_url": parsed.get("response_url", [""])[0]
    }


def handler(event: dict, context) -> dict:
    """메인 핸들러 - 즉시 응답 + 비동기 처리 호출."""
    logger.info(f"Event: {json.dumps(event)}")

    try:
        # Slack 슬래시 커맨드 파싱
        body = event.get("body", "")
        command = parse_slack_command(body)

        logger.info(f"Command: {command}")

        # 주차 파싱
        text = command["text"].strip()

        if not text or not text.isdigit():
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "response_type": "ephemeral",
                    "text": "사용법: /share {주차}\n예: /share 3"
                })
            }

        week = int(text)
        response_url = command["response_url"]

        # 비동기로 프로세서 Lambda 호출
        function_name = os.environ.get("PROCESSOR_FUNCTION_NAME")

        if function_name:
            payload = {
                "week": week,
                "response_url": response_url,
                "user_name": command["user_name"]
            }

            lambda_client.invoke(
                FunctionName=function_name,
                InvocationType="Event",  # 비동기 호출
                Payload=json.dumps(payload)
            )

            logger.info(f"Async invoked: {function_name}")
        else:
            # Function name 없으면 동기 처리 (테스트용)
            process_share({"week": week, "response_url": response_url})

        # 즉시 응답 (3초 내)
        schedule_config = get_schedule_config()
        current_batch = schedule_config.get("current_batch", 8)
        last_week = schedule_config.get("last_week", 9)

        if week == last_week:
            text = f"⏳ 영상 공유 처리 중...\n• {current_batch}기: {week}주차 (마지막)\n완료되면 알려드릴게요!"
        else:
            text = f"⏳ 영상 공유 처리 중...\n• {current_batch}기: {week}주차\n• 이전 기수: {week + 1}주차\n완료되면 알려드릴게요!"

        return {
            "statusCode": 200,
            "body": json.dumps({
                "response_type": "ephemeral",
                "text": text
            })
        }

    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return {
            "statusCode": 200,
            "body": json.dumps({
                "response_type": "ephemeral",
                "text": f"❌ 오류가 발생했습니다: {str(e)}"
            })
        }


def process_handler(event: dict, context) -> dict:
    """프로세서 핸들러 - Slack 커맨드 또는 EventBridge 스케줄에서 호출."""
    logger.info(f"Process Event: {json.dumps(event)}")

    try:
        schedule_config = get_schedule_config()
        response_url = event.get("response_url")

        # week이 있으면 슬래시 커맨드, 없으면 스케줄 트리거
        if "week" in event:
            week = event["week"]
        else:
            week = get_current_week()
            if week is None:
                logger.warning("스케줄 범위 밖 - 공유 스킵")
                return {"status": "skipped", "message": "스케줄 범위 밖"}

        current_batch = schedule_config.get("current_batch", 8)
        last_week = schedule_config.get("last_week", 9)
        is_last_week = (week == last_week)

        # 1. Google Drive 폴더 공유
        share_result = share_week_folders(week, current_batch, is_last_week=is_last_week)
        logger.info(f"Share result: {json.dumps(share_result)}")

        if not share_result["shared_folders"]:
            error_msg = f"❌ {week}주차 폴더를 찾을 수 없습니다."
            if share_result["errors"]:
                error_msg += f"\n오류: {share_result['errors']}"

            if response_url:
                send_to_response_url(response_url, error_msg)
            return {"status": "error", "message": error_msg}

        # 2. 메시지 생성 (템플릿 사용)
        message = generate_simple_message(week, share_result["shared_folders"], current_batch)

        # 3. Slack 관리 채널에 메시지 발송
        send_message(message)

        # 4. response_url로 완료 알림
        shared_count = len(share_result["shared_folders"])
        success_msg = f"✅ {week}주차 영상 공유 완료! ({shared_count}개 기수)\n관리 채널에 메시지가 발송되었습니다."

        if response_url:
            send_to_response_url(response_url, success_msg)

        return {"status": "success", "shared_count": shared_count}

    except Exception as e:
        logger.error(f"Process Error: {e}", exc_info=True)

        # 에러 알림
        try:
            send_error_message(str(e), {"event": str(event)[:500]})
            if event.get("response_url"):
                send_to_response_url(
                    event["response_url"],
                    f"❌ 처리 중 오류가 발생했습니다: {str(e)}"
                )
        except Exception:
            pass

        return {"status": "error", "message": str(e)}


def process_share(event: dict) -> dict:
    """동기 처리 (테스트용)."""
    return process_handler(event, None)
