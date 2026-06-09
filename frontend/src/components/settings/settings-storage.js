export const SETTINGS_KEYS = {
    PROFILE: 'cloudops_settings_profile',
    GITHUB: 'cloudops_settings_github',
    AWS: 'cloudops_settings_aws',
    ENV_VARS: 'cloudops_settings_env_vars',
    NOTIFICATIONS: 'cloudops_settings_notifications',
    TEAM: 'cloudops_settings_team',
    SECURITY: 'cloudops_settings_security',
};
export const STORAGE_KEYS = {
    CONNECTED_REPOSITORIES: 'cloudops_connected_repositories',
};
export const readStoredValue = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
};
export const writeStoredValue = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};
export const removeStoredValue = (key) => {
    localStorage.removeItem(key);
};
