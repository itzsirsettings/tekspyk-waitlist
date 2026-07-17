import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export type ClipKind =
  | "sparkle"
  | "automation"
  | "pulse"
  | "bars"
  | "chat"
  | "cloud";

export type ConceptClipProps = {
  kind: ClipKind;
  hue: number;
};

/** Sine wave locked to the composition length so the render loops seamlessly. */
function loopSin(frame: number, duration: number, cycles: number, phase = 0) {
  return Math.sin((frame / duration) * cycles * Math.PI * 2 + phase);
}

/** 0..1 sawtooth locked to the composition length, for particles that travel and wrap. */
function loopProgress(frame: number, duration: number, cycles: number, phaseFrac = 0) {
  const raw = (frame / duration) * cycles + phaseFrac;
  return raw - Math.floor(raw);
}

function tint(hue: number, lightness: number, chroma: number, alpha = 1) {
  return `oklch(${lightness}% ${chroma} ${hue} / ${alpha})`;
}

function SparkleMotif({ frame, duration, hue }: { frame: number; duration: number; hue: number }) {
  const ink = tint(hue, 40, 0.18);
  const soft = tint(hue, 40, 0.18, 0.35);
  const dots = [0, 1, 2].map((index) => {
    const phase = (index * (Math.PI * 2)) / 3;
    const lift = loopSin(frame, duration, 2, phase);
    return 8 + lift * 5;
  });

  return (
    <g>
      {[[-150, -70, 0.9], [150, -95, 0.6], [130, 90, 0.75], [-160, 80, 0.5]].map(
        ([x, y, scaleBase], index) => {
          const spin = ((frame / duration) * 360 * 0.5 + index * 40) % 360;
          const pulse = 1 + loopSin(frame, duration, 2, index) * 0.18;
          return (
            <g
              key={index}
              transform={`translate(${480 + Number(x)}, ${270 + Number(y)}) rotate(${spin}) scale(${
                Number(scaleBase) * pulse
              })`}
            >
              <path
                d="M0 -20 L5 -5 L20 0 L5 5 L0 20 L-5 5 L-20 0 L-5 -5 Z"
                fill={soft}
              />
            </g>
          );
        },
      )}

      <rect x={340} y={190} width={280} height={160} rx={28} fill="white" stroke={ink} strokeWidth={3} />
      <path d="M400 350 L400 385 L440 350 Z" fill="white" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
      {dots.map((d, index) => (
        <circle key={index} cx={430 + index * 50} cy={270 - d} r={10} fill={ink} />
      ))}
    </g>
  );
}

function AutomationMotif({ frame, duration, hue }: { frame: number; duration: number; hue: number }) {
  const ink = tint(hue, 38, 0.17);
  const line = tint(hue, 55, 0.06);
  const nodes = [200, 400, 600, 800];
  const pulseX = 200 + loopProgress(frame, duration, 1) * 600;

  return (
    <g>
      <line x1={200} y1={270} x2={800} y2={270} stroke={line} strokeWidth={6} />
      {nodes.map((x, index) => {
        const passed = loopProgress(frame, duration, 1) > index / (nodes.length - 1) - 0.02;
        return (
          <g key={x}>
            <circle cx={x} cy={270} r={26} fill="white" stroke={ink} strokeWidth={4} />
            {passed ? (
              <path
                d={`M${x - 10} 270 L${x - 2} 279 L${x + 12} 261`}
                fill="none"
                stroke={ink}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <circle cx={x} cy={270} r={5} fill={ink} opacity={0.4} />
            )}
          </g>
        );
      })}
      <circle cx={pulseX} cy={270} r={12} fill={ink} />
      <circle cx={pulseX} cy={270} r={22} fill={ink} opacity={0.25} />
    </g>
  );
}

function PulseMotif({ frame, duration, hue }: { frame: number; duration: number; hue: number }) {
  const ink = tint(hue, 42, 0.18);
  const track = tint(hue, 55, 0.05);
  const rings = [
    { r: 130, cycles: 1, width: 22 },
    { r: 95, cycles: 1.5, width: 18 },
    { r: 62, cycles: 2, width: 14 },
  ];

  return (
    <g transform="translate(480, 270)">
      {rings.map((ring, index) => (
        <circle
          key={index}
          r={ring.r}
          fill="none"
          stroke={track}
          strokeWidth={ring.width}
          opacity={0.35}
        />
      ))}
      {rings.map((ring, index) => {
        const progress = loopProgress(frame, duration, ring.cycles);
        const circumference = 2 * Math.PI * ring.r;
        return (
          <circle
            key={`fg-${index}`}
            r={ring.r}
            fill="none"
            stroke={ink}
            strokeWidth={ring.width}
            strokeLinecap="round"
            strokeDasharray={`${progress * circumference} ${circumference}`}
            transform="rotate(-90)"
            opacity={0.85 - index * 0.15}
          />
        );
      })}
    </g>
  );
}

function BarsMotif({ frame, duration, hue }: { frame: number; duration: number; hue: number }) {
  const ink = tint(hue, 40, 0.18);
  const soft = tint(hue, 40, 0.18, 0.35);
  const bars = [1, 2, 3, 2, 4].map((freq, index) => {
    const base = 70 + index * 10;
    const amp = 40;
    const height = base + amp * (0.5 + 0.5 * loopSin(frame, duration, freq, index));
    return height;
  });
  const barWidth = 60;
  const gap = 26;
  const startX = 480 - (bars.length * barWidth + (bars.length - 1) * gap) / 2;
  const baseline = 350;

  const linePoints = Array.from({ length: 41 }, (_, index) => {
    const x = 300 + index * 9;
    const t = index / 40;
    const y = 200 + 40 * loopSin(frame, duration, 2, t * Math.PI * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <g>
      <polyline points={linePoints} fill="none" stroke={soft} strokeWidth={4} strokeLinecap="round" />
      {bars.map((height, index) => (
        <rect
          key={index}
          x={startX + index * (barWidth + gap)}
          y={baseline - height}
          width={barWidth}
          height={height}
          rx={10}
          fill={ink}
        />
      ))}
    </g>
  );
}

function ChatMotif({ frame, duration, hue }: { frame: number; duration: number; hue: number }) {
  const ink = tint(hue, 40, 0.18);
  const progress = loopProgress(frame, duration, 1);
  const userVisible = progress < 0.5;
  const localProgress = userVisible ? progress / 0.5 : (progress - 0.5) / 0.5;
  const opacity = Math.sin(localProgress * Math.PI);

  return (
    <g>
      <g opacity={userVisible ? opacity : 0} transform="translate(280, 190)">
        <rect width={300} height={110} rx={26} fill={tint(hue, 40, 0.18, 0.12)} />
        <rect x={30} y={40} width={200} height={14} rx={7} fill={ink} opacity={0.55} />
        <rect x={30} y={64} width={140} height={14} rx={7} fill={ink} opacity={0.35} />
      </g>
      <g opacity={userVisible ? 0 : opacity} transform="translate(380, 300)">
        <rect width={300} height={110} rx={26} fill="white" stroke={ink} strokeWidth={3} />
        {[0, 1, 2].map((index) => {
          const bounce = Math.abs(loopSin(frame, duration, 4, index * 1.4));
          return <circle key={index} cx={100 + index * 40} cy={55 - bounce * 10} r={9} fill={ink} />;
        })}
      </g>
    </g>
  );
}

function CloudMotif({ frame, duration, hue }: { frame: number; duration: number; hue: number }) {
  const ink = tint(hue, 38, 0.17);
  const line = tint(hue, 55, 0.06);
  const servers = [340, 480, 620];

  return (
    <g>
      <g transform="translate(480, 170)">
        <path
          d="M-110 20 a50 50 0 0 1 15 -98 a65 65 0 0 1 122 -8 a48 48 0 0 1 3 96 Z"
          fill="white"
          stroke={ink}
          strokeWidth={4}
        />
      </g>
      {servers.map((x, index) => {
        const travel = loopProgress(frame, duration, 1, index / servers.length);
        const y = 400 - travel * 190;
        const opacity = travel < 0.85 ? 1 : (1 - travel) / 0.15;
        return (
          <g key={x}>
            <line x1={x} y1={230} x2={x} y2={400} stroke={line} strokeWidth={5} />
            <rect x={x - 34} y={370} width={68} height={46} rx={10} fill="white" stroke={ink} strokeWidth={3} />
            <rect x={x - 20} y={385} width={40} height={6} rx={3} fill={ink} opacity={0.5} />
            <rect x={x - 20} y={397} width={26} height={6} rx={3} fill={ink} opacity={0.3} />
            <circle cx={x} cy={y} r={9} fill={ink} opacity={opacity} />
          </g>
        );
      })}
    </g>
  );
}

const MOTIFS: Record<ClipKind, typeof SparkleMotif> = {
  sparkle: SparkleMotif,
  automation: AutomationMotif,
  pulse: PulseMotif,
  bars: BarsMotif,
  chat: ChatMotif,
  cloud: CloudMotif,
};

export function ConceptClip({ kind, hue }: ConceptClipProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const Motif = MOTIFS[kind];

  return (
    <AbsoluteFill style={{ background: tint(hue, 93, 0.05) }}>
      <svg
        viewBox="0 0 960 540"
        width="100%"
        height="100%"
        role="img"
        aria-label="Abstract concept animation, not a photograph or a real product screenshot"
      >
        <Motif frame={frame} duration={durationInFrames} hue={hue} />
      </svg>
    </AbsoluteFill>
  );
}
