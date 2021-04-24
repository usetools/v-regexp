export interface HighlightText {
  type: string;
  text: string;
  fill: string;
  'text-anchor': string;
  'font-weight': string | number;
  'font-family': string;
  'font-size': number;
  x?: number;
  y?: number;
}
