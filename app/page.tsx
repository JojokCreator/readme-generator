"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { LoadingPage } from "./components/loading";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import copy from "copy-to-clipboard";

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

type GitData = {
  url: string;
};

const ReadmeForm = () => {
  const [readmeData, setReadmeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const { register: registerGit, handleSubmit: handleGitSubmit } =
    useForm<GitData>();

  const onSubmitGit = (data: GitData) => {
    async function fetchPackageJson() {
      const repoName = data.url.split("/").slice(-2).join("/");
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoName}/contents/package.json`,
          {
            method: "Get",
            headers: {
              Accept: "application/vnd.github+json",
            },
          }
        );
        const data = await response.json();
        const parsedData = JSON.parse(
          Buffer.from(data.content, "base64").toString("utf-8")
        );
        console.log(
          JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"))
        );
        setValue("projectName", JSON.stringify(parsedData.name));
        setValue("npmpackages", JSON.stringify(parsedData.dependencies));
        setValue("contributors", JSON.stringify(repoName.split("/")[0]));
      } catch (error) {
        console.error(error);
      }
    }

    fetchPackageJson();
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    // e.preventDefault();

    // Send chat history to API
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const readme = await response.json();
    setIsLoading(false);
    setReadmeData(readme);
  };

  const onClick = (readme: string) => {
    copy(readme, {
      debug: true,
      message: "Press #{key} to copy",
    });
    toast("Copied to clipboard", {
      icon: "👏",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  return (
    <>
      <Toaster position="bottom-center" />
      <header className="bg-stone-600 text-amber-300 py-4 border-b border-amber-300 p-2 flex justify-center mb-2">
        <span className="text-2xl text-amber-300 p-4">
          <b className="text-4xl">Readme Gen 📖</b> create a simple markdown
          Readme file for your project
        </span>
      </header>
      <div className="p-4 grid grid-cols md:grid-cols-2">
        <div className="col-span-1 mb-4">
          <div className="max-w-lg mx-auto bg-stone-600 p-4 shadow-md rounded-md">
            <input
              id="github-url"
              type="text"
              className="mb-2 form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
              placeholder="Git Hub Url"
              {...registerGit("url", { required: true })}
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
              onClick={handleGitSubmit(onSubmitGit)}
            >
              Fill Fields
            </button>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-lg mx-auto bg-stone-600 p-4 shadow-md rounded-md"
          >
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
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
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
                className="h-60 form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
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
                className="h-40 form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
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
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
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
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
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
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
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
                className="form-select w-full rounded-md border-gray-300 shadow-sm bg-stone-800 h-14 text-amber-100"
                {...register("license", { required: true })}
              >
                <option value="">-- Select a license --</option>
                <option value="Apache License v2.0">Apache License v2.0</option>
                <option value="GNU General Public License v3.0">
                  GNU General Public License v3.0
                </option>
                <option value="MIT License">MIT License</option>
                <option value="None">None</option>
              </select>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
              >
                Generate README
              </button>
            </div>
          </form>
        </div>
        {readmeData && !isLoading && (
          <>
            <div className="col-span-1">
              <div className="mb-4">
                <label
                  htmlFor="readme"
                  className="block font-medium mb-2 text-amber-300"
                >
                  Generated Markdown
                </label>
                <textarea
                  id="readme"
                  className="ml-2 p-2 h-80 w-full rounded-md border-gray-300 shadow-sm bg-stone-600 text-slate-300"
                  value={readmeData}
                  disabled
                />
              </div>
              <h1 className="font-medium mb-2 text-amber-300">Preview</h1>
              <div className="prose bg-stone-300 ml-2 p-2">
                <ReactMarkdown>{readmeData}</ReactMarkdown>
              </div>
              <div
                className="
             text-xl text-white fixed right-10 bottom-10 p-4 hover:cursor-pointer hover:opacity-50"
              >
                <div
                  onClick={() => onClick(readmeData)}
                  className="flex flex-col items-center border-white border rounded-full p-4"
                >
                  Copy
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
        {isLoading && <LoadingPage />}
      </div>
      <footer className="flex justify-center">
        <p className="font-medium mb-2 text-amber-300">
          Powered by{" "}
          <a href="https://openai.com/" target="_blank">
            OpenAI
          </a>
          . Built by{" "}
          <a href="https://jklakus.live" target="_blank">
            JojokCreator ©
          </a>
          .
        </p>
      </footer>
    </>
  );
};

export default ReadmeForm;
