import type { PlaceholderVariant } from "@/lib/content/types";

/**
 * Original abstract artwork, drawn as inline SVG.
 *
 * This is what renders wherever the client has not supplied an approved
 * image. It is deliberately NOT a photograph and never depicts a person: it
 * holds the correct composition and aspect ratio so a real asset can be
 * dropped in later without redesigning the section.
 *
 * Two treatments, because a release sleeve and a stage photograph should not
 * look like the same asset:
 *   stage / crowd / portrait -> lit-stage composition (beams, truss, crowd line)
 *   artwork                  -> hard-edged graphic sleeve (fields, disc, rules)
 *
 * Every instance is deterministic from `seed`, so the same release or video
 * gets the same artwork on the server and the client (no hydration mismatch)
 * and across rebuilds.
 */

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAGE = { width: 1600, height: 900 };
const SLEEVE = { width: 1000, height: 1000 };

type Props = {
  variant: PlaceholderVariant;
  seed: string;
  className?: string;
};

export function PlaceholderArt({ variant, seed, className }: Props) {
  return variant === "artwork" ? (
    <SleeveArt seed={seed} className={className} />
  ) : (
    <StageArt variant={variant} seed={seed} className={className} />
  );
}

/* ------------------------------------------------------------------ stage */

function StageArt({ variant, seed, className }: { variant: PlaceholderVariant; seed: string; className?: string }) {
  const random = makeRandom(`stage:${variant}:${seed}`);
  const uid = `st-${hashSeed(`stage:${variant}:${seed}`).toString(36)}`;

  const originX = variant === "portrait" ? 0.5 : 0.34 + random() * 0.32;
  const beamCount = 7;

  const beams = Array.from({ length: beamCount }, (_, index) => {
    const spread = (index - (beamCount - 1) / 2) / beamCount;
    const originPx = originX * STAGE.width + (random() - 0.5) * 120;
    const footCenter = originPx + spread * STAGE.width * (1.5 + random() * 0.7);
    const footWidth = 60 + random() * 190;
    return {
      key: `beam-${index}`,
      points: [
        `${originPx - 16},-40`,
        `${originPx + 16},-40`,
        `${footCenter + footWidth},${STAGE.height + 40}`,
        `${footCenter - footWidth},${STAGE.height + 40}`,
      ].join(" "),
      opacity: 0.06 + random() * 0.22,
      warm: random() > 0.62,
    };
  });

  // The crowd is a band of overlapping soft forms, not a jagged mountain line.
  const crowdBaseline = STAGE.height * (variant === "crowd" ? 0.7 : 0.86);
  const crowd = Array.from({ length: 46 }, (_, index) => ({
    key: `head-${index}`,
    cx: (index / 45) * (STAGE.width + 80) - 40 + (random() - 0.5) * 26,
    cy: crowdBaseline + random() * 26,
    r: 20 + random() * 22,
  }));

  const hazeBands = Array.from({ length: 3 }, (_, index) => ({
    key: `haze-${index}`,
    y: STAGE.height * (0.42 + index * 0.16) + random() * 40,
    height: 40 + random() * 120,
    opacity: 0.04 + random() * 0.05,
  }));

  return (
    <svg
      className={className}
      viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#12100f" />
          <stop offset="55%" stopColor="#191512" />
          <stop offset="100%" stopColor="#0b0a09" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx={originX} cy="0.12" r="0.72">
          <stop offset="0%" stopColor="#ff5738" stopOpacity="0.42" />
          <stop offset="42%" stopColor="#ff7a4a" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#ff5738" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-beam-cool`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f0e9" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f3f0e9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-beam-warm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5738" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ff5738" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-core`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6ef" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#ff9a72" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff5738" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${uid}-vignette`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={STAGE.width} height={STAGE.height} fill={`url(#${uid}-ground)`} />
      <rect width={STAGE.width} height={STAGE.height} fill={`url(#${uid}-glow)`} />

      {beams.map((beam) => (
        <polygon
          key={beam.key}
          points={beam.points}
          fill={`url(#${uid}-beam-${beam.warm ? "warm" : "cool"})`}
          opacity={beam.opacity}
        />
      ))}

      {hazeBands.map((band) => (
        <rect key={band.key} x="0" y={band.y} width={STAGE.width} height={band.height} fill="#f3f0e9" opacity={band.opacity} />
      ))}

      <ellipse
        cx={originX * STAGE.width}
        cy={STAGE.height * 0.07}
        rx={STAGE.width * 0.26}
        ry={STAGE.height * 0.14}
        fill={`url(#${uid}-core)`}
      />

      {/* Lighting truss: a hard horizontal that gives the frame architecture. */}
      <rect x="0" y={STAGE.height * 0.075} width={STAGE.width} height="7" fill="#050505" opacity="0.85" />
      {Array.from({ length: 9 }, (_, index) => (
        <rect
          key={`rig-${index}`}
          x={(index + 0.5) * (STAGE.width / 9) - 5}
          y={STAGE.height * 0.075}
          width="10"
          height={26 + (index % 3) * 14}
          fill="#050505"
          opacity="0.8"
        />
      ))}

      <g fill="#070706" opacity="0.95">
        <rect x="0" y={crowdBaseline + 10} width={STAGE.width} height={STAGE.height} />
        {crowd.map((head) => (
          <circle key={head.key} cx={head.cx} cy={head.cy} r={head.r} />
        ))}
      </g>

      <rect x="0" y={STAGE.height * 0.58} width={STAGE.width} height={STAGE.height * 0.42} fill={`url(#${uid}-floor)`} />
      <rect width={STAGE.width} height={STAGE.height} fill={`url(#${uid}-vignette)`} />
    </svg>
  );
}

/* ----------------------------------------------------------------- sleeve */

const SLEEVE_INK = "#0c0b0a";
const SLEEVE_PAPER = "#f3f0e9";
const SLEEVE_SIGNAL = "#ff5738";
const SLEEVE_DEEP = "#8f2414";

/**
 * Four sleeve archetypes, chosen by seed, so a catalogue grid does not read as
 * the same image repeated. Everything is flat and hard-edged: these are
 * graphic stand-ins for artwork, not attempts at photography.
 */
function SleeveArt({ seed, className }: { seed: string; className?: string }) {
  const random = makeRandom(`sleeve:${seed}`);
  const uid = `sl-${hashSeed(`sleeve:${seed}`).toString(36)}`;
  // Chosen from an independent hash rather than the first draw of the shared
  // stream, which clustered several catalogue entries on the same archetype.
  const archetype = hashSeed(`arch:${seed}`) % 4;
  const inverted = hashSeed(`inv:${seed}`) % 3 === 0;
  const mirrored = hashSeed(`mir:${seed}`) % 2 === 0;

  const ground = inverted ? SLEEVE_PAPER : SLEEVE_INK;
  const mark = inverted ? SLEEVE_INK : SLEEVE_PAPER;
  const accent = random() > 0.4 ? SLEEVE_SIGNAL : SLEEVE_DEEP;
  const angle = -40 + random() * 80;

  const bands = Array.from({ length: 3 + Math.floor(random() * 5) }, (_, index) => ({
    key: `band-${index}`,
    y: SLEEVE.height * (0.06 + index * 0.13) + random() * 40,
    height: 8 + random() * 74,
    fill: random() > 0.55 ? accent : mark,
    opacity: 0.35 + random() * 0.65,
  }));

  return (
    <svg
      className={className}
      viewBox={`0 0 ${SLEEVE.width} ${SLEEVE.height}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect width={SLEEVE.width} height={SLEEVE.height} />
        </clipPath>
      </defs>

      <rect width={SLEEVE.width} height={SLEEVE.height} fill={ground} />

      <g clipPath={`url(#${uid}-clip)`}>
        {archetype === 0 ? (
          /* Disc: flat circle with concentric rules and one crossing band. */
          <>
            <rect
              transform={`rotate(${angle} ${SLEEVE.width / 2} ${SLEEVE.height / 2})`}
              x={-SLEEVE.width}
              y={SLEEVE.height * (0.3 + random() * 0.3)}
              width={SLEEVE.width * 3}
              height={26 + random() * 40}
              fill={mark}
              opacity="0.8"
            />
            <circle
              cx={SLEEVE.width * (0.36 + random() * 0.28)}
              cy={SLEEVE.height * (0.36 + random() * 0.26)}
              r={SLEEVE.width * (0.24 + random() * 0.1)}
              fill={accent}
            />
            {Array.from({ length: 5 }, (_, index) => (
              <circle
                key={`ring-${index}`}
                cx={SLEEVE.width * 0.5}
                cy={SLEEVE.height * 0.5}
                r={SLEEVE.width * (0.32 + index * 0.09)}
                fill="none"
                stroke={mark}
                strokeWidth="2"
                opacity={0.16 - index * 0.025}
              />
            ))}
          </>
        ) : archetype === 1 ? (
          /* Bands: pure horizontal rhythm, rotated off-axis. */
          <g transform={`rotate(${angle} ${SLEEVE.width / 2} ${SLEEVE.height / 2})`}>
            {bands.map((band) => (
              <rect
                key={band.key}
                x={-SLEEVE.width}
                y={band.y}
                width={SLEEVE.width * 3}
                height={band.height}
                fill={band.fill}
                opacity={band.opacity}
              />
            ))}
          </g>
        ) : archetype === 2 ? (
          /* Arc: a single large form rising off the bottom edge. */
          <>
            <path
              d={`M -60 ${SLEEVE.height + 10} A ${SLEEVE.width * 0.62} ${SLEEVE.height * (0.5 + random() * 0.24)} 0 0 1 ${
                SLEEVE.width + 60
              } ${SLEEVE.height + 10} Z`}
              fill={accent}
            />
            <rect
              x="0"
              y={SLEEVE.height * (0.16 + random() * 0.14)}
              width={SLEEVE.width}
              height={6 + random() * 10}
              fill={mark}
              opacity="0.85"
            />
            <circle
              cx={SLEEVE.width * (0.2 + random() * 0.6)}
              cy={SLEEVE.height * 0.2}
              r={SLEEVE.width * 0.055}
              fill={mark}
              opacity="0.9"
            />
          </>
        ) : (
          /* Split: two hard fields divided by a steep diagonal. */
          <>
            <polygon
              transform={mirrored ? `scale(-1 1) translate(${-SLEEVE.width} 0)` : undefined}
              points={`0,${SLEEVE.height} 0,${SLEEVE.height * (0.2 + random() * 0.3)} ${SLEEVE.width},${
                SLEEVE.height * (0.55 + random() * 0.3)
              } ${SLEEVE.width},${SLEEVE.height}`}
              fill={accent}
            />
            <polygon
              points={`0,0 ${SLEEVE.width},0 ${SLEEVE.width},${SLEEVE.height * 0.16} 0,${SLEEVE.height * 0.42}`}
              fill={mark}
              opacity="0.14"
            />
            <circle
              cx={SLEEVE.width * (0.6 + random() * 0.24)}
              cy={SLEEVE.height * (0.2 + random() * 0.14)}
              r={SLEEVE.width * (0.09 + random() * 0.07)}
              fill={mark}
              opacity="0.92"
            />
          </>
        )}
      </g>
    </svg>
  );
}
