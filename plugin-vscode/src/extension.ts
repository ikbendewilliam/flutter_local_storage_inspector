import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "flutter-local-storage-inspector" is now active!');

	const provider = new FlutterLocalStorageInspector(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(FlutterLocalStorageInspector.viewType, provider));

	let disposable = vscode.commands.registerCommand('flutter-local-storage-inspector.inspect-storage', () => {
		vscode.window.showInformationMessage('Starting flutter_local_storage_inspector...');
	});

	context.subscriptions.push(disposable);
}

class FlutterLocalStorageInspector implements vscode.WebviewViewProvider {

	public static readonly viewType = 'flutter-local-storage-inspector-view';

	private _view?: vscode.WebviewView;

	private tab: string = 'none';

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
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
				case 'switch': {
					this.tab = data.text;
					console.log('switching to ' + this.tab);
					webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
					this._view?.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
					break;
				}
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
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

			<label>Device ip:<input id="ip"></label>
			<label>Port:<input id="port"></label>

			<div class="play" id="play"></div>
			
			<h1 id="lines-of-code-counter">0</h1>

			<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// this method is called when your extension is deactivated
export function deactivate() { }
