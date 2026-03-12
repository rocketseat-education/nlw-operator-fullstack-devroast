"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeEditor, MAX_CHARACTERS } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { useTRPC } from "@/trpc/client";

function getErrorMessage(error: { message: string }): string {
  const message = error.message.toLowerCase();

  if (message.includes("too_many_requests") || message.includes("rate")) {
    return "// calma, cowboy! muitos roasts por minuto. respire fundo e tente novamente.";
  }

  if (
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("insufficient")
  ) {
    return "// fizeram tanto roast de código que os créditos da IA acabaram. parabéns, devs.";
  }

  if (message.includes("timeout") || message.includes("aborted")) {
    return "// a IA travou analisando seu código. deve ter sido tão ruim que ela desistiu.";
  }

  return "// ops, algo deu errado. até a IA tem dias ruins. tente novamente.";
}

function HomeEditor() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);
  const [manualLanguage, setManualLanguage] = useState<string | null>(null);
  const { detectedLanguage } = useLanguageDetection(code);

  const resolvedLanguage = manualLanguage ?? detectedLanguage;

  const router = useRouter();
  const trpc = useTRPC();
  const createRoast = useMutation(
    trpc.roast.create.mutationOptions({
      onSuccess(data) {
        router.push(`/roast/${data.id}`);
      },
    }),
  );

  const isDisabled =
    code.trim().length === 0 ||
    code.length > MAX_CHARACTERS ||
    createRoast.isPending;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <CodeEditor
        value={code}
        onChange={setCode}
        language={resolvedLanguage}
        onLanguageChange={setManualLanguage}
        className="w-full max-w-3xl"
      />

      {/* Actions Bar */}
      <div className="flex flex-col items-end gap-3 w-full max-w-3xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Toggle
              checked={roastMode}
              onCheckedChange={setRoastMode}
              label="roast mode"
            />
            <span className="font-mono text-xs text-text-tertiary">
              {"// maximum sarcasm enabled"}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={isDisabled}
            onClick={() =>
              createRoast.mutate({
                code,
                language: resolvedLanguage ?? "javascript",
                roastMode,
              })
            }
          >
            {createRoast.isPending ? "$ roasting..." : "$ roast_my_code"}
          </Button>
        </div>

        {createRoast.isError && (
          <p className="font-mono text-xs text-accent-red">
            {getErrorMessage(createRoast.error)}
          </p>
        )}
      </div>
    </div>
  );
}

export { HomeEditor };
