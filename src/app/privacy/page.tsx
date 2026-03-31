import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — DevRoast",
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
              O DevRoast coleta dados de uso para melhorar o serviço. Isso
              inclui: páginas visitadas, país de origem, dispositivo, navegador
              e horário de acesso. Além disso, após a segunda requisição de
              análise, solicitamos através de um formulário os seguintes dados
              pessoais:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Nome e
                sobrenome
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Telefone de
                contato
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Nível de
                experiência profissional
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              2. Finalidade do tratamento
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Os dados fornecidos no formulário são utilizados para personalizar
              sua experiência, permitir comunicações diretas sobre suas análises
              e fins de segmentação interna. O processamento desses dados
              específicos baseia-se no seu consentimento (Art. 7º, I da LGPD),
              fornecido ao preencher o modal.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              3. Código submetido
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O código que você submete para análise é processado por
              inteligência artificial (OpenAI) e armazenado em nosso banco de
              dados para exibição no leaderboard público. Não submeta código que
              contenha informações sensíveis, credenciais ou dados pessoais, pois
              o conteúdo do código permanece público.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              4. Cookies e rastreamento
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O DevRoast prioriza ferramentas que operam em modo cookieless para
              analytics de produto. No entanto, utilizamos o armazenamento local
              do navegador para controlar o limite de requisições e a exibição
              do modal de cadastro.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              5. Ferramentas de terceiros
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Utilizamos as seguintes ferramentas para suporte e análise do
              serviço:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> PostHog:
                analytics de produto e gestão de propriedades do usuário.
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Microsoft
                Clarity: gravação de sessões e mapas de calor (dados mascarados).
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Sentry:
                monitoramento de erros e estabilidade.
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Langfuse:
                observabilidade das respostas da IA.
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              6. Base legal
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O tratamento de dados no DevRoast ocorre sob duas bases principais
              da LGPD:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Consentimento:
                para os dados de identificação fornecidos voluntariamente no
                formulário.
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Interesse
                legítimo: para a coleta de dados técnicos e monitoramento de
                erros necessários para a operação do serviço.
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              7. Seus direitos
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Você tem direito de solicitar o acesso, a correção ou a exclusão
              dos seus dados pessoais (nome, telefone e experiência) a qualquer
              momento. Como o código submetido é armazenado de forma pública e
              desvinculada de conta de usuário obrigatória, a remoção de códigos
              específicos deve ser solicitada através dos nossos canais de
              suporte.
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
