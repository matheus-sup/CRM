# Script para monitorar mudanças e fazer push/pull automático (bidirecional)
param(
    [int]$IntervalSeconds = 30  # Verifica a cada 30 segundos
)

$projectPath = Get-Location
Write-Host "👀 Monitorando alterações em: $projectPath" -ForegroundColor Cyan
Write-Host "⏱️  Intervalo de verificação: $IntervalSeconds segundos" -ForegroundColor Cyan
Write-Host "🔄 Modo bidirecional (PULL + PUSH)" -ForegroundColor Magenta
Write-Host "ℹ️  Pressione Ctrl+C para parar`n" -ForegroundColor Yellow

while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    
    try {
        # PULL - Receber mudanças do GitHub
        Write-Host "⬇️  Recebendo atualizações do GitHub..." -ForegroundColor Blue
        $pullOutput = git pull origin main 2>&1
        
        if ($pullOutput -like "*Already up to date*") {
            Write-Host "." -NoNewline -ForegroundColor Green
        } else {
            Write-Host "`n✅ Mudanças recebidas do seu amigo!" -ForegroundColor Green
            Write-Host $pullOutput
        }
        
        # Verificar se há mudanças locais
        $status = git status --porcelain 2>$null
        
        if ([string]::IsNullOrEmpty($status)) {
            # Sem mudanças locais
            continue
        }
        
        # PUSH - Enviar suas mudanças
        Write-Host "`n📝 Mudanças locais detectadas em: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
        Write-Host $status
        
        # Adicionar mudanças
        Write-Host "➕ Adicionando arquivos..." -ForegroundColor Cyan
        git add . 2>$null
        
        # Fazer commit
        $timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"
        Write-Host "💾 Fazendo commit..." -ForegroundColor Cyan
        git commit -m "auto: update $timestamp" 2>$null
        
        # Fazer push
        Write-Host "⬆️  Enviando para GitHub..." -ForegroundColor Cyan
        git push origin main 2>$null
        
        Write-Host "✅ Suas mudanças foram sincronizadas!`n" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Erro durante sincronização: $_" -ForegroundColor Red
    }
}
