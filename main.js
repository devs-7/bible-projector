const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

function createWindow() {
    let win = new BrowserWindow({
        title: 'Bíblia projector',
        width: 800, height: 600,
        autoHideMenuBar: true,
        icon: './img/icon.png',
        minWidth: 600, minHeight: 500,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.maximize();

    win.loadFile('windows/index.html');

    win.once('ready-to-show', () => {
        win.show();
    });

    win.once('close', () => {
        app.quit();
    });
}

app.once('ready', () => {
    createWindow();

    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { id: 'novo', label: 'Novo', click: () => { } },
                { id: 'abrir', label: 'Abrir' },
                { type: 'separator' },
                { id: 'salvar', label: 'Salvar' },
                { type: 'separator' },
                {
                    label: 'Sair',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Desenvolvedor',
            submenu: [
                {
                    role: 'toggledevtools'
                },
                {
                    role: 'reload'
                }
            ]
        }
    ]));
});