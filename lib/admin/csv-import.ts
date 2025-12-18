export interface CSVRow {
    [key: string]: string;
}

export function parseCSV(content: string): CSVRow[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Detect separator (semicolon or comma)
    const headerLine = lines[0];
    const separator = headerLine.includes(';') ? ';' : ',';

    const headers = headerLine.split(separator).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

    const result: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Handle quotes if necessary? Simple split for now, robust CSV parsing is complex.
        // For this MVP, we assume no separators inside values or simple split.
        // Better regex for splitting with ease:
        const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length === headers.length) {
            const row: CSVRow = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            result.push(row);
        }
    }

    return result;
}
