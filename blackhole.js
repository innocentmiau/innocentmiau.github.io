/* Black hole background.

   A port of Assets/Shaders/Skybox/BlackHoleSky.shader (plus SpaceCommon.hlsl)
   from Unity/HLSL to WebGL. Every view ray is integrated as a small geodesic:
   it bends toward the hole (accel ~ 1/r^2), rays that fall through the horizon
   are captured (black shadow), and each crossing of the tilted accretion-disk
   plane inside the annulus accumulates emissive colour front-to-back.

   Two things differ from the Unity original, both deliberate:

   1. The sky is sampled as an EQUIRECTANGULAR texture rather than a cubemap.
      OrionNebula2.png was already a 2:1 panorama that Unity was converting to
      a cube at import, so sampling it directly skips the conversion and six
      faces. It ships here as a 53 KB WebP (the source PNG was 6.6 MB - PNG is
      simply the wrong container for a photographic nebula).

   2. There is no skybox mesh. The scene is one full-screen quad and the view
      ray is rebuilt in the fragment shader from a camera basis passed in as
      uniforms, so _Rotation and the scroll animation both collapse into that
      basis instead of costing anything in the shader.

   The planet/moon arrays that SpaceSkyController used to upload live in CONFIG
   below - that script is attached to nothing in the Unity project, so the two
   bodies were never serialised and had to be re-authored here. Tune them in
   this file; every value maps 1:1 onto the shader uniform of the same name. */

const CONFIG = {
  sky: 'nebula.webp',

  /* Resolution. This shader is fragment-bound, so pixel count IS the
     performance story - which is exactly why a fixed scale is wrong: the same
     number is wasteful on a fast GPU and unusable on a slow one. The renderer
     starts at `start` and walks up toward `max` while the frame budget allows,
     backs off when it does not, then settles after `maxChanges` adjustments so
     it is not reallocating the drawing buffer for the life of the page.
     `max` is additionally capped at the display's own devicePixelRatio. */
  quality: {
    min: 0.5,
    max: 1.5,
    start: 0.75,
    targetFps: 58,
    step: 0.125,
    samples: 45,
    maxChanges: 12
  },

  /* Camera. The basis is built aimed at the hole, then swung away from it by
     these offsets so the hole sits off-centre rather than dead ahead.
     Radians. Positive pitch looks up, which pushes the hole DOWN the frame -
     hence scrollPitch being negative: as the page scrolls the camera tips
     down, so the hole climbs out of frame while the viewer descends. */
  fov: 55,
  yaw: -0.28,
  pitch: 0.20,
  scrollPitch: -0.40,
  scrollRecede: 0.85,   // how much _Distance grows over a full page scroll
  scrollDamp: 0.075,    // raw scrollY judders on trackpads; this smooths it

  /* --- everything below is straight out of BlackHoleSky.mat --- */

  exposure: 1.12,
  /* Purely a web concern, with no counterpart in the .mat: the Unity sky is a
     skybox you look AT, this one sits behind body text that was contrasted
     against #05070d. Multiplied into exposure. Set to 1 to see the material's
     own brightness. */
  dim: 0.42,
  rotation: 33,                       // degrees, folded into the camera basis

  holeDir: [0.02, -0.03, 0.05],
  distance: 30,
  radius: 0.47,
  bend: 2.58,
  steps: 128,                         // was 400 in Unity; see the early-out note
  stepLen: 0.375,
  earlyOut: true,

  diskNormal: [0.04, 0.34, 0.1],
  diskInner: 2.174,
  diskOuter: 12.18,
  diskBrightness: 3.94,
  doppler: 0,
  turbScale: 1.429,
  spinSpeed: 0.59,
  diskColorHot: [1, 0.98, 0.93],
  diskColorMid: [1, 0.58, 0.24],
  diskColorCool: [0.85, 0.22, 0.06],

  photonRadius: 1.433,
  photonWidth: 0.111,
  photonBrightness: 1.314,

  shadowSize: 2.62,
  shadowSoftness: 1,

  distortStrength: 0.21,
  distortFalloff: 20,

  cubeTint: [1, 1, 1],
  cubeIntensity: 0.925,
  eatSpace: true,
  eatFalloff: 5,
  spaceColor: [0, 0, 0],
  nebulaColor: [0.05, 0.12, 0.14],
  nebulaScale: 7.2,
  nebulaIntensity: 4,
  starDensity: 243,
  starBrightness: 2.97,
  /* The .mat had this at 6.69, which is ~6.7 Hz once StarLayer multiplies it
     by 2*pi - a strobe. Fine in a game you look past, far too busy behind
     text you are trying to read. */
  twinkleSpeed: 0.45,

  brightStars: true,
  brightStarDensity: 8.77,
  brightStarIntensity: 1.4,
  brightStarSize: 0.69,
  brightSpikeLength: 0.94,
  brightStarClearAngle: 23.8,
  brightStarClearSoftness: 15,
  brightTwinkle: true,
  brightTwinkleMin: 0.85,
  brightTwinkleMax: 1.6,
  brightTwinkleDuration: 1.2,
  brightTwinkleWait: 2.5,
  brightTwinkleVariation: 0.5,

  lightDir: [-6.4, 0.13, 2.36],
  litByHole: true,
  litByHoleTint: [1, 0.62, 0.3],

  /* Planets. `screen` places a body by eye: [right, up] in degrees away from
     where the camera points at rest, so [22, 9] is up and to the right of the
     hole. Colours echo the CSS planets this canvas replaces - one temperate
     blue, one rust Mars - so the background keeps the palette the rest of the
     site was built around. */
  bodies: [
    {
      screen: [23, 8], sizeDeg: 2.6,
      colorA: [0.16, 0.29, 0.48], surfaceScale: 2.4,
      colorB: [0.30, 0.46, 0.34], cloudAmount: 0.62,
      atmo: [0.42, 0.62, 1.0], atmoStrength: 1.0,
      lens: 0.35, litByHole: 0.55, devoured: 0.6,
      spinAxis: [0.08, 1, 0.12], spinSpeed: 0.035,
      glow: [0.45, 0.66, 1.0], glowStrength: 0.0,
      ringOpacity: 0
    },
    {
      screen: [-19, -13], sizeDeg: 1.5,
      colorA: [0.42, 0.17, 0.09], surfaceScale: 3.1,
      colorB: [0.62, 0.31, 0.16], cloudAmount: 0.12,
      atmo: [0.9, 0.45, 0.28], atmoStrength: 0.45,
      lens: 0.5, litByHole: 0.7, devoured: 0.75,
      spinAxis: [0.2, 1, 0], spinSpeed: 0.05,
      glow: [0, 0, 0], glowStrength: 0,
      ringOpacity: 0
    }
  ],

  /* Moons draw from one shared pool and name their owner by index, exactly as
     the _MoonOrbit.x layout did in the Unity version. */
  moons: [
    { body: 0, orbitRadius: 3.4, orbitSpeed: 0.22, size: 0.27,
      plane: [0.15, 1, 0.3], startAngle: 0.8, color: [0.62, 0.6, 0.58], noiseScale: 3.0 }
  ]
};

const MAX_BODIES = 4;
const MAX_MOONS  = 4;

const fragmentShader = `
precision highp float;

#define MAX_BODIES ${MAX_BODIES}
#define MAX_MOONS ${MAX_MOONS}
#define MAX_STEPS 160
#define SPACE_BODY_DIST 50.0
#define saturate(x) clamp(x, 0.0, 1.0)

varying vec2 vUv;

uniform sampler2D uSky;
uniform float uTime, uAspect, uTanHalfFov;
uniform vec3  uCamRight, uCamUp, uCamFwd;

uniform float uExposure;
uniform vec3  uHoleDir;
uniform float uDistance, uRadius, uBend, uStepLen, uEarlyOut;
uniform int   uSteps;

uniform vec3  uDiskNormal, uDiskHot, uDiskMid, uDiskCool;
uniform float uDiskInner, uDiskOuter, uDiskBrightness, uDoppler, uTurbScale, uSpinSpeed;
uniform float uPhotonRadius, uPhotonWidth, uPhotonBrightness;
uniform float uShadowSize, uShadowSoftness;
uniform float uDistortStrength, uDistortFalloff;

uniform vec3  uCubeTint, uSpaceColor, uNebulaColor;
uniform float uCubeIntensity, uEatSpace, uEatFalloff;
uniform float uNebulaScale, uNebulaIntensity, uStarDensity, uStarBrightness, uTwinkleSpeed;

uniform float uBrightStarsEnabled, uBrightStarDensity, uBrightStarIntensity;
uniform float uBrightStarSize, uBrightSpikeLength;
uniform float uBrightStarClearAngle, uBrightStarClearSoftness;
uniform float uBrightTwinkleEnabled, uBrightTwinkleMin, uBrightTwinkleMax;
uniform float uBrightTwinkleDuration, uBrightTwinkleWait, uBrightTwinkleVariation;

uniform vec3  uLightDir, uLitByHoleTint;
uniform float uLitByHole;
uniform int   uBodyCount, uMoonCount;
uniform vec4  uBodyDirSize[MAX_BODIES];
uniform vec4  uBodyColorA[MAX_BODIES];
uniform vec4  uBodyColorB[MAX_BODIES];
uniform vec4  uBodyAtmo[MAX_BODIES];
uniform vec4  uBodyRingNormal[MAX_BODIES];
uniform vec4  uBodyRingColor[MAX_BODIES];
uniform vec4  uBodyRingParams[MAX_BODIES];
uniform vec4  uBodyGlowColor[MAX_BODIES];
uniform vec4  uBodyLens[MAX_BODIES];
uniform vec4  uBodyLight[MAX_BODIES];
uniform vec4  uBodySpin[MAX_BODIES];
uniform vec4  uMoonOrbit[MAX_MOONS];
uniform vec4  uMoonPlane[MAX_MOONS];
uniform vec4  uMoonColor[MAX_MOONS];

/* ---------- SpaceCommon.hlsl ---------- */

float Hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 Hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float Noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  // Quintic: C2 continuous, so the lattice leaves no crease lines when it is
  // stretched or drifted.
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float n000 = Hash13(i + vec3(0.0, 0.0, 0.0));
  float n100 = Hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = Hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = Hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = Hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = Hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = Hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = Hash13(i + vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);

  return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);
}

float Fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * Noise3(p);
    p = p * 2.17 + 19.19;
    amplitude *= 0.5;
  }
  return value;
}

vec3 StarLayer(vec3 dir, float density, float time, float twinkleSpeed) {
  vec3 p = dir * density;
  vec3 id = floor(p);
  vec3 f = fract(p);
  vec3 h = Hash33(id);

  float presence = step(h.z, 0.28);
  vec3 starPos = 0.2 + 0.6 * h;
  float dist = length(f - starPos);
  float radius = 0.06 + 0.09 * Hash13(id + 5.1);

  float core = pow(saturate(1.0 - dist / radius), 4.0);
  float halo = pow(saturate(1.0 - dist / (radius * 3.0)), 8.0) * 0.3;
  float twinkle = mix(1.0, 0.5 + 0.5 * sin(time * twinkleSpeed * 6.2832 + h.x * 6.2832), 0.55);
  vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.88, 0.75), h.y);

  return presence * (core + halo) * twinkle * tint;
}

vec3 RotateAroundAxis(vec3 v, vec3 axis, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

struct SphereHit {
  float alpha;   // antialiased disc coverage
  float t;       // ray distance to surface (1e9 when missed)
  vec3  normal;  // surface normal at the hit
};

SphereHit IntersectSphereSoft(vec3 viewDir, vec3 center, float radius, float aa) {
  SphereHit s;
  float dist = max(length(center), 1e-4);
  vec3 centerDir = center / dist;
  float angularRadius = asin(saturate(radius / dist));

  float b = dot(viewDir, center);
  float c = dot(center, center) - radius * radius;
  float h = b * b - c;

  float ang = acos(clamp(dot(viewDir, centerDir), -1.0, 1.0));
  s.alpha = 1.0 - smoothstep(angularRadius - aa, angularRadius + aa, ang);
  s.t = 1e9;
  s.normal = vec3(0.0, 0.0, 1.0);

  if (h > 0.0 && b > 0.0) {
    s.t = b - sqrt(h);
    s.normal = normalize(viewDir * s.t - center);
  } else if (s.alpha > 0.0) {
    s.normal = normalize(viewDir * b - center); // grazing the rim
  }
  return s;
}

SphereHit IntersectBodySoft(vec3 viewDir, vec3 bodyDir, float angularRadius, float aa) {
  return IntersectSphereSoft(viewDir, bodyDir * SPACE_BODY_DIST,
    sin(min(angularRadius, 1.5)) * SPACE_BODY_DIST, aa);
}

vec3 ShadeBodySurface(vec3 normal, vec3 noiseNormal, vec3 viewDir, vec3 lightDir,
                      vec3 colorA, vec3 colorB, vec3 atmoColor, float atmoStrength,
                      float surfaceScale, float cloudAmount) {
  float continents = Fbm(noiseNormal * surfaceScale);
  float clouds = Fbm(noiseNormal * surfaceScale * 1.8 + vec3(9.7, 3.1, 7.7));

  vec3 surf = mix(colorA, colorB, smoothstep(0.42, 0.62, continents));
  surf = mix(surf, vec3(0.85, 0.9, 0.95), smoothstep(0.58, 0.78, clouds) * cloudAmount);

  float ndl = saturate(dot(normal, lightDir));
  vec3 lit = surf * (ndl * 1.3 + 0.012);

  float fresnel = pow(1.0 - saturate(dot(normal, -viewDir)), 3.5);
  lit += atmoColor * fresnel * (ndl * 1.6 + 0.06) * atmoStrength;
  lit += atmoColor * pow(fresnel, 8.0) * ndl * 4.0 * atmoStrength;
  return lit;
}

/* ---------- background sky ---------- */

// Equirectangular lookup, replacing SAMPLE_TEXTURECUBE. The texture is
// uploaded without mipmaps, so the derivative blow-up where atan wraps at the
// seam cannot select a garbage LOD - the usual equirect seam artefact.
vec3 SampleSky(vec3 d) {
  vec2 uv = vec2(atan(d.z, d.x) * 0.15915494 + 0.5,
                 asin(clamp(d.y, -1.0, 1.0)) * 0.31830989 + 0.5);
  return texture2D(uSky, uv).rgb;
}

vec3 BrightStarLayer(vec3 dir, float density, float seed, float spikeLen) {
  vec3 p = dir * density + seed;
  vec3 id = floor(p);
  vec3 h = Hash33(id);
  float presence = step(h.z, 0.09);

  vec3 spos = 0.25 + 0.5 * h;
  float window = saturate(1.0 - 2.0 * length(p - id - spos));
  window *= window;

  vec3 sdir = normalize(id + spos - seed);
  vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), sdir) + vec3(1e-4, 0.0, 0.0));
  vec3 north = cross(sdir, east);
  float du = dot(dir, east);
  float dv = dot(dir, north);
  float d2 = du * du + dv * dv;

  float r = (0.004 + 0.008 * h.x) * uBrightStarSize;
  float core = exp(-d2 / (r * r * 0.3));
  float halo = exp(-d2 / (r * r * 10.0)) * 0.2;

  vec2 dd = vec2(du - dv, du + dv) * 0.70710678;
  float len = max(r * 5.0 * spikeLen, 1e-5);
  float thin = r * r * 0.05;
  float spikes = exp(-abs(dd.x) / len) * exp(-dd.y * dd.y / thin)
               + exp(-abs(dd.y) / len) * exp(-dd.x * dd.x / thin);

  // Shine pulse. The cell hash comes from the star's sky position, so phase
  // and rhythm differ per star and the field never blinks in unison.
  float flare = 1.0;
  if (uBrightTwinkleEnabled > 0.5) {
    float wait = uBrightTwinkleWait * (1.0 + (h.y * 2.0 - 1.0) * uBrightTwinkleVariation);
    float duration = max(uBrightTwinkleDuration, 0.01);
    float period = duration + max(wait, 0.0);
    float t = fract(uTime / period + h.x + h.z * 3.7) * period;
    float pulse = t < duration ? sin(3.14159265 * t / duration) : 0.0;
    flare = mix(uBrightTwinkleMin, uBrightTwinkleMax, pulse * pulse);
  }

  vec3 tint = vec3(0.8 + 0.2 * h.y, 0.87, 1.0 - 0.25 * h.y);
  return presence * window * (core + halo + spikes * 0.35) * tint * flare;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 dir = normalize(uCamFwd
    + uCamRight * ndc.x * uAspect * uTanHalfFov
    + uCamUp * ndc.y * uTanHalfFov);

  vec3 bhDir = normalize(uHoleDir);
  vec3 n = normalize(uDiskNormal);
  vec3 P = bhDir * uDistance;
  float Rs = uRadius;
  float inner = uDiskInner * Rs;
  float outer = uDiskOuter * Rs;

  vec3 pos = vec3(0.0);
  vec3 vel = dir;
  vec3 diskCol = vec3(0.0);
  float diskA = 0.0;
  vec3 diskFrontCol = vec3(0.0);
  float diskFrontA = 0.0;
  float captured = 0.0;
  float minR = 1e9;
  float prevSide = dot(pos - P, n);
  float spin = uTime * uSpinSpeed;

  /* Analytic closest approach of the UNDEFLECTED ray. Past the hole's radius
     of influence the march computes nothing anyone can see: no disk crossing
     is reachable, the shadow and photon ring are nowhere near, and the
     background warp has already smoothstepped to zero - so skip it outright
     instead of integrating 60-odd steps to arrive at the sky.

     This is the difference between marching for the half of the screen facing
     the hole and marching only the cone actually near it. At the material's
     settings the influence radius is ~17 units against a hole distance of 30,
     so every pixel more than ~34 degrees off the hole retires immediately -
     most of the frame. The earlier receding-ray test still handles what's
     left. Exact, not an approximation: the margin below covers the deflected
     ray dipping inside the straight-line estimate. */
  float tca = dot(dir, P);
  float closest = tca > 0.0 ? sqrt(max(dot(P, P) - tca * tca, 0.0)) : length(P);
  float influence = 1.6 * max(outer, (uShadowSize + uDistortFalloff) * Rs);
  bool march = closest <= influence;

  if (!march) minR = closest;

  for (int st = 0; st < MAX_STEPS; st++) {
    if (!march) break;
    if (st >= uSteps) break;

    vec3 toH = P - pos;
    float r = length(toH);
    vec3 g = toH / max(r, 1e-4);
    vel = normalize(vel + g * (uBend * Rs * Rs) / max(r * r, 1e-4) * uStepLen);
    vec3 npos = pos + vel * uStepLen;

    float rnew = length(P - npos);
    minR = min(minR, rnew);
    if (rnew < Rs) { captured = 1.0; break; }

    float newSide = dot(npos - P, n);
    if (prevSide * newSide < 0.0 && diskA < 0.995) {
      float t = prevSide / (prevSide - newSide);
      vec3 X = pos + (npos - pos) * t;
      vec3 rel = X - P;
      float rr = length(rel);
      if (rr > inner && rr < outer) {
        float tt = saturate((rr - inner) / (outer - inner));
        vec3 c = tt < 0.5
          ? mix(uDiskHot, uDiskMid, tt * 2.0)
          : mix(uDiskMid, uDiskCool, (tt - 0.5) * 2.0);
        float edge = saturate((rr - inner) / (0.6 * Rs))
                   * saturate((outer - rr) / (2.5 * Rs));
        float radFall = pow(saturate(1.0 - (rr - inner) / (outer - inner)), 0.55);
        vec3 tp = RotateAroundAxis(rel, n, spin);
        float turb = Fbm(tp * uTurbScale);
        float emis = edge * radFall * (0.35 + 1.2 * turb);
        vec3 azim = normalize(cross(n, rel));
        emis *= (1.0 + uDoppler * dot(azim, -vel));
        emis = max(emis, 0.0) * uDiskBrightness;

        float opa = saturate(emis * 0.6);
        vec3 add = c * min(emis, 4.0);
        diskCol += (1.0 - diskA) * add;
        diskA += (1.0 - diskA) * opa;

        if (dot(X, bhDir) < uDistance) {
          diskFrontCol += (1.0 - diskFrontA) * add;
          diskFrontA += (1.0 - diskFrontA) * opa;
        }
      }
    }
    prevSide = newSide;
    pos = npos;

    // Early-out. Once the ray is outside the disk annulus AND receding from
    // the hole it can never cross the disk again, and at r > 12 Rs the 1/r^2
    // deflection is far below a pixel - so the remaining steps only cost time.
    // Rays not aimed near the hole (most of the screen) leave on step one,
    // which is what lets 128 steps look like the Unity build's 400.
    if (uEarlyOut > 0.5 && rnew > outer && dot(vel, toH) < 0.0) break;
  }

  vec3 bg = vec3(0.0);
  vec3 brightStars = vec3(0.0);
  vec3 fdir = dir;
  float eat = 1.0;

  if (captured < 0.5) {
    // The background is sampled along the LENSED ray, so the hole bends the
    // surroundings. uDistortStrength scales the angular offset between the
    // straight and lensed rays; uDistortFalloff eases it back to a flat sky
    // beyond a halo around the shadow.
    float amt = uDistortStrength;
    if (uDistortFalloff > 0.001) {
      float dStart = uShadowSize * Rs;
      float dEnd = (uShadowSize + uDistortFalloff) * Rs;
      amt *= 1.0 - smoothstep(dStart, dEnd, minR);
    }
    fdir = normalize(dir + (vel - dir) * amt);

    bg = uSpaceColor + SampleSky(fdir) * uCubeTint * uCubeIntensity;
    float neb = Fbm(fdir * uNebulaScale);
    bg += uNebulaColor * saturate((neb - 0.5) * 1.5) * uNebulaIntensity;
    vec3 stars = StarLayer(fdir, uStarDensity, uTime, uTwinkleSpeed);
    stars += StarLayer(fdir + 31.4, uStarDensity * 0.4, uTime, uTwinkleSpeed * 0.7) * 2.0;
    bg += stars * uStarBrightness;

    // Eat Space: fade the background to black in a halo around the shadow, so
    // the magnified region behind the hole is removed rather than smeared into
    // an Einstein ring.
    if (uEatSpace > 0.5) {
      eat = smoothstep(uShadowSize * Rs, (uShadowSize + uEatFalloff) * Rs, minR);
    }
    bg *= eat;

    vec3 manual = dot(uLightDir, uLightDir) > 1e-6 ? normalize(uLightDir) : vec3(0.0, 0.0, 1.0);

    for (int b = 0; b < MAX_BODIES; b++) {
      if (b >= uBodyCount) break;

      vec3 bodyDir = normalize(uBodyDirSize[b].xyz);
      float angSize = uBodyDirSize[b].w;
      vec3 vdir = normalize(mix(dir, fdir, saturate(uBodyLens[b].x)));
      float bodyEat = mix(1.0, eat, saturate(uBodyLens[b].z));

      vec3 lightOverride = uBodyLight[b].xyz;
      vec3 overrideDir = dot(lightOverride, lightOverride) > 1e-6
        ? normalize(lightOverride) : manual;
      vec3 mixedLight = mix(manual, overrideDir, saturate(uBodyLight[b].w));
      vec3 baseLight = dot(mixedLight, mixedLight) > 1e-6 ? normalize(mixedLight) : overrideDir;

      float holeLit = uLitByHole * saturate(uBodyLens[b].y);
      vec3 toHole = P - bodyDir * SPACE_BODY_DIST;
      vec3 holeDirN = dot(toHole, toHole) > 1e-6 ? normalize(toHole) : baseLight;
      vec3 blended = mix(baseLight, holeDirN, holeLit);
      vec3 lightDir = dot(blended, blended) > 1e-6 ? normalize(blended) : holeDirN;
      vec3 lightTint = mix(vec3(1.0), uLitByHoleTint, holeLit);

      SphereHit hit = IntersectBodySoft(vdir, bodyDir, angSize, 0.002);
      if (hit.alpha > 0.0) {
        // Spin only the surface-noise normal, so terrain and clouds turn while
        // the lit hemisphere stays put - what a planet turning under a fixed
        // light actually looks like.
        vec3 spinAxis = normalize(uBodySpin[b].xyz + vec3(0.0, 1e-4, 0.0));
        vec3 noiseN = RotateAroundAxis(hit.normal, spinAxis, uTime * uBodySpin[b].w);
        vec3 lit = ShadeBodySurface(hit.normal, noiseN, vdir, lightDir,
          uBodyColorA[b].rgb, uBodyColorB[b].rgb,
          uBodyAtmo[b].rgb, uBodyAtmo[b].a,
          uBodyColorA[b].a, uBodyColorB[b].a);
        bg = mix(bg, lit * lightTint * bodyEat, hit.alpha);
      }

      vec3 bodyCenter = bodyDir * SPACE_BODY_DIST;
      float bodyRadius = sin(min(angSize, 1.5)) * SPACE_BODY_DIST;

      // Kept past the block so the moons can tell whether they pass in front
      // of or behind the ring plane.
      float ringAlpha = 0.0;
      float ringT = 1e9;

      float ringOpacity = uBodyRingNormal[b].w;
      if (ringOpacity > 0.001) {
        vec3 ringN = normalize(uBodyRingNormal[b].xyz);
        float denom = dot(vdir, ringN);
        if (abs(denom) > 1e-4) {
          float tRing = dot(bodyCenter, ringN) / denom;
          if (tRing > 0.0) {
            vec3 rp = vdir * tRing;
            float radial = length(rp - bodyCenter) / max(bodyRadius, 1e-3);
            float ringIn = uBodyRingParams[b].x;
            float ringOut = uBodyRingParams[b].y;
            float band = smoothstep(ringIn, ringIn + 0.08, radial)
                       * (1.0 - smoothstep(ringOut - 0.15, ringOut, radial));
            float stripes = 0.45 + 0.55 * Noise3(vec3(radial * 16.0, 0.5, 2.7));
            float occluded = (hit.t < tRing) ? hit.alpha : 0.0;
            ringAlpha = band * stripes * ringOpacity * (1.0 - occluded);
            ringT = tRing;
            vec3 ringCol = uBodyRingColor[b].rgb * (abs(dot(ringN, lightDir)) * 0.6 + 0.4);
            bg = mix(bg, ringCol * lightTint * bodyEat, ringAlpha);
          }
        }
      }

      for (int m = 0; m < MAX_MOONS; m++) {
        if (m >= uMoonCount) break;
        if (int(uMoonOrbit[m].x) != b) continue;

        vec3 orbitN = normalize(uMoonPlane[m].xyz);
        vec3 refAxis = abs(orbitN.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 u = normalize(cross(refAxis, orbitN));
        vec3 v = cross(orbitN, u);

        float ang = uMoonPlane[m].w + uTime * uMoonOrbit[m].z;
        vec3 moonCenter = bodyCenter + (u * cos(ang) + v * sin(ang)) * uMoonOrbit[m].y * bodyRadius;
        float moonRadius = max(uMoonOrbit[m].w * bodyRadius, 1e-3);

        SphereHit moonHit = IntersectSphereSoft(vdir, moonCenter, moonRadius, 0.002);
        if (moonHit.alpha <= 0.0) continue;

        // A sphere reports t = 1e9 on the antialiased rim, where the ray just
        // misses but still covers part of the pixel; fall back to closest
        // approach there or a moon crossing its planet loses its soft edge.
        float moonDepth = moonHit.t < 1e8 ? moonHit.t : dot(vdir, moonCenter);
        float bodyDepth = hit.t < 1e8 ? hit.t : dot(vdir, bodyCenter);

        float behindBody = (bodyDepth < moonDepth) ? hit.alpha : 0.0;
        float behindRing = (ringT < moonDepth) ? ringAlpha : 0.0;
        float moonAlpha = moonHit.alpha * (1.0 - behindBody) * (1.0 - behindRing);
        if (moonAlpha <= 0.0) continue;

        // Rotate rather than offset the noise lookup: offsetting grows the Fbm
        // input until the float32 hash blocks up.
        vec3 mNoiseN = RotateAroundAxis(moonHit.normal, normalize(vec3(0.6, 0.7, 0.38)), float(m) * 1.7);
        vec3 moonSurface = uMoonColor[m].rgb;
        vec3 moonLit = ShadeBodySurface(moonHit.normal, mNoiseN, vdir, lightDir,
          moonSurface * 0.75, moonSurface, vec3(0.0), 0.0,
          uMoonColor[m].w, 0.0);
        bg = mix(bg, moonLit * lightTint * bodyEat, moonAlpha);
      }

      float glowStrength = uBodyGlowColor[b].a;
      if (glowStrength > 0.001) {
        float glowAng = acos(clamp(dot(vdir, bodyDir), -1.0, 1.0));
        float glowRadius = max(uBodyRingParams[b].z, 1e-3);
        float glow = pow(saturate(1.0 - glowAng / glowRadius), uBodyRingParams[b].w);
        glow *= mix(1.0, 1.0 - hit.alpha, uBodyRingColor[b].a);
        bg += uBodyGlowColor[b].rgb * glow * glowStrength * bodyEat;
      }
    }

    // Bright stars keep their OWN clear zone around the hole, independent of
    // Eat Space: a black hole would have devoured any nearby star. The angle
    // is measured against the straight ray so the zone tracks where the hole
    // actually sits on screen.
    if (uBrightStarsEnabled > 0.5) {
      vec3 bright = BrightStarLayer(fdir, uBrightStarDensity, 0.0, uBrightSpikeLength);
      bright += BrightStarLayer(fdir, uBrightStarDensity * 0.55, 17.0, uBrightSpikeLength);
      float angToHole = degrees(acos(clamp(dot(dir, bhDir), -1.0, 1.0)));
      float clearMask = smoothstep(uBrightStarClearAngle,
                                   uBrightStarClearAngle + uBrightStarClearSoftness, angToHole);
      brightStars = bright * uBrightStarIntensity * clearMask;
    }
  }

  // Inside the shadow the background is pure black and only the FRONT disk
  // shows - the far, lensed disk that would otherwise fill the centre is
  // discarded.
  float shadow = 1.0 - smoothstep(uShadowSize * Rs - uShadowSoftness * Rs,
                                  uShadowSize * Rs + uShadowSoftness * Rs, minR);
  vec3 dCol = mix(diskCol, diskFrontCol, shadow);
  float dA = mix(diskA, diskFrontA, shadow);
  vec3 back = bg * (1.0 - shadow);

  vec3 col = back * (1.0 - dA) + dCol;
  col += brightStars * (1.0 - shadow) * (1.0 - dA);

  float x = (minR - uPhotonRadius * Rs) / (uPhotonWidth * Rs);
  float ring = exp(-x * x);
  col += (uDiskHot * 0.5 + uDiskMid * 0.5) * ring * uPhotonBrightness;

  gl_FragColor = vec4(col * uExposure, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* ---------- runtime ---------- */

const field = document.querySelector('.starfield');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

// Mobile keeps the CSS starfield: a full-screen fragment shader is the wrong
// thing to hand a phone battery, and bailing here means three.js is never even
// fetched on those devices.
const skip = !field || coarse || window.innerWidth < 760 || !supportsWebGL2();

function supportsWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch (e) {
    return false;
  }
}

function deg(d) { return d * Math.PI / 180; }

/* Both skies fade up from black. The page starts with .starfield transparent
   (see .sky-fade in style.css) and whichever background wins gets revealed, so
   the CSS sky never shows for a few frames and then cuts to the shader. */
let revealed = false;

function reveal() {
  if (revealed || !field) return;
  revealed = true;
  field.classList.add('ready');
}

/* If three.js never arrives - offline, blocked CDN, slow link - the page must
   not sit on black forever, so hand it back to the CSS sky after a beat. A
   shader that finishes later still takes over; that late swap is the one case
   where the crossfade below is the right transition. */
const watchdog = skip ? null : setTimeout(reveal, 5000);

function bail() {
  clearTimeout(watchdog);
  reveal();
}

if (skip) reveal();
else init();

async function init() {
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
  } catch (e) {
    return bail(); // CDN blocked or offline: the CSS starfield stays as it is
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'sky-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  } catch (e) {
    return bail();
  }
  renderer.setClearColor(0x05070d, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera(); // identity: the quad is already in clip space

  const texture = await new Promise(resolve => {
    new THREE.TextureLoader().load(CONFIG.sky, resolve, undefined, () => resolve(null));
  });
  if (!texture) return bail();
  // No mipmaps, so the equirect seam cannot pick a garbage LOD (see SampleSky).
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const bodies = CONFIG.bodies.slice(0, MAX_BODIES);
  const moons = CONFIG.moons.slice(0, MAX_MOONS);

  // Every array uniform must be fully sized even when fewer bodies are in use;
  // a short array leaves the tail elements undefined and the shader reads junk.
  const fillBodies = () => Array.from({ length: MAX_BODIES }, () => new THREE.Vector4());
  const fillMoons = () => Array.from({ length: MAX_MOONS }, () => new THREE.Vector4());

  const uniforms = {
    uSky: { value: texture },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uTanHalfFov: { value: Math.tan(deg(CONFIG.fov) * 0.5) },
    uCamRight: { value: new THREE.Vector3(1, 0, 0) },
    uCamUp: { value: new THREE.Vector3(0, 1, 0) },
    uCamFwd: { value: new THREE.Vector3(0, 0, 1) },

    uExposure: { value: CONFIG.exposure * CONFIG.dim },
    uHoleDir: { value: new THREE.Vector3(...CONFIG.holeDir) },
    uDistance: { value: CONFIG.distance },
    uRadius: { value: CONFIG.radius },
    uBend: { value: CONFIG.bend },
    uStepLen: { value: CONFIG.stepLen },
    uEarlyOut: { value: CONFIG.earlyOut ? 1 : 0 },
    uSteps: { value: CONFIG.steps },

    uDiskNormal: { value: new THREE.Vector3(...CONFIG.diskNormal) },
    uDiskHot: { value: new THREE.Vector3(...CONFIG.diskColorHot) },
    uDiskMid: { value: new THREE.Vector3(...CONFIG.diskColorMid) },
    uDiskCool: { value: new THREE.Vector3(...CONFIG.diskColorCool) },
    uDiskInner: { value: CONFIG.diskInner },
    uDiskOuter: { value: CONFIG.diskOuter },
    uDiskBrightness: { value: CONFIG.diskBrightness },
    uDoppler: { value: CONFIG.doppler },
    uTurbScale: { value: CONFIG.turbScale },
    uSpinSpeed: { value: CONFIG.spinSpeed },

    uPhotonRadius: { value: CONFIG.photonRadius },
    uPhotonWidth: { value: CONFIG.photonWidth },
    uPhotonBrightness: { value: CONFIG.photonBrightness },
    uShadowSize: { value: CONFIG.shadowSize },
    uShadowSoftness: { value: CONFIG.shadowSoftness },
    uDistortStrength: { value: CONFIG.distortStrength },
    uDistortFalloff: { value: CONFIG.distortFalloff },

    uCubeTint: { value: new THREE.Vector3(...CONFIG.cubeTint) },
    uSpaceColor: { value: new THREE.Vector3(...CONFIG.spaceColor) },
    uNebulaColor: { value: new THREE.Vector3(...CONFIG.nebulaColor) },
    uCubeIntensity: { value: CONFIG.cubeIntensity },
    uEatSpace: { value: CONFIG.eatSpace ? 1 : 0 },
    uEatFalloff: { value: CONFIG.eatFalloff },
    uNebulaScale: { value: CONFIG.nebulaScale },
    uNebulaIntensity: { value: CONFIG.nebulaIntensity },
    uStarDensity: { value: CONFIG.starDensity },
    uStarBrightness: { value: CONFIG.starBrightness },
    uTwinkleSpeed: { value: CONFIG.twinkleSpeed },

    uBrightStarsEnabled: { value: CONFIG.brightStars ? 1 : 0 },
    uBrightStarDensity: { value: CONFIG.brightStarDensity },
    uBrightStarIntensity: { value: CONFIG.brightStarIntensity },
    uBrightStarSize: { value: CONFIG.brightStarSize },
    uBrightSpikeLength: { value: CONFIG.brightSpikeLength },
    uBrightStarClearAngle: { value: CONFIG.brightStarClearAngle },
    uBrightStarClearSoftness: { value: CONFIG.brightStarClearSoftness },
    uBrightTwinkleEnabled: { value: CONFIG.brightTwinkle ? 1 : 0 },
    uBrightTwinkleMin: { value: CONFIG.brightTwinkleMin },
    uBrightTwinkleMax: { value: CONFIG.brightTwinkleMax },
    uBrightTwinkleDuration: { value: CONFIG.brightTwinkleDuration },
    uBrightTwinkleWait: { value: CONFIG.brightTwinkleWait },
    uBrightTwinkleVariation: { value: CONFIG.brightTwinkleVariation },

    uLightDir: { value: new THREE.Vector3(...CONFIG.lightDir) },
    uLitByHole: { value: CONFIG.litByHole ? 1 : 0 },
    uLitByHoleTint: { value: new THREE.Vector3(...CONFIG.litByHoleTint) },
    uBodyCount: { value: bodies.length },
    uMoonCount: { value: moons.length },

    uBodyDirSize: { value: fillBodies() }, uBodyColorA: { value: fillBodies() },
    uBodyColorB: { value: fillBodies() }, uBodyAtmo: { value: fillBodies() },
    uBodyRingNormal: { value: fillBodies() }, uBodyRingColor: { value: fillBodies() },
    uBodyRingParams: { value: fillBodies() }, uBodyGlowColor: { value: fillBodies() },
    uBodyLens: { value: fillBodies() }, uBodyLight: { value: fillBodies() },
    uBodySpin: { value: fillBodies() },
    uMoonOrbit: { value: fillMoons() }, uMoonPlane: { value: fillMoons() },
    uMoonColor: { value: fillMoons() }
  };

  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  /* Camera basis. Built aimed at the hole, then swung off it by CONFIG.yaw /
     pitch so the hole sits away from centre, plus the sky's own _Rotation.
     Scroll adds pitch on top: tipping the camera down lifts the hole up the
     frame, and uDistance grows so it recedes as well as rises. */
  const worldUp = new THREE.Vector3(0, 1, 0);
  const baseFwd = new THREE.Vector3(...CONFIG.holeDir).normalize();

  function basisFor(scroll) {
    const fwd = baseFwd.clone();
    const pitchAxis = new THREE.Vector3().crossVectors(fwd, worldUp).normalize();
    const q = new THREE.Quaternion()
      .setFromAxisAngle(worldUp, CONFIG.yaw + deg(CONFIG.rotation))
      .multiply(new THREE.Quaternion().setFromAxisAngle(
        pitchAxis, CONFIG.pitch + scroll * CONFIG.scrollPitch));
    fwd.applyQuaternion(q).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, worldUp).normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd).normalize();
    return { fwd, right, up };
  }

  // Body directions are authored as [right, up] degrees from where the camera
  // rests, which is far easier to reason about than raw world vectors.
  const rest = basisFor(0);
  bodies.forEach((b, i) => {
    const d = rest.fwd.clone()
      .applyAxisAngle(rest.up, -deg(b.screen[0]))
      .applyAxisAngle(rest.right, deg(b.screen[1]))
      .normalize();
    uniforms.uBodyDirSize.value[i].set(d.x, d.y, d.z, deg(b.sizeDeg));
    uniforms.uBodyColorA.value[i].set(...b.colorA, b.surfaceScale);
    uniforms.uBodyColorB.value[i].set(...b.colorB, b.cloudAmount);
    uniforms.uBodyAtmo.value[i].set(...b.atmo, b.atmoStrength);
    uniforms.uBodyRingNormal.value[i].set(0, 1, 0, b.ringOpacity || 0);
    uniforms.uBodyRingColor.value[i].set(0.8, 0.75, 0.65, 0);
    uniforms.uBodyRingParams.value[i].set(1.3, 2.2, 0.08, 2);
    uniforms.uBodyGlowColor.value[i].set(...b.glow, b.glowStrength);
    uniforms.uBodyLens.value[i].set(b.lens, b.litByHole, b.devoured, 0);
    uniforms.uBodyLight.value[i].set(0, 0, 0, 0);
    uniforms.uBodySpin.value[i].set(...b.spinAxis, b.spinSpeed);
  });

  moons.forEach((m, i) => {
    uniforms.uMoonOrbit.value[i].set(m.body, m.orbitRadius, m.orbitSpeed, m.size);
    uniforms.uMoonPlane.value[i].set(...m.plane, m.startAngle);
    uniforms.uMoonColor.value[i].set(...m.color, m.noiseScale);
  });

  // Rendering above the display's own pixel ratio buys nothing, so that is the
  // ceiling however much headroom the GPU turns out to have.
  const maxRatio = Math.min(window.devicePixelRatio || 1, CONFIG.quality.max);
  // Nothing animates under reduced motion, so a single frame can afford the lot.
  let ratio = reduceMotion ? maxRatio : Math.min(CONFIG.quality.start, maxRatio);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
  }
  resize();

  field.appendChild(canvas);

  let scroll = 0;
  let target = 0;
  let visible = true;
  let running = true;
  const clock = new THREE.Clock();

  function scrollTarget() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(1, window.scrollY / max);
  }

  function draw() {
    uniforms.uTime.value = clock.getElapsedTime();
    const b = basisFor(scroll);
    uniforms.uCamFwd.value.copy(b.fwd);
    uniforms.uCamRight.value.copy(b.right);
    uniforms.uCamUp.value.copy(b.up);
    // The march reaches exactly steps x stepLen, so receding the hole past that
    // budget would make it silently vanish rather than shrink. Grow the step
    // with the distance instead of spending more steps: the scene stays
    // self-similar, and the hole is proportionally smaller on screen by then
    // anyway, so the coarser integration never shows.
    const dist = CONFIG.distance * (1 + scroll * CONFIG.scrollRecede);
    uniforms.uDistance.value = dist;
    uniforms.uStepLen.value = CONFIG.stepLen * (dist / CONFIG.distance);
    renderer.render(scene, camera);
  }

  /* Measured over whole windows of frames rather than single deltas, so one
     janky frame - a layout, a GC pause, an image decoding - cannot ratchet the
     resolution down and leave it there. */
  let qFrames = 0;
  let qStart = performance.now();
  let qChanges = 0;
  let qUpVotes = 0;
  let steppedUp = false;
  let settled = false;

  function adapt(now) {
    if (settled) return;
    qFrames++;
    if (qFrames < CONFIG.quality.samples) return;

    const elapsed = now - qStart;
    qFrames = 0;
    qStart = now;
    // A window far longer than it should be means the tab was backgrounded or
    // the machine stalled, not that the shader is too expensive.
    if (elapsed > 2000) return;

    const q = CONFIG.quality;
    const fps = q.samples * 1000 / elapsed;

    if (fps < q.targetFps * 0.85 && ratio > q.min + 1e-3) {
      // Dropping frames: come down at once. If we had already stepped up, this
      // is the ceiling and we stop - hunting back and forth across it is what
      // produces a resize, and therefore a flicker, every couple of seconds.
      ratio = Math.max(q.min, ratio - q.step);
      qUpVotes = 0;
      if (steppedUp) settled = true;
    } else if (fps > q.targetFps * 1.25 && ratio < maxRatio - 1e-3) {
      // Two clear windows in a row before spending headroom, so one quiet
      // moment cannot push the resolution up and straight back down.
      if (++qUpVotes < 2) return;
      qUpVotes = 0;
      ratio = Math.min(maxRatio, ratio + q.step);
      steppedUp = true;
    } else {
      qUpVotes = 0;
      return; // inside the deadband: leave it alone
    }

    if (++qChanges >= q.maxChanges) settled = true;
    resize();
    canvas.dataset.pixelRatio = ratio.toFixed(3);
  }

  function frame(now) {
    if (!running) return;
    if (visible && !document.hidden) {
      // Before the draw, never after. resize() reallocates the drawing buffer
      // and hands it back CLEARED, so it has to be rendered into during the
      // same frame; adapting after drawing presents one blank frame and reads
      // as a flicker.
      adapt(now || performance.now());
      scroll += (target - scroll) * CONFIG.scrollDamp;
      draw();
    }
    requestAnimationFrame(frame);
  }

  target = scroll = scrollTarget();
  draw();
  clearTimeout(watchdog);
  field.classList.add('webgl');

  let doneTimer = null;
  if (revealed) {
    // The watchdog already put the CSS sky on screen, so this is a live swap
    // and the crossfade is what it is for.
    doneTimer = setTimeout(() => field.classList.add('webgl-done'), 1000);
  } else {
    // Nothing is on screen yet. Drop the CSS layers outright rather than
    // crossfading them under a rising canvas - fading both at once would show
    // a ghost of the old sky through the fade-in.
    field.classList.add('webgl-done');
    requestAnimationFrame(reveal);
  }

  // A lost context (laptop GPU switch, driver reset) would otherwise leave a
  // dead black canvas, so hand the page back to the CSS starfield.
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    running = false;
    clearTimeout(doneTimer);
    field.classList.remove('webgl', 'webgl-done');
  });

  if (reduceMotion) {
    // A still black hole is not motion, so it stays - it just never animates.
    window.addEventListener('scroll', () => { scroll = target = scrollTarget(); draw(); }, { passive: true });
  } else {
    window.addEventListener('scroll', () => { target = scrollTarget(); }, { passive: true });
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); target = scrollTarget(); draw(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) clock.getDelta(); });

  // Stop rendering entirely once the canvas is off screen. It is fixed to the
  // viewport so this only fires if the page hides it, but it costs nothing.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas);
  }

  window.addEventListener('pagehide', () => { running = false; });
}
