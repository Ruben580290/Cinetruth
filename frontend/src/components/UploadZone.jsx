import { useRef, useState } from "react";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const UploadZone = ({ file, previewUrl, onFileSelected, onError }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = (candidate) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) return onError("Eso no es una foto, reina. Dame un JPEG o PNG.");
    if (candidate.size > MAX_SIZE_BYTES) return onError("Esa foto pesa más que el ego de una diva. Máximo 5 MB.");
    onFileSelected(candidate);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); validateAndSet(e.dataTransfer.files?.[0]); }}
      onClick={() => inputRef.current?.click()}
      className={`group relative flex min-h-[330px] cursor-pointer flex-col items-center justify-center overflow-hidden border-4 border-ink p-6 text-center shadow-brutal ${isDragging ? "bg-cyan" : "bg-paper"} irregular`}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => validateAndSet(e.target.files?.[0])} />
      <div className="absolute inset-0 comic-dots opacity-[.08]" />
      {previewUrl ? (
        <div className="relative w-full">
          <span className="absolute -right-2 -top-3 z-10 rotate-6 border-3 border-ink bg-hotpink px-3 py-1 font-comic text-xl text-white">EVIDENCIA A</span>
          <img src={previewUrl} alt="Vista previa" className="mx-auto max-h-64 border-4 border-ink object-contain shadow-brutal-sm" />
          <p className="mt-5 font-mono text-xs font-bold">{file?.name}</p>
          <p className="mt-2 font-comic text-xl text-hotpink">TOCA PARA CAMBIAR EL CHISME</p>
        </div>
      ) : (
        <div className="relative">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-ink bg-hotpink text-5xl shadow-brutal-sm">📸</div>
          <p className="font-comic text-3xl md:text-4xl">SUELTA AQUÍ LA FOTO SOSPECHOSA</p>
          <p className="mt-3 font-body font-semibold">Arrástrala, pégala o haz clic. No juzgamos… todavía.</p>
          <span className="mt-5 inline-block border-3 border-ink bg-lime px-3 py-1 font-mono text-xs font-bold uppercase">JPEG / PNG · máximo 5 MB</span>
        </div>
      )}
    </div>
  );
};
export default UploadZone;
