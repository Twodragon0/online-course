# 결제 시스템 설정 가이드

이 문서는 Stripe와 PayPal 결제 시스템을 설정하는 방법을 안내합니다.

## 목차

1. [Stripe 설정](#stripe-설정)
2. [PayPal 설정](#paypal-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [웹훅 설정](#웹훅-설정)
5. [테스트](#테스트)

## Stripe 설정

### 1. Stripe 계정 생성

1. [Stripe Dashboard](https://dashboard.stripe.com)에 접속하여 계정을 생성합니다.
2. 테스트 모드와 프로덕션 모드를 구분하여 사용합니다.

### 2. API 키 발급

1. Stripe Dashboard > Developers > API keys로 이동합니다.
2. **Publishable key**와 **Secret key**를 복사합니다.
   - 테스트 모드: `pk_test_...`, `sk_test_...`
   - 프로덕션 모드: `pk_live_...`, `sk_live_...`

### 3. Price ID 생성 (구독 모드 사용 시)

구독 모드를 사용하려면 Stripe에서 Price를 생성해야 합니다.

1. Stripe Dashboard > Products로 이동합니다.
2. "Add product"를 클릭합니다.
3. 제품 정보 입력:
   - **Name**: Basic Plan 또는 Pro Plan
   - **Pricing model**: Standard pricing
   - **Price**: $9 (Basic) 또는 $19 (Pro)
   - **Billing period**: Monthly
4. Price ID를 복사합니다 (예: `price_xxxxx`).

### 4. 환경 변수 설정

`.env` 파일에 다음 변수를 추가합니다:

```bash
# Stripe 시크릿 키
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"

# Stripe 공개 키 (클라이언트 사이드)
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"

# Stripe 웹훅 시크릿
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"

# Stripe Price ID (선택사항, 구독 모드 사용 시)
STRIPE_BASIC_PRICE_ID="price_your-basic-price-id"
STRIPE_PRO_PRICE_ID="price_your-pro-price-id"
```

## PayPal 설정

### 1. PayPal 계정 생성

1. [PayPal Developer Dashboard](https://developer.paypal.com)에 접속합니다.
2. 계정을 생성하거나 기존 계정으로 로그인합니다.

### 2. 앱 생성

1. Dashboard > My Apps & Credentials로 이동합니다.
2. "Create App"을 클릭합니다.
3. 앱 이름을 입력하고 Sandbox 또는 Live를 선택합니다.
4. **Client ID**와 **Secret**를 복사합니다.

### 3. 환경 변수 설정

`.env` 파일에 다음 변수를 추가합니다:

```bash
# PayPal 클라이언트 ID
PAYPAL_CLIENT_ID="your-paypal-client-id"

# PayPal 클라이언트 시크릿
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# PayPal 웹훅 시크릿
PAYPAL_WEBHOOK_SECRET="your-paypal-webhook-secret"
```

## 환경 변수 설정

### 전체 환경 변수 목록

`.env` 파일에 다음 변수들을 모두 설정합니다:

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."  # 선택사항
STRIPE_PRO_PRICE_ID="price_..."    # 선택사항

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_WEBHOOK_SECRET="..."

# NextAuth (결제 성공/실패 리다이렉트용)
NEXTAUTH_URL="http://localhost:3000"  # 개발
# NEXTAUTH_URL="https://yourdomain.com"  # 프로덕션
```

## 웹훅 설정

### Stripe 웹훅 설정

1. Stripe Dashboard > Developers > Webhooks로 이동합니다.
2. "Add endpoint"를 클릭합니다.
3. Endpoint URL 입력:
   - 개발: `http://localhost:3000/api/webhooks/stripe` (Stripe CLI 사용)
   - 프로덕션: `https://yourdomain.com/api/webhooks/stripe`
4. 이벤트 선택:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Signing secret를 복사하여 `STRIPE_WEBHOOK_SECRET`에 설정합니다.

#### 로컬 개발용 Stripe CLI

로컬에서 웹훅을 테스트하려면 Stripe CLI를 사용합니다:

```bash
# Stripe CLI 설치
brew install stripe/stripe-cli/stripe

# 로그인
stripe login

# 웹훅 포워딩
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### PayPal 웹훅 설정

1. PayPal Developer Dashboard > My Apps & Credentials로 이동합니다.
2. 앱을 선택하고 "Webhooks" 섹션으로 이동합니다.
3. "Add webhook"을 클릭합니다.
4. Webhook URL 입력:
   - 프로덕션: `https://yourdomain.com/api/webhooks/paypal`
5. 이벤트 선택:
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
6. Webhook ID를 복사하여 `PAYPAL_WEBHOOK_SECRET`에 설정합니다.

## 테스트

### Stripe 테스트 카드

Stripe 테스트 모드에서 사용할 수 있는 테스트 카드:

- **성공**: `4242 4242 4242 4242`
- **3D Secure 필요**: `4000 0025 0000 3155`
- **거부**: `4000 0000 0000 0002`

기타 테스트 카드: [Stripe Testing](https://stripe.com/docs/testing)

### PayPal 테스트 계정

1. PayPal Sandbox에서 테스트 계정을 생성합니다.
2. 테스트 계정으로 로그인하여 결제를 테스트합니다.

## 결제 플로우

### Stripe 결제 플로우

1. 사용자가 가격 페이지에서 플랜을 선택합니다.
2. 결제 방법 선택 (신용카드 또는 PayPal).
3. **신용카드 선택 시**:
   - Stripe Elements를 사용한 결제 폼 표시
   - Payment Intent 또는 Checkout Session 생성
   - 결제 완료 후 웹훅으로 구독 상태 업데이트
4. **PayPal 선택 시**:
   - PayPal 결제 페이지로 리다이렉트
   - 결제 완료 후 웹훅으로 구독 상태 업데이트

### 보안 고려사항

1. **PCI DSS 준수**: Stripe Elements를 사용하여 카드 정보를 직접 처리하지 않습니다.
2. **웹훅 서명 검증**: 모든 웹훅 요청의 서명을 검증합니다.
3. **Rate Limiting**: 결제 API에 rate limiting을 적용합니다.
4. **입력 검증**: 모든 입력값을 검증합니다.
5. **HTTPS 필수**: 프로덕션 환경에서는 HTTPS를 사용해야 합니다.

## 문제 해결

### Stripe 오류

**"Invalid API Key"**
- API 키가 올바른지 확인합니다.
- 테스트/프로덕션 모드가 일치하는지 확인합니다.

**"Webhook signature verification failed"**
- 웹훅 시크릿이 올바른지 확인합니다.
- 로컬 개발 시 Stripe CLI를 사용합니다.

### PayPal 오류

**"Invalid credentials"**
- Client ID와 Secret가 올바른지 확인합니다.
- Sandbox/Live 모드가 일치하는지 확인합니다.

**"Webhook verification failed"**
- 웹훅 시크릿이 올바른지 확인합니다.
- PayPal SDK를 사용한 검증이 필요할 수 있습니다.

## 추가 리소스

- [Stripe 문서](https://stripe.com/docs)
- [PayPal 문서](https://developer.paypal.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [PayPal Sandbox](https://developer.paypal.com/docs/api-basics/sandbox/)
