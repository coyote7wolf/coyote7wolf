import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isAuthenticated$;
  currentLanguage: string = 'en';

  constructor(
    private authService: AuthService,
    private translationService: TranslationService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

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
