
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Viewport } from './components/Viewport';
import { ToolMode, DecalData, AppState } from './types';
import { Header } from './components/Header';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const Meteors: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="meteor absolute h-[1px] w-[200px] bg-gradient-to-r from-primary via-blue-400 to-transparent opacity-0"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${2 + Math.random() * 5}s`,
          }}
        />
      ))}
      <style>{`
        .meteor {
          transform: rotate(-45deg);
          animation: meteor-fall linear infinite;
        }
        @keyframes meteor-fall {
          0% { transform: translate(600px, -600px) rotate(-45deg); opacity: 0; }
          5% { opacity: 1; }
          60% { opacity: 0.6; }
          100% { transform: translate(-800px, 800px) rotate(-45deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const HighTechLoader: React.FC<{ message?: string }> = ({ message = "Analyzing Geometries" }) => {
  return (
    <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-[#030305] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#3b82f611 1px, transparent 1px), linear-gradient(90deg, #3b82f611 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative flex flex-col items-center scale-75 sm:scale-100">
        <div className="relative size-48 mb-12">
            <div className="absolute inset-0 border-[1px] border-zinc-800 rounded-full" />
            <div className="absolute inset-[-8px] border-[1px] border-primary/20 rounded-full animate-spin-slow" />
            <div className="absolute inset-0 border-[3px] border-transparent border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary animate-pulse font-light">token</span>
                <span className="text-[8px] font-black text-primary/60 tracking-[0.4em] uppercase mt-2 font-mono">Engine.V3</span>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-h-scan" />
        </div>

        <div className="text-center space-y-4">
          <div className="text-primary font-mono text-[11px] tracking-[0.7em] uppercase animate-pulse">
            {message}
          </div>
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes h-scan {
          0% { transform: translate(-50%, 0); opacity: 0; }
          50% { transform: translate(-50%, 192px); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 0; }
        }
        .animate-h-scan {
          animation: h-scan 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

const INITIAL_STATE: AppState = {
  modelUrl: null,
  decals: [],
  history: [{ decals: [], selectedId: null }],
  historyIndex: 0,
  selectedDecalId: null,
  toolMode: ToolMode.SELECT,
  currentText: 'BRAND NAME',
  currentLogoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
  isSidebarOpen: true,
  isSidebarVisible: true,
  isReviewMode: false,
  modelScale: 1,
  isLoading: false,
  environment: 'studio',
  gridVisible: true,
  isRotating: false,
  wireframeMode: false,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const assetChangeInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<THREE.Group | null>(null);

  const saveHistory = (newDecals: DecalData[], selectedId: string | null = state.selectedDecalId) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ decals: [...newDecals], selectedId });
      return { 
        ...prev, 
        decals: newDecals, 
        selectedDecalId: selectedId,
        history: newHistory, 
        historyIndex: newHistory.length - 1 
      };
    });
  };

  const undo = () => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const historyItem = state.history[newIndex];
      setState(prev => ({ 
        ...prev, 
        decals: historyItem.decals, 
        selectedDecalId: historyItem.selectedId,
        historyIndex: newIndex 
      }));
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const historyItem = state.history[newIndex];
      setState(prev => ({ 
        ...prev, 
        decals: historyItem.decals, 
        selectedDecalId: historyItem.selectedId,
        historyIndex: newIndex 
      }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedDecalId && document.activeElement?.tagName !== 'INPUT') {
          removeDecal(state.selectedDecalId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.historyIndex, state.selectedDecalId]);

  const addDecal = useCallback((position: [number, number, number], rotation: [number, number, number], mesh: THREE.Mesh) => {
    if (state.toolMode === ToolMode.SELECT || state.isReviewMode) return;
    const baseSize = state.modelScale * 0.15;
    const newDecal: DecalData = {
      id: Math.random().toString(36).substr(2, 9),
      type: state.toolMode === ToolMode.PLACE_TEXT ? 'text' : 'logo',
      content: state.toolMode === ToolMode.PLACE_TEXT ? state.currentText : state.currentLogoUrl,
      position, rotation,
      scale: [baseSize, baseSize, baseSize],
      meshName: mesh.name || mesh.uuid,
      color: '#3b82f6',
      mirror: false,
      visible: true,
      opacity: 1,
      roughness: 0.5,
      metalness: 0
    };
    saveHistory([...state.decals, newDecal], newDecal.id);
    setState(prev => ({ ...prev, toolMode: ToolMode.SELECT }));
  }, [state]);

  const removeDecal = (id: string) => {
    const newDecals = state.decals.filter(d => d.id !== id);
    saveHistory(newDecals, null);
  };

  const updateDecal = (id: string, updates: Partial<DecalData>) => {
    const newDecals = state.decals.map(d => d.id === id ? { ...d, ...updates } : d);
    setState(prev => ({ ...prev, decals: newDecals }));
  };

  const duplicateDecal = (id: string) => {
    const target = state.decals.find(d => d.id === id);
    if (!target) return;
    const offset = state.modelScale * 0.05;
    const newDecal: DecalData = {
      ...target,
      id: Math.random().toString(36).substr(2, 9),
      position: [target.position[0] + offset, target.position[1], target.position[2]]
    };
    saveHistory([...state.decals, newDecal], newDecal.id);
  };

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && state.selectedDecalId) {
      const url = URL.createObjectURL(file);
      updateDecal(state.selectedDecalId, { content: url });
    }
    e.target.value = ''; 
  };

  const exportModel = () => {
    if (!sceneRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(sceneRef.current, (result) => {
      const blob = result instanceof ArrayBuffer ? new Blob([result], { type: 'application/octet-stream' }) : new Blob([JSON.stringify(result)], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `studio3d_export_${Date.now()}.glb`;
      link.click();
    }, (error) => console.error(error), { binary: true, embedImages: true });
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState(p => ({ ...p, isLoading: true }));
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setState(p => ({ 
          ...p, 
          modelUrl: url, 
          decals: [], 
          history: [{ decals: [], selectedId: null }], 
          historyIndex: 0,
          isLoading: false,
          isReviewMode: false,
          selectedDecalId: null,
          isSidebarVisible: window.innerWidth > 1024,
          wireframeMode: false,
        }));
      }, 2500);
    }
    e.target.value = '';
  };

  const handleNewAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setState(p => ({ 
        ...p, 
        currentLogoUrl: url, 
        toolMode: ToolMode.PLACE_LOGO,
        selectedDecalId: null 
      }));
    }
    e.target.value = '';
  };

  const toggleSidebar = () => setState(p => ({ ...p, isSidebarVisible: !p.isSidebarVisible }));
  const toggleWireframe = () => setState(p => ({ ...p, wireframeMode: !p.wireframeMode }));

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-screen overflow-hidden bg-[#030305] text-zinc-100 font-sans">
      <Header 
        isReviewMode={state.isReviewMode} 
        toggleReview={() => setState(p => ({ ...p, isReviewMode: !p.isReviewMode }))}
        onUndo={undo} onRedo={redo} canUndo={state.historyIndex > 0} canRedo={state.historyIndex < state.history.length - 1}
        onExport={exportModel} hasModel={!!state.modelUrl}
        onReset={() => setState(INITIAL_STATE)}
        onToggleSidebar={toggleSidebar}
        isSidebarVisible={state.isSidebarVisible}
      />
      
      <main className="flex-1 relative overflow-hidden flex flex-col sm:flex-row">
        {state.isLoading && <HighTechLoader message="Constructing Geometry..." />}

        {state.modelUrl ? (
          <>
            <div className="flex-1 relative min-h-0">
              <Viewport 
                modelUrl={state.modelUrl} 
                decals={state.decals} 
                selectedId={state.selectedDecalId}
                toolMode={state.toolMode}
                onSetToolMode={(mode) => setState(p => ({ ...p, toolMode: mode, selectedDecalId: null }))}
                onAssetUpload={() => logoInputRef.current?.click()}
                onModelClick={addDecal} 
                onSelectDecal={(id) => !state.isReviewMode && setState(p => ({ ...p, selectedDecalId: id, toolMode: ToolMode.SELECT }))}
                onUpdateDecal={updateDecal} 
                isReviewMode={state.isReviewMode}
                environment={state.environment}
                gridVisible={state.gridVisible}
                isRotating={state.isRotating}
                wireframeMode={state.wireframeMode}
                onToggleGrid={() => setState(p => ({ ...p, gridVisible: !p.gridVisible }))}
                onToggleRotation={() => setState(p => ({ ...p, isRotating: !p.isRotating }))}
                onToggleWireframe={toggleWireframe}
                onSceneReady={(scene) => {
                  sceneRef.current = scene;
                  const box = new THREE.Box3().setFromObject(scene);
                  const size = new THREE.Vector3();
                  box.getSize(size);
                  setState(p => ({ ...p, modelScale: Math.max(size.x, size.y, size.z), isLoading: false }));
                }}
              />
            </div>

            {!state.isReviewMode && (
              <Sidebar 
                state={state} 
                setState={setState} 
                onAssetChange={() => assetChangeInputRef.current?.click()}
                onRemoveDecal={removeDecal} 
                onUpdateDecal={updateDecal}
                onDuplicateDecal={duplicateDecal}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050507] overflow-hidden px-4">
            <Meteors />
            <div className="absolute inset-0 pointer-events-none" 
                 style={{ 
                   backgroundImage: `
                    linear-gradient(to right, #3b82f615 1px, transparent 1px),
                    linear-gradient(to bottom, #3b82f615 1px, transparent 1px),
                    linear-gradient(to right, #3b82f608 5px, transparent 5px),
                    linear-gradient(to bottom, #3b82f608 5px, transparent 5px)
                   `, 
                   backgroundSize: '40px 40px, 40px 40px, 8px 8px, 8px 8px' 
                 }} 
            />

            <div className="absolute inset-0 pointer-events-none opacity-40"
                 style={{ 
                   backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f60d 0%, transparent 70%)',
                 }} 
            />
            
            <div className="relative text-center space-y-8 sm:space-y-12 animate-in fade-in zoom-in duration-1000 max-w-6xl w-full py-10 sm:py-20 z-10">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-[0.5em] shadow-[0_0_50px_rgba(59,130,246,0.1)] backdrop-blur-md">
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px] animate-spin-slow">view_in_ar</span>
                  Precision Modeler
                </div>
                
                <h1 className="text-4xl sm:text-[10rem] font-black uppercase tracking-tighter italic leading-tight sm:leading-[0.82] text-white select-none drop-shadow-[0_20px_40px_rgba(0,0,0,1)]">
                  Design the <br className="sm:hidden" />
                  <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary">Future.</span>
                </h1>
                
                <p className="text-zinc-500 text-sm sm:text-2xl font-medium max-w-3xl mx-auto leading-relaxed opacity-90 font-sans tracking-tight">
                  Professional surface projection tool. <br className="hidden sm:block" /> 
                  Upload, project, and bake in real-time.
                </p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative cursor-pointer mx-auto max-w-[400px] sm:max-w-[500px]"
              >
                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 to-blue-900/10 rounded-[4rem] blur-[100px] opacity-20 group-hover:opacity-60 transition duration-1000"></div>
                
                <div className="relative bg-black/60 backdrop-blur-3xl border border-white/5 group-hover:border-primary/40 p-8 sm:p-16 rounded-[2.5rem] sm:rounded-[4rem] transition-all duration-500 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 border-l border-t border-white w-6 sm:w-10 h-6 sm:h-10" />
                      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 border-r border-t border-white w-6 sm:w-10 h-6 sm:h-10" />
                      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 border-l border-b border-white w-6 sm:w-10 h-6 sm:h-10" />
                      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 border-r border-b border-white w-6 sm:w-10 h-6 sm:h-10" />
                   </div>
                   
                   <div className="flex flex-col items-center gap-6 sm:gap-8 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                        <div className="size-16 sm:size-28 bg-white text-black rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700">
                          <span className="material-symbols-outlined text-4xl sm:text-6xl font-light">add</span>
                        </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black text-2xl sm:text-4xl uppercase tracking-tight italic">Enter Studio</p>
                      <p className="text-zinc-500 text-[8px] sm:text-[11px] font-bold uppercase tracking-[0.4em] mt-2 sm:mt-3 flex items-center justify-center gap-2">
                         <span className="size-1 bg-primary rounded-full"></span>
                         Syncing Engine
                         <span className="size-1 bg-primary rounded-full"></span>
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-4 px-8 sm:px-16 py-3 sm:py-5 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[12px] uppercase tracking-[0.4em] transition-all group-hover:bg-white group-hover:text-black group-hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(59,130,246,0.3)]">
                      Initialize Workshop
                    </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.toolMode !== ToolMode.SELECT && state.modelUrl && !state.isReviewMode && (
          <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-full shadow-[0_20px_50px_rgba(59,130,246,0.5)] border border-white/20 text-[9px] sm:text-[12px] font-black uppercase tracking-[0.3em] pointer-events-none animate-in slide-in-from-bottom-4 duration-500 z-[100] whitespace-nowrap">
            <span className="material-symbols-outlined animate-bounce text-lg sm:text-xl">location_searching</span>
            Placement Ready
          </div>
        )}
      </main>

      <input type="file" ref={fileInputRef} className="hidden" accept=".glb,.gltf" onChange={handleModelUpload} />
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleNewAssetUpload} />
      <input type="file" ref={assetChangeInputRef} className="hidden" accept="image/*" onChange={handleAssetChange} />

      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
