// Copied from https://stackoverflow.com/questions/8670909/is-there-any-builtin-javascript-string-hash-function-in-newest-browsers
export async function sha256(source: string): Promise<string> {
  const sourceBytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest("SHA-256", sourceBytes);
  const resultBytes = [...new Uint8Array(digest)];
  return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
}
