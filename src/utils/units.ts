export type UnitSystem = "imperial" | "metric";

export const CM_PER_INCH = 2.54;
export const CM_PER_FOOT = 30.48;
export const CM_PER_METER = 100;

export function inchesToCentimeters(inches: number): number {
  return inches * CM_PER_INCH;
}

export function centimetersToInches(centimeters: number): number {
  return centimeters / CM_PER_INCH;
}

export function feetToCentimeters(feet: number): number {
  return feet * CM_PER_FOOT;
}

export function centimetersToFeet(centimeters: number): number {
  return centimeters / CM_PER_FOOT;
}

export function metersToCentimeters(meters: number): number {
  return meters * CM_PER_METER;
}

export function centimetersToMeters(centimeters: number): number {
  return centimeters / CM_PER_METER;
}
