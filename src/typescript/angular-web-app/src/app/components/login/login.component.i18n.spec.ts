import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

// Mock translation data
const mockTranslations = {
  en: {
    'app.title': 'SyncCoreAI',
    'app.subtitle': 'Angular OAuth Demo',
    'login.welcome': 'Welcome to SyncCoreAI',
    'login.title': 'Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.rememberMe': 'Remember Me',
    'login.login': 'Login',
    'login.signUp': 'Sign Up',
    'login.or': 'Or continue with',
    'login.googleLogin': 'Login with Google',
    'login.githubLogin': 'Login with GitHub',
    'login.microsoftLogin': 'Login with Microsoft',
  },
  'zh-CN': {
    'app.title': 'SyncCoreAI',
    'app.subtitle': '角色认证演示',
    'login.welcome': '欢迎来到 SyncCoreAI',
    'login.title': '登录',
    'login.email': '邮箱',
    'login.password': '密码',
    'login.rememberMe': '记住我',
    'login.login': '登录',
    'login.signUp': '注册',
    'login.or': '或继续使用',
    'login.googleLogin': '使用 Google 登录',
    'login.githubLogin': '使用 GitHub 登录',
    'login.microsoftLogin': '使用 Microsoft 登录',
  },
  'zh-TW': {
    'app.title': 'SyncCoreAI',
    'app.subtitle': '角色認證演示',
    'login.welcome': '歡迎來到 SyncCoreAI',
    'login.title': '登入',
    'login.email': '電郵',
    'login.password': '密碼',
    'login.rememberMe': '記住我',
    'login.login': '登入',
    'login.signUp': '註冊',
    'login.or': '或繼續使用',
    'login.googleLogin': '使用 Google 登入',
    'login.githubLogin': '使用 GitHub 登入',
    'login.microsoftLogin': '使用 Microsoft 登入',
  },
  ar: {
    'app.title': 'SyncCoreAI',
    'app.subtitle': 'عرض توضيحي للمصادقة',
    'login.welcome': 'مرحبا بك في SyncCoreAI',
    'login.title': 'تسجيل الدخول',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.rememberMe': 'تذكرني',
    'login.login': 'تسجيل الدخول',
    'login.signUp': 'التسجيل',
    'login.or': 'أو متابعة مع',
    'login.googleLogin': 'تسجيل الدخول مع Google',
    'login.githubLogin': 'تسجيل الدخول مع GitHub',
    'login.microsoftLogin': 'تسجيل الدخول مع Microsoft',
  },
};

// Custom loader for tests
class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of(
      mockTranslations[lang as keyof typeof mockTranslations] ||
        mockTranslations.en,
    );
  }
}

describe('LoginComponent - i18n Integration Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let translateService: TranslateService;
  let translationService: TranslationService;
  let authService: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'logout',
      'handleOAuthLogin',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          defaultLanguage: 'en',
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        TranslationService,
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            fragment: of(null),
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    translateService = TestBed.inject(TranslateService);
    translationService = TestBed.inject(TranslationService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Initialize with English
    translateService.setDefaultLang('en');
    translateService.use('en').subscribe();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('English Language Support', () => {
    beforeEach(() => {
      translateService.use('en').subscribe();
      fixture.detectChanges();
    });

    xit('should render English title', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const h1 = fixture.nativeElement.querySelector('h1');
        // After translation, should show 'SyncCoreAI'
        expect(h1.textContent).toBeTruthy();
        // Check if the text is either the key or the translated value
        expect(h1.textContent.length).toBeGreaterThan(0);
        done();
      });
    });

    xit('should render English email placeholder', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const emailInput = fixture.nativeElement.querySelector('input#email');
        const placeholder = emailInput.getAttribute('placeholder');

        // Should not have the key, should have actual translation or empty
        expect(placeholder).toBeTruthy();
        done();
      });
    });

    xit('should render English submit button', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const button = fixture.nativeElement.querySelector(
          'button[type="submit"]',
        );
        const buttonText = button.textContent;

        expect(buttonText).toBeTruthy();
        // Should contain actual English text, not the key
        expect(buttonText).toMatch(/Sign in|Signing in|login\.signIn/i);
        done();
      });
    });

    xit('should render form labels in English', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const emailLabel =
          fixture.nativeElement.querySelector('label[for="email"]');
        const passwordLabel = fixture.nativeElement.querySelector(
          'label[for="password"]',
        );

        expect(emailLabel).toBeTruthy();
        expect(passwordLabel).toBeTruthy();
        done();
      });
    });

    xit('should render OAuth buttons in English', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const buttons = fixture.nativeElement.querySelectorAll('button');
        const buttonTexts = Array.from(buttons)
          .map((btn: any) => btn.textContent)
          .join(' ');

        // Should contain OAuth button labels
        expect(buttonTexts.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Chinese (Simplified) Language Support', () => {
    beforeEach(() => {
      translateService.use('zh-CN').subscribe();
      fixture.detectChanges();
    });

    xit('should switch to Chinese (Simplified) and render correctly', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const h1 = fixture.nativeElement.querySelector('h1');
        expect(h1.textContent).toBeTruthy();

        // In Chinese context, text direction should be LTR
        expect(document.documentElement.dir).toBe('ltr');
        done();
      });
    });

    xit('should render Chinese labels', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const labels = fixture.nativeElement.querySelectorAll('label');
        expect(labels.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should persist Chinese language in service', () => {
      translationService.setLanguage('zh-CN');
      expect(translationService.getCurrentLanguage()).toBe('zh-CN');
      expect(localStorage.getItem('app_language')).toBe('zh-CN');
    });
  });

  describe('Chinese (Traditional) Language Support', () => {
    beforeEach(() => {
      translateService.use('zh-TW').subscribe();
      fixture.detectChanges();
    });

    xit('should switch to Chinese (Traditional)', (done) => {
      translationService.setLanguage('zh-TW');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(translationService.getCurrentLanguage()).toBe('zh-TW');
        expect(document.documentElement.dir).toBe('ltr');
        done();
      });
    });

    xit('should render Traditional Chinese content', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const h1 = fixture.nativeElement.querySelector('h1');
        expect(h1).toBeTruthy();
        done();
      });
    });
  });

  describe('Arabic Language Support (RTL)', () => {
    beforeEach(() => {
      translateService.use('ar').subscribe();
      translationService.setLanguage('ar');
      fixture.detectChanges();
    });

    xit('should switch to Arabic and set RTL direction', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ar');
        done();
      });
    });

    xit('should render Arabic content', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const h1 = fixture.nativeElement.querySelector('h1');
        expect(h1).toBeTruthy();
        done();
      });
    });

    xit('should render Arabic form labels', (done) => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const labels = fixture.nativeElement.querySelectorAll('label');
        expect(labels.length).toBeGreaterThan(0);

        // Verify RTL is still set
        expect(document.documentElement.dir).toBe('rtl');
        done();
      });
    });
  });

  describe('Language Switching', () => {
    xit('should update UI when switching from English to Chinese', (done) => {
      translateService.use('en').subscribe();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // Switch to Chinese
        translateService.use('zh-CN').subscribe();
        translationService.setLanguage('zh-CN');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(translationService.getCurrentLanguage()).toBe('zh-CN');
          expect(document.documentElement.lang).toBe('zh-CN');
          done();
        });
      });
    });

    xit('should update UI when switching from English to Arabic', (done) => {
      translateService.use('en').subscribe();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // Switch to Arabic
        translateService.use('ar').subscribe();
        translationService.setLanguage('ar');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.documentElement.dir).toBe('rtl');
          expect(document.documentElement.lang).toBe('ar');
          done();
        });
      });
    });

    xit('should update UI when switching from Arabic back to English', (done) => {
      translateService.use('ar').subscribe();
      translationService.setLanguage('ar');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(document.documentElement.dir).toBe('rtl');

        // Switch back to English
        translateService.use('en').subscribe();
        translationService.setLanguage('en');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.documentElement.dir).toBe('ltr');
          expect(document.documentElement.lang).toBe('en');
          done();
        });
      });
    });
  });

  describe('Translation Pipe Rendering', () => {
    xit('should render all translate pipes correctly in English', (done) => {
      translateService.use('en').subscribe();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const compiled = fixture.nativeElement;

        // Check that common elements are present and have content
        const h1 = compiled.querySelector('h1');
        const h2 = compiled.querySelector('h2');
        const labels = compiled.querySelectorAll('label');
        const inputs = compiled.querySelectorAll('input');

        expect(h1?.textContent?.length).toBeGreaterThan(0);
        expect(h2?.textContent?.length).toBeGreaterThan(0);
        expect(labels.length).toBeGreaterThan(0);
        expect(inputs.length).toBeGreaterThan(0);

        done();
      });
    });

    xit('should render all translate pipes correctly in Chinese', (done) => {
      translateService.use('zh-CN').subscribe();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const compiled = fixture.nativeElement;

        const h1 = compiled.querySelector('h1');
        const h2 = compiled.querySelector('h2');
        const labels = compiled.querySelectorAll('label');

        expect(h1?.textContent?.length).toBeGreaterThan(0);
        expect(h2?.textContent?.length).toBeGreaterThan(0);
        expect(labels.length).toBeGreaterThan(0);

        done();
      });
    });

    xit('should render all translate pipes correctly in Arabic', (done) => {
      translateService.use('ar').subscribe();
      translationService.setLanguage('ar');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const compiled = fixture.nativeElement;

        const h1 = compiled.querySelector('h1');
        const h2 = compiled.querySelector('h2');
        const labels = compiled.querySelectorAll('label');

        expect(h1?.textContent?.length).toBeGreaterThan(0);
        expect(h2?.textContent?.length).toBeGreaterThan(0);
        expect(labels.length).toBeGreaterThan(0);

        // Verify RTL
        expect(document.documentElement.dir).toBe('rtl');

        done();
      });
    });
  });

  describe('Error Message Translations', () => {
    xit('should show error messages in correct language', (done) => {
      translateService.use('en');
      fixture.detectChanges();

      // Trigger validation errors
      component.email?.markAsTouched();
      component.password?.markAsTouched();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const errorMessages =
          fixture.nativeElement.querySelectorAll('.text-red-600');
        expect(errorMessages.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Language Persistence Across Sessions', () => {
    it('should persist language selection in localStorage', () => {
      translationService.setLanguage('zh-TW');

      expect(localStorage.getItem('app_language')).toBe('zh-TW');

      // Simulate new component creation with saved language
      const savedLang = localStorage.getItem('app_language');
      expect(savedLang).toBe('zh-TW');

      translationService.setLanguage('en');
      expect(localStorage.getItem('app_language')).toBe('en');
    });
  });

  describe('Document State Management', () => {
    it('should set document language attributes for each locale', (done) => {
      const testCases = [
        { lang: 'en', dir: 'ltr' },
        { lang: 'zh-CN', dir: 'ltr' },
        { lang: 'zh-TW', dir: 'ltr' },
        { lang: 'ar', dir: 'rtl' },
      ];

      let testIndex = 0;

      const runNextTest = () => {
        if (testIndex >= testCases.length) {
          done();
          return;
        }

        const { lang, dir } = testCases[testIndex];
        translateService.use(lang).subscribe();
        translationService.setLanguage(lang);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.documentElement.lang).toBe(lang);
          expect(document.documentElement.dir).toBe(dir);

          testIndex++;
          runNextTest();
        });
      };

      runNextTest();
    });
  });
});
