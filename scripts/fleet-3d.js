/* Interactive 3D Digital-Twin & Photogrammetry-Ready Homelab Fleet Viewport
 * Built with Three.js (r128) & OrbitControls
 * Author: Andrew Van Ek & Antigravity AI
 * Models physical volumes, wireframe bounding outlines, 3D cabling, and sub-component inspection
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
	let animFrameId = null;
	let isDragging = false;

	const CAMERA_PRESETS = {
		'perspective': { pos: [0, 15, 25], target: [0, 7.5, 0] },
		'shelf1': { pos: [-1.5, 15.0, 10.5], target: [0, 13.5, 0] },
		'shelf2': { pos: [1.5, 9.5, 10.5], target: [1, 8.0, 0] },
		'shelf3': { pos: [0, 4.0, 10.0], target: [0, 2.4, 0] },
		'wall': { pos: [-3.5, 12.5, 6.0], target: [-4.0, 9.8, -3.2] }
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

		// 2. Camera setup - height is 420px on desktop, 340px on mobile
		const width = container.clientWidth || 900;
		const height = container.clientHeight || 420;
		camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 200);
		camera.position.set(0, 15, 25);

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

			controls.addEventListener('start', () => {
				isDragging = true;
				canvas.style.cursor = 'grabbing';
			});
			controls.addEventListener('end', () => {
				isDragging = false;
				canvas.style.cursor = 'grab';
			});
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
		neoPixelLight.position.set(5.5, 15.8, -0.8);
		scene.add(neoPixelLight);

		// Ethernet green activity link light
		const ethLight = new THREE.PointLight(0x22c55e, 0.6, 5);
		ethLight.position.set(7.8, 7.8, 0.5);
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

		// Upper Wall (above ledge y >= 9.3 at z = -4.8)
		const upperWallGeo = new THREE.PlaneGeometry(60, 20);
		const wallMat = new THREE.MeshStandardMaterial({
			color: 0xf1f5f9,
			roughness: 0.95,
			metalness: 0.05
		});
		const upperWall = new THREE.Mesh(upperWallGeo, wallMat);
		upperWall.position.set(0, 19.3, -4.8);
		upperWall.receiveShadow = true;
		scene.add(upperWall);

		// Built-in Architectural Wall Ledge (at y = 9.3, extends forward to z = -2.8)
		// Depth = 2.0 (from z = -4.8 to z = -2.8), centered at z = -3.8
		const ledgeGeo = new THREE.BoxGeometry(34, 0.6, 2.0);
		const ledgeMat = new THREE.MeshStandardMaterial({
			color: 0xe2e8f0,
			roughness: 0.6,
			metalness: 0.1
		});
		const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
		ledge.position.set(0, 9.0, -3.8); // top surface is at y = 9.3
		ledge.receiveShadow = true;
		ledge.castShadow = true;
		scene.add(ledge);

		// Ledge decorative molding lip along front face at z = -2.8
		const lipGeo = new THREE.BoxGeometry(34.2, 0.35, 0.3);
		const lipMat = new THREE.MeshStandardMaterial({ color: 0xcfd9e5, roughness: 0.5 });
		const lip = new THREE.Mesh(lipGeo, lipMat);
		lip.position.set(0, 9.15, -2.7);
		scene.add(lip);

		// Lower Wall (BELOW ledge: y < 9.3 juts out / fills in flush underneath the ledge front!)
		// Extends from y = 0 to y = 8.7, front face flush at z = -2.8 (centered at z = -3.8, depth 2.0)
		const lowerWallGeo = new THREE.BoxGeometry(34, 8.7, 2.0);
		const lowerWallMat = new THREE.MeshStandardMaterial({
			color: 0xe8eef5,
			roughness: 0.9,
			metalness: 0.05
		});
		const lowerWall = new THREE.Mesh(lowerWallGeo, lowerWallMat);
		lowerWall.position.set(0, 4.35, -3.8);
		lowerWall.receiveShadow = true;
		scene.add(lowerWall);
	}

	function buildFreestandingRack() {
		const woodMat = new THREE.MeshStandardMaterial({
			color: 0xdcb68a,
			roughness: 0.75,
			metalness: 0.08
		});

		const rackGroup = new THREE.Group();

		// 4 Upright Posts:
		// The jutted wall below the ledge has its front surface at z = -2.8.
		// Rear posts sit at z = -2.2 (strictly IN FRONT of the ledge with 0.6 units clearance!).
		// Front posts sit at z = +2.8.
		const postGeo = new THREE.BoxGeometry(0.8, 16.5, 0.8);
		const postPositions = [
			[-10.2, 8.25, -2.2],
			[-10.2, 8.25, 2.8],
			[10.2, 8.25, -2.2],
			[10.2, 8.25, 2.8]
		];
		postPositions.forEach(pos => {
			const post = new THREE.Mesh(postGeo, woodMat);
			post.position.set(...pos);
			post.castShadow = true;
			post.receiveShadow = true;
			rackGroup.add(post);
		});

		// 3 Shelves (width 21.2, height 0.55, depth 5.4, centered at z = 0.3 -> span z = -2.4 to +3.0)
		// Rear edge at z = -2.4 is completely clear of the wall front face at z = -2.8!
		const shelfGeo = new THREE.BoxGeometry(21.2, 0.55, 5.4);
		[1.6, 7.4, 12.8].forEach(y => {
			const shelf = new THREE.Mesh(shelfGeo, woodMat);
			shelf.position.set(0, y, 0.3);
			shelf.receiveShadow = true;
			shelf.castShadow = true;
			rackGroup.add(shelf);
		});

		// Side crossbars connecting front and rear posts
		const crossGeo = new THREE.BoxGeometry(0.6, 0.4, 5.0);
		[-10.2, 10.2].forEach(x => {
			[1.6, 7.4, 12.8].forEach(y => {
				const cross = new THREE.Mesh(crossGeo, woodMat);
				cross.position.set(x, y - 0.4, 0.3);
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
		const riserGeo = new THREE.BoxGeometry(7.0, 0.6, 5.0);
		const riserMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
		const riser = new THREE.Mesh(riserGeo, riserMat);
		riser.position.set(-5.0, 13.38, 0.3);
		riser.castShadow = true;
		hpGroup.add(riser);

		const baseGeo = new THREE.BoxGeometry(6.6, 0.28, 4.4);
		const silverMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 0.7, roughness: 0.3 });
		const base = new THREE.Mesh(baseGeo, silverMat);
		base.position.set(-5.0, 13.82, 0.3);
		base.castShadow = true;
		hpGroup.add(base);

		const screenGeo = new THREE.BoxGeometry(6.6, 4.4, 0.18);
		const screen = new THREE.Mesh(screenGeo, silverMat);
		screen.position.set(-5.0, 15.8, -1.8);
		screen.rotation.x = 0.25;
		screen.castShadow = true;
		hpGroup.add(screen);

		const displayGeo = new THREE.PlaneGeometry(6.1, 3.8);
		const displayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
		const display = new THREE.Mesh(displayGeo, displayMat);
		display.position.set(-5.0, 15.8, -1.69);
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
			[4.8, 13.5, -1.6, 0], [6.2, 13.5, -1.6, 1], [4.8, 13.5, 0.0, 2], [6.2, 13.5, 0.0, 3],
			[4.8, 14.35, -1.6, 1], [6.2, 14.35, -1.6, 0], [4.8, 14.35, 0.0, 3], [6.2, 14.35, 0.0, 2],
			[4.8, 15.2, -0.8, 0], [6.2, 15.2, -0.8, 1]
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
		nuc.position.set(5.5, 13.68, -0.8);
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
		bluefruit.position.set(5.5, 15.8, -0.8);
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
		hp15Base.position.set(-5.2, 7.69, 0.3);
		hp15Base.castShadow = true;
		hp15Group.add(hp15Base);

		const hp15ScreenGeo = new THREE.BoxGeometry(6.4, 4.2, 0.18);
		const hp15Screen = new THREE.Mesh(hp15ScreenGeo, hp15Mat);
		hp15Screen.position.set(-5.2, 9.6, -1.8);
		hp15Screen.rotation.x = 0.25;
		hp15Screen.castShadow = true;
		hp15Group.add(hp15Screen);

		const hp15DispGeo = new THREE.PlaneGeometry(5.9, 3.6);
		const hp15DispMat = new THREE.MeshBasicMaterial({ color: 0x15803d });
		const hp15Disp = new THREE.Mesh(hp15DispGeo, hp15DispMat);
		hp15Disp.position.set(-5.2, 9.6, -1.69);
		hp15Disp.rotation.x = 0.25;
		hp15Group.add(hp15Disp);
		registerNode(hp15Base, 'hp15', 'HP Laptop 15 Workhorse (Linux Mint 21)');
		scene.add(hp15Group);

		// 2. HOMEDELL 2 (Dell Inspiron Desktop, placed horizontally)
		const dellGeo = new THREE.BoxGeometry(7.2, 2.6, 5.4);
		const dellMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.35, metalness: 0.4 });
		const dell = new THREE.Mesh(dellGeo, dellMat);
		dell.position.set(2.2, 8.98, 0.3);
		dell.castShadow = true;
		dell.receiveShadow = true;

		const chromeGeo = new THREE.BoxGeometry(7.22, 0.08, 0.1);
		const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.1 });
		const chrome = new THREE.Mesh(chromeGeo, chromeMat);
		chrome.position.set(0, 0.4, 2.72);
		dell.add(chrome);

		// Front silver Slax USB stick inserted into front port
		const usbGeo = new THREE.BoxGeometry(0.35, 0.18, 1.2);
		const usbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
		const usb = new THREE.Mesh(usbGeo, usbMat);
		usb.position.set(2.0, -0.6, 3.2);
		dell.add(usb);
		registerNode(dell, 'dell', 'HOMEDELL 2 (Dell Inspiron · Slax Live USB in RAM)');
		scene.add(dell);

		// 3. Navy Blue USB-C Multiport Hub with Dual 2.4 GHz Receivers (ON TOP OF DELL)
		const hubGroup = new THREE.Group();
		const hubGeo = new THREE.BoxGeometry(1.4, 0.35, 3.2);
		const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 });
		const hub = new THREE.Mesh(hubGeo, navyMat);
		hub.position.set(3.6, 10.45, 0.4);
		hub.castShadow = true;
		hubGroup.add(hub);

		// Two 2.4 GHz nano-receivers in front USB ports of hub
		const recMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
		const rec1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), recMat);
		rec1.position.set(3.3, 10.45, 2.1);
		hubGroup.add(rec1);

		const rec2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), recMat);
		rec2.position.set(3.9, 10.45, 2.1);
		hubGroup.add(rec2);
		scene.add(hubGroup);

		// 4. Vintage 3.5" USB Floppy Drive Reader & Optical Media Hub
		const floppyGeo = new THREE.BoxGeometry(2.6, 0.8, 3.6);
		const floppyMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.65 });
		const floppy = new THREE.Mesh(floppyGeo, floppyMat);
		floppy.position.set(-0.8, 7.65, 0.8);
		floppy.castShadow = true;

		const slotGeo = new THREE.BoxGeometry(1.8, 0.08, 0.2);
		const slotMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
		const slot = new THREE.Mesh(slotGeo, slotMat);
		slot.position.set(0, 0.1, 1.81);
		floppy.add(slot);
		registerNode(floppy, 'floppy', '3.5" USB Floppy Drive Reader & Optical Media Hub');
		scene.add(floppy);

		// 5. 8-Port Gigabit Switch Backbone on Shelf 2
		const switchGeo = new THREE.BoxGeometry(3.6, 0.7, 2.2);
		const switchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
		const ethSwitch = new THREE.Mesh(switchGeo, switchMat);
		ethSwitch.position.set(7.8, 7.65, 0.3);
		ethSwitch.castShadow = true;
		scene.add(ethSwitch);

		// Switch front port LEDs (green/amber)
		for (let p = 0; p < 8; p++) {
			const portLed = new THREE.Mesh(
				new THREE.BoxGeometry(0.12, 0.08, 0.05),
				new THREE.MeshBasicMaterial({ color: p % 2 === 0 ? 0x22c55e : 0xeab308 })
			);
			portLed.position.set(-1.4 + p * 0.4, 0.1, 1.11);
			ethSwitch.add(portLed);
		}
	}

	function buildShelf3Hardware() {
		// --- Shelf 3 (Bottom Shelf, y = 1.6) ---

		// 1. Debian 2011 Mac (A1278 Unibody) - Battery proactively removed (never swollen)
		const macGroup = new THREE.Group();
		const macBaseGeo = new THREE.BoxGeometry(6.4, 0.35, 4.4);
		const macSilverMat = new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 0.8, roughness: 0.25 });
		const macBase = new THREE.Mesh(macBaseGeo, macSilverMat);
		macBase.position.set(4.8, 1.88, 0.4);
		macBase.castShadow = true;
		macGroup.add(macBase);

		const macScreenGeo = new THREE.BoxGeometry(6.4, 4.2, 0.15);
		const macScreen = new THREE.Mesh(macScreenGeo, macSilverMat);
		macScreen.position.set(4.8, 3.8, -1.7);
		macScreen.rotation.x = 0.25;
		macScreen.castShadow = true;
		macGroup.add(macScreen);

		const macDispGeo = new THREE.PlaneGeometry(5.9, 3.6);
		const macDispMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
		const macDisp = new THREE.Mesh(macDispGeo, macDispMat);
		macDisp.position.set(4.8, 3.8, -1.59);
		macDisp.rotation.x = 0.25;
		macGroup.add(macDisp);
		registerNode(macBase, 'mbp2011', 'Mid-2011 Mac (Debian 12 Bookworm · Battery Removed)');
		scene.add(macGroup);

		// 2. Lenovo Yoga 2 11 Bare-Board Rig (Puffed battery removed, open-air testbench)
		const yogaGroup = new THREE.Group();
		const pcbBaseGeo = new THREE.BoxGeometry(5.2, 0.18, 3.6);
		const greenPcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.4 });
		const yogaPcb = new THREE.Mesh(pcbBaseGeo, greenPcbMat);
		yogaPcb.position.set(-5.2, 1.88, 0.4);
		yogaPcb.castShadow = true;
		yogaGroup.add(yogaPcb);

		// Copper heatsink & fan header
		const copperGeo = new THREE.BoxGeometry(1.8, 0.25, 1.8);
		const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
		const copper = new THREE.Mesh(copperGeo, copperMat);
		copper.position.set(-5.0, 2.05, 0.2);
		yogaGroup.add(copper);
		registerNode(yogaPcb, 'yoga', 'Lenovo Yoga 2 11 Bare-Board Rig (Puffed Battery Salvage)');
		scene.add(yogaGroup);

		// 3. 5V USB Blower Fan (Active Yoga Cooling, powered from 2011 Mac rear USB)
		const fanGroup = new THREE.Group();
		const fanHousingGeo = new THREE.BoxGeometry(1.6, 1.4, 1.6);
		const fanMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 });
		const fanHousing = new THREE.Mesh(fanHousingGeo, fanMat);
		fanHousing.position.set(-2.2, 2.1, 0.6);
		fanHousing.castShadow = true;
		fanGroup.add(fanHousing);

		const nozzleGeo = new THREE.BoxGeometry(1.0, 0.4, 0.8);
		const nozzle = new THREE.Mesh(nozzleGeo, fanMat);
		nozzle.position.set(-2.9, 2.0, 0.6);
		fanGroup.add(nozzle);
		registerNode(fanHousing, 'usbfan', '5V USB Blower Fan (Active Yoga Cooling · Mac Powered)');
		scene.add(fanGroup);

		// 4. Samsung Galaxy S4 Mini (SCH-I435) - tethered to 2011 Mac
		const s4Geo = new THREE.BoxGeometry(1.4, 0.2, 2.4);
		const s4Mat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
		const s4 = new THREE.Mesh(s4Geo, s4Mat);
		s4.position.set(5.2, 1.88, 2.0);
		s4.castShadow = true;
		registerNode(s4, 's4mini', 'Samsung Galaxy S4 Mini (Duino Web Miner · USB Host Powered)');
		scene.add(s4);
	}

	function buildWallLedgeHardware() {
		// --- Wall Ledge Miners (resting safely on top of ledge at y = 9.3, z = -3.5) ---

		// 1. Samsung Galaxy Player (YP-GI1)
		const playerGeo = new THREE.BoxGeometry(1.5, 0.22, 2.5);
		const playerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
		const player = new THREE.Mesh(playerGeo, playerMat);
		player.position.set(-4.0, 9.42, -3.5);
		player.castShadow = true;
		registerNode(player, 'ypgi1', 'Samsung Galaxy Player YP-GI1 (Duino Miner · Wall AC)');
		scene.add(player);

		// 2. Apple iPod Touch Miner
		const ipodGeo = new THREE.BoxGeometry(1.4, 0.18, 2.4);
		const ipodMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.6, roughness: 0.2 });
		const ipod = new THREE.Mesh(ipodGeo, ipodMat);
		ipod.position.set(2.0, 9.4, -3.5);
		ipod.castShadow = true;
		registerNode(ipod, 'ipodtouch', 'Apple iPod Touch Miner (iOS Duino Miner · Wall AC)');
		scene.add(ipod);
	}

	function buildCablesAndInterconnects() {
		// Materials
		const yellowCableMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45 });
		const blackUsbMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
		const powerCordMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });

		// 1. Yellow Cat6 Ethernet: Switch (Shelf 2) to Intel NUC (Shelf 1)
		const nucEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(7.8, 7.8, 0.3),
			new THREE.Vector3(8.6, 9.6, -0.6),
			new THREE.Vector3(8.2, 12.2, -1.2),
			new THREE.Vector3(6.8, 13.8, -0.9),
			new THREE.Vector3(5.7, 13.8, -0.7)
		]);
		const nucTube = new THREE.Mesh(new THREE.TubeGeometry(nucEthCurve, 36, 0.09, 8, false), yellowCableMat);
		scene.add(nucTube);

		// 2. Yellow Cat6 Ethernet: Switch (Shelf 2) to Debian 2011 Mac (Shelf 3)
		const macEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(7.8, 7.5, 0.3),
			new THREE.Vector3(8.5, 5.0, 0.0),
			new THREE.Vector3(8.0, 2.6, 0.0),
			new THREE.Vector3(7.0, 2.0, 0.2),
			new THREE.Vector3(6.4, 2.0, 0.3)
		]);
		const macTube = new THREE.Mesh(new THREE.TubeGeometry(macEthCurve, 32, 0.09, 8, false), yellowCableMat);
		scene.add(macTube);

		// 3. Yellow Cat6 Ethernet: Switch (Shelf 2) to FREEHPGAMER (Shelf 1)
		const hpEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(7.5, 7.8, 0.3),
			new THREE.Vector3(3.5, 7.9, -0.6),
			new THREE.Vector3(-0.5, 10.5, -0.8),
			new THREE.Vector3(-1.8, 13.6, -0.4),
			new THREE.Vector3(-2.2, 13.8, 0.0)
		]);
		const hpTube = new THREE.Mesh(new THREE.TubeGeometry(hpEthCurve, 40, 0.09, 8, false), yellowCableMat);
		scene.add(hpTube);

		// 4. Black USB 5V Power Cable: 2011 Mac rear USB to 5V Yoga Cooling Blower Fan
		const fanUsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(4.5, 2.0, -0.4),
			new THREE.Vector3(1.5, 1.8, -0.6),
			new THREE.Vector3(-0.5, 1.8, 0.0),
			new THREE.Vector3(-1.8, 2.0, 0.5)
		]);
		const fanUsbTube = new THREE.Mesh(new THREE.TubeGeometry(fanUsbCurve, 28, 0.07, 8, false), blackUsbMat);
		scene.add(fanUsbTube);

		// 5. Black USB Cable: 2011 Mac to Samsung Galaxy S4 Mini
		const s4UsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(4.8, 2.0, 0.0),
			new THREE.Vector3(5.4, 1.8, 1.0),
			new THREE.Vector3(5.2, 1.9, 1.8)
		]);
		const s4UsbTube = new THREE.Mesh(new THREE.TubeGeometry(s4UsbCurve, 20, 0.065, 8, false), blackUsbMat);
		scene.add(s4UsbTube);

		// 6. Rear AC Power Drops along rear uprights
		const pwrCurve1 = new THREE.CatmullRomCurve3([
			new THREE.Vector3(-9.8, 13.5, -2.0),
			new THREE.Vector3(-9.8, 7.5, -2.0),
			new THREE.Vector3(-9.8, 1.5, -2.0),
			new THREE.Vector3(-9.8, 0.2, -2.0)
		]);
		const pwrTube1 = new THREE.Mesh(new THREE.TubeGeometry(pwrCurve1, 24, 0.12, 8, false), powerCordMat);
		scene.add(pwrTube1);
	}

	function setupInteractivity() {
		canvas.addEventListener('mousemove', onPointerMove);
		canvas.addEventListener('click', onPointerClick);
		canvas.addEventListener('dblclick', onPointerDoubleClick);
		canvas.addEventListener('touchstart', onTouchStart, { passive: true });

		canvas.addEventListener('pointerdown', (e) => {
			isDragging = true;
			canvas.style.cursor = 'grabbing';
		});

		window.addEventListener('pointerup', (e) => {
			if (isDragging) {
				isDragging = false;
				const target = getIntersectedNode(e);
				canvas.style.cursor = target ? 'pointer' : 'grab';
			}
		});

		document.querySelectorAll('.camera-preset-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.camera-preset-btn').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const preset = btn.getAttribute('data-preset');
				if (CAMERA_PRESETS[preset]) {
					animateCamera(CAMERA_PRESETS[preset].pos, CAMERA_PRESETS[preset].target);
				}
			});
		});

		const resetBtn = document.getElementById('reset-3d-camera-btn');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => {
				document.querySelectorAll('.camera-preset-btn').forEach(b => b.classList.remove('active'));
				const defBtn = document.querySelector('.camera-preset-btn[data-preset="perspective"]');
				if (defBtn) defBtn.classList.add('active');
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
		if (isDragging) {
			canvas.style.cursor = 'grabbing';
			return;
		}
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
		const height = container.clientHeight || 420;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	function animate(time) {
		animFrameId = requestAnimationFrame(animate);

		// Dynamic NeoPixel rotating colors on Bluefruit
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
