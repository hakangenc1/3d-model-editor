# Studio3D: Precision Modeler

Studio3D is a high-performance, browser-based 3D design environment tailored for precision surface modification. It allows users to upload standard 3D assets (GLB/GLTF) and project decals, logos, and typography directly onto complex geometry with pixel-perfect accuracy.

![Design Mode](https://img.shields.io/badge/UI-Modern%20Dark-blue)
![Engine](https://img.shields.io/badge/Engine-Three.js%20%2B%20R3F-blueviolet)
![Performance](https://img.shields.io/badge/Performance-High-success)

## 🚀 Key Features

### 1. Precision Decal Projection
Utilizes projective geometry to snap textures and typography to the normals of your 3D mesh. Decals wrap naturally around curved surfaces, ensuring they never look "flat" or disconnected from the model.

### 2. Live Designer Suite
*   **Typography Engine:** Apply custom text with real-time editing, color selection, and font-weight control.
*   **Asset Upload:** Project your own SVG/PNG/JPG logos directly onto your model.
*   **Surface Snapping:** Drag decals across the surface of the model; the orientation automatically adjusts based on the underlying vertex normals.

### 3. Advanced Workspace Controls
*   **Mirroring:** Instantly duplicate and mirror decals across the X-axis for symmetrical designs (perfect for uniforms and footwear).
*   **Material Properties:** Fine-tune opacity, roughness, and metalness of applied decals to match the base model's material.
*   **Viewport Environments:** Toggle between 'Studio', 'Sunset', and 'Warehouse' lighting presets to see how your design reacts to different environments.

### 4. Pro Workflow Tools
*   **State History:** Robust Undo/Redo system to track every transformation.
*   **Review Mode (Showroom):** A distraction-free environment with auto-rotation to showcase finished designs.
*   **GLB Export:** Bake your decals into the scene and export as a single `.glb` file for use in other 3D software or AR/VR applications.

## 🛠 Tech Stack

*   **Frontend:** React 19 (ESM based)
*   **Rendering Engine:** Three.js
*   **React Integration:** `@react-three/fiber` & `@react-three/drei`
*   **Styling:** Tailwind CSS (Custom dark-theme palette)
*   **Icons:** Google Material Symbols

## 📖 How to Use

1.  **Initialize Studio:** Click "Enter Studio" and upload your `.glb` or `.gltf` model.
2.  **Select a Tool:** Use the sidebar icons to choose between 'Pick' (Select), 'Text', or 'Asset' modes.
3.  **Apply Decal:** Click anywhere on your model to project the selected asset. 
4.  **Refine:** Use the Inspector panel to adjust scale, rotation, mirroring, and material properties.
5.  **Review:** Toggle 'Showroom' to see the model in high-fidelity auto-rotation.
6.  **Export:** Click 'Export' to download your modified 3D asset.

## 🏗 Project Structure

```text
/
├── components/
│   ├── Viewport.tsx  # Core 3D engine and R3F Canvas logic
│   ├── Sidebar.tsx   # Transformation controls and Layer stack
│   ├── Header.tsx    # Project actions and mode toggles
├── types.ts          # Global state and interface definitions
├── App.tsx           # Application state and file handling
└── index.html        # Entry point and dependency configuration
```

## ⚖️ Performance Optimization

Studio3D uses several advanced techniques to maintain 60FPS even with complex models:
*   **Canvas Texture Memoization:** Textures are only re-generated when content changes.
*   **Polygon Offsetting:** Prevents Z-fighting (flickering) between the decal and the base mesh.
*   **Damping Controls:** Smooth OrbitControls for a high-end desktop-software feel.
*   **Lazy Loading:** 3D environments are loaded only when needed to minimize initial load time.

---

*Designed for senior engineers and professional 3D designers.*