"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, type = "success", onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-2xl border text-sm font-button font-medium shadow-2xl transition-all duration-300 flex items-center gap-3 ${
        isSuccess
          ? "bg-black/80 backdrop-blur-xl border-green-500/30 text-white shadow-[0_10px_40px_rgba(34,197,94,0.15)]"
          : "bg-black/80 backdrop-blur-xl border-red-500/30 text-white shadow-[0_10px_40px_rgba(239,68,68,0.15)]"
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 scale-95"}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-green-400" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400" />
      )}
      {message}
    </div>
  );
}
