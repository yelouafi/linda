import "babel-polyfill"

import prog, { In, Out, Eval, any } from './lprog'

function* helloWorld(i) {
  const [j] = yield In('count')
  yield Out('count', j+1)
  console.log('hello world from process', i, 'count', j)
}

const NUM_PROCS = 4

function* main() {
  yield Out('count', 0)
  for (var i = 0; i < NUM_PROCS; i++) {
    yield Eval('worker', helloWorld, i)
  }
  yield In('count', NUM_PROCS)
  console.log('all processes done')
}

prog(main)
