"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fs = require('fs');

var Dependency = require('../util/dependency');

var _process$argv = _slicedToArray(process.argv, 4),
    node = _process$argv[0],
    currentFile = _process$argv[1],
    adjacentListFile = _process$argv[2],
    parentKey = _process$argv[3];

var content = fs.readFileSync(adjacentListFile);
var adjacentList = JSON.parse(content);
var dependency = Dependency.fromJSON(adjacentList); // note: elapse时间累加，由于精度问题可能计算出的时间较长
// 因此，这里采用最大endTime减去最小startTime的方式来统计

var time = {
  minStartTime: Infinity,
  maxEndTime: 0
};
var iter = dependency.walk({
  parent: {
    key: parentKey
  }
});

while (true) {
  var _iter$next = iter.next(),
      done = _iter$next.done,
      value = _iter$next.value;

  if (done) {
    break;
  }

  var parent = value.parent,
      _value$child = value.child,
      key = _value$child.key,
      _value$child$value = _value$child.value,
      startTime = _value$child$value.startTime,
      endTime = _value$child$value.endTime;
  var minStartTime = time.minStartTime,
      maxEndTime = time.maxEndTime;
  time.minStartTime = Math.min(minStartTime, startTime);
  time.maxEndTime = Math.max(maxEndTime, endTime);
}

console.log('total elapse: ', time.maxEndTime - time.minStartTime);