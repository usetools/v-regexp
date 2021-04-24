// @ts-nocheck
import {
  AssertNegativeLookahead,
  AssertLookahead,
  AssertWordBoundary,
  AssertEnd,
  AssertBegin,
  EXACT_NODE,
  CHARSET_NODE,
  ASSERT_NODE,
  AssertNonWordBoundary,
} from './constants';
import NFA from './NFA';
import K from './Kit';
import parse from './parse';

/**
Mock RegExp class
*/
RegExp.DEBUG = RegExp.D = 1;
RegExp.MULTILINE = RegExp.M = 2;
RegExp.GLOBAL = RegExp.G = 4;
RegExp.IGNORECASE = RegExp.I = 8;
function RegExp(re, options) {
  if (!(this instanceof RegExp)) return new RegExp(re, options);
  re += '';
  let opts = {};
  if (typeof options === 'string') {
    options = options.toLowerCase();
    if (~options.indexOf('i')) opts.ignoreCase = true;
    if (~options.indexOf('m')) opts.multiline = true;
    if (~options.indexOf('g')) opts.global = true;
    if (~options.indexOf('d')) opts.debug = true;
  } else {
    opts = options;
  }

  const ast = (this.ast = parse(re));
  this.source = re;
  this.multiline = !!opts.multiline;
  this.global = !!opts.global;
  this.ignoreCase = !!opts.ignoreCase;
  this.debug = !!opts.debug;
  this.flags = '';
  if (this.multiline) this.flags += 'm';
  if (this.ignoreCase) this.flags += 'i';
  if (this.global) this.flags += 'g';
  _readonly(this, ['source', 'options', 'multiline', 'global', 'ignoreCase', 'flags', 'debug']);

  const { ignoreCase } = this;
  ast.traverse((node) => {
    explainCharset(node, ignoreCase);
  }, CHARSET_NODE);
  ast.traverse((node) => {
    explainExact(node, ignoreCase);
  }, EXACT_NODE);
  if (this.multiline) ast.traverse(multilineAssert, ASSERT_NODE);
}

RegExp.prototype = {
  toString() {
    return `/${this.source}/${this.flags}`;
  },
  test(s) {
    return this.exec(s) !== null;
  },
  exec(s) {
    const nfa = this.getNFA();
    let ret;
    let startIndex = this.global ? this.lastIndex || 0 : 0;
    const max = s.length;
    for (; startIndex < max; startIndex++) {
      ret = nfa.input(s, startIndex);
      if (ret.acceptable) break;
    }
    if (!ret || !ret.acceptable) {
      this.lastIndex = 0;
      return null;
    }
    const groups = new Array(this.ast.groupCount + 1);
    groups[0] = s.slice(startIndex, ret.lastIndex + 1);
    const { stack } = ret;
    for (let i = 1, l = groups.length; i < l; i++) {
      groups[i] = getGroupContent(stack, i, s);
    }
    this.lastIndex = ret.lastIndex + 1;
    groups.index = startIndex;
    groups.input = s;
    return groups;
  },
  getNFA() {
    if (this._nfa) return this._nfa;
    let nfa;
    const { ast } = this;
    stateGUID = 1; // reset state guid
    nfa = tree2NFA(ast.tree);
    nfa = NFA(nfa, this.debug);
    this._nfa = nfa;
    return nfa;
  },
};

function explainExact(node, ignoreCase) {
  // expand exact node to ignore case
  let ranges;
  ranges = node.chars.split('');
  if (ignoreCase) {
    ranges = ranges.map((c) => {
      if (/[a-z]/.test(c)) return [c, c.toUpperCase()];
      if (/[A-Z]/.test(c)) return [c, c.toLowerCase()];
      return [c];
    });
  } else {
    ranges = ranges.map((c) => [c]);
  }
  node.explained = ranges;
}

function multilineAssert(node) {
  const at = node.assertionType;
  if (at === AssertBegin || at === AssertEnd) node.multiline = true;
}

// var anyChar='\0\uffff';
const anyCharButNewline = K.parseCharset('^\n\r\u2028\u2029'); // \n \r \u2028 \u2029.But what's "\u2028" and "\u2029"
// Not used
const charClass2ranges = {
  //  e.g. \d\D\w\W\s\S
  d: ['09'],
  w: ['AZ', 'az', '09', '_'],
  s: ' \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000'.split(
    '',
  ),
};
['d', 'w', 's'].forEach((cls) => {
  // D W S,negate ranges
  charClass2ranges[cls.toUpperCase()] = K.negate(charClass2ranges[cls]);
});

function explainCharset(node, ignoreCase) {
  let ranges = node.chars.split('');
  ranges = ranges.concat(K.flatten2(node.classes.map((cls) => charClass2ranges[cls])));
  ranges = ranges.concat(node.ranges);
  if (ignoreCase) ranges = expandRangeIgnoreCase(ranges);
  ranges = K.classify(ranges).ranges;
  if (node.exclude) ranges = K.negate(ranges);
  ranges = K.coalesce(ranges); // compress ranges
  node.explained = ranges;
}

// expand ['Aa'] to ['az','Aa']
function expandRangeIgnoreCase(ranges) {
  return K.flatten2(
    ranges.map((r) => {
      const parts = K.classify([r, 'az', 'AZ']).map[r];
      return K.flatten2(
        parts.map((p) => {
          if (/[a-z]/.test(p)) {
            return [p, p.toUpperCase()];
          }
          if (/[A-Z]/.test(p)) {
            return [p, p.toLowerCase()];
          }
          return [p];
        }),
      );
    }),
  );
}

function tree2NFA(stack, from) {
  let trans = [];
  let accepts;
  from = from || ['start'];
  accepts = stack.reduce((from, node) => {
    const a = node2NFA(node, from);
    trans = trans.concat(a.trans);
    return a.accepts;
  }, from);
  return { accepts, trans };
}

/*
return {trans:[Transition],accepts:[State]}
*/
function node2NFA(node, from) {
  if (node.repeat) {
    return repeatNFA(node, from);
  }
  return NFABuilders[node.type](node, from);
}

function getGroupContent(stack, num, s) {
  let start;
  let end;
  let match;
  for (var i = 0, l = stack.length, item; i < l; i++) {
    item = stack[i];
    if (item.num === num) {
      if (item.type === GROUP_CAPTURE_END) {
        end = item.index;
      } else if (item.type === GROUP_CAPTURE_START) {
        start = item.index;
        break;
      }
    }
  }
  if (start === undefined || end === undefined) return;
  return s.slice(start, end);
}

var stateGUID = 0;
function newState() {
  return `q${stateGUID++}`;
}

var GROUP_CAPTURE_START = 'GroupCaptureStart';
var GROUP_CAPTURE_END = 'GroupCaptureEnd';

var NFABuilders = (function _() {
  function exact(node, from) {
    const ts = [];
    let to;
    const ranges = node.explained;
    ranges.forEach((range) => {
      ts.push({ from, to: (to = [newState()]), charset: range });
      from = to;
    });
    return { accepts: to, trans: ts };
  }

  function charset(node, from) {
    const to = [newState()];
    return { accepts: to, trans: [{ from, to, charset: node.explained }] };
  }
  function dot(node, from) {
    const to = [newState()];
    return { accepts: to, trans: [{ from, to, charset: anyCharButNewline }] };
  }

  function empty(node, from) {
    const to = [newState()];
    return { accepts: to, trans: [{ from, to, charset: false }] };
  }

  function group(node, from) {
    const groupStart = [newState()];
    let ts = [
      {
        from,
        to: groupStart,
        charset: false,
        action:
          !node.nonCapture &&
          function _groupStart(stack, c, i) {
            stack.unshift({ type: GROUP_CAPTURE_START, num: node.num, index: i });
          },
      },
    ];

    from = groupStart;
    const a = tree2NFA(node.sub, from);
    ts = ts.concat(a.trans);
    const groupEnd = [newState()];
    ts.push({
      from: a.accepts,
      to: groupEnd,
      charset: false,
      action:
        !node.nonCapture &&
        function _groupEnd(stack, c, i) {
          stack.unshift({ type: GROUP_CAPTURE_END, num: node.num, index: i });
        },
    });
    return { accepts: groupEnd, trans: ts };
  }

  function backref(node, from) {
    const to = [newState()];
    const groupNum = node.num;
    return {
      accepts: to,
      trans: [
        {
          from,
          to,
          charset: false,
          assert: function _aBackref(stack, c, i, state, s) {
            // static invalid backref will throw parse error
            // dynamic invalid backref will treat as empty string
            // e.g. /(?:(\d)|-)\1/ will match "-"
            let match = getGroupContent(stack, groupNum, s);
            if (match === undefined) {
              match = '';
            }
            if (s.slice(i, i + match.length) === match) {
              return match.length;
            }
            return false;
          },
        },
      ],
    };
  }

  function choice(node, from) {
    let ts = [];
    let to = [];
    node.branches.forEach((branch) => {
      const a = tree2NFA(branch, from);
      ts = ts.concat(a.trans);
      to = to.concat(a.accepts);
    });
    return { trans: ts, accepts: to };
  }

  function assert(node, from) {
    let f;
    switch (node.assertionType) {
      case AssertBegin:
        f = node.multiline ? _assertLineBegin : _assertStrBegin;
        break;
      case AssertEnd:
        f = node.multiline ? _assertLineEnd : _assertStrEnd;
        break;
      case AssertWordBoundary:
        f = function _WB(_, c, i, state, s) {
          return _isBoundary(i, s);
        };
        break;
      case AssertNonWordBoundary:
        f = function _NWB(_, c, i, state, s) {
          return !_isBoundary(i, s);
        };
        break;
      case AssertLookahead:
        f = _lookahead(node);
        break;
      case AssertNegativeLookahead:
        f = _negativeLookahead(node);
        break;
    }
    return _newAssert(node, from, f);

    function _newAssert(node, from, assert) {
      const to = [newState()];
      return {
        accepts: to,
        trans: [
          {
            from,
            to,
            charset: false,
            assert,
          },
        ],
      };
    }
    function _lookahead(node) {
      const m = NFA(tree2NFA(node.sub, ['start']));
      return function _Lookahead(stack, c, i, state, s) {
        const ret = m.input(s, i, null, stack);
        return ret.acceptable;
      };
    }
    function _negativeLookahead(node) {
      const f = _lookahead(node);
      return function _NLookahead() {
        return !f.apply(this, arguments);
      };
    }

    function _isBoundary(i, s) {
      return !!(_isWordChar(i - 1, s) ^ _isWordChar(i, s));
    }
    function _isWordChar(i, s) {
      return i !== -1 && i !== s.length && /\w/.test(s[i]);
    }
    function _assertLineBegin(_, c, i, state, s) {
      return i === 0 || s[i - 1] === '\n';
    }
    function _assertStrBegin(_, c, i, state, s) {
      return i === 0;
    }
    function _assertLineEnd(_, c, i, state, s) {
      return i === s.length || c === '\n';
    }
    function _assertStrEnd(_, c, i, state, s) {
      return i === s.length;
    }
  }

  return {
    assert,
    choice,
    backref,
    group,
    empty,
    charset,
    dot,
    exact,
  };
})();

function repeatNFA(node, from) {
  const builder = NFABuilders[node.type];
  let a;
  let i;
  let trans = [];
  const { repeat } = node;
  const { min } = repeat;
  let { max } = repeat;
  i = min;
  while (i--) {
    a = builder(node, from);
    trans = trans.concat(a.trans);
    from = a.accepts;
  }
  let moreTrans = [];
  let accepts = [].concat(from);
  if (isFinite(max)) {
    for (; max > min; max--) {
      a = builder(node, from);
      moreTrans = moreTrans.concat(a.trans);
      from = a.accepts;
      accepts = accepts.concat(a.accepts);
    }
  } else {
    const beforeStates = from.slice();
    a = builder(node, from);
    moreTrans = moreTrans.concat(a.trans);
    accepts = accepts.concat(a.accepts);
    moreTrans.push({
      from: a.accepts,
      to: beforeStates,
      charset: false,
    });
  }
  const endState = [newState()];
  if (repeat.nonGreedy) {
    trans.push({
      from: accepts,
      to: endState,
      charset: false,
    });
    trans = trans.concat(moreTrans);
  } else {
    trans = trans.concat(moreTrans);
    trans.push({
      from: accepts,
      to: endState,
      charset: false,
    });
  }
  return { accepts: endState, trans };
}

function _readonly(obj, attrs) {
  attrs.forEach((a) => {
    Object.defineProperty(obj, a, { writable: false, enumerable: true });
  });
}

export default RegExp;
