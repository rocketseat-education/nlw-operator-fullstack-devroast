"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeEditor, MAX_CHARACTERS } from "@/components/code-editor";
import { UserProfileModal } from "@/components/user-profile-modal";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { useUserTracking } from "@/hooks/use-user-tracking";
import { useTRPC } from "@/trpc/client";

function HomeEditor() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);
  const [manualLanguage, setManualLanguage] = useState<string | null>(null);
  const { detectedLanguage } = useLanguageDetection(code);
  const {
    sessionId,
    isModalOpen,
    setIsModalOpen,
    trackRoastRequest,
    handleCancelModal,
  } = useUserTracking();
  const [lastRoastId, setLastRoastId] = useState<string | null>(null);

  const resolvedLanguage = manualLanguage ?? detectedLanguage;

  const router = useRouter();
  const trpc = useTRPC();
  const createRoast = useMutation(
    trpc.roast.create.mutationOptions({
      onSuccess: async (data) => {
        await trackRoastRequest();
        setLastRoastId(data.id);
      },
    }),
  );

  // Redireciona para a página do roast após modal ser fechado
  useEffect(() => {
    if (lastRoastId && !isModalOpen) {
      router.push(`/roast/${lastRoastId}`);
    }
  }, [lastRoastId, isModalOpen, router]);

  // Cancela modal e reseta roast ID (decrementa contador)
  const handleCancel = async () => {
    await handleCancelModal();
    setLastRoastId(null);
  };

  // Fecha modal após submissão bem-sucedida (sem decrementar)
  const handleSubmitSuccess = () => {
    setIsModalOpen(false);
    // Não reseta lastRoastId para deixar o useEffect redirecionar
  };

  const isDisabled =
    code.trim().length === 0 ||
    code.length > MAX_CHARACTERS ||
    createRoast.isPending;

  return (
    <>
      <div className="flex flex-col items-center gap-8 w-full">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={resolvedLanguage}
          onLanguageChange={setManualLanguage}
          className="w-full max-w-3xl"
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-between w-full max-w-3xl">
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
      </div>

      <UserProfileModal
        sessionId={sessionId}
        isOpen={isModalOpen}
        onClose={handleCancel}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
}

export { HomeEditor };
