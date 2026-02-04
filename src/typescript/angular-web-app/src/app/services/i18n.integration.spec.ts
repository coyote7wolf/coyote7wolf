import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

/**
 * Integration tests for i18n system
 * Tests the complete translation workflow including:
 * - Service initialization
 * - Language switching
 * - Translation key resolution
 * - Storage persistence
 */
describe('i18n Integration Tests', () => {
  let translationService: TranslationService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [TranslationService],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService);

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('complete i18n workflow', () => {
    it('should initialize with English as default language', () => {
      translationService.initializeLanguage();

      expect(translationService.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should support switching between languages', () => {
      translationService.initializeLanguage();

      const languages = ['en', 'zh-CN', 'zh-TW', 'ar'];

      languages.forEach((lang) => {
        translationService.setLanguage(lang);

        expect(translationService.getCurrentLanguage()).toBe(lang);
        expect(localStorage.getItem('app_language')).toBe(lang);
      });
    });

    it('should persist language selection across sessions', () => {
      // Simulate first session
      translationService.setLanguage('zh-CN');
      expect(localStorage.getItem('app_language')).toBe('zh-CN');

      // Simulate new session
      const newService = new TranslationService(translateService);
      newService.initializeLanguage();

      expect(newService.getCurrentLanguage()).toBe('zh-CN');
    });

    it('should handle RTL languages correctly', () => {
      translationService.setLanguage('ar');

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');

      translationService.setLanguage('en');

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should provide language labels for UI display', () => {
      const labels = {
        en: 'English',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        ar: 'العربية',
      };

      Object.entries(labels).forEach(([lang, label]) => {
        expect(translationService.getLanguageLabel(lang)).toBe(label);
      });
    });
  });

  describe('translation key management', () => {
    it('should return all supported languages', () => {
      const languages = translationService.getLanguages();

      expect(languages).toContain('en');
      expect(languages).toContain('zh-CN');
      expect(languages).toContain('zh-TW');
      expect(languages).toContain('ar');
      expect(languages.length).toBe(4);
    });

    it('should validate language before setting', () => {
      translationService.initializeLanguage();
      const initialLang = translationService.getCurrentLanguage();

      translationService.setLanguage('invalid-lang');

      // Should not change language for invalid input
      expect(translationService.getCurrentLanguage()).toBe(initialLang);
    });

    it('should provide instant translation method', () => {
      expect(translationService.instant).toBeDefined();
      expect(typeof translationService.instant).toBe('function');
    });

    it('should provide string observable translation method', () => {
      expect(translationService.getString).toBeDefined();
      expect(typeof translationService.getString).toBe('function');
    });
  });

  describe('language switching observable', () => {
    it('should emit language changes', (done) => {
      const emittedLanguages: string[] = [];

      translationService.language$.subscribe((lang) => {
        emittedLanguages.push(lang);
      });

      translationService.setLanguage('zh-CN');
      translationService.setLanguage('ar');

      setTimeout(() => {
        expect(emittedLanguages).toContain('en'); // initial
        expect(emittedLanguages).toContain('zh-CN');
        expect(emittedLanguages).toContain('ar');
        done();
      }, 0);
    });

    it('should not emit for invalid language switches', (done) => {
      const emittedLanguages: string[] = [];

      translationService.language$.subscribe((lang) => {
        emittedLanguages.push(lang);
      });

      const initialCount = emittedLanguages.length;

      translationService.setLanguage('invalid');

      setTimeout(() => {
        expect(emittedLanguages.length).toBe(initialCount);
        done();
      }, 0);
    });
  });

  describe('document state management', () => {
    it('should update document.documentElement attributes', () => {
      translationService.setLanguage('zh-TW');

      expect(document.documentElement.lang).toBe('zh-TW');
      expect(document.documentElement.dir).toBe('ltr');

      translationService.setLanguage('ar');

      expect(document.documentElement.lang).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should maintain document attributes across multiple switches', () => {
      const tests = [
        { lang: 'en', dir: 'ltr' },
        { lang: 'zh-CN', dir: 'ltr' },
        { lang: 'ar', dir: 'rtl' },
        { lang: 'en', dir: 'ltr' },
      ];

      tests.forEach(({ lang, dir }) => {
        translationService.setLanguage(lang);
        expect(document.documentElement.lang).toBe(lang);
        expect(document.documentElement.dir).toBe(dir);
      });
    });
  });

  describe('error handling', () => {
    it('should handle missing localStorage gracefully', () => {
      const stored = localStorage.getItem('app_language');
      localStorage.removeItem('app_language');

      expect(() => {
        translationService.initializeLanguage();
      }).not.toThrow();

      expect(translationService.getCurrentLanguage()).toBe('en');

      // Restore
      if (stored) localStorage.setItem('app_language', stored);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('app_language', 'corrupted-data');

      expect(() => {
        translationService.initializeLanguage();
      }).not.toThrow();

      // Should use default since corrupted data is ignored
      expect(translationService.getCurrentLanguage()).toBe('en');
    });

    it('should handle rapid language switches', (done) => {
      const languages = ['en', 'zh-CN', 'ar', 'zh-TW', 'en'];

      languages.forEach((lang) => {
        translationService.setLanguage(lang);
      });

      setTimeout(() => {
        expect(translationService.getCurrentLanguage()).toBe('en');
        done();
      }, 0);
    });
  });

  describe('translate service integration', () => {
    it('should use TranslateService for translations', () => {
      spyOn(translateService, 'use');

      translationService.setLanguage('zh-CN');

      expect(translateService.use).toHaveBeenCalledWith('zh-CN');
    });

    it('should set default language in TranslateService', () => {
      spyOn(translateService, 'setDefaultLang');

      translationService.initializeLanguage();

      expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    });

    it('should add all languages to TranslateService', () => {
      spyOn(translateService, 'addLangs');

      translationService.initializeLanguage();

      expect(translateService.addLangs).toHaveBeenCalledWith([
        'en',
        'zh-CN',
        'zh-TW',
        'ar',
      ]);
    });
  });
});
