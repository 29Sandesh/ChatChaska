const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, net, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serverProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = process.env.PORT || 5678;
const SERVER_URL = `http://localhost:${PORT}/login`;

function getIconPath() {
  const candidates = [
    path.join(__dirname, '../public/app.ico'),
    path.join(__dirname, 'public/app.ico'),
    path.join(process.resourcesPath || '', 'public/app.ico'),
    path.join(__dirname, '../public/chaska-c-logo.png'),
    path.join(__dirname, 'public/chaska-c-logo.png'),
    path.join(process.resourcesPath || '', 'public/chaska-c-logo.png'),
    path.join(__dirname, '../public/favicon.png'),
    path.join(__dirname, 'public/favicon.png'),
    path.join(process.resourcesPath || '', 'public/favicon.png'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(__dirname, '../public/chaska-c-logo.png');
}

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function getProjectRoot() {
  const candidate1 = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(candidate1, 'package.json'))) return candidate1;
  const candidate2 = process.cwd();
  if (fs.existsSync(path.join(candidate2, 'package.json'))) return candidate2;
  return candidate1;
}

async function startLocalNextServer() {
  const projectRoot = getProjectRoot();
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  try {
    const cmdArgs = isDev ? ['next', 'dev', '-p', String(PORT)] : ['next', 'start', '-p', String(PORT)];
    serverProcess = spawn(npxCmd, cmdArgs, {
      cwd: projectRoot,
      shell: true,
      env: { ...process.env, PORT: String(PORT) }
    });

    serverProcess.stdout?.on('data', (data) => console.log(`[Server]: ${data}`));
    serverProcess.stderr?.on('data', (data) => console.error(`[Server Err]: ${data}`));
  } catch (err) {
    console.error('Failed to spawn Next server:', err);
  }
}

// Guarantee single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Force all external links/windows to open in system default browser (Chrome/Edge) or native WhatsApp app
    app.on('web-contents-created', (event, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://localhost') || url.startsWith('file://')) {
          return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
      });
      contents.on('will-navigate', (event, navigationUrl) => {
        if (!navigationUrl.startsWith('http://localhost') && !navigationUrl.startsWith('file://')) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
      });
    });

    await createMainWindow();
    createSystemTray();
  }).catch((err) => {
    console.error('App ready error:', err);
  });
}

async function createMainWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'ChatChaska POS & Billing Terminal',
    ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    autoHideMenuBar: true,
    show: false, // Don't show until ready or loading page ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Intercept window.open calls to launch in system browser/native app (e.g. WhatsApp)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Show window immediately
  mainWindow.show();
  mainWindow.focus();

  // Loading HTML view
  const loadingHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Loading ChatChaska POS...</title>
        <style>
          body {
            margin: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          h2 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; }
          p { margin: 0; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>Starting ChatChaska POS Engine...</h2>
        <p>Connecting local billing terminal & kitchen server</p>
      </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);

  // Check server status & start if needed
  let isUp = await checkServer(SERVER_URL);
  if (!isUp) {
    await startLocalNextServer();
    // Poll for up to 30 seconds
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 500));
      isUp = await checkServer(SERVER_URL);
      if (isUp) break;
    }
  }

  // Load actual dashboard once server is up
  mainWindow.loadURL(SERVER_URL).catch((err) => {
    console.error('Failed to load dashboard:', err);
  });

  // Start automated EOD daily backup timer (runs every 6 hours to archive bills locally & send owner report)
  setInterval(async () => {
    try {
      await checkServer(`http://localhost:${PORT}/api/reports/eod-email`);
      console.log('[EOD Backup]: Auto daily sales report saved locally to laptop.');
    } catch (e) {
      console.error('[EOD Backup Error]:', e);
    }
  }, 6 * 60 * 60 * 1000);

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      try {
        if (Notification.isSupported()) {
          new Notification({
            title: 'ChatChaska POS Running in System Tray',
            body: 'ChatChaska is actively receiving orders in the background.',
            ...(fs.existsSync(iconPath) ? { icon: iconPath } : {})
          }).show();
        }
      } catch (e) {
        console.error('Notification error:', e);
      }
    }
    return false;
  });
}

function createSystemTray() {
  const iconPath = getIconPath();
  if (!fs.existsSync(iconPath)) return;

  try {
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'ChatChaska POS Terminal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open POS Billing Terminal',
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`http://localhost:${PORT}/pos`);
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Quick Order Entry',
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`http://localhost:${PORT}/pos/quick-order`);
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Kitchen Display (KDS)',
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`http://localhost:${PORT}/kitchen`);
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Order History & Day Close',
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`http://localhost:${PORT}/pos/history`);
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Dashboard Overview',
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`http://localhost:${PORT}/dashboard`);
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Minimize to System Tray',
        click: () => {
          if (mainWindow) mainWindow.hide();
        }
      },
      {
        label: 'Exit ChatChaska POS',
        click: () => {
          app.isQuitting = true;
          if (serverProcess) {
            try { serverProcess.kill(); } catch (e) {}
          }
          app.quit();
        }
      }
    ]);

    tray.setToolTip('ChatChaska POS Terminal — Online');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.error('System tray error:', err);
  }
}

// IPC Handlers
ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('print-thermal-kot', async (event, kotData) => {
  if (!mainWindow) return { success: false, error: 'No window available' };

  try {
    mainWindow.webContents.print(
      {
        silent: true,
        printBackground: true,
        deviceName: kotData?.printerName || ''
      },
      (success, failureReason) => {
        console.log(`Thermal KOT print result: ${success}, reason: ${failureReason}`);
      }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('print-thermal-bill', async (event, billData) => {
  if (!mainWindow) return { success: false, error: 'No window available' };

  try {
    mainWindow.webContents.print(
      {
        silent: true,
        printBackground: true,
        deviceName: billData?.printerName || ''
      },
      (success, failureReason) => {
        console.log(`Thermal bill print result: ${success}, reason: ${failureReason}`);
      }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('toggle-auto-start', async (event, enable) => {
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: app.getPath('exe')
    });
  } else {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: app.getPath('exe'),
      args: [path.resolve(__dirname, '..')]
    });
  }
  return { autoStart: enable };
});

ipcMain.handle('get-system-status', async () => {
  return {
    online: net.isOnline(),
    isDesktop: true,
    version: '1.0.0',
    platform: process.platform,
    arch: process.arch
  };
});

ipcMain.handle('get-network-status', async () => {
  return { online: net.isOnline() };
});

ipcMain.handle('send-whatsapp-native', async (event, { phone, text }) => {
  try {
    let cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    const encodedText = encodeURIComponent(text || '');

    // Launch Windows WhatsApp Desktop App directly via native whatsapp:// URI protocol
    const nativeUri = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
    await shell.openExternal(nativeUri);

    // Auto-trigger Enter keypress on Windows after WhatsApp Desktop loads text
    if (process.platform === 'win32') {
      const vbsPath = path.join(app.getPath('temp'), 'chatchaska_wa_autosend.vbs');
      const vbsContent = `
        WScript.Sleep 900
        Set WshShell = WScript.CreateObject("WScript.Shell")
        WshShell.AppActivate "WhatsApp"
        WScript.Sleep 300
        WshShell.SendKeys "~"
      `;
      fs.writeFileSync(vbsPath, vbsContent);
      spawn('cscript', ['//Nologo', vbsPath], { shell: true, detached: true });
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to launch native WhatsApp:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('open-external-url', async (event, url) => {
  if (shell && url) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      try { serverProcess.kill(); } catch (e) {}
    }
    app.quit();
  }
});
