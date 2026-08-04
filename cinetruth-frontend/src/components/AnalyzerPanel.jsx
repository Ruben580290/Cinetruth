import { useEffect, useState } from "react";
import UploadZone from "./UploadZone";
import ResultCard from "./ResultCard";
import SimilarCasesCard from "./SimilarCasesCard";
import { analyzeImage, analyzeText } from "../api/analyzeApi";

const TABS = [
  { id: "image", label: "📸 FOTO SOSPECHOSA" },
  { id: "text", label: "🗞️ TITULAR ESCANDALOSO" },
];

const AnalyzerPanel = () => {
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const switchMode = (nextMode) => { setMode(nextMode); setError(""); setResult(null); };
  const handleFileSelected = (selected) => {
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setResult(null);
    if (mode === "image" && !file) return setError("Primero dame la foto del delito, Sherlock.");
    if (mode === "text" && !text.trim()) return setError("El chisme invisible todavía no lo analizamos. Pega un titular.");
    setIsLoading(true);
    try { setResult(mode === "image" ? await analyzeImage(file) : await analyzeText(text)); }
    catch (submitError) { setError(submitError.message || "El chismógrafo se desmayó. Intenta otra vez."); }
    finally { setIsLoading(false); }
  };

  return (
    <section id="analizar" className="relative border-b-4 border-ink bg-hotpink py-20">
      <div className="absolute inset-0 comic-grid opacity-10" />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block -rotate-2 border-3 border-ink bg-electric px-4 py-2 font-mono text-xs font-bold uppercase shadow-brutal-sm">Laboratorio oficial del “ajá, ¿y la fuente?”</span>
          <h2 className="mt-6 font-display text-4xl leading-none text-white text-stroke-white md:text-6xl">PONGAMOS EL CHISME EN LA PARRILLA</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold text-white">Prometemos ser discretos. Mentira. Lo vamos a revisar hasta que confiese.</p>
        </div>

        <div className="mt-10 border-4 border-ink bg-cream p-4 shadow-brutal-yellow irregular md:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => switchMode(tab.id)} className={`border-4 border-ink px-4 py-4 font-comic text-xl shadow-brutal-sm md:text-2xl ${mode === tab.id ? "bg-cyan -rotate-1" : "bg-paper"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            {mode === "image" ? (
              <UploadZone file={file} previewUrl={previewUrl} onFileSelected={handleFileSelected} onError={setError} />
            ) : (
              <div className="relative">
                <span className="absolute -right-2 -top-4 z-10 rotate-3 border-3 border-ink bg-lime px-3 py-1 font-comic text-xl">SUELTA EL BOMBAZO</span>
                <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={5000} placeholder={'Ejemplo: “Cantante desaparece después de revelar el secreto que paralizó internet…”'} rows={9} className="irregular w-full resize-none border-4 border-ink bg-paper p-6 text-lg font-semibold shadow-brutal outline-none placeholder:text-muted/70" />
                <p className="mt-2 text-right font-mono text-xs font-bold">{text.length}/5000 caracteres de drama</p>
              </div>
            )}

            {error && <p className="mt-5 border-4 border-ink bg-danger px-5 py-4 font-bold text-white shadow-brutal-sm">🚫 {error}</p>}

            <button type="submit" disabled={isLoading} className="mt-7 w-full border-4 border-ink bg-violet px-7 py-5 font-comic text-3xl tracking-wide text-white shadow-brutal disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              {isLoading ? "🌀 SACUDIENDO EL CHISME…" : "💥 ¡QUE CONFIESE!"}
            </button>
          </form>

          {isLoading && (
            <div className="relative mt-7 overflow-hidden border-4 border-ink bg-paper p-6 text-center shadow-brutal-sm">
              <div className="scan-beam absolute left-0 top-0 h-10 w-full bg-cyan/70" />
              <p className="relative font-comic text-2xl">Revisando dedos, fondos, fechas y excusas… 👀</p>
            </div>
          )}
        </div>

        {result && <div className="mt-12"><ResultCard result={result} /><SimilarCasesCard cases={result.similarCases} /></div>}
      </div>
    </section>
  );
};
export default AnalyzerPanel;
