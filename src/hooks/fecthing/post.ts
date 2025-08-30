const base_url = import.meta.env.VITE_BASE_URL;
export async function post<T, B>(path: string, body: B): Promise<T> {
  try {
    const response = await fetch(`${base_url}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("POST error:", error);
    throw error;
  }
}
