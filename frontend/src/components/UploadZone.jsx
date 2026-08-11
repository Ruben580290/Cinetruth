import { useRef, useState } from "react";

import { Badge, Card, Texture } from "../ui";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const UploadZone = ({ file, previewUrl, onFileSelected, onError }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = (candidate) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type))
      return onError("Eso no es una foto, reina. Dame un JPEG o PNG.");
    if (candidate.size > MAX_SIZE_BYTES)
      return onError("Esa foto pesa más que el ego de una diva. Máximo 5 MB.");
    onFileSelected(candidate);
  };

  return (
    <Card
      tone={isDragging ? "cyan" : "paper"}
      shadow="md"
      shape="irregular"
      padding="lg"
      className="group relative flex min-h-[330px] cursor-pointer flex-col items-center justify-center overflow-hidden text-center"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        validateAndSet(event.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(event) => validateAndSet(event.target.files?.[0])}
      />

      <Texture variant="dots" opacity={8} />

      {previewUrl ? (
        <div className="relative w-full">
          <Badge
            tone="hotpink"
            size="comic"
            shadow="none"
            className="absolute -right-2 -top-3 z-10 rotate-6"
          >
            EVIDENCIA A
          </Badge>
          <img
            src={previewUrl}
            alt="Vista previa"
            className="mx-auto max-h-64 border-4 border-ink object-contain shadow-brutal-sm"
          />
          <p className="mt-5 font-mono text-xs font-bold">{file?.name}</p>
          <p className="mt-2 font-comic text-xl text-hotpink">
            TOCA PARA CAMBIAR EL CHISME
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-ink bg-hotpink text-5xl shadow-brutal-sm">
            📸
          </div>
          <p className="font-comic text-3xl md:text-4xl">
            SUELTA AQUÍ LA FOTO SOSPECHOSA
          </p>
          <p className="mt-3 font-body font-semibold">
            Arrástrala, pégala o haz clic. No juzgamos… todavía.
          </p>
          <Badge tone="lime" size="sm" shadow="none" className="mt-5">
            JPEG / PNG · máximo 5 MB
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default UploadZone;
