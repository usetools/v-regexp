import { AssertLookahead, AssertNegativeLookahead } from '../constants';
import { PlotNodeParams, PlotParams } from '../types';
import { elideOK, onlyCharClass, plural, translate } from './common';
import { hline, point, smoothLine, textLabel, textRect } from './element';

export function plot({ tree, x, y, theme }: PlotParams) {
  tree.unshift({ type: 'startPoint' });
  tree.push({ type: 'endPoint' });
  return plotTree({
    tree,
    x,
    y,
    theme,
  });
}

export function plotTree({ tree, x, y, theme }: PlotParams) {
  const results = [];
  let items = [];
  let width = 0;
  let height = 0;
  let fromX = x;
  let top = y;
  let bottom = y;
  if (!tree.length) {
    return plotNode.empty({
      node: null,
      x,
      y,
      theme,
    });
  }
  tree.forEach((node) => {
    let ret;
    if (node.repeat) {
      ret = plotNode.repeat({
        node,
        x: fromX,
        y,
        theme,
      });
    } else {
      ret = plotNode[node.type]({
        node,
        x: fromX,
        y,
        theme,
      });
    }
    results.push(ret);
    fromX += ret.width + theme.pathLen;
    width += ret.width;
    top = Math.min(top, ret.y);
    bottom = Math.max(bottom, ret.y + ret.height);
    items = items.concat(ret.items);
  });
  height = bottom - top;
  results.reduce((a, b) => {
    width += theme.pathLen;
    const p = hline({
      x: a.lineOutX,
      y,
      destX: b.lineInX,
      theme,
    });
    items.push(p);
    return b;
  });
  const { lineInX } = results[0];
  const { lineOutX } = results[results.length - 1];
  return {
    items,
    width,
    height,
    x,
    y: top,
    lineInX,
    lineOutX,
  };
}

export const plotNode = {
  startPoint: ({ x, y, theme }: PlotNodeParams) =>
    point({
      x,
      y,
      fill: theme?.startPoint?.fill,
    }),
  endPoint: ({ x, y, theme }: PlotNodeParams) =>
    point({
      x,
      y,
      fill: theme?.endPoint?.fill,
    }),
  empty: ({ x, y, theme }: PlotNodeParams) => {
    const len = 10;
    const l = hline({
      x,
      y,
      destX: x + len,
      theme,
    });
    return {
      items: [l],
      width: len,
      height: 2,
      x,
      y,
      lineInX: x,
      lineOutX: x + len,
    };
  },
  exact: ({ node, x, y, theme }: PlotNodeParams) => {
    const color = theme?.exact?.bgColor;
    return textRect({
      str: node.chars,
      x,
      y,
      bgColor: color,
      theme,
    });
  },
  dot: ({ x, y, theme }: PlotNodeParams) => {
    const bgColor = theme.dot.bgColor;
    const textColor = theme.dot.textColor;
    const a = textRect({
      str: theme.dot.text,
      x,
      y,
      bgColor,
      textColor,
      theme,
    });
    a.rect.r = theme.dot.radius;
    a.rect.tip = theme.dot.tip;
    return a;
  },
  backref: ({ node, x, y, theme }: PlotNodeParams) => {
    const bgColor = theme.backref.bgColor;
    const textColor = theme.backref.textColor;
    const a = textRect({
      str: `${theme.backref.strPrefix} #${node.num}`,
      x,
      y,
      bgColor,
      textColor,
      theme,
    });
    a.rect.r = theme.backref.radius;
    return a;
  },
  repeat: ({ node, x, y, theme }: PlotNodeParams) => {
    if (elideOK(node)) {
      return plotNode.empty({
        node: null,
        x,
        y,
      });
    }
    const padding = theme.repeat.padding;
    const LABEL_MARGIN = theme.repeat.labelMargin;
    const { repeat } = node;
    let txt = '';
    let items = [];
    /* if (repeat.min===0 && !node._branched) {
      node._branched=true;
      return plotNode.choice({type:CHOICE_NODE,branches:[[{type:EMPTY_NODE}],[node]]},x,y);
    } */
    if (repeat.min === repeat.max && repeat.min === 0) {
      return plotNode.empty({ node: null, x, y }); // so why allow /a{0}/ ?
    }

    const ret = plotNode[node.type]({
      node,
      x,
      y,
      theme,
    });
    let { width } = ret;
    let { height } = ret;

    if (repeat.min === repeat.max && repeat.min === 1) {
      return ret; // if someone write /a{1}/
    }
    if (repeat.min === repeat.max) {
      txt += plural(repeat.min);
    } else {
      txt += repeat.min;
      if (Number.isFinite(repeat.max)) {
        txt += (repeat.max - repeat.min > 1 ? ' to ' : ' or ') + plural(repeat.max);
      } else {
        txt += ' or more times';
      }
    }

    let offsetX = padding;
    let offsetY = 0;
    const r = padding;
    let rectH = ret.y + ret.height - y;
    const rectW = padding * 2 + ret.width;
    width = rectW;
    let p; // repeat rect box path
    if (repeat.max !== 1) {
      // draw repeat rect box
      rectH += padding;
      height += padding;
      p = {
        type: 'path',
        path: [
          'M',
          ret.x + padding,
          y,
          'Q',
          x,
          y,
          x,
          y + r,
          'V',
          y + rectH - r,
          'Q',
          x,
          y + rectH,
          x + r,
          y + rectH,
          'H',
          x + rectW - r,
          'Q',
          x + rectW,
          y + rectH,
          x + rectW,
          y + rectH - r,
          'V',
          y + r,
          'Q',
          x + rectW,
          y,
          ret.x + ret.width + padding,
          y,
        ],
        _translate: curveTranslate,
        stroke: theme.repeat.max.greedy.stroke,
        'stroke-width': theme.repeat.strokeWidth,
      };
      if (repeat.nonGreedy) {
        // txt+="(NonGreedy!)";
        p.stroke = theme.repeat.max.nonGreedy.stroke;
        p['stroke-dasharray'] = '-';
      }
      items.push(p);
    } else {
      // so completely remove label when /a?/ but not /a??/
      // @ts-ignore
      txt = false;
    }

    let skipPath;
    if (repeat.min === 0) {
      // draw a skip path
      const skipRectH = y - ret.y + padding;
      const skipRectW = rectW + padding * 2;
      offsetX += padding;
      offsetY = -padding - 2; // tweak,stroke-width is 2
      width = skipRectW;
      height += padding;
      skipPath = {
        type: 'path',
        path: [
          'M',
          x,
          y,
          'Q',
          x + r,
          y,
          x + r,
          y - r,
          'V',
          y - skipRectH + r,
          'Q',
          x + r,
          y - skipRectH,
          x + r * 2,
          y - skipRectH,
          'H',
          x + skipRectW - r * 2,
          'Q',
          x + skipRectW - r,
          y - skipRectH,
          x + skipRectW - r,
          y - skipRectH + r,
          'V',
          y - r,
          'Q',
          x + skipRectW - r,
          y,
          x + skipRectW,
          y,
        ],
        _translate: curveTranslate,
        stroke: repeat.nonGreedy ? theme.repeat.min.nonGreedy.stroke : theme.repeat.min.greedy.stroke,
        'stroke-width': theme.repeat.strokeWidth,
      };
      if (p) translate([p], padding, 0);
      items.push(skipPath);
    }

    if (txt) {
      const tl = textLabel({
        x: x + width / 2,
        y,
        str: txt,
        theme,
      });
      translate([tl.label], 0, rectH + tl.height + LABEL_MARGIN); // bottom  label
      items.push(tl.label);
      height += LABEL_MARGIN + tl.height;
      const labelOffsetX = (Math.max(tl.width, width) - width) / 2;
      if (labelOffsetX) {
        translate(items, labelOffsetX, 0);
      }
      width = Math.max(tl.width, width);
      offsetX += labelOffsetX;
    }

    translate(ret.items, offsetX, 0);
    items = items.concat(ret.items);

    function curveTranslate(x, y) {
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
      p[18] += x;
      p[19] += y;
      p[20] += x;
      p[21] += y;
      p[23] += y;
      p[25] += x;
      p[26] += y;
      p[27] += x;
      p[28] += y;
    }

    return {
      items,
      width,
      height,
      x,
      y: ret.y + offsetY,
      lineInX: ret.lineInX + offsetX,
      lineOutX: ret.lineOutX + offsetX,
    };
  },
  choice: ({ node, x, y, theme }: PlotNodeParams) => {
    if (elideOK(node)) {
      plotNode.empty({
        node: null,
        x,
        y,
        theme,
      });
    }
    const marginX = 20;
    const spacing = 6;
    const paddingY = 4;
    let height = 0;
    let width = 0;
    const branches = node.branches.map((branch) => {
      const ret = plotTree({
        tree: branch,
        x,
        y,
        theme,
      });
      height += ret.height;
      width = Math.max(width, ret.width);
      return ret;
    });
    height += (branches.length - 1) * spacing + paddingY * 2;
    width += marginX * 2;

    const centerX = x + width / 2;
    let dy = y - height / 2 + paddingY; // destY
    const lineOutX = x + width;
    let items = [];
    branches.forEach((a) => {
      const dx = centerX - a.width / 2; // destX
      translate(a.items, dx - a.x, dy - a.y);
      items = items.concat(a.items);
      /*
      var p1=smoothLine(x,y,dx-a.x+a.lineInX,y+dy-a.y);
      var p2=smoothLine(lineOutX,y,a.lineOutX+dx-a.x,y+dy-a.y);
      items=items.concat(a.items);
      items.push(p1,p2); */
      // current a.y based on y(=0),its middle at y=0
      const lineY = y + dy - a.y;
      const p1 = smoothLine({
        fromX: x,
        fromY: y,
        toX: x + marginX,
        toY: lineY,
        theme,
      });
      const p2 = smoothLine({
        fromX: lineOutX,
        fromY: y,
        toX: x + width - marginX,
        toY: lineY,
        theme,
      });
      items.push(p1, p2);
      if (x + marginX !== dx - a.x + a.lineInX) {
        items.push(
          hline({
            x: x + marginX,
            y: lineY,
            destX: dx - a.x + a.lineInX,
            theme,
          }),
        );
      }
      if (a.lineOutX + dx - a.x !== x + width - marginX) {
        items.push(
          hline({
            x: a.lineOutX + dx - a.x,
            y: lineY,
            destX: x + width - marginX,
            theme,
          }),
        );
      }

      a.x = dx;
      a.y = dy;
      dy += a.height + spacing;
    });

    return {
      items,
      width,
      height,
      x,
      y: y - height / 2,
      lineInX: x,
      lineOutX,
    };
  },
  charset: ({ node, x, y, theme }: PlotNodeParams) => {
    const padding = 6;
    const spacing = 4;
    const clsDesc = {
      d: 'Digit',
      D: 'NonDigit',
      w: 'Word',
      W: 'NonWord',
      s: 'WhiteSpace',
      S: 'NonWhiteSpace',
    };
    const boxColor = node.exclude ? theme.charset.boxColor.exclude : theme.charset.boxColor.include;
    const labelColor = node.exclude ? theme.charset.labelColor.exclude : theme.charset.labelColor.include;
    const simple = onlyCharClass(node);
    if (simple) {
      const a = textRect({
        str: clsDesc[node.classes[0]],
        x,
        y,
        bgColor: theme.charset.class.bgColor,
        textColor: theme.charset.class.textColor,
        theme,
      });
      a.rect.r = 5;
      if (!node.exclude) {
        return a;
      }
      const tl = textLabel({
        x: a.x + a.width / 2,
        y: a.y,
        str: 'None of:',
        color: labelColor,
        theme,
      });
      const { items } = a;
      items.push(tl.label);
      const oldWidth = a.width;
      const width = Math.max(tl.width, a.width);
      const offsetX = (width - oldWidth) / 2; // ajust label text
      translate(items, offsetX, 0);
      return {
        items,
        width,
        height: a.height + tl.height,
        x: Math.min(tl.x, a.x),
        y: tl.y,
        lineInX: offsetX + a.x,
        lineOutX: offsetX + a.x + a.width,
      };
    }
    if (!node.chars && !node.ranges.length && !node.classes.length) {
      // It must be exclude charset here
      const a = textRect({
        str: theme.charset.anyChar.text,
        x,
        y,
        bgColor: theme.charset.anyChar.bgColor,
        textColor: theme.charset.anyChar.textColor,
        theme,
      });
      a.rect.r = 5;
      return a;
    }
    let packs = [];
    let ret;
    let width = 0;
    let height = 0;
    if (node.chars) {
      ret = textRect({
        str: node.chars,
        x,
        y,
        bgColor: theme.charset.char.bgColor,
        textColor: theme.charset.char.textColor,
        theme,
      });
      ret.rect.r = 5;
      packs.push(ret);
      width = ret.width;
    }
    node.ranges.forEach((rg) => {
      rg = rg.split('').join('-');
      const ret = textRect({
        str: rg,
        x,
        y,
        bgColor: theme.charset.range.bgColor,
        textColor: theme.charset.range.textColor,
        theme,
      });
      ret.rect.r = 5;
      packs.push(ret);
      width = Math.max(ret.width, width);
    });
    node.classes.forEach((cls) => {
      const ret = textRect({
        str: clsDesc[cls],
        x,
        y,
        bgColor: theme.charset.class.bgColor,
        textColor: theme.charset.class.textColor,
        theme,
      });
      ret.rect.r = 5;
      packs.push(ret);
      width = Math.max(ret.width, width);
    });

    const singleBoxHeight = packs[0].height;

    const pack1 = [];
    const pack2 = [];
    packs.sort((a, b) => b.width - a.width);
    packs.forEach((a) => {
      if (a.width * 2 + spacing > width) {
        pack1.push(a);
      } else {
        pack2.push(a); // can be inline
      }
    });
    packs = pack1;
    let a1;
    let a2;
    while (pack2.length) {
      a1 = pack2.pop();
      a2 = pack2.pop();
      if (!a2) {
        packs.push(a1);
        break;
      }
      if (a1.width - a2.width > 2) {
        packs.push(a1);
        pack2.push(a2);
        // eslint-disable-next-line no-continue
        continue;
      }
      translate(a2.items, a1.width + spacing, 0);
      packs.push({
        items: a1.items.concat(a2.items),
        width: a1.width + a2.width + spacing,
        height: a1.height,
        x: a1.x,
        y: a1.y,
      });
      height -= a1.height;
    }

    width += padding * 2;
    height = (packs.length - 1) * spacing + packs.length * singleBoxHeight + padding * 2;

    const rect = {
      type: 'rect',
      x,
      y: y - height / 2,
      r: 4,
      width,
      height,
      stroke: 'none',
      fill: boxColor,
    };

    let startY = rect.y + padding;
    // @ts-ignore
    let items: any = [rect];

    packs.forEach((a) => {
      translate(a.items, x - a.x + (width - a.width) / 2, startY - a.y);
      items = items.concat(a.items);
      startY += a.height + spacing;
    });
    const tl = textLabel({
      x: rect.x + rect.width / 2,
      y: rect.y,
      str: `${node.exclude ? 'None' : 'One'} of:`,
      color: labelColor,
      theme,
    });
    items.push(tl.label);
    const oldWidth = width;
    width = Math.max(tl.width, width);
    const offsetX = (width - oldWidth) / 2; // ajust label text
    translate(items, offsetX, 0);
    return {
      items,
      width,
      height: height + tl.height,
      x: Math.min(tl.x, x),
      y: tl.y,
      lineInX: offsetX + x,
      lineOutX: offsetX + x + rect.width,
    };
  },
  group: ({ node, x, y, theme }: PlotNodeParams) => {
    if (elideOK(node)) {
      return plotNode.empty({
        node: null,
        x,
        y,
        theme,
      });
    }
    const padding = theme.group.padding;
    const lineColor = theme.group.lineColor;
    const strokeWidth = theme.group.strokeWidth;
    const sub = plotTree({
      tree: node.sub,
      x,
      y,
      theme,
    });
    if (node.num) {
      translate(sub.items, padding, 0);
      const rectW = sub.width + padding * 2;
      const rectH = sub.height + padding * 2;
      const rect = {
        type: 'rect',
        x,
        y: sub.y - padding,
        r: 6,
        width: rectW,
        height: rectH,
        'stroke-dasharray': '.',
        stroke: lineColor,
        'stroke-width': strokeWidth,
      };
      const tl = textLabel({
        x: rect.x + rect.width / 2,
        y: rect.y - strokeWidth,
        str: `Group #${node.num}`,
        theme,
      });
      const items = sub.items.concat([rect, tl.label]);
      const width = Math.max(tl.width, rectW);
      const offsetX = (width - rectW) / 2; // ajust label text space
      if (offsetX) translate(items, offsetX, 0);
      return {
        items,
        width,
        height: rectH + tl.height + 4, // 4 is margin
        x,
        y: tl.y,
        lineInX: offsetX + sub.lineInX + padding,
        lineOutX: offsetX + sub.lineOutX + padding,
      };
    }
    return sub;
  },
  assert: ({ node, x, y, theme }: PlotNodeParams) => {
    const simpleAssert = {
      // 匹配非单词边界 \B
      AssertNonWordBoundary: {
        bg: theme.assert.nonWordBoundary.bgColor,
        fg: theme.assert.nonWordBoundary.textColor,
      },
      // 匹配一个单词边界 \b
      AssertWordBoundary: {
        bg: theme.assert.wordBoundary.bgColor,
        fg: theme.assert.wordBoundary.textColor,
      },
      // 结尾 $
      AssertEnd: {
        bg: theme.assert.end.bgColor,
        fg: theme.assert.end.textColor,
      },
      // 开头 ^
      AssertBegin: {
        bg: theme.assert.begin.bgColor,
        fg: theme.assert.begin.textColor,
      },
    };
    const nat = node.assertionType;
    let txt = `${nat.replace('Assert', '')}!`;
    const conf = simpleAssert[nat];
    if (conf) {
      if (theme.global.multiLine && (nat === 'AssertBegin' || nat === 'AssertEnd')) {
        txt = `Line${txt}`;
      }
      return textRect({
        str: txt,
        x,
        y,
        bgColor: conf.bg,
        textColor: conf.fg,
        theme,
      });
    }

    let lineColor;
    let fg;
    const padding = 8;
    if (nat === AssertLookahead) {
      lineColor = theme.assert.lookahead.lineColor;
      fg = theme.assert.lookahead.textColor;
      txt = 'Followed by:';
    } else if (nat === AssertNegativeLookahead) {
      lineColor = theme.assert.negativeLookahead.lineColor;
      fg = theme.assert.negativeLookahead.textColor;
      // txt="Negative\nLookahead!"; // break line
      txt = 'Not followed by:';
    }

    const sub = plotNode.group({
      node,
      x,
      y,
      theme,
    });
    const rectH = sub.height + padding * 2;
    const rectW = sub.width + padding * 2;
    const rect = {
      type: 'rect',
      x,
      y: sub.y - padding,
      r: theme.assert.rect.radius,
      width: rectW,
      height: rectH,
      'stroke-dasharray': '-',
      stroke: lineColor,
      'stroke-width': theme.assert.rect.strokeWidth,
    };

    const tl = textLabel({
      x: rect.x + rectW / 2,
      y: rect.y,
      str: txt,
      color: fg,
      theme,
    });
    const width = Math.max(rectW, tl.width);
    const offsetX = (width - rectW) / 2; // ajust label text
    translate(sub.items, offsetX + padding, 0);

    if (offsetX) translate([rect, tl.label], offsetX, 0);
    const items = sub.items.concat([rect, tl.label]);
    return {
      items,
      width,
      height: rect.height + tl.height,
      x,
      y: tl.y,
      lineInX: offsetX + sub.lineInX + padding,
      lineOutX: offsetX + sub.lineOutX + padding,
    };
  },
};
