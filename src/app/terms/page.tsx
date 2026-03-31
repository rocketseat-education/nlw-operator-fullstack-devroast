import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — DevRoast",
  description:
    "Conheça os termos de uso e política de utilização da plataforma DevRoast.",
};

export default function TermsPage() {
  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-10 md:px-20 py-10">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[32px] font-bold text-accent-green">
              {">"}
            </span>
            <h1 className="font-mono text-[28px] font-bold text-text-primary">
              termos
            </h1>
          </div>

          <p className="font-mono text-sm text-text-secondary">
            {"// política de utilização do devroast"}
          </p>
        </section>

        <hr className="border-border-primary" />

        <section className="flex flex-col gap-6">
          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              1. Aceitação dos termos
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Ao acessar e utilizar o DevRoast, você concorda com estes termos
              de uso. O serviço consiste em uma ferramenta de análise de código
              baseada em inteligência artificial e gamificação através de um
              leaderboard público.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              2. Limitações de uso
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O DevRoast oferece um modelo de acesso híbrido:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Acesso
                anônimo: você pode realizar análises sem se registrar
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> O código
                enviado é exibido públicamente no leaderboard
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              3. Responsabilidade sobre o código submetido
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Ao submeter código para análise, você declara que:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Possui direitos
                necessários para o envio
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> O código não
                contém dados sensíveis, credenciais ou informações de terceiros
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Compreende que
                será processado por APIs externas (OpenAI) e exibido publicamente
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              4. Publicidade do conteúdo
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              O DevRoast tem como objetivo a transparência e o aprendizado
              coletivo. Os resultados das análises e trechos de código são
              exibidos publicamente para contribuir com a comunidade.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              5. Propriedade intelectual
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              A estrutura, design e algoritmos do DevRoast são propriedade
              exclusiva. Você mantém propriedade do código enviado, mas concede
              uma licença mundial não exclusiva para armazenar e exibir na
              plataforma.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              6. Isenção de responsabilidade
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              As análises geradas pela IA são informativas e educativas. O
              DevRoast não se responsabiliza por:
            </p>
            <ul className="flex flex-col gap-2 pl-4">
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Erros ou bugs
                nas sugestões da IA
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Decisões
                técnicas baseadas nas avaliações
              </li>
              <li className="font-mono text-sm text-text-secondary">
                <span className="text-accent-green">{">"}</span> Exposição de
                dados sensíveis submetidos inadvertidamente
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="font-mono text-base font-bold text-text-primary">
              7. Alterações e encerramento
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              Reservamo-nos o direito de alterar estes termos ou suspender o
              serviço a qualquer momento. O uso continuado constitui aceitação
              dos novos termos.
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
