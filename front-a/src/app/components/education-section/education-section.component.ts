import { Component, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { educationInterface } from '../../interfaces/interfaces.models';
import { EducationService } from '../../services/education/education.service';
import { getUserIdFromToken } from '../../utils/getToken';

@Component({
  selector: 'app-education-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education-section.component.html',
  styleUrls: ['./education-section.component.css'],
})
export class EducationSectionComponent {
  @Input() latestEducation = signal<educationInterface[]>([]);

  showFormModal = signal(false);
  editMode = signal(false);
  selectedEducation = signal<educationInterface | null>(null);
  eduForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eduService: EducationService
  ) {
    this.eduForm = this.fb.group({
      name_institution: ['', Validators.required],
      degree_studied: ['', Validators.required],
      degree_level: ['', Validators.required],
      degree_level_other: [''],
      start_studied_date: [null, [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      end_studied_date: [null, [Validators.pattern(/^[0-9]{4}$/)]],
      currently_studying: [false]
    });

    // Ajusta validadores de end_studied_date según el checkbox
    this.eduForm.get('currently_studying')!.valueChanges.subscribe((val: boolean) => {
      const endCtrl = this.eduForm.get('end_studied_date')!;
      if (val) {
        endCtrl.clearValidators();
      } else {
        endCtrl.setValidators([Validators.required, Validators.pattern(/^[0-9]{4}$/)]);
      }
      endCtrl.updateValueAndValidity();
    });
  }

  openAddModal() {
    this.editMode.set(false);
    this.selectedEducation.set(null);
    this.eduForm.reset({ currently_studying: false });
    this.showFormModal.set(true);
  }

  openEditModal(item: educationInterface) {
    this.editMode.set(true);
    this.selectedEducation.set(item);
    this.eduForm.patchValue(item);
    this.showFormModal.set(true);
  }

  closeModal() {
    this.showFormModal.set(false);
  }

  onSubmit() {
    if (this.eduForm.invalid) return;

    const payload: educationInterface = {
      ...this.eduForm.value,
      user: getUserIdFromToken() ? [getUserIdFromToken()!] : []
    };

    if (this.editMode()) {
      if (!confirm('Are you sure you want to update this education entry?')) return;
      payload.id = this.selectedEducation()?.id;
      this.eduService.updateAddressData(payload).subscribe(updated => {
        this.latestEducation.update((list: educationInterface[]) =>
          list.map(ed => ed.id === updated.id ? updated : ed)
        );
        alert('Education entry updated successfully.');
        this.closeModal();
      });
    } else {
      this.eduService.postAddressData(payload).subscribe(created => {
        this.latestEducation.update((list: educationInterface[]) => [created, ...list]);
        alert('Education entry added successfully.');
        this.closeModal();
      });
    }
  }

  onDelete(item: educationInterface) {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    this.eduService.deleteAddressData(item.id!).subscribe(() => {
      this.latestEducation.update((list: educationInterface[]) =>
        list.filter(ed => ed.id !== item.id)
      );
      alert('Education entry deleted successfully.');
    });
  }
}
