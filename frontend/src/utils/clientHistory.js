const KEY = "clientHistory"; // array of { id, title, image, searchType, createdAt }

export function loadClientHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveClientHistory(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    console.log("Error");
  }
}

export function upsertClientHistory(item, limit = 100) {
  const list = loadClientHistory();
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list.splice(idx, 1); // replace
  list.unshift({ ...item, createdAt: item.createdAt || new Date().toISOString() });
  if (list.length > limit) list.length = limit;
  saveClientHistory(list);
}

export function removeClientHistoryById(id) {
  const list = loadClientHistory().filter((x) => x.id !== id);
  saveClientHistory(list);
}
