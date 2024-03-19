
export function caseInsensitiveSort(a: string, b: string): number {
    const lowerA = a.toLowerCase();
    const lowerB = b.toLowerCase();

    if (lowerA < lowerB) { return -1; }
    if (lowerA > lowerB) { return 1; }

    if (a < b) { return -1; }
    if (a > b) { return 1; }

    return 0;
}

export function extractBetweenImportAndFrom(inputString: string): string | undefined {
    const matches: RegExpMatchArray | null = inputString.match(/import\s+(.*?)\s+from/);

    if (matches) {
        const values = matches[1].trim().split(',').filter(item => item.length > 0).map(item => item.trim());
        return values.join(', ');
    } else {
        return undefined;
    }
}


export function pushToListIfNotEmpty(list: string[], str: string[]): void {
    const sortedStr = str.sort(caseInsensitiveSort).join('\n');
    if (sortedStr.length > 1) {
        list.push(sortedStr);
    }
}

export function getLineNumbers(text: string, match: string): number[] {
    let start = 0;
    let lineNumbers: number[] = [];

    while ((start = text.indexOf(match, start)) !== -1) {
        const end = start + match.length;
        const startLine = (text.substring(0, start).match(/\n/g) || []).length + 1;
        const endLine = startLine + (match.match(/\n/g) || []).length;
        const lines = Array.from({ length: endLine - startLine + 1 }, (_, i) => startLine + i);
        lineNumbers = lineNumbers.concat(lines);
        start = end;
    }

    return lineNumbers;
}