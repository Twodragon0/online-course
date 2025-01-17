import { VideoSummary } from "@/components/video-summary";

const courseVideos = {
  devsecops: [
    {
      url: "https://drive.google.com/file/d/1GmOEhnRrBYcgBEVMT25gL8wpZX2hysXC/view",
      title: "DevSecOps 과정 소개",
      summary: "클라우드 보안과 DevSecOps 기초 학습"
    },
    {
      url: "https://drive.google.com/file/d/example1/view",
      title: "AWS 보안 실습",
      summary: "AWS 클라우드 환경의 보안 설정 실습"
    }
  ],
  aiSns: [
    {
      url: "https://drive.google.com/file/d/example2/view",
      title: "AI 기반 SNS 콘텐츠 제작",
      summary: "AI 도구를 활용한 콘텐츠 최적화"
    },
    {
      url: "https://drive.google.com/file/d/example3/view",
      title: "SNS 성과 분석",
      summary: "AI 기반 데이터 분석 및 인사이트 도출"
    }
  ]
};

export default function CoursesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* DevSecOps 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🛡️ DevSecOps 과정</h2>
          <div className="grid gap-6">
            {courseVideos.devsecops.map((video, index) => (
              <VideoSummary
                key={index}
                video={video}
                courseType="devsecops"
              />
            ))}
          </div>
        </section>

        {/* AI SNS 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🤖 AI 활용 SNS 과정</h2>
          <div className="grid gap-6">
            {courseVideos.aiSns.map((video, index) => (
              <VideoSummary
                key={index}
                video={video}
                courseType="aiSns"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 