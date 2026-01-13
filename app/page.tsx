'use client';

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Shield, Zap, Users, Award, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { 
    icon: Sparkles, 
    title: "AI-powered learning assistance",
    description: "Advanced AI chat support for instant help"
  },
  { 
    icon: Shield, 
    title: "DevSecOps focused",
    description: "Security-first approach to learning"
  },
  { 
    icon: Zap, 
    title: "HD video content",
    description: "High-quality video lessons"
  },
  { 
    icon: Users, 
    title: "Expert instructors",
    description: "Learn from industry professionals"
  },
  { 
    icon: Award, 
    title: "Certificate of completion",
    description: "Earn certificates for your achievements"
  },
  { 
    icon: Headphones, 
    title: "24/7 support",
    description: "Round-the-clock assistance"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 gap-12 overflow-hidden">
        {/* Background gradient animation */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-primary/5 via-primary/2 to-transparent animate-pulse" />
        </div>
        
        <motion.div 
          className="flex-1 space-y-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center rounded-full border bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse" />
            <span className="text-primary font-semibold">New Feature</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span>AI Chat Support</span>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            <span className="gradient-text">
              Transform Your Career
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              with DevSecOps
            </span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Master cloud security and DevSecOps with our comprehensive online courses. 
            Learn from industry experts and build real-world skills with AI-powered assistance.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="/courses" 
              className="group relative inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link 
              href="/pricing"
              className="group inline-flex items-center justify-center rounded-lg border-2 border-input bg-background px-8 py-4 text-base font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-105 hover:shadow-md"
            >
              View Pricing
            </Link>
          </motion.div>
        </motion.div>
        <motion.div 
          className="flex-1 relative w-full max-w-2xl z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-2xl shadow-2xl overflow-hidden border border-primary/20 group">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm mb-4 border-2 border-primary/30"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.4)",
                      "0 0 0 10px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground">DevSecOps Mastery</h3>
                <p className="text-muted-foreground">Learn cloud security the right way</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to master DevSecOps and cloud security.
            </p>
          </motion.div>
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group card-enhanced p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight gradient-text">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who are already mastering DevSecOps and cloud security with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register"
                className="group relative inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Create Your Account
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link 
                href="/courses"
                className="inline-flex items-center justify-center rounded-lg border-2 border-input bg-background px-8 py-4 text-base font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-105"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
