import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  "AI-powered learning assistance",
  "HD video content",
  "Interactive exercises",
  "Expert instructors",
  "Certificate of completion",
  "24/7 support",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-12 gap-8">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="text-primary">New Feature</span>
            <span className="mx-2">|</span>
            <span>AI Chat Support</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Transform Your Business with Online Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Create and share professional courses with your audience. Engage with AI-powered learning tools and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/courses" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Pricing
            </Link>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-xl aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-lg shadow-lg flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] rounded-lg" />
          <div className="relative text-2xl font-semibold text-foreground/80">
            Interactive Demo
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to create, manage, and grow your online courses.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-4 rounded-lg bg-background shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of instructors who are already using our platform to reach students worldwide.
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Create Your Course
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
