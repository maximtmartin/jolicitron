# Jolicitron

A library to quickly build parsers for Google Hash Code problem inputs.

## How to use it

Jolicitron is mainly about assigning names to integers. Hash Code problem
inputs look like this:

```
1 2 3 4
3
4 5
6 7
8 9
10 11 12
```

Using the problem statement, this can be made sense of, and it needs to be
parsed into a data structure that has descriptive names. Here's how to do
that with Jolicitron:

```js
const parser = jolicitron.build(({push, n}) => [
  "one", "two", "three", "four",
  push,
  n("pairs", "x", "y"),
  "ten", "eleven", "twelve"
])
const {parsedValue, remaining} = parser(input)
```

`parsedValue` is then equal to the following:

```
{
  one: 1, two: 2, three: 3, four: 4,
  pairs: [{x: 4, y: 5}, {x: 6, y: 7}, {x: 8, y: 9}],
  ten: 10, eleven: 11, twelve: 12,
}
```

## Real-world Hash Code examples

Check out the [examples](https://github.com/hgwood/hash-code-parser/tree/master/examples)
to understand how to use Jolicitron on passed problems.

## Requirements

Jolicitron is written in ECMAScript 2015 so it requires Node 6+.

## API

Jolicitron exports an object with a single method named `build`.

`build` takes a function that returns a description of the parser you want to
build, and returns the actual parser. A parser, in Jolicitron's context, is
a function that takes a string and returns an object with two
properties: `parsedValue` is the value that resulted from the parsing
operation, and `remaining` is the rest of the string that wasn't used.

For example, a parser that would expect two integers and return an array of
these two integers would work like this:

```js
const parser = jolicitron.build(...)
const {parsedValue, remaining} = parser("41 99 105")
assert.deepEqual(parsedValue, [41, 99])
assert.equal(remaining, "105")
```

Hash Code problem inputs are usually made of a sequence of integers, separated
by either spaces or new lines. Jolicitron does not care about spaces or new
lines. It sees the input a sequence of integers, that can be parsed
individually or grouped. Therefore, the function passed to `build` should
return an array of description of parsers to use to parse the sequence. The
first parser in the array will be used to parse the first integer, the
second parser, the second integer, and so on. The result from each parser is
expected to be an object, and all these objects are merged together (think
`Object.assign`) to form the final result.

A description for a parser in the array can be one of 3 things:
- a string
- `push` or a call to `push.usingName`
- a call to `n` or `n.usingName`

A string produces a parser that parses one integer, and returns an object that
associates the string to that integer.

```js
const parser = jolicitron.build(() => ["a", "b"])
const {parsedValue, remaining} = parser("41 99 105")
assert.deepEqual(parsedValue, {a: 41, b: 99})
assert.equal(remaining, "105")
```

`n` and `push` are properties from the object passed to the function passed to
build.

```js
jolicitron.build(({n, push}) => [...])
```

They are used to handle collections of things in the input.

Hash Code problem inputs often use the same pattern for collections. The
length of the collection is given first, and then the collection itself.
Sometimes the length and the collection are a little more apart. So a system
to remember values and re-use them later as lengths is required. `push` is
the way to save values, and `n` is used to parse collections.

`push` is a parser that parses one integer, and stores it in a queue. The
integer is then available for later use with `n`. `push.usingName` is an
alternative that allows to name the integer. This makes it available even
after it has been dequeued.

`n` is a function. It produces a parser that parses many integers into an
array, then returns an object that associates the first parameter to that
array. To know exactly how many integer it should parse, `n` dequeues an
integer from `push`'s queue and uses that.

```js
const parser = jolicitron.build(({push, n}) => [push, n("a")])
const {parsedValue, remaining} = parser("3 1 2 3 4 5")
assert.deepEqual(parsedValue, {a: [1, 2, 3]})
assert.equal(remaining, "4 5")
```

`n.usingName` lets you use a named integer instead.

```js
const parser = jolicitron.build(({push, n}) => [
  push.usingName("i"),
  push,
  n.usingName("i", "a")
])
const {parsedValue, remaining} = parser("3 4 1 2 3 4 5")
assert.deepEqual(parsedValue, {a: [1, 2, 3]})
assert.equal(remaining, "4 5")
```

`n` and `n.usingName` throw errors if the queue is empty or if the name is
unknown, respectively.

`n` and `n.usingName` can take additional parameters. If those are present,
they are used to describe how to parse each element of the resulting array,
and the description of parsers seen before: strings, calls to `n` or calls to
`push`.

```js
const parser = jolicitron.build(({push, n}) => [
  push,
  n("x", "a", "b")
])
const {parsedValue, remaining} = parser("3 1 2 3 4 5")
assert.deepEqual(parsedValue, {x: [{a: 1, b: 2}, {a: 3, b: 4}]})
assert.equal(remaining, "5")
```

```js
const parser = jolicitron.build(({push, n}) => [
  push,
  n("x",
    "a",
    push,
    n("b", "k", "l")),
  "z"
])
const {parsedValue, remaining} = parser("2 1 2 3 4 5 6 7 3 8 9 10 11 12 13 14 15 16")
assert.deepEqual(parsedValue, {
  x: [
    {
      a: 1,
      b: [
        {k: 3, l: 4},
        {k: 5, l: 6}
      ],
    },
    {
      a: 7,
      b: [
        {k: 8, l: 9},
        {k: 10, l: 11},
        {k: 12, l: 13}
      ],
    },
  ],
  z: 14,
})
assert.equal(remaining, "15 16")
```

## Changelog

- 1.0.2
  - package.json/readme update
  - example for https://tonicdev.com/npm/jolicitron
- 1.0.1
  - package.json/readme update
- 1.0.0
  - initial release
