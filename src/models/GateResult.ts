export interface GateResult {
  passed: boolean;
  reason?: string;
  cappedProgress: number;
}
