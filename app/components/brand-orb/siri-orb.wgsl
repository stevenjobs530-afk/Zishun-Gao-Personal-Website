// Minimal Siri-wave orb shader adapted from LerSent001/orb (MIT).
// Copyright (c) 2026 LerSent001.
// The editor, parameter panels, legacy liquid bank, and other presets are not
// included. See THIRD_PARTY_LICENSES/orb-LICENSE.md.

struct Uniforms {
  size:           vec2<f32>,
  time:           f32,
  speed:          f32,
  radius:         f32,
  zoom:           f32,
  warp:           f32,
  ridgeAmt:       f32,
  sharp:          f32,
  shade:          f32,
  sheen:          f32,
  gloss:          f32,
  shellMidAlpha:  f32,
  shellEdgeAlpha: f32,
  exposure:       f32,
  style:          f32,
  edgeSoftness:   f32,
  edgeGlow:       f32,
  paletteCount:   f32,
  glassEnabled:   f32,
  glassOpacity:   f32,
  contourDeform:  f32,
  bandDensity:    f32,
  chromaticShift: f32,
  metalScale:     f32,
  metalStretch:   f32,
  metalAngle:     f32,
  metalOffset:    f32,
  metalPhase:     f32,
  metalEvolution: f32,
  metalRoughness: f32,
  metalDepth:     f32,
  colorA:         vec4<f32>,
  colorB:         vec4<f32>,
  colorC:         vec4<f32>,
  colorD:         vec4<f32>,
  highlightColor: vec4<f32>,
  shellInner:     vec4<f32>,
  shellMid:       vec4<f32>,
  shellEdge:      vec4<f32>,
  sheenColor:     vec4<f32>,
  specColor:      vec4<f32>,
  canvasColor:    vec4<f32>,
  glowColor:      vec4<f32>,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

// Clarity controls are deliberately independent from the preset palette.
// The four Siri colours and animation speed remain untouched.
const SIRI_LINE_NUMERATOR: f32 = 0.014;
const SIRI_LINE_FALLOFF: f32 = 0.018;
const SIRI_BAND_NUMERATOR: f32 = 0.010;
const SIRI_BAND_FALLOFF: f32 = 0.090;
const SIRI_SOFTNESS_BASE: f32 = 0.022;
const SIRI_WHITE_CORE_WIDTH: f32 = 0.00135;
const SIRI_CHANNEL_SPLIT_SCALE: f32 = 0.075;
const GLASS_REFRACTION_SCALE: f32 = 1.05;
const SIRI_TONE_GAIN: f32 = 1.18;

fn mfEdgeD(soft: f32) -> f32 {
  return soft - 0.005;
}

fn mfEdgeGlow(col: vec3<f32>, uv: vec2<f32>, ctr: vec2<f32>, rad: f32,
              soft: f32, glow: f32, glowRGB: vec3<f32>) -> vec3<f32> {
  if (glow <= 0.0) { return col; }
  let r = length(uv - ctr);
  let outside = smoothstep(rad - max(soft, 0.0005), rad + max(soft, 0.0005), r);
  return col + glowRGB * (glow * exp(-max(r - rad, 0.0) * 11.0) * outside);
}

fn glsFinishPresetFluid(colorIn: vec3<f32>, p: vec2<f32>) -> vec3<f32> {
  var color = colorIn;
  color = mix(color, u.highlightColor.rgb,
              u.shade * 0.22 * smoothstep(0.15, 1.15, dot(p, vec2<f32>(-0.32, 0.78))));
  color = color * (1.0 - u.shade * 0.34
                  * smoothstep(-0.1, 1.2, dot(p, vec2<f32>(0.45, -0.62))));
  color = color * (1.0 - u.shade * 0.22 * smoothstep(0.72, 1.08, length(p)));
  return clamp(color, vec3<f32>(0.0), vec3<f32>(1.0));
}

fn glsSiriBand(q: vec2<f32>, drift: f32, phaseOffset: f32, amplitude: f32,
               mainY: f32, envelope: f32, softness: f32) -> vec2<f32> {
  let y = amplitude * envelope * sin(q.x * 1.0 + drift + phaseOffset);
  let distanceToLine = abs(q.y - y);
  let line = SIRI_LINE_NUMERATOR
             / (sqrt(distanceToLine * distanceToLine + softness * softness)
                + SIRI_LINE_FALLOFF);
  let bandDistance = max(0.0, max(q.y - max(mainY, y), min(mainY, y) - q.y));
  let band = SIRI_BAND_NUMERATOR / (bandDistance + SIRI_BAND_FALLOFF);
  return vec2<f32>(line, band);
}

fn glsSiriFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  let scale = 0.74 + u.zoom * 0.34;
  let q = p / scale;
  let xNorm = q.x;
  let envelopeBase = cos(1.57079633 * min(abs(0.9 * xNorm), 1.0));
  let envelope = envelopeBase * envelopeBase;
  let low = 0.5 + 0.5 * cos(t * 0.37);
  let mid = 0.5 + 0.5 * sin(t * 0.51 + 1.2);
  let high = 0.5 + 0.5 * cos(t * 0.73 + 2.1);
  let drift = t * 2.4;
  let mainAmplitude = 0.25 + u.ridgeAmt * 0.075 + low * 0.018;
  let bandAmplitude = mainAmplitude + mid * 0.025 + high * 0.018;
  let mainY = mainAmplitude * envelope * sin(q.x * 1.1 + drift);
  let separation = 1.85 + u.warp * 0.2 + mid * 0.28;
  let softness = SIRI_SOFTNESS_BASE
                 + (1.0 - u.ridgeAmt) * 0.012
                 + mid * 0.003;

  let band0 = glsSiriBand(q, drift, -separation, bandAmplitude, mainY, envelope, softness);
  let band1 = glsSiriBand(q, drift, -separation * 0.34, bandAmplitude, mainY, envelope, softness);
  let band2 = glsSiriBand(q, drift, separation * 0.34, bandAmplitude, mainY, envelope, softness);
  let band3 = glsSiriBand(q, drift, separation, bandAmplitude, mainY, envelope, softness);
  let w0 = band0.x + band0.y;
  let w1 = band1.x + band1.y;
  let w2 = band2.x + band2.y;
  let w3 = band3.x + band3.y;
  let total = w0 + w1 + w2 + w3;
  let dominant0 = w0 * w0;
  let dominant1 = w1 * w1;
  let dominant2 = w2 * w2;
  let dominant3 = w3 * w3;
  let dominantTotal = dominant0 + dominant1 + dominant2 + dominant3;
  let spectral = (u.colorA.rgb * dominant0 + u.colorC.rgb * dominant1
                + u.colorB.rgb * dominant2 + u.colorD.rgb * dominant3)
                / max(dominantTotal, 0.0001);
  let energy = (1.0 - exp(-total * 0.58)) * envelope;
  let mainDistance = abs(q.y - mainY);
  let whiteCore = exp(-mainDistance * mainDistance / SIRI_WHITE_CORE_WIDTH) * envelope;
  let atmosphere = mix(u.colorD.rgb, u.colorB.rgb,
                       smoothstep(-0.7, 0.7, q.y)) * 0.018;
  var color = atmosphere + spectral * energy * 1.14;
  color = color + u.highlightColor.rgb * whiteCore * (0.18 + 0.1 * low);
  color = color / (vec3<f32>(1.0) + color * 0.18);
  return glsFinishPresetFluid(color, p);
}

fn glsOver(dst: vec3<f32>, src: vec3<f32>, a: f32) -> vec3<f32> {
  let k = clamp(a, 0.0, 1.0);
  return src * k + dst * (1.0 - k);
}

fn glsToneMap(color: vec3<f32>) -> vec3<f32> {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return clamp((color * (a * color + vec3<f32>(b)))
               / (color * (c * color + vec3<f32>(d)) + vec3<f32>(e)),
               vec3<f32>(0.0), vec3<f32>(1.0));
}

fn glsRefractionProfile(t: f32) -> f32 {
  let depth = clamp(t, 0.0, 1.0);
  let circular = sqrt(max(1.0 - (1.0 - depth) * (1.0 - depth), 0.0));
  return 1.0 - circular;
}

fn glsHighlightLobe(normal: vec2<f32>, direction: vec2<f32>, cut: f32,
                     power: f32) -> f32 {
  let angular = clamp((dot(normal, direction) - cut) / max(1.0 - cut, 0.001),
                      0.0, 1.0);
  return pow(angular, power);
}

fn glsContourWave(angle: f32, t: f32) -> vec2<f32> {
  let wave = sin(angle * 3.0 + t * 0.62) * 0.52
             + sin(angle * 5.0 - t * 0.41 + 1.7) * 0.31
             + sin(angle * 2.0 + t * 0.23 + 3.1) * 0.17;
  let slope = cos(angle * 3.0 + t * 0.62) * 1.56
              + cos(angle * 5.0 - t * 0.41 + 1.7) * 1.55
              + cos(angle * 2.0 + t * 0.23 + 3.1) * 0.34;
  return vec2<f32>(wave, slope);
}

fn glsContourScale(uv: vec2<f32>, t: f32, amount: f32) -> f32 {
  if (amount <= 0.0) { return 1.0; }
  let contour = glsContourWave(atan2(uv.y, uv.x), t);
  return 1.0 + clamp(amount, 0.0, 1.0) * 0.09 * contour.x;
}

fn glsContourNormal(uv: vec2<f32>, rad: f32, t: f32, amount: f32) -> vec2<f32> {
  let distance = length(uv);
  if (distance <= 0.0001) { return vec2<f32>(0.0); }
  let radial = uv / distance;
  let contour = glsContourWave(atan2(uv.y, uv.x), t);
  let slope = clamp(amount, 0.0, 1.0) * 0.09 * contour.y;
  let tangent = vec2<f32>(-radial.y, radial.x);
  return normalize(radial - tangent * (rad * slope / distance));
}

fn glsDiscCoverage(pd: f32) -> vec2<f32> {
  let minimumAA = 2.0 / max(min(u.size.x, u.size.y), 1.0);
  let pixelAA = max(fwidth(pd), minimumAA);
  let coverage = 1.0 - smoothstep(1.0 - pixelAA, 1.0 + pixelAA, pd);
  return vec2<f32>(coverage, pixelAA);
}

fn orbGlassLiquidAnim(uv01: vec2<f32>) -> vec4<f32> {
  let fc = vec2<f32>(uv01.x, 1.0 - uv01.y) * u.size;
  let uv = (2.0 * fc - u.size) / max(min(u.size.x, u.size.y), 1.0);
  let rad = max(u.radius, 0.05);
  let t = u.time * u.speed;
  let contourRad = rad * glsContourScale(uv, t, u.contourDeform);
  let pd = length(uv) / contourRad;
  let disc = glsDiscCoverage(pd);
  let clearFa = disc.x;
  let pixelAA = disc.y;

  if (pd > 1.0 + pixelAA * 2.0 + mfEdgeD(u.edgeSoftness)) {
    let outsideGlow = clamp(
      mfEdgeGlow(vec3<f32>(0.0), uv, vec2<f32>(0.0), contourRad,
                 u.edgeSoftness, u.edgeGlow, u.glowColor.rgb),
      vec3<f32>(0.0), vec3<f32>(1.0),
    );
    return vec4<f32>(outsideGlow, max(outsideGlow.r, max(outsideGlow.g, outsideGlow.b)));
  }

  let p = uv / contourRad;
  let normal = glsContourNormal(uv, rad, t, u.contourDeform);
  let edgeDepth = max(1.0 - pd, 0.0);
  let refractionWidth = 0.015 + 0.95 * clamp(u.shellMidAlpha, 0.0, 1.0);
  let refractionT = edgeDepth / max(refractionWidth, 0.001);
  let refractionProfile = pow(glsRefractionProfile(refractionT), 0.68);
  let refractionAmount = GLASS_REFRACTION_SCALE
                         * clamp(u.glassOpacity, 0.0, 1.0)
                         * refractionProfile;
  let refractedP = p - normal * refractionAmount;
  var fcol = vec3<f32>(0.0);

  if (clearFa > 0.0) {
    let channelSplit = SIRI_CHANNEL_SPLIT_SCALE * clamp(u.gloss, 0.0, 2.0)
                       * clamp(u.glassOpacity, 0.0, 1.0) * refractionProfile;
    let redSample = glsSiriFluid(refractedP - normal * channelSplit, t);
    let greenSample = glsSiriFluid(refractedP, t);
    let blueSample = glsSiriFluid(refractedP + normal * channelSplit, t);
    fcol = vec3<f32>(redSample.r, greenSample.g, blueSample.b);
  }

  let lum = dot(fcol, vec3<f32>(0.213, 0.715, 0.072));
  let clearSat = clamp(vec3<f32>(lum) + (fcol - vec3<f32>(lum)) * 1.22,
                       vec3<f32>(0.0), vec3<f32>(1.0));
  var col = glsOver(u.canvasColor.rgb, clearSat, 0.99 * clearFa);

  let surfaceWidth = 0.026 + 0.055 * clamp(u.shellEdgeAlpha, 0.0, 1.0);
  let surfaceBand = (1.0 - smoothstep(pixelAA * 0.5,
                                       surfaceWidth + pixelAA,
                                       edgeDepth)) * clearFa;
  let opticalRim = pow(surfaceBand, 1.8);
  col = glsOver(col, u.shellInner.rgb, opticalRim * u.glassOpacity * 0.45);

  let coolDirection = normalize(vec2<f32>(0.84, 0.54));
  let warmDirection = normalize(vec2<f32>(-0.62, -0.78));
  let coolSplit = glsHighlightLobe(normal, coolDirection, -0.32, 1.8);
  let warmSplit = glsHighlightLobe(normal, warmDirection, -0.28, 2.0);
  let dispersion = opticalRim * clamp(u.gloss, 0.0, 2.0)
                   * (0.8 + 0.8 * u.shellEdgeAlpha);
  col = glsOver(col, u.shellMid.rgb, dispersion * coolSplit);
  col = glsOver(col, u.shellEdge.rgb, dispersion * warmSplit);

  let edgeShadow = opticalRim * (0.015 + 0.15 * u.shellEdgeAlpha)
                   * (0.15 + 0.85 * max(dot(normal, vec2<f32>(0.45, -0.89)), 0.0));
  col = col * (1.0 - edgeShadow);

  let keyDirection = normalize(vec2<f32>(-0.68, 0.73));
  let fillDirection = normalize(vec2<f32>(0.74, -0.67));
  let key = opticalRim * glsHighlightLobe(normal, keyDirection, 0.2, 2.8)
            * clamp(u.sheen, 0.0, 2.0) * 1.4;
  let fill = opticalRim * glsHighlightLobe(normal, fillDirection, 0.4, 3.6)
             * clamp(u.sheen, 0.0, 2.0);
  col = glsOver(col, u.sheenColor.rgb, key);
  col = glsOver(col, u.specColor.rgb, fill);

  col = glsToneMap(
    max(col * max(u.exposure, 0.0) * SIRI_TONE_GAIN, vec3<f32>(0.0)),
  ) * clearFa;
  let edged = mfEdgeGlow(col, uv, vec2<f32>(0.0), contourRad,
                         u.edgeSoftness, u.edgeGlow, u.glowColor.rgb);
  let alpha = max(clearFa, max(edged.r, max(edged.g, edged.b)) * select(0.0, 1.0, u.edgeGlow > 0.0));
  return vec4<f32>(clamp(edged, vec3<f32>(0.0), vec3<f32>(1.0)), clamp(alpha, 0.0, 1.0));
}
