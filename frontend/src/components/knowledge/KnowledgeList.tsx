import {
  FileText,
  Globe,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { KnowledgeItem, SourceType } from "../../types/knowledge";

interface KnowledgeListProps {
  items: KnowledgeItem[];
  loading: boolean;
  onRefresh: () => void;
  source : SourceType
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function KnowledgeList({
  items,
  loading,
  onRefresh,
  source
}: KnowledgeListProps) {

   const getItemsList=()=>{

    if(source==='note'){
        return items?.filter((i)=>i.source_type==='note')
    }
    else  if(source==='url'){
        return items?.filter((i)=>i.source_type==='url')

    }
    else{
        return items;
    }

   }

   items=getItemsList(                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           )
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">
            Recent knowledge
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {items.length} saved{" "}
            {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
            <FileText size={22} className="text-zinc-500" />
          </div>

          <h4 className="text-sm font-semibold text-zinc-900">
            Nothing saved yet
          </h4>

          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            Add a note or webpage and it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function KnowledgeCard({
  item,
}: {
  item: KnowledgeItem;
}) {
  const isUrl = item.source_type === "url";

  return (
    <article className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isUrl ? "bg-blue-50" : "bg-amber-50"
          }`}
        >
          {isUrl ? (
            <Globe size={17} className="text-blue-600" />
          ) : (
            <FileText size={17} className="text-amber-600" />
          )}
        </div>

        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium capitalize text-zinc-500">
          {item.source_type}
        </span>
      </div>

      <h4 className="mt-4 line-clamp-2 text-sm font-semibold text-zinc-900">
        {item.title ||
          (isUrl ? "Web page" : "Untitled note")}
      </h4>

      {item.source_url && (
        <div className="mt-2 flex items-center gap-1.5">
          <p className="min-w-0 truncate text-xs text-zinc-400">
            {item.source_url}
          </p>

          <ExternalLink
            size={12}
            className="shrink-0 text-zinc-400"
          />
        </div>
      )}

      <div className="mt-5 border-t border-zinc-100 pt-3">
        <p className="text-xs text-zinc-400">
          Saved {formatDate(item.created_at)}
        </p>
      </div>
    </article>
  );
}