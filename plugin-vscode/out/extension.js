"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log('Congratulations, your extension "flutter-local-storage-inspector" is now active!');
    const provider = new FlutterLocalStorageInspector(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(FlutterLocalStorageInspector.viewType, provider));
    let disposable = vscode.commands.registerCommand('flutter-local-storage-inspector.inspect-storage', () => {
        vscode.window.showInformationMessage('Starting flutter_local_storage_inspector...');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
class FlutterLocalStorageInspector {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.tab = 'none';
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.command) {
                case 'alert':
                    console.log(data.text);
                    break;
                // case 'switch': {
                // 	this.tab = data.text;
                // 	console.log('switching to ' + this.tab);
                // 	this._view?.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                // 	break;
                // }
            }
        });
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Flutter local storage inspector</title>
			</head>
			<body>
			<div class="tab">
			<button class="tablinks" onclick="switchTab('x')">x</button>
			<button class="tablinks" onclick="switchTab('y')">y</button>
			<button class="tablinks" onclick="switchTab('z')">z</button>
			</div>
			
			<h1>tab: ${this.tab}</h1>

			<h1 id="lines-of-code-counter">0</h1>

			<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
FlutterLocalStorageInspector.viewType = 'flutter-local-storage-inspector-view';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map