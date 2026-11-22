/* Interactive 3D Digital-Twin & Photogrammetry-Ready Homelab Fleet Viewport
 * Built with Three.js (r128) & OrbitControls
 * Author: Andrew Van Ek & Antigravity AI
 * Models physical volumes, wireframe bounding outlines, and sub-component inspection
 */

(function () {
	'use strict';

	let scene, camera, renderer, controls;
	let container, canvas;
	let interactiveNodes = [];
	let hoveredMesh = null, selectedMesh = null;
	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();
	let neoPixelLight, neoPixelMeshes = [];
	let fanBladesMesh = null;
	let animFrameId = null;

	const CAMERA_PRESETS = {
		'perspective': { pos: [0, 16, 26], target: [0, 7.5, 0] },
		'shelf1': { pos: [-1.5, 15.2, 11], target: [0, 13.5, 0] },
		'shelf2': { pos: [1.5, 9.6, 11], target: [1, 8.0, 0] },
		'shelf3': { pos: [0, 4.0, 10.5], target: [0, 2.4, 0] },
		'wall': { pos: [-3.5, 13.0, 6.5], target: [-4.0, 10.0, -3.8] }
	};

	window.addEventListener('DOMContentLoaded', () => {
		init3DViewport();
		initViewportSwitchers();
	});

	function initViewportSwitchers() {
		const toggle3d = document.getElementById('toggle-view-3d');
		const toggle2d = document.getElementById('toggle-view-2d');
		const view3d = document.getElementById('fleet-3d-wrapper');
		const view2d = document.getElementById('viewport-canvas-wrapper');

		if (toggle3d && toggle2d && view3d && view2d) {
			toggle3d.addEventListener('click', () => {
				toggle3d.classList.add('active');
				toggle2d.classList.remove('active');
				view3d.style.display = 'block';
				view2d.style.display = 'none';
				onWindowResize();
			});

			toggle2d.addEventListener('click', () => {
				toggle2d.classList.add('active');
				toggle3d.classList.remove('active');
				view2d.style.display = 'block';
				view3d.style.display = 'none';
			});
		}
	}

	function init3DViewport() {
		container = document.getElementById('fleet-3d-wrapper');
		canvas = document.getElementById('fleet-3d-canvas');
		if (!container || !canvas || typeof THREE === 'undefined') return;

		// 1. Scene setup
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x090d16);
		scene.fog = new THREE.FogExp2(0x090d16, 0.014);

		// 2. Camera setup
		const width = container.clientWidth || 900;
		const height = container.clientHeight || 560;
		camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 200);
		camera.position.set(0, 16, 26);

		// 3. Renderer setup
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			powerPreference: 'high-performance'
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.05;

		// 4. OrbitControls
		if (typeof THREE.OrbitControls !== 'undefined') {
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.dampingFactor = 0.05;
			controls.target.set(0, 7.5, 0);
			controls.minDistance = 5;
			controls.maxDistance = 50;
			controls.maxPolarAngle = Math.PI / 2 + 0.04;
		}

		// 5. Lighting
		setupLighting();

		// 6. Geometry construction
		buildEnvironment();
		buildFreestandingRack();
		buildShelf1Hardware();
		buildShelf2Hardware();
		buildShelf3Hardware();
		buildWallLedgeHardware();
		buildCablesAndInterconnects();

		// 7. Event Listeners
		setupInteractivity();

		// 8. Animation Loop
		animate(0);

		// 9. Resize Handling
		const ro = new ResizeObserver(() => onWindowResize());
		ro.observe(container);
	}

	function setupLighting() {
		const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x0f172a, 0.7);
		scene.add(hemiLight);

		const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
		dirLight.position.set(12, 28, 18);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		scene.add(dirLight);

		const fillLight = new THREE.PointLight(0x38bdf8, 0.5, 30);
		fillLight.position.set(-8, 12, 10);
		scene.add(fillLight);

		// Dynamic NeoPixel Light above NUC
		neoPixelLight = new THREE.PointLight(0xa855f7, 1.3, 8);
		neoPixelLight.position.set(5.5, 15.8, -1.2);
		scene.add(neoPixelLight);

		// Ethernet green activity link light
		const ethLight = new THREE.PointLight(0x22c55e, 0.6, 4);
		ethLight.position.set(2.2, 2.2, 0.5);
		scene.add(ethLight);
	}

	function buildEnvironment() {
		// Floor
		const floorGeo = new THREE.PlaneGeometry(60, 45);
		const floorMat = new THREE.MeshStandardMaterial({
			color: 0x0f172a,
			roughness: 0.85,
			metalness: 0.15
		});
		const floor = new THREE.Mesh(floorGeo, floorMat);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = 0;
		floor.receiveShadow = true;
		scene.add(floor);

		// Floor grid
		const grid = new THREE.GridHelper(50, 50, 0x1e293b, 0x0b1329);
		grid.position.y = 0.01;
		scene.add(grid);

		// Back Wall
		const wallGeo = new THREE.PlaneGeometry(60, 32);
		const wallMat = new THREE.MeshStandardMaterial({
			color: 0xf1f5f9,
			roughness: 0.95,
			metalness: 0.05
		});
		const wall = new THREE.Mesh(wallGeo, wallMat);
		wall.position.set(0, 16, -4.8);
		wall.receiveShadow = true;
		scene.add(wall);

		// Built-in Architectural Wall Ledge (Stepping down ~3.5" below top shelf)
		const ledgeGeo = new THREE.BoxGeometry(34, 0.8, 3.8);
		const ledgeMat = new THREE.MeshStandardMaterial({
			color: 0xe2e8f0,
			roughness: 0.6,
			metalness: 0.1
		});
		const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
		ledge.position.set(0, 9.3, -3.2);
		ledge.receiveShadow = true;
		ledge.castShadow = true;
		scene.add(ledge);

		// Molding lip
		const lipGeo = new THREE.BoxGeometry(34.2, 0.3, 0.4);
		const lipMat = new THREE.MeshStandardMaterial({ color: 0xcfd9e5, roughness: 0.5 });
		const lip = new THREE.Mesh(lipGeo, lipMat);
		lip.position.set(0, 9.7, -1.3);
		scene.add(lip);
	}

	function buildFreestandingRack() {
		const woodMat = new THREE.MeshStandardMaterial({
			color: 0xdcb68a,
			roughness: 0.75,
			metalness: 0.08
		});

		const rackGroup = new THREE.Group();

		// 4 Uprights
		const postGeo = new THREE.BoxGeometry(0.8, 16.5, 0.8);
		const postPositions = [
			[-10.2, 8.25, -2.6],
			[-10.2, 8.25, 2.6],
			[10.2, 8.25, -2.6],
			[10.2, 8.25, 2.6]
		];
		postPositions.forEach(pos => {
			const post = new THREE.Mesh(postGeo, woodMat);
			post.position.set(...pos);
			post.castShadow = true;
			post.receiveShadow = true;
			rackGroup.add(post);
		});

		// 3 Shelves
		const shelfGeo = new THREE.BoxGeometry(21.2, 0.55, 6.0);
		[1.6, 7.4, 12.8].forEach(y => {
			const shelf = new THREE.Mesh(shelfGeo, woodMat);
			shelf.position.set(0, y, 0);
			shelf.receiveShadow = true;
			shelf.castShadow = true;
			rackGroup.add(shelf);
		});

		// Side crossbars
		const crossGeo = new THREE.BoxGeometry(0.6, 0.4, 5.8);
		[-10.2, 10.2].forEach(x => {
			[1.6, 7.4, 12.8].forEach(y => {
				const cross = new THREE.Mesh(crossGeo, woodMat);
				cross.position.set(x, y - 0.4, 0);
				rackGroup.add(cross);
			});
		});

		scene.add(rackGroup);
	}

	// Helper to add clean wireframe bounding outlines and register interactive targets
	function addBoundingOutline(mesh, colorHex = 0x38bdf8) {
		const edges = new THREE.EdgesGeometry(mesh.geometry);
		const line = new THREE.LineSegments(
			edges,
			new THREE.LineBasicMaterial({ color: colorHex, linewidth: 1.5, transparent: true, opacity: 0.65 })
		);
		mesh.add(line);
		mesh.userData.outlineLine = line;
		return line;
	}

	function registerNode(mesh, nodeId, label, subpart = null) {
		mesh.userData.nodeId = nodeId;
		mesh.userData.label = label;
		mesh.userData.subpart = subpart;
		mesh.userData.originalColor = mesh.material ? mesh.material.color.getHex() : null;
		interactiveNodes.push(mesh);
		addBoundingOutline(mesh, 0x38bdf8);
	}

	function buildShelf1Hardware() {
		// --- Shelf 1 (Top Shelf, y = 12.8) ---

		// 1. FREEHPGAMER from Fishbeck (Silver HP Workstation on wire mesh riser)
		const hpGroup = new THREE.Group();
		const riserGeo = new THREE.BoxGeometry(7.0, 0.6, 5.2);
		const riserMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
		const riser = new THREE.Mesh(riserGeo, riserMat);
		riser.position.set(-5.0, 13.38, 0.2);
		riser.castShadow = true;
		hpGroup.add(riser);

		const baseGeo = new THREE.BoxGeometry(6.6, 0.28, 4.6);
		const silverMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 0.7, roughness: 0.3 });
		const base = new THREE.Mesh(baseGeo, silverMat);
		base.position.set(-5.0, 13.82, 0.2);
		base.castShadow = true;
		hpGroup.add(base);

		const screenGeo = new THREE.BoxGeometry(6.6, 4.4, 0.18);
		const screen = new THREE.Mesh(screenGeo, silverMat);
		screen.position.set(-5.0, 15.8, -2.0);
		screen.rotation.x = 0.25;
		screen.castShadow = true;
		hpGroup.add(screen);

		const displayGeo = new THREE.PlaneGeometry(6.1, 3.8);
		const displayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
		const display = new THREE.Mesh(displayGeo, displayMat);
		display.position.set(-5.0, 15.8, -1.89);
		display.rotation.x = 0.25;
		hpGroup.add(display);

		registerNode(base, 'winws', 'FREEHPGAMER from Fishbeck (Windows 11 Workstation)');
		scene.add(hpGroup);

		// 2. ONEFIVE Network Storage (Sabrent USB 3.0 SATA Enclosure)
		const sabrentGeo = new THREE.BoxGeometry(2.4, 0.7, 4.4);
		const sabrentMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });
		const sabrent = new THREE.Mesh(sabrentGeo, sabrentMat);
		sabrent.position.set(1.5, 13.43, 0.8);
		sabrent.castShadow = true;
		sabrent.receiveShadow = true;

		const ledGeo = new THREE.BoxGeometry(0.3, 0.08, 0.3);
		const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
		const led = new THREE.Mesh(ledGeo, ledMat);
		led.position.set(0, 0.38, 2.0);
		sabrent.add(led);
		registerNode(sabrent, 'onefive', 'ONEFIVE Network Storage (Sabrent USB 3.0)');
		scene.add(sabrent);

		// 3. Modular Snap-Cube Frame + Intel NUC + Adafruit Bluefruit
		const modularTower = new THREE.Group();
		const cubeColors = [0x0284c7, 0x16a34a, 0xeab308, 0xd97706];
		const cubeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
		const cubePositions = [
			[4.8, 13.5, -2.0, 0], [6.2, 13.5, -2.0, 1], [4.8, 13.5, -0.4, 2], [6.2, 13.5, -0.4, 3],
			[4.8, 14.35, -2.0, 1], [6.2, 14.35, -2.0, 0], [4.8, 14.35, -0.4, 3], [6.2, 14.35, -0.4, 2],
			[4.8, 15.2, -1.2, 0], [6.2, 15.2, -1.2, 1]
		];
		cubePositions.forEach(([x, y, z, cIdx]) => {
			const cMat = new THREE.MeshStandardMaterial({ color: cubeColors[cIdx], roughness: 0.5 });
			const cMesh = new THREE.Mesh(cubeGeo, cMat);
			cMesh.position.set(x, y, z);
			cMesh.castShadow = true;
			modularTower.add(cMesh);
		});

		// Intel NUC
		const nucGeo = new THREE.BoxGeometry(3.2, 1.2, 3.2);
		const nucMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });
		const nuc = new THREE.Mesh(nucGeo, nucMat);
		nuc.position.set(5.5, 13.68, -1.2);
		nuc.castShadow = true;
		nuc.receiveShadow = true;

		const nucTopGeo = new THREE.BoxGeometry(3.0, 0.1, 3.0);
		const nucTopMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
		const nucTop = new THREE.Mesh(nucTopGeo, nucTopMat);
		nucTop.position.set(0, 0.62, 0);
		nuc.add(nucTop);
		registerNode(nuc, 'nuc', 'Headless Intel NUC LAN Backbone (Alpine Linux)');
		scene.add(nuc);

		// Adafruit Circuit Playground Bluefruit
		const pcbGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.12, 24);
		const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
		const bluefruit = new THREE.Mesh(pcbGeo, pcbMat);
		bluefruit.position.set(5.5, 15.8, -1.2);
		bluefruit.castShadow = true;

		for (let i = 0; i < 10; i++) {
			const angle = (i / 10) * Math.PI * 2;
			const r = 0.92;
			const ledPart = new THREE.Mesh(
				new THREE.BoxGeometry(0.18, 0.1, 0.18),
				new THREE.MeshBasicMaterial({ color: 0xa855f7 })
			);
			ledPart.position.set(Math.cos(angle) * r, 0.08, Math.sin(angle) * r);
			bluefruit.add(ledPart);
			neoPixelMeshes.push(ledPart);
		}
		registerNode(bluefruit, 'bluefruit', 'Adafruit Circuit Playground Bluefruit (Nordic nRF52840)');
		scene.add(bluefruit);

		scene.add(modularTower);
	}

	function buildShelf2Hardware() {
		// --- Shelf 2 (Middle Shelf, y = 7.4) ---

		// 1. HP Laptop 15 Workhorse (Black chassis, Linux Mint 21)
		const hp15Group = new THREE.Group();
		const hp15BaseGeo = new THREE.BoxGeometry(6.4, 0.28, 4.4);
		const hp15Mat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
		const hp15Base = new THREE.Mesh(hp15BaseGeo, hp15Mat);
		hp15Base.position.set(-5.2, 7.69, 0.2);
		hp15Base.castShadow = true;
		hp15Group.add(hp15Base);

		const hp15ScreenGeo = new THREE.BoxGeometry(6.4, 4.2, 0.18);
		const hp15Screen = new THREE.Mesh(hp15ScreenGeo, hp15Mat);
		hp15Screen.position.set(-5.2, 9.6, -1.9);
		hp15Screen.rotation.x = 0.25;
		hp15Screen.castShadow = true;
		hp15Group.add(hp15Screen);

		const hp15DispGeo = new THREE.PlaneGeometry(5.9, 3.6);
		const hp15DispMat = new THREE.MeshBasicMaterial({ color: 0x15803d });
		const hp15Disp = new THREE.Mesh(hp15DispGeo, hp15DispMat);
		hp15Disp.position.set(-5.2, 9.6, -1.79);
		hp15Disp.rotation.x = 0.25;
		hp15Group.add(hp15Disp);
		registerNode(hp15Base, 'hp15', 'HP Laptop 15 Workhorse (Linux Mint 21)');
		scene.add(hp15Group);

		// 2. HOMEDELL 2 (Dell Inspiron Desktop, placed horizontally)
		const dellGeo = new THREE.BoxGeometry(7.2, 2.6, 6.2);
		const dellMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.35, metalness: 0.4 });
		const dell = new THREE.Mesh(dellGeo, dellMat);
		dell.position.set(2.2, 8.98, 0.2);
		dell.castShadow = true;
		dell.receiveShadow = true;

		const chromeGeo = new THREE.BoxGeometry(7.22, 0.08, 0.1);
		const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.1 });
		const chrome = new THREE.Mesh(chromeGeo, chromeMat);
		chrome.position.set(0, 0.4, 3.12);
		dell.add(chrome);

		// Front silver Slax USB stick inserted into front port
		const usbGeo = new THREE.BoxGeometry(0.35, 0.18, 1.2);
		const usbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
		const usb = new THREE.Mesh(usbGeo, usbMat);
		usb.position.set(2.0, -0.6, 3.6);
		dell.add(usb);
		registerNode(dell, 'dell', 'HOMEDELL 2 (Dell Inspiron · Slax Live USB in RAM)');
		scene.add(dell);

		// 3. Navy Blue USB-C Multiport Hub with Dual 2.4 GHz Receivers (ON TOP OF DELL)
		const hubGroup = new THREE.Group();
		const hubGeo = new THREE.BoxGeometry(1.4, 0.35, 3.4);
		const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 });
		const hub = new THREE.Mesh(hubGeo, navyMat);
		hub.position.set(3.5, 10.45, 0.6);
		hub.castShadow = true;
		hubGroup.add(hub);

		const dongleGeo = new THREE.BoxGeometry(0.5, 0.2, 0.4);
		const dongleMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
		const dongle1 = new THREE.Mesh(dongleGeo, dongleMat);
		dongle1.position.set(4.35, 10.45, 0.0);
		const dongle2 = new THREE.Mesh(dongleGeo, dongleMat);
		dongle2.position.set(4.35, 10.45, 1.1);
		hubGroup.add(dongle1);
		hubGroup.add(dongle2);
		registerNode(hub, 'dell', 'Navy Blue USB-C Hub with Dual RF Receivers (Dell Input)');
		scene.add(hubGroup);

		// 4. 3.5" USB Floppy Drive Reader + CD Spindle
		const floppyGeo = new THREE.BoxGeometry(2.4, 0.65, 3.2);
		const floppyMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 });
		const floppy = new THREE.Mesh(floppyGeo, floppyMat);
		floppy.position.set(7.8, 7.97, 0.5);
		floppy.castShadow = true;
		registerNode(floppy, 'floppy', '3.5" USB Floppy Drive Reader & Optical Media Hub');
		scene.add(floppy);

		const cdGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.4, 20);
		const cdMat = new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.9, roughness: 0.2 });
		const cds = new THREE.Mesh(cdGeo, cdMat);
		cds.position.set(7.8, 7.9, -1.8);
		cds.castShadow = true;
		scene.add(cds);
	}

	function buildShelf3Hardware() {
		// --- Shelf 3 (Bottom Shelf, y = 1.6) ---

		// 1. Mid-2011 MacBook Pro (A1278) - Battery Removed & Gigabit Ethernet
		const macGroup = new THREE.Group();
		const macBaseGeo = new THREE.BoxGeometry(6.2, 0.35, 4.4);
		const macMat = new THREE.MeshStandardMaterial({ color: 0xcfd9e5, metalness: 0.8, roughness: 0.25 });
		const macBase = new THREE.Mesh(macBaseGeo, macMat);
		macBase.position.set(3.8, 1.95, 0.4);
		macBase.castShadow = true;
		macGroup.add(macBase);

		// Hollow battery bay under trackpad
		const bayGeo = new THREE.BoxGeometry(3.6, 0.15, 1.8);
		const bayMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
		const bay = new THREE.Mesh(bayGeo, bayMat);
		bay.position.set(3.8, 2.12, 1.5);
		macGroup.add(bay);

		const macDispGeo = new THREE.BoxGeometry(6.2, 4.0, 0.2);
		const macDisp = new THREE.Mesh(macDispGeo, macMat);
		macDisp.position.set(3.8, 3.85, -1.6);
		macDisp.rotation.x = 0.2;
		macDisp.castShadow = true;
		macGroup.add(macDisp);

		const macScreen = new THREE.Mesh(
			new THREE.PlaneGeometry(5.7, 3.5),
			new THREE.MeshBasicMaterial({ color: 0x991b1b })
		);
		macScreen.position.set(3.8, 3.85, -1.49);
		macScreen.rotation.x = 0.2;
		macGroup.add(macScreen);
		registerNode(macBase, 'mbp2011', 'Mid-2011 MacBook Pro (Debian 12 · Battery Removed)');
		scene.add(macGroup);

		// 2. Lenovo Yoga 2 11 Bare-Board Rig in Modular Snap-Cubes
		const yogaGroup = new THREE.Group();
		const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
		const cradleColors = [0x16a34a, 0x0284c7, 0xdc2626, 0xfacc15];
		const cradlePos = [
			[-4.8, 2.1, -0.6, 0], [-3.2, 2.1, -0.6, 1], [-4.8, 2.1, 0.6, 2], [-3.2, 2.1, 0.6, 3],
			[-4.8, 2.9, -0.6, 1], [-3.2, 2.9, -0.6, 0], [-4.8, 2.9, 0.6, 3], [-3.2, 2.9, 0.6, 2],
			[-4.8, 3.7, 0.0, 0], [-3.2, 3.7, 0.0, 1]
		];
		cradlePos.forEach(([x, y, z, cIdx]) => {
			const cMesh = new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial({ color: cradleColors[cIdx] }));
			cMesh.position.set(x, y, z);
			cMesh.castShadow = true;
			yogaGroup.add(cMesh);
		});

		const pcbGeo = new THREE.BoxGeometry(3.6, 2.8, 0.12);
		const pcbMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4, metalness: 0.3 });
		const pcb = new THREE.Mesh(pcbGeo, pcbMat);
		pcb.position.set(-4.0, 3.4, 0.0);
		pcb.castShadow = true;
		yogaGroup.add(pcb);

		const hsGeo = new THREE.BoxGeometry(1.6, 1.2, 0.4);
		const hsMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.2 });
		const hs = new THREE.Mesh(hsGeo, hsMat);
		hs.position.set(-4.0, 3.4, 0.26);
		yogaGroup.add(hs);
		registerNode(pcb, 'yoga', 'Lenovo Yoga 2 11 Bare-Board Rig (Puffed Battery Removed)');
		scene.add(yogaGroup);

		// 3. 5V USB Blower Cooling Fan
		const fanGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.2, 20);
		const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
		const fan = new THREE.Mesh(fanGeo, fanMat);
		fan.rotation.x = Math.PI / 2;
		fan.position.set(-1.4, 2.4, 0.2);
		fan.castShadow = true;
		fanBladesMesh = fan;
		registerNode(fan, 'usbfan', '5V USB Blower Fan (Active Yoga Cooling, Mac Powered)');
		scene.add(fan);

		// 4. Samsung Galaxy S4 Mini (SCH-I435)
		const s4 = new THREE.Mesh(
			new THREE.BoxGeometry(1.8, 3.2, 0.25),
			new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
		);
		s4.position.set(-7.5, 2.6, 0.6);
		s4.rotation.z = -0.15;
		s4.rotation.y = 0.35;
		s4.castShadow = true;

		const s4Screen = new THREE.Mesh(
			new THREE.PlaneGeometry(1.5, 2.6),
			new THREE.MeshBasicMaterial({ color: 0x22c55e })
		);
		s4Screen.position.set(0, 0, 0.13);
		s4.add(s4Screen);
		registerNode(s4, 's4mini', 'Samsung Galaxy S4 Mini (SCH-I435 · Tethered to 2011 Mac)');
		scene.add(s4);
	}

	function buildWallLedgeHardware() {
		// --- Built-in Wall Ledge (y = 9.3, z = -3.2) ---

		// 1. efluky Desktop USB Fan
		const efBase = new THREE.Mesh(
			new THREE.CylinderGeometry(1.2, 1.4, 0.5, 20),
			new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
		);
		efBase.position.set(-10.5, 9.8, -3.2);
		scene.add(efBase);

		const efRing = new THREE.Mesh(
			new THREE.TorusGeometry(1.4, 0.22, 16, 24),
			new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
		);
		efRing.position.set(-10.5, 11.5, -3.2);
		scene.add(efRing);

		// 2. Samsung Galaxy Player (YP-GI1) in retro cream cradle
		const dock = new THREE.Mesh(
			new THREE.BoxGeometry(2.2, 1.0, 2.4),
			new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 })
		);
		dock.position.set(-6.8, 9.9, -3.2);
		scene.add(dock);

		const ypgiPhone = new THREE.Mesh(
			new THREE.BoxGeometry(1.6, 2.8, 0.22),
			new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
		);
		ypgiPhone.position.set(-6.8, 11.0, -3.2);
		ypgiPhone.rotation.x = -0.2;
		const ypgiScreen = new THREE.Mesh(
			new THREE.PlaneGeometry(1.3, 2.3),
			new THREE.MeshBasicMaterial({ color: 0x059669 })
		);
		ypgiScreen.position.set(0, 0, 0.12);
		ypgiPhone.add(ypgiScreen);
		registerNode(ypgiPhone, 'ypgi1', 'Samsung Galaxy Player (YP-GI1 · Wall AC Powered)');
		scene.add(ypgiPhone);

		// 3. Black Smartphone Gaming Controller Clamp
		const ctrl = new THREE.Mesh(
			new THREE.BoxGeometry(3.6, 0.8, 1.8),
			new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
		);
		ctrl.position.set(-3.2, 9.8, -3.2);
		scene.add(ctrl);

		// 4. Apple iPod Touch
		const ipod = new THREE.Mesh(
			new THREE.BoxGeometry(1.5, 2.8, 0.18),
			new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 })
		);
		ipod.position.set(0.6, 9.85, -3.2);
		ipod.rotation.x = -Math.PI / 2;
		const ipodScreen = new THREE.Mesh(
			new THREE.PlaneGeometry(1.3, 2.4),
			new THREE.MeshBasicMaterial({ color: 0x2563eb })
		);
		ipodScreen.position.set(0, 0, 0.1);
		ipod.add(ipodScreen);
		registerNode(ipod, 'ipodtouch', 'Apple iPod Touch Miner (WebKit JavaScript Mining)');
		scene.add(ipod);
	}

	function buildCablesAndInterconnects() {
		const yellowCableMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
		const blackCableMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

		// USB power from 2011 Mac to 5V Cooling Fan
		const fanCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(1.2, 2.0, 0.5),
			new THREE.Vector3(0.0, 1.8, 0.4),
			new THREE.Vector3(-1.0, 2.1, 0.3)
		]);
		const fanTube = new THREE.Mesh(new THREE.TubeGeometry(fanCurve, 20, 0.08, 8, false), blackCableMat);
		scene.add(fanTube);

		// Micro-USB host from 2011 Mac to Samsung S4 Mini
		const s4Curve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(1.2, 2.0, 0.4),
			new THREE.Vector3(-2.0, 1.7, 0.6),
			new THREE.Vector3(-6.5, 2.0, 0.6)
		]);
		const s4Tube = new THREE.Mesh(new THREE.TubeGeometry(s4Curve, 25, 0.07, 8, false), blackCableMat);
		scene.add(s4Tube);

		// Cat6 Yellow Ethernet from NUC
		const nucEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(5.5, 13.5, -2.6),
			new THREE.Vector3(6.5, 9.0, -3.2),
			new THREE.Vector3(6.0, 2.0, -3.0)
		]);
		const nucTube = new THREE.Mesh(new THREE.TubeGeometry(nucEthCurve, 30, 0.1, 8, false), yellowCableMat);
		scene.add(nucTube);
	}

	function setupInteractivity() {
		canvas.addEventListener('mousemove', onPointerMove);
		canvas.addEventListener('click', onPointerClick);
		canvas.addEventListener('dblclick', onPointerDoubleClick);
		canvas.addEventListener('touchstart', onTouchStart, { passive: true });

		document.querySelectorAll('.camera-preset-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const preset = btn.getAttribute('data-preset');
				if (CAMERA_PRESETS[preset]) {
					animateCamera(CAMERA_PRESETS[preset].pos, CAMERA_PRESETS[preset].target);
				}
			});
		});

		const resetBtn = document.getElementById('reset-3d-camera-btn');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => {
				animateCamera(CAMERA_PRESETS['perspective'].pos, CAMERA_PRESETS['perspective'].target);
			});
		}
	}

	function getIntersectedNode(event) {
		const rect = canvas.getBoundingClientRect();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(interactiveNodes, true);

		if (intersects.length > 0) {
			let topMesh = intersects[0].object;
			while (topMesh.parent && !topMesh.userData.nodeId && topMesh.parent !== scene) {
				topMesh = topMesh.parent;
			}
			if (topMesh.userData.nodeId) {
				return topMesh;
			}
		}
		return null;
	}

	function onPointerMove(event) {
		const target = getIntersectedNode(event);
		if (target) {
			canvas.style.cursor = 'pointer';
			highlightNode(target);
		} else {
			canvas.style.cursor = 'grab';
			unhighlightNode();
		}
	}

	function onPointerClick(event) {
		const target = getIntersectedNode(event);
		if (target) {
			const nodeId = target.userData.nodeId;
			if (nodeId && typeof window.selectNode === 'function') {
				window.selectNode(nodeId);
				selectedMesh = target;
			}
		}
	}

	function onPointerDoubleClick(event) {
		const target = getIntersectedNode(event);
		if (target) {
			const pos = new THREE.Vector3();
			target.getWorldPosition(pos);
			animateCamera([pos.x + 3.5, pos.y + 2.5, pos.z + 5.5], [pos.x, pos.y, pos.z]);
		}
	}

	function onTouchStart(event) {
		if (event.touches.length === 1) {
			const target = getIntersectedNode(event.touches[0]);
			if (target) {
				const nodeId = target.userData.nodeId;
				if (nodeId && typeof window.selectNode === 'function') {
					window.selectNode(nodeId);
				}
			}
		}
	}

	function highlightNode(mesh) {
		if (hoveredMesh === mesh) return;
		unhighlightNode();
		hoveredMesh = mesh;
		if (hoveredMesh.userData.outlineLine) {
			hoveredMesh.userData.outlineLine.material.color.setHex(0x38bdf8);
			hoveredMesh.userData.outlineLine.material.opacity = 1.0;
		}
	}

	function unhighlightNode() {
		if (hoveredMesh) {
			if (hoveredMesh.userData.outlineLine) {
				hoveredMesh.userData.outlineLine.material.color.setHex(0x38bdf8);
				hoveredMesh.userData.outlineLine.material.opacity = 0.65;
			}
			hoveredMesh = null;
		}
	}

	function animateCamera(targetPos, targetLookAt) {
		if (!controls) return;
		const startPos = camera.position.clone();
		const startTarget = controls.target.clone();
		const destPos = new THREE.Vector3(...targetPos);
		const destTarget = new THREE.Vector3(...targetLookAt);

		let progress = 0;
		function step() {
			progress += 0.045;
			if (progress <= 1) {
				camera.position.lerpVectors(startPos, destPos, progress);
				controls.target.lerpVectors(startTarget, destTarget, progress);
				controls.update();
				requestAnimationFrame(step);
			} else {
				camera.position.copy(destPos);
				controls.target.copy(destTarget);
				controls.update();
			}
		}
		step();
	}

	function onWindowResize() {
		if (!container || !camera || !renderer) return;
		const width = container.clientWidth || 900;
		const height = container.clientHeight || 560;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	function animate(time) {
		animFrameId = requestAnimationFrame(animate);

		// Dynamic NeoPixel rotating colors
		if (neoPixelLight && neoPixelMeshes.length > 0) {
			const t = time * 0.002;
			neoPixelMeshes.forEach((led, idx) => {
				const hue = (idx / 10 + t) % 1.0;
				led.material.color.setHSL(hue, 0.9, 0.6);
			});
			const mainHue = (t) % 1.0;
			neoPixelLight.color.setHSL(mainHue, 0.8, 0.5);
		}

		if (controls) controls.update();
		renderer.render(scene, camera);
	}
})();
