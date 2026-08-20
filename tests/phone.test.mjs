import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSaudiMobile } from '../src/utils/phone.ts';

test('normalizes exactly nine Saudi mobile digits to the API E.164 format', () => {
  assert.equal(normalizeSaudiMobile('512345678'), '+966512345678');
});

test('rejects a Saudi mobile value that is short, long, or lacks the required 5 prefix', () => {
  assert.equal(normalizeSaudiMobile('51234567'), null);
  assert.equal(normalizeSaudiMobile('5123456789'), null);
  assert.equal(normalizeSaudiMobile('612345678'), null);
});
