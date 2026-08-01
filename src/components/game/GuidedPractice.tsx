import { useEffect, useRef, useState } from "react";
import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  Hand,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { GameButton, Meter } from "@/components/game/kit";
import type { Sign } from "@/game/data";
import { cn } from "@/lib/utils";

const VISION_VERSION = "0.10.22-rc.20250304";
const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
] as const;

type CameraState = "idle" | "permission" | "model" | "live" | "error";
type CheckState = "waiting" | "pass" | "adjust";

type MotionFrame = {
  at: number;
  hands: number;
  x: number;
  y: number;
  separation?: number;
};

type Guidance = {
  message: string;
  detail: string;
  score: number;
  hands: CheckState;
  position: CheckState;
  movement: CheckState;
};

const WAITING_GUIDANCE: Guidance = {
  message: "Enable your webcam when you are ready.",
  detail: "Your video stays in this browser tab and is not recorded or uploaded.",
  score: 0,
  hands: "waiting",
  position: "waiting",
  movement: "waiting",
};

function centreOfHand(hand: NormalizedLandmark[]) {
  const stablePalmPoints = [0, 5, 9, 13, 17].map((index) => hand[index]);
  return {
    x: stablePalmPoints.reduce((sum, point) => sum + point.x, 0) / stablePalmPoints.length,
    y: stablePalmPoints.reduce((sum, point) => sum + point.y, 0) / stablePalmPoints.length,
  };
}

function analyse(sign: Sign, landmarks: NormalizedLandmark[][], history: MotionFrame[]): Guidance {
  if (landmarks.length === 0) {
    return {
      message: "No hands detected yet.",
      detail: "Move your hands into the camera and keep your upper body visible.",
      score: 0,
      hands: "adjust",
      position: "waiting",
      movement: "waiting",
    };
  }

  const centres = landmarks.map(centreOfHand);
  const x = centres.reduce((sum, point) => sum + point.x, 0) / centres.length;
  const y = centres.reduce((sum, point) => sum + point.y, 0) / centres.length;
  const enoughHands = landmarks.length >= sign.practice.expectedHands;
  const verticalOk = y >= 0.12 && y <= 0.78;
  const horizontalOk = x >= 0.16 && x <= 0.84;
  const positionOk = verticalOk && horizontalOk;
  const usable = history.filter((frame) => frame.hands >= sign.practice.expectedHands);
  const duration = usable.length > 1 ? usable.at(-1)!.at - usable[0].at : 0;

  let movement: CheckState = "waiting";
  let motionDetail = "Begin the movement shown in the verified reference.";

  if (sign.practice.motion === "in-place") {
    motionDetail =
      "This movement needs handshape or depth context, so the camera does not score it.";
  } else if (enoughHands && usable.length >= 5 && duration >= 550) {
    const first = usable[0];
    const xs = usable.map((frame) => frame.x);
    const ys = usable.map((frame) => frame.y);
    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    const upAmount = first.y - Math.min(...ys);
    const downAmount = Math.max(...ys) - first.y;

    if (sign.practice.motion === "up") {
      if (downAmount > 0.055 && downAmount > upAmount + 0.015) {
        movement = "adjust";
        motionDetail = "Movement direction reversed — move upward, as shown in the reference.";
      } else if (upAmount > 0.045) {
        movement = "pass";
        motionDetail = "Upward movement detected.";
      } else {
        motionDetail = "Make the upward movement a little clearer.";
      }
    }

    if (sign.practice.motion === "down") {
      if (upAmount > 0.055 && upAmount > downAmount + 0.015) {
        movement = "adjust";
        motionDetail = "Movement direction reversed — move downward, as shown in the reference.";
      } else if (downAmount > 0.045) {
        movement = "pass";
        motionDetail = "Downward movement detected.";
      } else {
        motionDetail = "Make the downward movement a little clearer.";
      }
    }

    if (sign.practice.motion === "outward") {
      const separations = usable
        .map((frame) => frame.separation)
        .filter((value): value is number => value !== undefined);
      if (separations.length >= 5) {
        const firstSeparation = separations[0];
        const outwardAmount = Math.max(...separations) - firstSeparation;
        const inwardAmount = firstSeparation - Math.min(...separations);
        if (inwardAmount > 0.055 && inwardAmount > outwardAmount + 0.015) {
          movement = "adjust";
          motionDetail = "Movement direction reversed — move both hands outward.";
        } else if (outwardAmount > 0.045) {
          movement = "pass";
          motionDetail = "Outward movement detected.";
        } else {
          motionDetail = "Move both hands farther apart to make the outward motion clear.";
        }
      }
    }

    if (sign.practice.motion === "side-to-side") {
      if (yRange > 0.06 && yRange > xRange * 1.25) {
        movement = "adjust";
        motionDetail = "Move side to side, not up and down.";
      } else if (xRange > 0.055) {
        movement = "pass";
        motionDetail = "Side-to-side movement detected.";
      } else {
        motionDetail = "Make the side-to-side movement a little clearer.";
      }
    }

    if (sign.practice.motion === "circular") {
      let pathLength = 0;
      for (let index = 1; index < usable.length; index += 1) {
        pathLength += Math.hypot(
          usable[index].x - usable[index - 1].x,
          usable[index].y - usable[index - 1].y,
        );
      }
      if (xRange > 0.035 && yRange > 0.035 && pathLength > 0.16) {
        movement = "pass";
        motionDetail = "Curved movement detected — compare the handshape with the reference.";
      } else {
        motionDetail = "Trace a clearer circle instead of moving in a short straight line.";
      }
    }
  }

  const movementIsScored = sign.practice.motion !== "in-place";
  const possiblePoints = movementIsScored ? 100 : 80;
  let points = 30;
  if (enoughHands) points += 25;
  if (verticalOk) points += 15;
  if (horizontalOk) points += 10;
  if (movementIsScored && movement === "pass") points += 20;
  const score = Math.round((points / possiblePoints) * 100);

  if (!enoughHands) {
    return {
      message: `Only ${landmarks.length} hand${landmarks.length === 1 ? " is" : "s are"} visible.`,
      detail: `Keep both hands in frame for ${sign.name}.`,
      score,
      hands: "adjust",
      position: positionOk ? "pass" : "adjust",
      movement: "waiting",
    };
  }
  if (y > 0.78) {
    return {
      message: "Your hands are too low.",
      detail: "Raise them into the signing space, around chest to face height.",
      score,
      hands: "pass",
      position: "adjust",
      movement,
    };
  }
  if (y < 0.12) {
    return {
      message: "Your hands are too high.",
      detail: "Lower them slightly so the full movement stays visible.",
      score,
      hands: "pass",
      position: "adjust",
      movement,
    };
  }
  if (!horizontalOk) {
    return {
      message: "Bring your hands toward the centre.",
      detail: "Leave enough space around your hands for the full movement.",
      score,
      hands: "pass",
      position: "adjust",
      movement,
    };
  }
  if (movement === "adjust") {
    return {
      message: motionDetail,
      detail: "Reset the sample, then copy the verified animation once more.",
      score,
      hands: "pass",
      position: "pass",
      movement,
    };
  }
  if (movement === "waiting" && movementIsScored) {
    return {
      message: "Good position — now complete the movement.",
      detail: motionDetail,
      score,
      hands: "pass",
      position: "pass",
      movement,
    };
  }

  return {
    message: "Good framing and observable movement.",
    detail:
      sign.practice.motion === "in-place"
        ? motionDetail
        : "Now compare your handshape and orientation carefully with the verified reference.",
    score,
    hands: "pass",
    position: "pass",
    movement,
  };
}

function drawHands(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  hands: NormalizedLandmark[][],
) {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.lineWidth = Math.max(3, canvas.width / 240);
  context.strokeStyle = "#f9c846";
  context.fillStyle = "#39d6b1";
  context.shadowColor = "rgba(15, 35, 50, 0.75)";
  context.shadowBlur = 4;

  hands.forEach((hand) => {
    HAND_CONNECTIONS.forEach(([start, end]) => {
      context.beginPath();
      context.moveTo(hand[start].x * canvas.width, hand[start].y * canvas.height);
      context.lineTo(hand[end].x * canvas.width, hand[end].y * canvas.height);
      context.stroke();
    });
    hand.forEach((point) => {
      context.beginPath();
      context.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        Math.max(3, canvas.width / 180),
        0,
        Math.PI * 2,
      );
      context.fill();
    });
  });
  context.restore();
}

function CheckChip({ label, state }: { label: string; state: CheckState }) {
  return (
    <span
      className={cn(
        "hud-chip gap-1.5 text-xs",
        state === "pass" && "border-success bg-success/15",
        state === "adjust" && "border-danger bg-danger/10",
      )}
    >
      {state === "pass" ? (
        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
      ) : state === "adjust" ? (
        <TriangleAlert className="h-4 w-4 text-danger" aria-hidden />
      ) : (
        <span className="h-2.5 w-2.5 rounded-full bg-ink/30" aria-hidden />
      )}
      {label}
    </span>
  );
}

export function GuidedPractice({ sign, showConfidence }: { sign: Sign; showConfidence: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const historyRef = useRef<MotionFrame[]>([]);
  const lastVideoTimeRef = useRef(-1);
  const lastInferenceRef = useRef(0);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [error, setError] = useState("");
  const [guidance, setGuidance] = useState<Guidance>(WAITING_GUIDANCE);

  const stopCamera = (updateState = true) => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    historyRef.current = [];
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    if (updateState) {
      setCameraState("idle");
      setGuidance(WAITING_GUIDANCE);
      setError("");
    }
  };

  useEffect(() => () => stopCamera(false), []);

  const resetMotion = () => {
    historyRef.current = [];
    setGuidance((current) => ({
      ...current,
      message: "Motion sample reset.",
      detail: "Return to the starting position, then copy the verified animation.",
      movement: "waiting",
    }));
  };

  const runDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker) return;

    const now = performance.now();
    if (
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.currentTime !== lastVideoTimeRef.current &&
      now - lastInferenceRef.current >= 66
    ) {
      lastVideoTimeRef.current = video.currentTime;
      lastInferenceRef.current = now;
      try {
        const result = landmarker.detectForVideo(video, now);
        drawHands(canvas, video, result.landmarks);
        const centres = result.landmarks.map(centreOfHand);
        const currentFrame: MotionFrame | null = centres.length
          ? {
              at: now,
              hands: centres.length,
              x: centres.reduce((sum, point) => sum + point.x, 0) / centres.length,
              y: centres.reduce((sum, point) => sum + point.y, 0) / centres.length,
              separation:
                centres.length >= 2
                  ? Math.hypot(centres[0].x - centres[1].x, centres[0].y - centres[1].y)
                  : undefined,
            }
          : null;
        if (currentFrame) historyRef.current.push(currentFrame);
        historyRef.current = historyRef.current.filter((frame) => now - frame.at <= 1400);
        setGuidance(analyse(sign, result.landmarks, historyRef.current));
      } catch {
        stopCamera(false);
        setError("The camera frame could not be analysed. Stop the camera and try again.");
        setCameraState("error");
        return;
      }
    }
    animationRef.current = requestAnimationFrame(runDetection);
  };

  const enableCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser does not provide webcam access. Try a current Chrome, Edge, or Safari browser.",
      );
      setCameraState("error");
      return;
    }

    setError("");
    setCameraState("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera view unavailable");
      video.srcObject = stream;
      await video.play();

      setCameraState("model");
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
      const options = {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" as const },
        runningMode: "VIDEO" as const,
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };
      try {
        landmarkerRef.current = await HandLandmarker.createFromOptions(fileset, options);
      } catch {
        landmarkerRef.current = await HandLandmarker.createFromOptions(fileset, {
          ...options,
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
        });
      }
      historyRef.current = [];
      lastVideoTimeRef.current = -1;
      setCameraState("live");
      setGuidance({
        ...WAITING_GUIDANCE,
        message: "Camera ready — place your hands in frame.",
        detail: `Use ${sign.practice.expectedHands === 2 ? "both hands" : "one hand"} and copy the verified animation.`,
      });
      animationRef.current = requestAnimationFrame(runDetection);
    } catch (caught) {
      stopCamera(false);
      const name = caught instanceof DOMException ? caught.name : "";
      setError(
        name === "NotAllowedError"
          ? "Webcam permission was denied. Allow camera access in your browser settings, then try again."
          : name === "NotFoundError"
            ? "No webcam was found on this device."
            : "The webcam or hand-tracking model could not start. Check your connection and try again.",
      );
      setCameraState("error");
    }
  };

  const loading = cameraState === "permission" || cameraState === "model";
  const isLive = cameraState === "live";

  return (
    <section className="space-y-3" aria-labelledby="guided-practice-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-xs font-black uppercase tracking-[0.18em] text-magic">
            Guided practice
          </p>
          <h3 id="guided-practice-title" className="font-display text-2xl font-black text-ink">
            Copy {sign.name} side by side
          </h3>
        </div>
        <span className="hud-chip text-xs">
          <ShieldCheck className="h-4 w-4 text-success" aria-hidden /> On-device camera
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border-[3px] border-ink bg-ink text-cream shadow-[0_5px_0_var(--ink)]">
          <div className="flex items-center justify-between gap-2 border-b-2 border-cream/20 px-3 py-2">
            <span className="font-display text-xs font-black uppercase tracking-widest">
              Your webcam
            </span>
            {isLive && (
              <span className="rounded-full bg-danger px-2 py-0.5 text-[0.65rem] font-black uppercase">
                Live
              </span>
            )}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[oklch(0.19_0.035_235)]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "h-full w-full -scale-x-100 object-cover",
                !isLive && !loading && "invisible",
              )}
              aria-label="Live mirrored webcam view"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            />
            {!isLive && (
              <div className="absolute inset-0 grid place-items-center p-5 text-center">
                <div className="max-w-sm space-y-3">
                  {loading ? (
                    <LoaderCircle
                      className="mx-auto h-12 w-12 animate-spin text-target"
                      aria-hidden
                    />
                  ) : (
                    <Camera className="mx-auto h-14 w-14 text-target" aria-hidden />
                  )}
                  <p className="font-display text-lg font-black">
                    {cameraState === "permission"
                      ? "Waiting for webcam permission…"
                      : cameraState === "model"
                        ? "Loading hand tracking…"
                        : "Your camera starts only when you choose"}
                  </p>
                  {cameraState === "idle" || cameraState === "error" ? (
                    <GameButton tone="play" onClick={enableCamera}>
                      <Camera className="h-4 w-4" aria-hidden /> Enable webcam
                    </GameButton>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border-[3px] border-success bg-white shadow-[0_5px_0_var(--ink)]">
          <div className="flex items-center justify-between gap-2 border-b-2 border-success/30 bg-success/10 px-3 py-2">
            <span className="font-display text-xs font-black uppercase tracking-widest text-ink">
              Verified SgSL animation
            </span>
            <a
              href={sign.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-black text-magic underline"
            >
              Source <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
          <div className="aspect-[4/3] bg-white">
            {sign.referenceImage ? (
              <img
                src={sign.referenceImage}
                alt={`${sign.name} verified animation from the ${sign.referenceLabel}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-[center_18%]"
              />
            ) : (
              <a
                href={sign.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-full place-items-center p-6 text-center font-black text-magic"
              >
                Open the verified {sign.referenceLabel} lesson
              </a>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border-2 border-danger bg-danger/10 p-3 text-sm font-bold text-ink"
          role="alert"
        >
          <TriangleAlert className="mr-2 inline h-5 w-5 text-danger" aria-hidden />
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div
          className={cn(
            "rounded-2xl border-[3px] border-ink p-4",
            guidance.hands === "adjust" ||
              guidance.position === "adjust" ||
              guidance.movement === "adjust"
              ? "bg-target/25"
              : "bg-cream",
          )}
          aria-live="polite"
        >
          <div className="flex gap-3">
            <Hand className="mt-0.5 h-7 w-7 shrink-0 text-magic" aria-hidden />
            <div>
              <p className="font-display text-lg font-black text-ink">{guidance.message}</p>
              <p className="mt-1 text-sm font-semibold text-ink/75">{guidance.detail}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <CheckChip
              label={`${sign.practice.expectedHands} hand${sign.practice.expectedHands === 2 ? "s" : ""}`}
              state={guidance.hands}
            />
            <CheckChip label="Position" state={guidance.position} />
            <CheckChip label="2D movement" state={guidance.movement} />
          </div>
        </div>

        <div className="rounded-2xl border-[3px] border-ink bg-cream p-4">
          {showConfidence && (
            <Meter
              value={guidance.score}
              label="Camera guidance"
              tone={guidance.score >= 75 ? "success" : "target"}
            />
          )}
          <div className="mt-3 flex flex-col gap-2">
            <GameButton tone="neutral" size="sm" onClick={resetMotion} disabled={!isLive}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Reset motion sample
            </GameButton>
            {isLive && (
              <GameButton tone="ghost" size="sm" onClick={() => stopCamera()}>
                Stop webcam
              </GameButton>
            )}
          </div>
        </div>
      </div>

      <p className="rounded-xl border-2 border-magic/30 bg-magic/10 px-3 py-2 text-xs font-semibold text-ink/75">
        <strong>Practice guidance, not SgSL certification:</strong> the landmark model checks hand
        visibility, framing, and broad 2D motion. It cannot reliably judge exact handshape, palm
        orientation, facial expression, contact, or depth. Use the verified animation for those
        details.
      </p>
    </section>
  );
}
