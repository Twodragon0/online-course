#!/bin/bash

# Docker 데몬 실행 확인
while ! docker system info > /dev/null 2>&1; do
  echo "Waiting for Docker daemon to start..."
  sleep 1
done

# 환경 변수 로드
if [ ! -f .env.production ]; then
    echo "Creating .env.production from .env"
    cp .env .env.production
fi

set -a
source .env.production
set +a

# GCP 프로젝트 ID 설정
PROJECT_ID="online-course-447813"
REGION="asia-northeast3"

# Docker 이미지 태그에 타임스탬프 추가
IMAGE_TAG="asia.gcr.io/$PROJECT_ID/online-course:$(date +%Y%m%d-%H%M%S)"

echo "Building and pushing to $IMAGE_TAG"

# 컨테이너 이미지 빌드 및 푸시
docker build -t $IMAGE_TAG . && \
docker push $IMAGE_TAG && \

# Cloud Run 배포
gcloud run deploy online-course \
  --image $IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=$DATABASE_URL,NEXTAUTH_URL=$NEXTAUTH_URL"