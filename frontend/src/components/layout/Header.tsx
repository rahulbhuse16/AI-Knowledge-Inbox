import {
  Menu,
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

      
    </header>
  );
}