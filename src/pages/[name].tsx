import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { Header } from "@/components/header";
import { SearchBox } from "@/components/search-box";
import { api } from "@/utils/api";
import {
  Box,
  ExternalLink,
  Flame,
  Github,
  Gitlab,
  Loader2,
} from "lucide-react";
import {
  formatCratesUrl,
  formatGithubUrl,
  formatGitlabUrl,
  formatUrl,
} from "@/utils/format-url";
import { useEffect } from "react";

const RewritePage: NextPage = () => {
  const { query } = useRouter();

  const { data: rewrite } = api.rewrites.getOne.useQuery(
    {
      name: query.name as string,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const readme = api.github.getReadme.useQuery(
    { url: rewrite?.github as string },
    {
      enabled: !!rewrite?.github,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: incrementViews } = api.rewrites.incrementViews.useMutation();

  useEffect(() => {
    if (rewrite?.name) {
      incrementViews({
        name: rewrite.name,
      });
    }
  }, [rewrite?.name, incrementViews]);

  return (
    <>
      <Head>
        <title>Rewrite it in Rust - {rewrite?.name}</title>
        <meta
          name="description"
          content={`${rewrite?.name || ""} - ${rewrite?.description || ""}`}
        />
      </Head>
      <Header>
        <SearchBox small />
      </Header>
      <main className="grid min-h-screen grid-rows-[min-content_1fr]">
        <section className="grid h-full grid-cols-[1fr_minmax(0,800px)_1fr] grid-rows-[min-content_1fr] bg-slate-700 px-6 text-slate-300 sm:px-12">
          <section className="col-start-2 flex flex-col gap-2 py-10">
            {!rewrite ? (
              <>
                <div className="h-8 w-28 animate-pulse rounded-sm bg-slate-500/80" />
                <div className="h-8 w-[36rem] max-w-full animate-pulse rounded-sm bg-slate-500/80" />
                <div className="h-6 w-96 animate-pulse rounded-sm bg-slate-400/80" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {rewrite.name}
                </h1>
                <h2 className="text-lg sm:text-xl">{rewrite.description}</h2>
                <div className="flex flex-wrap gap-4 text-slate-300/75">
                  {rewrite.url && (
                    <a
                      href={rewrite.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-slate-100 hover:underline"
                    >
                      <ExternalLink className="h-5 w-5" aria-label="URL" />
                      <span>{formatUrl(rewrite.url)}</span>
                    </a>
                  )}
                  {rewrite.github && (
                    <a
                      href={rewrite.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-slate-100 hover:underline"
                    >
                      <Github className="h-5 w-5" aria-label="GitHub" />
                      <span>{formatGithubUrl(rewrite.github)}</span>
                    </a>
                  )}
                  {rewrite.gitlab && (
                    <a
                      href={rewrite.gitlab}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-slate-100 hover:underline"
                    >
                      <Gitlab className="h-5 w-5" aria-label="GitLab" />
                      <span>{formatGitlabUrl(rewrite.gitlab)}</span>
                    </a>
                  )}
                  {rewrite.crates && (
                    <a
                      href={rewrite.crates}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-slate-100 hover:underline"
                    >
                      <Box className="h-5 w-5" aria-label="crates.io" />
                      <span>{formatCratesUrl(rewrite.crates)}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <Flame className="h-5 w-5" aria-hidden />
                    <span>{rewrite.views} views</span>
                  </div>
                </div>
              </>
            )}
          </section>
        </section>
        <section className="min-h-full w-screen bg-slate-300 p-6 sm:p-12">
          <div className="prose prose-slate mx-auto max-w-3xl">
            {rewrite && !rewrite.github && <p>No README found.</p>}
            {readme.isFetching ? (
              <Loader2
                className="mx-auto h-10 w-10 animate-spin"
                aria-label="Loading..."
              />
            ) : readme.isError ? (
              <p>Error: {readme.error.message}</p>
            ) : (
              <section
                // TODO: find a better way to do this
                dangerouslySetInnerHTML={{ __html: readme.data ?? "" }}
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default RewritePage;
