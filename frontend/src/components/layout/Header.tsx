import {
  Menu,
  Search,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-sm font-medium text-zinc-900">
            Your knowledge
          </p>

          <p className="hidden text-xs text-zinc-500 sm:block">
            Everything you save, in one place
          </p>
        </div>
      </div>

      <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-2 text-sm text-zinc-500 transition hover:bg-zinc-50 sm:px-3">
        <Search size={16} />

        <span className="hidden sm:inline">
          Search
        </span>

        <kbd className="hidden rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘ K
        </kbd>
      </button>
    </header>
  );
}