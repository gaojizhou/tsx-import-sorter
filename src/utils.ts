export function caseInsensitiveSort(a: string, b: string): number {
    const length = Math.min(a.length, b.length);

    const lowerA = a.substring(0, length).toLowerCase();
    const lowerB = b.substring(0, length).toLowerCase();

    if (lowerA < lowerB) {
        return -1;
    }
    if (lowerA > lowerB) {
        return 1;
    }

    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }

    // If the strings are equal up to the length of the shorter string,
    // the longer string is considered greater.
    if (a.length !== b.length) {
        return a.length < b.length ? -1 : 1;
    }

    return 0;
}

export function extractBetweenImportAndFrom(inputString: string): string | undefined {
    const matches: RegExpMatchArray | null = inputString.match(/import\s+(.*?)\s+from/);

    if (matches) {
        const values = matches[1]
            .trim()
            .split(",")
            .filter((item) => item.length > 0)
            .map((item) => item.trim());
        return values.join(", ");
    } else {
        return undefined;
    }
}

const preprocess = (str: string) => str.replace(/import|{|}|,|\s/g, "");

const sortWithMainStringFn = (a:string, b:string) => {
    const preprocessedA = preprocess(a);
    const preprocessedB = preprocess(b);

    const aList = preprocessedA.split("from")
    const bList = preprocessedB.split("from")
    if (aList.length === 2 && bList.length === 2) {
        const sort = caseInsensitiveSort(aList[0], bList[0]);
        if (sort === 0) {
            return caseInsensitiveSort(aList[1], bList[1]);
        }
        else {
            return sort;
        }
    } else {
        console.log('error', aList, bList)
        return 0
    }

};
export function pushToListIfNotEmpty(list: string[], str: string[]): void {
    const sortedStr = str.sort(sortWithMainStringFn).join("\n");
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
