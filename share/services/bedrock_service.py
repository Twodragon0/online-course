"""메시지 생성 서비스."""


def generate_simple_message(week: int, shared_folders: list[dict], current_batch: int = 8) -> dict:
    """공유 메시지 생성 (Block Kit 형식).

    Args:
        week: 현재 기수 기준 주차
        shared_folders: 공유된 폴더 정보 리스트
        current_batch: 현재 운영 기수

    Returns:
        Slack Block Kit 형식의 메시지
    """
    # 이전 기수와 현재 기수 분리
    prev_folders = [f for f in shared_folders if int(f['batch'].replace('기', '')) < current_batch]
    curr_folders = [f for f in shared_folders if int(f['batch'].replace('기', '')) == current_batch]

    # 이전 기수 주차 (N+1)
    prev_week = week + 1

    blocks = []

    # 이전 기수 섹션
    if prev_folders:
        intro = f"과제 이해도를 높이는 데 도움이 될 만한 역대 기수들의 {prev_week}주차 관련 영상들을 참고해 보세요."

        prev_folder_lines = "\n".join([
            f"📁 {f['batch']} {f['week']}주차 영상 폴더 → <{f['link']}|링크>"
            for f in prev_folders
        ])

        blocks.extend([
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🎥 이전 기수 {prev_week}주차 영상 자료",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": intro
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": prev_folder_lines
                }
            }
        ])

    # 현재 기수 섹션
    if curr_folders:
        curr_folder = curr_folders[0]
        curr_folder_line = f"📁 {curr_folder['batch']} {curr_folder['week']}주차 영상 폴더 → <{curr_folder['link']}|링크>"

        # 이전 기수 있으면 구분선 추가
        if prev_folders:
            blocks.append({"type": "divider"})

        blocks.extend([
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🎥 {current_batch}기 이번주차 영상 자료",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": curr_folder_line
                }
            }
        ])

    # 요약
    blocks.append({
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": f"💡 총 {len(shared_folders)}개 기수 영상이 공유되었습니다."
            }
        ]
    })

    return {
        "blocks": blocks,
        "text": f"🎥 {prev_week}주차 영상 자료 및 {current_batch}기 이번주차 영상"
    }
