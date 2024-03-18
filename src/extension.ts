import * as vscode from 'vscode';

function caseInsensitiveSort(a: string, b: string): number {
    const charCodeA = a.charCodeAt(0);
    const charCodeB = b.charCodeAt(0);

    if (a === a.toUpperCase()) {
        a = a.toLowerCase();
    }
    if (b === b.toUpperCase()) {
        b = b.toLowerCase();
    }

    if (a < b) { return -1; };
    if (a > b) { return 1; };


    if (charCodeA < charCodeB) { return -1; };
    if (charCodeA > charCodeB) { return 1; };
    return 0;
}

function extractBetweenImportAndFrom(inputString: string): string | undefined {
    const matches: RegExpMatchArray | null = inputString.match(/import\s+(.*?)\s+from/);

    if (matches) {
        const values = matches[1].trim().split(',').filter(item => item.length > 0).map(item => item.trim());
        return values.join(', ');
    } else {
        return undefined;
    }
}


async function sortImports() {


    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor!');
        return;
    }
    const document = editor.document;
    const text = document.getText();

    const importRegex = /^import .+?['";]\s*$/gm;
    const importMatches = text.match(importRegex);

    if (!importMatches) {
        vscode.window.showInformationMessage('No import statements found!');
        return;
    }

    const starList: string[] = [];
    const singleList: string[] = [];
    const oneBracketList: string[] = [];
    const bracketsList: string[] = [];
    const singleAndBracketsList: string[] = [];

    const importLineNumbers: number[] = [];

    let fromIndex = 0;
    importMatches.forEach((match: string) => {
        if (match.includes('/*') || match.includes('//')) {
            return;
        }
        let index;
        while ((index = text.indexOf(match, fromIndex)) !== -1) {
            const beforeText = text.substring(0, index);
            const lineNumber = beforeText.split('\n').length;
            importLineNumbers.push(lineNumber);
            fromIndex = index + match.length;
        }

        const trimmedStatement = match.trim();
        if (trimmedStatement.startsWith('import *')) {
            starList.push(trimmedStatement);
        } else if (trimmedStatement.includes('{') && trimmedStatement.includes('}')) {
            const startIndex = trimmedStatement.indexOf('{');
            const endIndex = trimmedStatement.indexOf('}');

            const removeImports = trimmedStatement.substring(0, startIndex) + trimmedStatement.substring(endIndex + 1);
            const mainImport: string | undefined = extractBetweenImportAndFrom(removeImports);

            const importItems = trimmedStatement.substring(startIndex + 1, endIndex).trim();
            const imports = importItems.split(',').map(item => item.trim());

            const fromIndex = trimmedStatement.indexOf('from') + 'from'.length;
            const moduleName = trimmedStatement.substring(fromIndex).trim().replace(/['";]/g, '');

            if (mainImport) {

                singleAndBracketsList.push(
                    `import ${mainImport}, { ${imports.sort(caseInsensitiveSort).join(', ')} } from "${moduleName}";`
                );


            } else if (imports.length === 1) {
                oneBracketList.push(trimmedStatement);
            } else {
                bracketsList.push(
                    `import { ${imports.sort(caseInsensitiveSort).join(', ')} } from "${moduleName}";`
                );
            }
        } else {
            singleList.push(trimmedStatement);
        }

    });

    function pushToListIfNotEmpty(list: string[], str: string[]): void {
        const sortedStr = str.sort(caseInsensitiveSort).join('\n');
        if (sortedStr.length > 1) {
            list.push(sortedStr);
        }
    }

    const importList: string[] = [];

    pushToListIfNotEmpty(importList, [...new Set(starList)]);
    pushToListIfNotEmpty(importList, [...new Set(singleList.concat(singleAndBracketsList))]);
    pushToListIfNotEmpty(importList, [...new Set(bracketsList)]);
    pushToListIfNotEmpty(importList, [...new Set(oneBracketList)]);

    const importStr = importList.join('\n\n');

    await editor.edit(editBuilder => {
        const uniqueImportLineNumbers = [...new Set(importLineNumbers)];
        for (let lineNumber of uniqueImportLineNumbers) {
            editBuilder.delete(new vscode.Range(lineNumber - 1, 0, lineNumber, 0));
        }
    });

    // clear empty line
    await editor.edit(editBuilder => {

        const document = vscode.window.activeTextEditor?.document;
        if (document) {
            const text = document.getText();
            const lines = text.split('\n');
            let startIndex = 0;
            while (startIndex < lines.length && lines[startIndex].trim() === '') {
                startIndex++;
            }
            if (startIndex > 0) {
                editBuilder.delete(new vscode.Range(0, 0, startIndex, 0));
            }
        }
    });

    editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(0, 0), importStr + '\n\n');
    });
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('tsx-import-sorter.sorterImports', () => {
        try {
            sortImports();    
        } catch (error) {
            console.error(error);
            vscode.window.showInformationMessage(`tsx-import-sorter error`);
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
