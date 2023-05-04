// Make sure to add OPENAI_API_KEY as a secret

import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  const req = await request.json();

  const prompt = `make me a comprehensive readme file with the title ${req.projectName}, long description based on ${req.description}
  that includes description, what the project can be used for and possible additions in the future 
  and explain why i used these npm packages ${req.npmpackages} when listing the packages in a list don't include any 
  @types or any version numbers or eslint and give a brief explaination of what they do. include how to install the project 
  using ${req.installation} command. How to run it using the ${req.usage} command. Also include 
  the ${req.contributors} as a list and the ${req.license} unless it is none don't include it`;

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  return NextResponse.json(completion.data.choices[0].text?.trim());
}
