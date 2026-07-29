import { AbstractControl, ValidatorFn } from '@angular/forms';

//validating if a given input is a number or not
export class CustomValidator {
  static isNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value != null && Number.isNaN(Number(control.value))) {
        return { isNaN: true };
      }
      return null;
    };
  }
}
