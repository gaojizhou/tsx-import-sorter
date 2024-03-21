import * as vscode from "vscode";
import { getLineNumbers, pushToListIfNotEmpty, extractBetweenImportAndFrom, caseInsensitiveSort } from "./utils";

async function sortImports() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor!");
        return;
    }
    const document = editor.document;
    const text = document.getText();

    const importRegex = /^import .+?['";]\s*$/gm;
    let importMatches = text.match(importRegex);

    const importRegexMultiple = /^import\s+{[\s\S]*?}\s+from\s+['"][\s\S]*?['"];\s*$/gm;
    const importMultipleMatches = text.match(importRegexMultiple);

    if (!importMatches && !importMultipleMatches) {
        vscode.window.showInformationMessage("No import statements found!");
        return;
    }

    const starList: string[] = [];
    const singleList: string[] = [];
    const oneBracketList: string[] = [];
    const bracketsList: string[] = [];
    const singleAndBracketsList: string[] = [];
    let importLineNumbers: number[] = [];

    const matchList: string[] = [];
    (importMultipleMatches || []).forEach((item) => {
        matchList.push(item);
    });
    (importMatches || []).forEach((item) => {
        matchList.push(item);
    });

    matchList.forEach((match: string) => {
        if (match.includes("/*") || match.includes("//")) {
            return;
        }
        const lines = getLineNumbers(text, match);
        importLineNumbers = importLineNumbers.concat(lines);
    });

    matchList.forEach((match: string) => {
        if (match.includes("/*") || match.includes("//")) {
            return;
        }
        const trimmedStatement = match
            .split("\n")
            .map((part) => part.trim())
            .join(" ")
            .trim();
        if (trimmedStatement.startsWith("import *")) {
            starList.push(trimmedStatement);
        } else if (trimmedStatement.includes("{") && trimmedStatement.includes("}")) {
            const startIndex = trimmedStatement.indexOf("{");
            const endIndex = trimmedStatement.indexOf("}");

            const removeImports = trimmedStatement.substring(0, startIndex) + trimmedStatement.substring(endIndex + 1);
            const mainImport: string | undefined = extractBetweenImportAndFrom(removeImports);

            const importItems = trimmedStatement.substring(startIndex + 1, endIndex).trim();
            const imports = importItems.split(",").map((item) => item.trim()).filter((item) => item.length > 0);

            const fromIndex = trimmedStatement.indexOf("from") + "from".length;
            const moduleName = trimmedStatement.substring(fromIndex).trim().replace(/['";]/g, "");

            if (mainImport) {
                singleAndBracketsList.push(`import ${mainImport}, { ${imports.sort(caseInsensitiveSort).join(", ")} } from "${moduleName}";`);
            } else if (imports.length === 1) {
                oneBracketList.push(trimmedStatement);
            } else {
                bracketsList.push(`import { ${imports.sort(caseInsensitiveSort).join(", ")} } from "${moduleName}";`);
            }
        } else {
            singleList.push(trimmedStatement);
        }
    });

    const importList: string[] = [];

    pushToListIfNotEmpty(importList, [...new Set(starList)]);
    pushToListIfNotEmpty(importList, [...new Set(singleAndBracketsList.concat(bracketsList))]);
    pushToListIfNotEmpty(importList, [...new Set(singleList.concat(oneBracketList))]);

    const importStr = importList.join("\n\n");

    await editor.edit((editBuilder) => {
        const uniqueImportLineNumbers = [...new Set(importLineNumbers)];
        for (let lineNumber of uniqueImportLineNumbers) {
            editBuilder.delete(new vscode.Range(lineNumber - 1, 0, lineNumber, 0));
        }
    });

    // clear empty line
    await editor.edit((editBuilder) => {
        const document = vscode.window.activeTextEditor?.document;
        if (document) {
            const text = document.getText();
            const lines = text.split("\n");
            let startIndex = 0;
            while (startIndex < lines.length && lines[startIndex].trim() === "") {
                startIndex++;
            }
            if (startIndex > 0) {
                editBuilder.delete(new vscode.Range(0, 0, startIndex, 0));
            }
        }
    });

    await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), importStr + "\n\n");
    });
    await editor.document.save();
}

let isSortingImports = false;

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("tsx-import-sorter.sorterImports", () => {
        try {
            sortImports();
        } catch (error) {
            console.error(error);
            vscode.window.showInformationMessage(`tsx-import-sorter error`);
        }
    });

    context.subscriptions.push(disposable);

    const saveDisposable = vscode.workspace.onWillSaveTextDocument(async e => {
        const config = vscode.workspace.getConfiguration("tsx-import-sorter");
        const autoSortOnSave = config.get("autoSortOnSave", false);
        if (!autoSortOnSave) {
            return;
        }
        try {
            if (isSortingImports) {
                return;
            }
            isSortingImports = true;
            await sortImports();
            isSortingImports = false;
        } catch (error) {
            isSortingImports = false;
            console.error(error);
            vscode.window.showInformationMessage(`tsx-import-sorter error`);
        }
    });

    context.subscriptions.push(saveDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
