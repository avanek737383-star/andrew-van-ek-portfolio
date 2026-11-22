// =============================================================================
// ELEGOO ESP32 Dev Board (ESP-WROOM-32, USB-C, 30-Pin) Travel Case
// Fully Parametric OpenSCAD Model
// Designed for: Zero RF Detuning, On-the-Go Pin Protection & Snap-Fit Closure
// =============================================================================

$fn = 40;

// Part selector: "all", "base", or "lid"
part = "all"; // [all: Both (assembled), base: Base Only, lid: Lid Only]

// --- Core Board Dimensions (mm) ---
pcb_length    = 51.74; // Measured length of ELEGOO ESP32 PCB
pcb_width     = 29.00; // Measured width of ELEGOO ESP32 PCB
pcb_thickness = 1.60;  // Standard FR4 board thickness
pin_depth     = 8.50;  // Header plastic spacer (~2.5mm) + 6mm pin tips
comp_h_max    = 3.20;  // Maximum component height above PCB (shield can & USB-C)

// --- Enclosure Parameters & Clearances (mm) ---
fit_clearance = 0.60;  // Per-side clearance (+1.2mm total for smooth insertion)
wall_t        = 1.60;  // Enclosure wall thickness (4 perimeter loops with 0.4mm nozzle)
floor_t       = 1.60;  // Base floor thickness
ceil_t        = 1.60;  // Lid top plate thickness

int_l = pcb_length + 2 * fit_clearance; // 53.0 mm
int_w = pcb_width + 2 * fit_clearance;  // 30.2 mm
ext_l = int_l + 2 * wall_t;             // 56.2 mm
ext_w = int_w + 2 * wall_t;             // 33.4 mm

// Heights & Vertical Clearances
pin_clearance = 0.90; // Float distance between pin tips and base floor
shelf_z       = floor_t + pin_depth + pin_clearance; // 11.0 mm: PCB rests here
base_top_z    = shelf_z + pcb_thickness + comp_h_max + 1.70; // 17.5 mm: 1.7mm ABOVE all components!
total_h       = base_top_z + ceil_t; // 19.1 mm total external height

// USB-C Cutout Dimensions
usbc_w = 12.50; // Extra wide to fit chunky braided cable collars
usbc_z = 11.20; // Level with PCB surface for cable connector collar

// Buttons & Antenna Offsets
en_btn_x   = -8.50;
boot_btn_x =  8.50;
btn_y      = -int_l / 2 + 4.70;
btn_d      =  4.20; // Button hole diameter

// Antenna Window Dimensions (Over the onboard meander trace)
ant_w = 22.00;
ant_l = 10.00;
ant_y = int_l / 2 - ant_l / 2 - 0.50;

// =============================================================================
// Modules
// =============================================================================

module rounded_box(w, l, h, r = 2.0) {
    translate([-w/2 + r, -l/2 + r, 0])
    minkowski() {
        cube([w - 2*r, l - 2*r, h - 0.1]);
        cylinder(r = r, h = 0.1);
    }
}

module base() {
    difference() {
        // Outer Shell
        rounded_box(ext_w, ext_l, base_top_z, r = 2.0);
        
        // Main Interior Cavity (Open top)
        translate([-int_w/2, -int_l/2, floor_t])
            cube([int_w, int_l, base_top_z + 1]);
        
        // USB-C Front Cutout (U-shaped opening on front wall)
        translate([-usbc_w/2, -ext_l/2 - 1, usbc_z])
            cube([usbc_w, wall_t + 2, base_top_z - usbc_z + 1]);
            
        // Finger Pry Notch on rear seam
        translate([-6.0, ext_l/2 - 1.5, base_top_z - 1.2])
            cube([12.0, 3.0, 2.0]);
    }
    
    // 4 Corner PCB Support Standoffs (Ledges at Z = shelf_z)
    corner_x = 4.2;
    corner_y = 4.0;
    
    translate([-int_w/2, -int_l/2, floor_t])
        cube([corner_x, corner_y, shelf_z - floor_t]);
    translate([int_w/2 - corner_x, -int_l/2, floor_t])
        cube([corner_x, corner_y, shelf_z - floor_t]);
    translate([-int_w/2, int_l/2 - corner_y, floor_t])
        cube([corner_x, corner_y, shelf_z - floor_t]);
    translate([int_w/2 - corner_x, int_l/2 - corner_y, floor_t])
        cube([corner_x, corner_y, shelf_z - floor_t]);
        
    // Snap detents on inside walls
    translate([-int_w/2, -7.0, 16.2])
        cube([0.35, 14.0, 0.8]);
    translate([int_w/2 - 0.35, -7.0, 16.2])
        cube([0.35, 14.0, 0.8]);
}

module lid() {
    skirt_w = int_w - 0.50; // 29.7 mm (0.25mm clearance per side)
    skirt_l = int_l - 0.50; // 52.5 mm
    skirt_h = 1.80;         // Stays 3.1mm ABOVE the PCB surface
    skirt_t = 1.10;

    difference() {
        union() {
            // Top Plate
            rounded_box(ext_w, ext_l, ceil_t, r = 2.0);
            
            // Snap-fit Skirt (Inserts 1.8mm down into base)
            translate([0, 0, ceil_t])
            difference() {
                rounded_box(skirt_w, skirt_l, skirt_h, r = 1.2);
                translate([-(skirt_w - 2*skirt_t)/2, -(skirt_l - 2*skirt_t)/2, -0.5])
                    cube([skirt_w - 2*skirt_t, skirt_l - 2*skirt_t, skirt_h + 1]);
            }
            
            // Snap ridges on outer skirt sides
            translate([-skirt_w/2 - 0.35, -6.5, ceil_t + 0.8])
                cube([0.35, 13.0, 0.8]);
            translate([skirt_w/2, -6.5, ceil_t + 0.8])
                cube([0.35, 13.0, 0.8]);
        }
        
        // 1. Full Open Antenna Window (Zero dielectric detuning!)
        translate([-ant_w/2, ant_y - ant_l/2, -1])
            cube([ant_w, ant_l, ceil_t + skirt_h + 2]);
            
        // 2. EN Button Cutout
        translate([en_btn_x, btn_y, -1])
            cylinder(d = btn_d, h = ceil_t + 2);
            
        // 3. BOOT Button Cutout
        translate([boot_btn_x, btn_y, -1])
            cylinder(d = btn_d, h = ceil_t + 2);
            
        // 4. Heat Dissipation Vents (4 slots over ESP32 shield can)
        for (y_pos = [-6, -1, 4, 9]) {
            translate([-9.0, y_pos - 1.0, -1])
                cube([18.0, 2.0, ceil_t + 2]);
        }
        
        // 5. USB-C Top Collar Clearance on Skirt
        translate([-usbc_w/2, -ext_l/2 - 1, ceil_t - 0.5])
            cube([usbc_w, wall_t + 2, skirt_h + 1]);
    }
}

// =============================================================================
// Assembly Render
// =============================================================================
if (part == "all") {
    color([0.2, 0.4, 0.8, 0.9]) base();
    translate([0, 0, base_top_z + 10]) color([0.8, 0.8, 0.9, 0.9]) rotate([180, 0, 0]) lid();
} else if (part == "base") {
    base();
} else if (part == "lid") {
    rotate([0, 0, 0]) lid();
}
