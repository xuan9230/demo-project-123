import { createHash } from "crypto";
import { env } from "../config/env";

export interface LuxuryVehicleInput {
  id: string;
  year: number;
  make: string;
  model: string;
  variant?: string | null;
  mileage: number;
  price: number;
  region: string;
}

// Terms that must not appear in AI-generated promotional copy
const BANNED_TERMS = [
  "service history",
  "accident",
  "warranty",
  "ownership",
  "one owner",
  "single owner",
  "mechanical",
  "financing",
  "finance",
  "guarantee",
  "certified",
];

const sanitize = (value: string, maxLength: number): string =>
  value.trim().slice(0, maxLength);

export const buildPrompt = (input: LuxuryVehicleInput): string => {
  const make = sanitize(input.make, 50);
  const model = sanitize(input.model, 50);
  const variant = input.variant ? ` ${sanitize(input.variant, 50)}` : "";
  const region = sanitize(input.region, 50);

  return `Write a 1-2 sentence promotional description for a luxury used car listing. Be professional and premium in tone. Do not use emojis. Do not mention service history, accidents, warranty, ownership count, mechanical condition, financing, or legal guarantees. Keep it between 20 and 45 words.

Vehicle details:
- Year: ${input.year}
- Make: ${make}
- Model: ${model}${variant ? `\n- Variant: ${variant}` : ""}
- Mileage: ${input.mileage.toLocaleString()} km
- Price: NZD $${input.price.toLocaleString()}
- Region: ${region}

Respond with only the promotional description text, nothing else.`;
};

export const buildFallback = (input: LuxuryVehicleInput): string => {
  const variant = input.variant ? ` ${input.variant}` : "";
  return `Discover premium driving in this ${input.year} ${input.make} ${input.model}${variant}, combining strong value at $${input.price.toLocaleString()} with ${input.mileage.toLocaleString()} km in ${input.region}.`;
};

export const validateOutput = (text: string): boolean => {
  const words = text.trim().split(/\s+/);
  if (words.length < 20 || words.length > 45) {
    return false;
  }
  const lower = text.toLowerCase();
  for (const term of BANNED_TERMS) {
    if (lower.includes(term)) {
      return false;
    }
  }
  return true;
};

export const computeInputHash = (input: LuxuryVehicleInput): string =>
  createHash("sha256")
    .update(
      JSON.stringify({
        year: input.year,
        make: input.make,
        model: input.model,
        variant: input.variant ?? null,
        mileage: input.mileage,
        price: input.price,
        region: input.region,
      })
    )
    .digest("hex");

export const generatePromoWithAI = async (
  input: LuxuryVehicleInput
): Promise<string | null> => {
  if (!env.openaiApiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: env.openaiModel,
        messages: [{ role: "user", content: buildPrompt(input) }],
        max_tokens: 100,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim() ?? null;
    if (!text || !validateOutput(text)) {
      return null;
    }

    return text;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
};
