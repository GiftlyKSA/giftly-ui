import assert from 'node:assert/strict';
import test from 'node:test';
import { createCustomerRegistrationForm } from '../src/utils/registration.ts';

test('creates a customer-only registration payload without courier fields', () => {
  assert.deepEqual(
    createCustomerRegistrationForm({
      fullName: 'Fatimah Al Saud',
      email: 'fatimah@example.com',
      dob: '1995-06-15',
    }),
    {
      role: 'CUSTOMER',
      full_name: 'Fatimah Al Saud',
      email: 'fatimah@example.com',
      dob: '1995-06-15',
    },
  );
});
