import { FlaskConical, Stethoscope, Leaf, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const futureEcosystemItems = [
  {
    icon: FlaskConical,
    title: "Pathology Routing",
    description: "Connect to lab partners for automated at-home pathology collection based on dropping trends.",
    timeline: "Coming Soon"
  },
  {
    icon: Stethoscope,
    title: "Doctor Connect",
    description: "Generate secure, expiring links to share historical data with specialists before your appointment.",
    timeline: "Q4 Roadmap"
  },
  {
    icon: Leaf,
    title: "Health Products",
    description: "Access a marketplace of curated health and wellness products Deficiencies identified by AI.",
    timeline: "Planning"
  }
];

export default function Ecosystem() {
  return (
    <section className="py-24 bg-white relative border-t border-slate-200/50">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              A complete health ecosystem. Starting today.
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Your intelligent medical vault is just the beginning. HealthLedger is evolving into a comprehensive health hub.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {futureEcosystemItems.map((item, idx) => (
            <Card key={idx} className="bg-slate-50 border-slate-200 shadow-none relative group hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium text-[10px] uppercase tracking-wider">
                    {item.timeline}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors cursor-pointer">
                  Learn about future integrations <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}