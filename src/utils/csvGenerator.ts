import { Response } from 'express';

/**
 * CSV Generator Utility for Server-side Export
 * Handles CSV formatting and HTTP response headers for file downloads
 */

/**
 * Escapes CSV field values to handle special characters
 */
function escapeCSVField(field: any): string {
    if (field === null || field === undefined) {
        return '';
    }

    const str = String(field);
    
    // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}

/**
 * Formats date to readable format for CSV
 */
function formatDateForCSV(dateString?: string | Date): string {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US').replace(/\//g, '-');
    } catch {
        return '';
    }
}

/**
 * Flattens nested objects for CSV export
 */
function flattenObjectForCSV(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];
        const newKey = prefix ? `${prefix}_${key}` : key;

        if (value === null || value === undefined) {
            flattened[newKey] = '';
        } else if (Array.isArray(value)) {
            // Handle arrays by joining values
            if (value.length > 0 && typeof value[0] === 'object') {
                // Array of objects - extract meaningful fields
                const arrayValues = value.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        // For objects, try to get name, title, or join all non-null values
                        return item.name || item.title || 
                               Object.values(item).filter(v => v !== null && v !== undefined).join(' ');
                    }
                    return String(item);
                }).filter(Boolean).join('; ');
                flattened[newKey] = arrayValues;
            } else {
                // Array of primitives
                flattened[newKey] = value.filter(v => v !== null && v !== undefined).join('; ');
            }
        } else if (typeof value === 'object') {
            // Recursively flatten nested objects
            const nested = flattenObjectForCSV(value, newKey);
            Object.assign(flattened, nested);
        } else if (typeof value === 'boolean') {
            flattened[newKey] = value ? 'Yes' : 'No';
        } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('_at')) {
            // Format date fields
            flattened[newKey] = formatDateForCSV(value);
        } else {
            flattened[newKey] = value;
        }
    }

    return flattened;
}

/**
 * Converts field names to human-readable headers
 */
function formatHeaderForCSV(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to words
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Converts array of data to CSV format
 */
export function generateCSV(data: any[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    // Flatten all data items
    const flattenedData = data.map(item => flattenObjectForCSV(item));

    // Get all unique headers from all flattened items
    const headersSet = new Set<string>();
    flattenedData.forEach(item => {
        Object.keys(item).forEach(key => headersSet.add(key));
    });
    const headers = Array.from(headersSet);

    // Create CSV header row with formatted names
    const csvHeaders = headers.map(h => escapeCSVField(formatHeaderForCSV(h))).join(',');

    // Create CSV data rows
    const csvRows = flattenedData.map(item =>
        headers.map(header => escapeCSVField(item[header] || '')).join(',')
    );

    // Combine headers and rows
    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Sets appropriate HTTP headers for CSV file download
 */
export function setCSVResponseHeaders(res: Response, filename: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const finalFilename = filename.endsWith('.csv') ? filename : `${filename}_${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
}

/**
 * Sends CSV data as downloadable file response
 */
export function sendCSVResponse(res: Response, data: any[], filename: string): void {
    try {
        const csvContent = generateCSV(data);
        setCSVResponseHeaders(res, filename);
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating CSV file'
        });
    }
}