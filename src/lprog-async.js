import Channel from './Channel'


const tupleSpace = new Channel()

export function take(...antiTuple) {
  return new Promise((resolve, reject) => {
    tupleSpace.takeTuple(
      antiTuple,
      (err, [ns, ...res]) => err ? reject(err) : resolve(res))
  })
}

export function put(...tuple) {
  tupleSpace.putTuple(tuple)
}

export function read(...antiTuple) {
  return new Promise((resolve, reject) => {
    tupleSpace.readTuple(
      antiTuple,
      (err, [ns, ...res]) => err ? reject(err) : resolve(res))
  })
}

export function write(...tuple) {
  tupleSpace.writeTuple(tuple)
}

export function fork(...tuple) {
  tupleSpace.putTuple(tuple)

  return Promise.all(
    tuple.map((arg) => Promise.resolve(arg))
  ).then((results) => tupleSpace.putTuple(results))
}
