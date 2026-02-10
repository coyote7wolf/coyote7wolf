import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Title -->
          <div class="flex-shrink-0">
            <a routerLink="/" class="text-2xl font-bold text-blue-600">
              {{ 'app.title' | translate }}
            </a>
          </div>

          <!-- Navigation Links and Language Switcher -->
          <div class="flex items-center gap-6">
            <!-- Language Switcher -->
            <select
              [value]="currentLanguage"
              (change)="onLanguageChange($event)"
              class="px-3 py-2 bg-blue-50 text-gray-700 rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition"
            >
              <option value="en">🇬🇧 English</option>
              <option value="zh-CN">🇨🇳 中文 (简)</option>
              <option value="zh-TW">🇹🇼 中文 (繁)</option>
              <option value="ar">🇸🇦 العربية</option>
            </select>

            <!-- Action Slot (e.g., Logout button) -->
            <ng-content select="[slot='actions']"></ng-content>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      a {
        text-decoration: none;
        color: #2563eb !important;
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  currentLanguage: string = 'en';

  constructor(
    private translationService: TranslationService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();

    // Subscribe to language changes
    this.translationService.language$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newLanguage = selectElement.value;
    this.translationService.setLanguage(newLanguage);
  }
}
