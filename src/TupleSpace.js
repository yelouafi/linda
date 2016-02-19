
function removeAt(arr, idx) {
  if(idx >= 0 && idx < arr.length)
    arr.splice(idx, 1)
}

function remove(arr, elm) {
  removeAt(arr, arr.indexOf(elm))
}

export function matchField(field, test) {
  if(test === undefined)
    return false

  if(typeof test === 'function')
    return test(field)
  return field === test
}

export function matchTuple(tuple, pattern) {
  if(tuple.length < pattern.length)
    return false
  for (var i = 0; i < pattern.length; i++) {
    const field = tuple[i]
    const test = pattern[i]
    if(!matchField(field, test))
      return false
  }
  return true
}

export default class TupleSpace {

  constructor() {
    this.tuples = []
    this.takers = []
    this.readers = []
  }

  takeTuple(pattern, resolve) {
    const tuple = this.getTuple(pattern)
    if(tuple) {
      remove(this.tuples, tuple)
      resolve(null, tuple)
    } else
      this.takers.push([pattern, resolve])
  }

  readTuple(pattern, resolve) {
    const tuple = this.getTuple(pattern)
    if(tuple) {
      resolve(null, tuple)
    } else
      this.readers.push([pattern, resolve])
  }

  getTuple(pattern) {
    for (var i = 0; i < this.tuples.length; i++) {
      const tuple = this.tuples[i]
      if(matchTuple(tuple, pattern))
        return tuple
    }
  }

  checkPendingQueue(queue, tuple, isTaker) {
    const _queue = queue.slice()
    for (var i = 0; i < _queue.length; i++) {
      const [pattern, resolve] = _queue[i]
      if(matchTuple(tuple, pattern)) {
        removeAt(queue, i)
        resolve(null, tuple)
        if(isTaker)
          return true
      }
    }
    return false
  }

  putTuple(tuple) {
    this.checkPendingQueue(this.readers, tuple)
    if(!this.checkPendingQueue(this.takers, tuple, true)) {
      this.tuples.push(tuple)
    }
  }
}
