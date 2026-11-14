param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Security
$config = Get-Content -LiteralPath (Join-Path $Root 'config.json') -Raw | ConvertFrom-Json
$stateDir = Join-Path $Root 'state'
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
$logPath = Join-Path $stateDir 'miner.log'
$script:serial = $null
$script:serialBuffer = ''
$script:results = New-Object 'System.Collections.Generic.Queue[object]'
$script:lastSample = $null
$script:accepted = 0
$script:hashrate = 0
$script:workerStarted = [DateTime]::UtcNow

function Write-Log([string]$Message) {
    if ((Test-Path -LiteralPath $logPath) -and (Get-Item -LiteralPath $logPath).Length -gt 1048576) {
        Move-Item -LiteralPath $logPath -Destination ($logPath + '.previous') -Force
    }
    Add-Content -LiteralPath $logPath -Encoding UTF8 -Value (([DateTime]::UtcNow.ToString('o')) + ' ' + $Message)
}
function Write-JsonAtomic([string]$Path, $Value) {
    $text = $Value | ConvertTo-Json -Compress -Depth 5
    $temp = $Path + '.' + $PID + '.tmp'
    [IO.File]::WriteAllText($temp, $text, [Text.UTF8Encoding]::new($false))
    for ($attempt=0; $attempt -lt 10; $attempt++) {
        try { Move-Item -LiteralPath $temp -Destination $Path -Force; return }
        catch { if ($attempt -eq 9) { throw }; Start-Sleep -Milliseconds 50 }
    }
}
function Save-MiningStatus([string]$Status) {
    Write-JsonAtomic (Join-Path $stateDir 'mining-status.json') ([ordered]@{
        status=$Status; updated_at=[DateTime]::UtcNow.ToString('o');
        accepted_shares=$script:accepted; hashrate=$script:hashrate;
        started_at=$script:workerStarted.ToString('o')
    })
}
function Read-Board {
    if (-not $script:serial -or -not $script:serial.IsOpen) { return }
    $script:serialBuffer += $script:serial.ReadExisting()
    if ($script:serialBuffer.Length -gt 32768) { throw 'Board input exceeded the frame limit' }
    while (($newline=$script:serialBuffer.IndexOf("`n")) -ge 0) {
        $line = $script:serialBuffer.Substring(0,$newline).Trim()
        $script:serialBuffer = $script:serialBuffer.Substring($newline+1)
        if ($line -match '^SENSOR,(-?\d+(?:\.\d+)?),(\d+),(\d+(?:\.\d+)?)$') {
            $c = [double]::Parse($Matches[1],[Globalization.CultureInfo]::InvariantCulture)
            $light = [int]$Matches[2]
            $uptime = [double]::Parse($Matches[3],[Globalization.CultureInfo]::InvariantCulture)
            if ($c -ge -40 -and $c -le 125 -and $light -ge 0 -and $light -le 330) {
                $script:lastSample = [ordered]@{
                    schema_version=1; observed_at=[DateTime]::UtcNow.ToString('o');
                    source_connected=$true; temperature_c=$c; light_level=$light; board_uptime_s=$uptime
                }
                Write-JsonAtomic (Join-Path $stateDir 'room-sensors.json') $script:lastSample
            }
        } elseif ($line -match '^([01]+),([01]+),(DUCOID[0-9A-F]+)$') {
            $script:results.Enqueue(@([Convert]::ToInt64($Matches[1],2),[Convert]::ToInt64($Matches[2],2),$Matches[3]))
        } elseif ($line.StartsWith('ERROR,')) { throw 'Board rejected a mining job' }
    }
}
function Wait-WithSensors([int]$Seconds) {
    $end=[DateTime]::UtcNow.AddSeconds($Seconds)
    while ([DateTime]::UtcNow -lt $end) { Read-Board; Start-Sleep -Milliseconds 100 }
}
function Get-BoardResult {
    $end=[DateTime]::UtcNow.AddSeconds(90)
    while ([DateTime]::UtcNow -lt $end) {
        Read-Board
        if ($script:results.Count) { return ,($script:results.Dequeue()) }
        Start-Sleep -Milliseconds 20
    }
    throw 'Board mining result timed out'
}
function Receive-Pool($Stream) {
    $end=[DateTime]::UtcNow.AddSeconds(30)
    while (-not $Stream.DataAvailable) {
        Read-Board
        if ([DateTime]::UtcNow -gt $end) { throw 'Pool response timed out' }
        Start-Sleep -Milliseconds 50
    }
    $bytes=New-Object byte[] 2048
    $count=$Stream.Read($bytes,0,$bytes.Length)
    if (-not $count) { throw 'Pool disconnected' }
    return [Text.Encoding]::UTF8.GetString($bytes,0,$count).Trim()
}
function Send-Pool($Stream,[string]$Message) {
    $bytes=[Text.Encoding]::UTF8.GetBytes($Message)
    $Stream.Write($bytes,0,$bytes.Length)
}
function Load-BoardWorker {
    $script:serial.Write([byte[]]@(2,3,3),0,3)
    Start-Sleep -Milliseconds 700
    $null=$script:serial.ReadExisting()
    $script:serial.Write([byte[]]@(13,1),0,2)
    $greeting='';$end=[DateTime]::UtcNow.AddSeconds(8)
    while ($greeting -notmatch 'raw REPL; CTRL-B to exit[\r\n]+>') {
        $greeting+=$script:serial.ReadExisting()
        if ([DateTime]::UtcNow -gt $end) { throw 'CircuitPython raw REPL did not respond' }
        Start-Sleep -Milliseconds 50
    }
    $code=[IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'board_worker.py'))
    for ($offset=0;$offset -lt $code.Length;$offset+=128) {
        $script:serial.Write($code,$offset,[Math]::Min(128,$code.Length-$offset))
        Start-Sleep -Milliseconds 10
    }
    $script:serial.Write([byte[]]@(4),0,1)
    $script:serialBuffer='';$script:results.Clear()
    Wait-WithSensors 1
}
function Get-BoardPort {
    $device=Get-CimInstance Win32_PnPEntity | Where-Object {
        $_.PNPDeviceID -like 'USB\VID_239A&PID_8046&MI_00\*' -and $_.Name -match '\(COM\d+\)'
    } | Select-Object -First 1
    if (-not $device) { throw 'Circuit Playground Bluefruit is not connected' }
    return [regex]::Match($device.Name,'COM\d+').Value
}

$mutex=New-Object Threading.Mutex($false,'Global\PortfolioRoomMiner')
if (-not $mutex.WaitOne(0)) { exit 0 }
try {
    $blob=[Convert]::FromBase64String([IO.File]::ReadAllText((Join-Path $Root 'mining-credential.dpapi')))
    $clear=[Security.Cryptography.ProtectedData]::Unprotect($blob,$null,[Security.Cryptography.DataProtectionScope]::LocalMachine)
    $credential=[Text.Encoding]::UTF8.GetString($clear) | ConvertFrom-Json
    [Array]::Clear($clear,0,$clear.Length)
    $username=[string]$credential.username;$key=[string]$credential.mining_key
    if ($username -notmatch '^[A-Za-z0-9_-]+$' -or [string]::IsNullOrWhiteSpace($key) -or $key -match '[,\r\n]') { throw 'Stored mining credentials are invalid' }
    while ($true) {
        $client=$null
        try {
            $port=Get-BoardPort
            $script:serial=New-Object IO.Ports.SerialPort $port,115200,None,8,one
            $script:serial.ReadTimeout=1000;$script:serial.WriteTimeout=5000;$script:serial.DtrEnable=$true
            $script:serial.Open()
            Load-BoardWorker
            $script:serial.Write('ba29a15896fd2d792d5c4b60668bf2b9feebc51d,d0beba883d7e8cd119ea2b0e09b78f60f29e0968,10,')
            $test=Get-BoardResult
            if ($test[0] -ne 50) { throw 'Known-answer mining self-test failed' }
            $script:hashrate=50*1000000/$test[1]
            Write-Log ('Board connected on {0}; self-test passed ({1:N0} H/s)' -f $port,$script:hashrate)
            Save-MiningStatus 'connected'
            $difficulty='AVR'
            if ($script:hashrate -gt 1000) { $difficulty='DUE' } elseif ($script:hashrate -gt 550) { $difficulty='ARM' } elseif ($script:hashrate -gt 380) { $difficulty='MEGA' }
            while ($script:serial.IsOpen) {
                try {
                    $pool=Invoke-RestMethod 'https://server.duinocoin.com/getPool' -TimeoutSec 15
                    if (-not $pool.success) { throw 'Pool discovery failed' }
                    $client=New-Object Net.Sockets.TcpClient
                    $connect=$client.ConnectAsync([string]$pool.ip,[int]$pool.port)
                    if (-not $connect.Wait(15000)) { throw 'Pool connection timed out' }
                    $stream=$client.GetStream();$stream.ReadTimeout=3000;$stream.WriteTimeout=5000
                    $null=Receive-Pool $stream
                    Write-Log 'Mining pool connected'
                    while ($true) {
                        Read-Board
                        Send-Pool $stream "JOB,$username,$difficulty,$key"
                        $job=(Receive-Pool $stream).Split(',')
                        if ($job.Count -lt 3 -or $job[0] -notmatch '^[0-9a-fA-F]{40}$' -or $job[1] -notmatch '^[0-9a-fA-F]{40}$' -or $job[2] -notmatch '^\d+$') { throw 'Pool returned an invalid job' }
                        $script:serial.Write(($job[0..2] -join ',')+',')
                        $result=Get-BoardResult
                        $script:hashrate=[Math]::Round(($result[0]+1)*1000000/$result[1],2)
                        $rate=$script:hashrate.ToString([Globalization.CultureInfo]::InvariantCulture)
                        Send-Pool $stream "$($result[0]),$rate,CircuitPython Sensor Miner 1.1,CircuitPlayground,$($result[2])"
                        $feedback=Receive-Pool $stream
                        if ($feedback -match '^(GOOD|BLOCK)') { $script:accepted++ }
                        Save-MiningStatus 'mining'
                        Write-Log ('Share '+($feedback -replace '[^A-Za-z0-9_-]','')+'; accepted='+$script:accepted+'; H/s='+$rate)
                    }
                } catch {
                    Write-Log 'Pool/serial session interrupted; retrying'
                    Save-MiningStatus 'retrying'
                    if ($client) { $client.Dispose();$client=$null }
                    Wait-WithSensors 10
                }
            }
        } catch {
            Write-Log 'Board unavailable or session failed; reconnecting'
            Save-MiningStatus 'board-unavailable'
            if ($script:lastSample) {
                $script:lastSample.source_connected=$false
                Write-JsonAtomic (Join-Path $stateDir 'room-sensors.json') $script:lastSample
            }
        } finally {
            if ($client) { $client.Dispose() }
            if ($script:serial) { $script:serial.Dispose();$script:serial=$null }
        }
        Start-Sleep -Seconds 5
    }
} finally {
    if ($script:serial) { $script:serial.Dispose() }
    $mutex.ReleaseMutex();$mutex.Dispose()
}
