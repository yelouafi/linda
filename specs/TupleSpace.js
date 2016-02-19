import test from 'tape';

import  TupleSpace, { matchField, matchTuple } from '../src/TupleSpace'

const isNumber  = v => typeof v === 'number'
const isBoolean = v => typeof v === 'boolean'

test('matchField test', (t) => {

  t.ok(
    matchField(1, 1),
    '1 === 1'
  )

  t.ok(
    matchField('1', '1'),
    `'1' === '1'`
  )

  t.ok(
    matchField(true, true),
    'true === true'
  )

  t.ok(
    matchField(null, null),
    'null === null'
  )

  t.notOk(
    matchField(undefined, undefined),
    'undefined !== undefined'
  )

  t.ok(
    matchField(5, v => typeof v === 'number'),
    '5 is number'
  )

  t.notOk(
    matchField('5', v => typeof v === 'number'),
    `'5' is not a number`
  )

  t.end()
});

test('matchTuple test', (t) => {

  t.ok(
    matchTuple(
      ['t1', 1, true],
      ['t1', 1, isBoolean],
      'should match tuple with scalar fields'
    )
  )

  t.end()
})

test('TupleSpace test', (t) => {

  const space = new TupleSpace()

  const t1 = ['t1', 1, true]
  const t2 = ['t2', 2, false]
  space.putTuple(t1)
  space.putTuple(t2)

  t.deepEqual(
    space.tuples,
    [t1, t2],
    'TupleSpace.putTuple should queue the putted tuples'
  )

  t.ok(
    space.getTuple(['t1', isBoolean, isBoolean]) === undefined,
    'TupleSpace.getTuple should return undefined if no tuple matches the given pattern'
  )

  t.equal(
    space.getTuple(['t1', isNumber, isBoolean]),
    t1,
    'TupleSpace.getTuple should return a tuple matching the given pattern'
  )

  space.takeTuple(['t1', v => v >= 1, isBoolean], (err, res) => {
    t.equal(
      res,
      t1,
      'TupleSpace.takeTuple should resolve with the matching tuple'
    )
  })

  t.deepEqual(
    space.tuples,
    [t2],
    'TupleSpace.takeTuple should remove the matching tuple'
  )

  const t3 = ['t3', 3, true]
  const t4_proc = ['t4', () => {}]
  const t4_value = ['t4', 4]
  space.putTuple(t4_proc)

  space.takeTuple(['t3', isNumber, isBoolean], (err, res) => {
    //console.log(err, res)
    t.equal(
      res,
      t3,
      'TupleSpace.takeTuple should resolve with the matching tuple'
    )

    t.deepEqual(
      space.tuples,
      [t2, t4_proc],
      'TupleSpace.takeTuple should remove the matching tuple'
    )

  })

  space.takeTuple(['t4', isNumber], (err, res) => {
    console.log(err, res)
    t.equal(
      res,
      t4_value,
      'TupleSpace.updateTuple should resolve with the matching tuple upon an update'
    )

    t.deepEqual(
      space.tuples,
      [t2],
      'TupleSpace.updateTuple should remove the matchig tuple upon an update'
    )

  })

  Promise.resolve(1)
    .then(() => space.putTuple(t3))
    .then(() => space.updateTuple(t4_proc, t4_value))
    .then(() => t.end())
})
