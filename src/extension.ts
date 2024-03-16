import * as vscode from 'vscode';

function sortImports() {
    // 获取活动编辑器
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor!');
        return;
    }
console.log()
    // 获取当前文件的内容
    const document = editor.document;
    const text = document.getText();

    // 正则表达式匹配 import 语句
    const importRegex = /^import .+?['";]\s*$/gm;
    const importMatches = text.match(importRegex);

    if (!importMatches) {
        vscode.window.showInformationMessage('No import statements found!');
        return;
    }

    // 对 import 语句进行排序
    const sortedImports = importMatches.sort((a, b) => a.localeCompare(b));

    // 生成替换后的文本
    const newText = text.replace(importRegex, () => sortedImports.shift() || '');

    // 应用替换并保存
    editor.edit(editBuilder => {
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        editBuilder.replace(fullRange, newText);
    }).then(success => {
        if (success) {
            vscode.window.showInformationMessage('Imports sorted successfully!');
        } else {
            vscode.window.showErrorMessage('Failed to sort imports!');
        }
    });
}



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tsx-import-sorter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('tsx-import-sorter.sorterImports', () => {
        sortImports();

		vscode.window.showInformationMessage('排序成功!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
