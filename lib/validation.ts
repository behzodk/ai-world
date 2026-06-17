export const nameRegex = /^[a-zA-Z]{2,}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]*$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type UsernameRules = {
  startsWithLetter: boolean;
  minLength: boolean;
  allowedCharacters: boolean;
  notEndingDot: boolean;
};

export function validateName(value: string) {
  return nameRegex.test(value.trim());
}

export function getUsernameRules(value: string): UsernameRules {
  const trimmed = value.trim();

  return {
    startsWithLetter: /^[a-zA-Z]/.test(trimmed),
    minLength: trimmed.length >= 4,
    allowedCharacters: /^[a-zA-Z0-9._]*$/.test(trimmed),
    notEndingDot: trimmed.length > 0 && !trimmed.endsWith("."),
  };
}

export function validateUsernameFormat(value: string) {
  const trimmed = value.trim();
  const rules = getUsernameRules(trimmed);

  return (
    rules.startsWithLetter &&
    rules.minLength &&
    rules.allowedCharacters &&
    rules.notEndingDot &&
    usernameRegex.test(trimmed)
  );
}

export function validateEmail(value: string) {
  return emailRegex.test(value.trim());
}

export function validatePassword(value: string) {
  return value.length >= 8;
}
