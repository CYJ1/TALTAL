'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitReviewAction } from '@/lib/actions';

// 흙길(최하) < 풀길 < 풀꽃길 < 꽃길 < 꽃밭길 < 인생테마(최상) 순
const GRADES = ['흙길', '풀길', '풀꽃길', '꽃길', '꽃밭길', '인생테마'];
const FEATURE_TAGS = ['나레이션필수', '장치노후화', '활동성높음', '스토리연계성', '연출대박'];
const HEADCOUNT_OPTIONS = [2, 3, 4, 5];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReviewForm({
  themeId,
  manualEntry = false,
}: {
  themeId: string;
  /** 앱으로 예약 안 하고 플레이한 테마를 지금 처음 기록하는 경우 — 날짜 선택을 추가로 보여준다. */
  manualEntry?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [playedAt, setPlayedAt] = useState(todayIso());
  const [grade, setGrade] = useState('인생테마');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [votedHeadcount, setVotedHeadcount] = useState(3);
  const [cleared, setCleared] = useState(true);
  const [remainingMin, setRemainingMin] = useState(14);
  const [remainingSec, setRemainingSec] = useState(25);
  const [hintsUsed, setHintsUsed] = useState(3);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit() {
    startTransition(async () => {
      await submitReviewAction({
        themeId,
        grade,
        selectedTags,
        votedHeadcount,
        cleared,
        remainingSec: remainingMin * 60 + remainingSec,
        hintsUsed,
        comment,
        playedAt: manualEntry ? playedAt : undefined,
      });
      setDone(true);
      setTimeout(() => router.push('/calendar'), 900);
    });
  }

  if (done) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-2 font-semibold text-emerald-700">
          기록 저장 완료! 육각 스탯이 실시간으로 성장했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      {manualEntry && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">플레이한 날짜</h2>
          <input
            type="date"
            required
            value={playedAt}
            max={todayIso()}
            onChange={(e) => setPlayedAt(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
          />
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">1. 종합 등급 평가</h2>
        <div className="grid grid-cols-3 gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={`rounded-xl border py-2 text-xs font-medium ${
                grade === g ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-200 text-zinc-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">2. 테마 핵심 특성 피드백</h2>
        <div className="flex flex-wrap gap-2">
          {FEATURE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedTags.includes(tag)
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-zinc-200 text-zinc-500'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">3. 실체감 플레이 인원수 매칭 투표</h2>
        <div className="grid grid-cols-4 gap-2">
          {HEADCOUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setVotedHeadcount(n)}
              className={`rounded-xl border py-2 text-xs font-medium ${
                votedHeadcount === n ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-200 text-zinc-600'
              }`}
            >
              👥 {n}{n === 5 ? '인 이상' : '인'}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">탈출 여부</span>
          <div className="flex overflow-hidden rounded-full border border-zinc-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setCleared(true)}
              className={`px-3 py-1 ${cleared ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}
            >
              성공
            </button>
            <button
              type="button"
              onClick={() => setCleared(false)}
              className={`px-3 py-1 ${!cleared ? 'bg-rose-500 text-white' : 'text-zinc-500'}`}
            >
              실패
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700">남은 시간</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={remainingMin}
              onChange={(e) => setRemainingMin(Number(e.target.value))}
              className="w-14 rounded-lg border border-zinc-200 px-2 py-1 text-center"
            />
            분
            <input
              type="number"
              value={remainingSec}
              onChange={(e) => setRemainingSec(Number(e.target.value))}
              className="w-14 rounded-lg border border-zinc-200 px-2 py-1 text-center"
            />
            초
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700">사용한 힌트수</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHintsUsed((v) => Math.max(0, v - 1))}
              className="h-7 w-7 rounded-full border border-zinc-200 text-zinc-500"
            >
              −
            </button>
            <span className="w-4 text-center">{hintsUsed}</span>
            <button
              type="button"
              onClick={() => setHintsUsed((v) => v + 1)}
              className="h-7 w-7 rounded-full border border-zinc-200 text-zinc-500"
            >
              +
            </button>
          </div>
        </div>
      </section>

      <section>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="한줄 코멘트를 남겨보세요"
          rows={3}
          className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-indigo-400"
        />
      </section>

      <button
        type="button"
        disabled={pending}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? '저장 중...' : '📝 기록 및 리뷰 저장하기 (육각 스탯 성장 + AI 데이터 피딩)'}
      </button>
    </div>
  );
}
