import { Component, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { skillsOrCompetenciesInterface } from '../../interfaces/interfaces.models';
import { SkillsOrCompetenciesService } from '../../services/skillsOrCompetencies/skills-or-competencies.service';
import { getUserIdFromToken } from '../../utils/getToken';

@Component({
  selector: 'app-competencies-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competencies-section.component.html',
  styleUrls: ['./competencies-section.component.css'],
})
export class CompetenciesSectionComponent {
  @Input() competencies = signal<skillsOrCompetenciesInterface[]>([]);

  showFormModal = signal(false);
  editMode = signal(false);
  selectedCompetency = signal<skillsOrCompetenciesInterface | null>(null);
  compForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private compService: SkillsOrCompetenciesService
  ) {
    this.compForm = this.fb.group({
      name:     ['', Validators.required],
      proficiency: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  get proficiencyControl() {
    return this.compForm.get('proficiency');
  }

  openAddModal() {
    this.editMode.set(false);
    this.selectedCompetency.set(null);
    this.compForm.reset({ proficiency: 3 });
    this.showFormModal.set(true);
  }

  openEditModal(item: skillsOrCompetenciesInterface) {
    this.editMode.set(true);
    this.selectedCompetency.set(item);
    this.compForm.patchValue(item);
    this.showFormModal.set(true);
  }

  closeModal() {
    this.showFormModal.set(false);
  }

  onSubmit() {
    if (this.compForm.invalid) return;
    const payload: skillsOrCompetenciesInterface = {
      ...this.compForm.value,
      user: getUserIdFromToken() ? [getUserIdFromToken()!] : []
    };

    if (this.editMode()) {
      if (!confirm('Are you sure you want to update this competency?')) return;
      payload.id = this.selectedCompetency()?.id;
      this.compService.updateCompetencieData(payload).subscribe(updated => {
        this.competencies.update(list =>
          list.map(c => c.id === updated.id ? updated : c)
        );
        alert('Competency updated successfully.');
        this.closeModal();
      });
    } else {
      this.compService.postCompetencieData(payload).subscribe(created => {
        this.competencies.update(list => [created, ...list]);
        alert('Competency added successfully.');
        this.closeModal();
      });
    }
  }

  onDelete(item: skillsOrCompetenciesInterface) {
    if (!confirm('Are you sure you want to delete this competency?')) return;
    this.compService.deleteCompetencieData(item.id!).subscribe(() => {
      this.competencies.update(list =>
        list.filter(c => c.id !== item.id)
      );
      alert('Competency deleted successfully.');
    });
  }
}