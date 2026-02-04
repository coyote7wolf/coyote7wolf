import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    // Mock TranslateService
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'setDefaultLang',
      'addLangs',
      'use',
      'get',
      'instant',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });

    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(
      TranslateService,
    ) as jasmine.SpyObj<TranslateService>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeLanguage', () => {
    it('should set default language to English', () => {
      service.initializeLanguage();

      expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    });

    it('should add all supported languages', () => {
      service.initializeLanguage();

      expect(translateService.addLangs).toHaveBeenCalledWith([
        'en',
        'zh-CN',
        'zh-TW',
        'ar',
      ]);
    });

    it('should use English if no saved language in localStorage', () => {
      service.initializeLanguage();

      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should use saved language from localStorage', () => {
      localStorage.setItem('app_language', 'zh-CN');
      service.initializeLanguage();

      expect(translateService.use).toHaveBeenCalledWith('zh-CN');
    });

    it('should set document language to saved language', () => {
      localStorage.setItem('app_language', 'zh-TW');
      service.initializeLanguage();

      expect(document.documentElement.lang).toBe('zh-TW');
    });

    it('should set document direction to ltr for non-RTL languages', () => {
      localStorage.setItem('app_language', 'en');
      service.initializeLanguage();

      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should set document direction to rtl for Arabic', () => {
      localStorage.setItem('app_language', 'ar');
      service.initializeLanguage();

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });
  });

  describe('setLanguage', () => {
    it('should set language and update localStorage', () => {
      service.setLanguage('zh-CN');

      expect(translateService.use).toHaveBeenCalledWith('zh-CN');
      expect(localStorage.getItem('app_language')).toBe('zh-CN');
    });

    it('should update current language observable', (done) => {
      service.language$.subscribe((lang) => {
        expect(lang).toBe('zh-CN');
        done();
      });

      service.setLanguage('zh-CN');
    });

    it('should set RTL direction for Arabic', () => {
      service.setLanguage('ar');

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should set LTR direction for English', () => {
      service.setLanguage('en');

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should ignore invalid languages', () => {
      service.setLanguage('invalid-lang');

      expect(translateService.use).not.toHaveBeenCalledWith('invalid-lang');
    });

    it('should accept all valid languages', () => {
      const validLanguages = ['en', 'zh-CN', 'zh-TW', 'ar'];

      validLanguages.forEach((lang) => {
        translateService.use.calls.reset();
        service.setLanguage(lang);
        expect(translateService.use).toHaveBeenCalledWith(lang);
      });
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language', () => {
      service.setLanguage('zh-TW');

      expect(service.getCurrentLanguage()).toBe('zh-TW');
    });

    it('should return default language initially', () => {
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should return updated language after change', () => {
      service.setLanguage('ar');
      expect(service.getCurrentLanguage()).toBe('ar');

      service.setLanguage('zh-CN');
      expect(service.getCurrentLanguage()).toBe('zh-CN');
    });
  });

  describe('instant', () => {
    it('should call translate.instant with key', () => {
      translateService.instant.and.returnValue('Hello');

      const result = service.instant('greeting');

      expect(translateService.instant).toHaveBeenCalledWith(
        'greeting',
        undefined,
      );
      expect(result).toBe('Hello');
    });

    it('should call translate.instant with key and params', () => {
      translateService.instant.and.returnValue('Hello User');

      const result = service.instant('greeting', { name: 'User' });

      expect(translateService.instant).toHaveBeenCalledWith('greeting', {
        name: 'User',
      });
    });
  });

  describe('getString', () => {
    it('should return observable from translate.get', (done) => {
      const { of } = require('rxjs');
      translateService.get.and.returnValue(of('Hello'));

      service.getString('greeting').subscribe((result) => {
        expect(result).toBe('Hello');
        expect(translateService.get).toHaveBeenCalledWith(
          'greeting',
          undefined,
        );
        done();
      });
    });

    it('should pass params to translate.get', (done) => {
      const { of } = require('rxjs');
      const params = { name: 'User' };
      translateService.get.and.returnValue(of('Hello User'));

      service.getString('greeting', params).subscribe(() => {
        expect(translateService.get).toHaveBeenCalledWith('greeting', params);
        done();
      });
    });
  });

  describe('getLanguages', () => {
    it('should return array of supported languages', () => {
      const languages = service.getLanguages();

      expect(languages).toEqual(['en', 'zh-CN', 'zh-TW', 'ar']);
    });
  });

  describe('getLanguageLabel', () => {
    it('should return correct label for English', () => {
      expect(service.getLanguageLabel('en')).toBe('English');
    });

    it('should return correct label for Simplified Chinese', () => {
      expect(service.getLanguageLabel('zh-CN')).toBe('简体中文');
    });

    it('should return correct label for Traditional Chinese', () => {
      expect(service.getLanguageLabel('zh-TW')).toBe('繁體中文');
    });

    it('should return correct label for Arabic', () => {
      expect(service.getLanguageLabel('ar')).toBe('العربية');
    });

    it('should return language code if label not found', () => {
      expect(service.getLanguageLabel('unknown')).toBe('unknown');
    });
  });

  describe('language persistence', () => {
    it('should persist language in localStorage across instances', () => {
      const service1 = TestBed.inject(TranslationService);
      service1.setLanguage('zh-CN');

      expect(localStorage.getItem('app_language')).toBe('zh-CN');

      // Simulate new service instance
      const service2 = new TranslationService(translateService);
      service2.initializeLanguage();

      expect(service2.getCurrentLanguage()).toBe('zh-CN');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('app_language', 'invalid-language-code');

      service.initializeLanguage();

      // Should default to English since invalid language is not used
      // (setLanguage ignores invalid languages)
      expect(() => service.initializeLanguage()).not.toThrow();
    });
  });

  describe('language$', () => {
    it('should emit new language when setLanguage is called', (done) => {
      const emittedLanguages: string[] = [];

      service.language$.subscribe((lang) => {
        emittedLanguages.push(lang);
      });

      service.setLanguage('zh-CN');
      service.setLanguage('ar');

      setTimeout(() => {
        expect(emittedLanguages).toContain('en'); // Initial
        expect(emittedLanguages).toContain('zh-CN');
        expect(emittedLanguages).toContain('ar');
        done();
      }, 0);
    });

    it('should not emit when invalid language is set', (done) => {
      const emittedLanguages: string[] = [];

      service.language$.subscribe((lang) => {
        emittedLanguages.push(lang);
      });

      const initialLength = emittedLanguages.length;
      service.setLanguage('invalid-lang');

      setTimeout(() => {
        expect(emittedLanguages.length).toBe(initialLength);
        done();
      }, 0);
    });
  });
});
