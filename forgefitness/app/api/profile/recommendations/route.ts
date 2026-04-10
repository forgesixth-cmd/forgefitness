import { NextResponse } from "next/server";

const openAiApiKey = process.env.OPENAI_API_KEY;

const recommendationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    daily_calories: { type: "number" },
    protein_grams: { type: "number" },
    carbs_grams: { type: "number" },
    fats_grams: { type: "number" },
    daily_calories_to_burn: { type: "number" },
  },
  required: [
    "summary",
    "daily_calories",
    "protein_grams",
    "carbs_grams",
    "fats_grams",
    "daily_calories_to_burn",
  ],
} as const;

function extractJsonPayload(result: {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
      parsed?: unknown;
    }>;
  }>;
}) {
  const parsedCandidate = result.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.parsed)?.parsed;

  if (parsedCandidate && typeof parsedCandidate === "object") {
    return parsedCandidate;
  }

  const outputTextCandidate =
    result.output_text ||
    result.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === "output_text" && content.text)?.text ||
    result.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => typeof content.text === "string")?.text;

  if (!outputTextCandidate) {
    throw new Error("OpenAI did not return structured output.");
  }

  return JSON.parse(outputTextCandidate);
}

export async function POST(request: Request) {
  if (!openAiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing on the server." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      currentWeightKg?: number;
      targetWeightKg?: number;
      heightCm?: number;
      targetDays?: number;
      experienceLevel?: string;
    };

    if (
      !body.currentWeightKg ||
      !body.targetWeightKg ||
      !body.heightCm ||
      !body.targetDays
    ) {
      return NextResponse.json(
        { error: "currentWeightKg, targetWeightKg, heightCm, and targetDays are required." },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are a fitness nutrition coach. Recommend a sensible daily calorie target, daily calories to burn with exercise, and macro split for healthy weight loss. Be realistic and safe. Return only structured JSON.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Current weight: ${body.currentWeightKg} kg\nTarget weight: ${body.targetWeightKg} kg\nHeight: ${body.heightCm} cm\nTarget timeline: ${body.targetDays} days\nExperience level: ${body.experienceLevel ?? "Not specified"}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "profile_recommendations",
            strict: true,
            schema: recommendationSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI request failed: ${errorText}` },
        { status: 500 },
      );
    }

    const result = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          type?: string;
          text?: string;
          parsed?: unknown;
        }>;
      }>;
    };

    return NextResponse.json(extractJsonPayload(result));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate recommendations.",
      },
      { status: 500 },
    );
  }
}
