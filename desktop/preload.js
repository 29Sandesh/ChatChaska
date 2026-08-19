const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  playOrderAlert: (soundName) => ipcRenderer.send('play-order-alert', soundName),
  printThermalKOT: (kotData) => ipcRenderer.invoke('print-thermal-kot', kotData),
  printThermalBill: (billData) => ipcRenderer.invoke('print-thermal-bill', billData),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  toggleAutoStart: (enable) => ipcRenderer.invoke('toggle-auto-start', enable),
  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  getNetworkStatus: () => ipcRenderer.invoke('get-network-status'),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  sendWhatsAppNative: (phone, text) => ipcRenderer.invoke('send-whatsapp-native', { phone, text })
});
