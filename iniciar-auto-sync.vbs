Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Abrir PowerShell de forma visível para acompanhar o progresso
' 1 = modo visível e normal
objShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & strPath & "\auto-sync-watch.ps1""", 1, False

' Mostrar notificação
objShell.Popup "✅ Auto-sync iniciado!" & vbCrLf & "Acompanhe o progresso na janela do PowerShell que abriu." & vbCrLf & vbCrLf & "Suas mudanças serão sincronizadas a cada 30 segundos.", 5, "CRM - GitHub Auto-Sync - Modo Visível"
