# 🚀 Auto-Sync GitHub - Configuração

## Como funciona

Este projeto está configurado para **sincronizar automaticamente com o GitHub** a cada 30 segundos!

## Como iniciar o Auto-Sync

### Opção 1: Atalho no Desktop (MAIS FÁCIL) ⭐
1. Procure por **"Auto-Sync CRM"** no seu Desktop
2. Clique duas vezes para iniciar
3. Pronto! Suas mudanças serão enviadas automaticamente para o GitHub

### Opção 2: Terminal PowerShell
```powershell
cd C:\Users\Felipe\Desktop\CRM-GitHub
.\auto-sync-watch.ps1
```

## O que acontece

1. O script monitora seu projeto a cada **30 segundos**
2. Se detectar mudanças:
   - ✅ Adiciona os arquivos (`git add .`)
   - ✅ Faz commit (`git commit -m "auto: update [data/hora]"`)
   - ✅ Envia para GitHub (`git push origin main`)

## Como parar

- Pressione **Ctrl+C** no terminal/janela PowerShell
- Ou feche a janela do Power Shell

## Fluxo de trabalho recomendado

1. Clique em "Auto-Sync CRM" no Desktop
2. Abra o site em `http://localhost:5001`
3. Faça suas edições
4. Pronto! Tudo é sincronizado automaticamente

## Personalizar intervalo de verificação

Para mudar de 30 segundos para outro valor:

```powershell
.\auto-sync-watch.ps1 -IntervalSeconds 60
```

(Mude `60` para o número de segundos que preferir)

---

**Dica:** Abra o atalho uma vez e deixe rodando enquanto trabalha! 🎯
