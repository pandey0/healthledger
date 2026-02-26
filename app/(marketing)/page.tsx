import { signIn } from "@/auth";
import { 
  Activity, 
  ShieldCheck, 
  FolderOpen, 
  MessageSquareText,
  ArrowRight,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white selection:bg-slate-200 flex flex-col overflow-hidden">
      
      {/* Calm Background Grid & Glow */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 z-[-1] h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(51,65,85,0.05)_0,rgba(51,65,85,0)_50%,rgba(51,65,85,0)_100%)]"></div>

      {/* Glassmorphism Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="p-1.5 bg-slate-700 rounded-xl shadow-sm border border-slate-600/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">HealthLedger</span>
          </div>
          
          <form action={async () => { "use server"; await signIn("google", { redirectTo: "/vault" }); }}>
            <Button variant="ghost" className="text-slate-600 font-medium rounded-full px-5 hover:bg-slate-100">
              Sign In
            </Button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <Badge variant="outline" className="mb-8 py-1.5 px-4 text-xs font-semibold text-slate-600 bg-white shadow-sm hover:border-slate-300 transition-colors gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
          </span>
          Your Personal Medical Vault
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter mb-6 leading-[1.05] max-w-4xl">
          Stop carrying messy folders. <br className="hidden md:block" />
          <span className="text-slate-500">
            Start understanding your health.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          HealthLedger replaces your physical medical records with a smart digital vault. Upload your lab reports to instantly track vital trends and chat directly with your medical history.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col items-center gap-5">
          <form action={async () => { "use server"; await signIn("google", { redirectTo: "/vault" }); }}>
            <Button size="lg" className="h-14 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 gap-3">
              <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
              Start Your Digital Ledger
              <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </form>
          
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Bank-grade encryption. We never sell your personal data.
          </div>
        </div>
      </main>

      {/* Calm Bento-Box Feature Section */}
      <section className="bg-white py-24 relative z-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Why you need HealthLedger</h2>
            <p className="text-slate-500 font-medium">Built to solve the three biggest frustrations with personal healthcare.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <Card className="group bg-slate-50/50 border-slate-200/60 hover:border-slate-300 hover:shadow-lg hover:bg-white transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-white text-slate-700 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <CardTitle className="tracking-tight text-xl text-slate-800">Ditch Physical Copies</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                  No more digging through dusty files or scrolling through old WhatsApp messages. Snap a photo, and our system securely digitizes and stores the original document forever.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group bg-slate-50/50 border-slate-200/60 hover:border-slate-300 hover:shadow-lg hover:bg-white transition-all duration-300 md:-translate-y-4">
              <CardHeader>
                <div className="w-12 h-12 bg-white text-slate-700 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <LineChart className="w-6 h-6" />
                </div>
                <CardTitle className="tracking-tight text-xl text-slate-800">Track Hidden Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                  A single blood test tells you nothing about your trajectory. Our AI extracts your biomarkers and graphs them over years, helping you spot dropping vitamin levels instantly.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group bg-slate-50/50 border-slate-200/60 hover:border-slate-300 hover:shadow-lg hover:bg-white transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-white text-slate-700 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <CardTitle className="tracking-tight text-xl text-slate-800">Chat With Your Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                  Meet your specialized health assistant. Instead of manually searching, just ask: <em>"What was my HbA1c last October?"</em> and the AI will pull the exact number and link the PDF.
                </CardDescription>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

    </div>
  );
}