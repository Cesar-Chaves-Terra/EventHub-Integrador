
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_ENDPOINT = "/token/refresh/";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não foi definida.");
}

interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

let refreshPromise: Promise<string | null> | null = null;

function clearSession(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;

  clearSession();

  if (window.location.pathname !== "/") {
    window.location.replace("/");
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = sessionStorage.getItem("refresh");

  if (!refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_URL}${REFRESH_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

      if (!response.ok) return null;

      const data: TokenRefreshResponse = await response.json();

      if (!data.access) return null;

      sessionStorage.setItem("access", data.access);

      if (data.refresh) {
        sessionStorage.setItem("refresh", data.refresh);
      }

      return data.access;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data
      ? JSON.stringify(data, null, 2)
      : response.statusText;

    throw new Error(
      `Erro ${response.status}:\n${errorMessage}`
    );
  }

  return data as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const storedAccessToken =
    typeof window !== "undefined"
      ? sessionStorage.getItem("access")
      : null;

  let token = accessToken
    ? storedAccessToken || accessToken
    : undefined;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const makeRequest = () =>
    fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

  let response = await makeRequest();

  if (response.status === 401 && token) {
    const renewedToken = await refreshAccessToken();

    if (!renewedToken) {
      redirectToLogin();
      throw new Error(
        "Sua sessão expirou. Faça login novamente."
      );
    }

    token = renewedToken;
    headers.set("Authorization", `Bearer ${token}`);

    response = await makeRequest();

    if (response.status === 401) {
      redirectToLogin();
      throw new Error(
        "Sua sessão expirou. Faça login novamente."
      );
    }
  }

  return parseResponse<T>(response);
}

export async function validateSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const accessToken = sessionStorage.getItem("access");
  const refreshToken = sessionStorage.getItem("refresh");

  if (!accessToken && !refreshToken) {
    return false;
  }

  if (!accessToken && refreshToken) {
    const renewedToken = await refreshAccessToken();
    return renewedToken !== null;
  }

  if (!accessToken) return false;

  try {
    await apiRequest<unknown>(
      "/dashboard/",
      { method: "GET" },
      accessToken
    );

    return true;
  } catch {
    return false;
  }
}
