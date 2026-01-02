
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal, Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { DecalData, ToolMode } from '../types';

interface ViewportProps {
  modelUrl: string | null;
  decals: DecalData[];
  selectedId: string | null;
  onModelClick: (position: [number, number, number], rotation: [number, number, number], mesh: THREE.Mesh) => void;
  onSelectDecal: (id: string) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalData>) => void;
  toolMode: ToolMode;
  onSetToolMode: (mode: ToolMode) => void;
  onAssetUpload: () => void;
  onSceneReady?: (scene: THREE.Group) => void;
  isReviewMode: boolean;
  environment: 'studio' | 'sunset' | 'warehouse';
  gridVisible: boolean;
  isRotating: boolean;
  wireframeMode: boolean;
  onToggleGrid: () => void;
  onToggleRotation: () => void;
  onToggleWireframe: () => void;
}

const AutoFraming: React.FC<{ scene: THREE.Group | null, resetKey: number }> = ({ scene, resetKey }) => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!scene || !controls) return;
    
    const timer = setTimeout(() => {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const sceneSize = new THREE.Vector3();
      box.getSize(sceneSize);
      
      const maxDim = Math.max(sceneSize.x, sceneSize.y, sceneSize.z);
      if (maxDim === 0) return;

      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const fov = perspectiveCamera.fov;
      const aspect = perspectiveCamera.aspect;
      
      const baseFovFactor = 1.2 / Math.tan((fov * Math.PI) / 360);
      const targetDistance = maxDim * baseFovFactor * (aspect < 1 ? 1 / aspect : 1);
      
      const orbit = controls as any;
      orbit.target.copy(center);
      camera.position.set(center.x, center.y + sceneSize.y * 0.1, center.z + targetDistance);
      camera.updateProjectionMatrix();
      orbit.update();
    }, 100);

    return () => clearTimeout(timer);
  }, [scene, camera, controls, resetKey]);
  return null;
};

const DecalItem: React.FC<{ 
  decal: DecalData; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  scene: THREE.Group;
  isMirror?: boolean;
  onDragStart: (e: any) => void;
  toolMode: ToolMode;
  isReviewMode: boolean;
}> = ({ decal, isSelected, onSelect, scene, isMirror, onDragStart, toolMode, isReviewMode }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const targetMesh = useMemo(() => {
    let found: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh && (child.name === decal.meshName || child.uuid === decal.meshName)) {
        found = child as THREE.Mesh;
      }
    });
    if (!found) {
      scene.traverse((child) => { if (!found && (child as THREE.Mesh).isMesh) found = child as THREE.Mesh; });
    }
    return found;
  }, [scene, decal.meshName]);

  useEffect(() => {
    let isMounted = true;
    const canvas = document.createElement('canvas');
    canvas.width = 1024; 
    canvas.height = 1024;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const render = async () => {
      ctx.clearRect(0, 0, 1024, 1024);
      
      if (decal.type === 'logo') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = decal.content;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        if (!isMounted) return;

        if (isMirror) {
          ctx.save();
          ctx.translate(1024, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, 0, 0, 1024, 1024);
        if (isMirror) ctx.restore();
      } else {
        try {
          await document.fonts.load('900 180px "Plus Jakarta Sans"');
        } catch (e) {
          console.warn("Font loading failed, falling back.");
        }
        
        if (!isMounted) return;

        ctx.fillStyle = decal.color || '#3b82f6';
        ctx.font = '900 180px sans-serif'; // Fallback immediately, then replace if possible
        if (document.fonts.check('900 180px "Plus Jakarta Sans"')) {
          ctx.font = '900 180px "Plus Jakarta Sans"';
        }
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (isMirror) {
          ctx.save();
          ctx.translate(512, 512);
          ctx.scale(-1, 1);
          ctx.translate(-512, -512);
        }
        ctx.fillText(decal.content, 512, 512);
        if (isMirror) ctx.restore();
      }

      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 16;
      t.needsUpdate = true;
      if (isMounted) setTexture(t);
    };

    render();
    return () => { isMounted = false; };
  }, [decal.content, decal.color, decal.type, isMirror]);

  if (!targetMesh || !texture || !decal.visible) return null;

  const depth = Math.max(decal.scale[0], decal.scale[1]) * 4;
  const finalPos = isMirror ? [ -decal.position[0], decal.position[1], decal.position[2] ] : decal.position;
  const finalRot = isMirror ? [ decal.rotation[0], -decal.rotation[1], -decal.rotation[2] ] : decal.rotation;

  return (
    <group>
      {/* Fix: Wrap targetMesh in a RefObject-like structure to satisfy the 'mesh' prop requirements. */}
      <Decal
        mesh={{ current: targetMesh } as any}
        position={finalPos as any}
        rotation={finalRot as any}
        scale={[decal.scale[0], decal.scale[1], depth]} 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(decal.id);
        }}
        onPointerDown={(e) => {
          if (toolMode === ToolMode.SELECT && isSelected && !isMirror && !isReviewMode) {
             e.stopPropagation();
             onDragStart(e);
          }
        }}
      >
        <meshStandardMaterial
          map={texture}
          transparent={true}
          opacity={decal.opacity ?? 1}
          roughness={decal.roughness ?? 0.5}
          metalness={decal.metalness ?? 0}
          alphaTest={0.01}
          polygonOffset={true}
          polygonOffsetFactor={-15} 
          polygonOffsetUnits={-1}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </Decal>
      
      {isSelected && !isMirror && (
        <group position={decal.position} rotation={decal.rotation}>
          <mesh>
             <boxGeometry args={[decal.scale[0] * 1.1, decal.scale[1] * 1.1, 0.02]} />
             <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const Viewport: React.FC<ViewportProps> = ({ 
  modelUrl, decals, selectedId, onModelClick, onSelectDecal, onUpdateDecal, toolMode, onSetToolMode, onAssetUpload, onSceneReady, isReviewMode, environment,
  gridVisible, isRotating, wireframeMode, onToggleGrid, onToggleRotation, onToggleWireframe
}) => {
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const controlsRef = useRef<any>(null);
  const { scene: modelGroup } = useGLTF(modelUrl || '');

  useEffect(() => {
    if (modelGroup) {
      const box = new THREE.Box3().setFromObject(modelGroup);
      const minY = box.min.y;
      modelGroup.position.y -= minY;

      modelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.castShadow = m.receiveShadow = true;
          if (m.material) {
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            mats.forEach(mat => { 
                mat.depthWrite = true; 
                mat.side = THREE.DoubleSide;
                (mat as any).wireframe = wireframeMode;
            });
          }
        }
      });
      setLoadedScene(modelGroup);
      if (onSceneReady) onSceneReady(modelGroup);
    }
  }, [modelGroup, onSceneReady, wireframeMode]);

  const updatePosition = (e: any) => {
    if (!selectedId || !e.face || !e.object || isReviewMode) return;
    const mesh = e.object as THREE.Mesh;
    mesh.updateMatrixWorld();
    const localPoint = mesh.worldToLocal(e.point.clone());
    const worldNormal = e.face.normal.clone().applyMatrix4(new THREE.Matrix4().extractRotation(mesh.matrixWorld));
    const localNormal = worldNormal.clone().applyQuaternion(mesh.quaternion.clone().invert());
    const helper = new THREE.Object3D();
    helper.position.copy(localPoint);
    helper.lookAt(localPoint.clone().add(localNormal));
    onUpdateDecal(selectedId, {
      position: [localPoint.x, localPoint.y, localPoint.z],
      rotation: [helper.rotation.x, helper.rotation.y, helper.rotation.z],
      meshName: mesh.name || mesh.uuid
    });
  };

  const handleResetView = () => setResetKey(p => p + 1);

  const handleZoom = (direction: 'in' | 'out') => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object as THREE.PerspectiveCamera;
    const target = controls.target;
    const directionVec = new THREE.Vector3().subVectors(camera.position, target);
    const zoomFactor = direction === 'in' ? 0.8 : 1.25;
    directionVec.multiplyScalar(zoomFactor);
    if (directionVec.length() < 0.1 && direction === 'in') return;
    if (directionVec.length() > 5000 && direction === 'out') return;
    camera.position.copy(target).add(directionVec);
    controls.update();
  };

  return (
    <div className="relative w-full h-full bg-[#030305] overflow-hidden">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true, powerPreference: "high-performance" }} 
        onPointerMissed={() => !isReviewMode && onSelectDecal('')}
        camera={{ fov: 45, near: 0.1, far: 10000 }}
      >
        <Suspense fallback={null}>
          <Environment preset={environment} />
          <ambientLight intensity={0.5} />
          <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={2} castShadow />
          
          <AutoFraming 
            scene={loadedScene} 
            resetKey={resetKey} 
          />

          <group 
            onClick={(e) => {
              if (toolMode === ToolMode.SELECT || isReviewMode) return;
              e.stopPropagation();
              const mesh = e.object as THREE.Mesh;
              mesh.updateMatrixWorld();
              const localPoint = mesh.worldToLocal(e.point.clone());
              const worldNormal = e.face!.normal.clone().applyMatrix4(new THREE.Matrix4().extractRotation(mesh.matrixWorld));
              const localNormal = worldNormal.clone().applyQuaternion(mesh.quaternion.clone().invert());
              const helper = new THREE.Object3D();
              helper.position.copy(localPoint);
              helper.lookAt(localPoint.clone().add(localNormal));
              onModelClick([localPoint.x, localPoint.y, localPoint.z], [helper.rotation.x, helper.rotation.y, helper.rotation.z], mesh);
            }}
            onPointerMove={(e) => { 
                if (isDragging && selectedId && !isReviewMode) {
                    updatePosition(e);
                }
            }}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => setIsDragging(false)}
          >
            {loadedScene && <primitive object={loadedScene} />}
            {loadedScene && decals.map((decal) => (
              <React.Fragment key={decal.id}>
                <DecalItem 
                    decal={decal} 
                    isSelected={decal.id === selectedId && !isReviewMode} 
                    onSelect={onSelectDecal} 
                    scene={loadedScene} 
                    onDragStart={() => setIsDragging(true)}
                    toolMode={toolMode}
                    isReviewMode={isReviewMode}
                />
                {decal.mirror && (
                    <DecalItem 
                        decal={decal} 
                        isMirror 
                        isSelected={false} 
                        onSelect={() => {}} 
                        scene={loadedScene} 
                        onDragStart={() => {}}
                        toolMode={toolMode}
                        isReviewMode={isReviewMode}
                    />
                )}
              </React.Fragment>
            ))}
          </group>
          <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={40} blur={2.5} far={10} />
          
          {gridVisible && (
            <Grid 
              sectionSize={1} 
              sectionThickness={1} 
              sectionColor="#3b82f6" 
              args={[100, 100]} 
              cellColor="#1a1a1a" 
              fadeDistance={50} 
              infiniteGrid 
              position={[0, 0, 0]} 
            />
          )}

          <OrbitControls 
            ref={controlsRef} 
            makeDefault 
            enableDamping 
            dampingFactor={0.07} 
            autoRotate={isRotating}
            autoRotateSpeed={2}
            enableRotate={!isDragging}
            enablePan={!isDragging}
            enableZoom={!isDragging}
          />
        </Suspense>
      </Canvas>

      {!isReviewMode && (
        <>
          <div className="absolute top-4 sm:top-1/2 sm:-translate-y-1/2 left-3 sm:left-8 flex flex-row sm:flex-col gap-2 sm:gap-4 p-2 sm:p-3 bg-[#0a0a0c]/85 backdrop-blur-3xl rounded-full sm:rounded-[2rem] border border-white/5 shadow-2xl z-50 pointer-events-auto transition-all">
            <button
              onClick={() => onSetToolMode(ToolMode.SELECT)}
              className={`size-10 sm:size-16 flex flex-col items-center justify-center rounded-full sm:rounded-2xl transition-all ${toolMode === ToolMode.SELECT ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
              title="Select"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[32px]">near_me</span>
              <span className="text-[7px] sm:text-[8px] font-black uppercase mt-1 font-mono hidden sm:inline">Pick</span>
            </button>

            <button
              onClick={() => onSetToolMode(ToolMode.PLACE_TEXT)}
              className={`size-10 sm:size-16 flex flex-col items-center justify-center rounded-full sm:rounded-2xl transition-all ${toolMode === ToolMode.PLACE_TEXT ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
              title="Text"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[32px]">title</span>
              <span className="text-[7px] sm:text-[8px] font-black uppercase mt-1 font-mono hidden sm:inline">Text</span>
            </button>

            <button
              onClick={() => { onAssetUpload(); }}
              className={`size-10 sm:size-16 flex flex-col items-center justify-center rounded-full sm:rounded-2xl transition-all ${toolMode === ToolMode.PLACE_LOGO ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
              title="Asset"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[32px]">add_photo_alternate</span>
              <span className="text-[7px] sm:text-[8px] font-black uppercase mt-1 font-mono hidden sm:inline">Asset</span>
            </button>
          </div>

          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-50 pointer-events-auto transition-all pb-[env(safe-area-inset-bottom)] sm:pb-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={onToggleGrid}
                className={`p-2 sm:p-3 rounded-full transition-all flex items-center justify-center ${gridVisible ? 'bg-primary/20 text-primary' : 'text-zinc-600 hover:text-white'}`}
                title="Grid"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">grid_on</span>
              </button>
              <button 
                onClick={onToggleRotation}
                className={`p-2 sm:p-3 rounded-full transition-all flex items-center justify-center ${isRotating ? 'bg-primary/20 text-primary animate-spin-slow' : 'text-zinc-600 hover:text-white'}`}
                title="Rotate"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">sync</span>
              </button>
              <button 
                onClick={onToggleWireframe}
                className={`p-2 sm:p-3 rounded-full transition-all flex items-center justify-center ${wireframeMode ? 'bg-primary/20 text-primary' : 'text-zinc-600 hover:text-white'}`}
                title="Skeleton"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">texture</span>
              </button>
            </div>
            
            <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2" />

            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => handleZoom('in')}
                className="p-2 sm:p-3 text-zinc-600 hover:text-white transition-all active:scale-90 flex items-center justify-center"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">zoom_in</span>
              </button>
              <button 
                onClick={() => handleZoom('out')}
                className="p-2 sm:p-3 text-zinc-600 hover:text-white transition-all active:scale-90 flex items-center justify-center"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">zoom_out</span>
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2" />

            <button 
              onClick={handleResetView}
              className="p-2 sm:p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
              title="Reset"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">center_focus_strong</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
