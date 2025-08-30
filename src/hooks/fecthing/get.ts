const base_url = import.meta.env.VITE_BASE_URL;

export async function get<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${base_url}/${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
