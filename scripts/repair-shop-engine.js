// Everything here is a fictional simulation. No commands or repairs reach the OS.
export const CASES = [
  {
    id: 'pictures', number: '001', title: 'Double-click. Nothing.', level: 'FIRST DAY',
    customer: 'The photographer', avatar: 'PH', device: 'Windows 11 · workstation',
    quote: '“I switched photo apps. Now I have two apps that don’t open my photos.”',
    summary: 'A JPG is readable, but opening it from the desktop goes nowhere. Find where the launch chain breaks.',
    file: 'vacation_final_FINAL.jpg', symptom: 'Opening… probably.',
    tools: [
      { id: 'file', tab: 'files', title: 'Read the JPG', result: 'LOCAL FILE CHECK\nRead: 217,639 bytes in 11 ms\nJPEG header: valid\nThe file is readable. Storage is responding.' },
      { id: 'launch', tab: 'tasks', title: 'Launch the viewer directly', result: 'DIRECT LAUNCH\nImageGlass opened vacation_final_FINAL.jpg.\nCPU: 6% · Memory available: 32 GB\nThe app and image work when the association is bypassed.' },
      { id: 'assoc', tab: 'settings', title: 'Inspect default-app registration', result: 'FILE ASSOCIATIONS\nInstalled app: ImageGlass ✓\nStart menu entry: present ✓\nRegistered JPG handler: missing ✕\nWindows knows the app exists, but not that it opens JPGs.' }
    ], requires: ['launch', 'assoc'],
    actions: [
      { id: 'register', title: 'Register the image viewer', tab: 'settings', correct: true, result: 'ImageGlass.exe --ig-set-default-viewer\nViewer capabilities and JPG handler registered in the simulated registry.' },
      { id: 'codec', title: 'Install a mystery codec pack', tab: 'settings', result: 'The image already decoded during direct launch. The codec pack adds three tray icons and zero solutions.' },
      { id: 'reboot', title: 'Reboot and hope', tab: 'tasks', result: 'The desktop returns. The missing JPG registration is still missing. Hope is not a file association.' }
    ],
    verify: 'The JPG opens from the desktop through its registered viewer. The customer can finally see the beach.',
    lesson: 'A readable file and a working app narrow the problem to the handoff between them. Test the launch path before replacing the app.',
    hints: ['Try the viewer directly. Does the same file work outside the desktop launch path?', 'Inspect default-app registration, then register the image viewer.'],
    source: { label: 'ImageGlass registration documentation', url: 'https://imageglass.org/docs/command-line-utilities' }
  },
  {
    id: 'internet', number: '002', title: 'Five bars. Zero internet.', level: 'NETWORKING',
    customer: 'The remote worker', avatar: 'WF', device: 'Windows 11 · Wi-Fi laptop',
    quote: '“The Wi-Fi icon says connected. I would like to speak to the icon’s manager.”',
    summary: 'The laptop reaches the network, but websites fail by name. Separate connectivity from name resolution.',
    file: 'the_entire_internet.url', symptom: 'Server not found. Again.',
    tools: [
      { id: 'ping', tab: 'network', title: 'Test an IP connection', result: 'CONNECTIVITY CHECK\nGateway 192.0.2.1: reachable\nExternal test service by IP: reachable\nPacket loss: 0%\nThe network path is working.' },
      { id: 'dns', tab: 'network', title: 'Test name resolution', result: 'DNS LOOKUP\nLookup: example.test\nConfigured resolver: 192.0.2.53\nResult: timeout\nOld manual DNS override points to a retired lab server.' },
      { id: 'radio', tab: 'hardware', title: 'Inspect Wi-Fi adapter', result: 'ADAPTER STATUS\nSignal: excellent\nDriver: operating normally\nDHCP lease: valid\nThe five bars have been cleared of all charges.' }
    ], requires: ['ping', 'dns'],
    actions: [
      { id: 'dhcp', title: 'Restore network-provided DNS', tab: 'network', correct: true, result: 'Removed the stale manual DNS override. Renewed network-provided resolver settings and cleared the simulated DNS cache.' },
      { id: 'driver', title: 'Reinstall the Wi-Fi driver', tab: 'hardware', result: 'The adapter reconnects to the same network with the same broken DNS override. A very productive circle.' },
      { id: 'browser', title: 'Try a fourth browser', tab: 'settings', result: 'Now four browsers cannot resolve the same name. They form a support group.' }
    ],
    verify: 'Name lookup succeeds, then the browser loads the test page. The Wi-Fi icon retains its job.',
    lesson: 'Connection, name resolution, and application access are separate tests. A connected Wi-Fi icon only proves part of the path.',
    hints: ['Compare reaching an IP address with looking up a hostname.', 'The old manual DNS override is the problem. Restore the resolver supplied by this network.']
  },
  {
    id: 'printer', number: '003', title: 'The printer has opinions.', level: 'PERIPHERALS',
    customer: 'The office manager', avatar: 'OM', device: 'Windows 11 · network printer',
    quote: '“It printed perfectly yesterday. Nobody touched anything. Except everyone.”',
    summary: 'Jobs queue forever while the printer sits quietly, conserving its emotional energy.',
    file: 'urgent_document_v7.pdf', symptom: '12 jobs. No paper moving.',
    tools: [
      { id: 'queue', tab: 'tasks', title: 'Inspect the print queue', result: 'PRINT QUEUE\n12 pending jobs\nQueue state: PAUSED\nOldest job: 9:03 AM\nThe spooler is running, but this queue is paused.' },
      { id: 'device', tab: 'hardware', title: 'Check printer readiness', result: 'DEVICE CHECK\nNetwork: reachable\nPaper: loaded\nToner: sufficient\nPrinter self-test: successful\nThe printer is ready to do literally anything asked of it.' },
      { id: 'default', tab: 'settings', title: 'Inspect selected printer', result: 'DEFAULT PRINTER\nOffice LaserJet: selected\nPort: correct\nNo, this one is not trying to print into a PDF file.' }
    ], requires: ['queue', 'device'],
    actions: [
      { id: 'resume', title: 'Resume the paused queue', tab: 'tasks', correct: true, result: 'Queue changed from PAUSED to READY. Pending jobs begin processing in order.' },
      { id: 'send', title: 'Click Print thirteen more times', tab: 'files', result: 'The queue is still paused. It now contains enough copies to wallpaper the break room.' },
      { id: 'driver', title: 'Replace the printer driver', tab: 'settings', result: 'The self-test worked and the queue is paused. The new driver politely waits behind the same pause flag.' }
    ],
    verify: 'One test page prints and the queue drains. The customer agrees to stop clicking Print, provisionally.',
    lesson: 'Check device readiness and queue state separately. Repeated submissions cannot unpause a queue.',
    hints: ['Check the print queue and whether the physical printer can print its own test page.', 'Resume the paused queue. The printer and network are already working.']
  },
  {
    id: 'sound', number: '004', title: 'The meeting is silent.', level: 'AUDIO',
    customer: 'The meeting host', avatar: 'MH', device: 'Windows 11 · docked laptop',
    quote: '“Everyone can hear me. I can hear my career passing before my eyes.”',
    summary: 'Audio disappeared after docking. Volume is up, the meeting is running, and panic is extremely audible.',
    file: 'very_important_meeting.link', symptom: 'Volume: 100%. Sound: 0%.',
    tools: [
      { id: 'output', tab: 'settings', title: 'Inspect audio output', result: 'PLAYBACK ROUTING\nSelected output: HDMI Monitor\nMonitor speakers: none\nLaptop Speakers: available\nAudio is routed to a device that cannot play it.' },
      { id: 'meter', tab: 'tasks', title: 'Check application audio', result: 'AUDIO MIXER\nMeeting app: unmuted\nMaster volume: 100%\nPlayback meter: active\nThe app is producing audio. Follow its destination.' },
      { id: 'jack', tab: 'hardware', title: 'Inspect physical connections', result: 'CONNECTIONS\nDock connected over USB-C\nHDMI display detected\nHeadphone jack: empty\nDocking changed the default audio endpoint.' }
    ], requires: ['output', 'meter'],
    actions: [
      { id: 'speakers', title: 'Route playback to laptop speakers', tab: 'settings', correct: true, result: 'Selected Laptop Speakers for system playback and the meeting app.' },
      { id: 'volume', title: 'Turn the volume up harder', tab: 'settings', result: 'Still 100%. The silent monitor is now receiving audio with considerable confidence.' },
      { id: 'reinstall', title: 'Reinstall the meeting app', tab: 'tasks', result: 'The app returns and sends audio to the exact same HDMI endpoint. The meeting has moved on to slide 47.' }
    ],
    verify: 'The test tone plays through the laptop speakers and meeting audio is audible.',
    lesson: 'An active audio meter proves a signal exists, not that it reaches the intended output. Check routing after a dock or display change.',
    hints: ['Check both the app’s audio meter and the selected playback output.', 'The HDMI display has no speakers. Select Laptop Speakers for playback.']
  },
  {
    id: 'heat', number: '005', title: 'Laptop or panini press?', level: 'HARDWARE',
    customer: 'The power user', avatar: 'PU', device: 'Windows 11 · mobile workstation',
    quote: '“It used to be fast. Now the fan sounds like it has a connecting flight.”',
    summary: 'The workstation slows dramatically under sustained load. A reboot buys sixty seconds of optimism.',
    file: 'render_this_please.blend', symptom: 'Fan: departure approved.',
    tools: [
      { id: 'sensors', tab: 'hardware', title: 'Read temperatures and clocks', result: 'SENSOR SNAPSHOT\nCPU: 99 °C\nClock: 0.8 GHz under load\nThermal throttling: ACTIVE\nThe processor is reducing speed to stay within its thermal limit.' },
      { id: 'vents', tab: 'hardware', title: 'Inspect airflow', result: 'PHYSICAL INSPECTION\nLaptop resting on a fleece blanket\nBottom intake: obstructed\nFan turns normally\nThe cooling system has been asked to breathe through a sweater.' },
      { id: 'load', tab: 'tasks', title: 'Inspect active workload', result: 'TASK MANAGER\n3D renderer: expected CPU load\nMemory pressure: low\nNo unexpected background task explains the slowdown.' }
    ], requires: ['sensors', 'vents'],
    actions: [
      { id: 'airflow', title: 'Pause the render and clear airflow', tab: 'hardware', correct: true, result: 'Paused the workload, moved the laptop to a hard ventilated surface, and allowed it to cool before retesting.' },
      { id: 'power', title: 'Select maximum performance', tab: 'settings', result: 'Demanding more power does not clear an obstructed intake. The fan submits a resignation letter.' },
      { id: 'reboot', title: 'Reboot for another good minute', tab: 'tasks', result: 'Idle temperatures fall. The same blocked intake brings throttling back under load.' }
    ],
    verify: 'In this simulated retest, the same workload stabilizes at 78 °C without throttling.',
    lesson: 'Compare temperatures, clocks, and load. Cooling problems can masquerade as software slowness; verify under the original workload.',
    hints: ['Inspect the temperature and clock readings, then check where the laptop is sitting.', 'Pause the workload and clear the blocked intake before running the same workload again.']
  },
  {
    id: 'cloud', number: '006', title: 'The file is only mostly here.', level: 'FINAL TICKET',
    customer: 'The photographer, again', avatar: 'PH', device: 'Windows 11 · streamed cloud drive',
    quote: '“I can SEE the file. Why does the computer need a meeting to open it?”',
    summary: 'A photo appears in a cloud folder but never opens. This resembles ticket 001. Test whether it is actually the same problem.',
    file: 'cloud_holiday.jpg', symptom: 'Present in spirit.',
    tools: [
      { id: 'read', tab: 'files', title: 'Read local and cloud copies', result: 'FILE ACCESS COMPARISON\nLocal sample JPG: reads in 10 ms\nCloud photo: content read times out\nCloud photo state: online-only placeholder\nA directory listing does not prove the file content is local.' },
      { id: 'sync', tab: 'network', title: 'Inspect cloud sync status', result: 'CLOUD CLIENT\nNetwork connection: online\nSigned-in account: valid\nSync and content retrieval: PAUSED\nPending download: cloud_holiday.jpg' },
      { id: 'viewer', tab: 'settings', title: 'Check the image launch path', result: 'VIEWER CHECK\nJPG association: registered\nLocal sample opens through desktop: yes\nThis is not the registration fault from ticket 001.' }
    ], requires: ['read', 'sync'],
    actions: [
      { id: 'download', title: 'Resume sync and download the photo', tab: 'network', correct: true, result: 'Resumed the fictional cloud client and marked this photo available offline. Content download completed.' },
      { id: 'register', title: 'Register the image viewer again', tab: 'settings', result: 'The association was already valid. A correct viewer cannot decode bytes that have not arrived.' },
      { id: 'rename', title: 'Rename JPG to PNG', tab: 'files', result: 'Renaming the extension does not download the file or convert the image. It does give the problem a new hat.' }
    ],
    verify: 'The downloaded photo reads successfully and opens through the existing JPG handler. Same symptom, different cause.',
    lesson: 'Retest assumptions when symptoms repeat. Cloud placeholders may list instantly while their contents are unavailable. Compare with a known local file.',
    hints: ['Compare reading actual bytes from a local file and the cloud photo. Then inspect the cloud client.', 'Resume the paused client and download the photo. The registered image viewer already works.']
  }
];

export const freshCase = () => ({ clues: [], fixed: false, verified: false, mistakes: 0, hints: 0, events: [] });
export const createGame = () => ({ version: 1, active: 0, cases: CASES.map(freshCase) });
export const scoreCase = state => state.verified ? Math.max(20, 100 - state.mistakes * 15 - state.hints * 8) : 0;
export const totalScore = game => game.cases.reduce((sum, state) => sum + scoreCase(state), 0);
export function restoreGame(raw) {
  try {
    const game = JSON.parse(raw);
    if (game.version !== 1 || !Number.isInteger(game.active) || game.active < 0 || game.active >= CASES.length || game.cases.length !== CASES.length) return createGame();
    game.cases = game.cases.map((state, index) => ({
      clues: [...new Set(state.clues.filter(id => CASES[index].tools.some(tool => tool.id === id)))],
      fixed: state.fixed === true,
      verified: state.fixed === true && state.verified === true,
      mistakes: Number.isInteger(state.mistakes) ? Math.min(999, Math.max(0, state.mistakes)) : 0,
      hints: Number.isInteger(state.hints) ? Math.min(2, Math.max(0, state.hints)) : 0,
      events: Array.isArray(state.events) ? state.events.slice(-24).filter(event => typeof event.title === 'string' && typeof event.text === 'string').map(event => ({ title: event.title.slice(0, 150), text: event.text.slice(0, 1500), kind: ['info', 'good', 'bad'].includes(event.kind) ? event.kind : 'info' })) : []
    }));
    return game;
  } catch { return createGame(); }
}
function event(state, title, text, kind = 'info') {
  state.events.push({ title, text, kind });
  state.events = state.events.slice(-24);
  return { title, text, kind };
}
export function inspect(game, id) {
  const item = CASES[game.active];
  const state = game.cases[game.active];
  const tool = item.tools.find(tool => tool.id === id);
  if (!tool) throw new Error('Unknown diagnostic');
  if (!state.clues.includes(id)) state.clues.push(id);
  return event(state, tool.title, tool.result);
}
export function repair(game, id) {
  const item = CASES[game.active];
  const state = game.cases[game.active];
  const action = item.actions.find(action => action.id === id);
  if (!action) throw new Error('Unknown repair');
  if (state.verified) return event(state, 'Ticket already closed', 'This fix has already been verified. Take another ticket.', 'good');
  if (state.fixed) return event(state, 'Ready for a retest', 'The fix is applied. Verify the original symptom before changing anything else.');
  if (!item.requires.every(id => state.clues.includes(id))) return event(state, 'Evidence before optimism', 'Run the relevant diagnostics before applying a fix. Open the other tools to find more checks. No points lost.');
  if (action.correct) {
    state.fixed = true;
    return event(state, 'Fix applied · verification needed', action.result, 'good');
  }
  state.mistakes++;
  return event(state, 'That did not fix it · −15 points', action.result, 'bad');
}
export function verify(game) {
  const item = CASES[game.active];
  const state = game.cases[game.active];
  if (state.verified) return event(state, 'Already verified', 'Another satisfied customer. Probably.', 'good');
  if (!state.fixed) return event(state, 'Retest failed', 'The original symptom is still present. Gather evidence and apply a fix before closing the ticket.', 'bad');
  state.verified = true;
  return event(state, 'Verified · ticket closed', item.verify, 'good');
}
export function getHint(game) {
  const item = CASES[game.active];
  const state = game.cases[game.active];
  if (state.hints >= 2 || state.verified) return null;
  return event(state, 'Senior technician says… · −8 points', item.hints[state.hints++]);
}
