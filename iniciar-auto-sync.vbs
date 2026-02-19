Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Mostrar notificação ANTES
objShell.Popup "🚀 Iniciando Auto-Sync..." & vbCrLf & "Uma janela do PowerShell vai aparecer em segundos.", 3, "CRM - GitHub Auto-Sync"

' Abrir PowerShell com a janela visível e maximizada
' 3 = maximizada, False = aguarda
objShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ""cd """ & strPath & """; .\auto-sync-watch.ps1; pause""", 3, False
