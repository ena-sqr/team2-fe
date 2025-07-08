export type FetcherOptions = RequestInit;

export async function fetcher<T = unknown>(
  url: string,
  options: FetcherOptions = {},
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers: defaultHeaders,
  };

  const response = await fetch(`${url}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Fetch error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
