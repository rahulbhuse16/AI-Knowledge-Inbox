import type { FormEvent } from "react";
import { useState } from "react";
import {
  ArrowUp,
  Bot,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";

import { askQuestion } from "../../api/knowledgeApi";
import { getApiErrorMessage } from "../../api/apiError";
import { useToast } from "../ui/ToastContext";
import type { QueryResponse } from "../../types/knowledge";

export function QueryPanel() {
  const [question, setQuestion] = useState("");
  const [result, setResult] =
    useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { showToast } = useToast();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await askQuestion(
        trimmedQuestion,
        5,
      );

      setResult(response);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to generate an answer.",
      );

      setError(message);
      setResult(null);

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3">
            <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 sm:flex">
              <Sparkles
                size={17}
                className="text-zinc-700"
              />
            </div>

            <div className="min-w-0 flex-1">
              <label
                htmlFor="knowledge-question"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Ask your knowledge
              </label>

              <textarea
                id="knowledge-question"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (
                      question.trim() &&
                      !loading
                    ) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                placeholder="Ask something about your saved notes or webpages..."
                rows={3}
                maxLength={2000}
                disabled={loading}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-400">
                  Press Enter to ask · Shift + Enter for a new line
                </p>

                <button
                  type="submit"
                  disabled={
                    loading || !question.trim()
                  }
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <ArrowUp size={16} />
                      Ask AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}
      </div>

      {result && (
        <AnswerResult result={result} />
      )}
    </section>
  );
}

function AnswerResult({
  result,
}: {
  result: QueryResponse;
}) {
  if (result.sources.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
            <Sparkles
              size={17}
              className="text-amber-600"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-900">
              No relevant knowledge found
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              I couldn't find enough information in your
              saved knowledge to answer this question.
            </p>

            <p className="mt-3 text-xs text-amber-700">
              Try adding a relevant note or webpage,
              then ask the question again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderAnswer = () => {
    const parts = result.answer.split(
      /(\[Source \d+\])/g,
    );

    return parts.map((part, index) => {
      const match = part.match(
        /^\[Source (\d+)\]$/,
      );

      if (!match) {
        return (
          <span key={index}>
            {part}
          </span>
        );
      }

      const sourceNumber = Number(match[1]);

      const source =
        result.sources[sourceNumber - 1];

      if (!source) {
        return (
          <span key={index}>
            {part}
          </span>
        );
      }

      const isExternalSource =
        Boolean(source.source_url);

      return (
        <a
          key={index}
          href={
            source.source_url ||
            `#source-${source.chunk_id}`
          }
          target={
            isExternalSource
              ? "_blank"
              : undefined
          }
          rel={
            isExternalSource
              ? "noopener noreferrer"
              : undefined
          }
          className="mx-0.5 inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200"
          title={
            source.title ||
            source.source_url ||
            "Saved note"
          }
        >
          [Source {sourceNumber}]
        </a>
      );
    });
  };

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Answer */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <Bot size={17} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-zinc-900">
                AI Answer
              </p>

              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Grounded
              </span>
            </div>

            <p className="mt-0.5 text-xs text-zinc-400">
              Based on your saved knowledge
            </p>
          </div>
        </div>

        <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
          {renderAnswer()}
        </div>
      </div>

      {/* Sources */}
      <div className="border-t border-zinc-100 bg-zinc-50/60 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-zinc-800">
              Sources
            </h4>

            <p className="mt-0.5 text-xs text-zinc-400">
              Retrieved from your knowledge base
            </p>
          </div>

          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-200">
            {result.sources.length}{" "}
            {result.sources.length === 1
              ? "source"
              : "sources"}
          </span>
        </div>

        <div className="space-y-3">
          {result.sources.map(
            (source, index) => (
              <SourceCard
                key={source.chunk_id}
                source={source}
                index={index}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function SourceCard({
  source,
  index,
}: {
  source: QueryResponse["sources"][number];
  index: number;
}) {
  const isUrl = Boolean(source.source_url);

  return (
    <div
      id={`source-${source.chunk_id}`}
      className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300"
    >
      <div className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-600">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-800">
                {source.title ||
                  (isUrl
                    ? "Web page"
                    : "Saved note")}
              </p>

              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-400">
                {isUrl
                  ? "Web source"
                  : "Note"}
              </p>
            </div>

            {source.source_url && (
              <a
                href={source.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                title="Open source"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>

          {source.source_url && (
            <a
              href={source.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-xs text-blue-600 hover:underline"
            >
              {source.source_url}
            </a>
          )}

          <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs leading-5 text-zinc-500">
            {source.snippet}
          </p>
        </div>
      </div>
    </div>
  );
}
