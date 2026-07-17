import { Composition } from "remotion";
import { ConceptClip, type ClipKind } from "./ConceptClip";

export const CLIPS: Array<{ id: string; kind: ClipKind; hue: number }> = [
  { id: "concept-ai-copilot", kind: "sparkle", hue: 262 },
  { id: "concept-invoice-agent", kind: "automation", hue: 160 },
  { id: "concept-fitness-tracker", kind: "pulse", hue: 30 },
  { id: "concept-saas-dashboard", kind: "bars", hue: 300 },
  { id: "concept-support-chat", kind: "chat", hue: 220 },
  { id: "concept-cloud-deploy", kind: "cloud", hue: 120 },
];

const FPS = 30;
const DURATION_IN_FRAMES = 120;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {CLIPS.map((clip) => (
        <Composition
          key={clip.id}
          id={clip.id}
          component={ConceptClip}
          durationInFrames={DURATION_IN_FRAMES}
          fps={FPS}
          width={960}
          height={540}
          defaultProps={{ kind: clip.kind, hue: clip.hue }}
        />
      ))}
    </>
  );
};
