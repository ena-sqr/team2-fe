export type MutatorOptions = RequestInit;

export async function mutate<T = unknown>(
  url: string,
  options: MutatorOptions,
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    "ngrok-skip-browser-warning": "true",
    ...(options.body instanceof FormData
      ? {} // Do not set content-type when sending FormData
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers: defaultHeaders,
  };

  const response = await fetch(`${url}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Mutator error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
