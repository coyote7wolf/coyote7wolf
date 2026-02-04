import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <button
        *ngFor="let lang of languages"
        (click)="setLanguage(lang)"
        [class.active]="currentLanguage === lang"
        class="px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
        [class.bg-blue-600]="currentLanguage === lang"
        [class.text-white]="currentLanguage === lang"
        [class.bg-gray-200]="currentLanguage !== lang"
        [class.text-gray-700]="currentLanguage !== lang"
      >
        {{ getLanguageLabel(lang) }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class LanguageSwitcherComponent implements OnInit {
  languages: string[] = [];
  currentLanguage: string = 'en';

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.languages = this.translationService.getLanguages();
    this.translationService.language$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  setLanguage(language: string): void {
    this.translationService.setLanguage(language);
  }

  getLanguageLabel(language: string): string {
    return this.translationService.getLanguageLabel(language);
  }
}
