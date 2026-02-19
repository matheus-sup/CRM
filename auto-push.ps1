# Script para fazer commit e push automaticamente
param(
    [string]$message = "chore: auto-update from local changes"
)

Write-Host "🔄 Iniciando sincronização automática..." -ForegroundColor Cyan

# Verificar se há mudanças
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "✅ Nenhuma alteração para enviar" -ForegroundColor Green
    exit 0
}

Write-Host "📝 Mudanças detectadas:" -ForegroundColor Yellow
Write-Host $status

# Adicionar todas as mudanças
Write-Host "`n➕ Adicionando arquivos..." -ForegroundColor Cyan
git add .

# Fazer commit
Write-Host "💾 Fazendo commit..." -ForegroundColor Cyan
git commit -m $message

# Fazer push
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Sucesso! Alterações enviadas para o GitHub!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Erro ao enviar para o GitHub" -ForegroundColor Red
}
