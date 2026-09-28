import { useState } from "react";
import {
    FileText,
    Globe,
    Loader2,
    X,
} from "lucide-react";
import {
    addNote,
    addUrl,
} from "../../api/knowledgeApi";
import { getApiErrorMessage } from "../../api/apiError";
import { useToast } from "../ui/ToastContext";

type InputType = "note" | "url";

interface AddKnowledgeModalProps {
    onClose: () => void;
    onCreated: () => void;
}

export function AddKnowledgeModal({
    onClose,
    onCreated,
}: AddKnowledgeModalProps) {
    const [type, setType] = useState<InputType>("note");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showToast } = useToast();

    const handleSubmit = async () => {
        const value = content.trim();

        if (!value) {
            setError(
                type === "note"
                    ? "Please enter some text."
                    : "Please enter a URL.",
            );

            return;
        }

        if (type === "url") {
            try {
                new URL(value);
            } catch {
                setError("Please enter a valid URL.");
                return;
            }
        }

        setLoading(true);
        setError("");

        try {
            if (type === "note") {
                await addNote({
                    source_type: "note",
                    content: value,
                });
            } else {
                await addUrl({
                    source_type: "url",
                    url: value,
                });
            }
            showToast(
                type === "note"
                    ? "Note saved successfully."
                    : "Web page imported successfully.",
                "success",
            );



            onCreated();
            onClose();
        } catch (err: any) {

            const message = getApiErrorMessage(
                error,
                "Failed to save knowledge.",
            );




            setError(
                getApiErrorMessage(
                    error,
                    "Failed to save knowledge.",
                ),
            );

            showToast(message, "error");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Add knowledge
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Save something you want to remember.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Type selector */}
                    <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
                        <button
                            onClick={() => {
                                setType("note");
                                setContent("");
                                setError("");
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${type === "note"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <FileText size={16} />
                            Text note
                        </button>

                        <button
                            onClick={() => {
                                setType("url");
                                setContent("");
                                setError("");
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${type === "url"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <Globe size={16} />
                            Web page
                        </button>
                    </div>

                    {/* Input */}
                    {type === "note" ? (
                        <textarea
                            value={content}
                            onChange={(event) => {
                                setContent(event.target.value);
                                setError("");
                            }}
                            placeholder="Write or paste your note here..."
                            rows={8}
                            autoFocus
                            className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
                        />
                    ) : (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Web page URL
                            </label>

                            <input
                                type="url"
                                value={content}
                                onChange={(event) => {
                                    setContent(event.target.value);
                                    setError("");
                                }}
                                placeholder="https://example.com/article"
                                autoFocus
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
                            />

                            <p className="mt-2 text-xs text-zinc-400">
                                The server will fetch and extract the page content.
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}

                            {loading ? "Saving..." : "Save knowledge"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}