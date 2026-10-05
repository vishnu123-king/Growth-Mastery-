// Capture any AI Studio auth token and session index from the URL on load
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("___aistudio_auth_token");
  const sessionIndex = params.get("___session_index");
  
  if (token) {
    sessionStorage.setItem("___aistudio_auth_token", token);
  }
  if (sessionIndex) {
    sessionStorage.setItem("___session_index", sessionIndex);
  }
}

export function apiFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  let targetInput = input;
  
  // Extract token from sessionStorage to support cookie-blocked iframe sessions
  const token = typeof window !== "undefined" ? sessionStorage.getItem("___aistudio_auth_token") : null;
  const sessionIndex = typeof window !== "undefined" ? sessionStorage.getItem("___session_index") : null;

  if (token) {
    if (typeof targetInput === "string") {
      const url = new URL(targetInput, typeof window !== "undefined" ? window.location.origin : undefined);
      url.searchParams.set("___aistudio_auth_token", token);
      if (sessionIndex) {
        url.searchParams.set("___session_index", sessionIndex);
      }
      // Keep as relative path if original was relative
      targetInput = targetInput.startsWith("/") ? url.pathname + url.search + url.hash : url.toString();
    } else if (targetInput instanceof URL) {
      targetInput.searchParams.set("___aistudio_auth_token", token);
      if (sessionIndex) {
        targetInput.searchParams.set("___session_index", sessionIndex);
      }
    } else if (targetInput instanceof Request) {
      try {
        const url = new URL(targetInput.url);
        url.searchParams.set("___aistudio_auth_token", token);
        if (sessionIndex) {
          url.searchParams.set("___session_index", sessionIndex);
        }
        targetInput = new Request(url.toString(), targetInput);
      } catch (e) {
        // Fallback in case of request url parsing errors
      }
    }
  }

  const userId = localStorage.getItem("competency_user_id");
  let modifiedInit = init || {};

  if (userId) {
    if (targetInput instanceof Request) {
      try {
        targetInput.headers.set("x-user-id", userId);
      } catch (e) {
        modifiedInit = { ...modifiedInit };
        const headers = new Headers(modifiedInit.headers || {});
        headers.set("x-user-id", userId);
        modifiedInit.headers = headers;
      }
    } else {
      modifiedInit = { ...modifiedInit };
      const headers = new Headers(modifiedInit.headers || {});
      headers.set("x-user-id", userId);
      modifiedInit.headers = headers;
    }
  }

  return fetch(targetInput, modifiedInit);
}

