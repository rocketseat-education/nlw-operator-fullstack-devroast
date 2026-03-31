"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import "react-phone-number-input/style.css";

const formSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),
  programmingLevel: z.enum([
    "Iniciante",
    "Atuo na área há menos de 2 anos",
    "Atuo na área há mais de 2 anos",
  ]),
});

type FormData = z.infer<typeof formSchema>;

interface UserProfileModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function UserProfileModal({
  sessionId,
  isOpen,
  onClose,
  onSubmitSuccess,
}: UserProfileModalProps) {
  const trpc = useTRPC();
  const submitProfile = useMutation(
    trpc.roast.submitUserProfile.mutationOptions(),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      programmingLevel: "Iniciante",
    },
  });

  const phone = watch("phone");

  const onSubmit = async (data: FormData) => {
    try {
      await submitProfile.mutateAsync({
        sessionId,
        ...data,
      });

      reset();
      onSubmitSuccess();
    } catch (err) {
      // Erro é tratado pelo react-query
      console.error("Error submitting profile:", err);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2 bg-bg-input text-text-primary border rounded text-sm focus:outline-none focus:ring-1 transition-all";
  const inputValidClass = "border-border-primary focus:ring-accent-green";
  const inputErrorClass = "border-red-500 focus:ring-red-500";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated rounded-lg max-w-md w-full shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Calma, é de graça sim!
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Mas antes de qualquer coisa:
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nome */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Nome"
                  {...register("firstName")}
                  className={`${inputClass} ${errors.firstName ? inputErrorClass : inputValidClass}`}
                />
                {errors.firstName && (
                  <span className="text-red-400 text-xs mt-1">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              {/* Sobrenome */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Sobrenome"
                  {...register("lastName")}
                  className={`${inputClass} ${errors.lastName ? inputErrorClass : inputValidClass}`}
                />
                {errors.lastName && (
                  <span className="text-red-400 text-xs mt-1">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`${inputClass} ${errors.email ? inputErrorClass : inputValidClass}`}
              />
              {errors.email && (
                <span className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Telefone com react-phone-number-input */}
            <div className="flex flex-col">
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="BR"
                value={phone}
                onChange={(value) => setValue("phone", value || "")}
                placeholder="Telefone"
                className={`!bg-bg-input !text-text-primary !border-border-primary !rounded !text-sm !py-2 !px-3 ${errors.phone ? "!border-red-500" : ""}`}
              />
              {errors.phone && (
                <span className="text-red-400 text-xs mt-1">
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* Programming Level */}
            <div className="flex flex-col">
              <select
                {...register("programmingLevel")}
                className={`${inputClass} ${errors.programmingLevel ? inputErrorClass : inputValidClass}`}
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Atuo na área há menos de 2 anos">
                  Atuo na área há menos de 2 anos
                </option>
                <option value="Atuo na área há mais de 2 anos">
                  Atuo na área há mais de 2 anos
                </option>
              </select>
              {errors.programmingLevel && (
                <span className="text-red-400 text-xs mt-1">
                  {errors.programmingLevel.message}
                </span>
              )}
            </div>

            {/* Erro de submit */}
            {submitProfile.isError && (
              <div className="px-3 py-2 bg-red-500/10 text-red-400 text-sm rounded">
                {submitProfile.error instanceof Error
                  ? submitProfile.error.message
                  : "Erro ao enviar dados"}
              </div>
            )}

            {/* Disclaimer de termos e privacidade */}
            <p className="text-xs text-text-secondary leading-relaxed text-center">
              Ao continuar, você concorda com nossos{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-green hover:underline"
              >
                Termos de Uso
              </Link>
              {" "}e{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-green hover:underline"
              >
                Política de Privacidade
              </Link>
            </p>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitProfile.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary border border-border-primary rounded enabled:hover:bg-bg-input enabled:active:bg-bg-input disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitProfile.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-primary bg-accent-green rounded enabled:hover:opacity-90 enabled:active:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {submitProfile.isPending ? "Enviando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
