const HEYGEN_SESSION_KEY = "HEYGEN_SESSION";

const getExpiryTime = (): string => {
  const expiryMinutes = parseInt(import.meta.env.VITE_SURVEY_EXPIRY || 60, 10);
  const date = new Date();
  date.setTime(date.getTime() + expiryMinutes * 60 * 1000);
  return date.toUTCString();
};

const saveSession = (sessionId: string, token: string) => {
  const expires = getExpiryTime();
  document.cookie = `${HEYGEN_SESSION_KEY}=${encodeURIComponent(
    JSON.stringify({ sessionId, token })
  )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
};

const getSession = (): { sessionId: string; token: string } | null => {
  const cookieValue = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${HEYGEN_SESSION_KEY}=`))
    ?.split("=")[1];
  return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) ?? null : null;
};

const deleteSession = () => {
  document.cookie = `${HEYGEN_SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; Secure`;
};

export const heygenSessionStorage = {
  saveSession,
  getSession,
  deleteSession,
};
