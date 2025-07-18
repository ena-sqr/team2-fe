export interface AnalyzeFace {
  age: number;
  gender: { dominant: string; probabilities: {} };
  race: { dominant: string; probabilities: {} };
  emotion: { dominant: string; probabilities: {} };
}
