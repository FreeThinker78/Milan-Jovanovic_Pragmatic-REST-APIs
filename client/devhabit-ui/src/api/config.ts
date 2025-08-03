export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';

export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data as T;
}
