import test from "tape";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`book scanning example`, async t => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "book-scanning-input.txt",
    "book-scanning-parser.json",
    "book-scanning-output.json"
  ]);
  const actual = jolicitron(parser, input);
  t.deepEqual(actual, expected);
  t.end();
});