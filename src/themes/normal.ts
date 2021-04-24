import { Theme } from '../types/theme';

/**
 * 常规主题
 */
export const normal: Theme = {
  nodeFontSize: 16,
  labelFontSize: 14,
  fontFamily: 'DejaVu Sans Mono,monospace',
  pathLen: 16,
  bgColor: '#eee',
  paperMargin: 10,
  textAnchor: '',
  fontWeight: 'bold',
  line: {
    stroke: '#333',
    strokeWidth: 2,
    strokeLinecap: 'butt',
    strokeLinejoin: 'round',
  },
  startPoint: {
    fill: 'darkgreen',
  },
  endPoint: {
    fill: '#000',
  },
  exact: {
    bgColor: 'skyblue',
  },
  dot: {
    bgColor: 'DarkGreen',
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
        stroke: 'maroon',
      },
      nonGreedy: {
        stroke: 'Brownr',
      },
    },
    min: {
      // 贪婪模式
      greedy: {
        stroke: '#333',
      },
      nonGreedy: {
        stroke: 'darkgreen',
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
      bgColor: 'Green',
      textColor: 'white',
    },
    range: {
      bgColor: 'teal',
      textColor: 'white',
    },
    boxColor: {
      exclude: 'Pink',
      include: 'Khaki',
    },
    labelColor: {
      exclude: '#C00',
      include: '',
    },
  },
  group: {
    padding: 10,
    lineColor: 'silver',
    strokeWidth: 2,
  },
  assert: {
    rect: {
      strokeWidth: 2,
      radius: 6,
    },
    nonWordBoundary: {
      bgColor: 'maroon',
      textColor: 'white',
    },
    wordBoundary: {
      bgColor: 'purple',
      textColor: 'white',
    },
    end: {
      bgColor: 'Indigo',
      textColor: 'white',
    },
    begin: {
      bgColor: 'Indigo',
      textColor: 'white',
    },
    lookahead: {
      lineColor: 'CornflowerBlue',
      textColor: 'darkgreen',
    },
    negativeLookahead: {
      lineColor: '#F63',
      textColor: 'Purple',
    },
  },
  highlightColor: {
    delimiter: 'Indigo',
    flags: 'darkgreen',
    exact: '#334',
    dot: 'darkblue',
    backref: 'teal',
    $: 'purple',
    '^': 'purple',
    '\\b': '#F30',
    '\\B': '#F30',
    '(': 'blue',
    ')': 'blue',
    '?=': 'darkgreen',
    '?!': 'red',
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
    charsetRange: 'olive',
    charsetClass: 'navy',
    charsetExclude: 'red',
    charsetChars: '#534',
  },
  global: {},
};
