function getScoreColor(score: number): string {
  if (score <= 3) return "#EF4444";
  if (score <= 6) return "#F59E0B";
  return "#10B981";
}

type RoastOgImageProps = {
  score: number;
  verdict: string;
  language: string;
  lineCount: number;
  roastQuote: string | null;
};

export function RoastOgImage({
  score,
  verdict,
  language,
  lineCount,
  roastQuote,
}: RoastOgImageProps) {
  const scoreColor = getScoreColor(score);

  return (
    <div
      tw="flex flex-col items-center justify-center w-full h-full"
      style={{
        backgroundColor: "#0C0C0C",
        padding: 64,
        gap: 28,
        fontFamily: "Geist Mono",
      }}
    >
      {/* Logo row */}
      <div tw="flex items-center" style={{ gap: 8 }}>
        <span tw="text-2xl font-bold" style={{ color: "#10B981" }}>
          {">"}
        </span>
        <span tw="text-xl font-medium" style={{ color: "#E5E5E5" }}>
          devroast
        </span>
      </div>

      {/* Score row */}
      <div tw="flex items-end" style={{ gap: 4 }}>
        <span
          tw="font-black"
          style={{
            fontSize: 160,
            lineHeight: 1,
            color: scoreColor,
          }}
        >
          {score.toString()}
        </span>
        <span
          style={{
            fontSize: 56,
            lineHeight: 1,
            color: "#4B5563",
          }}
        >
          /10
        </span>
      </div>

      {/* Verdict row */}
      <div tw="flex items-center" style={{ gap: 8 }}>
        <div
          tw="rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: scoreColor,
          }}
        />
        <span tw="text-xl" style={{ color: scoreColor }}>
          {verdict}
        </span>
      </div>

      {/* Lang info */}
      <span
        style={{
          fontSize: 16,
          color: "#4B5563",
          fontFamily: "Geist Mono",
        }}
      >
        lang: {language} · {lineCount} lines
      </span>

      {/* Roast quote */}
      {roastQuote ? (
        <span
          tw="text-center"
          style={{
            fontSize: 22,
            lineHeight: 1.5,
            color: "#E5E5E5",
            fontFamily: "Geist",
            maxWidth: "100%",
          }}
        >
          {"\u201C"}
          {roastQuote}
          {"\u201D"}
        </span>
      ) : null}
    </div>
  );
}
