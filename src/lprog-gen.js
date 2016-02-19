import TupleSpace from './TupleSpace'

export const any = () => true

const isProcess = arg => typeof arg.next === 'function' && typeof arg.throw === 'function'

export function In(...antiTuple) {
  return ['in', antiTuple]
}

export function Out(...tuple) {
  return ['out', tuple]
}

export function Eval(...tuple) {
  return [ 'eval', tuple ]
}

export default function prog(
  gen,
  tupleSpace = new TupleSpace(),
  cb = () => {}
) {

  next()

  function next(err, arg) {
    let res
    try {
      if(err) {
        res = gen.throw(err)
      } else {
        res = gen.next(arg)
      }
      if(res.done)
        cb(null, res.value)
      else
        runOp(res.value, next)
    } catch (err) {
      console.log('uncaught', err)
      cb(err)
    }
  }

  function runOp([op, param], cb) {
    return (
        op === 'in'          ? runIn(param, cb)
      : op === 'out'         ? runOut(param, cb)
      : /* op === 'eval' */    runEval(param, cb)
    )
  }

  function runIn(antiTuple, cb) {
    tupleSpace.takeTuple(antiTuple, (err, [ns, ...args]) => cb(null, args) )
  }

  function runOut(tuple, cb) {
    tupleSpace.putTuple(tuple)
    cb()
  }

  function runEval(tuple, cb) {
    tupleSpace.putTuple(tuple)
    const futureTuple = tuple.slice()

    let indexes = []
    tuple.forEach((arg, idx) => isProcess(arg) && indexes.push({proc: arg, idx}))

    let aborted = false
    let nbCompleted
    indexes.forEach( ({proc, idx}) => {
      prog(proc, tupleSpace, (err, res) => {
        if(aborted)
          return
        if(err)
          aborted = true
        else {
          futureTuple[idx] = res
          if( (++nbCompleted) === indexes.length ) {
            tupleSpace.putTuple(futureTuple)
          }
        }
      })
    })
    cb()
  }

}
