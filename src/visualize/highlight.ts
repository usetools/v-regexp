import K from '../Kit';
import { Theme, HighlightText } from '../types';
import { charsetEscape, getHighlightText, onlyCharClass } from './common';
import { CHARSET_NODE, AssertLookahead, ASSERT_NODE } from '../constants';

export function highlight(tree: any, theme: Theme) {
  let texts: HighlightText[] = [];
  tree.forEach((node) => {
    if (node.sub) {
      texts.push(
        getHighlightText({
          str: '(',
          theme,
        }),
      );
      if (node.type === ASSERT_NODE) {
        if (node.assertionType === AssertLookahead) {
          texts.push(
            getHighlightText({
              str: '?=',
              theme,
            }),
          );
        } else {
          texts.push(
            getHighlightText({
              str: '?!',
              theme,
            }),
          );
        }
      } else if (node.nonCapture) {
        texts.push(
          getHighlightText({
            str: '?:',
            theme,
          }),
        );
      }
      texts = texts.concat(highlight(node.sub, theme));
      texts.push(
        getHighlightText({
          str: ')',
          theme,
        }),
      );
    } else if (node.branches) {
      node.branches
        .map((node) => highlight(node, theme))
        .forEach((ts) => {
          texts = texts.concat(ts);
          texts.push(
            getHighlightText({
              str: '|',
              theme,
            }),
          );
        });
      texts.pop();
    } else {
      const color = theme.highlightColor[node.type] || theme.highlightColor.defaults;
      const simple = onlyCharClass(node);
      let raw = node.raw || '';
      switch (node.type) {
        case CHARSET_NODE:
          if (!simple || node.exclude) {
            texts.push(
              getHighlightText({
                str: '[',
                theme,
              }),
            );
          }
          if (node.exclude) {
            texts.push(
              getHighlightText({
                str: '^',
                theme,
                color: theme.highlightColor.charsetExclude,
              }),
            );
          }
          node.ranges.forEach((rg) => {
            texts.push(
              getHighlightText({
                str: charsetEscape(`${rg[0]}-${rg[1]}`),
                theme,
                color: theme.highlightColor.charsetRange,
              }),
            );
          });
          node.classes.forEach((cls) => {
            texts.push(
              getHighlightText({
                str: `\\${cls}`,
                theme,
                color: theme.highlightColor.charsetClass,
              }),
            );
          });
          texts.push(
            getHighlightText({
              str: charsetEscape(node.chars),
              theme,
              color: theme.highlightColor.charsetChars,
            }),
          );
          if (!simple || node.exclude) {
            texts.push(
              getHighlightText({
                str: ']',
                theme,
              }),
            );
          }
          break;
        default:
          if (node.repeat) {
            raw = raw.slice(0, node.repeat.beginIndex);
          }
          raw = K.toPrint(raw, true);
          texts.push(
            getHighlightText({
              str: raw,
              theme,
              color,
            }),
          );
      }
    }
    if (node.repeat) {
      const { min } = node.repeat;
      const { max } = node.repeat;
      if (min === 0 && max === Infinity) {
        texts.push(
          getHighlightText({
            str: '*',
            theme,
          }),
        );
      } else if (min === 1 && max === Infinity) {
        texts.push(
          getHighlightText({
            str: '+',
            theme,
          }),
        );
      } else if (min === 0 && max === 1) {
        texts.push(
          getHighlightText({
            str: '?',
            theme,
          }),
        );
      } else {
        texts.push(
          getHighlightText({
            str: '{',
            theme,
          }),
        );
        texts.push(
          getHighlightText({
            str: min,
            theme,
          }),
        );
        if (min === max) {
          texts.push(
            getHighlightText({
              str: '}',
              theme,
            }),
          );
        } else {
          texts.push(
            getHighlightText({
              str: ',',
              theme,
            }),
          );
          if (Number.isFinite(max)) {
            texts.push(
              getHighlightText({
                str: max,
                theme,
              }),
            );
          }
          texts.push(
            getHighlightText({
              str: '}',
              theme,
            }),
          );
        }
      }
      if (node.repeat.nonGreedy) {
        texts.push(
          getHighlightText({
            str: '?',
            theme,
            color: theme.highlightColor.repeatNonGreedy,
          }),
        );
      }
    }
  });
  return texts;
}
