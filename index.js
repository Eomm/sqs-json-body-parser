'use strict'

const defaultOptions = {
  throwOnFail: true,
  attachField: 'jsonBody',
  secureJson: undefined
}

module.exports = function sqsJsonBodyParser (options) {
  const opts = Object.assign({}, defaultOptions, options)
  const parser = buildParser(opts)

  return { before }

  function before (handler, next) {
    if (!Array.isArray(handler.event.Records)) {
      process.nextTick(next)
      return
    }

    for (const message of handler.event.Records) {
      attachparsedBody(message)
    }
    process.nextTick(next)
  }

  function attachparsedBody (record) {
    try {
      record[opts.attachField] = parser(record.body)
    } catch (err) {
      if (opts.throwOnFail) {
        throw new Error(`Invalid JSON SQS message was provided: ${record.body}`)
      }
    }
  }
}

function buildParser (opts) {
  if (typeof opts.secureJson === 'object') {
    // require if needed
    const secureJson = require('secure-json-parse')
    return secureParse.bind(secureJson, opts.secureJson)
  } else {
    return JSON.parse
  }
}

function secureParse (opts, record) {
  return this.parse(record, opts)
}
