import { ImageResponse } from "@takumi-rs/image-response";
import { TRPCError } from "@trpc/server";
import { RoastOgImage } from "@/components/og/roast-og-image";
import { caller } from "@/trpc/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const roast = await caller.roast.getById({ id });

    return new ImageResponse(
      <RoastOgImage
        score={roast.score}
        verdict={roast.verdict}
        language={roast.language}
        lineCount={roast.lineCount}
        roastQuote={roast.roastQuote}
      />,
      {
        width: 1200,
        height: 630,
        format: "png",
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      },
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return new Response("Roast not found", { status: 404 });
    }
    throw error;
  }
}
