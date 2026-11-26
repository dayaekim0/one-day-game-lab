'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { loadImage, ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/image/resize';
import { composeWithStickers, type Sticker } from '@/lib/image/stickers';
import { toAgeRange } from '@/lib/age';
import { AGE_RANGES } from '@/lib/constants';
import { REVIEW_MAX_PHOTOS, REVIEW_TIP_MAX_LENGTH, type Place } from '@/lib/types';
import { PrivacyStickerEditor } from './PrivacyStickerEditor';

interface Props {
  place: Place;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

interface PhotoDraft {
  id: string;
  file: File;
  previewUrl: string;
  stickers: Sticker[];
}

const inputCls =
  'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export function ReviewUploadModal({ place, open, onClose, onDone }: Props) {
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [months, setMonths] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [tip, setTip] = useState('');
  const [body, setBody] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    api.auth.getCurrentUser().then((u) => u && setNickname((n) => n || u.nickname));
  }, [open]);

  // 미리보기 URL 정리
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)), []);

  const reset = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setEditingId(null);
    setMonths('');
    setVisitedAt('');
    setTip('');
    setBody('');
    setConsent(false);
    setError('');
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setError('');
    const room = REVIEW_MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setError(`사진은 최대 ${REVIEW_MAX_PHOTOS}장까지 올릴 수 있어요.`);
    const ok = picked.filter((f) => {
      if (f.size > MAX_UPLOAD_BYTES) {
        setError('20MB보다 큰 사진은 올릴 수 없어요.');
        return false;
      }
      return f.type.startsWith('image/') || f.type === '';
    });
    const drafts = ok.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      stickers: [],
    }));
    setPhotos((prev) => [...prev, ...drafts]);
    if (drafts[0]) setEditingId(drafts[0].id);
  };

  const removePhoto = (id: string) => {
    const p = photos.find((x) => x.id === id);
    if (p) URL.revokeObjectURL(p.previewUrl);
    setPhotos((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const editing = photos.find((p) => p.id === editingId) ?? null;
  const monthsNum = Number(months);
  const ageRangeLabel =
    months !== '' && Number.isFinite(monthsNum)
      ? AGE_RANGES.find((a) => a.value === toAgeRange(monthsNum))?.label
      : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) return setError('닉네임을 입력해 주세요.');
    if (months === '' || !Number.isInteger(monthsNum) || monthsNum < 0 || monthsNum > 72)
      return setError('방문 당시 아기 개월 수를 0~72 사이 숫자로 입력해 주세요.');
    if (!tip.trim()) return setError('한 줄 꿀팁을 입력해 주세요.');
    if (photos.length && !consent) return setError('사진 공개 동의에 체크해 주세요.');
    setSaving(true);
    try {
      const photoFiles: Blob[] = [];
      for (const p of photos) {
        const img = await loadImage(p.file);
        photoFiles.push(await composeWithStickers(img, p.stickers));
      }
      await api.reviews.createReview({
        placeId: place.id,
        nickname: nickname.trim(),
        babyAgeMonths: monthsNum,
        tip: tip.trim(),
        body: body.trim() || undefined,
        visitedAt: visitedAt || undefined,
        photoFiles,
      });
      setSaving(false);
      reset();
      onDone();
    } catch (err) {
      setSaving(false);
      setError((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={close} title="우리 아이 방문 사진 올리기" size="lg" z={2100}>
      <form onSubmit={onSubmit} className="space-y-5 p-5" noValidate>
        <p className="text-sm text-muted">
          <b className="text-ink">{place.name}</b>에 다녀온 이야기를 들려주세요. 작성한 내용은 이 기기에 저장되고
          바로 피드에 보여요.
        </p>

        {/* 사진 */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">
              방문 인증 사진 <span className="font-normal text-muted">(최대 {REVIEW_MAX_PHOTOS}장)</span>
            </h3>
            <span className="text-xs text-muted">
              {photos.length}/{REVIEW_MAX_PHOTOS}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {photos.map((p, i) => (
              <div key={p.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(p.id)}
                  className={`block h-20 w-20 overflow-hidden rounded-xl ${
                    editingId === p.id ? 'ring-2 ring-ink ring-offset-2' : ''
                  }`}
                  aria-label={`${i + 1}번째 사진 스티커 편집`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                  {p.stickers.length > 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                      스티커 {p.stickers.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  aria-label={`${i + 1}번째 사진 삭제`}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < REVIEW_MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-xs text-muted hover:border-ink"
              >
                <span className="text-2xl">＋</span>사진 추가
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
          {editing && (
            <div className="rounded-2xl border border-line p-3">
              <p className="mb-2 text-sm font-semibold">🙈 프라이버시 스티커로 아이 얼굴 가리기 (선택)</p>
              <PrivacyStickerEditor
                key={editing.id}
                previewUrl={editing.previewUrl}
                stickers={editing.stickers}
                onChange={(stickers) =>
                  setPhotos((prev) => prev.map((p) => (p.id === editing.id ? { ...p, stickers } : p)))
                }
              />
            </div>
          )}
          {photos.length > 0 && (
            <p className="text-xs text-muted">
              🔒 사진은 저장 전에 크기를 줄이고, 촬영 위치(GPS) 같은 정보를 지워요. 스티커는 사진에 합쳐져 저장돼요.
            </p>
          )}
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              닉네임 <span className="text-brand">*</span>
            </span>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} className={inputCls} placeholder="예) 콩이맘" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              방문 당시 아기 개월 수 <span className="text-brand">*</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={72}
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className={inputCls}
                placeholder="예) 15"
              />
              <span className="shrink-0 text-sm">개월</span>
            </div>
            {ageRangeLabel && <span className="mt-1 block text-xs text-muted">→ {ageRangeLabel} 배지로 표시돼요</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">방문 시기</span>
            <input type="month" value={visitedAt} max={thisMonth()} onChange={(e) => setVisitedAt(e.target.value)} className={inputCls} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 flex justify-between text-sm font-semibold">
            <span>
              한 줄 꿀팁 <span className="text-brand">*</span>
            </span>
            <span className={`font-normal ${tip.length > REVIEW_TIP_MAX_LENGTH ? 'text-brand' : 'text-muted'}`}>
              {tip.length}/{REVIEW_TIP_MAX_LENGTH}
            </span>
          </span>
          <input
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            maxLength={REVIEW_TIP_MAX_LENGTH}
            className={inputCls}
            placeholder="예) 2층 수유실이 제일 한산해요!"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">자세한 후기 (선택)</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={1000} className={inputCls} placeholder="아이 반응, 유모차 동선, 식사 등" />
        </label>

        {photos.length > 0 && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => {
                setConsent(e.target.checked);
                setError('');
              }} className="mt-0.5 h-4 w-4 accent-ink" />
            <span>사진 속 아이 얼굴이 공개되는 것에 동의하거나, 스티커로 가렸어요.</span>
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-brand">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60">
          {saving ? '사진 정리하는 중…' : '방문 인증 올리기'}
        </button>
      </form>
    </Modal>
  );
}
