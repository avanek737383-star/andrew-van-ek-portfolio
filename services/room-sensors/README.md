# Room sensors alongside mining

Implemented with OpenAI Codex through ChatGPT, directed by Andrew Van Ek.

The Circuit Playground Bluefruit worker shares its existing USB mining stream with
onboard thermistor and relative-light samples. The Windows host owns that serial
port exclusively; the publisher uploads whitelisted status through a dedicated,
forced-command SSH key. Neither the browser nor public HTTP API can control mining.

## Current deployment

Live collection, pool acceptance, SSH publishing, and HTTPS readback have been
verified. Server startup is enabled. The owner ran the Windows administrator
installer on November 14, 2026 at 4:21 PM EST; both installed tasks started.
The installed host passed its board self-test and submitted accepted shares near
2.4 kH/s, while the installed publisher delivered fresh readings to the public
cards. The old sign-in launcher was removed from Startup and preserved in the
installation backup, and development workers stopped. A full Windows reboot
test remains pending; the portfolio records this distinction explicitly.

## Windows boot installation

`windows/Install-RoomSensors.ps1` expects an adjacent private `dev-runtime` directory
containing `app/MinerHost.ps1`, `app/Publish-Sensors.ps1`, `app/board_worker.py`,
`config.json` (`publish_host`), `mining-credential.dpapi`, `keys/upload_ed25519`,
and pinned `keys/known_hosts`. A sibling `deployment-manifest.json` lists each
relative path and SHA-256. This private deployment bundle is never committed.
The mining credential is UTF-8 JSON containing `username` and `mining_key`,
protected using Windows DPAPI LocalMachine on the target Windows machine, with
the resulting bytes stored as base64 text.
See `MinerHost.ps1` for the exact credential schema; do not create a new account
or print an existing credential during setup.

Run the prepared installer once in administrator PowerShell under RemoteSigned:

```powershell
& 'C:\Users\Owner\codex-tasks\portfolio-room-sensors\Install-RoomSensors.ps1'
```

It installs under `%ProgramData%\PortfolioRoomSensors`, restricts executable and
secret access to SYSTEM/Administrators, gives the installing user read access to
status, and registers `Portfolio Room Sensors - Miner` and
`Portfolio Room Sensors - Publisher`. Both use SYSTEM AtStartup triggers with a
20-second delay, retry on failure, and require no interactive sign-in. The miner
also samples sensors; the publisher independently retries network delivery.
Only the old board launcher and this feature's development workers are stopped.
Unrelated CPU miners are untouched. The original sign-in VBS is preserved under
`backups` after task registration. The original board flash is unchanged because
the worker loads into RAM on each connection.

Verify both task states, fresh `state/room-sensors.json`,
`state/publish-status.json`, and accepted shares in `state/miner.log`. Finally
reboot Windows when convenient and verify fresh telemetry before sign-in.
Registering an AtStartup trigger alone does not constitute a reboot test.

## Server setup

The deployment uses Python standard-library code on Alpine Linux. Install the
OpenRC file as `/etc/init.d/portfolio-room-sensors`, make it executable, add it to
the default runlevel, and start it. Review its deployment-specific paths first.
It serves loopback port 8096 behind the existing Tailscale HTTPS/Funnel route
`/website-chat/room-sensors`; other routes are preserved.

The dedicated upload public key has this authorized_keys restriction:

```
restrict,command="/usr/bin/python3 /home/avanek/agy-work/portfolio/services/room-sensors/ingest.py" ssh-ed25519 PUBLIC_KEY
```

`ingest.py` accepts at most 4096 bytes, validates a strict schema, and atomically
replaces the private snapshot under `~/.local/share/portfolio-room-sensors`.
The HTTP API exposes a whitelist, rejects POST, and allows browser origins only
for the portfolio domain. No upload key, mining credential, private cache,
account name, or local backup belongs in the repository.

## Interpretation and failure states

Temperature converts the onboard thermistor's Celsius value to Fahrenheit.
Board heating and placement affect this approximate ambient measurement.
Light is the Adafruit library's 0–330 relative scale mapped to 0–100%; it is not
calibrated lux. Samples are normally taken every ten seconds, including during
long hashing jobs. The UI polls every ten seconds and displays stale status after
60 seconds or when the board reports disconnection. Mining freshness is evaluated
separately. A network failure retains the last sample with its age and an offline
label; the display never invents replacement measurements.

## Maintenance and rollback

Inspect Windows task status and local state logs first, then OpenRC service status
and the HTTPS endpoint. Stop both tasks before opening the board in a serial
console. Reconnecting the board reloads the RAM worker automatically. Logs rotate
at 1 MB. A missing USB device or network is retried rather than requiring a login.

To roll back, stop and disable the two tasks, then restore the saved Startup VBS
to the original user's Startup folder and launch the prior board miner. Resetting
the board restores its unchanged flash program. To remove public reporting, stop
and remove the OpenRC service from the default runlevel, remove only this Funnel
path, and remove only the dedicated upload authorized_keys entry. Preserve all
other routes and keys. Keep private backups until recovery has been verified.

The Cloudflare Pages Function at `functions/api/room-sensors.js` relays GET to
the HTTPS read-only endpoint and disables caching. The browser requests the
same-origin `/api/room-sensors` path. This avoids Chrome local-network permission
failures when MagicDNS resolves the upstream hostname to a tailnet address on
the owner's computer. The Cloudflare edge uses public DNS and Funnel instead.

## Validation

```
python3 -m unittest discover -s services/room-sensors -p 'test_*.py'
node --check scripts/room-sensors.js
```

Tests cover unit conversion, stale/disconnected sources, malformed/range/nonfinite
input, and future timestamps. Live board testing includes a known-answer SHA-1
job, accepted pool shares, concurrent sensor frames, validated SSH ingestion, and
public HTTPS readback. Desktop/mobile display verification is performed separately.

References: [Adafruit Circuit Playground API](https://docs.circuitpython.org/projects/circuitplayground/en/latest/api.html),
[Circuit Playground library source](https://github.com/adafruit/Adafruit_CircuitPython_CircuitPlayground/blob/main/adafruit_circuitplayground/circuit_playground_base.py).
