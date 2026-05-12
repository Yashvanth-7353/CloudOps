/**
 * CloudOps Validators
 * Utility functions for validating user inputs
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateGithubUrl = (url: string): boolean => {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+\/?$/;
  return githubRegex.test(url);
};

export const validateRepositoryName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z0-9._-]+$/;
  return nameRegex.test(name) && name.length > 0 && name.length <= 255;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const validateDeploymentName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z0-9_-]+$/;
  return nameRegex.test(name) && name.length > 0 && name.length <= 100;
};

export const validateEnvironmentVariable = (name: string): boolean => {
  const nameRegex = /^[A-Z_][A-Z0-9_]*$/;
  return nameRegex.test(name);
};

export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

export const isAlphabetic = (value: string): boolean => {
  return /^[a-zA-Z]+$/.test(value);
};

export const isAlphaNumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};
