import K from './Kit';

/**
A Naive NFA Implementation

Start state is always named 'start'
 a
type NFAConfig = {compact:false,accepts:StateSet,trans:[Transition]}
type State = String
type StateSet = [State]
type Tranisition = {from:StateSet,to:StateSet,charset:Charset,action:Action,assert:Assert}
type Charset = String|[Range]
  Charset is similar to regex charset,supports negation and range but metacharacters
  Examples:
    includes: 'abc0-9','[^]'
    excludes: '^c-z0-9','^a^' //excluded 'a' and '^' two chars
    any char: '\0-\uffff'
  Or set charset to processed disjoint ranges:['ac','d','eh']
Set `charset` to empty string to enable empty move(ε-moves).

Action:
  Function(stack:Array,c:String,i:Int,state:String,inputs:String):Array
    stack: storage stack
    c: current char
    i: current index
    state: current state
    inputs: whole input string
  Optional return new stack

Only eMove transition allow `assert`
Actions and Asserts of eMove transition always execute before non-eMove transitions on current path.
Assert:
  Function(stack:Array,c:String,i:Int,state:String,inputs:String):Boolean
    Return True if assertion just success,if fail return false
    If success and need skip num chars,
      return the Int count to increase `i`,this feature is designed for backref.

Stack modifications in action only allow shift,unshift and return new stack.

NFAConfig example used to recognize numbers:{
  compact:false,accepts:'start'.
  trans:[{from:'start',to:'start',charset:'0-9'}]
}

CompactNFAConfig example,see `structure` function.
An automaton used to recognize triples:{
  compact:true,accepts:'start',
  trans:[
    ['start>start','0369'],['start>q1','147'],['start>q2','258'],
    ['q1>q1','0369'],['q1>q2','147'],['q1>start','258'],
    ['q2>q2','0369'],['q2>q1','258'],['q2>start','147'],
  ]
};

*/
function NFA(a) {
  a = a.compact ? structure(a) : a;
  const accepts = {};
  let i;
  let n;
  const { trans } = a;
  // FMap={toState:Function}
  const router = {
    /*
        fromState : {
          eMove:[{to:State,action:Function,assert:Function,eMove:Bool}],
          eMoveStates:[State],// ε-move dest states
          charMove:{
            // expanded to include eMove
            Range:[{to:State,action:Function,assert:Function,eMove:Bool}],
            Char:[{to:State,action:Function,assert:Function,eMove:Bool}]
          },
          ranges:Set([Range]),
          // all trans keep original order in transitions list
          trans:[Transition]
        }
      */
  };

  for (i = 0, n = a.accepts.length; i < n; i++) accepts[a.accepts[i]] = true; // add accept states

  let t;
  for (i = 0, n = trans.length; i < n; i++) {
    // collect charsets
    t = trans[i];
    if (t.charset) t.ranges = typeof t.charset === 'string' ? K.parseCharset(t.charset) : t.charset;
    else t.eMove = true;
    t.from.forEach((from) => {
      const path = (router[from] = router[from] || {
        eMoveStates: [],
        eMove: [],
        charMove: {},
        trans: [],
        ranges: [],
      });
      if (t.eMove) path.eMoveStates = path.eMoveStates.concat(t.to);
      else path.ranges = path.ranges.concat(t.ranges);
      path.trans.push(t);
    });
  }
  const fromStates = Object.keys(router);
  fromStates.forEach((from) => {
    const path = router[from];
    const { trans } = path;
    const { charMove } = path;
    const { eMove } = path;
    let { ranges } = path;
    const cls = K.classify(ranges);
    const rangeMap = cls.map;
    trans.forEach((t) => {
      if (t.eMove) {
        t.to.forEach((toState) => {
          eMove.push({
            to: toState,
            action: t.action,
            assert: t.assert,
            eMove: true,
          });
        });
      } else {
        K.flatten2(t.ranges.map((r) => rangeMap[r])).forEach((r) => {
          (charMove[r] = charMove[r] || []).push(t);
        });
      }
    });
    ranges = K.Set(cls.ranges.filter((rg) => !!rg[1])); // exclude single char
    path.ranges = ranges;
    // expand charMove to includes ε-move
    Object.keys(charMove).forEach((r) => {
      const transChar = charMove[r];
      const transAll = [];
      trans.forEach((t) => {
        t.to.forEach((toState) => {
          if (t.eMove || ~transChar.indexOf(t)) {
            transAll.push({
              to: toState,
              action: t.action,
              assert: t.assert,
              eMove: t.eMove,
            });
          }
        });
      });
      charMove[r] = transAll;
    });
    delete path.trans;
    delete path.eMoveStates;
  });

  return {
    accepts,
    router,
    input,
    assertDFA,
    accept,
  };
}

function accept(state) {
  return this.accepts.hasOwnProperty(state);
}

function assertDFA() {
  const { router } = this;
  const fromStates = Object.keys(router);
  let path;
  for (let i = 0, l = fromStates.length; i < l; i++) {
    path = router[fromStates[i]];
    if (path.eMove.length > 1) {
      throw new Error(`DFA Assertion Fail!\nFrom state \`${fromStates[i]}\` can goto to multi ε-move states!`);
    }
    const { charMove } = path;
    const ranges = Object.keys(charMove);
    for (let k = 0, n = ranges.length; k < n; k++) {
      const t = charMove[ranges[k]];
      if (t.length !== 1) {
        K.log(charMove);
        throw new Error(
          `DFA Assertion Fail!\nFrom state \`${fromStates[i]}\` via charset \`${ranges[k]}\` can goto to multi states!`,
        );
      }
    }
    if (ranges.length && path.eMove.length) {
      throw new Error(`DFA Assertion Fail!\nFrom state \`${fromStates[i]}\` can goto extra ε-move state!`);
    }
  }
  return true;
}

/**
return {
    stack:Array,
    acceptable:Boolean,
    lastIndex:Int,
    lastState:String
  }
*/
function input(s, startIndex, _debug) {
  startIndex = startIndex || 0;
  const _this = this;
  return _input(s, startIndex, 'start', [], startIndex - 1);
  function _input(s, startIndex, fromState, stack, lastIndex) {
    recur: do {
      var c;
      var range;
      var advanceIndex;
      var lastResult;
      const path = _this.router[fromState];
      if (!path) break;
      const { eMove } = path;
      const { charMove } = path;
      var trans;
      if (startIndex < s.length) {
        c = s[startIndex];
        if (charMove.hasOwnProperty(c)) {
          trans = charMove[c];
        } else if ((range = findRange(path.ranges, c))) {
          trans = charMove[range];
        } else {
          trans = eMove;
        }
      } else {
        trans = eMove;
      }

      let sp = stack.length;
      var t;
      var skip;
      var ret;
      const oldLastIndex = lastIndex;
      for (let j = 0, n = trans.length; j < n; j++) {
        t = trans[j];
        advanceIndex = t.eMove ? 0 : 1;
        lastIndex = oldLastIndex;
        stack.splice(0, stack.length - sp);
        sp = stack.length; // backup stack length
        if (t.assert) {
          if ((skip = t.assert(stack, c, startIndex, fromState, s)) === false) continue;
          // For backref skip num chars
          if (typeof skip === 'number') {
            startIndex += skip;
            lastIndex += skip;
          }
        }
        if (t.action) stack = t.action(stack, c, startIndex, fromState, s) || stack;
        lastIndex = t.eMove ? lastIndex : startIndex;
        _debug && K.log(`${c}:${fromState}>${t.to}`);
        if (j === n - 1) {
          startIndex += advanceIndex;
          fromState = t.to;
          continue recur; // Human flesh tail call optimize?
        } else {
          ret = _input(s, startIndex + advanceIndex, t.to, stack, lastIndex);
        }
        if (ret.acceptable) return ret;
        lastResult = ret;
      }
      if (lastResult) return lastResult;
      break;
    } while (true);

    return {
      stack,
      lastIndex,
      lastState: fromState,
      acceptable: _this.accept(fromState),
    };
  }
}

/** ε-closure
return closureMap {fromState:[toState]}
eMoveMap = {fromState:{to:[State]}}
*/
function eClosure(eMoves, eMoveMap) {
  const closureMap = {};
  eMoves.forEach((state) => {
    // FK forEach pass extra args
    closure(state);
  });
  return closureMap;

  function closure(state, _chain) {
    if (closureMap.hasOwnProperty(state)) return closureMap[state];
    if (!eMoveMap.hasOwnProperty(state)) return false;
    _chain = _chain || [state];
    const dest = eMoveMap[state];
    let queue = dest.to.slice();
    const toStates = [state];
    let s;
    let clos;
    while (queue.length) {
      s = queue.shift();
      if (~_chain.indexOf(s)) {
        throw new Error(`Recursive ε-move:${_chain.join('>')}>${s}!`);
      }
      clos = closure(s, _chain);
      if (clos) queue = clos.slice(1).concat(queue);
      toStates.push(s);
    }
    return (closureMap[state] = toStates);
  }
}

function findRange(ranges, c /*: Char */) {
  const i = ranges.indexOf(c, cmpRange);
  if (!~i) return false;
  return ranges[i];
}

function cmpRange(c, rg) {
  const head = rg[0];
  const tail = rg[1];
  if (c > tail) return 1;
  if (c < head) return -1;
  return 0;
}

/**
Convert CompactNFAConfig to NFAConfig
 a
type CompactNFAConfig={compact:true,accepts:CompactStateSet,trans:[CompactTransition]}
type CompactStateSet = StateSet.join(",")
type CompactTransition = [CompactStateMap,Charset,Action,Assert]
type CompactStateMap = FromStateSet.join(",")+">"+ToStateSet.join(",")
*/
function structure(a) {
  a.accepts = a.accepts.split(',');
  const ts = a.trans;
  let i = ts.length;
  let t;
  let s;
  let from;
  let to;
  while (i--) {
    t = ts[i];
    s = t[0].split('>');
    from = s[0].split(',');
    to = s[1].split(',');
    ts[i] = {
      from,
      to,
      charset: t[1],
      action: t[2],
      assert: t[3],
    };
  }
  a.compact = false;
  return a;
}

export default NFA;
