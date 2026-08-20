import { RegistrationForm } from '../api/types';

type CustomerRegistrationInput = {
  fullName: string;
  email: string | null;
  dob: string | null;
};

/** Build the customer-only registration payload used by the public app. */
export const createCustomerRegistrationForm = ({
  fullName,
  email,
  dob,
}: CustomerRegistrationInput): RegistrationForm => ({
  role: 'CUSTOMER',
  full_name: fullName,
  email,
  dob,
});
