
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
  }

  takeTuple(pattern, resolve) {
    const tuple = this.getTuple(pattern)
    if(tuple) {
      const idx = this.tuples.indexOf(tuple)
      this.tuples.splice(idx, 1)
      resolve(null, tuple)
    } else
      this.takers.push([pattern, resolve])
  }

  getTuple(pattern) {
    for (var i = 0; i < this.tuples.length; i++) {
      const tuple = this.tuples[i]
      if(matchTuple(tuple, pattern))
        return tuple
    }
  }

  checkTakersForTuple(tuple, idx) {
    for (var i = 0; i < this.takers.length; i++) {
      const [pattern, resolve] = this.takers[i]
      if(matchTuple(tuple, pattern)) {
        this.takers.splice(i, 1)
        if(idx !== undefined)
          this.tuples.splice(idx, 1)
        resolve(null, tuple)
        return true
      }
    }
    return false
  }

  putTuple(tuple) {
    //console.log('put', tuple, this.tuples)
    if(!this.checkTakersForTuple(tuple))
      this.tuples.push(tuple)
  }

  updateTuple(tuple, newTuple) {
    const idx = this.tuples.indexOf(tuple)
    if(idx >= 0) {
      if(!this.checkTakersForTuple(newTuple, idx)) {
        this.tuples[idx] = newTuple
      }
    }
  }
}
