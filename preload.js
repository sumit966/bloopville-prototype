const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('bloopville', {
    version: '1.0.0',
    isDesktop: true,
    platform: process.platform
});
