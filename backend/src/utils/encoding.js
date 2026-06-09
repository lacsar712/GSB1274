export function fixMojibake(str) {
  if (typeof str !== 'string') return str;
  try {
    const hasReplacement = str.includes('\uFFFD');
    const suspicious = /[ÃÂÅÆÇãâåæçéèêëíïñóöúüœ]/.test(str) || hasReplacement;
    if (!suspicious) return str;
    let out = Buffer.from(str, 'latin1').toString('utf8');
    if (out.includes('\uFFFD')) {
      try {
        out = decodeURIComponent(escape(str));
      } catch (_) {}
    }
    if (out.includes('\uFFFD')) {
      out = out.replace(/\uFFFD+/g, '');
    }
    out = out.replace(/[\u0000-\u001F\u007F]/g, '');
    return out;
  } catch (_) {
    return str;
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input ?? '');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function formatDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input ?? '');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input ?? '');
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const out = Array.isArray(row) ? [] : {};
  const entries = Array.isArray(row) ? row.map((v, i) => [i, v]) : Object.entries(row);
  for (const [k, v] of entries) {
    if (typeof v === 'string') {
      out[k] = fixMojibake(v);
    } else if (v instanceof Date) {
      out[k] = formatDateTime(v);
    } else if (Array.isArray(v)) {
      out[k] = v.map(item => (typeof item === 'string' ? fixMojibake(item) : normalizeRow(item)));
    } else if (v && typeof v === 'object') {
      out[k] = normalizeRow(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
