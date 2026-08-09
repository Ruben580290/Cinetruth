import { useEffect, useState } from "react";

import UploadZone from "./UploadZone";
import ResultCard from "./ResultCard";
import SimilarCasesCard from "./SimilarCasesCard";
import { analyzeImage, analyzeText } from "../api/analyzeApi";
import { Alert, Badge, Button, Card, FIELD, Section } from "../ui";

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

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setResult(null);
  };

  const handleFileSelected = (selected) => {
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (mode === "image" && !file)
      return setError("Primero dame la foto del delito, Sherlock.");
    if (mode === "text" && !text.trim())
      return setError(
        "El chisme invisible todavía no lo analizamos. Pega un titular.",
      );

    setIsLoading(true);
    try {
      setResult(
        mode === "image" ? await analyzeImage(file) : await analyzeText(text),
      );
    } catch (submitError) {
      setError(
        submitError.message || "El chismógrafo se desmayó. Intenta otra vez.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section
      id="analizar"
      tone="hotpink"
      texture="grid"
      textureOpacity={10}
      width="medium"
      className="py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Badge tone="electric" size="md" className="-rotate-2">
          Laboratorio oficial del “ajá, ¿y la fuente?”
        </Badge>
        <h2 className="mt-6 font-display text-4xl leading-none text-white text-stroke-white md:text-6xl">
          PONGAMOS EL CHISME EN LA PARRILLA
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-bold text-white">
          Prometemos ser discretos. Mentira. Lo vamos a revisar hasta que
          confiese.
        </p>
      </div>

      <Card
        tone="cream"
        shadow="yellow"
        shape="irregular"
        padding="none"
        className="mt-10 p-4 md:p-8"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              size="lg"
              variant={mode === tab.id ? "secondary" : "neutral"}
              className={mode === tab.id ? "-rotate-1" : ""}
              onClick={() => switchMode(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-7">
          {mode === "image" ? (
            <UploadZone
              file={file}
              previewUrl={previewUrl}
              onFileSelected={handleFileSelected}
              onError={setError}
            />
          ) : (
            <div className="relative">
              <Badge
                tone="lime"
                size="comic"
                shadow="none"
                className="absolute -right-2 -top-4 z-10 rotate-3"
              >
                SUELTA EL BOMBAZO
              </Badge>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={5000}
                placeholder={
                  "Ejemplo: “Cantante desaparece después de revelar el secreto que paralizó internet…”"
                }
                rows={9}
                className={FIELD.textarea}
              />
              <p className="mt-2 text-right font-mono text-xs font-bold">
                {text.length}/5000 caracteres de drama
              </p>
            </div>
          )}

          {error && (
            <Alert
              tone="danger"
              size="md"
              border="thick"
              shadow="sm"
              className="mt-5"
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="primary"
            size="xl"
            disabled={isLoading}
            className="mt-7 w-full sm:w-auto"
          >
            {isLoading ? "🌀 SACUDIENDO EL CHISME…" : "💥 ¡QUE CONFIESE!"}
          </Button>
        </form>

        {isLoading && (
          <Card
            tone="paper"
            shadow="sm"
            padding="lg"
            className="relative mt-7 overflow-hidden text-center"
          >
            <div className="scan-beam absolute left-0 top-0 h-10 w-full bg-cyan/70" />
            <p className="relative font-comic text-2xl">
              Revisando dedos, fondos, fechas y excusas… 👀
            </p>
          </Card>
        )}
      </Card>

      {result && (
        <div className="mt-12">
          <ResultCard result={result} />
          <SimilarCasesCard cases={result.similarCases} />
        </div>
      )}
    </Section>
  );
};

export default AnalyzerPanel;
