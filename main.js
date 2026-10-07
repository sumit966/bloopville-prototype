// ============================================
// BLOOPVILLE - Electron Main Process
// ============================================

const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        title: 'Bloopville',
        backgroundColor: '#FFF8F0',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createMenu() {
    const template = [
        {
            label: 'Bloopville',
            submenu: [
                { label: 'Home', accelerator: 'CmdOrCtrl+H', click: () => mainWindow.loadFile('index.html') },
                { label: 'Shop', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.loadFile('pages/products.html') },
                { type: 'separator' },
                { label: 'Admin Dashboard', click: () => mainWindow.loadFile('pages/admin-login.html') },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Navigate',
            submenu: [
                { label: 'Home', click: () => mainWindow.loadFile('index.html') },
                { label: 'Characters', click: () => mainWindow.loadFile('pages/characters.html') },
                { label: 'Shop', click: () => mainWindow.loadFile('pages/products.html') },
                { label: 'Our Story', click: () => mainWindow.loadFile('pages/about.html') },
                { label: 'Contact', click: () => mainWindow.loadFile('pages/contact.html') },
                { type: 'separator' },
                { label: 'Track Order', click: () => mainWindow.loadFile('pages/track.html') },
                { label: 'AI Studio', click: () => mainWindow.loadFile('pages/ai-generator.html') }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Bloopville',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Bloopville',
                            message: 'Bloopville Desktop',
                            detail: 'A character brand e-commerce prototype built with Electron.\n\nVersion 1.0.0\n© 2026'
                        });
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
    createWindow();
    createMenu();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
