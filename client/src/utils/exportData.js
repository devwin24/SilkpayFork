/**
 * Data export utilities for CSV/Excel generation
 */

/**
 * Export array of objects to CSV file
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<{key: string, label: string, format?: Function}>} columns - Column definitions
 * @param {string} filename - Output filename (without extension)
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Header row
  const headers = columns.map(col => col.label);
  
  // Data rows
  const rows = data.map(item => 
    columns.map(col => {
      // Support nested keys like "user.name"
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
      
      // Apply custom formatter if provided
      const formatted = col.format ? col.format(value) : value;
      
      // Handle null/undefined
      return formatted === null || formatted === undefined ? '-' : String(formatted);
    })
  );
  
  
  // Combine and convert to CSV (escape quotes)
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  // Add UTF-8 BOM for Excel compatibility (fixes rupee symbol ₹ display)
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  // Download
  downloadFile(csvWithBOM, `${filename}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Helper function to trigger file download
 * @param {string|Blob} content - File content
 * @param {string} filename - Output filename
 * @param {string} mimeType - MIME type
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = content instanceof Blob 
    ? content 
    : new Blob([content], { type: mimeType });
    
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export data to JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Output filename (without extension)
 */
export const exportToJSON = (data, filename = 'export') => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}_${Date.now()}.json`, 'application/json');
};
