import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
  ) => void;
}

const ToastContext =
  createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
    ) => {
      const id = Date.now();

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ]);

      window.setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (toast) => toast.id !== id,
          ),
        );
      }, 3500);
    },
    [],
  );

  const removeToast = (id: number) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id),
    );
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
        ? XCircle
        : Info;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
      <Icon
        size={18}
        className={
          toast.type === "success"
            ? "mt-0.5 shrink-0 text-emerald-600"
            : toast.type === "error"
              ? "mt-0.5 shrink-0 text-red-600"
              : "mt-0.5 shrink-0 text-blue-600"
        }
      />

      <p className="flex-1 text-sm leading-5 text-zinc-700">
        {toast.message}
      </p>

      <button
        onClick={onClose}
        className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider",
    );
  }

  return context;
}