"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const steps = [
  {
    id: "archive",
    image: "/onboarding/1.png",
    title: "The Intelligent Archive",
    subtitle: "Digitize your medical history instantly.",
    bg: "bg-emerald-50/50",
  },
  {
    id: "trends",
    image: "/onboarding/2.png",
    title: "Longitudinal Trends",
    subtitle: "Track hidden health patterns over years.",
    bg: "bg-blue-50/50",
  },
  {
    id: "ecosystem",
    image: "/onboarding/3.png", 
    title: "Complete Ecosystem",
    subtitle: "Connect with doctors and pathology.",
    bg: "bg-slate-50",
  }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // This perfectly syncs the navigation dots with where the user swipes
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const clientWidth = e.currentTarget.clientWidth;
    const activeIndex = Math.round(scrollPosition / clientWidth);
    setCurrentStep(activeIndex);
  };

  return (
    <div className="flex-1 flex flex-col relative pt-10 pb-6 overflow-hidden">
      
      {/* The Swipeable Carousel Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar smooth-scroll"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Hides scrollbar on Firefox/IE
      >
        <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

        {steps.map((step, idx) => (
          <div 
            key={step.id} 
            className="w-full h-full flex-shrink-0 snap-center flex flex-col items-center justify-center px-8"
          >
            {/* Massive Hero Image */}
            <div className={`relative w-full aspect-square max-w-[280px] rounded-[2rem] ${step.bg} mb-8 flex items-center justify-center p-4`}>
              <div className="relative w-full h-full drop-shadow-2xl">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                  priority={idx === 0}
                />
              </div>
            </div>
            
            {/* Punchy, Minimal Text */}
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                {step.title}
              </h2>
              <p className="text-[15px] text-slate-500 font-medium">
                {step.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex items-center justify-center gap-2 mt-6 mb-4 z-10">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentStep ? "w-6 bg-slate-800" : "w-1.5 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}