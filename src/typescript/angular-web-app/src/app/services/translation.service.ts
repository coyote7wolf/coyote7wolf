import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<string>('en');
  public language$ = this.currentLanguage$.asObservable();

  constructor(private translate: TranslateService) {}

  public initializeLanguage(): void {
    // Set default language
    this.translate.setDefaultLang('en');

    // Add available languages
    this.translate.addLangs(['en', 'zh-CN', 'zh-TW', 'ar']);

    // Get saved language from localStorage or use default
    const savedLanguage = localStorage.getItem('app_language') || 'en';
    this.setLanguage(savedLanguage);
  }

  public setLanguage(language: string): void {
    if (['en', 'zh-CN', 'zh-TW', 'ar'].includes(language)) {
      this.translate.use(language);
      this.currentLanguage$.next(language);
      localStorage.setItem('app_language', language);

      // Set text direction for RTL languages
      if (language === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = language;
      }
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage$.value;
  }

  public instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  public getString(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  public getLanguages(): string[] {
    return ['en', 'zh-CN', 'zh-TW', 'ar'];
  }

  public getLanguageLabel(language: string): string {
    const labels: { [key: string]: string } = {
      en: 'English',
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      ar: 'العربية',
    };
    return labels[language] || language;
  }
}
