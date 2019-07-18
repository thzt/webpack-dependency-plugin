const fs = require('fs');
const Dependency = require('../util/dependency');

const [node, currentFile, adjacentListFile, parentKey] = process.argv;
const content = fs.readFileSync(adjacentListFile);
const adjacentList = JSON.parse(content);
const dependency = Dependency.fromJSON(adjacentList);

// note: elapse时间累加，由于精度问题可能计算出的时间较长
// 因此，这里采用最大endTime减去最小startTime的方式来统计
const time = {
  minStartTime: Infinity,
  maxEndTime: 0,
};
const iter = dependency.walk({
  parent: {
    key: parentKey,
  },
});

while (true) {
  const { done, value } = iter.next();
  if (done) {
    break;
  }

  const { parent, child: { key, value: { startTime, endTime } } } = value;
  const { minStartTime, maxEndTime } = time;

  time.minStartTime = Math.min(minStartTime, startTime);
  time.maxEndTime = Math.max(maxEndTime, endTime);
}

console.log('total elapse: ', time.maxEndTime - time.minStartTime);
