"use client";

import { Download, HardDrive, RotateCcw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { dateKey } from "@/lib/date";
import type { AppState } from "@/lib/types";
import type { Actions } from "@/lib/useAppState";

export default function DataSheet({
  state,
  actions,
  onClose,
}: {
  state: AppState;
  actions: Actions;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retire-pipeline-${dateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("백업 파일을 저장했어요.");
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!window.confirm("현재 기록을 백업 파일 내용으로 바꿀까요?")) return;
      actions.importState(data);
      setMsg("백업을 불러왔어요.");
    } catch {
      setMsg("파일을 읽지 못했어요. 이 앱에서 내보낸 JSON 파일인지 확인해 주세요.");
    }
  };

  const days = Object.keys(state.dailyLog).length;
  const months = Object.keys(state.revenue).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="데이터 관리"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <HardDrive size={18} /> 데이터 관리
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          모든 기록은 이 기기의 브라우저(LocalStorage)에만 저장돼요. 서버로 전송되지 않아요.
          <br />
          루틴 기록 {days}일 · 수익 기록 {months}개월 · 시작일 {state.startDate}
          <br />
          브라우저 데이터를 지우면 사라지니 가끔 백업해 두세요.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={exportJson}
            className="flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white"
          >
            <Download size={18} /> 백업 파일 내보내기 (JSON)
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200"
          >
            <Upload size={18} /> 백업 파일 불러오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm("모든 기록을 지우고 처음부터 시작할까요? 되돌릴 수 없어요.")) {
                actions.resetAll();
                setMsg("초기화했어요.");
              }
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-rose-600 ring-1 ring-rose-100"
          >
            <RotateCcw size={18} /> 전체 초기화
          </button>
        </div>

        {msg && <p className="mt-3 text-center text-xs text-slate-500">{msg}</p>}
      </div>
    </div>
  );
}
