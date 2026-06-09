/**
 * Sanitize sensitive values before logging or streaming to clients.
 */

const SECRET_PATTERNS = [
  /gho_[A-Za-z0-9_]+/g,
  /ghp_[A-Za-z0-9_]+/g,
  /ghu_[A-Za-z0-9_]+/g,
  /ghs_[A-Za-z0-9_]+/g,
  /ghr_[A-Za-z0-9_]+/g,
  /x-access-token:[^@\s]+@/gi,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /(api[_-]?key|secret|password|token|credential)\s*[=:]\s*['"]?[^\s'"]+/gi,
];

function maskValue(value) {
  if (value == null) return value;
  if (typeof value !== 'string') {
    try {
      return JSON.parse(maskSecrets(JSON.stringify(value)));
    } catch {
      return '[REDACTED]';
    }
  }
  return maskSecrets(value);
}

function sanitizeData(data) {
  if (data == null) return data;
  return maskValue(data);
}

function maskSecrets(text) {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      if (/^gh[opurs]_/i.test(match)) return 'gho_[REDACTED]';
      if (/x-access-token:/i.test(match)) return 'x-access-token:[REDACTED]@';
      if (/^Bearer\s/i.test(match)) return 'Bearer [REDACTED]';
      const sep = match.includes('=') ? '=' : ':';
      const [label] = match.split(sep);
      return `${label}${sep}[REDACTED]`;
    });
  }
  return sanitized;
}

function sanitizeError(error) {
  if (!error) return error;
  const message = maskSecrets(error.message || String(error));
  const sanitized = new Error(message);
  sanitized.code = error.code;
  sanitized.name = error.name;
  return sanitized;
}

module.exports = {
  maskValue,
  maskSecrets,
  sanitizeData,
  sanitizeError,
};
