const noop = () => {}

export const END = Symbol('END')

const zeroBuffer = {
  get isFull() { return true },
  get hasMsg() { return false }
}

export function fixedBuffer (size = 10, buf = []) {
  return {
    get isFull() {
      return buf.length >= size
    },

    get hasMasg() {
      return buf.length
    },

    put(item) {
      buf.push(item)
    },

    take() {
      return buf.shift()
    }
  }
}

export default function channel(buf = zeroBuffer) {

  let putQueue = []
  let takeQueue = []
  let closed = false

  function putAsync(msg, cb = noop) {
    // putting not allowed on closed channels
    if(closed)
      return cb(false)

    // 1- check pending takers
    if (takeQueue.length) {
      // deliver the message to the oldest one waiting (First In First Out)
      const takeCb = takeQueue.shift()
      takeCb(msg)
      cb(true)
    }
    // 2- check if can still buffer
    else if(!buf.isFull) {
      buf.put(msg)
      cb(true)
    }
    // 3- otherwise, queue the putter
    else {
      putQueue.push([msg, cb])
    }
  }

  // returns a Promise resolved with the next message
  function takeAsync(cb = noop) {
    // 1- check buffered messages
    if(buf.hasMsg) {
      cb(buf.take())
    }

    // 2- check queued putter
    else if(putQueue.length) {
      // deliver the oldest queued message
      const [msg, putCb] = putQueue.shift()
      cb(msg)
      putCb(true)
    }
    // 3-check if closed
    else if(closed) {
      // deliver END if closed (since no more msgs will arrive)
      cb(END)
    }
    // 4- not closed yet ?
    else {
      // wait for a future message
      takeQueue.push(cb)
    }
  }

  function close(cb = noop) {
    if(closed)
      return cb(false)

    closed = true
    // END is a broadcast message
    if(takeQueue.length) {
      takeQueue.forEach(takeCb => takeCb(END))
      takeQueue = []
    }
  }

  return {
    take: () => new Promise(resolve => takeAsync(resolve)),
    put : (msg) => new Promise(resolve => putAsync(msg, resolve)),

    takeAsync,
    putAsync,
    close,

    /* a debug untility */
    get __state__(){
      return { putQueue, takeQueue, closed }
    }
  }
}
