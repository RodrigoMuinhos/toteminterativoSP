param([ValidateSet('menu','my-little-pony','transformers')][string]$Tema = 'menu')
$ErrorActionPreference = 'Stop'
$projectDir = Join-Path $PSScriptRoot 'frontend'
$nodePath = (Get-Command node -ErrorAction Stop).Source
$browserPaths = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
)
$browserPath = $browserPaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (!$browserPath) { throw 'Instale Microsoft Edge ou Google Chrome.' }
Push-Location $projectDir
try {
  & $nodePath scripts/build.mjs
  if ($LASTEXITCODE -ne 0) { throw 'O build do frontend falhou.' }
} finally { Pop-Location }
$serverProcess = $null
$totemUrl = if ($Tema -eq 'menu') { 'http://127.0.0.1:4173/' } else { "http://127.0.0.1:4173/$Tema/" }
try {
  try { $ready = (Invoke-WebRequest 'http://127.0.0.1:4173' -TimeoutSec 2).Content.Contains('Escolha o tema') } catch { $ready = $false }
  if (!$ready) {
    $serverProcess = Start-Process -FilePath $nodePath -ArgumentList 'scripts/serve.mjs' -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
      Start-Sleep -Milliseconds 250
      if ($serverProcess.HasExited) { throw 'O servidor não iniciou. Verifique se a porta 4173 está ocupada.' }
      try { $ready = (Invoke-WebRequest 'http://127.0.0.1:4173' -TimeoutSec 1).Content.Contains('Escolha o tema') } catch { $ready = $false }
      if ($ready) { break }
    }
    if (!$ready) { throw 'Não foi possível iniciar o totem.' }
  }
  $profileDir = Join-Path $env:LOCALAPPDATA "TotemInterativoSP-$Tema"
  Start-Process -FilePath $browserPath -ArgumentList @('--kiosk',$totemUrl,'--edge-kiosk-type=fullscreen','--no-first-run', ('--user-data-dir="' + $profileDir + '"')) -Wait
} finally {
  if ($serverProcess -and !$serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id }
}
