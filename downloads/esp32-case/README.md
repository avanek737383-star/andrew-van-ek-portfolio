# ELEGOO ESP-32 Dev Board (ESP-WROOM-32, USB-C) Travel Case

**Target Board:** ELEGOO 3PCS ESP-32 Dev Boards, ESP-WROOM-32, USB-C, 30-Pin ([Amazon ASIN B0D8T53CQ5](https://www.amazon.com/dp/B0D8T53CQ5))  
**Design Priorities:** High-Performance RF Signal Integrity (Zero Detuning), On-the-Go Pin Protection, Generous USB-C Collar Clearance, Direct EN/BOOT Access, 100% Support-Free 3D Printing.

---

## 1. Included Files

| File | Purpose |
|---|---|
| [`ESP32_Elegoo_Case_3X_Plate.stl`](ESP32_Elegoo_Case_3X_Plate.stl) | **All-in-one 3-Pack Plate:** 3 Bases + 3 Lids arranged on a single build plate (117×121 mm). Prints in 1 job! |
| [`ESP32_Elegoo_Case_Base.stl`](ESP32_Elegoo_Case_Base.stl) | Lower enclosure body with internal corner standoffs & pin cavity. Single copy. |
| [`ESP32_Elegoo_Case_Lid.stl`](ESP32_Elegoo_Case_Lid.stl) | Snap-fit top cover with antenna window, ventilation, & button holes. Ready to slice. |
| [`ESP32_Elegoo_Case.scad`](ESP32_Elegoo_Case.scad) | Full parametric OpenSCAD source code for custom modifications. |

---

## 2. Key Engineering & Dimensional Verification

1. **Zero-Collision Component Clearance:**
   - **PCB Standoff Shelf:** The 4 PCB corners sit firmly on corner posts at $Z = 11.0\text{ mm}$.
   - **Board Surface:** The top surface of the PCB is at $Z = 12.6\text{ mm}$.
   - **Tallest Component:** The ESP32 metal shield can and USB-C port top reach $Z = 15.8\text{ mm}$ (3.2 mm above PCB).
   - **Base Wall Height:** Base walls reach $Z = 17.5\text{ mm}$ ($1.7\text{ mm}$ of clear open air ABOVE all components).
   - **Snap Skirt Clearance:** The lid's snap tabs insert $1.8\text{ mm}$ down to $Z = 15.7\text{ mm}$. They are positioned along the outer side walls ($X = \pm 14.5\text{ mm}$), staying $5.5\text{ mm}$ away from the central shield can and $3.1\text{ mm}$ above the PCB surface. **The lid closes 100% flush with zero component interference.**

2. **Full Downward Pin Protection (On-the-Go Safe):**
   - The pre-soldered header pins extend 6.0 mm below the 2.5 mm plastic spacer (8.5 mm total depth).
   - The case interior features **corner standoffs** supporting the PCB at $Z = 11.0\text{ mm}$, providing a deep **9.4 mm pin drop cavity**.
   - Your downward pins hang suspended in open air inside the case ($0.9\text{ mm}$ above floor)—they will never touch the bottom floor, bend in a backpack, or short against keys/coins.

3. **Zero RF Signal Detuning (Antenna Window):**
   - The onboard 2.4 GHz meander trace antenna is located on the end opposite the USB-C connector.
   - Enclosing this antenna in solid plastic alters the dielectric constant ($\epsilon_r \approx 3.0$ for PLA/PETG vs $1.0$ for air), shifting resonance and dropping signal by 6–12 dB.
   - This design features a **22.0 mm &times; 10.0 mm open aperture cutout** directly over the antenna trace so the RF field radiates directly into open air.

4. **Wide USB-C Clearance:**
   - Cutout is **12.5 mm wide &times; 6.3 mm tall**, starting right at PCB level ($Z = 11.2\text{ mm}$) to the top of the base.
   - Fits standard, thick, or braided USB-C cable collars without binding or blocking insertion.

5. **Dedicated Tactile Button Access:**
   - 4.2 mm circular port cutouts directly over the **EN (Reset)** and **BOOT** pushbuttons so you can trigger them with a pen tip, stylus, or paperclip without opening the case.

6. **Thermal Dissipation:**
   - 4 slotted ventilation louvers over the central ESP-WROOM-32 metal RF shield can provide passive convection cooling during high-power Wi-Fi/BLE transmission.

---

## 3. How to Submit at Grand Valley State University (GVSU)

Printing is **100% free** for GVSU students at the **Atomic Object Technology Showcase**:

* **Location:** Atrium, Mary Idema Pew Library (Allendale Campus)
* **Email:** `techshow@mail.gvsu.edu` | **Phone:** (616) 331-9536
* **How to Submit:**
  1. Copy `ESP32_Elegoo_Case_Base.stl` and `ESP32_Elegoo_Case_Lid.stl` to a USB flash drive, or attach them in an email from your student GVSU email account to `techshow@mail.gvsu.edu`.
  2. Stop by the Technology Showcase desk in the library atrium with your GVSU Student ID card.
  3. Let them know you'd like to print both `.stl` files in standard PLA (or PETG if available). Both files combined take less than 1 hour to print.
* **Print Settings:**
  * **Supports:** OFF / None
  * **Infill:** 15% – 20%
  * **Layer Height:** 0.20 mm
