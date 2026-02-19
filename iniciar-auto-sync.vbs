Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Abrir PowerShell em background rodando o script de auto-sync
objShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & strPath & "\auto-sync-watch.ps1""", 0, False

' Mostrar notificação
objShell.Popup "✅ Auto-sync iniciado!" & vbCrLf & "Suas mudanças serão sincronizadas a cada 30 segundos.", 3, "CRM - GitHub Auto-Sync"
