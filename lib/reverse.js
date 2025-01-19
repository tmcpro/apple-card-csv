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

/**
* Reverses an array in-place.
*
* @private
* @param {Array} arr - input array
* @returns {Array} input array
*
* @example
* const arr = [1, 2, 3, 4];
* const out = reverse(arr);
* // returns [4, 3, 2, 1];
*
* @example
* const arr = [1, 2, 3];
* const out = reverse(arr);
* // returns [3, 2, 1]
*/
function reverse(arr) {
	const len = arr.length;
	const mid = Math.floor(len / 2);
	
	for (let i = 0; i < mid; i++) {
		const j = len - 1 - i;
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	
	return arr;
}

export { reverse };
