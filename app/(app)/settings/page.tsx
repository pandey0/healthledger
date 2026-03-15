"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, ChevronDown, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { updateUserProfile } from "@/lib/actions/user";

type ProfileData = {
  name: string;
  gender: string;
  dateOfBirth: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<ProfileData>({
    name: "",
    gender: "",
    dateOfBirth: "",
  });

  // Fetch current profile on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            name: data.name ?? "",
            gender: data.gender ?? "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserProfile({
        name: form.name || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-700 pb-12">

      <header className="px-6 pt-10 pb-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-[32px] font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-[14px] text-slate-500 font-medium mt-1">
          Your profile helps us show accurate reference ranges for your biomarkers.
        </p>
      </header>

      <main className="px-6 space-y-4">

        {/* Why this matters */}
        <div className="bg-blue-50 border border-blue-100 rounded-[20px] p-4">
          <p className="text-[13px] font-bold text-blue-800 mb-1">Why does this matter?</p>
          <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
            Reference ranges for markers like Hemoglobin, Creatinine, HDL, and Ferritin differ between males and females by up to 30%. Age also affects ranges for TSH and ESR. Without your profile, we show generic ranges that may be inaccurate for you.
          </p>
        </div>

        {/* Name */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Personal Info</p>

          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full pl-9 pr-4 py-3 text-[14px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full pl-9 pr-4 py-3 text-[14px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
            {form.dateOfBirth && (
              <p className="text-[11px] text-slate-400 font-medium mt-1 ml-1">
                Age: {(() => {
                  const d = new Date(form.dateOfBirth);
                  const today = new Date();
                  let age = today.getFullYear() - d.getFullYear();
                  if (today.getMonth() - d.getMonth() < 0 || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
                  return age;
                })()} years old
              </p>
            )}
          </div>
        </div>

        {/* Gender */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">Biological Sex</p>
          <p className="text-[12px] text-slate-500 font-medium mb-3 -mt-2">
            Used for accurate reference ranges. This is medical data only.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {["male", "female", "other"].map((g) => (
              <button
                key={g}
                onClick={() => setForm({ ...form, gender: g })}
                className={`py-3 rounded-[14px] text-[13px] font-bold capitalize transition-all border ${
                  form.gender === g
                    ? "bg-[#1A365D] text-white border-[#1A365D] shadow-md"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Impact preview */}
        {(form.gender === "male" || form.gender === "female") && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-[20px] p-4">
            <p className="text-[13px] font-bold text-emerald-800 mb-2">
              Personalised ranges enabled for:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Hemoglobin", "Hematocrit", "RBC",
                "Ferritin", "HDL Cholesterol",
                "Creatinine", "Uric Acid",
                form.gender === "male" ? "Testosterone" : "Estradiol",
                "ALT (SGPT)", "Iron"
              ].map((m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[12px] font-semibold text-emerald-700">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-bold text-[15px] transition-all shadow-md ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-[#1A365D] hover:bg-[#12243e] text-white hover:-translate-y-0.5 active:scale-95"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Saved!
            </>
          ) : isPending ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>

      </main>
    </div>
  );
}
