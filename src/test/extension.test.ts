import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { testCases } from './testCases'


suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    testCases.forEach((testCase, index) => {
        let [input, output] = testCase.trim().split('// sort to');
        input = input.trim();
        output = output.trim();

        test(`Test case ${index + 1}`, async () => {
            // 创建一个新的文本文件
            const filePath = path.join(__dirname, '..', '..', `test${index + 1}.ts`);
            fs.writeFileSync(filePath, input);

            // 打开文件并调用插件命令
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            await vscode.commands.executeCommand('tsx-import-sorter.sorterImports');

            // 等待插件命令完成
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 验证结果
            const finalContent = document.getText();
            assert.strictEqual(finalContent.trim(), output);

            // 删除测试文件
            fs.unlinkSync(filePath);
        });
    });
});