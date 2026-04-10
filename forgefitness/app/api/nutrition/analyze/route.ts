import { NextResponse } from "next/server";

const openAiApiKey = process.env.OPENAI_API_KEY;

const mealAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          quantity: { type: "string" },
          calories: { type: "number" },
          protein_grams: { type: "number" },
          carbs_grams: { type: "number" },
          fats_grams: { type: "number" },
        },
        required: [
          "name",
          "quantity",
          "calories",
          "protein_grams",
          "carbs_grams",
          "fats_grams",
        ],
      },
    },
    totals: {
      type: "object",
      additionalProperties: false,
      properties: {
        calories: { type: "number" },
        protein_grams: { type: "number" },
        carbs_grams: { type: "number" },
        fats_grams: { type: "number" },
      },
      required: ["calories", "protein_grams", "carbs_grams", "fats_grams"],
    },
  },
  required: ["summary", "items", "totals"],
} as const;

export async function POST(request: Request) {
  if (!openAiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing on the server." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      mealDescription?: string;
      mealType?: string;
    };

    const mealDescription = body.mealDescription?.trim();
    const mealType = body.mealType?.trim();

    if (!mealDescription || !mealType) {
      return NextResponse.json(
        { error: "mealDescription and mealType are required." },
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
                  "You are a nutrition analyst. Estimate macros conservatively and return only structured JSON. Infer reasonable Indian meal portions when quantities are informal. Round values to one decimal place.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Meal type: ${mealType}\nMeal description: ${mealDescription}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meal_analysis",
            strict: true,
            schema: mealAnalysisSchema,
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
          refusal?: string;
        }>;
      }>;
    };

    const outputTextCandidate =
      result.output_text ||
      result.output
        ?.flatMap((item) => item.content ?? [])
        .find((content) => content.type === "output_text" && content.text)
        ?.text ||
      result.output
        ?.flatMap((item) => item.content ?? [])
        .find((content) => typeof content.text === "string")
        ?.text;

    const parsedCandidate = result.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.parsed)?.parsed;

    if (parsedCandidate && typeof parsedCandidate === "object") {
      return NextResponse.json(parsedCandidate);
    }

    if (outputTextCandidate) {
      return NextResponse.json(JSON.parse(outputTextCandidate));
    }

    const refusal = result.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.refusal)?.refusal;

    return NextResponse.json(
      {
        error: refusal
          ? `OpenAI refused the request: ${refusal}`
          : "OpenAI did not return structured output.",
        debug: JSON.stringify(result).slice(0, 1200),
      },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to analyze meal.",
      },
      { status: 500 },
    );
  }
}
