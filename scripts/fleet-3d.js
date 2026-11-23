/* Interactive 3D Digital-Twin & Photogrammetry-Ready Homelab Fleet Viewport
 * Built with Three.js (r128) & OrbitControls
 * Author: Andrew Van Ek & Antigravity AI
 * Physical Workbench Configuration:
 * - Main 4-Shelf Rack: Upright poles terminate flush with Shelf 1 (zero extension above top shelf)
 *   - Shelf 1 (Top): FREEHPGAMER from Fishbeck, ONEFIVE Storage, Modular NUC Tower & Bluefruit
 *   - Shelf 2 (Upper-Middle): HP Laptop 15 Workhorse, 3.5" USB Floppy & Optical Drive
 *   - Shelf 3 (Lower-Middle): HOMEDELL 2 (Dell Inspiron 3668 horizontal), Navy Blue USB-C Hub
 *   - Shelf 4 (Bottom): Debian Mid-2011 Mac, Lenovo Yoga 2 11 Bare-Board Rig, 5V USB Fan, Samsung S4 Mini
 * - Secondary Rotated Shelf Unit (To the Right of Main Rack):
 *   - Dedicated side shelf unit rotated 90° holding the 8-Port Gigabit Managed Switch Backbone
 * - Built-in Wall Ledge (To the Left of Main Rack):
 *   - Propped-up Samsung Galaxy Player YP-GI1 & Apple iPod Touch Miner on desktop stands
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
		'perspective': { pos: [0.5, 17, 29], target: [0.5, 9.0, 0] },
		'shelf1': { pos: [-1.5, 18.5, 11], target: [0, 16.5, 0] },
		'shelf2': { pos: [-2.5, 13.5, 11], target: [-2.0, 11.5, 0] },
		'shelf3': { pos: [0.0, 9.2, 11.5], target: [0.0, 7.5, 0] },
		'shelf4': { pos: [0.0, 4.0, 10.5], target: [0.0, 2.2, 0] },
		'switch': { pos: [14.0, 11.0, 9.0], target: [14.8, 7.5, 0.5] },
		'wall': { pos: [-13.5, 13.0, 5.0], target: [-13.0, 10.2, -3.4] }
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
		scene.fog = new THREE.FogExp2(0x090d16, 0.012);

		// 2. Camera setup - height is 420px on desktop, 340px on mobile
		const width = container.clientWidth || 900;
		const height = container.clientHeight || 420;
		camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 200);
		camera.position.set(0.5, 17, 29);

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
			controls.target.set(0.5, 9.0, 0);
			controls.minDistance = 6;
			controls.maxDistance = 55;
			controls.maxPolarAngle = Math.PI / 2 + 0.04;

			controls.addEventListener('start', () => {
				isDragging = true;
				canvas.style.cursor = 'grabbing';
			});
			controls.addEventListener('end', () => {
				isDragging = false;
				canvas.style.cursor = 'grab';
			});

			// Smart CAD Cursor-Centric Zoom: Zooms straight toward the mouse cursor along its 3D ray.
			// Moves BOTH camera.position and controls.target by the exact same vector,
			// preserving theta and phi to guarantee ZERO gimbal spinning or rotation when looking from above.
			const zoomRaycaster = new THREE.Raycaster();
			canvas.addEventListener('wheel', (e) => {
				if (isDragging || !controls) return;
				e.preventDefault();

				const rect = canvas.getBoundingClientRect();
				const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
				const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

				zoomRaycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
				const rayDir = zoomRaycaster.ray.direction.clone().normalize();

				const dist = camera.position.distanceTo(controls.target);
				const zoomAmount = (e.deltaY < 0) ? 0.085 : -0.085;
				const step = Math.max(0.4, Math.min(dist * zoomAmount, 3.2));

				const moveVec = rayDir.clone().multiplyScalar(step);

				// Distance boundary checks
				if (e.deltaY < 0 && dist > controls.minDistance + 1) {
					camera.position.add(moveVec);
					controls.target.add(moveVec);
					controls.update();
				} else if (e.deltaY > 0 && dist < controls.maxDistance - 1) {
					camera.position.add(moveVec);
					controls.target.add(moveVec);
					controls.update();
				}
			}, { passive: false });
		}

		// 5. Lighting
		setupLighting();

		// 6. Geometry construction: Environment + Main 4-Tier Rack + Secondary Rotated Rack + Wall Ledge + Cables
		buildEnvironment();
		buildFreestandingRack();
		buildSecondaryShelfUnit();
		buildShelf1Hardware();
		buildShelf2Hardware();
		buildShelf3Hardware();
		buildShelf4Hardware();
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

		const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
		dirLight.position.set(12, 32, 20);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		scene.add(dirLight);

		const fillLight = new THREE.PointLight(0x38bdf8, 0.55, 35);
		fillLight.position.set(-9, 14, 12);
		scene.add(fillLight);

		// Dynamic NeoPixel Light above NUC on Top Shelf
		neoPixelLight = new THREE.PointLight(0xa855f7, 1.4, 10);
		neoPixelLight.position.set(5.5, 19.4, -0.8);
		scene.add(neoPixelLight);

		// Ethernet green activity link light on Secondary Shelf Switch
		const ethLight = new THREE.PointLight(0x22c55e, 0.65, 6);
		ethLight.position.set(14.8, 7.8, 0.5);
		scene.add(ethLight);
	}

	function buildEnvironment() {
		// Floor
		const floorGeo = new THREE.PlaneGeometry(70, 50);
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

		// Upper Wall (above ledge y >= 9.3 at z = -4.8) - frames room from left mobile miners to right secondary shelf
		const upperWallGeo = new THREE.PlaneGeometry(42, 14);
		const wallMat = new THREE.MeshStandardMaterial({
			color: 0x334155,
			roughness: 0.85,
			metalness: 0.1
		});
		const upperWall = new THREE.Mesh(upperWallGeo, wallMat);
		upperWall.position.set(0.0, 16.3, -4.8);
		upperWall.receiveShadow = true;
		scene.add(upperWall);

		// Built-in Architectural Wall Ledge (at y = 9.3, extends forward to z = -2.8)
		const ledgeGeo = new THREE.BoxGeometry(42, 0.6, 2.0);
		const ledgeMat = new THREE.MeshStandardMaterial({
			color: 0xe2e8f0,
			roughness: 0.6,
			metalness: 0.1
		});
		const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
		ledge.position.set(0.0, 9.0, -3.8); // top surface is at y = 9.3
		ledge.receiveShadow = true;
		ledge.castShadow = true;
		scene.add(ledge);

		// Ledge decorative molding lip along front face at z = -2.8
		const lipGeo = new THREE.BoxGeometry(42.2, 0.35, 0.3);
		const lipMat = new THREE.MeshStandardMaterial({ color: 0xcfd9e5, roughness: 0.5 });
		const lip = new THREE.Mesh(lipGeo, lipMat);
		lip.position.set(0.0, 9.15, -2.7);
		scene.add(lip);

		// Lower Wall (BELOW ledge: y < 9.3 juts out / fills in flush underneath the ledge front at z = -2.8!)
		const lowerWallGeo = new THREE.BoxGeometry(42, 8.7, 2.0);
		const lowerWallMat = new THREE.MeshStandardMaterial({
			color: 0x1e293b,
			roughness: 0.9,
			metalness: 0.05
		});
		const lowerWall = new THREE.Mesh(lowerWallGeo, lowerWallMat);
		lowerWall.position.set(0.0, 4.35, -3.8);
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
		// User requirement: The poles DO NOT extend beyond the topmost shelf (Shelf 1 at y = 16.2).
		// Height = 16.2 (from y = 0 to y = 16.2, centered at y = 8.1).
		// Rear posts sit at z = -2.2 (strictly in front of the wall ledge at z = -2.8).
		// Front posts sit at z = +2.8.
		const postGeo = new THREE.BoxGeometry(0.8, 16.2, 0.8);
		const postPositions = [
			[-10.2, 8.1, -2.2],
			[-10.2, 8.1, 2.8],
			[10.2, 8.1, -2.2],
			[10.2, 8.1, 2.8]
		];
		postPositions.forEach(pos => {
			const post = new THREE.Mesh(postGeo, woodMat);
			post.position.set(...pos);
			post.castShadow = true;
			post.receiveShadow = true;
			rackGroup.add(post);
		});

		// 4 Shelves:
		// Shelf 1 (Top): y = 16.2 (flush with the top of the upright poles!)
		// Shelf 2 (Upper-Middle): y = 11.4
		// Shelf 3 (Lower-Middle): y = 6.6
		// Shelf 4 (Bottom): y = 1.6
		// Depth = 5.4, centered at z = 0.3 -> spans z = -2.4 to +3.0 (completely clear of wall at z = -2.8)
		const shelfGeo = new THREE.BoxGeometry(21.2, 0.55, 5.4);
		[1.6, 6.6, 11.4, 16.2].forEach(y => {
			const shelf = new THREE.Mesh(shelfGeo, woodMat);
			shelf.position.set(0, y, 0.3);
			shelf.receiveShadow = true;
			shelf.castShadow = true;
			rackGroup.add(shelf);
		});

		// Side Panels: User requirement - sides (not back or front) are "Filled in" as in real life
		const sidePanelGeo = new THREE.BoxGeometry(0.4, 16.2, 5.0);
		// Left solid side panel
		const leftPanel = new THREE.Mesh(sidePanelGeo, woodMat);
		leftPanel.position.set(-10.4, 8.1, 0.3);
		leftPanel.castShadow = true;
		leftPanel.receiveShadow = true;
		rackGroup.add(leftPanel);

		// Right solid side panel (spanning from rear post to front post)
		const rightPanel = new THREE.Mesh(sidePanelGeo, woodMat);
		rightPanel.position.set(10.4, 8.1, 0.3);
		rightPanel.castShadow = true;
		rightPanel.receiveShadow = true;
		rackGroup.add(rightPanel);

		scene.add(rackGroup);
	}

	// Secondary Shelf Unit: Separate shelving unit completely to the right of the main unit, rotated 90°
	function buildSecondaryShelfUnit() {
		// Secondary Shelf Unit: Compact auxiliary shelving unit to the right of the main rack.
		// User requirement: Significantly decreased space between shelves and lower overall height (y = 6.85).
		// Rear-left post (facing head-on) sits at x = 11.4, z = 2.8, ending cleanly right by main front-right post (10.2, 2.8).
		// Posts terminate flush with top shelf (y = 6.85, zero extension above).
		// Bottom shelf holds HP printer (no Ethernet); Middle shelf holds 8-Port Gigabit Switch.
		const sideUnitGroup = new THREE.Group();

		const woodMat = new THREE.MeshStandardMaterial({
			color: 0xdcb68a,
			roughness: 0.75,
			metalness: 0.08
		});

		// Secondary Unit Center: x = 13.5, z = 4.9. Width = 4.8, Depth = 4.8.
		// Compact Uprights: Height = 6.85 (from y = 0 to y = 6.85, centered at y = 3.425, terminating flush with top shelf!).
		const sidePostGeo = new THREE.BoxGeometry(0.7, 6.85, 0.7);
		const sidePostPositions = [
			// Rear-left: x = 11.4, z = 2.8 -> Ends right next to main front-right post
			[11.4, 3.425, 2.8],
			// Front-left: x = 11.4, z = 7.0
			[11.4, 3.425, 7.0],
			// Rear-right: x = 15.6, z = 2.8
			[15.6, 3.425, 2.8],
			// Front-right: x = 15.6, z = 7.0
			[15.6, 3.425, 7.0]
		];
		sidePostPositions.forEach(pos => {
			const post = new THREE.Mesh(sidePostGeo, woodMat);
			post.position.set(...pos);
			post.castShadow = true;
			post.receiveShadow = true;
			sideUnitGroup.add(post);
		});

		// 3 Shelves with compact vertical spacing:
		// Bottom Tier: y = 1.6 (top surface y = 1.85) -> HP Printer
		// Middle Tier: y = 4.2 (top surface y = 4.45) -> 8-Port Managed Switch Backbone
		// Top Tier: y = 6.6 (thickness 0.5, top surface y = 6.85 -> flush with upright posts!)
		const sideShelfGeo = new THREE.BoxGeometry(4.9, 0.5, 4.9);
		[1.6, 4.2, 6.6].forEach(y => {
			const shelf = new THREE.Mesh(sideShelfGeo, woodMat);
			shelf.position.set(13.5, y, 4.9);
			shelf.receiveShadow = true;
			shelf.castShadow = true;
			sideUnitGroup.add(shelf);
		});

		// --- 8-Port Gigabit Managed Switch Backbone (Mounted on Middle Tier y = 4.2) ---
		// Front face points towards -X (facing main rack) at x = 12.2
		const switchGeo = new THREE.BoxGeometry(2.4, 0.75, 3.8);
		const switchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
		const ethSwitch = new THREE.Mesh(switchGeo, switchMat);
		ethSwitch.position.set(13.4, 4.85, 4.9);
		ethSwitch.castShadow = true;

		// 8 Front RJ45 Ports facing -X towards main rack
		for (let p = 0; p < 8; p++) {
			const portJack = new THREE.Mesh(
				new THREE.BoxGeometry(0.1, 0.2, 0.28),
				new THREE.MeshBasicMaterial({ color: 0x09090b })
			);
			portJack.position.set(-1.21, -0.08, -1.4 + p * 0.4);
			ethSwitch.add(portJack);

			// Port Activity LED
			const portLed = new THREE.Mesh(
				new THREE.BoxGeometry(0.05, 0.08, 0.1),
				new THREE.MeshBasicMaterial({ color: p % 2 === 0 ? 0x22c55e : 0xeab308 })
			);
			portLed.position.set(-1.21, 0.18, -1.4 + p * 0.4);
			ethSwitch.add(portLed);
		}
		registerNode(ethSwitch, 'switch', '8-Port Gigabit Managed Switch Backbone (Secondary Shelf · Middle Tier)');
		sideUnitGroup.add(ethSwitch);

		// --- HP Network Multifunction Printer (Bottom Shelf y = 1.6) ---
		// Note: Connected via LAN Wi-Fi (No physical Ethernet cable per user instruction)
		const printerGroup = new THREE.Group();
		printerGroup.userData.nodeId = 'printer';

		// Main Printer Body
		const printerBodyGeo = new THREE.BoxGeometry(3.6, 1.35, 3.4);
		const printerBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
		const printerBody = new THREE.Mesh(printerBodyGeo, printerBodyMat);
		printerBody.position.set(13.5, 2.52, 4.9);
		printerBody.castShadow = true;
		printerBody.receiveShadow = true;
		printerGroup.add(printerBody);

		// Top Scanner Flatbed Lid
		const lidGeo = new THREE.BoxGeometry(3.7, 0.15, 3.5);
		const lidMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35 });
		const lid = new THREE.Mesh(lidGeo, lidMat);
		lid.position.set(13.5, 3.27, 4.9);
		lid.castShadow = true;
		printerGroup.add(lid);

		// HP Blue Emblem on lid
		const hpLogoGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16);
		const hpLogoMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
		const hpLogo = new THREE.Mesh(hpLogoGeo, hpLogoMat);
		hpLogo.position.set(13.5, 3.37, 4.9);
		printerGroup.add(hpLogo);

		// Front Paper Input / Output Cassette Tray
		const trayGeo = new THREE.BoxGeometry(2.6, 0.35, 1.0);
		const trayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
		const tray = new THREE.Mesh(trayGeo, trayMat);
		tray.position.set(13.5, 2.05, 6.7);
		printerGroup.add(tray);

		// Front Angled Control Panel
		const panelGeo = new THREE.BoxGeometry(1.2, 0.45, 0.4);
		const panelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
		const panel = new THREE.Mesh(panelGeo, panelMat);
		panel.position.set(14.4, 2.85, 6.65);
		panel.rotation.x = -Math.PI / 6;
		printerGroup.add(panel);

		const screenGeo = new THREE.PlaneGeometry(0.7, 0.28);
		const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
		const screen = new THREE.Mesh(screenGeo, screenMat);
		screen.position.set(14.4, 2.87, 6.86);
		screen.rotation.x = -Math.PI / 6;
		printerGroup.add(screen);

		registerNode(printerBody, 'printer', 'HP Salvage Network Multifunction Printer (Secondary Shelf · Bottom Tier · Wi-Fi)');
		sideUnitGroup.add(printerGroup);

		scene.add(sideUnitGroup);
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
		interactiveNodes.push(mesh);
		addBoundingOutline(mesh, 0x38bdf8);
	}

	function buildShelf1Hardware() {
		// --- Shelf 1 (Top Shelf, y = 16.2) ---

		// 1. FREEHPGAMER from Fishbeck (Silver HP Workstation on wire mesh riser)
		const hpGroup = new THREE.Group();
		hpGroup.userData.nodeId = 'winws';

		const riserGeo = new THREE.BoxGeometry(7.0, 0.6, 5.0);
		const riserMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
		const riser = new THREE.Mesh(riserGeo, riserMat);
		riser.position.set(-5.0, 16.78, 0.3);
		riser.castShadow = true;
		hpGroup.add(riser);

		const baseGeo = new THREE.BoxGeometry(6.6, 0.28, 4.4);
		const silverMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 0.7, roughness: 0.3 });
		const base = new THREE.Mesh(baseGeo, silverMat);
		base.position.set(-5.0, 17.22, 0.3);
		base.castShadow = true;
		hpGroup.add(base);

		const screenGeo = new THREE.BoxGeometry(6.6, 4.4, 0.18);
		const screen = new THREE.Mesh(screenGeo, silverMat);
		screen.position.set(-5.0, 19.2, -1.8);
		screen.rotation.x = 0.25;
		screen.castShadow = true;
		hpGroup.add(screen);

		const displayGeo = new THREE.PlaneGeometry(6.1, 3.8);
		const displayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
		const display = new THREE.Mesh(displayGeo, displayMat);
		display.position.set(-5.0, 19.2, -1.69);
		display.rotation.x = 0.25;
		hpGroup.add(display);

		registerNode(base, 'winws', 'FREEHPGAMER from Fishbeck (Windows 11 Workstation · Shelf 1)');
		scene.add(hpGroup);

		// 2. ONEFIVE Network Storage (Sabrent USB 3.0 SATA Enclosure)
		// User requirement: Rotated 90 degrees in front of NUC area so the non-gray LED dot lines up
		// with the right side of the NUC (x = 7.1) facing head-on, and plugged into the NUC via USB.
		const sabrentGroup = new THREE.Group();
		sabrentGroup.userData.nodeId = 'onefive';

		// Rotated 90°: Width = 4.4, Height = 0.7, Depth = 2.4. Placed in front of NUC at z = 1.6
		const sabrentGeo = new THREE.BoxGeometry(4.4, 0.7, 2.4);
		const sabrentMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });
		const sabrent = new THREE.Mesh(sabrentGeo, sabrentMat);
		sabrent.position.set(4.9, 16.83, 1.6);
		sabrent.castShadow = true;
		sabrent.receiveShadow = true;
		sabrentGroup.add(sabrent);

		// Non-gray cyan LED dot lining up perfectly with the right edge of the NUC (x = 6.9, NUC edge at x = 7.1)
		const ledGeo = new THREE.BoxGeometry(0.2, 0.08, 0.2);
		const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
		const led = new THREE.Mesh(ledGeo, ledMat);
		led.position.set(6.9, 17.2, 2.65);
		sabrentGroup.add(led);
		registerNode(sabrent, 'onefive', 'ONEFIVE Network Storage (Sabrent USB 3.0 · In Front of NUC · Shelf 1)');
		scene.add(sabrentGroup);

		// 3. Samsung 870 EVO 500GB SSD (Mounted directly on top of the ONEFIVE enclosure)
		// User requirement: Stores macOS VM files & VirtualBox cloning projects, plugged into FREEHPGAMER via USB.
		const evoGroup = new THREE.Group();
		evoGroup.userData.nodeId = 'evo870';

		// 2.5" SSD Body: Width = 2.8, Height = 0.22, Depth = 2.0
		const evoGeo = new THREE.BoxGeometry(2.8, 0.22, 2.0);
		const evoMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.6 });
		const evo = new THREE.Mesh(evoGeo, evoMat);
		evo.position.set(4.9, 17.3, 1.6);
		evo.castShadow = true;
		evoGroup.add(evo);

		// Samsung Signature Orange/Red Square Badge
		const badgeGeo = new THREE.BoxGeometry(0.4, 0.05, 0.4);
		const badgeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
		const badge = new THREE.Mesh(badgeGeo, badgeMat);
		badge.position.set(5.8, 17.42, 2.1);
		evoGroup.add(badge);

		// Label plate
		const labelGeo = new THREE.PlaneGeometry(1.8, 0.9);
		const labelMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
		const label = new THREE.Mesh(labelGeo, labelMat);
		label.position.set(4.7, 17.42, 1.6);
		label.rotation.x = -Math.PI / 2;
		evoGroup.add(label);

		registerNode(evo, 'evo870', 'Samsung 870 EVO 500GB SSD (VirtualBox VM & Mac Cloning Store · Shelf 1)');
		scene.add(evoGroup);

		// 4. Modular Snap-Cube Frame + Intel NUC + Adafruit Bluefruit
		const modularTower = new THREE.Group();
		const cubeColors = [0x0284c7, 0x16a34a, 0xeab308, 0xd97706];
		const cubeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
		const cubePositions = [
			[4.8, 16.9, -1.6, 0], [6.2, 16.9, -1.6, 1], [4.8, 16.9, 0.0, 2], [6.2, 16.9, 0.0, 3],
			[4.8, 17.75, -1.6, 1], [6.2, 17.75, -1.6, 0], [4.8, 17.75, 0.0, 3], [6.2, 17.75, 0.0, 2],
			[4.8, 18.6, -0.8, 0], [6.2, 18.6, -0.8, 1]
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
		nuc.position.set(5.5, 17.08, -0.8);
		nuc.castShadow = true;
		nuc.receiveShadow = true;

		const nucTopGeo = new THREE.BoxGeometry(3.0, 0.1, 3.0);
		const nucTopMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
		const nucTop = new THREE.Mesh(nucTopGeo, nucTopMat);
		nucTop.position.set(0, 0.62, 0);
		nuc.add(nucTop);
		registerNode(nuc, 'nuc', 'Headless Intel NUC LAN Backbone (Alpine Linux · Shelf 1)');
		scene.add(nuc);

		// Adafruit Circuit Playground Bluefruit
		const pcbGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.12, 24);
		const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
		const bluefruit = new THREE.Mesh(pcbGeo, pcbMat);
		bluefruit.position.set(5.5, 19.2, -0.8);
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
		registerNode(bluefruit, 'bluefruit', 'Adafruit Circuit Playground Bluefruit (Nordic nRF52840 · Shelf 1)');
		scene.add(bluefruit);

		scene.add(modularTower);
	}

	function buildShelf2Hardware() {
		// --- Shelf 2 (Upper-Middle Shelf, y = 11.4) ---

		// 1. HP Laptop 15 Workhorse (Black chassis, Linux Mint 21)
		const hp15Group = new THREE.Group();
		hp15Group.userData.nodeId = 'hp15';

		const hp15BaseGeo = new THREE.BoxGeometry(6.4, 0.28, 4.4);
		const hp15Mat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
		const hp15Base = new THREE.Mesh(hp15BaseGeo, hp15Mat);
		hp15Base.position.set(-5.2, 11.69, 0.3);
		hp15Base.castShadow = true;
		hp15Group.add(hp15Base);

		const hp15ScreenGeo = new THREE.BoxGeometry(6.4, 4.2, 0.18);
		const hp15Screen = new THREE.Mesh(hp15ScreenGeo, hp15Mat);
		hp15Screen.position.set(-5.2, 13.6, -1.8);
		hp15Screen.rotation.x = 0.25;
		hp15Screen.castShadow = true;
		hp15Group.add(hp15Screen);

		const hp15DispGeo = new THREE.PlaneGeometry(5.9, 3.6);
		const hp15DispMat = new THREE.MeshBasicMaterial({ color: 0x15803d });
		const hp15Disp = new THREE.Mesh(hp15DispGeo, hp15DispMat);
		hp15Disp.position.set(-5.2, 13.6, -1.69);
		hp15Disp.rotation.x = 0.25;
		hp15Group.add(hp15Disp);

		// Ethernet-to-USB-C Adapter plugged into left side USB-C port
		const usbCAdapterGeo = new THREE.BoxGeometry(0.35, 0.22, 0.7);
		const usbCAdapterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
		const usbCAdapter = new THREE.Mesh(usbCAdapterGeo, usbCAdapterMat);
		usbCAdapter.position.set(-5.6, 11.75, 0.4);
		usbCAdapter.castShadow = true;
		hp15Group.add(usbCAdapter);

		const rj45Jack = new THREE.Mesh(
			new THREE.BoxGeometry(0.12, 0.14, 0.2),
			new THREE.MeshBasicMaterial({ color: 0x09090b })
		);
		rj45Jack.position.set(-5.78, 11.75, 0.4);
		hp15Group.add(rj45Jack);

		registerNode(hp15Base, 'hp15', 'HP Laptop 15 Workhorse (Linux Mint 21 · USB-C Gigabit Adapter · Shelf 2)');
		scene.add(hp15Group);

		// 2. Vintage 3.5" USB Floppy Drive Reader & Optical Media Hub
		const floppyGeo = new THREE.BoxGeometry(2.6, 0.8, 3.6);
		const floppyMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.65 });
		const floppy = new THREE.Mesh(floppyGeo, floppyMat);
		floppy.position.set(2.0, 11.65, 0.8);
		floppy.castShadow = true;

		const slotGeo = new THREE.BoxGeometry(1.8, 0.08, 0.2);
		const slotMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
		const slot = new THREE.Mesh(slotGeo, slotMat);
		slot.position.set(0, 0.1, 1.81);
		floppy.add(slot);
		registerNode(floppy, 'floppy', '3.5" USB Floppy Drive Reader & Optical Media Hub (Shelf 2)');
		scene.add(floppy);
	}

	function buildShelf3Hardware() {
		// --- Shelf 3 (Lower-Middle Shelf, y = 6.6) ---
		// HOMEDELL 2 (Dell Inspiron 3668) placed horizontally on its dedicated shelf with USB hub on top

		// 1. HOMEDELL 2 (Dell Inspiron 3668)
		const dellGeo = new THREE.BoxGeometry(7.2, 2.6, 5.4);
		const dellMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.35, metalness: 0.4 });
		const dell = new THREE.Mesh(dellGeo, dellMat);
		dell.position.set(0.0, 8.18, 0.3);
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
		registerNode(dell, 'dell', 'HOMEDELL 2 (Dell Inspiron · "Hopes & Dreams")');
		scene.add(dell);

		// 2. Navy Blue USB-C Multiport Hub with Dual 2.4 GHz Receivers (ON TOP OF DELL INSPIRON)
		const hubGroup = new THREE.Group();
		const hubGeo = new THREE.BoxGeometry(1.4, 0.35, 3.2);
		const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 });
		const hub = new THREE.Mesh(hubGeo, navyMat);
		hub.position.set(1.4, 9.65, 0.4);
		hub.castShadow = true;
		hubGroup.add(hub);

		// Two 2.4 GHz nano-receivers in front USB ports of hub
		const recMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
		const rec1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), recMat);
		rec1.position.set(1.1, 9.65, 2.1);
		hubGroup.add(rec1);

		const rec2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), recMat);
		rec2.position.set(1.7, 9.65, 2.1);
		hubGroup.add(rec2);
		scene.add(hubGroup);
	}

	function buildShelf4Hardware() {
		// --- Shelf 4 (Bottom Shelf, y = 1.6) ---

		// 1. Debian 2011 Mac (A1278 Unibody) - Battery proactively removed
		const macGroup = new THREE.Group();
		macGroup.userData.nodeId = 'mbp2011';

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
		registerNode(macBase, 'mbp2011', 'Mid-2011 Mac (Debian 12 Bookworm · Battery Removed · Shelf 4)');
		scene.add(macGroup);

		// 2. Lenovo Yoga 2 Pro Motherboard (Mounted vertically on edge in Y-Z plane!)
		// User requirement: When viewed head-on from the outside, it looks razor-thin (0.08 units).
		// When rotating the camera 90 degrees, the full detailed motherboard PCB face is completely visible.
		const yogaGroup = new THREE.Group();
		yogaGroup.userData.nodeId = 'yoga';

		// Motherboard PCB standing vertically along X = -4.5 (Y-Z plane)
		const pcbBaseGeo = new THREE.BoxGeometry(0.08, 3.4, 4.8);
		const greenPcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.4 });
		const yogaPcb = new THREE.Mesh(pcbBaseGeo, greenPcbMat);
		yogaPcb.position.set(-4.5, 3.55, 0.4);
		yogaPcb.castShadow = true;
		yogaGroup.add(yogaPcb);

		// Components mounted on motherboard face (visible when rotating 90°):
		// Intel Core CPU die
		const cpuGeo = new THREE.BoxGeometry(0.06, 0.8, 0.8);
		const cpuMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
		const cpu = new THREE.Mesh(cpuGeo, cpuMat);
		cpu.position.set(-4.44, 3.55, 0.4);
		yogaGroup.add(cpu);

		// Copper heatsink heatpipe curving across board
		const copperGeo = new THREE.BoxGeometry(0.06, 0.25, 2.2);
		const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
		const copper = new THREE.Mesh(copperGeo, copperMat);
		copper.position.set(-4.44, 3.85, 0.4);
		yogaGroup.add(copper);

		// RAM chips on PCB face
		const ramMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
		[-0.8, -0.3, 0.3, 0.8].forEach(offsetZ => {
			const ramChip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.3), ramMat);
			ramChip.position.set(-4.44, 2.8, offsetZ + 0.4);
			yogaGroup.add(ramChip);
		});

		// Minimalist edge stand brackets holding motherboard upright
		const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
		[-1.4, 1.4].forEach(standZ => {
			const stand = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.5), standMat);
			stand.position.set(-4.5, 1.95, standZ + 0.4);
			yogaGroup.add(stand);
		});

		// Ethernet-to-USB-A Adapter plugged into rear USB-A port
		const usbAAdapterGeo = new THREE.BoxGeometry(0.3, 0.25, 0.75);
		const usbAAdapterMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
		const usbAAdapter = new THREE.Mesh(usbAAdapterGeo, usbAAdapterMat);
		usbAAdapter.position.set(-4.5, 2.5, -2.1);
		usbAAdapter.castShadow = true;
		yogaGroup.add(usbAAdapter);

		const usbARj45 = new THREE.Mesh(
			new THREE.BoxGeometry(0.18, 0.16, 0.12),
			new THREE.MeshBasicMaterial({ color: 0x09090b })
		);
		usbARj45.position.set(-4.5, 2.5, -2.48);
		yogaGroup.add(usbARj45);

		registerNode(yogaPcb, 'yoga', 'Lenovo Yoga 2 11 Bare-Board Motherboard (Vertical Testbench · Shelf 4)');
		scene.add(yogaGroup);

		// 3. Authentic 5V Centrifugal Blower Cooling Fan
		// Mounted overhead directly above the Lenovo Yoga bare board, blowing down on and out across the heatsink and PCB!
		const fanGroup = new THREE.Group();
		fanGroup.userData.nodeId = 'usbfan';

		// Overhead Mounting Struts / Brackets suspended from Shelf 3 underside (y = 6.325 down to fan housing)
		const fanBracketGeo = new THREE.BoxGeometry(0.12, 0.46, 0.12);
		const fanBracketMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
		[-0.45, 0.45].forEach(offsetZ => {
			const bracket = new THREE.Mesh(fanBracketGeo, fanBracketMat);
			bracket.position.set(-4.5, 6.09, 0.2 + offsetZ);
			fanGroup.add(bracket);
		});

		// Circular vortex scroll housing - mounted overhead directly above Lenovo Yoga
		const fanScrollGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.62, 24);
		const fanScrollMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.45 });
		const fanScroll = new THREE.Mesh(fanScrollGeo, fanScrollMat);
		fanScroll.position.set(-4.5, 5.82, 0.2);
		fanScroll.castShadow = true;
		fanGroup.add(fanScroll);

		// Central Air Intake Grill on top of scroll housing
		const fanHubGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.65, 16);
		const fanHubMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
		const fanHub = new THREE.Mesh(fanHubGeo, fanHubMat);
		fanHub.position.set(-4.5, 5.82, 0.2);
		fanGroup.add(fanHub);

		// Angled Exhaust Duct - pointing DOWN (-Y) and OUT (+Z) directly onto the Yoga motherboard & copper heatsink!
		const nozzleGeo = new THREE.BoxGeometry(0.68, 0.44, 0.95);
		const nozzle = new THREE.Mesh(nozzleGeo, fanScrollMat);
		nozzle.position.set(-4.5, 5.52, 0.85);
		nozzle.rotation.x = 0.55; // Pitch angled downward and forward towards viewer
		nozzle.castShadow = true;
		fanGroup.add(nozzle);

		// Exhaust vent opening
		const exhaustHole = new THREE.Mesh(
			new THREE.PlaneGeometry(0.58, 0.36),
			new THREE.MeshBasicMaterial({ color: 0x030712 })
		);
		exhaustHole.position.set(-4.5, 5.26, 1.28);
		exhaustHole.rotation.x = 0.55;
		fanGroup.add(exhaustHole);

		registerNode(fanScroll, 'usbfan', '5V Centrifugal Blower Fan (Overhead Yoga Cooling · Downward/Outward Airflow · Shelf 4)');
		scene.add(fanGroup);

		// 4. Samsung Galaxy S4 Mini (Positioned TO THE LEFT of the Lenovo Yoga with Back Off & Battery Visible)
		// User requirement: S4 mini is to the left of the Yoga facing head-on, back cover off, battery visible.
		const s4Group = new THREE.Group();
		s4Group.userData.nodeId = 's4mini';

		// Phone Chassis rim
		const s4RimGeo = new THREE.BoxGeometry(1.4, 0.22, 2.5);
		const s4RimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 });
		const s4Rim = new THREE.Mesh(s4RimGeo, s4RimMat);
		s4Rim.position.set(-7.8, 1.96, 0.4);
		s4Rim.castShadow = true;
		s4Group.add(s4Rim);

		// Screen on bottom (face down or face up with battery compartment exposed on top)
		// Top side is open battery compartment:
		const bayGeo = new THREE.BoxGeometry(1.15, 0.08, 2.2);
		const bayMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
		const bay = new THREE.Mesh(bayGeo, bayMat);
		bay.position.set(-7.8, 2.05, 0.4);
		s4Group.add(bay);

		// Exposed Lithium-Ion Battery Pack
		const batteryGeo = new THREE.BoxGeometry(0.85, 0.16, 1.5);
		const batteryMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.4 });
		const battery = new THREE.Mesh(batteryGeo, batteryMat);
		battery.position.set(-7.8, 2.12, 0.25);
		battery.castShadow = true;
		s4Group.add(battery);

		// Battery Spec Label on battery
		const bLabelGeo = new THREE.PlaneGeometry(0.65, 1.1);
		const bLabelMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
		const bLabel = new THREE.Mesh(bLabelGeo, bLabelMat);
		bLabel.position.set(-7.8, 2.21, 0.25);
		bLabel.rotation.x = -Math.PI / 2;
		s4Group.add(bLabel);

		// Golden battery contact terminals
		const termGeo = new THREE.BoxGeometry(0.3, 0.06, 0.1);
		const termMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
		const term = new THREE.Mesh(termGeo, termMat);
		term.position.set(-7.8, 2.15, 1.05);
		s4Group.add(term);

		// Exposed Camera module
		const camGeo = new THREE.BoxGeometry(0.35, 0.14, 0.35);
		const camMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
		const cam = new THREE.Mesh(camGeo, camMat);
		cam.position.set(-7.8, 2.12, 1.25);
		s4Group.add(cam);

		registerNode(s4Rim, 's4mini', 'Samsung Galaxy S4 Mini (Duino Web Miner · Back Off · Exposed Battery · Shelf 4)');
		scene.add(s4Group);
	}

	function buildWallLedgeHardware() {
		// --- Wall Ledge Mobile Miners (Propped Up & Positioned TO THE LEFT of the rack) ---
		// User requirement: Rotated 90 degrees into landscape orientation!
		// Behind the leftmost shelf edge sits a Duplex AC Wall Outlet with dual USB charger bricks powering them.

		// 1. Samsung Galaxy Player (YP-GI1) - Landscape Orientation (~70° propped angle)
		const gPlayerGroup = new THREE.Group();
		gPlayerGroup.position.set(-14.6, 9.8, -3.4);
		gPlayerGroup.rotation.x = -0.32; // propped up facing forward/upward

		// Landscape dimensions: Width = 2.8, Height = 1.6
		const playerGeo = new THREE.BoxGeometry(2.8, 1.6, 0.22);
		const playerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
		const player = new THREE.Mesh(playerGeo, playerMat);
		player.castShadow = true;
		gPlayerGroup.add(player);

		const playerScreen = new THREE.Mesh(
			new THREE.PlaneGeometry(2.2, 1.2),
			new THREE.MeshBasicMaterial({ color: 0x0284c7 })
		);
		playerScreen.position.set(0, 0, 0.12);
		gPlayerGroup.add(playerScreen);

		// Kickstand behind
		const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
		const stand1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.15), standMat);
		stand1.position.set(0, -0.3, -0.5);
		stand1.rotation.x = 0.5;
		gPlayerGroup.add(stand1);

		registerNode(player, 'ypgi1', 'Samsung Galaxy Player YP-GI1 (Duino Miner · Landscape · Wall Ledge)');
		scene.add(gPlayerGroup);

		// 2. Apple iPod Touch Miner - Landscape Orientation (~70° propped angle)
		const ipodGroup = new THREE.Group();
		ipodGroup.position.set(-12.4, 9.8, -3.4);
		ipodGroup.rotation.x = -0.32; // propped up facing forward/upward

		// Landscape dimensions: Width = 2.6, Height = 1.5
		const ipodGeo = new THREE.BoxGeometry(2.6, 1.5, 0.18);
		const ipodMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.6, roughness: 0.2 });
		const ipod = new THREE.Mesh(ipodGeo, ipodMat);
		ipod.castShadow = true;
		ipodGroup.add(ipod);

		const ipodScreen = new THREE.Mesh(
			new THREE.PlaneGeometry(2.0, 1.1),
			new THREE.MeshBasicMaterial({ color: 0x1e293b })
		);
		ipodScreen.position.set(0, 0, 0.1);
		ipodGroup.add(ipodScreen);

		const stand2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 0.15), standMat);
		stand2.position.set(0, -0.3, -0.5);
		stand2.rotation.x = 0.5;
		ipodGroup.add(stand2);

		registerNode(ipod, 'ipodtouch', 'Apple iPod Touch Miner (iOS Duino Miner · Landscape · Wall Ledge)');
		scene.add(ipodGroup);

		// 3. Duplex AC Wall Outlet with Dual USB Charger Bricks
		// Located on the wall (z = -2.8) behind the farthest left shelf edge (x = -10.8, y = 10.2)
		const outletGroup = new THREE.Group();
		outletGroup.position.set(-10.8, 10.2, -2.78);

		// White Duplex Faceplate
		const faceplateGeo = new THREE.BoxGeometry(0.85, 1.3, 0.06);
		const faceplateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
		const faceplate = new THREE.Mesh(faceplateGeo, faceplateMat);
		outletGroup.add(faceplate);

		// Upper AC Socket Receptacle
		const socketMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
		const upperSocket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.08), socketMat);
		upperSocket.position.set(0, 0.32, 0.02);
		outletGroup.add(upperSocket);

		// Lower AC Socket Receptacle
		const lowerSocket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.08), socketMat);
		lowerSocket.position.set(0, -0.32, 0.02);
		outletGroup.add(lowerSocket);

		// Upper Charger Brick (White Apple 5W USB Adapter powering iPod Touch)
		const appleChargerGeo = new THREE.BoxGeometry(0.45, 0.42, 0.55);
		const appleChargerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
		const appleCharger = new THREE.Mesh(appleChargerGeo, appleChargerMat);
		appleCharger.position.set(0, 0.32, 0.32);
		outletGroup.add(appleCharger);

		// Lower Charger Brick (Black USB Adapter powering Galaxy Player)
		const blackChargerGeo = new THREE.BoxGeometry(0.45, 0.42, 0.55);
		const blackChargerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
		const blackCharger = new THREE.Mesh(blackChargerGeo, blackChargerMat);
		blackCharger.position.set(0, -0.32, 0.32);
		outletGroup.add(blackCharger);

		scene.add(outletGroup);
	}

	function buildCablesAndInterconnects() {
		// Materials
		const yellowCableMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45 });
		const blackUsbMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
		const whiteUsbMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
		const powerCordMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });

		// Managed Switch sits on Secondary Shelf Middle Tier at (13.4, 4.85, 4.9).
		// Front RJ45 ports face -X at x = 12.2, spanning z = 3.5 to 6.3.
		// All cables enter the main rack through the open front corner (z = 3.2 to 3.5) around the front-right post
		// and route strictly ABOVE shelf surfaces (zero shelf clipping, zero pole clipping).

		// 1. Yellow Cat6: Switch Port 1 (12.2, 4.9, 3.5) -> FREEHPGAMER (Shelf 1 Top Shelf, x = -5.0)
		const hpEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(12.2, 4.9, 3.5),
			new THREE.Vector3(10.8, 5.5, 3.4),
			new THREE.Vector3(9.6, 6.2, 3.3),
			new THREE.Vector3(9.5, 11.5, 2.5),
			new THREE.Vector3(9.5, 16.6, 2.2),
			new THREE.Vector3(2.0, 16.8, -1.8),
			new THREE.Vector3(-4.0, 16.8, -1.8),
			new THREE.Vector3(-6.2, 17.2, -1.2)
		]);
		const hpTube = new THREE.Mesh(new THREE.TubeGeometry(hpEthCurve, 55, 0.085, 8, false), yellowCableMat);
		scene.add(hpTube);

		// 2. Yellow Cat6: Switch Port 2 (12.2, 4.9, 3.9) -> Intel NUC Core (Shelf 1 Top Shelf, x = 5.2)
		const nucEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(12.2, 4.9, 3.9),
			new THREE.Vector3(10.8, 5.5, 3.4),
			new THREE.Vector3(9.6, 6.5, 3.3),
			new THREE.Vector3(9.5, 12.0, 2.5),
			new THREE.Vector3(9.5, 16.6, 1.0),
			new THREE.Vector3(7.5, 17.0, -2.4),
			new THREE.Vector3(5.5, 17.2, -2.4)
		]);
		const nucTube = new THREE.Mesh(new THREE.TubeGeometry(nucEthCurve, 45, 0.085, 8, false), yellowCableMat);
		scene.add(nucTube);

		// 3. Yellow Cat6: Switch Port 3 (12.2, 4.9, 4.3) -> HP Laptop 15 Ethernet-to-USB-C Adapter (Shelf 2)
		// Enters Shelf 2 strictly above shelf floor (y = 11.85) in front of floppy drive, directly into USB-C adapter
		const hp15EthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(12.2, 4.9, 4.3),
			new THREE.Vector3(10.8, 5.5, 3.4),
			new THREE.Vector3(9.6, 7.0, 3.3),
			new THREE.Vector3(9.5, 11.85, 2.2),
			new THREE.Vector3(4.0, 11.85, 2.0),
			new THREE.Vector3(0.0, 11.85, 1.5),
			new THREE.Vector3(-4.0, 11.85, 1.0),
			new THREE.Vector3(-5.78, 11.75, 0.4)
		]);
		const hp15Tube = new THREE.Mesh(new THREE.TubeGeometry(hp15EthCurve, 48, 0.085, 8, false), yellowCableMat);
		scene.add(hp15Tube);

		// 4. Yellow Cat6: Switch Port 4 (12.2, 4.9, 4.7) -> HomeDell 2 / Inspiron 3668 (Shelf 3, x = 0.0)
		const dellEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(12.2, 4.9, 4.7),
			new THREE.Vector3(10.8, 5.2, 3.4),
			new THREE.Vector3(9.5, 7.1, 3.2),
			new THREE.Vector3(7.5, 7.2, 1.0),
			new THREE.Vector3(5.0, 7.3, -1.5),
			new THREE.Vector3(3.2, 7.5, -2.2)
		]);
		const dellTube = new THREE.Mesh(new THREE.TubeGeometry(dellEthCurve, 32, 0.085, 8, false), yellowCableMat);
		scene.add(dellTube);

		// 5. Yellow Cat6: Switch Port 5 (12.2, 4.9, 5.1) -> Debian 2011 Mac (Shelf 4, x = 4.8)
		const macEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(12.2, 4.9, 5.1),
			new THREE.Vector3(10.6, 3.5, 3.4),
			new THREE.Vector3(9.6, 2.3, 3.3),
			new THREE.Vector3(7.5, 2.1, 1.0),
			new THREE.Vector3(5.2, 1.95, -1.0)
		]);
		const macTube = new THREE.Mesh(new THREE.TubeGeometry(macEthCurve, 36, 0.085, 8, false), yellowCableMat);
		scene.add(macTube);

		// 6. Yellow Cat6: Switch Port 6 (12.2, 4.9, 5.5) -> Lenovo Yoga Ethernet-to-USB-A Adapter (Shelf 4 rear)
		const yogaEthCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(12.2, 4.9, 5.5),
			new THREE.Vector3(10.6, 3.2, 3.5),
			new THREE.Vector3(9.6, 2.1, 3.3),
			new THREE.Vector3(2.0, 2.1, 1.0),
			new THREE.Vector3(-2.0, 2.1, -1.0),
			new THREE.Vector3(-4.5, 2.5, -2.48)
		]);
		const yogaTube = new THREE.Mesh(new THREE.TubeGeometry(yogaEthCurve, 50, 0.085, 8, false), yellowCableMat);
		scene.add(yogaTube);

		// 7. Black USB Cable: Vintage Floppy Drive Reader -> HP Laptop 15 Workhorse left side (Shelf 2)
		const floppyUsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(2.0, 11.8, 0.4),
			new THREE.Vector3(0.0, 11.8, 0.6),
			new THREE.Vector3(-3.0, 11.8, 0.6),
			new THREE.Vector3(-5.2, 11.75, 0.8)
		]);
		const floppyUsbTube = new THREE.Mesh(new THREE.TubeGeometry(floppyUsbCurve, 24, 0.065, 8, false), blackUsbMat);
		scene.add(floppyUsbTube);

		// 8. Black USB 3.0 Cable: ONEFIVE Storage Enclosure -> Intel NUC USB port (Shelf 1)
		const onefiveUsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(4.2, 16.9, 0.6),
			new THREE.Vector3(4.4, 17.1, 0.0),
			new THREE.Vector3(4.8, 17.2, -0.4)
		]);
		const onefiveUsbTube = new THREE.Mesh(new THREE.TubeGeometry(onefiveUsbCurve, 16, 0.07, 8, false), blackUsbMat);
		scene.add(onefiveUsbTube);

		// 9. Black USB 3.0 SATA Cable: Samsung 870 EVO SSD -> FREEHPGAMER Desktop rear I/O (Shelf 1)
		const evoUsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(3.5, 17.3, 1.6),
			new THREE.Vector3(1.5, 17.0, 0.0),
			new THREE.Vector3(-1.0, 17.0, 0.0),
			new THREE.Vector3(-3.0, 17.2, -0.6)
		]);
		const evoUsbTube = new THREE.Mesh(new THREE.TubeGeometry(evoUsbCurve, 26, 0.07, 8, false), blackUsbMat);
		scene.add(evoUsbTube);

		// 10. White Apple 30-Pin USB Charging Cable: Dulex AC Outlet Apple Brick -> iPod Touch Miner
		const ipodChargeCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(-10.8, 10.52, -2.25),
			new THREE.Vector3(-11.2, 10.0, -2.6),
			new THREE.Vector3(-11.4, 9.7, -3.2),
			new THREE.Vector3(-11.1, 9.8, -3.4)
		]);
		const ipodChargeTube = new THREE.Mesh(new THREE.TubeGeometry(ipodChargeCurve, 20, 0.065, 8, false), whiteUsbMat);
		scene.add(ipodChargeTube);

		// 11. Black Micro-USB Charging Cable: Duplex AC Outlet Black Brick -> Samsung Galaxy Player
		const playerChargeCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(-10.8, 9.88, -2.25),
			new THREE.Vector3(-11.5, 9.5, -2.6),
			new THREE.Vector3(-13.0, 9.4, -3.2),
			new THREE.Vector3(-13.2, 9.8, -3.4)
		]);
		const playerChargeTube = new THREE.Mesh(new THREE.TubeGeometry(playerChargeCurve, 24, 0.065, 8, false), blackUsbMat);
		scene.add(playerChargeTube);

		// 12. Black USB 5V Power Cable: 2011 Mac left USB port to Centrifugal Blower Fan (Overhead Yoga Mount, Shelf 4)
		const fanUsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(4.5, 2.0, -0.4),
			new THREE.Vector3(1.5, 1.8, -0.5),
			new THREE.Vector3(-1.0, 1.8, -0.4),
			new THREE.Vector3(-3.8, 3.8, -0.4),
			new THREE.Vector3(-4.3, 5.8, -0.2),
			new THREE.Vector3(-4.5, 5.82, 0.0)
		]);
		const fanUsbTube = new THREE.Mesh(new THREE.TubeGeometry(fanUsbCurve, 32, 0.07, 8, false), blackUsbMat);
		scene.add(fanUsbTube);

		// 13. Black USB Cable: 2011 Mac to Samsung Galaxy S4 Mini (Shelf 4 left side)
		const s4UsbCurve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(4.8, 2.0, 0.0),
			new THREE.Vector3(0.0, 1.8, -0.5),
			new THREE.Vector3(-4.0, 1.8, -0.5),
			new THREE.Vector3(-7.8, 1.96, -0.9)
		]);
		const s4UsbTube = new THREE.Mesh(new THREE.TubeGeometry(s4UsbCurve, 28, 0.065, 8, false), blackUsbMat);
		scene.add(s4UsbTube);

		// 14. Rear AC Power Drops along rear uprights
		const pwrCurve1 = new THREE.CatmullRomCurve3([
			new THREE.Vector3(-9.8, 16.0, -2.0),
			new THREE.Vector3(-9.8, 11.0, -2.0),
			new THREE.Vector3(-9.8, 6.0, -2.0),
			new THREE.Vector3(-9.8, 1.0, -2.0),
			new THREE.Vector3(-9.8, 0.2, -2.0)
		]);
		const pwrTube1 = new THREE.Mesh(new THREE.TubeGeometry(pwrCurve1, 30, 0.12, 8, false), powerCordMat);
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

		// Camera preset dropdown menu listener
		const angleSelect = document.getElementById('camera-angle-select');
		if (angleSelect) {
			angleSelect.addEventListener('change', () => {
				const preset = angleSelect.value;
				if (CAMERA_PRESETS[preset]) {
					animateCamera(CAMERA_PRESETS[preset].pos, CAMERA_PRESETS[preset].target);
				}
			});
		}

		// Backward-compatible buttons if present
		document.querySelectorAll('.camera-preset-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const preset = btn.getAttribute('data-preset');
				if (CAMERA_PRESETS[preset]) {
					if (angleSelect) angleSelect.value = preset;
					animateCamera(CAMERA_PRESETS[preset].pos, CAMERA_PRESETS[preset].target);
				}
			});
		});

		const resetBtn = document.getElementById('reset-3d-camera-btn');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => {
				if (angleSelect) angleSelect.value = 'perspective';
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

	// Dynamic whole-device hover lighting: illuminates the entire device lighter white on hover
	function highlightNode(targetMesh) {
		if (hoveredMesh === targetMesh) return;
		unhighlightNode();
		hoveredMesh = targetMesh;

		// Traverse the target and its hierarchy to brighten every part
		let root = targetMesh;
		while (root.parent && root.parent !== scene && (root.parent.userData.nodeId === targetMesh.userData.nodeId || !root.userData.nodeId)) {
			if (root.parent.userData.nodeId) {
				root = root.parent;
			} else {
				break;
			}
		}

		root.traverse(child => {
			if (child.isMesh && child.material) {
				if (child.material.emissive) {
					if (child.userData.origEmissive === undefined) {
						child.userData.origEmissive = child.material.emissive.getHex();
						child.userData.origEmissiveInt = child.material.emissiveIntensity || 0;
					}
					child.material.emissive.setHex(0xffffff);
					child.material.emissiveIntensity = 0.45;
				} else if (child.material.color) {
					if (child.userData.origColor === undefined) {
						child.userData.origColor = child.material.color.getHex();
					}
					child.material.color.setHex(0xffffff);
				}
			}
			if (child.userData && child.userData.outlineLine) {
				child.userData.outlineLine.material.color.setHex(0xffffff);
				child.userData.outlineLine.material.opacity = 1.0;
			}
		});
	}

	function unhighlightNode() {
		if (hoveredMesh) {
			let root = hoveredMesh;
			while (root.parent && root.parent !== scene && (root.parent.userData.nodeId === hoveredMesh.userData.nodeId || !root.userData.nodeId)) {
				if (root.parent.userData.nodeId) {
					root = root.parent;
				} else {
					break;
				}
			}

			root.traverse(child => {
				if (child.isMesh && child.material) {
					if (child.userData.origEmissive !== undefined && child.material.emissive) {
						child.material.emissive.setHex(child.userData.origEmissive);
						child.material.emissiveIntensity = child.userData.origEmissiveInt || 0;
					}
					if (child.userData.origColor !== undefined && child.material.color) {
						child.material.color.setHex(child.userData.origColor);
					}
				}
				if (child.userData && child.userData.outlineLine) {
					child.userData.outlineLine.material.color.setHex(0x38bdf8);
					child.userData.outlineLine.material.opacity = 0.65;
				}
			});
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
			const t = time * 0.00045;
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
