export type ApplicationType = 'frontend-website' | 'backend-api' | 'full-stack';

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  'frontend-website': 'Frontend Website',
  'backend-api': 'Backend API',
  'full-stack': 'Full Stack Application',
};

export const APPLICATION_TYPE_DESCRIPTIONS: Record<ApplicationType, string> = {
  'frontend-website': 'React, Vue, Angular, Vite, or static HTML/CSS sites',
  'backend-api': 'Express, FastAPI, Django, Flask, NestJS, or Spring Boot APIs',
  'full-stack': 'Repositories with both a frontend UI and backend API',
};

export function formatApplicationType(type?: string) {
  if (!type) return 'Application';
  return APPLICATION_TYPE_LABELS[type as ApplicationType] || type;
}

export function formatHealthStatus(status?: string) {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'unhealthy':
      return 'Unhealthy';
    case 'checking':
      return 'Checking';
    default:
      return 'Unknown';
  }
}
