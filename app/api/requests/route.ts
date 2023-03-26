// Make sure to add OPENAI_API_KEY as a secret

import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  const req = await request.json();
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: req,
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  return NextResponse.json(completion.data.choices[0].text);
}
