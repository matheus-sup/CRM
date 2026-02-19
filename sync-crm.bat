@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

cd /d "%~dp0"

set "LOGDIR=%~dp0logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

set "LOGFILE=%LOGDIR%\sync_%date:~6,4%-%date:~3,2%-%date:~0,2%.log"
set "INTERVALO=30"
set "BRANCH=main"

echo ============================================================
echo           CRM - Sincronizacao Automatica com GitHub
echo ============================================================
echo  Repositorio : %cd%
echo  Branch      : %BRANCH%
echo  Intervalo   : %INTERVALO% segundos
echo  Log         : %LOGFILE%
echo  Modo        : PULL (receber) + PUSH (enviar)
echo ============================================================
echo  Pressione Ctrl+C para parar
echo ============================================================
echo.

call :log "========== SYNC INICIADO =========="
call :log "Diretorio: %cd%"
call :log "Branch: %BRANCH%"
call :log "Intervalo: %INTERVALO%s"

:loop

    call :log "--- Ciclo de sincronizacao iniciado ---"

    REM === PULL: receber atualizacoes ===
    call :log "[PULL] Buscando atualizacoes remotas..."
    for /f "delims=" %%i in ('git pull origin %BRANCH% 2^>^&1') do (
        set "PULL_RESULT=%%i"
        call :log "[PULL] %%i"
    )

    echo [%date% %time:~0,8%] PULL concluido
    if defined PULL_RESULT (
        echo !PULL_RESULT! | findstr /i "Already up to date" >nul 2>&1
        if !errorlevel! == 0 (
            echo   Nenhuma atualizacao remota.
        ) else (
            echo   Atualizacoes recebidas do GitHub!
        )
    )

    REM === Verificar mudancas locais ===
    set "HAS_CHANGES=0"
    for /f "delims=" %%i in ('git status --porcelain 2^>^&1') do (
        set "HAS_CHANGES=1"
    )

    if "!HAS_CHANGES!" == "0" (
        call :log "[STATUS] Nenhuma alteracao local detectada."
        echo [%date% %time:~0,8%] Nenhuma alteracao local. Aguardando %INTERVALO%s...
        echo.
        goto :wait
    )

    REM === Listar arquivos alterados no log ===
    call :log "[STATUS] Alteracoes locais detectadas:"
    for /f "delims=" %%i in ('git status --short 2^>^&1') do (
        call :log "   %%i"
    )

    REM === ADD: preparar arquivos ===
    call :log "[ADD] Adicionando todos os arquivos..."
    git add . >nul 2>&1
    call :log "[ADD] Concluido."

    REM === COMMIT ===
    set "TIMESTAMP=%date:~0,2%/%date:~3,2%/%date:~6,4% %time:~0,8%"
    set "MSG=auto-sync: %TIMESTAMP%"
    call :log "[COMMIT] Mensagem: %MSG%"

    for /f "delims=" %%i in ('git commit -m "%MSG%" 2^>^&1') do (
        call :log "[COMMIT] %%i"
    )

    REM === PUSH: enviar atualizacoes ===
    call :log "[PUSH] Enviando para GitHub..."
    set "PUSH_OK=1"
    for /f "delims=" %%i in ('git push origin %BRANCH% 2^>^&1') do (
        call :log "[PUSH] %%i"
        echo %%i | findstr /i "error fatal rejected" >nul 2>&1
        if !errorlevel! == 0 set "PUSH_OK=0"
    )

    if "!PUSH_OK!" == "1" (
        call :log "[PUSH] Enviado com sucesso!"
        echo [%date% %time:~0,8%] Sincronizado com sucesso!
    ) else (
        call :log "[PUSH] ERRO ao enviar. Verifique o log."
        echo [%date% %time:~0,8%] ERRO no push! Verifique: %LOGFILE%
    )
    echo.

:wait
    timeout /t %INTERVALO% /nobreak >nul
    goto :loop

REM === Funcao de log ===
:log
    set "LOGMSG=%~1"
    echo [%date% %time:~0,8%] %LOGMSG% >> "%LOGFILE%"
    goto :eof
