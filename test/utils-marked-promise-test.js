import * as sinon from 'sinon';
import test from 'ava';

import {marked} from '../build/utils/marked-promise';

const sandbox = sinon.createSandbox();

test.beforeEach(() => {
    sandbox.restore();
});

test.afterEach.always(() => {
    sandbox.restore();
});

test.serial('renderMarkdown() should return string from marked', async (t) => {
  const want = 'Hello World'
  const markedOrig = require("marked");
  sandbox.stub(markedOrig, 'parse').callsFake((src, options, cb) => {
    cb(null, want);
  });
  
  const result = await marked();
  t.deepEqual(result, want);
});

test.serial('renderMarkdown() should return error from marked', async (t) => {
  const want = 'Hello World'
  const markedOrig = require("marked");
  sandbox.stub(markedOrig, 'parse').callsFake((src, options, cb) => {
    cb(new Error('marked.parse() error'), null);
  });
  
  try {
    await marked();
  } catch (err) {
    t.deepEqual(err.message, 'marked.parse() error');
  }
});