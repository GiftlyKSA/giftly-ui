import assert from 'node:assert/strict';
import test from 'node:test';
import { extractDevelopmentOtp } from '../src/config/runtime.ts';

test('shows the API OTP only for a development build and a valid six-digit response', () => {
  assert.equal(extractDevelopmentOtp('development', '481920'), '481920');
});

test('never exposes a returned OTP outside development or when it is malformed', () => {
  assert.equal(extractDevelopmentOtp('production', '481920'), null);
  assert.equal(extractDevelopmentOtp('development', '48192'), null);
  assert.equal(extractDevelopmentOtp('development', '481920x'), null);
  assert.equal(extractDevelopmentOtp(undefined, '481920'), null);
});
