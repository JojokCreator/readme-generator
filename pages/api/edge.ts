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
  const openai = new OpenAIApi(configuration);

  const req = await request.json();

  const url = req.URL.split("/").slice(-2).join("/");

  const prompt = `
  Please create a comprehensive README file for the project with the following details:
  Title: ${req.projectName}
  Description: ${req.description}
  What the project can be used for
  Possible additions in the future
  Explanation of the npm packages used (${req.npmpackages}): Please list the packages in a bullet-pointed list without including any @types, version numbers, or eslint, and provide a brief explanation of what they do.
  Installation: Please include instructions on how to install the project using the ${req.installation} command.
  Usage: Please include instructions on how to run the project using the ${req.usage} command.
  Contributors: Please list the contributors as a bullet-pointed list.
  License: Please include the license, unless it is none.

  Please also add the following badges to the README:
  Build status: [![Build Status](https://img.shields.io/travis/${url}.svg)](https://travis-ci.org/${url})
  Code coverage: [![Coverage Status](https://img.shields.io/codecov/c/github/${url}.svg)](https://codecov.io/gh/${url})
  Version: [![GitHub release](https://img.shields.io/github/release/${url}.svg)](https://github.com/${url}/releases)
  License: [![License](https://img.shields.io/badge/license-{license}-brightgreen.svg)]({link to license})
  Downloads: [![Downloads](https://img.shields.io/npm/dt/{npm package name}.svg)](https://www.npmjs.com/package/{npm package name})
  Last commit: [![GitHub last commit](https://img.shields.io/github/last-commit/${url}.svg)](https://github.com/${url}/commits/master)
  Issues: [![GitHub issues](https://img.shields.io/github/issues/${url}.svg)](https://github.com/${url}/issues)
  Pull requests: [![GitHub pull requests](https://img.shields.io/github/issues-pr/${url}.svg)](https://github.com/${url}/pulls)
  Dependencies: [![Dependencies](https://img.shields.io/david/${url}.svg)](https://david-dm.org/${url})`;

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
  console.log(data);
  return NextResponse.json(data.choices[0].text?.trim());
};
