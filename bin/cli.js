#!/usr/bin/env node

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

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import debug from 'debug';
import { parse } from '../lib/main.js';
import { array2csv } from '../lib/array2csv.js';

const logger = debug('apple-card-csv:cli');
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const program = new Command();

// Read package.json for version
const pkg = JSON.parse(
    await readFile(
        new URL('../package.json', import.meta.url),
        'utf8'
    )
);

program
    .name('apple-card-csv')
    .description('Convert Apple Card statements to CSV format')
    .version(pkg.version)
    .argument('[files...]', 'PDF statement files to convert')
    .action(async (files) => {
        try {
            // Handle stdin if no files provided
            if (!files.length && !process.stdin.isTTY) {
                const chunks = [];
                for await (const chunk of process.stdin) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                const results = await parse(new Uint8Array(buffer));
                console.log(array2csv(results));
                return;
            }
            
            // Handle files
            if (!files.length) {
                console.error('Error: No input files provided');
                process.exit(1);
            }
            
            const statements = await Promise.all(
                files.map(async (file) => {
                    const path = resolve(process.cwd(), file);
                    logger('Reading file: %s', path);
                    const buffer = await readFile(path);
                    return new Uint8Array(buffer);
                })
            );
            
            const results = await parse(statements);
            console.log(array2csv(results));
            
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse(); 