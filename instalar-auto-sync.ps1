# Script automático de instalação para o amigo
# Execute como Administrador!

Write-Host "🚀 INSTALADOR AUTO-SYNC CRM" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Verificar se está rodando como admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "❌ Este script precisa rodar como Administrador!" -ForegroundColor Red
    Write-Host "Clique com botão direito no PowerShell e escolha 'Executar como administrador'" -ForegroundColor Yellow
    exit 1
}

# 1. Pedir informações
Write-Host "📝 Informações necessárias:`n" -ForegroundColor Yellow
$userName = Read-Host "Seu nome completo (ex: João Silva)"
$userEmail = Read-Host "Seu email (ex: joao@gmail.com)"

Write-Host "`n⏳ Processando...$n" -ForegroundColor Cyan

# 2. Clonar o repositório
Write-Host "`n📥 Clonando repositório..." -ForegroundColor Blue
cd Desktop
git clone https://github.com/matheus-sup/CRM.git CRM-GitHub 2>$null
if ($?) {
    Write-Host "✅ Repositório clonado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pasta CRM-GitHub já existe" -ForegroundColor Yellow
}

# 3. Entrar na pasta
cd CRM-GitHub

# 4. Configurar Git
Write-Host "`n⚙️  Configurando Git..." -ForegroundColor Blue
git config user.name $userName 2>$null
git config user.email $userEmail 2>$null
Write-Host "✅ Git configurado ($userName / $userEmail)" -ForegroundColor Green

# 5. Instalar dependências
Write-Host "`n📦 Instalando dependências do projeto..." -ForegroundColor Blue
Write-Host "⏳ Isso pode levar alguns minutos..." -ForegroundColor Yellow
npm install 2>$null
if ($?) {
    Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Erro ao instalar dependências (tente depois)" -ForegroundColor Yellow
}

# 6. Copiar scripts (se vierem pelo GitHub)
# Você pode comentar isso ou deixar

# 7. Criar o atalho
Write-Host "`n🔗 Criando atalho no Desktop..." -ForegroundColor Blue
$desktopPath = [System.Environment]::GetFolderPath("Desktop")
$projectPath = Get-Location
$scriptPath = "$projectPath\iniciar-auto-sync.vbs"
$atalhoPath = "$desktopPath\Auto-Sync CRM.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut($atalhoPath)
$shortcut.TargetPath = $scriptPath
$shortcut.WorkingDirectory = $projectPath
$shortcut.Description = "Auto-Sync GitHub - Sincroniza mudanças automaticamente"
$shortcut.Save()

Write-Host "✅ Atalho criado!" -ForegroundColor Green

# 8. Mensagem final
Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✅ INSTALAÇÃO COMPLETA!            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`nPróximos passos:" -ForegroundColor Cyan
Write-Host "1. Procure 'Auto-Sync CRM' no seu Desktop" -ForegroundColor White
Write-Host "2. Clique para iniciar o auto-sync" -ForegroundColor White
Write-Host "3. Edite o site normalmente" -ForegroundColor White
Write-Host "4. Tudo sincroniza automaticamente! 🚀" -ForegroundColor White

Write-Host "`nAbrir a pasta do projeto agora? (S/N)" -ForegroundColor Yellow
$openFolder = Read-Host
if ($openFolder -eq "S" -or $openFolder -eq "s") {
    explorer $projectPath
}

Write-Host "`n✨ Boa sorte!" -ForegroundColor Cyan
