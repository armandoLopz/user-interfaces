import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { WorkExperienceInterface } from '../../interfaces/interfaces.models'; // Assuming this path is correct
import { WorkService } from '../../services/work/work.service'; // Assuming this path is correct
import { getUserIdFromToken } from '../../utils/getToken'; // Assuming this path is correct

// Custom validator function to check if start year is not after end year
function yearRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startYearControl = control.get('start_work_date');
  const endYearControl = control.get('end_work_date');

  const startYear = startYearControl?.value;
  const endYear = endYearControl?.value;

  // Only validate if both fields have values and are valid numbers
  // Use Number() or parseInt() to ensure numeric comparison
  if (
    startYear != null && endYear != null &&
    !isNaN(Number(startYear)) && !isNaN(Number(endYear)) &&
    Number(startYear) > Number(endYear)
  ) {
    return { yearRange: true }; // Return an error object
  }
  return null; // Return null if valid
}

@Component({
  selector: 'app-work-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-section.component.html',
  styleUrls: ['./work-section.component.css'] // Keeping original styles
})
export class WorkSectionComponent implements OnInit {
  // latestWork signal holds WorkExperienceInterface objects (with numbers for years)
  @Input() latestWork = signal<WorkExperienceInterface[]>([]);

  showForm = signal(false);
  editMode = signal(false);

  workForm!: FormGroup;
  private editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private workService: WorkService
  ) { }

  ngOnInit(): void {
    this.initForm();
    // If you fetch data initially here, ensure it conforms to WorkExperienceInterface[]
    // Example: this.workService.getWorkData().subscribe(data => this.latestWork.set(data));
  }

  private initForm() {
    this.workForm = this.fb.group({
      name_company: ['', Validators.required], // Added Required
      job_title: ['', Validators.required],    // Added Required
      // Form controls hold the year as a string (from input type="number")
      // Add Required and Pattern for 4 digits
      start_work_date: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      end_work_date: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      description_of_the_job: [''],
      currently_working: [false] // Assuming this might be needed by interface/API, defaulting to false
    }, { validators: yearRangeValidator }); // Add custom validator to the form group
  }

  // Getters for easy access to form controls and errors in the template
  get companyName() { return this.workForm.get('name_company'); }
  get jobTitle() { return this.workForm.get('job_title'); }
  get startWorkDateControl() { return this.workForm.get('start_work_date'); }
  get endWorkDateControl() { return this.workForm.get('end_work_date'); }
  get descriptionOfTheJob() { return this.workForm.get('description_of_the_job'); }
  get formGroupErrors() { return this.workForm.errors; }


  openAddModal() {
    this.workForm.reset();
    this.editingId = null;
    this.editMode.set(false);
    this.showForm.set(true);
    // Ensure validators are applied correctly when opening
     this.applyValidators();
  }

  openEditModal(work: WorkExperienceInterface) {
    // Patch the form directly with the work object.
    // Since the interface uses number for dates, this works directly with type="number" inputs.
    this.workForm.patchValue(work);
    this.editingId = work.id!;
    this.editMode.set(true);
    this.showForm.set(true);
     // Ensure validators are applied correctly when opening
    this.applyValidators();
  }

  closeModal() {
    this.showForm.set(false);
    this.workForm.reset(); // Reset form on close
    // Clear validators when closing form
    this.clearValidators();
  }

   private applyValidators() {
      // Re-set group validator
      this.workForm.setValidators(yearRangeValidator);
      // Re-set individual validators
      this.workForm.get('name_company')?.setValidators(Validators.required);
      this.workForm.get('job_title')?.setValidators(Validators.required);
      this.workForm.get('start_work_date')?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
      this.workForm.get('end_work_date')?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
      // Update validity to re-run validators
      this.workForm.updateValueAndValidity();
  }

   private clearValidators() {
        // Clear group validator
        this.workForm.clearValidators();
         // Clear individual validators
        this.workForm.get('name_company')?.clearValidators();
        this.workForm.get('job_title')?.clearValidators();
        this.workForm.get('start_work_date')?.clearValidators();
        this.workForm.get('end_work_date')?.clearValidators();
        // Update validity to re-run validators
        this.workForm.updateValueAndValidity();
   }


  onSubmit() {
    // Mark all fields as touched to show validation errors immediately on submit attempt
    this.workForm.markAllAsTouched();

    if (this.workForm.invalid) {
      console.log('Form is invalid', this.workForm.errors);
      // Optionally alert the user
      // window.alert('Please correct the errors before submitting.');
      return;
    }

    // Get form values. Dates are strings like "2023" from the input.
    const formValue = this.workForm.value;

    // Construct the payload for the service, converting year strings to numbers
    // The form controls already align with the interface for other fields
    const payload: WorkExperienceInterface = {
      ...formValue,
      start_work_date: Number(formValue.start_work_date), // Convert year string to number
      end_work_date: Number(formValue.end_work_date),     // Convert year string to number
      // currently_working is included if you added it to the form group
      id: this.editingId || undefined // Include ID for updates
    };

    const userId = getUserIdFromToken();
    if (typeof userId === 'number') {
       // Assign user ID - adjust based on how your API expects this (array or single ID)
       // Assuming your API expects user as an array of IDs
       if (!payload.user) {
          payload.user = [];
       }
       // Prevent adding duplicates if user array is already populated from edit
       if (!payload.user.includes(userId)) {
           payload.user.push(userId);
       }
    } else {
        console.error("User ID not found. Cannot save/update work experience.");
        window.alert("Could not get user information. Please log in again.");
        return;
    }


    if (this.editMode()) {
      // Send the payload with the year numbers
      this.workService.updateWorkData(payload).subscribe({
        next: (res: WorkExperienceInterface) => {
            // API response should also have year numbers if it follows the interface
            // Update the signal list with the response
            this.latestWork.update(list => list.map(w => w.id === res.id ? res : w));
            window.alert('Work experience updated successfully.');
            this.closeModal();
        },
        error: (error) => {
           console.error('Update failed:', error);
           window.alert('Failed to update work experience. Please try again.');
        }
      });
    } else {
       // Send the payload with the year numbers
      this.workService.postWorkData(payload).subscribe({
         next: (res: WorkExperienceInterface) => {
            // API response should also have year numbers if it follows the interface
            // Add the response to the signal list
            this.latestWork.update(list => [...list, res]);
            window.alert('Work experience added successfully.');
            this.closeModal();
         },
         error: (error) => {
            console.error('Add failed:', error);
            window.alert('Failed to add work experience. Please try again.');
         }
      });
    }
  }

  onDelete(work: WorkExperienceInterface) {
    if (!work.id) {
        console.warn("Attempted to delete work experience without an ID.");
        return;
    }
    // Confirmation message in English
    if (!window.confirm(`Are you sure you want to delete the work experience at ${work.name_company}?`)) {
      return;
    }
    this.workService.deleteWorkData(work.id).subscribe({
        next: () => {
            this.latestWork.update(list => list.filter(w => w.id !== work.id));
            // Success message in English
            window.alert('Work experience deleted successfully.');
        },
        error: (error) => {
             console.error('Delete failed:', error);
             // Error message in English
             window.alert('Failed to delete work experience. Please try again.');
        }
    });
  }

  trackById(_index: number, item: WorkExperienceInterface) {
    return item.id;
  }
}