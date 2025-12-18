"""Google Drive 권한 부여 및 링크 조회 서비스."""

import json
import os
import time
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build

# 파일 경로
DATA_DIR = Path(__file__).parent.parent / "data"
FOLDERS_FILE = DATA_DIR / "folders.json"
USERS_FILE = DATA_DIR / "users.txt"

# Service Account 인증
SCOPES = ["https://www.googleapis.com/auth/drive"]


def get_drive_service():
    """Service Account로 Drive 서비스 생성."""
    # Lambda 환경변수에서 credentials 가져오기
    credentials_json = os.environ.get("GOOGLE_CREDENTIALS")

    if credentials_json:
        # Lambda: 환경변수에서 credentials
        credentials_info = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=SCOPES
        )
    else:
        # 파일에서 credentials (Lambda 패키지 또는 로컬)
        credentials_file = DATA_DIR / "bjchoi_service_account.json"
        if not credentials_file.exists():
            # 로컬 개발용 fallback
            credentials_file = Path(__file__).parent.parent.parent / "bjchoi-n8n-031b26347c91.json"
        credentials = service_account.Credentials.from_service_account_file(
            str(credentials_file),
            scopes=SCOPES
        )

    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def load_folders() -> dict[str, str]:
    """폴더 ID 설정 파일 로드."""
    with open(FOLDERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_users() -> list[str]:
    """공유 대상 이메일 목록 로드 (Gmail만)."""
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return [
            line.strip() for line in f
            if line.strip()
            and not line.strip().startswith("#")
            and line.strip().lower().endswith("@gmail.com")
        ]


def get_week_folder_id(batch: str, week: int) -> str | None:
    """특정 기수의 주차 폴더 ID 조회.

    Args:
        batch: 기수 (예: "3기")
        week: 주차 (예: 3)

    Returns:
        폴더 ID 또는 None
    """
    folders = load_folders()
    batch_folder_id = folders.get(batch)

    if not batch_folder_id:
        return None

    service = get_drive_service()
    week_name = f"{week}주차"

    query = f"'{batch_folder_id}' in parents and name = '{week_name}' and mimeType = 'application/vnd.google-apps.folder'"

    results = service.files().list(
        q=query,
        fields="files(id, name)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()

    files = results.get("files", [])
    return files[0]["id"] if files else None


def grant_reader_permission(folder_id: str, email: str, max_retries: int = 3) -> dict:
    """지정된 이메일에 Reader 권한 부여 (지수 백오프 적용).

    Args:
        folder_id: 폴더 ID
        email: 권한을 부여할 이메일
        max_retries: 최대 재시도 횟수

    Returns:
        생성된 권한 정보
    """
    service = get_drive_service()

    permission = {
        "type": "user",
        "role": "reader",
        "emailAddress": email
    }

    # Gmail은 알림 안 보냄, 그 외(네이버 등)는 알림 발송
    send_notification = not email.lower().endswith("@gmail.com")

    for attempt in range(max_retries):
        try:
            result = service.permissions().create(
                fileId=folder_id,
                body=permission,
                sendNotificationEmail=send_notification,
                supportsAllDrives=True
            ).execute()
            time.sleep(0.5)  # 기본 딜레이 0.5초
            return result
        except Exception as e:
            if "rateLimitExceeded" in str(e) or "sharingRateLimitExceeded" in str(e):
                wait_time = 6 if attempt == 0 else 9  # 6초, 9초
                time.sleep(wait_time)
                continue
            raise

    raise Exception(f"Rate limit 재시도 초과: {email}")


def share_week_folders(
    week: int,
    current_batch: int,
    min_batch: int = 3,
    is_last_week: bool = False
) -> dict:
    """기수별 주차 폴더 공유.

    - 현재 기수: N주차 공유
    - 이전 기수: N+1주차 공유 (마지막 주차면 N주차)

    Args:
        week: 현재 기수 기준 주차
        current_batch: 현재 운영 기수
        min_batch: 최소 기수 (기본값 3, 1~2기 제외)
        is_last_week: 마지막 주차 여부 (True면 모든 기수 같은 주차 공유)

    Returns:
        공유 결과 (기수별 폴더 링크)
    """
    folders = load_folders()
    users = load_users()

    results = {
        "week": week,
        "shared_folders": [],
        "errors": []
    }

    for batch_name, _ in folders.items():
        batch_num = int(batch_name.replace("기", ""))

        # 최소 기수 미만 제외 (1~2기)
        if batch_num < min_batch:
            continue

        # 미래 기수 제외
        if batch_num > current_batch:
            continue

        # 마지막 주차면 현재 기수만 공유
        if is_last_week and batch_num != current_batch:
            continue

        # 현재 기수는 N주차, 이전 기수는 N+1주차
        target_week = week if batch_num == current_batch else week + 1

        # 주차 폴더 ID 조회
        week_folder_id = get_week_folder_id(batch_name, target_week)

        if not week_folder_id:
            results["errors"].append({
                "batch": batch_name,
                "error": f"{target_week}주차 폴더 없음"
            })
            continue

        # 각 사용자에게 권한 부여
        for email in users:
            try:
                grant_reader_permission(week_folder_id, email)
            except Exception as e:
                # 이미 권한이 있는 경우 등 에러 무시
                if "already has access" not in str(e).lower():
                    results["errors"].append({
                        "batch": batch_name,
                        "email": email,
                        "error": str(e)
                    })

        # 폴더 링크 추가
        folder_link = f"https://drive.google.com/drive/folders/{week_folder_id}"
        results["shared_folders"].append({
            "batch": batch_name,
            "week": target_week,
            "folder_id": week_folder_id,
            "link": folder_link
        })

    return results
