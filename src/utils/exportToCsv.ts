/**
 * Export JSON array of objects to CSV file with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  const keys = Object.keys(rows[0]);
  const headerRow = keys.join(',');

  const csvRows = rows.map((row) => {
    return keys
      .map((key) => {
        let val = row[key];
        if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }
        // Escape quotes and wrap in quotes if contains comma/newline
        const escaped = val.replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
          return `"${escaped}"`;
        }
        return escaped;
      })
      .join(',');
  });

  const csvString = '\uFEFF' + [headerRow, ...csvRows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
