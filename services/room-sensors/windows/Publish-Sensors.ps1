param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference='Stop'
$config=Get-Content -LiteralPath (Join-Path $Root 'config.json') -Raw | ConvertFrom-Json
$stateDir=Join-Path $Root 'state'
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
$logPath=Join-Path $stateDir 'publisher.log'
$mutex=New-Object Threading.Mutex($false,'Global\PortfolioRoomPublisher')
if (-not $mutex.WaitOne(0)) { exit 0 }
$lastSent=''
try {
    while ($true) {
        try {
            $path=Join-Path $stateDir 'room-sensors.json'
            if (Test-Path -LiteralPath $path) {
                $text=[IO.File]::ReadAllText($path)
                $snapshot=$text | ConvertFrom-Json
                $signature=$snapshot.observed_at+'|'+$snapshot.source_connected
                $miningPath=Join-Path $stateDir 'mining-status.json'
                if (Test-Path -LiteralPath $miningPath) {
                    $mining=Get-Content -LiteralPath $miningPath -Raw | ConvertFrom-Json
                    $snapshot | Add-Member -NotePropertyName mining -NotePropertyValue ([ordered]@{
                        status=$mining.status; updated_at=$mining.updated_at;
                        hashrate_hs=[double]$mining.hashrate; accepted_shares=[long]$mining.accepted_shares
                    }) -Force
                    $signature+='|'+$mining.updated_at
                }
                $text=$snapshot | ConvertTo-Json -Compress -Depth 5
                if ($signature -ne $lastSent) {
                    $start=New-Object Diagnostics.ProcessStartInfo
                    $start.FileName=Join-Path $env:WINDIR 'System32\OpenSSH\ssh.exe'
                    $key=Join-Path $Root 'keys\upload_ed25519'
                    $known=Join-Path $Root 'keys\known_hosts'
                    $start.Arguments='-T -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=8 -o ServerAliveInterval=5 -o ServerAliveCountMax=1 -o UserKnownHostsFile="'+$known+'" -i "'+$key+'" '+$config.publish_host
                    $start.UseShellExecute=$false;$start.CreateNoWindow=$true
                    $start.RedirectStandardInput=$true;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
                    $process=[Diagnostics.Process]::Start($start)
                    $process.StandardInput.Write($text);$process.StandardInput.Close()
                    if (-not $process.WaitForExit(20000)) { $process.Kill();throw 'Upload timed out' }
                    if ($process.ExitCode -ne 0) { throw 'Upload did not succeed' }
                    $process.Dispose();$lastSent=$signature
                    [IO.File]::WriteAllText((Join-Path $stateDir 'publish-status.json'),(@{status='published';updated_at=[DateTime]::UtcNow.ToString('o');observed_at=$snapshot.observed_at} | ConvertTo-Json -Compress))
                }
            }
        } catch {
            if ((Test-Path -LiteralPath $logPath) -and (Get-Item -LiteralPath $logPath).Length -gt 1048576) { Move-Item -LiteralPath $logPath -Destination ($logPath+'.previous') -Force }
            Add-Content -LiteralPath $logPath -Encoding UTF8 -Value ([DateTime]::UtcNow.ToString('o')+' Publish unavailable; retrying without changing the last sample timestamp')
        }
        Start-Sleep -Seconds 10
    }
} finally { $mutex.ReleaseMutex();$mutex.Dispose() }
