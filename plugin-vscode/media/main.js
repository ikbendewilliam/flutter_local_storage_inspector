// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const oldState = (vscode.getState());

    const counter = (document.getElementById('lines-of-code-counter'));
    console.log('Initial state', oldState);

    let currentCount = (oldState && oldState.count) || 0;
    counter.textContent = `${currentCount}`;

    setInterval(() => {
        counter.textContent = `${currentCount++} `;
        vscode.setState({ count: currentCount });
    }, 100);

    document.querySelectorAll('.tablinks').forEach((element) => {
        vscode.postMessage({
            command: 'alert',
            text: 'adding event for ' + element.id,
        });
        element.addEventListener('click', (event) => {
            vscode.postMessage({
                command: 'alert',
                text: 'sending event for ' + element.id,
            });
            vscode.postMessage({
                command: 'switch',
                text: element.id,
            });
        });
    });

    // window.addEventListener('message', event => {
    //     const message = event.data; // The json data that the extension sent
    //     switch (message.command) {
    //         case 'refactor':
    //             currentCount = Math.ceil(currentCount * 0.5);
    //             counter.textContent = `${currentCount}`;
    //             break;
    //     }
    // });
}());
