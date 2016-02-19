import "babel-polyfill"

import channel from '../src/channel'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function hello(idx, ch) {
  await delay(1000*idx)
  console.log('hello world from process', idx)
  ch.put('done')
}

const NUM_PROCS = 4

async function main() {
  const ch = channel()

  for (var i = 1; i <= NUM_PROCS; i++) {
    hello(i, ch)
  }

  for (var i = 1; i <= NUM_PROCS; i++) {
    await ch.take('done')
  }
  console.log('all processes done')
}

main().catch(err => console.log(err))
