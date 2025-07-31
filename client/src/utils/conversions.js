// client/src/utils/conversions.js
export function cToF(c) {
  return c * 9 / 5 + 32;
}

export function fToC(f) {
  return (f - 32) * 5 / 9;
}

export function msToKmh(ms) {
  return ms * 3.6;
}

export function kmhToMs(kmh) {
  return kmh / 3.6;
}

export function msToMph(ms) {
  return ms * 2.23694;
}

export function mphToMs(mph) {
  return mph / 2.23694;
}

export function msToKnots(ms) {
  return ms * 1.94384;
}

export function knotsToMs(knots) {
  return knots / 1.94384;
}

export function hpaToInhg(hpa) {
  return hpa * 0.02953;
}

export function inhgToHpa(inhg) {
  return inhg / 0.02953;
}

export function hpaToMmhg(hpa) {
  return hpa * 0.75006;
}

export function mmhgToHpa(mmhg) {
  return mmhg / 0.75006;
}

export function mmToIn(mm) {
  return mm / 25.4;
}

export function inToMm(inches) {
  return inches * 25.4;
}

export function mToFt(m) {
  return m * 3.28084;
}

export function ftToM(ft) {
  return ft / 3.28084;
}

export const windConversionsFromMs = {
  'm/s': (v) => v,
  'km/h': msToKmh,
  'mph': msToMph,
  'kts': msToKnots,
};

export const windUnits = ['m/s', 'km/h', 'mph', 'kts'];

export const pressureConversionsFromHpa = {
  'hPa': (v) => v,
  'inHg': hpaToInhg,
  'mmHg': hpaToMmhg,
};

export const pressureUnits = ['hPa', 'inHg', 'mmHg'];