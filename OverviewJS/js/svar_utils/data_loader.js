// js/svar_utils/data_loader.js

const SvarDataLoader = {
    /**
     * Fetches and parses an Excel file.
     * @param {string} filePath Path to the .xlsx file.
     * @returns {Promise<object>} A promise that resolves to an object containing structured data 
     *                            (e.g., { year: [], month: [], i: [], sp500: [] }) or rejects with an error.
     */
    loadData: async function(filePath) {
        console.log(`Fetching data from: ${filePath}`);
        if (typeof XLSX === 'undefined') {
            console.error('XLSX library (SheetJS) is not loaded. Make sure it is included in your HTML.');
            return Promise.reject('XLSX library not found.');
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Assuming data is in the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON. We expect headers in the first row.
            // XLSX.utils.sheet_to_json will use the first row as keys by default.
            // However, the problem description implies a matrix-like structure: data(:,1) etc.
            // Let's assume the Excel file has headers like 'Year', 'Month', 'InterestRate', 'SP500'
            // If not, this part needs adjustment based on actual Excel structure.
            // For now, we'll convert to an array of arrays (aoa) and process manually.
            const dataRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

            if (dataRows.length < 2) { // At least one header row and one data row
                throw new Error('No data found in the Excel sheet or sheet is empty.');
            }

            // Skip header row (dataRows[0]) and process data
            // Based on the problem: year = data(:,1); month = data(:,2); i = data(:,3); sp500= data(:,4);
            const structuredData = {
                year: [],
                month: [],
                i: [],       // Interest Rate (i_t)
                sp500: [],   // S&P 500 level (original data)
                r_t: []      // S&P 500 returns (calculated)
            };

            // Start from the second row (index 1) assuming the first row is headers
            for (let i = 1; i < dataRows.length; i++) {
                const row = dataRows[i];
                if (row && row.length >= 4) { // Ensure row has enough columns
                    structuredData.year.push(row[0]);
                    structuredData.month.push(row[1]);
                    structuredData.i.push(parseFloat(row[2])); // Assuming numeric
                    const sp500Value = parseFloat(row[3]); // S&P 500 level
                    structuredData.sp500.push(sp500Value);
                    
                    // Calculate S&P 500 returns (percentage change)
                    if (i > 1 && structuredData.sp500.length > 1) {
                        const prevSP500 = structuredData.sp500[structuredData.sp500.length - 2];
                        const returns = ((sp500Value / prevSP500) - 1) * 100; // Percentage return
                        structuredData.r_t.push(returns);
                    }
                } else {
                    console.warn(`Skipping row ${i+1} due to insufficient data:`, row);
                }
            }
            // After calculating returns, drop the first observation from all variables so arrays are aligned
            if (structuredData.r_t.length > 0) {
                structuredData.year = structuredData.year.slice(1);
                structuredData.month = structuredData.month.slice(1);
                structuredData.i = structuredData.i.slice(1);
                structuredData.sp500 = structuredData.sp500.slice(1);
                // r_t already has correct length
            }

            console.log('Data parsed successfully:', structuredData);
            return structuredData;

        } catch (error) {
            console.error('Error loading or parsing Excel data:', error);
            // Propagate the error to be caught by the caller in main.js
            return Promise.reject(error);
        }
    }
};

// To make SvarDataLoader globally available if not using ES6 modules:
// window.SvarDataLoader = SvarDataLoader;
