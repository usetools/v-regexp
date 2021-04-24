import { Theme } from '../theme';

export interface TextRectParams {
  str?: string;
  x?: number;
  y?: number;
  bgColor?: string;
  textColor?: string;
  theme?: Theme;
}

export interface ElementText {
  type: 'text';
  x: number;
  y: number;
  text: string;
  'font-size': number;
  'font-family': string;
  fill: string;
}

export interface ElementRect {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  fill: string;
  r?: number;
  tip?: string;
}

export interface ElementPoint {
  type: 'circle';
  fill: string;
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  _translate: any;
}

export interface ElementSmoothLine {
  type: 'path';
  path: any;
  'stroke-linecap': string;
  'stroke-linejoin': string;
  stroke: string;
  'stroke-width': number;
  _translate: any;
}

export interface ElementHline {
  type: 'path';
  x: number;
  y: number;
  path: any;
  'stroke-linecap': string;
  'stroke-linejoin': string;
  stroke: string;
  'stroke-width': number;
  _translate: any;
}

export interface TextRectResult {
  text: ElementText;
  rect: ElementRect;
  items: [ElementRect, ElementText];
  width: number;
  height: number;
  x: number;
  y: number;
  lineInX: number;
  lineOutX: number;
}

export interface TextLabelParams {
  x?: number;
  y?: number;
  str?: string;
  color?: string;
  theme?: Theme;
}

export interface TextLabelResult {
  label: ElementText;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HlineParams {
  x?: number;
  y?: number;
  destX?: number;
  theme: Theme;
}

export interface SmoothLineParams {
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  theme: Theme;
}

export interface PointParams {
  x?: number;
  y?: number;
  fill?: string;
}

export interface PointResult {
  items: ElementPoint[];
  width: number;
  height: number;
  x: number;
  y: number;
  lineInX: number;
  lineOutX: number;
}

export interface PlotParams {
  tree: any;
  x: number;
  y: number;
  theme: Theme;
}

export interface PlotNodeParams {
  node: any;
  x: number;
  y: number;
  theme?: Theme;
}
