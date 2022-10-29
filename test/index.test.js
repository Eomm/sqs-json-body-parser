'use strict'

const { test } = require('tap')
const clone = require('rfdc')()
const middy = require('@middy/core')

const sqsJsonBodyParser = require('../index')

test('default usage', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser())

  const records = await handler(getEvent(), {})
  t.equal(records.length, 2)
  t.strictSame(records.map(_ => _.jsonBody), [{ test: 'foo1' }, { test: 'foo2' }])
})

test('it is not an SQS message', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser())

  const records = await handler({}, {})
  t.notOk(records)
})

test('custom field name', async t => {
  const handler = buildMiddy()
  const name = 'hello'
  handler.use(sqsJsonBodyParser({ attachField: name }))

  const records = await handler(getEvent(), {})
  t.equal(records.length, 2)
  t.strictSame(records.map(_ => _[name]), [{ test: 'foo1' }, { test: 'foo2' }])
})

test('secure parse', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser({
    secureJson: {
      protoAction: 'remove'
    }
  }))

  const event = getEvent()
  const badMessage = clone(event.Records[0])
  badMessage.body = '{"__proto__":{ "b":5}}'
  event.Records.push(badMessage)

  const records = await handler(event, {})
  t.equal(records.length, 3)
  t.strictSame(records.map(_ => _.jsonBody), [{ test: 'foo1' }, { test: 'foo2' }, {}])
})

test('secure parse ignore', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser({
    throwOnFail: false,
    secureJson: {
      protoAction: 'error'
    }
  }))

  const event = getEvent()
  const badMessage = clone(event.Records[0])
  badMessage.body = '{"__proto__":{ "b":5}}'
  event.Records.push(badMessage)

  const records = await handler(event, {})
  t.equal(records.length, 3)
  t.strictSame(records.map(_ => _.jsonBody), [{ test: 'foo1' }, { test: 'foo2' }, undefined])
})

test('secure parse throw', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser({
    secureJson: {
      protoAction: 'ignore'
    }
  }))

  const event = getEvent()
  const badMessage = clone(event.Records[0])
  badMessage.body = '{"__proto__":{ "b":5}}'
  event.Records.push(badMessage)

  const records = await handler(event, {})
  t.equal(records.length, 3)
  t.strictSame(records.map(_ => _.jsonBody), [{ test: 'foo1' }, { test: 'foo2' }, { __proto__: { b: 5 } }])
})

test('throwOnFail true', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser())

  const event = getEvent()
  const badMessage = clone(event.Records[0])
  badMessage.body = 'this is a string'
  event.Records.push(badMessage)

  try {
    await handler(event, {})
    t.fail('should not pass')
  } catch (error) {
    t.ok(error)
    t.equal(error.message, 'Invalid JSON SQS message was provided: this is a string')
  }
})

test('throwOnFail false', async t => {
  const handler = buildMiddy()
  handler.use(sqsJsonBodyParser({ throwOnFail: false }))

  const event = getEvent()
  const badMessage = clone(event.Records[0])
  badMessage.body = 'this is a string'
  event.Records.push(badMessage)

  try {
    const records = await handler(event, {})
    t.equal(records.length, 3)
    t.strictSame(records.map(_ => _.jsonBody), [{ test: 'foo1' }, { test: 'foo2' }, undefined])
  } catch (error) {
    t.fail('should not throw')
  }
})

function buildMiddy () {
  return middy((event, context, cb) => {
    cb(null, event.Records)
  })
}

function getEvent () {
  return clone(require('./queue-standard.json'))
}
