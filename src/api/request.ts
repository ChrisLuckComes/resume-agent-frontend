export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response.json() as Promise<T>
}

export async function ensureOk(response: Response): Promise<Response> {
  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response
}
