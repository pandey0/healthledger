import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { getBiomarkerHistory } from "@/lib/dal/vault";
import { getReferenceRange, isInRange } from "@/lib/referenceRanges";
import { getUserProfile } from "@/lib/dal/user";
import TrendGraph from "@/components/vault/TrendGraph";

// Plain-English context for common markers
function getMarkerContext(
  name: string,
  status: "normal" | "high" | "low" | "unknown"
): { what: string; context: string } | null {
  const key = name.toLowerCase().trim();

  const lookup: Record<string, { what: string; normal: string; high: string; low: string }> = {
    hemoglobin: {
      what: "Hemoglobin is the protein in red blood cells that carries oxygen around your body.",
      normal: "Your level indicates healthy oxygen-carrying capacity.",
      high: "A high level may indicate dehydration or a condition called polycythemia. Staying well-hydrated and a follow-up test can help clarify.",
      low: "A low level may suggest anemia, which can cause fatigue, weakness, or shortness of breath. Consider discussing with your doctor.",
    },
    hb: {
      what: "Hemoglobin is the protein in red blood cells that carries oxygen around your body.",
      normal: "Your level indicates healthy oxygen-carrying capacity.",
      high: "A high level may indicate dehydration or a condition called polycythemia.",
      low: "A low level may suggest anemia. Common causes include iron deficiency, B12 deficiency, or blood loss.",
    },
    glucose: {
      what: "Blood glucose measures the amount of sugar in your bloodstream at the time of the test.",
      normal: "Your fasting glucose is within the healthy range.",
      high: "An elevated reading may suggest impaired glucose metabolism or pre-diabetes. A repeat fasting test and HbA1c can give a clearer picture.",
      low: "A low reading (hypoglycemia) can cause shakiness and dizziness. If recurring, discuss with your doctor.",
    },
    hba1c: {
      what: "HbA1c reflects your average blood sugar levels over the past 2–3 months — a long-term view of glucose control.",
      normal: "Your level is in the non-diabetic range, indicating good long-term glucose control.",
      high: "A high HbA1c suggests sustained elevated blood sugar. Values above 6.5% are generally diagnostic of diabetes.",
      low: "A very low HbA1c is uncommon but may occur with certain anemias or frequent hypoglycemia.",
    },
    "total cholesterol": {
      what: "Total cholesterol is the overall amount of cholesterol in your blood, including both LDL and HDL.",
      normal: "Your level is in the desirable range, associated with lower cardiovascular risk.",
      high: "Elevated cholesterol increases the risk of heart disease over time. Diet, exercise, and sometimes medication can help.",
      low: "Very low cholesterol is uncommon and rarely clinically significant on its own.",
    },
    ldl: {
      what: "LDL (low-density lipoprotein) is often called 'bad cholesterol' because high levels can build up in artery walls.",
      normal: "Your LDL is at an optimal level, which supports heart health.",
      high: "Elevated LDL is a key risk factor for cardiovascular disease. Reducing saturated fats and increasing activity can help.",
      low: "Low LDL is generally considered favorable for heart health.",
    },
    hdl: {
      what: "HDL (high-density lipoprotein) is called 'good cholesterol' because it helps remove other forms of cholesterol from your bloodstream.",
      normal: "Your HDL is at a healthy level — higher HDL is protective for the heart.",
      high: "High HDL is generally a good sign and associated with lower cardiovascular risk.",
      low: "Low HDL is a risk factor for heart disease. Regular aerobic exercise is one of the most effective ways to raise it.",
    },
    triglycerides: {
      what: "Triglycerides are the most common type of fat in the body, derived from the calories you don't immediately use.",
      normal: "Your triglyceride level is normal.",
      high: "High triglycerides are often linked to diet, metabolic syndrome, or diabetes. Reducing refined carbs and alcohol typically helps.",
      low: "Low triglycerides are not usually a concern.",
    },
    tsh: {
      what: "TSH (thyroid-stimulating hormone) is produced by your pituitary gland and tells your thyroid how much hormone to make.",
      normal: "Your TSH is within the normal range, suggesting your thyroid is functioning well.",
      high: "A high TSH may indicate an underactive thyroid (hypothyroidism). Symptoms can include fatigue, weight gain, and feeling cold.",
      low: "A low TSH may indicate an overactive thyroid (hyperthyroidism). Symptoms can include rapid heartbeat, weight loss, and anxiety.",
    },
    "vitamin d": {
      what: "Vitamin D supports bone health, immune function, and has roles in muscle and mood regulation.",
      normal: "Your Vitamin D is in the sufficient range.",
      high: "Very high Vitamin D (usually from excess supplementation) can cause toxicity, though this is rare.",
      low: "Low Vitamin D is common and can cause bone weakness and fatigue. Sunlight exposure and supplementation are the main remedies.",
    },
    "vitamin b12": {
      what: "Vitamin B12 is essential for nerve function, DNA synthesis, and the production of red blood cells.",
      normal: "Your B12 level is in the normal range.",
      high: "High B12 without supplementation can occasionally indicate liver or blood disorders — worth mentioning to your doctor.",
      low: "Low B12 can cause fatigue, neurological symptoms, and a type of anemia. It's common in those with plant-based diets.",
    },
    creatinine: {
      what: "Creatinine is a waste product from normal muscle activity that your kidneys filter out of the blood.",
      normal: "Your creatinine is in the normal range, suggesting healthy kidney filtration.",
      high: "Elevated creatinine may indicate reduced kidney function. Dehydration can also temporarily raise levels.",
      low: "Low creatinine is usually not a concern and may reflect low muscle mass.",
    },
    alt: {
      what: "ALT (alanine aminotransferase) is an enzyme found mainly in liver cells. Elevated levels indicate liver stress.",
      normal: "Your ALT is within the normal range, indicating healthy liver function.",
      high: "Elevated ALT may signal liver inflammation, which can stem from fatty liver, alcohol, medications, or infections.",
      low: "Low ALT is not clinically significant.",
    },
    ferritin: {
      what: "Ferritin is a protein that stores iron and releases it as needed. It's the best indicator of your body's iron reserves.",
      normal: "Your ferritin level reflects adequate iron stores.",
      high: "Elevated ferritin can indicate inflammation, liver disease, or iron overload. A follow-up test with a full iron panel helps clarify.",
      low: "Low ferritin means your iron stores are depleted, even if hemoglobin appears normal. This is an early sign of iron deficiency.",
    },
    "uric acid": {
      what: "Uric acid is a waste product from the breakdown of purines found in many foods. It's filtered by the kidneys.",
      normal: "Your uric acid is within the normal range.",
      high: "High uric acid can crystallize in joints, causing gout. It's also associated with kidney stones. Reducing red meat and alcohol can help.",
      low: "Low uric acid is uncommon and generally not a clinical concern.",
    },
    platelets: {
      what: "Platelets are tiny blood cells that help your body form clots to stop bleeding.",
      normal: "Your platelet count is normal.",
      high: "A high platelet count can sometimes increase clotting risk. Causes range from infection to inflammatory conditions.",
      low: "A low platelet count can increase bleeding risk. Causes include viral infections, medications, or certain bone marrow conditions.",
    },
    wbc: {
      what: "White blood cells (WBC) are your immune system's primary fighters against infection and disease.",
      normal: "Your white blood cell count is in the normal range.",
      high: "An elevated WBC often indicates your body is fighting an infection or inflammation.",
      low: "A low WBC can reduce your ability to fight infection. It can result from viral illness, certain medications, or bone marrow issues.",
    },
  };

  const entry = lookup[key];
  if (!entry) return null;

  const contextMap = { normal: entry.normal, high: entry.high, low: entry.low, unknown: "" };
  const context = contextMap[status] || "";

  return context ? { what: entry.what, context } : null;
}

export default async function MarkerTrendPage({
  params,
}: {
  params: Promise<{ markerName: string }>;
}) {
  const resolvedParams = await params;
  const decodedMarkerName = decodeURIComponent(resolvedParams.markerName);

  const [history, userProfile] = await Promise.all([
    getBiomarkerHistory(decodedMarkerName),
    getUserProfile(),
  ]);

  const profile = userProfile
    ? { gender: userProfile.gender as "male" | "female" | "other" | null, age: userProfile.age }
    : undefined;

  const ref = getReferenceRange(decodedMarkerName, profile);

  const numericHistory = history.filter((d) => d.numericValue !== null);
  const latestEntry = numericHistory[0];
  const latestValue = latestEntry?.numericValue ?? null;
  const latestInRange = latestValue !== null && ref ? isInRange(latestValue, ref) : null;

  const unit = numericHistory[0]?.unit ?? (ref?.unit ?? "");

  // Trend stats
  const values = numericHistory.map((d) => d.numericValue as number);
  const minVal = values.length ? Math.min(...values) : null;
  const maxVal = values.length ? Math.max(...values) : null;

  // Trend direction (compare latest vs previous)
  const trendDirection =
    numericHistory.length >= 2
      ? numericHistory[0].numericValue! > numericHistory[1].numericValue!
        ? "up"
        : numericHistory[0].numericValue! < numericHistory[1].numericValue!
        ? "down"
        : "stable"
      : null;

  // Change from first recorded to latest
  const firstVal = numericHistory.length >= 2 ? numericHistory[numericHistory.length - 1].numericValue! : null;
  const totalChange = firstVal !== null && latestValue !== null ? latestValue - firstVal : null;

  // Status for context
  const contextStatus =
    latestValue === null ? "unknown" :
    latestInRange === true ? "normal" :
    ref && latestValue > ref.max ? "high" :
    "low";

  const markerContext = getMarkerContext(decodedMarkerName, contextStatus as "normal" | "high" | "low" | "unknown");

  return (
    <div className="flex flex-col animate-in slide-in-from-right-4 duration-500 pb-12">

      {/* Header */}
      <header className="px-6 pt-8 pb-5 sticky top-0 z-10 bg-[#F4F3F0]/95 backdrop-blur-md">
        <Link
          href="/vault"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-[14px]">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight capitalize leading-tight">
              {decodedMarkerName}
            </h1>
            <p className="text-[12px] font-semibold text-slate-400 mt-0.5">
              {numericHistory.length} data point{numericHistory.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-4">

        {/* Current value + status card */}
        {latestValue !== null && (
          <div className={`rounded-[24px] p-5 border ${
            latestInRange === true
              ? "bg-emerald-50 border-emerald-100"
              : latestInRange === false
              ? "bg-amber-50 border-amber-100"
              : "bg-white border-slate-100"
          }`}>
            <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-1">Latest Reading</p>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-2">
                <span className="text-[40px] font-extrabold text-slate-800 leading-none tabular-nums">
                  {latestValue}
                </span>
                <span className="text-[16px] font-semibold text-slate-400 mb-1">{unit}</span>
              </div>
              {trendDirection && (
                <div className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full ${
                  trendDirection === "up" ? "bg-white/60 text-slate-600" :
                  trendDirection === "down" ? "bg-white/60 text-slate-600" :
                  "bg-white/60 text-slate-500"
                }`}>
                  {trendDirection === "up" && <TrendingUp className="w-3.5 h-3.5" />}
                  {trendDirection === "down" && <TrendingDown className="w-3.5 h-3.5" />}
                  {trendDirection === "stable" && <Minus className="w-3.5 h-3.5" />}
                  {trendDirection === "up" ? "Trending up" : trendDirection === "down" ? "Trending down" : "Stable"}
                </div>
              )}
            </div>
            {latestInRange !== null && (
              <div className={`flex items-center gap-2 mt-3 text-[13px] font-bold ${latestInRange ? "text-emerald-700" : "text-amber-700"}`}>
                <div className={`w-2 h-2 rounded-full ${latestInRange ? "bg-emerald-500" : "bg-amber-500"}`} />
                {latestInRange ? "Within normal range" : "Outside normal range"}
              </div>
            )}
          </div>
        )}

        {/* Stats row: min / max / change */}
        {numericHistory.length >= 2 && minVal !== null && maxVal !== null && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Lowest", value: minVal, suffix: unit },
              { label: "Highest", value: maxVal, suffix: unit },
              {
                label: "Change",
                value: totalChange !== null
                  ? `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)}`
                  : "—",
                suffix: totalChange !== null ? unit : "",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-[18px] p-3.5 border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-[18px] font-extrabold text-slate-800 tabular-nums leading-tight">{stat.value}</p>
                {stat.suffix && <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{stat.suffix}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Plain-English context */}
        {markerContext && (
          <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
            <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{markerContext.what}</p>
            <p className={`text-[13px] font-medium leading-relaxed mt-2 ${
              contextStatus === "normal" ? "text-emerald-700" :
              contextStatus === "high" ? "text-amber-700" :
              contextStatus === "low" ? "text-blue-700" :
              "text-slate-600"
            }`}>
              {markerContext.context}
            </p>
          </div>
        )}

        {/* Reference range info */}
        {ref ? (
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-[10px] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">
                {ref.label}
              </p>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5">
                {ref.min}–{ref.max === 999 ? "↑" : ref.max} {ref.unit}
              </p>
              {ref.note && (
                <p className="text-[11px] text-slate-400 font-medium mt-1">{ref.note}</p>
              )}
              <p className="text-[11px] text-slate-400 font-medium mt-2">
                Reference values are general guidelines. Consult your doctor for personalized interpretation.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-[10px] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-600">No reference range available</p>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                Standard ranges for this marker aren&apos;t in our database yet.
              </p>
            </div>
          </div>
        )}

        {/* Trend chart */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Trend Over Time</p>
          {numericHistory.length < 2 ? (
            <div className="bg-white rounded-[20px] p-8 border border-dashed border-slate-200 flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-slate-200 mb-3" />
              <p className="text-[14px] font-bold text-slate-600">Not enough data to plot a trend</p>
              <p className="text-[12px] text-slate-400 font-medium mt-1">
                Upload another report containing {decodedMarkerName} to see how it changes over time.
              </p>
            </div>
          ) : (
            <TrendGraph data={history} referenceRange={ref} />
          )}
        </div>

        {/* Historical data table */}
        {numericHistory.length > 0 && (
          <div>
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">History</p>
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
              {numericHistory.map((entry, i) => {
                const inRange = ref ? isInRange(entry.numericValue!, ref) : null;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-4 py-3.5 ${i < numericHistory.length - 1 ? "border-b border-slate-50" : ""}`}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-slate-600">
                        {new Date(entry.testDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {inRange !== null && (
                        <p className={`text-[11px] font-bold mt-0.5 ${inRange ? "text-emerald-500" : "text-red-500"}`}>
                          {inRange ? "Normal" : "Out of range"}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[17px] font-extrabold text-slate-800 tabular-nums">{entry.numericValue}</span>
                      <span className="text-[12px] font-semibold text-slate-400 ml-1">{entry.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
