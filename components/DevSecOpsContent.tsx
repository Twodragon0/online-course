"use client";

import { BookOpen, Shield, Cog, Target, CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DevSecOpsContent() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Main Title */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">DevSecOps란?</h1>
        <p className="text-lg leading-relaxed">
          <span className="font-semibold text-primary">Development(개발)</span>, 
          <span className="font-semibold text-red-500">Security(보안)</span>, 
          <span className="font-semibold text-blue-500">Operations(운영)</span>의 
          약자로, 소프트웨어 개발 생명주기(SDLC) 전반에 걸쳐 보안을 통합하는 접근 방식입니다.
        </p>
      </div>

      {/* Goals Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Target className="h-6 w-6 text-primary" />
          DevSecOps의 주요 목표
        </h2>
        <ul className="space-y-3 list-none">
          {[
            "보안의 선제적 통합: 보안을 개발 프로세스의 초기 단계부터 통합하여, 취약점을 사전에 방지합니다.",
            "자동화: 보안 테스트와 모니터링을 자동화하여, 빠르고 안전한 배포를 가능하게 합니다.",
            "협업: 개발자, 보안 전문가, 운영 팀 간의 협업을 강화하여, 보안 문제를 빠르게 해결합니다."
          ].map((goal, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Activities Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Cog className="h-6 w-6 text-primary" />
          DevSecOps의 주요 활동
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "코드 보안 검사",
              description: "정적 코드 분석 도구(SAST)를 사용하여 코드 내 보안 취약점을 조기에 발견합니다.",
              examples: "SonarQube, Checkmarx"
            },
            {
              title: "컨테이너 보안",
              description: "컨테이너 이미지를 스캔하여 취약점을 확인합니다.",
              examples: "Clair, Anchore"
            },
            {
              title: "인프라 보안",
              description: "Infrastructure as Code(IaC) 도구를 사용하여 인프라 설정을 보안 검사합니다.",
              examples: "Terraform, CloudFormation + Checkov"
            },
            {
              title: "지속적 보안 테스트",
              description: "CI/CD 파이프라인에 보안 테스트를 통합합니다.",
              examples: "OWASP ZAP, Snyk"
            }
          ].map((activity, index) => (
            <div key={index} className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
              <p className="text-xs text-primary">예: {activity.examples}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Benefits Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          DevSecOps의 장점
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "빠른 배포: 보안이 자동화되어 개발 속도가 느려지지 않습니다.",
            "비용 절감: 초기에 보안 문제를 발견하면 수정 비용이 적게 듭니다.",
            "규정 준수: 보안 표준과 규정을 쉽게 준수할 수 있습니다."
          ].map((benefit, index) => (
            <div key={index} className="p-4 border rounded-lg bg-card">
              <p className="text-sm">{benefit}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 