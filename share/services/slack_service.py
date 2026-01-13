"""Slack 메시지 발송 서비스."""

import os
import requests


def get_slack_config() -> dict:
    """Slack 설정 가져오기."""
    return {
        "token": os.environ.get("SLACK_BOT_TOKEN"),
        "channel": os.environ.get("SLACK_CHANNEL_ID")
    }


def send_message(message: str | dict, channel: str = None) -> dict:
    """Slack 채널에 메시지 발송.

    Args:
        message: 발송할 메시지 (문자열 또는 Block Kit dict)
        channel: 채널 ID (없으면 환경변수 사용)

    Returns:
        Slack API 응답
    """
    config = get_slack_config()
    token = config["token"]
    channel_id = channel or config["channel"]

    if not token:
        raise ValueError("SLACK_BOT_TOKEN 환경변수가 설정되지 않았습니다.")

    if not channel_id:
        raise ValueError("SLACK_CHANNEL_ID 환경변수가 설정되지 않았습니다.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Block Kit 형식 또는 일반 텍스트
    if isinstance(message, dict):
        payload = {
            "channel": channel_id,
            "blocks": message.get("blocks", []),
            "text": message.get("text", "")  # fallback
        }
    else:
        payload = {
            "channel": channel_id,
            "text": message,
            "mrkdwn": True
        }

    response = requests.post(
        "https://slack.com/api/chat.postMessage",
        headers=headers,
        json=payload
    )

    result = response.json()

    if not result.get("ok"):
        raise Exception(f"Slack 메시지 발송 실패: {result.get('error')}")

    return result


def send_to_response_url(response_url: str, message: str) -> dict:
    """Slack response_url로 메시지 발송.

    Args:
        response_url: Slack response URL
        message: 발송할 메시지

    Returns:
        응답 결과
    """
    if not response_url:
        return {"ok": False, "error": "response_url이 없습니다."}

    # SSRF 방지: response_url 검증
    # Slack response_url은 항상 https://hooks.slack.com/로 시작해야 함
    if not isinstance(response_url, str):
        return {"ok": False, "error": "유효하지 않은 response_url 형식입니다."}
    
    # URL 길이 제한 (파싱 전에 체크)
    if len(response_url) > 2048:
        return {"ok": False, "error": "response_url이 너무 깁니다."}
    
    # URL 파싱 및 검증
    try:
        from urllib.parse import urlparse
        parsed = urlparse(response_url)
        
        # 호스트명이 없는 경우 거부
        if not parsed.hostname:
            return {"ok": False, "error": "유효하지 않은 response_url 호스트입니다."}
        
        # 정규화된 호스트명 검증 (대소문자 무시)
        hostname_lower = parsed.hostname.lower()
        
        # 허용된 호스트만 허용 (정확한 매칭)
        allowed_hosts = ['hooks.slack.com']
        if hostname_lower not in allowed_hosts:
            return {"ok": False, "error": "유효하지 않은 response_url 호스트입니다."}
        
        # HTTPS만 허용
        if parsed.scheme != 'https':
            return {"ok": False, "error": "HTTPS만 허용됩니다."}
        
        # 포트가 명시된 경우 거부 (기본 포트만 허용)
        if parsed.port is not None and parsed.port != 443:
            return {"ok": False, "error": "유효하지 않은 response_url 포트입니다."}
        
        # 경로가 /services/로 시작하는지 확인 (Slack response URL 형식)
        if not parsed.path.startswith('/services/'):
            return {"ok": False, "error": "유효하지 않은 response_url 경로입니다."}
        
    except Exception as e:
        return {"ok": False, "error": f"response_url 검증 실패: {str(e)}"}

    payload = {
        "response_type": "ephemeral",
        "text": message
    }

    # 타임아웃 설정 및 리다이렉트 비활성화 (SSRF 방지)
    response = requests.post(
        response_url,
        json=payload,
        timeout=10,
        allow_redirects=False  # 리다이렉트 방지
    )

    if response.status_code != 200:
        raise Exception(f"response_url 발송 실패: {response.text}")

    return {"ok": True}


def send_error_message(error: str, context: dict = None) -> dict:
    """에러 메시지 발송.

    Args:
        error: 에러 메시지
        context: 추가 컨텍스트 정보

    Returns:
        Slack API 응답
    """
    message = f"⚠️ **오류 발생**\n\n```{error}```"

    if context:
        context_str = "\n".join([f"- {k}: {v}" for k, v in context.items()])
        message += f"\n\n**컨텍스트:**\n{context_str}"

    return send_message(message)
