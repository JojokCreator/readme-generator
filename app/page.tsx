"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { LoadingPage } from "./components/loading";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import copy from "copy-to-clipboard";
import { signIn, signOut } from "next-auth/react";
import { GitHubIcon } from "@/components/GitHubIcon";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

type FormData = {
  projectName: string;
  description: string;
  npmpackages: string;
  installation: string;
  usage: string;
  contributors: string;
  license: string;
  badges: boolean;
  URL: string;
};

type GitData = {
  url: string;
};

const ReadmeForm = () => {
  const session = useSession().data as Session & { access_token?: string };
  const [fetchError, setFetchError] = useState(false);
  const [readmeData, setReadmeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentRepo, setCurrentRepo] = useState("");
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const { register: registerGit, handleSubmit: handleGitSubmit } =
    useForm<GitData>();
  const [scrollPosition, setScrollPosition] = useState(0);

  const onSubmitGit = (data: GitData) => {
    async function fetchPackageJson() {
      setFetchError(false);
      const repoName = data.url.split("/").slice(-2).join("/");
      setCurrentRepo(repoName);
      let auth = "";

      try {
        if (session != null) {
          auth = `Bearer ${session.access_token}`;
        }

        const response = await fetch(
          `https://api.github.com/repos/${repoName}/contents/package.json`,
          {
            method: "GET",
            headers: {
              Accept: "application/vnd.github.v3+json",
              Authorization: auth,
            },
          }
        );

        if (!response.ok) {
          setFetchError(true);
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const { content } = data;
        const parsedContent = JSON.parse(
          Buffer.from(content, "base64").toString("utf-8")
        );
        const { name, dependencies } = parsedContent;
        const [contributor] = repoName.split("/");
        const projectName = JSON.stringify(name);
        const npmpackages = JSON.stringify(dependencies);
        const contributors = JSON.stringify(contributor);
        setValue("URL", data.url);
        setValue("projectName", projectName);
        setValue("npmpackages", npmpackages);
        setValue("contributors", contributors);
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
    const response = await fetch("/api/edge", {
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
  const onCommit = (readme: string) => {
    async function createFile() {
      let auth = "";
      try {
        if (session != null) {
          auth = `Bearer ${session.access_token}`;
        }
        // Get the repository details using the API endpoint.
        const response = await fetch(
          `https://api.github.com/repos/${currentRepo}`,
          {
            headers: {
              Authorization: auth,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const sha = data.sha;

        // Create a new file in the repository using the API endpoint.
        const putResponse = await fetch(
          `https://api.github.com/repos/${currentRepo}/contents/AiReadme.md`,
          {
            method: "PUT",
            headers: {
              Authorization: auth,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Create new file via API",
              content: Buffer.from(readmeData).toString("base64"),
              sha: sha,
            }),
          }
        );

        if (putResponse.ok) {
          console.log("New file created successfully");
          toast("Commited to repo", {
            icon: "👏",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        } else {
          const errorData = await putResponse.json();
          console.log(errorData.message);
        }
      } catch (error) {
        console.log(error);
      }
    }

    createFile();
  };

  useEffect(() => {
    function handleScroll() {
      setScrollPosition(window.scrollY);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Toaster position="bottom-center" />
      <header className="bg-stone-600 text-amber-300 py-4 border-b border-amber-300 p-2 flex justify-center mb-2">
        <span className="text-2xl text-amber-300 p-4">
          <b className="text-4xl">Readme Gen 📖</b> create a simple markdown
          Readme file for your project
        </span>
        {session === null ? (
          <button
            className="mb-4 flex items-center rounded-md border border-gray-800 bg-black px-4 py-3 text-sm font-semibold text-neutral-200 transition-all hover:text-white"
            onClick={() => signIn("github")}
          >
            <GitHubIcon />
            <div className="ml-3">Sign in with GitHub</div>
          </button>
        ) : (
          <button
            className="mt-2 mb-6 text-sm text-white hover:text-[hsl(280,100%,70%)]"
            onClick={() => signOut()}
          >
            → Sign out
          </button>
        )}
      </header>
      <div className="p-4 grid grid-cols md:grid-cols-2">
        <div className="col-span-1 mb-4">
          <div className="max-w-lg mx-auto bg-stone-600 p-4 shadow-md rounded-md">
            <input
              id="github-url"
              type="text"
              className={`mb-2 form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100 ${
                fetchError ? "border-red-500" : ""
              }`}
              placeholder="Git Hub Url e.g https://github.com/{username}/{repo_name}"
              {...registerGit("url", { required: true })}
            />
            {fetchError && (
              <p className="text-red-500 text-sm mb-2">
                Failed to fetch github respository (If its private try logging
                in)
              </p>
            )}
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
                URL
              </label>
              <input
                id="url"
                type="text"
                className="form-input p-2 w-full rounded-md border-gray-300 shadow-sm bg-stone-800 text-amber-100"
                {...register("URL", { required: true })}
              />
            </div>
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
                className={`${
                  scrollPosition < 1200 ? "text-white" : "text-black"
                } text-xl fixed right-1 bottom-10 p-4 hover:cursor-pointer hover:opacity-50`}
              >
                <div
                  onClick={() => onClick(readmeData)}
                  className="flex flex-col items-center border-white border rounded-full p-3"
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
              {session === null ? (
                <div
                  className={`${
                    scrollPosition < 1200 ? "text-white" : "text-black"
                  } text-xl fixed right-20 bottom-10 p-4 hover:cursor-pointer hover:opacity-50`}
                >
                  <div
                    onClick={() => onCommit(readmeData)}
                    className="flex flex-col items-center border-white border rounded-full p-3"
                  >
                    Send
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  </div>
                </div>
              ) : null}
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
