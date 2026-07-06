const NOTIFICATIONS = [
  {
    id: 1,
    icon: '🔔',
    title: '링 플레이 리뷰를 기다리는 중',
    body: '제로월드 강남점 플레이가 종료되었어요. 리뷰를 남기면 육각 스탯이 성장합니다.',
    time: '10분 전',
    unread: true,
  },
  {
    id: 2,
    icon: '🤝',
    title: '동행 파티에 새 팀원이 참여했어요',
    body: '키이스케이프 강남점 · 고백 파티에 유저B님이 안전 예치를 완료했습니다.',
    time: '2시간 전',
    unread: true,
  },
  {
    id: 3,
    icon: '✅',
    title: '안전 정산이 완료되었습니다',
    body: '무사히 플레이가 종료되어 보증금이 전액 반환되었어요.',
    time: '어제',
    unread: false,
  },
  {
    id: 4,
    icon: '✨',
    title: '새로운 저격 추천 테마가 도착했어요',
    body: 'AI Graph 엔진이 회원님과 96.4% 일치하는 테마를 찾았습니다.',
    time: '2일 전',
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="px-4 py-4 pb-8">
      <h1 className="mb-3 text-lg font-bold text-zinc-900">알림</h1>
      <div className="space-y-2">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className={`flex gap-3 rounded-2xl border p-3 ${
              n.unread ? 'border-indigo-200 bg-indigo-50/50' : 'border-zinc-200 bg-white'
            }`}
          >
            <span className="text-xl">{n.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-zinc-900">{n.title}</p>
                {n.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{n.body}</p>
              <p className="mt-1 text-[11px] text-zinc-400">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
