#!/bin/bash

# 환경 변수 로드
set -a
source .env.production
set +a

# 프로젝트 ID 설정
PROJECT_ID="online-course-447813"
REGION="asia-northeast3"
SERVICE_NAME="online-course"

# 이미지 태그 생성 (타임스탬프 포함)
IMAGE_TAG="asia.gcr.io/$PROJECT_ID/$SERVICE_NAME:$(date +%Y%m%d-%H%M%S)"

echo "Building Docker image..."
docker build -t $IMAGE_TAG .

echo "Pushing to Container Registry..."
docker push $IMAGE_TAG

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=$DATABASE_URL" \
  --set-env-vars "NEXTAUTH_URL=$NEXTAUTH_URL" \
  --set-env-vars "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" \
  --set-env-vars "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" \
  --set-env-vars "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"