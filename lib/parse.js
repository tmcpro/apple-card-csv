/**
* @license Apache-2.0
*
* Copyright (c) 2020 Athan Reines.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import debug from 'debug';
import { reverse } from './reverse.js';

// VARIABLES //

const logger = debug('apple-card-csv:parse');

// FUNCTIONS //

/**
* Processes a page's text content to extract transaction data.
*
* @private
* @param {Object} content - page content
* @param {number} pageNum - page number
* @returns {Array<Object>} Array of transactions
*/
function processPageContent(content, pageNum) {
	const results = [];
	let row = null;
	let type = null;

	logger('Extracting %d page items...', content.items.length);
	
	// Group items by y-position and scale x-position
	const o = {};
	for (const item of content.items) {
		const str = item.str.trim();
		if (str === '') continue;
		
		logger('Item: %s', str);

		// Scale x-position within acceptable range
		const x = Math.round(item.transform[4] / 5);
		// Group by y-position
		const y = Math.round(item.transform[5]);
		
		if (!o[y]) {
			o[y] = {};
		}
		o[y][x] = str;
	}

	const rows = reverse(Object.values(o));
	if (rows.length < 3) {
		logger('Page %d contains insufficient data to be a statement. Skipping...', pageNum);
		return results;
	}

	// Remove footer
	rows.length -= 2;

	// Extract and verify header
	const header = rows.splice(0, 3);
	const statementText = Object.values(header[0])[0];
	const customerText = Object.values(header[1])[0];

	if (!statementText?.toLowerCase() === 'statement') {
		logger('Unable to confirm page %d is a statement. Missing "Statement" identifier. Skipping...', pageNum);
		return results;
	}
	if (!customerText?.toLowerCase() === 'apple card customer') {
		logger('Unable to confirm page %d is a statement. Missing "Apple Card Customer" identifier. Skipping...', pageNum);
		return results;
	}

	logger('Processing page rows...');
	logger('Number of rows: %d', rows.length);

	for (const [index, v] of rows.entries()) {
		logger('Processing row %d...', index);
		const keys = Object.keys(v);
		logger('Number of columns: %d.', keys.length);

		// Check if row denotes transaction type
		const dateCheck = Date.parse(v[7]);
		if (Number.isNaN(dateCheck) && keys.length === 1) {
			if (row) {
				logger('Transaction: %s', JSON.stringify(row));
				results.push(row);
				row = null;
			}
			type = v[7];
			logger('Found transaction type: %s', type);
			continue;
		}

		// Check for transaction description
		const description = v[21];
		if (!description) {
			logger('Row missing transaction description. Skipping...');
			continue;
		}
		if (keys.length === 1) {
			logger('Row appears to be continuation of previous description');
			row.Description += '\n' + description;
			continue;
		}

		// Check for transaction date
		const date = v[9] || v[7];
		if (Number.isNaN(Date.parse(date))) {
			logger('Unable to parse date: %s. Skipping...', date);
			continue;
		}

		// Add previous row if exists
		if (row) {
			logger('Transaction: %s', JSON.stringify(row));
			results.push(row);
		}

		// Create new transaction row
		row = {
			'Date': date,
			'Type': type,
			'Description': description,
			'Daily Cash (%)': v[85] || v[83],
			'Daily Cash ($)': v[89],
			'Amount': v[111] || v[110] || v[109] || v[108] || v[107]
		};
	}

	// Add final row if exists
	if (row) {
		logger('Transaction: %s', JSON.stringify(row));
		results.push(row);
	}

	return results;
}

/**
* Parses an Apple Card statement document.
*
* @param {Object} doc - PDF document object
* @returns {Promise<Array<Object>>} Promise resolving to array of transactions
*/
async function parse(doc) {
	logger('Parsing document...');
	const results = [];
	
	const NUM_PAGES = doc.numPages;
	logger('Number of pages: %d.', NUM_PAGES);
	
	logger('Skipping first page...');
	// Start from second page (transactions start there)
	for (let i = 1; i < NUM_PAGES; i++) {
		const pageNum = i + 1;
		logger('Loading page %d of %d...', pageNum, NUM_PAGES);
		
		try {
			const page = await doc.getPage(i);
			logger('Resolved page %d of %d.', pageNum, NUM_PAGES);
			
			const content = await page.getTextContent();
			logger('Resolved content of page %d of %d.', pageNum, NUM_PAGES);
			
			const pageResults = processPageContent(content, pageNum);
			results.push(...pageResults);
			
			logger('Finished processing page %d of %d.', pageNum, NUM_PAGES);
		} catch (error) {
			logger('Error processing page %d: %s', pageNum, error.message);
			throw error;
		}
	}
	
	logger('Finished processing document pages.');
	return results;
}

// EXPORTS //

export { parse };
