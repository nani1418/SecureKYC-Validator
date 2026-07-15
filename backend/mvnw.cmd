@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.\

if exist "%DIRNAME%\.maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=%DIRNAME%\.maven\apache-maven-3.9.6\bin\mvn.cmd"
    goto run
)

echo Downloading Apache Maven 3.9.6...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; New-Item -ItemType Directory -Force -Path '%DIRNAME%\.maven'; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip' -OutFile '%DIRNAME%\.maven\maven.zip'; Expand-Archive -Path '%DIRNAME%\.maven\maven.zip' -DestinationPath '%DIRNAME%\.maven'; Remove-Item '%DIRNAME%\.maven\maven.zip'"

if exist "%DIRNAME%\.maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=%DIRNAME%\.maven\apache-maven-3.9.6\bin\mvn.cmd"
    echo Maven downloaded and extracted successfully.
    goto run
) else (
    echo Failed to download Maven.
    exit /b 1
)

:run
call "%MVN_CMD%" %*
