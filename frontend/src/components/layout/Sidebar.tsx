import {
  FileText,
  Globe,
  Inbox,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  onAddClick: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  onAddClick,
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 shrink-0
          flex-col border-r border-zinc-200 bg-white
          transition-transform duration-200
          md:static md:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <Sparkles size={18} />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-zinc-900">
                Knowledge Inbox
              </h1>

              <p className="text-xs text-zinc-500">
                AI-powered memory
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add */}
        <div className="p-4">
          <button
            onClick={() => {
              onAddClick();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <Plus size={17} />
            Add knowledge
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3">
          <button className="flex w-full items-center gap-3 rounded-lg bg-zinc-100 px-3 py-2.5 text-sm font-medium text-zinc-900">
            <Inbox size={18} />
            All knowledge
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50">
            <FileText size={18} />
            Notes
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50">
            <Globe size={18} />
            Web pages
          </button>
        </nav>

        {/* Bottom */}
        <div className="mt-auto border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              <Search
                size={16}
                className="text-zinc-500"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-700">
                Semantic search
              </p>

              <p className="text-[11px] text-zinc-400">
                Powered by embeddings
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}