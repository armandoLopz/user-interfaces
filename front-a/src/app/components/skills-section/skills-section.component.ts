import { Component, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { skillsOrCompetenciesInterface } from '../../interfaces/interfaces.models';
import { SkillsOrCompetenciesService } from '../../services/skillsOrCompetencies/skills-or-competencies.service';
import { getUserIdFromToken } from '../../utils/getToken';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.css'],
})
export class SkillsSectionComponent {
  @Input() skills = signal<skillsOrCompetenciesInterface[]>([]);

  showFormModal = signal(false);
  editMode = signal(false);
  selectedSkill = signal<skillsOrCompetenciesInterface | null>(null);
  skillForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private skillService: SkillsOrCompetenciesService
  ) {
    this.skillForm = this.fb.group({
      name:        ['', Validators.required],
      proficiency: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  get proficiencyControl() {
    return this.skillForm.get('proficiency');
  }

  openAddModal() {
    this.editMode.set(false);
    this.selectedSkill.set(null);
    this.skillForm.reset({ proficiency: 3 });
    this.showFormModal.set(true);
  }

  openEditModal(item: skillsOrCompetenciesInterface) {
    this.editMode.set(true);
    this.selectedSkill.set(item);
    this.skillForm.patchValue(item);
    this.showFormModal.set(true);
  }

  closeModal() {
    this.showFormModal.set(false);
  }

  onSubmit() {
    if (this.skillForm.invalid) return;
    const payload: skillsOrCompetenciesInterface = {
      ...this.skillForm.value,
      user: getUserIdFromToken() ? [getUserIdFromToken()!] : []
    };

    if (this.editMode()) {
      if (!confirm('Are you sure you want to update this skill?')) return;
      payload.id = this.selectedSkill()?.id;
      this.skillService.updateSkillData(payload).subscribe(updated => {
        this.skills.update(list =>
          list.map(s => s.id === updated.id ? updated : s)
        );
        alert('Skill updated successfully.');
        this.closeModal();
      });
    } else {
      this.skillService.postSkillData(payload).subscribe(created => {
        this.skills.update(list => [created, ...list]);
        alert('Skill added successfully.');
        this.closeModal();
      });
    }
  }

  onDelete(item: skillsOrCompetenciesInterface) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    this.skillService.deleteSkillData(item.id!).subscribe(() => {
      this.skills.update(list =>
        list.filter(s => s.id !== item.id)
      );
      alert('Skill deleted successfully.');
    });
  }
}