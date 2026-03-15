const store = new Map<string, File>();

export function setPendingFile(key: string, file: File) {
  store.set(key, file);
}

export function getPendingFile(key: string): File | undefined {
  return store.get(key);
}

export function clearPendingFile(key: string) {
  store.delete(key);
}

export function clearAllPendingFiles() {
  store.clear();
}
