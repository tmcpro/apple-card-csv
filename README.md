<!--

@license Apache-2.0

Copyright (c) 2020 Athan Reines.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# Apple Card Statement Parser

> Parses Apple Card statements and converts them to CSV format.

## Overview

For older Apple devices supporting Apple Wallet (e.g., iPhone 6, iPhone 5, etc) but no longer supporting OS updates (iOS < 13), users are unable to export their Apple Card statements as CSV. This tool helps by reading and parsing exported statement PDFs for CSV generation.

## Prerequisites

- Node.js >= 18.0.0

## Installation

```bash
# Install globally
npm install -g apple-card-csv

# Or run directly with npx
npx apple-card-csv
```

## Usage

### Command Line

```bash
# Process a single statement
apple-card-csv statement.pdf > output.csv

# Process multiple statements
apple-card-csv statement1.pdf statement2.pdf > combined.csv

# Process from stdin
cat statement.pdf | apple-card-csv > output.csv

# Enable debug output
DEBUG=apple-card-csv* apple-card-csv statement.pdf
```

### Programmatic Usage

```javascript
import { readFile } from 'node:fs/promises';
import { parse } from 'apple-card-csv';

try {
    const pdfData = await readFile('statement.pdf');
    const transactions = await parse(new Uint8Array(pdfData));
    console.log(transactions);
} catch (error) {
    console.error('Error:', error.message);
}
```

## Output Format

The CSV output includes the following columns:

- **Date**: Transaction date (MM/DD/YYYY)
- **Type**: Transaction type (e.g., 'Transactions', 'Payments', 'Interest Charged')
- **Description**: Transaction description
- **Daily Cash (%)**: Daily cash percentage
- **Daily Cash ($)**: Daily cash amount
- **Amount**: Transaction amount

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

Apache-2.0 © Athan Reines

<!-- Section to include introductory text. Make sure to keep an empty line after the intro `section` element and another before the `/section` close. -->

<section class="intro">

For older Apple devices supporting Apple Wallet (e.g., iPhone 6, iPhone 5, etc), but no longer supporting OS updates (iOS < 13), users are unable to export their Apple Card statements as CSV.

To support these older devices, this package reads and parses exported statement PDFs for subsequent CSV generation. 

</section>

<!-- /.intro -->

<!-- Package usage documentation. -->

<section class="usage">

## Usage

```javascript
var parse = require( 'apple-card-csv' );
```

#### parse( src, clbk )

Parses one or more statements.

```javascript
var resolve = require( 'path' ).resolve;
var cwd = require( '@stdlib/process/cwd' );
var readFileSync = require( '@stdlib/fs/read-file' ).sync;

var fpath = resolve( cwd(), 'path', 'to', 'statement.pdf' );
var src = readFileSync( fpath );

parse( src, done );

function done( error, data ) {
    if ( error ) {
        return console.error( error.message );
    }
    console.log( data );
}
```

To parse more than one statement, provide an `Array` of statements, where each element is a `Uint8Array` containing statement binary data.

Returned data has the following format:

-   **Date**: transaction date. The field value has the following format: `MM/DD/YYYY`.
-   **Type** transaction type; e.g., `'Transactions'`, `'Payments'`, `'Interest Charged'`.
-   **Description**: transaction description.
-   **Daily Cash (%)**: daily cash percentage.
-   **Daily Cash ($)**: daily cash amount.
-   **Amount**: transaction amount.

```text
[
  {
    'Date': '10/03/2019',
    'Type': 'Transactions',
    'Description': 'FOO BAR',
    'Daily Cash (%)': '2%',
    'Daily Cash ($)': '$1.29',
    'Amount': '$64.31'
  },
  {
    'Date': '10/04/2019',
    'Type': 'Transactions',
    'Description': 'BEEP BOOP',
    'Daily Cash (%)': '2%',
    'Daily Cash ($)': '$0.68',
    'Amount': '$33.98'
  },
  ...
]
```

</section>

<!-- /.usage -->

<!-- Package usage notes. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="notes">

</section>

<!-- /.notes -->

<!-- Package usage examples. -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var join = require( 'path' ).join;
var readFileSync = require( '@stdlib/fs/read-file' ).sync;
var parse = require( 'apple-card-csv' );

var fpath = join( __dirname, 'examples', 'fixtures', 'statement.pdf' );
var src = readFileSync( fpath );

parse( src, done );

function done( error, data ) {
    if ( error ) {
        return console.error( error.message );
    }
    console.log( data );
}
```

</section>

<!-- /.examples -->

<!-- Section for describing a command-line interface. -->

* * *

<section class="cli">

## CLI

<!-- CLI usage documentation. -->

<section class="usage">

### Usage

```text
Usage: apple-card-csv [options] [<file1> <file2> ...]

Options:

  -h,    --help                Print this message.
  -V,    --version             Print the package version.
```

</section>

<!-- /.usage -->

<!-- CLI usage notes. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="notes">

### Notes

-   File paths may be either absolute or relative and are resolved relative to the current working directory.

</section>

<!-- /.notes -->

<!-- CLI usage examples. -->

<section class="examples">

### Examples

```bash
$ apple-card-csv ./path/to/statement.pdf
Date,Type,Description,Daily Cash (%),Daily Cash ($),Amount
"10/03/2019","Transactions","FOO BAR","2%","$1.29","$64.31"
"10/04/2019","Transactions","BEEP BOOP","2%","$0.68","$33.98"
...
```

To use as a [standard stream][standard-streams],

```bash
$ cat ./path/to/statement.pdf | apple-card-csv
"10/03/2019","Transactions","FOO BAR","2%","$1.29","$64.31"
"10/04/2019","Transactions","BEEP BOOP","2%","$0.68","$33.98"
...
```

</section>

<!-- /.examples -->

</section>

<!-- /.cli -->

<!-- Section to include cited references. If references are included, add a horizontal rule *before* the section. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="references">

</section>

<!-- /.references -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[standard-streams]: https://en.wikipedia.org/wiki/Standard_streams

</section>

<!-- /.links -->
