import { NextResponse } from "next/server";

const openAiApiKey = process.env.OPENAI_API_KEY;

const insightSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    fitness_score: { type: "number" },
    status_label: { type: "string" },
    daily_insight: { type: "string" },
    nutrition_feedback: { type: "string" },
    exercise_feedback: { type: "string" },
    motivation: { type: "string" },
    top_actions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "fitness_score",
    "status_label",
    "daily_insight",
    "nutrition_feedback",
    "exercise_feedback",
    "motivation",
    "top_actions",
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
    const body = (await request.json()) as Record<string, unknown>;

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
                  "You are a motivating fitness coach. Review the user's dashboard metrics, food quality, calorie adherence, and exercise performance. Return only structured JSON with a fitness score out of 100, a short daily insight, targeted nutrition feedback, exercise feedback, motivating guidance, and top actions.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(body),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "dashboard_insights",
            strict: true,
            schema: insightSchema,
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
            : "Unable to generate dashboard insights.",
      },
      { status: 500 },
    );
  }
}
