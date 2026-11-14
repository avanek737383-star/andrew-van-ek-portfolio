param([string]$InstallRoot = (Join-Path $env:ProgramData 'PortfolioRoomSensors'))
$ErrorActionPreference='Stop'
$principal=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run this installer in an administrator PowerShell window.' }
$expectedRoot=[IO.Path]::GetFullPath((Join-Path $env:ProgramData 'PortfolioRoomSensors'))
if ([IO.Path]::GetFullPath($InstallRoot) -ne $expectedRoot) { throw 'Unexpected installation directory' }
$sourceRoot=Join-Path $PSScriptRoot 'dev-runtime'
foreach ($relative in @('app\MinerHost.ps1','app\Publish-Sensors.ps1','app\board_worker.py','config.json','mining-credential.dpapi','keys\upload_ed25519','keys\known_hosts')) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot $relative))) { throw ('Missing prepared file: '+$relative) }
}
$manifest=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'deployment-manifest.json') -Raw | ConvertFrom-Json
foreach ($item in $manifest.files) {
    $actual=(Get-FileHash -LiteralPath (Join-Path $sourceRoot $item.path) -Algorithm SHA256).Hash
    if ($actual -ne $item.sha256) { throw ('Prepared file hash differs: '+$item.path) }
}
$ownerSid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
foreach ($sub in @('app','keys','state','backups')) { New-Item -ItemType Directory -Path (Join-Path $InstallRoot $sub) -Force | Out-Null }
# Program files and secrets are writable only by administrators and SYSTEM.
$acl=New-Object Security.AccessControl.DirectorySecurity
$acl.SetOwner([Security.Principal.SecurityIdentifier]::new('S-1-5-32-544'))
$acl.SetAccessRuleProtection($true,$false)
foreach ($sid in @('S-1-5-18','S-1-5-32-544')) {
    $rule=[Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid),'FullControl','ContainerInherit,ObjectInherit','None','Allow')
    $acl.AddAccessRule($rule)
}
Set-Acl -LiteralPath $InstallRoot -AclObject $acl
& icacls.exe (Join-Path $InstallRoot '*') /reset /T /C /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not reset installation file permissions' }
foreach ($relative in @('app\MinerHost.ps1','app\Publish-Sensors.ps1','app\board_worker.py','config.json','mining-credential.dpapi','keys\upload_ed25519','keys\known_hosts')) {
    Copy-Item -LiteralPath (Join-Path $sourceRoot $relative) -Destination (Join-Path $InstallRoot $relative) -Force
}
$keyPath=Join-Path $InstallRoot 'keys\upload_ed25519'
$keyAcl=New-Object Security.AccessControl.FileSecurity
$keyAcl.SetOwner([Security.Principal.SecurityIdentifier]::new('S-1-5-18'))
$keyAcl.SetAccessRuleProtection($true,$false)
foreach ($sid in @('S-1-5-18','S-1-5-32-544')) {
    $keyAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid),'FullControl','Allow'))
}
Set-Acl -LiteralPath $keyPath -AclObject $keyAcl
# Read-only access to status/log files for the owner; credential/key files stay private.
$statePath=Join-Path $InstallRoot 'state'
$stateAcl=Get-Acl -LiteralPath $statePath
$stateAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($ownerSid),'ReadAndExecute','ContainerInherit,ObjectInherit','None','Allow'))
Set-Acl -LiteralPath $statePath -AclObject $stateAcl

$trigger=New-ScheduledTaskTrigger -AtStartup
$trigger.Delay='PT20S'
$taskPrincipal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew
$shell=Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
foreach ($spec in @(@('Portfolio Room Sensors - Miner','MinerHost.ps1'),@('Portfolio Room Sensors - Publisher','Publish-Sensors.ps1'))) {
    $script=Join-Path $InstallRoot ('app\'+$spec[1])
    $arguments='-NoProfile -NonInteractive -WindowStyle Hidden -File "'+$script+'" -Root "'+$InstallRoot+'"'
    $action=New-ScheduledTaskAction -Execute $shell -Argument $arguments
    Register-ScheduledTask -TaskName $spec[0] -Action $action -Trigger $trigger -Principal $taskPrincipal -Settings $settings -Description 'Circuit Playground room telemetry and mining; starts at Windows boot without sign-in.' -Force | Out-Null
}
$startup=Join-Path ([Environment]::GetFolderPath('Startup')) 'Start-Bluefruit-Miner-Silent.vbs'
if (Test-Path -LiteralPath $startup) {
    $backup=Join-Path $InstallRoot ('backups\Start-Bluefruit-Miner-Silent.'+(Get-Date -Format yyyyMMdd-HHmmss)+'.vbs')
    Move-Item -LiteralPath $startup -Destination $backup
}
# Stop only the old board launcher and this feature's development workers.
Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'powershell.exe' -and ($_.CommandLine -like '*\Duino-Circuit\Start-Miner.ps1*' -or
    $_.CommandLine -like '*\portfolio-room-sensors\dev-runtime\app\MinerHost.ps1*' -or
    $_.CommandLine -like '*\portfolio-room-sensors\dev-runtime\app\Publish-Sensors.ps1*')
} | ForEach-Object { Stop-Process -Id $_.ProcessId }
Start-ScheduledTask -TaskName 'Portfolio Room Sensors - Miner'
Start-ScheduledTask -TaskName 'Portfolio Room Sensors - Publisher'
[IO.File]::WriteAllText((Join-Path $statePath 'installation.json'),(@{installed_at=[DateTime]::UtcNow.ToString('o');startup='Windows boot';account='SYSTEM';tasks=@('Portfolio Room Sensors - Miner','Portfolio Room Sensors - Publisher')} | ConvertTo-Json))
Start-Sleep -Seconds 4
Get-ScheduledTask -TaskName 'Portfolio Room Sensors - *' | Select-Object TaskName,State
Write-Host 'Boot tasks installed and started. Old board sign-in launcher preserved under backups.'
