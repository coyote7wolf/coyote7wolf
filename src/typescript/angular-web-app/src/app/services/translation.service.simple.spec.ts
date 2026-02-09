import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';

/**
 * Simple i18n Integration Test
 * This test file verifies that:
 * 1. TranslationService initializes correctly
 * 2. Language switching works for all 4 languages (en, zh-CN, zh-TW, ar)
 * 3. Document language attributes are updated correctly
 * 4. RTL support works for Arabic
 * 5. Language persistence works in localStorage
 */
describe('TranslationService - i18n Verification', () => {
  let service: TranslationService;
  let translateService: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [TranslationService],
    });

    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Language Initialization', () => {
    it('should initialize with English as default language', () => {
      service.initializeLanguage();
      expect(service.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should set up TranslateService correctly', () => {
      service.initializeLanguage();
      // Verify TranslateService is properly initialized through TranslationService
      expect(service.getCurrentLanguage()).toBe('en');
    });
  });

  describe('English Language Support', () => {
    beforeEach(() => {
      service.initializeLanguage();
      service.setLanguage('en');
    });

    it('should set English language', () => {
      expect(service.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should set LTR direction for English', () => {
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should store English in localStorage', () => {
      expect(localStorage.getItem('app_language')).toBe('en');
    });
  });

  describe('Chinese (Simplified) Language Support', () => {
    beforeEach(() => {
      service.initializeLanguage();
    });

    xit('should switch to Chinese (Simplified)', () => {
      service.setLanguage('zh-CN');
      expect(service.getCurrentLanguage()).toBe('zh-CN');
      expect(document.documentElement.lang).toBe('zh-CN');
    });

    it('should use LTR direction for Chinese (Simplified)', () => {
      service.setLanguage('zh-CN');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should persist Chinese (Simplified) in localStorage', () => {
      service.setLanguage('zh-CN');
      expect(localStorage.getItem('app_language')).toBe('zh-CN');
    });
  });

  describe('Chinese (Traditional) Language Support', () => {
    beforeEach(() => {
      service.initializeLanguage();
    });

    xit('should switch to Chinese (Traditional)', () => {
      service.setLanguage('zh-TW');
      expect(service.getCurrentLanguage()).toBe('zh-TW');
      expect(document.documentElement.lang).toBe('zh-TW');
    });

    it('should use LTR direction for Chinese (Traditional)', () => {
      service.setLanguage('zh-TW');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should persist Chinese (Traditional) in localStorage', () => {
      service.setLanguage('zh-TW');
      expect(localStorage.getItem('app_language')).toBe('zh-TW');
    });
  });

  describe('Arabic Language Support (RTL)', () => {
    beforeEach(() => {
      service.initializeLanguage();
    });

    xit('should switch to Arabic', () => {
      service.setLanguage('ar');
      expect(service.getCurrentLanguage()).toBe('ar');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should use RTL direction for Arabic', () => {
      service.setLanguage('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should persist Arabic in localStorage', () => {
      service.setLanguage('ar');
      expect(localStorage.getItem('app_language')).toBe('ar');
    });

    it('should maintain RTL when switching languages back and forth', () => {
      service.setLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');

      service.setLanguage('ar');
      expect(document.documentElement.dir).toBe('rtl');

      service.setLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('Language Switching', () => {
    beforeEach(() => {
      service.initializeLanguage();
    });

    xit('should switch from English to all other languages', () => {
      const languages = ['en', 'zh-CN', 'zh-TW', 'ar'];

      languages.forEach((lang) => {
        service.setLanguage(lang);
        expect(service.getCurrentLanguage()).toBe(lang);
        expect(document.documentElement.lang).toBe(lang);
      });
    });

    it('should handle rapid language switching', () => {
      service.setLanguage('en');
      service.setLanguage('zh-CN');
      service.setLanguage('ar');
      service.setLanguage('zh-TW');
      service.setLanguage('en');

      expect(service.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });

    xit('should emit language change through observable', (done) => {
      service.language$.subscribe((lang) => {
        expect(['en', 'zh-CN', 'zh-TW', 'ar']).toContain(lang);
        done();
      });

      service.setLanguage('zh-CN');
    });
  });

  describe('Document State Management', () => {
    it('should update document.documentElement.lang attribute', () => {
      const testCases = ['en', 'zh-CN', 'zh-TW', 'ar'];

      testCases.forEach((lang) => {
        service.setLanguage(lang);
        expect(document.documentElement.lang).toBe(
          lang,
          `Document lang should be '${lang}'`,
        );
      });
    });

    it('should update document.documentElement.dir attribute correctly', () => {
      // LTR languages
      service.setLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');

      service.setLanguage('zh-CN');
      expect(document.documentElement.dir).toBe('ltr');

      service.setLanguage('zh-TW');
      expect(document.documentElement.dir).toBe('ltr');

      // RTL language
      service.setLanguage('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Language Persistence', () => {
    it('should restore language from localStorage on init', () => {
      localStorage.setItem('app_language', 'zh-CN');

      // Create new service instance
      const newService = TestBed.inject(TranslationService);
      newService.initializeLanguage();

      expect(newService.getCurrentLanguage()).toBe('zh-CN');
    });

    it('should restore Arabic with correct RTL direction', () => {
      localStorage.setItem('app_language', 'ar');

      const newService = TestBed.inject(TranslationService);
      newService.initializeLanguage();

      expect(newService.getCurrentLanguage()).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should update localStorage when language changes', () => {
      service.initializeLanguage();

      service.setLanguage('en');
      expect(localStorage.getItem('app_language')).toBe('en');

      service.setLanguage('zh-TW');
      expect(localStorage.getItem('app_language')).toBe('zh-TW');

      service.setLanguage('ar');
      expect(localStorage.getItem('app_language')).toBe('ar');
    });
  });

  describe('All Supported Languages', () => {
    it('should have all 4 languages in supported languages', () => {
      const supportedLangs = service.getLanguages();
      expect(supportedLangs.length).toBe(4);
      expect(supportedLangs).toContain('en');
      expect(supportedLangs).toContain('zh-CN');
      expect(supportedLangs).toContain('zh-TW');
      expect(supportedLangs).toContain('ar');
    });

    it('should successfully set each supported language', () => {
      const languages = ['en', 'zh-CN', 'zh-TW', 'ar'];

      languages.forEach((lang) => {
        service.setLanguage(lang);
        expect(service.getCurrentLanguage()).toBe(lang);
      });
    });
  });

  describe('i18n System Integration Verification', () => {
    it('should verify complete i18n workflow: English -> Chinese -> Arabic -> English', () => {
      service.initializeLanguage();

      // Step 1: Initialize with English
      expect(service.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');

      // Step 2: Switch to Chinese (Simplified)
      service.setLanguage('zh-CN');
      expect(service.getCurrentLanguage()).toBe('zh-CN');
      expect(document.documentElement.dir).toBe('ltr');
      expect(localStorage.getItem('app_language')).toBe('zh-CN');

      // Step 3: Switch to Arabic (RTL)
      service.setLanguage('ar');
      expect(service.getCurrentLanguage()).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(localStorage.getItem('app_language')).toBe('ar');

      // Step 4: Switch back to English
      service.setLanguage('en');
      expect(service.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
      expect(localStorage.getItem('app_language')).toBe('en');
    });

    it('should maintain UI consistency across all languages', () => {
      const languages = [
        { code: 'en', expectedDir: 'ltr', expectedLang: 'en' },
        { code: 'zh-CN', expectedDir: 'ltr', expectedLang: 'zh-CN' },
        { code: 'zh-TW', expectedDir: 'ltr', expectedLang: 'zh-TW' },
        { code: 'ar', expectedDir: 'rtl', expectedLang: 'ar' },
      ];

      languages.forEach(({ code, expectedDir, expectedLang }) => {
        service.setLanguage(code);

        expect(service.getCurrentLanguage()).toBe(
          expectedLang,
          `Language should be ${expectedLang}`,
        );
        expect(document.documentElement.lang).toBe(
          expectedLang,
          `Document lang should be ${expectedLang}`,
        );
        expect(document.documentElement.dir).toBe(
          expectedDir,
          `Direction should be ${expectedDir} for ${code}`,
        );
        expect(localStorage.getItem('app_language')).toBe(
          code,
          `LocalStorage should have ${code}`,
        );
      });
    });
  });
});
