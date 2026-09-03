let calculatePower = false;

export function setCalculatePowerRequested(value: boolean) {
  calculatePower = value;
}

export function isCalculatePowerRequested(): boolean {
  return calculatePower;
}
