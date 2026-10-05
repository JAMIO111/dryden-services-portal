// Generic before/after diffing for record edits, used to build change-log
// entries and human-readable notification summaries.

function normalize(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim();
  return value;
}

function valuesEqual(a, b) {
  const na = normalize(a);
  const nb = normalize(b);

  if (Array.isArray(na) && Array.isArray(nb)) {
    const sa = [...na].sort();
    const sb = [...nb].sort();
    return JSON.stringify(sa) === JSON.stringify(sb);
  }

  return na === nb;
}

function defaultFormat(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

/**
 * Compares `before` and `after` on the fields named in `fieldConfig`
 * (`{ field: { label, format? } }`) and returns one entry per field that
 * actually changed: `{ field, label, oldValue, newValue, oldDisplay, newDisplay }`.
 * Fields not present in `after` are skipped - this only reports on fields
 * the save actually submitted, not the full object shape.
 */
export function buildFieldChanges(before, after, fieldConfig) {
  if (!after) return [];
  const changes = [];

  for (const [field, config] of Object.entries(fieldConfig)) {
    if (!(field in after)) continue;

    const oldValue = before ? before[field] : undefined;
    const newValue = after[field];
    if (valuesEqual(oldValue, newValue)) continue;

    const format = config.format || defaultFormat;
    changes.push({
      field,
      label: config.label,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      oldDisplay: format(oldValue),
      newDisplay: format(newValue),
    });
  }

  return changes;
}

/**
 * Turns a `buildFieldChanges` result into a short string for a notification,
 * e.g. "Bedrooms: 3 → 4 • Sleeps: 6 → 8". Caps how many fields are spelled
 * out so one edit touching a dozen fields doesn't produce an unreadable wall
 * of text in the notification pane.
 */
export function summarizeChanges(changes, { maxFields = 4 } = {}) {
  if (!changes || changes.length === 0) return "";

  const shown = changes.slice(0, maxFields);
  const summary = shown
    .map((c) => `${c.label}: ${c.oldDisplay} → ${c.newDisplay}`)
    .join(" • ");

  const remaining = changes.length - shown.length;
  if (remaining <= 0) return summary;

  return `${summary} • +${remaining} more field${remaining === 1 ? "" : "s"}`;
}
