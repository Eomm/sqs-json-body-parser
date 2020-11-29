# Middy sqs-json-body-parser middleware

[![Build Status](https://github.com/Eomm/sqs-json-body-parser/workflows/ci/badge.svg)](https://github.com/Eomm/sqs-json-body-parser/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


🛵 [middyjs](https://github.com/middyjs/middy) middleware to parse your AWS SQS events' body!
This middleware will add to the [SQS message](./test/queue-standard.json) an additional field with the parsed body.
If the event is not an `SQS` event, it will be ignored.

## Install

```js
npm i sqs-json-body-parser
```


## Options

- `throwOnFail` (boolean): define if the middleware should ignore errors when parsing the body string. **Default**: `true`
- `attachField` (string): the name of the attached field. **Default**: `jsonBody`
- `secureJson` (json): customize the `options` passed to [`secure-json-parse`](https://www.npmjs.com/package/secure-json-parse). If null the `JSON.parse` will be used instead to parse the body. **Default**: null

⚠ `secureJson` may impact your Lambda performance! Use it only if the body input is not sanitized.

## Usage

```js
const middy = require('@middy/core')
const sqsJsonBodyParser = require('sqs-json-body-parser')

const handler = middy((event, context, cb) => {
  cb(null, {})
})

handler.use(sqsJsonBodyParser())

// invokes the handler
const event = {
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({foo: 'bar'})
}

handler(event, {}, (_, body) => {
  expect(body).toEqual({foo: 'bar'})
})
```

## License

Licensed under [MIT](./LICENSE).
