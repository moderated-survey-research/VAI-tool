const SURVEY_TOKENS_KEY = "SURVEY_TOKENS";

const getExpiryTime = (): string => {
  const expiryMinutes = parseInt(import.meta.env.VITE_SURVEY_EXPIRY || 1, 10) * 60;
  const date = new Date();
  date.setTime(date.getTime() + expiryMinutes * 60 * 1000);
  return date.toUTCString();
};

const saveToken = (surveyId: number | string, token: string) => {
  const currentTokens = getAllTokens();
  currentTokens[surveyId] = token;

  const expires = getExpiryTime();
  document.cookie = `${SURVEY_TOKENS_KEY}=${encodeURIComponent(
    JSON.stringify(currentTokens)
  )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
};

const getToken = (surveyId: number | string): string | null => {
  const currentTokens = getAllTokens();
  return currentTokens[surveyId] ?? null;
};

const deleteToken = (token: string) => {
  const currentTokens = getAllTokens();
  const surveyId = Object.keys(currentTokens).find(key => currentTokens[key] === token);
  if (surveyId) delete currentTokens[surveyId];

  const expires = getExpiryTime();
  document.cookie = `${SURVEY_TOKENS_KEY}=${encodeURIComponent(
    JSON.stringify(currentTokens)
  )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
};

const getAllTokens = (): Record<string, string> => {
  const cookieValue = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${SURVEY_TOKENS_KEY}=`))
    ?.split("=")[1];
  return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : {};
};

const clearAllTokens = () => {
  document.cookie = `${SURVEY_TOKENS_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; Secure`;
};

export const surveyTokenStorage = {
  saveToken,
  getToken,
  deleteToken,
  getAllTokens,
  clearAllTokens,
};
