import Link from "next/link";
import { ComponentProps } from "react";

interface TermsAcceptanceProps extends ComponentProps<"div"> {
  accepted?: boolean;
}

/**
 * Componente de aceição de termos para uso no modal de cadastro
 * Exibe aviso de privacidade e links para termos e política de privacidade
 */
export function TermsAcceptance({
  accepted,
  className,
  ...props
}: TermsAcceptanceProps) {
  return (
    <div
      className={`space-y-3 rounded-lg border border-border-primary bg-bg-secondary p-4 text-sm ${className}`}
      {...props}
    >
      <p className="text-text-secondary leading-relaxed">
        Ao preencher este formulário, você declara que leu, compreendeu e
        concorda com:
      </p>

      <ul className="space-y-2 pl-4">
        <li className="flex gap-2 text-text-secondary">
          <span className="text-accent-green">•</span>
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-green hover:underline"
          >
            Termos de Uso
          </Link>
          <span>da plataforma</span>
        </li>
        <li className="flex gap-2 text-text-secondary">
          <span className="text-accent-green">•</span>
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-green hover:underline"
          >
            Política de Privacidade
          </Link>
          <span>e tratamento de dados pessoais</span>
        </li>
      </ul>

      <p className="text-xs text-text-secondary italic pt-2">
        O envio do formulário constitui aceitação expressa dos termos acima e
        consentimento para o tratamento de seus dados conforme descrito na
        política de privacidade.
      </p>

      {accepted && (
        <div className="mt-3 flex items-center gap-2 text-xs text-accent-green">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Você aceitou os termos</span>
        </div>
      )}
    </div>
  );
}
