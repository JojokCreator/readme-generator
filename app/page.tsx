"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { LoadingPage } from "./components/loading";

type FormData = {
  projectName: string;
  description: string;
  npmpackages: string;
  installation: string;
  usage: string;
  contributors: string;
  license: string;
  badges: boolean;
};

const ReadmeForm = () => {
  const [readmeData, setReadmeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    // e.preventDefault();
    const body = `make me a readme file with the title ${data.projectName}, long description based on ${data.description} and explain why i used 
    these npm packages ${data.npmpackages} when listing the packages in a list don't include any types.
    include how to install the project using ${data.installation} command. How to run it using the ${data.usage} command. Also include 
    the ${data.contributors} and the ${data.license}`;

    // Send chat history to API
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const readme = await response.json();
    setIsLoading(false);
    setReadmeData(readme);
  };

  return (
    <>
      <header className="border-b border-amber-300 p-2 flex justify-center mb-2">
        <span className="text-2xl text-amber-300">
          <b className="text-4xl">Readme Gen</b> provides a simple and easy way
          to create a professional MD Readme file
        </span>
      </header>
      <div className="p-4 grid grid-cols md:grid-cols-2">
        <div className="col-span-1 mb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto">
            <div className="mb-4">
              <label
                htmlFor="project-name"
                className="block font-medium mb-2 text-amber-300"
              >
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-600"
                {...register("projectName", { required: true })}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block font-medium mb-2 text-amber-300"
              >
                Description
              </label>
              <textarea
                id="description"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm h-40 bg-stone-600"
                {...register("description", { required: true })}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="Package JSON"
                className="block font-medium mb-2 text-amber-300"
              >
                NPM Packages
              </label>
              <textarea
                id="npmpackages"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm h-40 bg-stone-600"
                {...register("npmpackages", { required: true })}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="installation"
                className="block font-medium mb-2 text-amber-300"
              >
                Installation
              </label>
              <input
                id="installation"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-600"
                {...register("installation", { required: true })}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="usage"
                className="block font-medium mb-2 text-amber-300"
              >
                Usage
              </label>
              <input
                id="usage"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-600"
                {...register("usage", { required: true })}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="contributors"
                className="block font-medium mb-2 text-amber-300"
              >
                Contributors
              </label>
              <textarea
                id="contributors"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-600"
                {...register("contributors", { required: true })}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="license"
                className="block font-medium mb-2 text-amber-300"
              >
                License
              </label>
              <select
                id="license"
                className="form-select w-full rounded-md border-gray-300 shadow-sm bg-stone-600 h-14"
                {...register("license", { required: true })}
              >
                <option value="">-- Select a license --</option>
                <option value="Apache License v2.0">Apache License v2.0</option>
                <option value="GNU General Public License v3.0">
                  GNU General Public License v3.0
                </option>
                <option value="MIT License">MIT License</option>
              </select>
            </div>

            {/* <div className="mb-4">
              <label
                htmlFor="badges"
                className="block font-medium mb-2 text-amber-300"
              >
                Badges
              </label>
              <label className="inline-flex items-center">
                <input
                  id="badges"
                  type="checkbox"
                  className="form-checkbox"
                  {...register("badges")}
                />
                <span className="ml-2 text-amber-300">
                  Include badges/shields in README
                </span>
              </label>
            </div> */}
            <div className="flex justify-center">
              <button
                type="submit"
                className=" bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
              >
                Generate README
              </button>
            </div>
          </form>
        </div>
        {readmeData && (
          <div className="col-span-1">
            <div className="mb-4">
              <label
                htmlFor="readme"
                className="block font-medium mb-2 text-amber-300"
              >
                Readme
              </label>
              <textarea
                id="readme"
                className="ml-2 p-2 h-80 w-full rounded-md border-gray-300 shadow-sm bg-stone-600"
                value={readmeData}
              />
            </div>
            <div className="prose bg-stone-100 ml-2 p-2 w-full">
              <ReactMarkdown>{readmeData}</ReactMarkdown>
            </div>
          </div>
        )}
        {isLoading && <LoadingPage />}
      </div>
    </>
  );
};

export default ReadmeForm;
