import { RaphaelElement } from 'raphael';

/**
 * 主题
 */
export interface Theme {
  nodeFontSize?: number;
  labelFontSize?: number;
  fontFamily?: string;
  pathLen?: number;
  bgColor?: string;
  paperMargin?: number;
  highlightColor?: HighlightColor;
  textAnchor?: string;
  fontWeight?: string | number;
  /**
   * 可视化图形，横轴线
   **/
  line: {
    stroke: string;
    strokeWidth: number;
    strokeLinecap: string;
    strokeLinejoin: string;
  };
  startPoint: {
    fill: string;
  };
  endPoint: {
    fill: string;
  };
  /**
   * 精确匹配
   **/
  exact: {
    bgColor: string;
  };
  /**
   * /./ 任意字符匹配
   **/
  dot: {
    bgColor: string;
    textColor: string;
    text: string;
    tip: string;
    radius: number;
  };
  backref: {
    bgColor: string;
    textColor: string;
    strPrefix: string;
    radius: number;
  };
  repeat: {
    padding: number;
    labelMargin: number;
    strokeWidth: 2;
    max: {
      /**
       * 贪婪模式 线条
       **/
      greedy: {
        stroke: string;
      };
      nonGreedy: {
        stroke: string;
      };
    };
    min: {
      /**
       * 贪婪模式 线条
       **/
      greedy: {
        stroke: string;
      };
      nonGreedy: {
        stroke: string;
      };
    };
  };
  charset: {
    anyChar: {
      text: string;
      bgColor: string;
      textColor: string;
    };
    char: {
      bgColor: string;
      textColor: string;
    };
    /**
     * 字符集类别
     **/
    class: {
      bgColor: string;
      textColor: string;
    };
    range: {
      bgColor: string;
      textColor: string;
    };
    /**
     * 字符集合，背景盒子
     **/
    boxColor: {
      /**
       * 不包含 [^]
       **/
      exclude: string;
      /**
       * 包含 []
       **/
      include: string;
    };
    labelColor: {
      exclude: string;
      include: string;
    };
  };
  group: {
    padding: number;
    lineColor: string;
    strokeWidth: number;
  };
  /**
   * 边界
   **/
  assert: {
    rect: {
      strokeWidth: number;
      radius: number;
    };
    /**
     * 匹配非单词边界 \B
     **/
    nonWordBoundary: {
      bgColor: string;
      textColor: string;
    };
    /**
     * 匹配一个单词边界 \b
     **/
    wordBoundary: {
      bgColor: string;
      textColor: string;
    };
    /**
     * 结尾 $
     **/
    end: {
      bgColor: string;
      textColor: string;
    };
    /**
     * 开头 ^
     **/
    begin: {
      bgColor: string;
      textColor: string;
    };
    /**
     * (?=pattern) 匹配后跟随 pattern
     **/
    lookahead: {
      lineColor: string;
      textColor: string;
    };
    /**
     * (?!pattern) 匹配后不跟随 pattern
     **/
    negativeLookahead: {
      lineColor: string;
      textColor: string;
    };
  };
  /**
   * 全局变量
   **/
  global?: Global;
}

export interface Global {
  multiLine?: boolean;
  templateText?: RaphaelElement;
}

/**
 * 图形顶部，显示正则表达式，字符串高亮语法
 **/
export interface HighlightColor {
  delimiter?: string;
  flags?: string;
  exact?: string;
  dot?: string;
  backref?: string;
  $?: string;
  '^'?: string;
  '\\b'?: string;
  '\\B'?: string;
  '('?: string;
  ')'?: string;
  '?='?: string;
  '?!'?: string;
  '?:'?: string;
  '['?: string;
  ']'?: string;
  '|'?: string;
  '{'?: string;
  ','?: string;
  '}'?: string;
  '*'?: string;
  '+'?: string;
  '?'?: string;
  repeatNonGreedy?: string;
  defaults?: string;
  charsetRange?: string;
  charsetClass?: string;
  charsetExclude?: string;
  charsetChars?: string;
}
