import { AbstractControl, ValidationErrors } from '@angular/forms';

export const customStringEmptyValidator = (control: AbstractControl): ValidationErrors | null => {

    const value = control.value

    if (typeof value === 'string' && value.trim().length == 0) {

        return { customStringEmptyValidator: true }
    }

    return null
}