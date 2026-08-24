import { resolveInitialLanguage } from '../../src/context/LanguageContext';

describe('resolveInitialLanguage', () => {
  it('uses Arabic when the resolved device language is Arabic and there is no saved choice', () => {
    expect(resolveInitialLanguage('ar-SA', null)).toBe('ar');
  });

  it('uses English when the resolved device language is not Arabic and there is no saved choice', () => {
    expect(resolveInitialLanguage('fr-FR', null)).toBe('en');
  });

  it('uses English when there is no resolved device language and no saved choice', () => {
    expect(resolveInitialLanguage(null, null)).toBe('en');
  });

  it('honors an explicit saved language over the resolved device language', () => {
    expect(resolveInitialLanguage('ar-SA', 'en')).toBe('en');
  });
});
