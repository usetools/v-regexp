import K from '../Kit';
import {
  TextRectParams,
  TextRectResult,
  ElementText,
  ElementRect,
  TextLabelParams,
  TextLabelResult,
  HlineParams,
  SmoothLineParams,
  PointParams,
  PointResult,
  ElementSmoothLine,
  ElementHline,
} from '../types/visualize/element';
import { getCharSize } from './common';

export function textRect({ str, x, y, bgColor, textColor, theme }: TextRectParams): TextRectResult {
  str = K.toPrint(str);
  const padding = 6;
  const charSize = getCharSize({
    fontSize: theme.nodeFontSize,
    templateText: theme.global.templateText,
  });
  const tw = str.length * charSize.width;
  const h = charSize.height + padding * 2;
  const w = tw + padding * 2;
  const rect: ElementRect = {
    type: 'rect',
    x,
    y: y - h / 2,
    width: w,
    height: h,
    stroke: 'none',
    fill: bgColor || 'transparent',
  };
  const text: ElementText = {
    type: 'text',
    x: x + w / 2,
    y,
    text: str,
    'font-size': theme.nodeFontSize,
    'font-family': theme.fontFamily,
    fill: textColor || 'black',
  };
  return {
    text,
    rect,
    items: [rect, text],
    width: w,
    height: h,
    x,
    y: rect.y,
    lineInX: x,
    lineOutX: x + w,
  };
}

export function textLabel({ x, y, str, color, theme }: TextLabelParams): TextLabelResult {
  const charSize = getCharSize({
    fontSize: theme.labelFontSize,
    templateText: theme.global.templateText,
  });
  const lines = str.split('\n');
  const textHeight = lines.length * charSize.height;
  let textWidth;
  if (lines.length > 1) {
    textWidth = Math.max.apply(
      Math,
      lines.map((a) => a.length),
    );
  } else {
    textWidth = str.length;
  }
  textWidth *= charSize.width;
  const margin = 4;
  const text: ElementText = {
    type: 'text',
    x,
    y: y - textHeight / 2 - margin,
    text: str,
    'font-size': theme.labelFontSize,
    'font-family': theme.fontFamily,
    fill: color || '#444',
  };
  return {
    label: text,
    x: x - textWidth / 2,
    y: y - textHeight - margin,
    width: textWidth,
    height: textHeight + margin,
  };
}

// 可视化图形，横轴线
export function hline({ x, y, destX, theme }: HlineParams): ElementHline {
  return {
    type: 'path',
    x,
    y,
    path: ['M', x, y, 'H', destX],
    'stroke-linecap': theme.line.strokeLinecap,
    'stroke-linejoin': theme.line.strokeLinejoin,
    stroke: theme.line.stroke,
    'stroke-width': theme.line.strokeWidth,
    _translate(x, y) {
      const p = this.path;
      p[1] += x;
      p[2] += y;
      p[4] += x;
    },
  };
}

export function smoothLine({ fromX, fromY, toX, toY, theme }: SmoothLineParams): ElementSmoothLine {
  const radius = 10;
  let path;
  let translate;
  const signX = fromX > toX ? -1 : 1;
  const signY = fromY > toY ? -1 : 1;
  /* || Math.abs(fromX-toX)<radius*2 */
  if (Math.abs(fromY - toY) < radius * 1.5) {
    path = [
      'M',
      fromX,
      fromY,
      'C',
      fromX + Math.min(Math.abs(toX - fromX) / 2, radius) * signX,
      fromY,
      toX - (toX - fromX) / 2,
      toY,
      toX,
      toY,
    ];
    translate = function (x, y) {
      const p = this.path;
      p[1] += x;
      p[2] += y;
      p[4] += x;
      p[5] += y;
      p[6] += x;
      p[7] += y;
      p[8] += x;
      p[9] += y;
    };
  } else {
    path = [
      'M',
      fromX,
      fromY,
      'Q',
      fromX + radius * signX,
      fromY,
      fromX + radius * signX,
      fromY + radius * signY,
      'V',
      Math.abs(fromY - toY) < radius * 2 ? fromY + radius * signY : toY - radius * signY,
      'Q',
      fromX + radius * signX,
      toY,
      fromX + radius * signX * 2,
      toY,
      'H',
      toX,
    ];
    translate = function (x, y) {
      const p = this.path;
      p[1] += x;
      p[2] += y;
      p[4] += x;
      p[5] += y;
      p[6] += x;
      p[7] += y;
      p[9] += y;
      p[11] += x;
      p[12] += y;
      p[13] += x;
      p[14] += y;
      p[16] += x;
    };
  }
  return {
    type: 'path',
    path,
    'stroke-linecap': theme.line.strokeLinecap,
    'stroke-linejoin': theme.line.strokeLinejoin,
    stroke: theme.line.stroke,
    'stroke-width': theme.line.strokeWidth,
    _translate: translate,
  };
}

export function point({ x, y, fill }: PointParams): PointResult {
  const r = 10;
  return {
    items: [
      {
        type: 'circle',
        fill,
        cx: x + r,
        cy: y,
        r,
        stroke: 'none',
        _translate(x, y) {
          this.cx += x;
          this.cy += y;
        },
      },
    ],
    width: r * 2,
    height: r * 2,
    x,
    y,
    lineInX: x,
    lineOutX: x + r * 2,
  };
}
