// next/og(Satori)는 이모지 글리프를 렌더링하지 못하므로(빈 배경만 나옴),
// 순수 도형(div + border)만으로 자물쇠 실루엣을 그려 PWA 아이콘을 구성한다.
export function LockIcon({ canvas, maskable = false }: { canvas: number; maskable?: boolean }) {
  // 마스커블 아이콘은 OS가 원형 등으로 잘라내도 안 잘리도록 조금 더 작게(안전영역 안에) 그린다.
  const scale = maskable ? 0.72 : 1;
  const shackleW = canvas * 0.34 * scale;
  const shackleH = canvas * 0.26 * scale;
  const shackleBorder = canvas * 0.075 * scale;
  const bodyW = canvas * 0.5 * scale;
  const bodyH = canvas * 0.32 * scale;
  const bodyRadius = canvas * 0.09 * scale;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#4f46e5',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: shackleW,
            height: shackleH,
            border: `${shackleBorder}px solid white`,
            borderBottom: 'none',
            borderRadius: `${shackleW}px ${shackleW}px 0 0`,
            boxSizing: 'border-box',
          }}
        />
        <div
          style={{
            width: bodyW,
            height: bodyH,
            background: 'white',
            borderRadius: bodyRadius,
            marginTop: -shackleBorder * 0.4,
          }}
        />
      </div>
    </div>
  );
}
