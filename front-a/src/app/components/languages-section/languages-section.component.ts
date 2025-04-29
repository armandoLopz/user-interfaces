import { Component, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LanguageInterface } from '../../interfaces/interfaces.models';
import { LanguageService } from '../../services/languages/language.service';
import { getUserIdFromToken } from '../../utils/getToken';

@Component({
  selector: 'app-languages-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './languages-section.component.html',
  styleUrls: ['./languages-section.component.css'],
})
export class LanguagesSectionComponent {
  @Input() languages = signal<LanguageInterface[]>([]);

  showFormModal = signal(false);
  editMode = signal(false);
  selectedLanguage = signal<LanguageInterface | null>(null);
  langForm: FormGroup;

  // Possible proficiency levels matching backend codes
  languageLevels = [
    { code: 'BE', label: 'Basic' },
    { code: 'IN', label: 'Conversational' },
    { code: 'AD', label: 'Fluent' },
    { code: 'NA', label: 'Native' }
  ];

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService
  ) {
    this.langForm = this.fb.group({
      name: ['', Validators.required],
      language_level: ['', Validators.required]
    });
  }

  openAddModal() {
    this.editMode.set(false);
    this.selectedLanguage.set(null);
    this.langForm.reset();
    this.showFormModal.set(true);
  }

  openEditModal(item: LanguageInterface) {
    this.editMode.set(true);
    this.selectedLanguage.set(item);
    this.langForm.patchValue(item);
    this.showFormModal.set(true);
  }

  closeModal() {
    this.showFormModal.set(false);
  }

  // Helper to get display label for a proficiency code
  getLanguageLevelLabel(code: string): string {
    const found = this.languageLevels.find(l => l.code === code);
    return found ? found.label : code;
  }

  onSubmit() {
    if (this.langForm.invalid) return;
    const payload: LanguageInterface = {
      ...this.langForm.value,
      user: getUserIdFromToken() ? [getUserIdFromToken()!] : []
    };

    if (this.editMode()) {
      if (!confirm('Are you sure you want to update this language?')) return;
      payload.id = this.selectedLanguage()?.id;
      this.languageService.updateLanguagesData(payload).subscribe(updated => {
        this.languages.update((list: LanguageInterface[]) =>
          list.map(lang => lang.id === updated.id ? updated : lang)
        );
        alert('Language updated successfully.');
        this.closeModal();
      });
    } else {
      this.languageService.postLanguagesData(payload).subscribe(created => {
        this.languages.update((list: LanguageInterface[]) => [created, ...list]);
        alert('Language added successfully.');
        this.closeModal();
      });
    }
  }

  onDelete(item: LanguageInterface) {
    if (!confirm('Are you sure you want to delete this language?')) return;
    this.languageService.deleteLanguagesData(item.id!).subscribe(() => {
      this.languages.update((list: LanguageInterface[]) =>
        list.filter(lang => lang.id !== item.id)
      );
      alert('Language deleted successfully.');
    });
  }
}