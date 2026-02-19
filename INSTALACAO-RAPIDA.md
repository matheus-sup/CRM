# ⚡ INSTALAÇÃO RÁPIDA PARA SEU AMIGO

## Opção 1: AUTOMÁTICO (MAIS FÁCIL) ⭐⭐⭐

1. **Abra PowerShell como Administrador**
   - Clique com botão direito no PowerShell
   - Escolha "Executar como administrador"

2. **Cole este comando:**
```powershell
cd Desktop; git clone https://github.com/matheus-sup/CRM.git CRM-GitHub; cd CRM-GitHub; powershell -ExecutionPolicy Bypass -File instalar-auto-sync.ps1
```

3. **Pronto!** O script faz tudo automaticamente

---

## Opção 2: MANUAL

### Passo 1: Clone o repositório
```powershell
cd Desktop
git clone https://github.com/matheus-sup/CRM.git CRM-GitHub
cd CRM-GitHub
```

### Passo 2: Configure o Git
```powershell
git config user.name "Seu Nome"
git config user.email "seu.email@gmail.com"
```

### Passo 3: Instale dependências
```powershell
npm install
```

### Passo 4: Crie o atalho
```powershell
$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut("$([System.Environment]::GetFolderPath('Desktop'))\Auto-Sync CRM.lnk")
$shortcut.TargetPath = "$(Get-Location)\iniciar-auto-sync.vbs"
$shortcut.WorkingDirectory = "$(Get-Location)"
$shortcut.Save()
Write-Host "✅ Pronto!"
```

---

## ✅ AGORA SEU AMIGO PODE:

1. Clicar em **"Auto-Sync CRM"** no Desktop
2. Editar o site
3. **Tudo sincroniza automaticamente** com GitHub
4. **Receber suas mudanças em tempo real** ✅

---

## 📞 Dúvidas?

Veja o arquivo: `GUIA-AMIGO.md`
