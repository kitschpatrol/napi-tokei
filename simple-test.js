const assert = require('node:assert')

const { tokeiSync } = require('./index')

const result = tokeiSync({ include: ['src'], languages: ['Rust'] })

assert.strictEqual(result.length, 1, 'Simple test failed: expected exactly one language')
assert.strictEqual(result[0].language, 'Rust', 'Simple test failed: expected Rust')
assert.ok(result[0].code > 0, 'Simple test failed: expected lines of code in src')

console.info('Simple test passed')
