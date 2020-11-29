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
  cb(null, event.Records)
})

handler.use(sqsJsonBodyParser({ throwOnFail: false }))

// invokes the handler
const event = {
  "Records": [
    {
      "messageId": "11d6ee51-4cc7-4302-9e22-7cd8afdaadf5",
      "receiptHandle": "AQEBBX8nesZEXmkhsmZeyIE8iQAMig7qw...",
      "body": "{\"test\": \"foo\"}",
      "attributes": {
        "ApproximateReceiveCount": "1",
        "SentTimestamp": "1573251510774",
        "SequenceNumber": "18849496460467696128",
        "MessageGroupId": "1",
        "SenderId": "AIDAIO23YVJENQZJOL4VO",
        "MessageDeduplicationId": "1",
        "ApproximateFirstReceiveTimestamp": "1573251510774"
      },
      "messageAttributes": {},
      "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:fifo.fifo",
      "awsRegion": "us-east-2"
    }
  ]
}

handler(event, {}, (_, records) => {
  expect(records[0].jsonBody).toEqual({ test: 'foo' })
})
```

## License

Licensed under [MIT](./LICENSE).
