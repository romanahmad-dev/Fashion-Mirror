import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, Layers, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/50 -skew-x-12 translate-x-1/4 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8 max-w-2xl"
            >
              <motion.h1 
                variants={item}
                className="text-5xl lg:text-7xl font-serif font-bold leading-tight"
              >
                Try clothes <span className="text-muted-foreground italic">virtually</span> before you buy.
              </motion.h1>
              
              <motion.p 
                variants={item}
                className="text-lg text-muted-foreground leading-relaxed max-w-lg"
              >
                Experience the future of fashion. Upload your photo, choose a garment, and see how it fits instantly using our advanced AI technology.
              </motion.p>
              
              <motion.div variants={item} className="flex gap-4">
                <a href="/api/login">
                  <Button size="lg" className="h-14 px-8 text-base rounded-full group">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="#features">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full">
                    Learn More
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Hero Image Collage */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {/* Descriptive comment for Unsplash Image: Fashion model studio shot */}
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" 
                  alt="Model wearing fashion" 
                  className="rounded-2xl shadow-2xl translate-y-8"
                />
                {/* Descriptive comment for Unsplash Image: Minimalist clothing rack */}
                <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80" 
                  alt="Clothing rack" 
                  className="rounded-2xl shadow-2xl -translate-y-8"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Three simple steps to your new look. No complex setup required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Wand2,
                title: "Upload Photo",
                description: "Upload a photo of yourself or choose a model that matches your body type."
              },
              {
                icon: Layers,
                title: "Choose Garment",
                description: "Select a clothing item you want to try on from our catalog or upload your own."
              },
              {
                icon: Zap,
                title: "Instant Magic",
                description: "Our AI generates a realistic try-on result in seconds, preserving texture and fit."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto text-center">
          <div className="bg-primary text-primary-foreground rounded-3xl p-12 lg:p-24 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl font-serif font-bold">Ready to transform your style?</h2>
              <p className="text-primary-foreground/80 text-lg">
                Join thousands of users who are already experiencing the future of virtual fashion.
              </p>
              <a href="/api/login">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-base rounded-full">
                  Get Started for Free
                </Button>
              </a>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-8 border-white" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border-8 border-white" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
