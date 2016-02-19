import "babel-polyfill"

import channel from '../src/channel'


const randomPeriod = () =>  Math.ceil(Math.random() * 1000)
const sleepRandom = () => new Promise(resolve => setTimeout(resolve, randomPeriod()))

async function hello(idx, ch) {
  //await read('start')
  console.log('process', idx, 'started')
  await sleepRandom()
  console.log('process', idx, 'done')
  ch.put('done')
}

const NUM_PROCS = 4

async function main() {
  const chans = Array(NUM_PROCS)

  console.log('main process started')

  for (let i = 1; i <= NUM_PROCS; i++) {
    const ch = chans[i] = channel()
    hello(i, ch)
  }

  for (let i = 1; i <= NUM_PROCS; i++) {
    await chans[i].take()
    console.log('took process', i)
  }

  console.log('all processes done')
}

main().catch(err => console.log(err))
