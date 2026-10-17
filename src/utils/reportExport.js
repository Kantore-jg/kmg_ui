function escapeCsvValue(value, delimiter = ';') {
  const raw = value === null || value === undefined ? '' : String(value);
  if (raw.includes('"')) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  if (raw.includes('\n') || raw.includes('\r') || raw.includes(delimiter)) {
    return `"${raw}"`;
  }
  return raw;
}

export function downloadCsvReport({ filename, columns, rows, delimiter = ';' }) {
  const header = columns.map((column) => escapeCsvValue(column.label, delimiter)).join(delimiter);
  const body = rows.map((row) =>
    columns
      .map((column) => {
        const value = column.get ? column.get(row) : row[column.key];
        return escapeCsvValue(value, delimiter);
      })
      .join(delimiter),
  );

  const csv = [header, ...body].join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
