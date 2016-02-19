import "babel-polyfill"

import prog, { In, Out, Eval } from '../src/lprog-gen'

function* hello(idx) {
  console.log('hello world from process', idx)
  yield Out('done')
}

const NUM_PROCS = 4

function* main() {
  console.log('in main')
  for (var i = 0; i < NUM_PROCS; i++) {
    yield Eval('worker', hello(i))
  }
  for (var i = 0; i < NUM_PROCS; i++) {
    yield In('done')
  }
  console.log('all processes done')
}

prog(main())
