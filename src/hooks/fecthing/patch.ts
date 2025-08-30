const base_url = import.meta.env.VITE_BASE_URL;

export async function patch<T, B>(
  path: string,
  body: B | null = null
): Promise<T> {
  try {
    const response = await fetch(`${base_url}/${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ permet d’envoyer le cookie JWT
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("PATCH error:", error);
    throw error;
  }
}
