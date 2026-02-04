import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('LoginComponent - i18n Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'logout',
      'handleOAuthLogin',
    ]);

    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'get',
      'instant',
      'use',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    translateService = TestBed.inject(
      TranslateService,
    ) as jasmine.SpyObj<TranslateService>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('translation pipe rendering', () => {
    it('should render translated welcome message', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const welcomeElement = compiled.querySelector('h2');
      expect(welcomeElement).toBeTruthy();
      // The translate pipe will handle the translation
      expect(welcomeElement.textContent).toContain('login.welcome');
    });

    it('should render translated email label', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const emailLabel = Array.from(compiled.querySelectorAll('label')).find(
        (el: any) => el.textContent.includes('login.email'),
      );
      expect(emailLabel).toBeTruthy();
    });

    it('should render translated password label', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const passwordLabel = Array.from(compiled.querySelectorAll('label')).find(
        (el: any) => el.textContent.includes('login.password'),
      );
      expect(passwordLabel).toBeTruthy();
    });

    it('should render translated button text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const button = compiled.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('login.signIn');
    });

    it('should render translated OAuth button labels', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const oauthButtons = compiled.querySelectorAll('button[type="button"]');
      expect(oauthButtons.length).toBeGreaterThan(0);

      // Check for OAuth button text keys
      const buttonTexts = Array.from(oauthButtons)
        .map((btn: any) => btn.textContent)
        .join(' ');
      expect(buttonTexts).toContain('login.continueGoogle');
    });
  });

  describe('translation key usage', () => {
    it('should use correct translation key for app title', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const title = compiled.querySelector('h1');
      expect(title.textContent).toContain('app.title');
    });

    it('should use correct translation key for subtitle', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      const subtitle = compiled.querySelector('p');
      expect(subtitle.textContent).toContain('login.subtitle');
    });

    it('should use translation pipe in all text nodes', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      // Check that translate pipe is used for dynamic text
      const h2Element = compiled.querySelector('h2');
      const h1Element = compiled.querySelector('h1');

      expect(h1Element.textContent).toMatch(/app\.title|SyncCoreAI/);
      expect(h2Element.textContent).toMatch(
        /login\.welcome|Welcome|欢迎|歡迎|أهلا/,
      );
    });
  });

  describe('form labels translation', () => {
    it('should have email label with translation', () => {
      fixture.detectChanges();
      const emailLabel =
        fixture.nativeElement.querySelector('label[for="email"]');

      expect(emailLabel).toBeTruthy();
      expect(emailLabel.textContent).toContain('login.email');
    });

    it('should have password label with translation', () => {
      fixture.detectChanges();
      const passwordLabel = fixture.nativeElement.querySelector(
        'label[for="password"]',
      );

      expect(passwordLabel).toBeTruthy();
      expect(passwordLabel.textContent).toContain('login.password');
    });

    it('should have remember me label with translation', () => {
      fixture.detectChanges();
      const rememberLabel = fixture.nativeElement.querySelector('label .ml-2');

      expect(rememberLabel).toBeTruthy();
      expect(rememberLabel.textContent).toContain('login.rememberMe');
    });
  });

  describe('placeholder translations', () => {
    it('should have translated email placeholder', () => {
      fixture.detectChanges();
      const emailInput =
        fixture.nativeElement.querySelector('input[id="email"]');

      expect(emailInput).toBeTruthy();
      // The placeholder is set via translation pipe, so it should contain the key or translated value
      const placeholder = emailInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('should have translated password placeholder', () => {
      fixture.detectChanges();
      const passwordInput = fixture.nativeElement.querySelector(
        'input[id="password"]',
      );

      expect(passwordInput).toBeTruthy();
      const placeholder = passwordInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });
  });

  describe('error message translations', () => {
    it('should show translated email required error', () => {
      fixture.detectChanges();
      component.email?.markAsTouched();
      fixture.detectChanges();

      const errorMessages =
        fixture.nativeElement.querySelectorAll('.text-red-600');
      const emailError = Array.from(errorMessages).find((el: any) =>
        el.textContent.includes('login.errors.emailRequired'),
      );

      expect(emailError).toBeTruthy();
    });

    it('should show translated invalid email error', () => {
      fixture.detectChanges();
      component.email?.setValue('invalid');
      component.email?.markAsTouched();
      fixture.detectChanges();

      const errorMessages =
        fixture.nativeElement.querySelectorAll('.text-red-600');
      const emailError = Array.from(errorMessages).find((el: any) =>
        el.textContent.includes('login.errors.invalidEmail'),
      );

      expect(emailError).toBeTruthy();
    });

    it('should show translated password required error', () => {
      fixture.detectChanges();
      component.password?.markAsTouched();
      fixture.detectChanges();

      const errorMessages =
        fixture.nativeElement.querySelectorAll('.text-red-600');
      const passwordError = Array.from(errorMessages).find((el: any) =>
        el.textContent.includes('login.errors.passwordRequired'),
      );

      expect(passwordError).toBeTruthy();
    });

    it('should show translated password minlength error', () => {
      fixture.detectChanges();
      component.password?.setValue('123');
      component.password?.markAsTouched();
      fixture.detectChanges();

      const errorMessages =
        fixture.nativeElement.querySelectorAll('.text-red-600');
      const passwordError = Array.from(errorMessages).find((el: any) =>
        el.textContent.includes('login.errors.passwordMinLength'),
      );

      expect(passwordError).toBeTruthy();
    });
  });

  describe('OAuth button translations', () => {
    it('should have translated Google button', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const googleButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('login.continueGoogle'),
      );

      expect(googleButton).toBeTruthy();
    });

    it('should have translated GitHub button', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const githubButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('login.continueGithub'),
      );

      expect(githubButton).toBeTruthy();
    });

    it('should have translated Microsoft button', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const msButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('login.continueMicrosoft'),
      );

      expect(msButton).toBeTruthy();
    });
  });

  describe('sign up link translation', () => {
    it('should have translated sign up text', () => {
      fixture.detectChanges();
      const signUpText = fixture.nativeElement.textContent;

      expect(signUpText).toContain('login.noAccount');
    });

    it('should have translated sign up link', () => {
      fixture.detectChanges();
      const signUpLink = fixture.nativeElement.querySelector('a');

      expect(signUpLink).toBeTruthy();
      // Look for sign up text in nearby elements
      const parentText = signUpLink.parentElement?.textContent || '';
      expect(parentText).toContain('login.signUp');
    });
  });
});
