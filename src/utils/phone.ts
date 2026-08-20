/** Convert the nine local Saudi mobile digits entered after +966 into E.164 form. */
export const normalizeSaudiMobile = (digits: string): string | null => (
  /^5\d{8}$/.test(digits) ? `+966${digits}` : null
);
