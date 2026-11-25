export function exportToCsv(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = (row as Record<string, unknown>)[k] === null || (row as Record<string, unknown>)[k] === undefined ? '' : (row as Record<string, unknown>)[k];
            const cellStr = cell instanceof Date ? cell.toLocaleString() : String(cell);
            let escaped = cellStr.replace(/"/g, '""');
            if (escaped.search(/("|,|\n)/g) >= 0) {
              escaped = `"${escaped}"`;
            }
            return escaped;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}