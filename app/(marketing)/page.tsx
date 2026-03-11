"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react"; 
import { Button } from "@/components/ui/button";
import { Activity, Lock } from "lucide-react"; 

const steps = [
  {
    id: "step-1",
    image: "/onboarding/1.png",
    title: "Find the best doctor and medicine for you.",
  },
  {
    id: "step-2",
    image: "/onboarding/2.png",
    title: "Track your health trends securely over time.",
  },
  {
    id: "step-3",
    image: "/onboarding/3.png", 
    title: "Your complete medical history in one place.",
  }
];

export default function AppSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [showSplash, setShowSplash] = useState(true);
  const [animateLogo, setAnimateLogo] = useState(false);
  const [slideUp, setSlideUp] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => setAnimateLogo(true), 800);
    const slideTimer = setTimeout(() => setSlideUp(true), 1100);
    const removeTimer = setTimeout(() => setShowSplash(false), 2000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(slideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (showSplash || isInteracting) return;

    const timer = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const width = container.clientWidth;
        
        let nextStep = currentStep + 1;
        if (nextStep >= steps.length) {
          nextStep = 0;
        }

        container.scrollTo({
          left: nextStep * width,
          behavior: "smooth"
        });
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [showSplash, isInteracting, currentStep]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const clientWidth = e.currentTarget.clientWidth;
    const activeIndex = Math.round(scrollPosition / clientWidth);
    setCurrentStep(activeIndex);
  };

  const handleDotClick = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * width,
        behavior: "smooth"
      });
      setCurrentStep(index);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F4F3F0] flex items-center justify-center md:p-6 selection:bg-blue-100 relative overflow-hidden">
      
      {/* 🚀 THE NATIVE SPLASH SCREEN */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1A365D] transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
            slideUp ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div 
            className={`flex flex-col items-center transition-all duration-[400ms] ease-out ${
              animateLogo ? "scale-110 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <div className="p-4 bg-white/10 rounded-3xl mb-5 backdrop-blur-md border border-white/20 shadow-2xl">
              <Activity className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">HealthLedger</h1>
          </div>
        </div>
      )}

      {/* 📱 THE MOBILE PHONE CONTAINER */}
      <main 
        className={`w-full h-[100dvh] md:h-[820px] md:max-w-[400px] bg-white md:rounded-[40px] shadow-sm flex flex-col relative overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
          slideUp ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"
        }`}
      >
        
        {/* The Swipeable Area with Interaction Sensors */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          onMouseDown={() => setIsInteracting(true)}
          onMouseUp={() => setIsInteracting(false)}
          onMouseLeave={() => setIsInteracting(false)}
          // Changed padding top to be responsive (pt-8 on small screens, pt-16 on larger)
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar smooth-scroll pt-8 sm:pt-16 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

          {steps.map((step, idx) => (
            // Changed justify-start to justify-center to dynamically balance the vertical space
            <div 
              key={step.id} 
              className="w-full h-full flex-shrink-0 snap-center flex flex-col items-center justify-center px-6 sm:px-8 pb-4"
            >
              {/* Responsive Image Container: Uses max-h-[35vh] so it shrinks on short phones */}
              <div className="relative w-full max-w-[240px] sm:max-w-[280px] aspect-square max-h-[35vh] mb-6 sm:mb-10">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                  priority={idx === 0}
                />
              </div>
              
              {/* Responsive Typography: Shrinks text slightly on very small screens */}
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#111827] leading-[1.3] tracking-tight text-center w-full px-2">
                {step.title}
              </h1>
            </div>
          ))}
        </div>

        {/* 🔒 THE STATIC BOTTOM SECTION */}
        <div className="w-full flex flex-col items-center px-6 sm:px-8 pb-6 sm:pb-8 pt-2 bg-white z-10">
          
          {/* Clickable Swiper Dots */}
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-[#1A365D]" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Get Started Button */}
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            className="w-full max-w-[240px] h-12 sm:h-14 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-[16px] text-[16px] sm:text-[17px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-md mb-4 sm:mb-5"
          >
            Get Started
          </Button>

          {/* Trust & Security Anchor */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-500 mb-3">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Secure, Private, & HIPAA Compliant</span>
          </div>

          {/* Legal Protections */}
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium text-center leading-relaxed">
            By continuing, you agree to HealthLedger's <br className="hidden sm:block"/>
            <a href="#" className="underline decoration-slate-200 hover:text-slate-600 transition-colors">Terms of Service</a> and <a href="#" className="underline decoration-slate-200 hover:text-slate-600 transition-colors">Privacy Policy</a>.
          </p>

        </div>

      </main>
    </div>
  );
}