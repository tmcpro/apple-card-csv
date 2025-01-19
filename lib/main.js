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
import * as pdf from 'pdfjs-dist';
import { parse as parseStatement } from './parse.js';

// VARIABLES //

const logger = debug('apple-card-csv');

// FUNCTIONS //

/**
* Comparison function for sorting transactions.
*
* @private
* @param {Object} a - first transaction
* @param {Object} b - second transaction
* @returns {number} sort order
*/
function comparator(a, b) {
	const dateA = Date.parse(a.Date);
	const dateB = Date.parse(b.Date);
	return dateA - dateB;
}

/**
* Validates input statement data
* 
* @private
* @param {(Uint8Array|Array<Uint8Array>)} src - statement(s)
* @returns {Array<Uint8Array>} Validated array of statements
* @throws {TypeError} If input is invalid
*/
function validateInput(src) {
	if (src instanceof Uint8Array) {
		return [src];
	}
	if (Array.isArray(src)) {
		if (!src.every(item => item instanceof Uint8Array)) {
			throw new TypeError('Invalid argument. Array must contain only Uint8Arrays.');
		}
		return src;
	}
	throw new TypeError('Invalid argument. Must be either a Uint8Array or an array of Uint8Arrays.');
}

/**
* Parses one or more Apple Card statements.
*
* @param {(Uint8Array|Array<Uint8Array>)} src - statement(s)
* @returns {Promise<Array<Object>>} Promise resolving to array of parsed transactions
*
* @example
* import { readFile } from 'node:fs/promises';
*
* try {
*     const src = await readFile('/path/to/apple-card/statement.pdf');
*     const data = await parse(src);
*     console.log(data);
* } catch (error) {
*     console.error(error);
* }
*/
async function parse(src) {
	const statements = validateInput(src);
	const N = statements.length;
	logger('Number of statements: %d.', N);

	const results = [];
	
	for (let i = 0; i < N; i++) {
		const statementNum = i + 1;
		logger('Loading statement %d of %d...', statementNum, N);
		
		try {
			const doc = await pdf.getDocument(statements[i]).promise;
			logger('Successfully loaded statement %d of %d.', statementNum, N);
			logger('Processing statement %d of %d...', statementNum, N);
			
			const data = await parseStatement(doc);
			logger('Successfully processed statement %d of %d.', statementNum, N);
			results.push(...data);
			
		} catch (error) {
			logger('Error processing statement %d of %d: %s', statementNum, N, error.message);
			throw error;
		}
	}

	logger('Finished processing all statements.');
	logger('Sorting transactions...');
	results.sort(comparator);
	
	logger('Results: %s', JSON.stringify(results));
	return results;
}

// EXPORTS //

export { parse };
