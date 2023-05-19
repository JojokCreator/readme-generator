import { NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

// // Make sure to add OPENAI_API_KEY as a secret

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});

export const config = {
  runtime: "edge", // this is a pre-requisite
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async (request: NextRequest) => {
  const req = await request.json();
  let badges = "";
  if (req.badges === true) {
    badges = `
    [![GitHub release](https://img.shields.io/github/package-json/v/${req.URL}.svg)](https://github.com/${req.URL})
    [![GitHub last commit](https://img.shields.io/github/last-commit/${req.URL}.svg)](https://github.com/${req.URL}/commits/master)
    [![GitHub issues](https://img.shields.io/github/issues/${req.URL}.svg)](https://github.com/${req.URL}/issues)
    [![GitHub pull requests](https://img.shields.io/github/issues-pr/${req.URL}.svg)](https://github.com/${req.URL}/pulls)
    [![Dependencies](https://img.shields.io/librariesio/github/${req.URL}.svg)](https://github.com/${req.URL}/Dependencies  )`;
  }

  const prompt = `
  Please create a comprehensive README file for the project styled in markdown with the following details:
  Title: ${req.projectName}
  Description: ${req.description}
  What the project can be used for
  Possible additions in the future
  Explanation of the npm packages used (${req.npmpackages}): Please list the packages in a bullet-pointed list without including any @types, version numbers, or eslint, and provide a brief explanation of what they do.
  Installation: Please include instructions on how to install the project using the ${req.installation} command.
  Usage: Please include instructions on how to run the project using the ${req.usage} command.
  Contributors: Please list the contributors as a bullet-pointed list. ${req.contributors}
  License: Please include the license as ${req.license}, unless it is none.
  Badges:
  
  `;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      model: "text-davinci-003",
    }),
  });

  const data = await response.json();

  return NextResponse.json(data.choices[0].text?.trim() + badges);
};
