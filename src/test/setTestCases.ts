import * as path from 'path';
import * as fs from 'fs';

const directoryPath = path.join(__dirname, 'cases');
const files = fs.readdirSync(directoryPath);
const mdFiles = files.filter(file => path.extname(file) === '.md').sort();

const testList = mdFiles.map((file, index) => {
    const content = fs.readFileSync(
        path.join(__dirname, 'cases', file), 'utf8'
    );
    let [input, output] = content.trim().split('// sort to');
    input = input.replace('```typescript', '').trim();
    output = output.replace('```', '').trim();
    return {
        input,
        output
    };
});

// 写入文件
fs.writeFileSync(
    path.join(__dirname, 'testCases.ts'),
    `export const testCases: {
        input: string;
        output: string;
    }[] = ${JSON.stringify(testList, null, 4)};`
);
