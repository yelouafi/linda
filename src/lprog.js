import TupleSpace from './TupleSpace'

export const any = () => true

export function In(...pattern) {
  return ['in', pattern]
}

export function Out(...tuple) {
  return ['out', tuple]
}

export function Eval(ns, proc, ...args) {
  return [ 'eval', [ns, proc, args] ]
}

export default function prog(
  proc,
  args = [],
  tupleSpace = new TupleSpace(),
  cb = () => {}
) {

  const gen = proc(...args)
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

  function runIn(pattern, cb) {
    tupleSpace.takeTuple(pattern, (err, [ns, ...args]) => cb(null, args) )
  }

  function runOut(tuple, cb) {
    tupleSpace.putTuple(tuple)
    cb()
  }

  function runEval([ns, proc, args], cb) {
    const tuple = [ns, proc]
    tupleSpace.putTuple(tuple)
    prog(proc, args, tupleSpace, (err, res) => {
      if(err)
        return
      else {
        tupleSpace.updateTuple(tuple, [ns, res])
      }
    })
    cb()
  }

}
