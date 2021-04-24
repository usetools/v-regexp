/**
 * 配色参考：https://peiseka.com/webpeise.html#ps16
 * 华丽、花哨、女性化
 * */

import { Theme } from '../types/theme';

/**
 * 常规主题
 */
export const gorgeous: Theme = {
  nodeFontSize: 16,
  labelFontSize: 14,
  fontFamily: 'monospace',
  pathLen: 16,
  bgColor: '#eaeff7',
  paperMargin: 10,
  textAnchor: '',
  fontWeight: 'bold',
  line: {
    stroke: '#3a3a3a',
    strokeWidth: 2,
    strokeLinecap: 'butt',
    strokeLinejoin: 'round',
  },
  startPoint: {
    fill: '#339999',
  },
  endPoint: {
    fill: '#000',
  },
  exact: {
    bgColor: '#FF6666',
  },
  dot: {
    bgColor: '#663366',
    textColor: 'white',
    text: 'AnyCharExceptNewLine',
    tip: 'AnyChar except CR LF',
    radius: 10,
  },
  backref: {
    bgColor: 'navy',
    textColor: 'white',
    strPrefix: 'Backref',
    radius: 8,
  },
  repeat: {
    padding: 10,
    labelMargin: 4,
    strokeWidth: 2,
    max: {
      // 贪婪模式
      greedy: {
        stroke: '#339999',
      },
      nonGreedy: {
        stroke: '#66CC99',
      },
    },
    min: {
      // 贪婪模式
      greedy: {
        stroke: '#666699',
      },
      nonGreedy: {
        stroke: '#99CC66',
      },
    },
  },
  charset: {
    anyChar: {
      text: 'AnyChar',
      bgColor: 'green',
      textColor: 'white',
    },
    char: {
      bgColor: 'LightSkyBlue',
      textColor: 'black',
    },
    class: {
      bgColor: '#CC3399',
      textColor: 'white',
    },
    range: {
      bgColor: '#993399',
      textColor: 'white',
    },
    boxColor: {
      exclude: '#FFCCCC',
      include: '#FFFF99',
    },
    labelColor: {
      exclude: '#CC0033',
      include: '#006633',
    },
  },
  group: {
    padding: 10,
    lineColor: '#aaa',
    strokeWidth: 2,
  },
  assert: {
    rect: {
      strokeWidth: 2,
      radius: 6,
    },
    nonWordBoundary: {
      bgColor: '#990066',
      textColor: 'white',
    },
    wordBoundary: {
      bgColor: '#CC6699',
      textColor: 'white',
    },
    end: {
      bgColor: '#003399',
      textColor: 'white',
    },
    begin: {
      bgColor: '#003399',
      textColor: 'white',
    },
    lookahead: {
      lineColor: '#FF9900',
      textColor: '#CC6600',
    },
    negativeLookahead: {
      lineColor: '#660066',
      textColor: '#993366',
    },
  },
  highlightColor: {
    delimiter: 'Indigo',
    flags: 'darkgreen',
    exact: '#FF6666',
    dot: '#663366',
    backref: 'navy',
    $: '#003399',
    '^': '#003399',
    '\\b': '#CC6699',
    '\\B': '#990066',
    '(': 'blue',
    ')': 'blue',
    '?=': '#CC6600',
    '?!': '#993366',
    '?:': 'grey',
    '[': 'navy',
    ']': 'navy',
    '|': 'blue',
    '{': 'maroon',
    ',': 'maroon',
    '}': 'maroon',
    '*': 'maroon',
    '+': 'maroon',
    '?': 'maroon',
    repeatNonGreedy: '#F61',
    defaults: 'black',
    charsetRange: '#993399',
    charsetClass: '#CC3399',
    charsetExclude: '#CC0033',
    charsetChars: 'LightSkyBlue',
  },
  global: {},
};
