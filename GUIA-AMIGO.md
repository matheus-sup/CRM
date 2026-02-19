# 📋 GUIA PARA SEU AMIGO INSTALAR AUTO-SYNC

## Pre-requisitos

Seu amigo precisa ter no PC:
- ✅ **Git** instalado (https://git-scm.com/download/win)
- ✅ **Node.js** instalado (https://nodejs.org)
- ✅ **PowerShell** (já vem no Windows)

---

## Passo 1: Clonar o repositório

Seu amigo deve abrir o PowerShell e fazer:

```powershell
cd Desktop
git clone https://github.com/matheus-sup/CRM.git CRM-GitHub
cd CRM-GitHub
```

---

## Passo 2: Copiar os scripts de auto-sync

**Opção A (Mais fácil):** Você compartilha com ele a pasta `CRM-GitHub/auto-sync-watch.ps1` E `CRM-GitHub/iniciar-auto-sync.vbs`

**Opção B:** Ele cria os arquivos manualmente

### Se for criar manualmente:

1. Abra Bloco de Notas
2. Cole o conteúdo do arquivo `auto-sync-watch.ps1` (você envia para ele)
3. Salve como `auto-sync-watch.ps1` na pasta `C:\Users\[seunome]\Desktop\CRM-GitHub`
4. Repita para `iniciar-auto-sync.vbs`

---

## Passo 3: Configurar o Git (primeira vez apenas)

```powershell
cd C:\Users\[seunome]\Desktop\CRM-GitHub
git config user.email "seuemail@example.com"
git config user.name "Seu Nome"
```

---

## Passo 4: Criar o atalho de auto-sync

Execute no PowerShell:

```powershell
$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut("C:\Users\[seunome]\Desktop\Auto-Sync CRM.lnk")
$shortcut.TargetPath = "C:\Users\[seunome]\Desktop\CRM-GitHub\iniciar-auto-sync.vbs"
$shortcut.WorkingDirectory = "C:\Users\[seunome]\Desktop\CRM-GitHub"
$shortcut.Save()
Write-Host "✅ Atalho criado no Desktop!"
```

**⚠️ Importante:** Mude `[seunome]` para o nome real dele no Windows

**Dica:** Para saber o nome, execute:
```powershell
$env:USERNAME
```

---

## Passo 5: Instalar dependências do projeto

```powershell
cd C:\Users\[seunome]\Desktop\CRM-GitHub
npm install
```

---

## PRONTO! 🎉

Agora seu amigo tem tudo configurado:

1. Clique em **"Auto-Sync CRM"** no Desktop dele
2. Edita o site
3. **Tudo sincroniza automaticamente** com o GitHub
4. **Você recebe as mudanças dele em tempo real** ✅

---

## Fluxo de trabalho em equipe

```
SEU PC                          GITHUB                    PC DO SEU AMIGO
┌──────────────┐               ┌────────┐               ┌──────────────────┐
│              │               │        │               │                  │
│ Auto-sync    │────PUSH───→   │        │   ←───PULL──  │ Auto-sync        │
│ rodando      │               │ GitHub │               │ rodando          │
│              │   ←───PULL──   │        │   ───PUSH──→ │                  │
│              │               │        │               │                  │
└──────────────┘               └────────┘               └──────────────────┘

Você edita → Envia (30s)         Seu amigo edita → Envia (30s)
            ↓                                   ↓
        Ambos recebem as mudanças um do outro automaticamente!
```

---

## Comandos úteis para seu amigo

**Ver histórico de sincronizações:**
```powershell
git log --oneline -10
```

**Ver status atual:**
```powershell
git status
```

**Parar o auto-sync:**
- Feche a janela do PowerShell
- Ou pressione `Ctrl+C`

---

## Dúvidas comuns

**P: E se ambos editarmos o mesmo arquivo ao mesmo tempo?**
R: Git tentará mesclar automaticamente. Se houver conflito, um aviso aparecerá e precisará ser resolvido manualmente.

**P: Posso desativar o auto-sync temporariamente?**
R: Sim! Só não clicar no atalho ou fechar a janela.

**P: As mudanças aparecem em tempo real?**
R: Aparecem a cada **30 segundos** (intervalo do script).

---

## Contato de suporte 📞

Se seu amigo tiver dúvidas, pode:
1. Verificar o arquivo `AUTO-SYNC-README.md` na pasta
2. Conferir os logs do PowerShell enquanto roda
3. Avisar você para ajudar 😊

---

**BOA SORTE E BOM TRABALHO EM EQUIPE! 🚀**
