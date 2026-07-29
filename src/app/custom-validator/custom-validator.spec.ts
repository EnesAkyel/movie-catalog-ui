import { FormControl } from '@angular/forms';
import { CustomValidator } from './custom-validator';

describe('CustomValidator.isNumber', () => {
  const validator = CustomValidator.isNumber();

  it('returns null for a numeric string', () => {
    expect(validator(new FormControl('3.99'))).toBeNull();
  });

  it('returns null for a numeric value', () => {
    expect(validator(new FormControl(3.99))).toBeNull();
  });

  it('returns { isNaN: true } for a non-numeric string', () => {
    expect(validator(new FormControl('abc'))).toEqual({ isNaN: true });
  });

  it('returns null for an empty string (isNaN treats it as 0)', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('returns null when the control value is null', () => {
    expect(validator(new FormControl(null))).toBeNull();
  });
});
