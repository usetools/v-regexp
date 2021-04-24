/**
 * 通用方法
 */
import { RaphaelElement, RaphaelPaper } from 'raphael';
import {
  Theme,
  GetCharSizeParams,
  CharSizeCache,
  CharSizeCacheItem,
  HighlightText,
  GetHighlightTextParams,
} from '../types';
import { EMPTY_NODE, GROUP_NODE, CHOICE_NODE } from '../constants';
import K from '../Kit';

/**
 * 获取 rapheal 文本模版
 * @param paper
 * @param theme 主题
 */
export function getTemplateText(paper: RaphaelPaper, theme: Theme): RaphaelElement {
  const templateText = paper.text(-1000, -1000, 'XgfTlM|.q\nXgfTlM|.q').attr({
    'font-family': theme.fontFamily,
    'font-size': theme.nodeFontSize,
  });
  return templateText;
}

const charSizeCache: CharSizeCache = {};
export function getCharSize({ fontSize, fontBold = 'normal', templateText }: GetCharSizeParams): CharSizeCacheItem {
  if (charSizeCache[fontSize] && charSizeCache[fontSize][fontBold]) {
    return charSizeCache[fontSize][fontBold];
  }

  templateText.attr({
    'font-size': fontSize,
    'font-weight': fontBold,
  });
  const box = templateText.getBBox();
  charSizeCache[fontSize] = charSizeCache[fontSize] || {};

  charSizeCache[fontSize][fontBold] = {
    width: box.width / ((templateText.attr('text').length - 1) / 2),
    height: box.height / 2,
  };
  return charSizeCache[fontSize][fontBold];
}

export function charsetEscape(str: string, isRaw?: boolean) {
  const resultStr = K.toPrint(str, isRaw);
  return resultStr.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

export function onlyCharClass(node) {
  return !node.chars && !node.ranges?.length && node.classes?.length === 1;
}

export function getHighlightText({ str, color, theme }: GetHighlightTextParams): HighlightText {
  const colorResult = color || theme.highlightColor[str] || theme.highlightColor.defaults;
  return {
    type: 'text',
    'font-size': theme.nodeFontSize,
    'font-family': theme.fontFamily,
    text: str,
    fill: colorResult,
    'text-anchor': theme.textAnchor,
    'font-weight': theme.fontWeight,
  };
}

export function elideOK(node: any): boolean {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (!elideOK(node[i])) {
        return false;
      }
    }
    return true;
  }
  if (node.type === EMPTY_NODE) {
    return true;
  }
  if (node.type === GROUP_NODE && node.num === undefined) {
    return elideOK(node.sub);
  }
  if (node.type === CHOICE_NODE) {
    return elideOK(node.branches);
  }
  return false;
}

export function translate(items, dx, dy) {
  items.forEach((item) => {
    if (item._translate) {
      item._translate(dx, dy);
    } else {
      item.x += dx;
      item.y += dy;
    }
  });
}

export function plural(n: number) {
  return n + (n < 2 ? ' time' : ' times');
}
