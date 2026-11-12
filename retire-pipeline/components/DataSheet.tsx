"use client";

import { ClipboardCopy, Download, HardDrive, RotateCcw, Upload, X } from "lucide-react";
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
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<unknown>(null); // 불러올 백업 (확인 대기)
  const [confirmReset, setConfirmReset] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const json = JSON.stringify(state);

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retire-pipeline-${dateKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg("파일 저장을 시작했어요. 저장이 안 되면 '백업 코드 복사'를 써 주세요.");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setMsg("백업 코드를 복사했어요. 메모 앱 등에 붙여넣어 보관하세요.");
    } catch {
      setPasteText(json);
      setTimeout(() => pasteRef.current?.select(), 0);
      setMsg("자동 복사가 막혀 있어요. 아래 칸의 코드를 길게 눌러 복사해 주세요.");
    }
  };

  const parse = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (typeof data !== "object" || data === null) throw new Error();
      setPending(data);
      setMsg(null);
    } catch {
      setMsg("백업을 읽지 못했어요. 이 앱에서 내보낸 파일이나 코드인지 확인해 주세요.");
    }
  };

  const days = Object.keys(state.dailyLog).length;
  const months = Object.keys(state.revenue).length;

  const btn = "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="데이터 관리"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl"
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

        {pending !== null ? (
          <div className="space-y-2 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="text-sm font-semibold text-amber-900">
              현재 기록을 백업 내용으로 바꿀까요?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  actions.importState(pending);
                  setPending(null);
                  setPasteText("");
                  setMsg("백업을 불러왔어요.");
                }}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white"
              >
                불러오기
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="flex-1 rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button type="button" onClick={exportFile} className={`${btn} bg-slate-900 text-white`}>
              <Download size={18} /> 백업 파일 저장 (JSON)
            </button>
            <button
              type="button"
              onClick={copyCode}
              className={`${btn} bg-white text-slate-800 ring-1 ring-slate-200`}
            >
              <ClipboardCopy size={18} /> 백업 코드 복사
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`${btn} bg-white text-slate-800 ring-1 ring-slate-200`}
            >
              <Upload size={18} /> 백업 파일 불러오기
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) parse(await f.text());
                e.target.value = "";
              }}
            />

            <div className="rounded-2xl p-3 ring-1 ring-slate-200">
              <label htmlFor="backup-code" className="mb-1.5 block text-xs font-semibold text-slate-600">
                백업 코드 붙여넣기
              </label>
              <textarea
                id="backup-code"
                ref={pasteRef}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={3}
                placeholder='{"version":1, ...}'
                className="w-full resize-none rounded-xl bg-slate-50 p-2 font-mono text-[11px] text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                disabled={!pasteText.trim()}
                onClick={() => parse(pasteText)}
                className="mt-2 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                코드로 불러오기
              </button>
            </div>

            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    actions.resetAll();
                    setConfirmReset(false);
                    setMsg("초기화했어요.");
                  }}
                  className="flex-1 rounded-2xl bg-rose-600 py-3.5 text-sm font-semibold text-white"
                >
                  모두 지우기 (되돌릴 수 없음)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-2xl px-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-200"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className={`${btn} text-rose-600 ring-1 ring-rose-100`}
              >
                <RotateCcw size={18} /> 전체 초기화
              </button>
            )}
          </div>
        )}

        {msg && <p className="mt-3 text-center text-xs text-slate-500">{msg}</p>}
      </div>
    </div>
  );
}
