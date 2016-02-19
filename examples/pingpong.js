
import channel, { END } from '../src/channel'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function player(name, ch) {
  while (true) {
    const ball = await ch.take()
    if (ball === END) {
      console.log(name + ": table's gone")
      return;
    }
    ball.hits += 1;
    console.log(name + " " + ball.hits)
    await delay(100)
    await ch.put(ball)
  }
}

async function main() {

  const table = channel()

  player('ping', table)
  player('pong', table)

  await table.put({hits: 0})
  await delay(1000)
  table.close()
}

main()
