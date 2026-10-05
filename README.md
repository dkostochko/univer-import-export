# @mertdeveci55/univer-import-export

A robust Excel/CSV import and export library for [Univer](https://github.com/dream-num/univer) spreadsheets with full format preservation, including formulas, styling, charts, and conditional formatting.

[![npm version](https://img.shields.io/npm/v/@mertdeveci55/univer-import-export.svg)](https://www.npmjs.com/package/@mertdeveci55/univer-import-export)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Import Support**
- Excel files (.xlsx, .xls)
- CSV files (.csv)
- Preserves ALL sheets (including empty ones)
- Handles special characters in sheet names (>>>, etc.)
- Maintains exact sheet order
- Full styling preservation (fonts, colors, borders, alignment)
- Formula and calculated value retention (including TRANSPOSE and array formulas)
- Merged cells support
- Images and charts
- Conditional formatting
- Data validation
- Hyperlinks and rich text

✅ **Export Support**
- Excel files (.xlsx)
- CSV files (.csv)
- Full formatting preservation
- Formula export
- Named ranges
- Multiple sheets

## Installation

```bash
npm install @mertdeveci55/univer-import-export
```

or

```bash
yarn add @mertdeveci55/univer-import-export
```

## Usage

### Configure logging

The library writes logs to the console by default. Set a global adapter to route log events to your application's logger, file writer, or another destination:

```typescript
import LuckyExcel, { type LogEvent } from '@mertdeveci55/univer-import-export';

const sendToApplicationLogger = (event: LogEvent) => {
    // event.level: 'log' | 'info' | 'warn' | 'error' | 'debug'
    // event.scope: normalized tag such as 'package' or 'xml', or undefined
    // event.args: message arguments with the [SCOPE] tag removed from the first string
    // event.timestamp: milliseconds since the Unix epoch
    myLogger.write(event);
};

LuckyExcel.setLogAdapter(sendToApplicationLogger);

// Restore console output when the custom adapter is no longer needed.
LuckyExcel.resetLogAdapter();
```

The existing debug filter still applies to `log`, `info`, `warn`, and `debug` calls; `error` calls are always sent. Direct diagnostic messages also go through the adapter without changing their existing filter behavior. If an adapter throws, the library reports that failure to `console.error` and continues processing.

Scopes currently used in log messages include:

- **Import and parsing:** `package`, `zip`, `xml`, `xml setvalue`, `luckyfile`, `sharedformula`
- **Univer conversion:** `univertoluckysheet`, `univerworkbook`, `workbook`
- **Excel export:** `export`, `postprocessor`, `formulacleaner`, `formula`, `arrayformula`, `chartexporter`, `sheetname`
- **Export resources:** `resources`, `filter`, `conditionalformat`, `datavalidation`, `comments`
- **General diagnostics:** `debug`

Scope values are derived from the `[SCOPE]` tag, converted to lowercase, and delivered separately from `args`. For example, `[LuckyFile]` becomes `scope: 'luckyfile'`; the tag itself is removed from the first message argument. Untagged messages have `scope: undefined`.

### Import Excel to Univer

```javascript
import { LuckyExcel } from '@mertdeveci55/univer-import-export';

// Handle file input
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    LuckyExcel.transformExcelToUniver(
        file,
        (univerData) => {
            // Use the Univer data
            console.log('Converted data:', univerData);
            
            // Create Univer instance with the data
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, univerData);
        },
        (error) => {
            console.error('Import error:', error);
        }
    );
});
```

### Import CSV to Univer

```javascript
import { LuckyExcel } from '@mertdeveci55/univer-import-export';

LuckyExcel.transformCsvToUniver(
    csvFile,
    (univerData) => {
        // Use the converted CSV data
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, univerData);
    },
    (error) => {
        console.error('CSV import error:', error);
    }
);
```

### Export Univer to Excel

```javascript
import { LuckyExcel } from '@mertdeveci55/univer-import-export';

// Get Univer snapshot
const snapshot = univer.getActiveWorkbook().save();

LuckyExcel.transformUniverToExcel({
    snapshot: snapshot,
    fileName: 'my-spreadsheet.xlsx',
    success: () => {
        console.log('Export successful');
    },
    error: (err) => {
        console.error('Export error:', err);
    }
});
```

### Export Univer to CSV

```javascript
import { LuckyExcel } from '@mertdeveci55/univer-import-export';

const snapshot = univer.getActiveWorkbook().save();

LuckyExcel.transformUniverToCsv({
    snapshot: snapshot,
    fileName: 'my-data.csv',
    sheetName: 'Sheet1', // Optional: specific sheet to export
    success: () => {
        console.log('CSV export successful');
    },
    error: (err) => {
        console.error('CSV export error:', err);
    }
});
```

## API Reference

### `LuckyExcel.transformExcelToUniver(file, callback, errorHandler)`

Converts Excel file to Univer format.

- **file**: `File` - The Excel file (.xlsx or .xls)
- **callback**: `(data: IWorkbookData) => void` - Success callback with converted data
- **errorHandler**: `(error: Error) => void` - Error callback

### `LuckyExcel.transformCsvToUniver(file, callback, errorHandler)`

Converts CSV file to Univer format.

- **file**: `File` - The CSV file
- **callback**: `(data: IWorkbookData) => void` - Success callback
- **errorHandler**: `(error: Error) => void` - Error callback

### `LuckyExcel.transformUniverToExcel(params)`

Exports Univer data to Excel file.

**Parameters object:**
- **snapshot**: `any` - Univer workbook snapshot
- **fileName**: `string` - Output filename (optional, default: `excel_[timestamp].xlsx`)
- **getBuffer**: `boolean` - Return buffer instead of downloading (optional, default: false)
- **success**: `(buffer?: Buffer) => void` - Success callback
- **error**: `(err: Error) => void` - Error callback

### `LuckyExcel.transformUniverToCsv(params)`

Exports Univer data to CSV file.

**Parameters object:**
- **snapshot**: `any` - Univer workbook snapshot
- **fileName**: `string` - Output filename (optional, default: `csv_[timestamp].csv`)
- **sheetName**: `string` - Specific sheet to export (optional, exports all if not specified)
- **getBuffer**: `boolean` - Return content instead of downloading (optional, default: false)
- **success**: `(content?: string) => void` - Success callback
- **error**: `(err: Error) => void` - Error callback

## Browser Support

The library works in all modern browsers that support:
- ES6+
- File API
- Blob API

## Project Structure

```
src/
├── ToLuckySheet/         # Excel → LuckySheet conversion
│   ├── LuckyFile.ts      # Main file orchestrator - handles sheet discovery
│   ├── LuckySheet.ts     # Individual sheet processor
│   ├── ReadXml.ts        # XML parser with special character escaping
│   ├── LuckyCell.ts      # Cell data processor
│   └── ...
├── LuckyToUniver/        # LuckySheet → Univer conversion
│   ├── UniverWorkBook.ts # Workbook structure converter
│   ├── UniverSheet.ts    # Sheet data converter
│   └── ...
├── UniverToExcel/        # Univer → Excel export
│   ├── Workbook.ts       # Excel workbook builder using ExcelJS
│   └── ...
├── HandleZip.ts          # ZIP file operations using JSZip
└── main.ts               # Entry point with public API

dist/                     # Built output (ESM, CJS, UMD formats)
publish.sh                # Automated publishing script
gulpfile.js              # Build configuration
CLAUDE.md                # Detailed technical documentation
```

## Key Implementation Details

### Special Character Handling
Sheet names with special characters (like `>>>`) are handled through an escape/unescape mechanism in `src/ToLuckySheet/ReadXml.ts`:

```javascript
// Escapes ">" to "__GT__" before XML parsing
escapeXmlAttributes(xmlString)
// Restores "__GT__" back to ">" after parsing
unescapeXmlAttributes(xmlString)
```

### Empty Sheet Preservation
All sheets are preserved during import, even if completely empty. This maintains Excel file structure integrity.

### Formula Support
Comprehensive formula support including:
- Standard formulas (SUM, AVERAGE, IF, VLOOKUP, etc.)
- Array formulas
- TRANSPOSE formulas with proper array handling
- Shared formulas
- Named range references

## Development

### Building

```bash
npm install
npm run build   # Uses gulp to compile TypeScript and bundle
```

### Publishing

Always use the publish script for releases:

```bash
./publish.sh
```

This script:
1. Builds the project
2. Increments version
3. Commits changes
4. Pushes to GitHub
5. Publishes to npm

### Testing

```bash
npm test
```

## Key Improvements

### v0.1.40 (Latest) - Streamlined Export System
1. **Excel Compatibility**: Eliminated Excel recovery warnings completely
2. **Surgical Post-Processing**: Conservative backend fixes that preserve all data integrity
3. **Production Safety**: Reverted experimental fixes that caused corruption
4. **Documentation**: Comprehensive documentation of remaining limitations and workarounds

### v0.1.39 - Backend Integration
1. **openpyxl Integration**: Full backend post-processing system for ExcelJS limitations
2. **Defined Names Fix**: Complete solution for named ranges using Python/Django backend
3. **Dual-Mode Export**: Frontend + backend export with automatic fallback

### v0.1.24 - Core Stability
1. **Special Character Support**: Handles sheet names with `>>>` and other special characters via escape/unescape mechanism
2. **Empty Sheet Preservation**: Empty sheets are never skipped during import
3. **No Hardcoded Solutions**: Removed all hardcoded sheet additions - all solutions are generic
4. **Sheet Order**: Maintains exact sheet order from original file
5. **Style Preservation**: Complete style mapping including bold, italic, colors, borders
6. **Formula Handling**: Preserves both formulas and calculated values, including TRANSPOSE
7. **XLS Support**: Automatic conversion of .xls files to .xlsx format
8. **Better Error Handling**: Comprehensive error messages and detailed logging

## Dependencies

### Core Dependencies
- [`@progress/jszip-esm`](https://www.npmjs.com/package/@progress/jszip-esm) - ZIP file handling for Excel files
- [`@zwight/exceljs`](https://www.npmjs.com/package/@zwight/exceljs) - Excel file structure (export)
- [`@univerjs/core`](https://github.com/dream-num/univer) - Univer core types and interfaces
- [`dayjs`](https://day.js.org/) - Date manipulation for Excel dates
- [`papaparse`](https://www.papaparse.com/) - CSV parsing
- [`xlsx`](https://sheetjs.com/) - Additional Excel format support

### Build Dependencies
- `gulp` - Build orchestration
- `rollup` - Module bundling
- `typescript` - Type safety
- `terser` - Minification (configured to preserve console.logs)

## Related Projects & References

### Core Dependencies
- **[Univer](https://github.com/dream-num/univer)** - The spreadsheet engine this library supports
- **[LuckySheet](https://github.com/mengshukeji/Luckysheet)** - Intermediate format inspiration
- **[LuckyExcel](https://github.com/dream-num/Luckyexcel)** - Original codebase this fork is based on

### Implementation Examples
- **[alphafrontend](https://github.com/mertdeveci/alphafrontend)** - Production implementation
  - See: `src/utils/excel-import.ts` for usage example
  - See: `src/pages/SpreadsheetsPage.tsx` for UI integration

### Documentation
- **[CLAUDE.md](./CLAUDE.md)** - Detailed technical documentation for AI assistants
- **[publish.sh](./publish.sh)** - Automated publishing script
- **[gulpfile.js](./gulpfile.js)** - Build configuration

## Known Issues & Solutions

### ✅ Resolved Issues

| Issue | Solution | Version Fixed |
|-------|----------|---------------|
| Sheets with special characters (>>>) not importing | Escape/unescape mechanism in ReadXml.ts | v0.1.23+ |
| AttributeList undefined errors | Defensive initialization | v0.1.21+ |
| Duplicate sheets appearing | Removed hardcoded sheet additions | v0.1.24 |
| TRANSPOSE formulas not working | Array formula support | v0.1.18+ |
| Border styles not importing | Added style collection in UniverWorkBook | v0.1.38 |

### ⚠️ Export Limitations & Solutions

Due to limitations in the underlying ExcelJS library, some advanced Excel features have issues during **export**. However, we provide comprehensive solutions:

## 🔧 **Backend Post-Processing Solution**

For production applications, we recommend using backend post-processing to achieve **100% Excel compatibility**:

### **Architecture**
```
Frontend Export → Backend API → openpyxl Post-Processing → Fixed Excel File
```

### **Django Integration Example**
```python
from spreadsheets.import_export import UniverToExcelConverter, ExcelPostProcessor

# Step 1: Export with existing functionality (preserves all working features)
converter = UniverToExcelConverter()
excel_buffer = converter.convert(univer_data)

# Step 2: Apply surgical fixes for ExcelJS limitations
post_processor = ExcelPostProcessor()
fixed_buffer = post_processor.process_excel_buffer(
    excel_buffer.getvalue(), 
    univer_data
)
```

### **What Gets Fixed**
- ✅ **Defined Names**: All named ranges work perfectly in Excel
- ✅ **Array Formula Attributes**: Proper XML attributes for spill ranges
- ✅ **Excel 365 Compatibility**: Full support for modern Excel features
- ✅ **Performance**: ~7ms processing overhead
- ✅ **Safety**: Preserves ALL existing functionality

### **Frontend Integration**
```typescript
// Enhanced export with backend post-processing
const result = await exportToExcel({
  workbookData,
  fileName: 'spreadsheet.xlsx',
  useBackendExport: true,        // Enable backend processing
  enablePostProcessing: true,    // Fix ExcelJS limitations
  exportSpreadsheetToExcel: api.exportSpreadsheetToExcel
});

// Automatic fallback to frontend if backend unavailable
if (result.stats?.postProcessingApplied) {
  console.log('✅ Enhanced Excel compatibility applied!');
}
```

### **Setup Requirements**
1. **Python Backend** with `openpyxl` installed
2. **API Endpoint** for post-processing  
3. **Optional**: Feature flag for gradual rollout

## 📊 **Current Export Status (v0.1.40)**

### ✅ **Fully Working Features**
- ✅ **Excel Compatibility**: Files open without recovery warnings
- ✅ **Data Integrity**: All formulas, values, and structure preserved perfectly
- ✅ **Named Ranges**: All defined names work correctly in Excel (fixed in backend)
- ✅ **Import Operations**: 100% functionality preserved for all Excel features

### ⚠️ **Known Visual/Display Issues** 
| Issue | Impact | Status | Workaround |
|-------|--------|---------|------------|
| **TRANSPOSE @ Symbols** | Formulas show `=@TRANSPOSE(@$N$43:$N$45)` | Cosmetic only - calculations work | Document as known issue |
| **Border Style Changes** | Dashed borders may become solid | Visual styling only | Original design preserved in import |
| **ExcelJS Core Limitations** | Some advanced Excel features not supported | Library limitation | Use backend post-processing |

### 🔧 **Backend Post-Processing (Recommended)**

**Status**: Production-ready surgical fixes for maximum Excel compatibility.

**What it fixes**:
- ✅ Removes Excel recovery warnings completely
- ✅ Ensures all named ranges work perfectly
- ✅ Maintains 100% data integrity and formula accuracy

**What it doesn't fix (by design)**:
- ⚠️ TRANSPOSE @ symbols (requires ExcelJS core changes)
- ⚠️ Border style inconsistencies (requires ExcelJS improvements)

**Performance**: ~7ms overhead for complete Excel compatibility.

**Import functionality works perfectly** - these limitations only affect export operations.

## Contributing

Contributions are welcome! Please ensure:

1. **No hardcoded solutions** - All fixes must be generic
2. **Extensive logging** - Add console.log for debugging
3. **Use publish.sh** - Never manually publish to npm
4. **Test edge cases** - Including special characters, empty sheets
5. **Follow existing patterns** - Check CLAUDE.md for architecture

## License

MIT © mertdeveci

## Credits

- Original [LuckyExcel](https://github.com/dream-num/Luckyexcel) by DreamNum
- [Univer](https://github.com/dream-num/univer) spreadsheet engine
- All contributors and issue reporters

## Support

For issues and feature requests:
- [GitHub Issues](https://github.com/mertdeveci/univerjs-import-export/issues)
- Check [CLAUDE.md](./CLAUDE.md) for technical details
- Review closed issues for solutions
