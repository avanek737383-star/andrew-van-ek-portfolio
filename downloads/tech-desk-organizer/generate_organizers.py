import os
import sys
import numpy as np
import manifold3d as m3d
import trimesh
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

OUT_DIR = os.path.expanduser("~/Downloads/GVSU_Showcase_Organizer_STLs")
os.makedirs(OUT_DIR, exist_ok=True)

def make_base(dx=120.0, dy=80.0, dz=25.0, r=3.0):
    cs = m3d.CrossSection.square([dx - 2*r, dy - 2*r], center=True).offset(r, m3d.JoinType.Round)
    return m3d.Manifold.extrude(cs, dz)

def build_mod1():
    # 01: Hardware Scoop Tray
    dx, dy, dz = 120.0, 80.0, 25.0
    base = make_base(dx, dy, dz)
    z_floor = 3.5
    H = 22.5
    Rb = 4.0
    
    pts = []
    pts.append([-16.0, z_floor + H + 1.0])
    pts.append([-16.0, z_floor + Rb])
    for a in np.linspace(np.pi, 1.5*np.pi, 10):
        pts.append([-16.0 + Rb + Rb*np.cos(a), z_floor + Rb + Rb*np.sin(a)])
    pts.append([0.0, z_floor])
    for a in np.linspace(-0.5*np.pi, 0.0, 20):
        pts.append([16.0 + 16.0*np.sin(a), z_floor + 16.0 - 16.0*np.cos(a)])
    pts.append([16.0, z_floor + H + 1.0])
    
    cs_scoop = m3d.CrossSection([pts])
    cavity = m3d.Manifold.extrude(cs_scoop, 34.0).translate([0, 0, -17.0]).rotate([0, 90, 0])
    
    x_centers = [-38.0, 0.0, 38.0]
    y_centers = [-19.5, 19.5]
    all_cavities = [cavity.translate([xc, yc, 0]) for xc in x_centers for yc in y_centers]
    
    cutout = m3d.Manifold.batch_boolean(all_cavities, m3d.OpType.Add)
    return base - cutout

def build_mod2():
    # 02: Driver, Pen & Multitool Caddy
    dx, dy, dz = 120.0, 80.0, 45.0
    base = make_base(dx, dy, dz)
    cuts = []
    
    # Parker driver / fat pens
    cuts.append(m3d.Manifold.cylinder(41.0, 15.5/2, 15.5/2, 36).translate([-36.0, 24.0, 5.0]))
    cuts.append(m3d.Manifold.cylinder(41.0, 15.5/2, 15.5/2, 36).translate([-12.0, 24.0, 5.0]))
    
    # Standard pens / pencils
    cuts.append(m3d.Manifold.cylinder(41.0, 12.0/2, 12.0/2, 32).translate([12.0, 24.0, 5.0]))
    cuts.append(m3d.Manifold.cylinder(41.0, 12.0/2, 12.0/2, 32).translate([36.0, 24.0, 5.0]))
    
    # Stepped precision screwdrivers
    for x in [-42.0, -26.0, -10.0, 6.0]:
        cuts.append(m3d.Manifold.cylinder(41.0, 5.5/2, 5.5/2, 24).translate([x, 0.0, 5.0]))
        cuts.append(m3d.Manifold.cylinder(17.0, 9.5/2, 9.5/2, 24).translate([x, 0.0, 29.0]))
        
    # Micro bits (4mm hex)
    for x in [22.0, 34.0, 46.0]:
        for y in [-4.0, 6.0]:
            cuts.append(m3d.Manifold.cylinder(17.0, 4.8/2, 4.8/2, 20).translate([x, y, 29.0]))
            
    # Front horizontal tray
    cs_tray = m3d.CrossSection.square([110 - 8, 20 - 8], center=True).offset(4.0, m3d.JoinType.Round)
    tray = m3d.Manifold.extrude(cs_tray, 17.0).translate([0.0, -23.0, 29.0])
    cuts.append(tray)
    
    cutout = m3d.Manifold.batch_boolean(cuts, m3d.OpType.Add)
    return base - cutout

def build_mod3():
    # 03: RAM & Thermal Station
    dx, dy, dz = 120.0, 80.0, 35.0
    base = make_base(dx, dy, dz)
    cuts = []
    
    # 4 SODIMM slots
    for y in [-26.0, -16.0, -6.0, 4.0]:
        cuts.append(m3d.Manifold.cube([72.0, 4.8, 24.0], center=True).translate([-18.0, y, 24.0]))
        
    # Desktop DIMM pass-through slot
    cuts.append(m3d.Manifold.cube([124.0, 5.2, 25.0], center=True).translate([0.0, 16.0, 24.0]))
    
    # PTM7950 vault
    cuts.append(m3d.Manifold.cube([80.0, 7.5, 27.0], center=True).translate([-14.0, 29.0, 23.5]))
    
    # Thermal paste syringe well
    cuts.append(m3d.Manifold.cylinder(30.0, 18.5/2, 18.5/2, 32).translate([42.0, -12.0, 6.0]))
    
    # Spatula / wipe well
    cuts.append(m3d.Manifold.cube([22.0, 12.0, 27.0], center=True).translate([42.0, 10.0, 23.5]))
    
    cutout = m3d.Manifold.batch_boolean(cuts, m3d.OpType.Add)
    return base - cutout

def build_mod4():
    # 04: 2.5" HDD, Phone & Adapter Dock
    dx, dy, dz = 120.0, 80.0, 45.0
    base = make_base(dx, dy, dz)
    cuts = []
    
    # 2.5" HDD slot
    cuts.append(m3d.Manifold.cube([74.0, 12.0, 39.0], center=True).translate([0.0, 20.0, 26.5]))
    # Finger grip scallops
    cuts.append(m3d.Manifold.cylinder(23.0, 9.5, 9.5, 24).translate([-37.0, 20.0, 24.0]))
    cuts.append(m3d.Manifold.cylinder(23.0, 9.5, 9.5, 24).translate([37.0, 20.0, 24.0]))
    
    # Flip phone cradle
    cuts.append(m3d.Manifold.cube([58.0, 26.0, 38.0], center=True).translate([-26.0, -16.0, 27.0]))
    
    # Wii2HDMI slot
    cuts.append(m3d.Manifold.cube([38.0, 18.0, 38.0], center=True).translate([32.0, -23.0, 27.0]))
    
    # Secondary adapter slot
    cuts.append(m3d.Manifold.cube([38.0, 14.0, 38.0], center=True).translate([32.0, -1.0, 27.0]))
    
    cutout = m3d.Manifold.batch_boolean(cuts, m3d.OpType.Add)
    return base - cutout

def build_mod5():
    # 05: Disc Rack & Utility Tray
    dx, dy, dz = 120.0, 80.0, 45.0
    base = make_base(dx, dy, dz)
    cuts = []
    
    # 2 curved disc slots
    for y in [18.0, 29.0]:
        disc_cutter = m3d.Manifold.cylinder(3.5, 60.0, 60.0, 64).rotate([90, 0, 0]).translate([0.0, y + 1.75, 76.0])
        top_clear = m3d.Manifold.cube([100.0, 3.5, 20.0], center=True).translate([0.0, y, 46.0])
        cuts.extend([disc_cutter, top_clear])
        
    # 4 USB-A slots
    for x in [-40.0, -20.0]:
        for y in [-26.0, -14.0]:
            cuts.append(m3d.Manifold.cube([13.5, 6.0, 18.0], center=True).translate([x, y, 37.0]))
            
    # 2 SD Card slots
    for y in [-2.0, 7.0]:
        cuts.append(m3d.Manifold.cube([26.0, 3.2, 18.0], center=True).translate([-30.0, y, 37.0]))
        
    # Catch-all pocket
    cs_pocket = m3d.CrossSection.square([52 - 6, 34 - 6], center=True).offset(3.0, m3d.JoinType.Round)
    cuts.append(m3d.Manifold.extrude(cs_pocket, 34.0).translate([26.0, -10.0, 13.0]))
    
    cutout = m3d.Manifold.batch_boolean(cuts, m3d.OpType.Add)
    return base - cutout

modules = [
    ("01_Laptop_Hardware_Scoop_Tray.stl", "Laptop Screws & Hardware (Filleted Scoop Bottom)", build_mod1),
    ("02_Driver_Pen_and_Multitool_Caddy.stl", "Parker Multitool, Pens & Precision Drivers", build_mod2),
    ("03_RAM_and_PTM7950_Thermal_Station.stl", "SODIMM/DIMM RAM & PTM7950 Thermal Vault", build_mod3),
    ("04_Archival_HDD_Phone_Wii2HDMI_Dock.stl", "2.5\" HDD, Retro Phone & Wii2HDMI Dock", build_mod4),
    ("05_Disc_Rack_and_Catchall_Utility_Tray.stl", "CD/DVD Disc Rack, USB/SD & Catch-All Tray", build_mod5),
]

generated_meshes = []

print("=== GENERATING 5 MODULAR STL ORGANIZERS FOR GVSU SHOWCASE ===")
for filename, desc, builder in modules:
    print(f"\nBuilding: {filename} ({desc})...")
    m = builder()
    mesh_data = m.to_mesh()
    tri = trimesh.Trimesh(vertices=mesh_data.vert_properties[:, :3], faces=mesh_data.tri_verts)
    
    out_path = os.path.join(OUT_DIR, filename)
    tri.export(out_path, file_type='stl')
    
    vol = tri.volume / 1000.0
    dims = tri.bounds[1] - tri.bounds[0]
    weight_g = vol * 1.24 * 0.22 # approx 20-25% infill + perimeters
    print(f"  ✓ Watertight: {tri.is_watertight}")
    print(f"  ✓ Bounds: {dims[0]:.1f} x {dims[1]:.1f} x {dims[2]:.1f} mm")
    print(f"  ✓ Volume: {vol:.1f} cm3")
    print(f"  ✓ Est PLA Weight: ~{weight_g:.0f}g")
    print(f"  ✓ Saved to: {out_path}")
    generated_meshes.append((filename, desc, tri))

print("\nAll 5 STLs generated successfully!")
