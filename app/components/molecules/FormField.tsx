import { forwardRef } from 'react';
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';

export interface FormFieldProps extends InputProps {
  label: string;
  errorMsg?: string;
  id: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, errorMsg, id, className = '', ...props }, ref) => {
    return (
      <div className={className}>
        <Label htmlFor={id}>{label}</Label>
        <div className="mt-1">
          <Input id={id} ref={ref} error={!!errorMsg} {...props} />
        </div>
        {errorMsg && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
