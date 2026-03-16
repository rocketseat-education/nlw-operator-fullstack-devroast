import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de Privacidade — DevRoast",
  description:
    "Saiba como o DevRoast coleta e utiliza dados de forma anonimizada.",
};

export default function PrivacidadePage() {
  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-10 md:px-20 py-10">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[32px] font-bold text-accent-green">
              {">"}
            </span>
            <h1 className="font-mono text-[28px] font-bold text-text-primary">
              privacidade
            </h1>
          </div>

          <p className="font-mono text-sm text-text-secondary">
            {"// como tratamos seus dados"}
          </p>
        </section>

        <hr className="border-border-primary" />

        <section className="flex flex-col gap-6">
          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              1. Dados coletados
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O DevRoast coleta dados anonimizados de uso para melhorar o
              servico. Isso inclui: paginas visitadas, pais de origem,
              dispositivo, navegador e horario de acesso. Nenhuma informacao
              pessoal identificavel (como nome, email ou endereco IP completo) e
              armazenada.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              2. Codigo submetido
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O codigo que voce submete para analise e processado por
              inteligencia artificial (OpenAI) e armazenado em nosso banco de
              dados para exibicao no leaderboard publico. Nao submeta codigo que
              contenha informacoes sensiveis, credenciais ou dados pessoais.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              3. Cookies
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O DevRoast nao utiliza cookies de rastreamento. Todas as
              ferramentas de analytics operam em modo cookieless, sem
              rastreamento entre sessoes.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              4. Ferramentas de analytics
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Utilizamos as seguintes ferramentas para entender como o servico e
              utilizado:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> PostHog —
                analytics de produto (modo cookieless)
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Microsoft
                Clarity — gravacao de sessoes e mapas de calor (dados
                anonimizados)
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Sentry —
                monitoramento de erros para estabilidade do servico
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Langfuse —
                observabilidade das respostas da IA (dados internos, sem
                informacoes do usuario)
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              5. Base legal
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              A coleta de dados anonimizados de uso e o monitoramento de erros
              sao realizados com base no interesse legitimo (Art. 10 da LGPD),
              sendo necessarios para manter e melhorar o servico.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              6. Seus direitos
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Como os dados coletados sao anonimizados e nao identificaveis, nao
              e possivel associa-los a um usuario especifico. O codigo submetido
              e armazenado sem vinculacao a identidade do autor. Se voce tiver
              duvidas ou preocupacoes, entre em contato conosco.
            </p>
          </article>
        </section>

        <hr className="border-border-primary" />

        <Link
          href="/"
          className="font-mono text-sm text-accent-green hover:underline"
        >
          {"$ cd ~"}
        </Link>
      </div>
    </main>
  );
}
