import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { testCases } from './testCases';


suite('Extension Test Suite', () => {

    testCases.forEach((testCase, index) => {
        const { input, output } = testCase;

        test(`Test case ${index + 1}`, async () => {
            const filePath = path.join(__dirname, '..', '..', `test${index + 1}.ts`);
            fs.writeFileSync(filePath, input);

            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            await vscode.commands.executeCommand('tsx-import-sorter.sorterImports');

            await new Promise(resolve => setTimeout(resolve, 1000));

            const finalContent = document.getText();
            fs.unlinkSync(filePath);
            assert.strictEqual(finalContent.trim(), output);
        });
    });
});