'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import type { Category, Region } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  regions: Region[];
  defaultRegionId?: string;
}

const inputCls =
  'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink';

export function SubmitPlaceModal({ open, onClose, regions, defaultRegionId }: Props) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<Category>('restaurant');

  const close = () => {
    setDone(false);
    setError('');
    onClose();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '').trim();
    if (!get('name') || !get('address') || !get('reason') || !get('nickname')) {
      setError('필수 항목(*)을 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.places.submitPlace({
        nickname: get('nickname'),
        name: get('name'),
        category,
        regionId: get('regionId') || undefined,
        address: get('address'),
        reason: get('reason'),
        link: get('link') || undefined,
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="새로운 장소 제보하기">
      {done ? (
        <div className="px-6 py-12 text-center">
          <p className="text-4xl">💌</p>
          <p className="mt-3 text-lg font-bold">제보해 주셔서 고마워요!</p>
          <p className="mt-1 text-sm text-muted">이안이네가 확인한 뒤 지도에 올릴게요.</p>
          <button
            type="button"
            onClick={close}
            className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white"
          >
            닫기
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
          <p className="text-sm text-muted">
            아기와 다녀왔는데 좋았던 곳을 알려 주세요. 검수 후 지도에 추가돼요.
          </p>
          <Field label="장소 이름" required>
            <input name="name" className={inputCls} placeholder="예) ○○ 키즈카페" maxLength={60} />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">
              카테고리 <span className="text-brand">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  aria-pressed={category === c.value}
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm ${
                    category === c.value ? 'border-ink bg-ink text-white' : 'border-gray-300'
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="지역">
            <select name="regionId" defaultValue={defaultRegionId ?? ''} className={inputCls}>
              <option value="">기타 / 새 지역</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="주소" required>
            <input name="address" className={inputCls} placeholder="도로명 주소 또는 지도 링크" maxLength={200} />
          </Field>
          <Field label="추천 이유" required>
            <textarea
              name="reason"
              rows={3}
              className={inputCls}
              placeholder="유아 의자가 있어요, 수유실이 깨끗해요 등"
              maxLength={500}
            />
          </Field>
          <Field label="참고 링크 (블로그·인스타 등)">
            <input name="link" type="url" className={inputCls} placeholder="https://" />
          </Field>
          <Field label="닉네임" required>
            <input name="nickname" className={inputCls} placeholder="예) 콩이맘" maxLength={20} />
          </Field>
          {error && (
            <p role="alert" className="text-sm font-semibold text-brand">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? '보내는 중…' : '제보 보내기'}
          </button>
        </form>
      )}
    </Modal>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      {children}
    </label>
  );
}
