param(
    [int]$IntervalSeconds = 3
)

$projectPath = Get-Location
Write-Host "Monitorando alteracoes em: $projectPath" -ForegroundColor Cyan
Write-Host "Intervalo: $IntervalSeconds segundos" -ForegroundColor Cyan
Write-Host "Modo: PULL + PUSH automatico" -ForegroundColor Magenta
Write-Host "Pressione Ctrl+C para parar`n" -ForegroundColor Yellow

while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    
    try {
        Write-Host "Recebendo atualizacoes do GitHub..." -ForegroundColor Blue
        $pullOutput = git pull origin main 2>&1
        
        if ($pullOutput -like "*Already up to date*" -or $pullOutput -like "*up-to-date*") {
            Write-Host "." -NoNewline -ForegroundColor Green
        } else {
            Write-Host "`nMudancas recebidas!" -ForegroundColor Green
        }
        
        $status = git status --porcelain 2>$null
        
        if ([string]::IsNullOrEmpty($status)) {
            continue
        }
        
        $timestamp = Get-Date -Format "dd/MM/yyyy HH:mm:ss"
        Write-Host "`nMudancas detectadas em: $timestamp" -ForegroundColor Yellow
        
        git add . 2>$null
        git commit -m "auto: update $timestamp" 2>$null
        
        Write-Host "Enviando para GitHub..." -ForegroundColor Cyan
        git push origin main 2>$null
        
        Write-Host "Sincronizado!" -ForegroundColor Green
        
    } catch {
        Write-Host "Erro: $_" -ForegroundColor Red
    }
}
