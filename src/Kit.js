/* Kit */

const AP = Array.prototype;
const { slice } = AP;
const isBrowser = (function (_this) {
  return _this?.toString() === '[object Window]';
})(window);

/**
Build sorted Set from array.
This function will corrupt the original array
Proper usage:a=Set(a);
*/
function Set(a, _sorted) {
  if (a._Set) return a;
  if (!_sorted) a = sortUnique(a);

  // @returns Boolean. Detect if x is in set.
  // `cmp` is custom compare functions return -1,0,1.
  // function cmp(x,item):Ordering(LT=-1|EQ=0|GT=1);
  a.contains = function (x, cmp) {
    return !!~bsearch(a, x, cmp);
  };
  a.indexOf = function (x, cmp) {
    return bsearch(a, x, cmp);
  };
  a.toArray = function () {
    return copyArray(a);
  };

  /** Union with another Set
   return new Set */
  a.union = function (b) {
    b = Set(b);
    let n = a.length + b.length;
    const c = new a.constructor(n);
    for (let i = 0, j = 0, k = 0; k < n; k++) {
      // merge
      if (a[i] === b[j]) {
        c[k] = a[i++];
        j++;
        n--;
      } else if (a[i] < b[j]) c[k] = a[i++];
      else c[k] = b[j++];
    }
    c.length = n;
    return Set(c.length === n ? c : copyArray(c, n), true);
  };

  a.inspect = a.toArray;
  a._Set = true;
  return a;
}

const LT = -1;
const EQ = 0;
const GT = 1;
function cmpDefault(a, b) {
  // eslint-disable-next-line no-nested-ternary
  return a < b ? LT : a === b ? EQ : GT;
}
function bsearch(a, x, cmp = cmpDefault) {
  let lo = 0;
  const n = a.length;
  let hi = n - 1;
  let pivot;
  let c;
  if (n < 1) return -1;
  if (n === 1) return cmp(x, a[lo]) === EQ ? lo : -1;
  if (cmp(x, a[lo]) === LT || cmp(x, a[hi]) === GT) return -1;
  do {
    pivot = lo + ((hi - lo + 1) >> 1);
    c = cmp(x, a[pivot]);
    if (c === EQ) return pivot;
    if (c === LT) hi = pivot - 1;
    else lo = pivot + 1;
  } while (lo <= hi);
  return -1;
}

/**
Return sorted Set.
This function will corrupt the original array
Proper usage: a=sortUnique(a);
 a
 new unique sorted array
*/
function sortUnique(a) {
  const n = a.length;
  if (n <= 1) return a;
  // do a shell sort
  let k = 1;
  const hi = (n / 3) | 0;
  let i;
  let j;
  let tmp;
  while (k < hi) k = k * 3 + 1;
  while (k > 0) {
    for (i = k; i < n; i++) {
      for (j = i; j >= k && a[j] < a[j - k]; j -= k) {
        tmp = a[j];
        a[j] = a[j - k];
        a[j - k] = tmp;
      }
    }
    k = (k / 3) | 0;
  }

  let last = a[0];
  let x;
  for (i = 1, j = 1; i < n; i++) {
    x = a[i];
    if (x === last) continue;
    // eslint-disable-next-line no-multi-assign
    last = a[j++] = a[i];
  }
  a.length = j;
  return a.length === j ? a : copyArray(a, j); // Typed Array length property only has a getter
}

function copyArray(a, size) {
  size = typeof size === 'undefined' ? a.length : size;
  const ret = new a.constructor(size);
  let i = size;
  while (i--) ret[i] = a[i];
  return ret;
}

/**
Unique by toString.
This function will corrupt the original array but preserve the original order.
*/
function hashUnique(a) {
  const table = {};
  let i = 0;
  let j = 0;
  const l = a.length;
  let x;
  for (; i < l; i++) {
    x = a[i];
    // eslint-disable-next-line no-prototype-builtins
    if (table.hasOwnProperty(x)) continue;
    table[x] = 1;
    a[j++] = x;
  }
  a.length = j;
  return a;
}

/**
Object id unique.
This function will corrupt the original array.
Correct usage: a=idUnique(a);
 NonPrimitive Array
*/
function idUnique(a) {
  let i;
  let j;
  const l = a.length;
  let p;
  const guid = (Math.random() * 1e10).toString(32) + (+new Date()).toString(32);
  for (i = j = 0; i < l; i++) {
    p = a[i];
    if (p == null) continue;
    if (p.hasOwnProperty(guid)) continue;
    Object.defineProperty(p, guid, {
      value: 1,
      enumerable: false,
    });
    a[j++] = p;
  }
  i = j;
  while (i--) {
    // clean guid
    a[i][guid] = undefined;
  }
  a.length = j;
  return a;
}

/**
Classify charsets to non-overlapping sorted disjoint ranges.

Example: classify(['az','09','a','bb']) => {
  ranges:['a','b','cz','09'],
  map:{'az':['a','b','cz'],'09':['09'],'a':['a'],'b':['b']}
}
*/
function classify(ranges) {
  ranges = ranges.map((c) => (!c[1] ? c + c : c));
  let i;
  let j;
  let k;
  let l;
  let r;
  ranges = sortUnique(ranges);
  const n = ranges.length;
  const singleMap = Object.create(null);
  const headMap = Object.create(null);
  const tailMap = Object.create(null);
  let head;
  let tail;
  for (i = 0; i < n; i++) {
    r = ranges[i];
    tail = r[1];
    headMap[r[0]] = true;
    tailMap[tail] = true;
    for (j = i; j < n; j++) {
      head = ranges[j][0];
      if (head >= tail) {
        if (head === tail) singleMap[tail] = true;
        break;
      }
    }
  }
  const chars = sortUnique(ranges.join('').split(''));
  let results = Object.keys(singleMap);
  let c = chars[0];
  const tmpMap = Object.create(null);
  const map = Object.create(null);
  for (i = 0; i < n; i++) tmpMap[ranges[i]] = [];
  if (singleMap[c]) {
    for (i = 0; i < n; i++) {
      r = ranges[i];
      if (r[0] === c) tmpMap[r].push(c);
      else if (r[0] > c) break;
    }
  }
  for (i = 0, l = chars.length - 1; i < l; i++) {
    head = chars[i];
    tail = chars[i + 1];
    if (tailMap[head]) head = succ(head);
    if (headMap[tail]) tail = pred(tail);
    if (head <= tail) {
      c = head === tail ? head : head + tail;
      for (j = 0; j < n; j++) {
        r = ranges[j];
        if (r[0] > tail) break;
        if (r[0] <= head && tail <= r[1]) {
          tmpMap[r].push(c);
          results.push(c);
        }
      }
    }
    head = chars[i];
    tail = chars[i + 1]; // keep insert order,push single char later
    if (singleMap[tail]) {
      for (j = 0; j < n; j++) {
        r = ranges[j];
        if (r[0] > tail) break;
        if (r[0] <= tail && tail <= r[1]) tmpMap[r].push(tail);
      }
    }
  }
  results = sortUnique(results);
  // eslint-disable-next-line
  for (k in tmpMap) map[k[0] === k[1] ? k[0] : k] = tmpMap[k];
  return { ranges: results, map };
}

/**
Convert exclude ranges to include ranges
Example: ^b-y, ['by'] to ["\0a","z\uffff"]
@return Sorted disjoint ranges
*/
function negate(ranges /*: [Range rg] */) {
  const MIN_CHAR = '\u0000';
  // work around UglifyJS's bug
  // it will convert unicode escape to raw char
  // that will cause error in IE
  // because IE recognize "\uFFFF" in source code as "\uFFFD"
  const MAX_CHAR = String.fromCharCode(0xffff);

  ranges = classify(ranges).ranges;
  const negated = [];
  if (!ranges.length) return negated;
  if (ranges[0][0] !== MIN_CHAR) ranges.unshift(MAX_CHAR);
  const hi = ranges.length - 1;
  if ((ranges[hi][1] || ranges[hi][0]) !== MAX_CHAR) ranges.push(MIN_CHAR);
  ranges.reduce((acc, r) => {
    const start = succ(acc[1] || acc[0]);
    const end = pred(r[0]);
    if (start < end) negated.push(start + end);
    if (start === end) negated.push(start);
    return r;
  });
  return negated;
}

/**
Parse simple regex style charset string like '^a-bcdf' to disjoint ranges.
Character classes like "\w\s" are not supported!
 charset  Valid regex charset [^a-z0-9_] input as "^a-z0-9_".
 return sorted disjoint ranges
*/
function parseCharset(charset /*: String */) {
  charset = charset.split('');
  const chars = [];
  let ranges = [];
  const exclude = charset[0] === '^' && charset.length > 1 && charset.shift();
  charset.forEach((c) => {
    if (chars[0] === '-' && chars.length > 1) {
      // chars=['-','a'],c=='z'
      if (chars[1] > c) {
        // z-a  is invalid
        throw new Error(`Charset range out of order:${chars[1]}-${c}!`);
      }
      ranges.push(chars[1] + c);
      chars.splice(0, 2);
    } else chars.unshift(c);
  });
  ranges = ranges.concat(chars);
  // convert exclude to include
  return exclude ? negate(ranges) : classify(ranges).ranges;
}

/**
Coalesce closed ranges.
['ac','d','ez'] will be coalesced to ['az']
 ranges Sorted disjoint ranges return by `classify`.
 Compressed ranges
*/
function coalesce(ranges) {
  if (!ranges.length) return [];
  const results = [ranges[0]];
  ranges.reduce((a, b) => {
    const prev = results.length - 1;
    if (a[a.length - 1] === pred(b[0])) {
      results[prev] = results[prev][0] + b[b.length - 1];
      return results[prev];
    }
    results.push(b);
    return b;
  });
  return results.reduce((results, range) => {
    if (range.length === 2 && range[0] === pred(range[1])) {
      results.push(range[0]);
      results.push(range[1]);
    } else {
      results.push(range);
    }
    return results;
  }, []);
}

function chr(n) {
  return String.fromCharCode(n);
}
function ord(c) {
  return c.charCodeAt(0);
}
function pred(c) {
  return String.fromCharCode(c.charCodeAt(0) - 1);
}
function succ(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

const printEscapeMap = {
  '\n': '\\n',
  '\t': '\\t',
  '\f': '\\f',
  '\r': '\\r',
  ' ': ' ',
  '\\': '\\\\',
  '\0': '\\0',
};
// Convert string to printable,replace all control chars and unicode to hex escape
function toPrint(s, isRaw) {
  // eslint-disable-next-line no-control-regex
  const ctrl = /[\x00-\x1F\x7F-\x9F]/;
  const unicode = /[\u009F-\uFFFF]/;
  s = s
    .split('')
    .map((c) => {
      if (!isRaw && printEscapeMap.hasOwnProperty(c)) return printEscapeMap[c];
      if (unicode.test(c)) return `\\u${`00${ord(c).toString(16).toUpperCase()}`.slice(-4)}`;
      if (ctrl.test(c)) return `\\x${`0${ord(c).toString(16).toUpperCase()}`.slice(-2)}`;
      return c;
    })
    .join('');
  return s;
}
// flatten two-dimensional array to one-dimension
function flatten2(a) {
  return [].concat.apply([], a);
}
function repeats(s, n) {
  return new Array(n + 1).join(s);
}

function log() {
  // eslint-disable-next-line prefer-rest-params
  const a = slice.call(arguments);
  if (isBrowser) {
    // eslint-disable-next-line no-console
    Function.prototype.apply.apply(console.log, [console, a]);
  } else {
    // Assume it is Node.js
    const s = 'util';
    // eslint-disable-next-line
    const util = require(s); // skip require.js
    a.forEach((x) => {
      // eslint-disable-next-line no-console
      console.log(
        util.inspect(x, {
          showHidden: false,
          customInspect: true,
          depth: 64,
          colors: true,
        }),
      );
    });
  }
}

function locals(f) {
  const src = f.toString();
  const re = /^\s+function\s+([a-zA-Z]\w+)\s*\(/gm;
  const fns = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(src))) fns.push(match[1]);
  const methods = [];
  let fnsItem;
  // eslint-disable-next-line no-cond-assign
  while ((fnsItem = fns.pop())) methods.push(`${fnsItem}:${fnsItem}`);
  return `{\n${methods.join(',\n')}\n}`;
}

export default {
  sortUnique,
  idUnique,
  hashUnique,
  Set,
  repeats,
  negate,
  coalesce,
  classify,
  parseCharset,
  chr,
  ord,
  pred,
  succ,
  toPrint,
  flatten2,
  log,
  isBrowser,
  locals,
};
