
import React from 'react';
import { AppState, ToolMode, DecalData } from '../types';

interface SidebarProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onAssetChange: () => void;
  onRemoveDecal: (id: string) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalData>) => void;
  onDuplicateDecal: (id: string) => void;
}

const COLOR_PRESETS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#000000', '#71717a'
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  state, setState, onAssetChange, onRemoveDecal, onUpdateDecal, onDuplicateDecal
}) => {
  if (!state.isSidebarVisible) return null;

  const selectedDecal = state.decals.find(d => d.id === state.selectedDecalId);

  return (
    <div className="absolute inset-y-6 right-6 w-[280px] sm:w-[340px] flex flex-col gap-4 pointer-events-none z-[50] animate-in slide-in-from-right duration-300">
      {/* INSPECTOR PANEL */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#121214]/95 backdrop-blur-2xl border border-[#222] rounded-3xl shadow-2xl pointer-events-auto">
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-widest hidden sm:inline">Inspector</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-5 space-y-6">
          {selectedDecal ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transformation</span>
                <div className="flex gap-1">
                  <button 
                    title="Duplicate"
                    onClick={() => onDuplicateDecal(selectedDecal.id)}
                    className="size-8 flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                  <button 
                    title="Remove"
                    onClick={() => onRemoveDecal(selectedDecal.id)}
                    className="size-8 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 p-4 rounded-xl bg-[#0c0c0e] border border-[#222]">
                  <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] block">Source</label>
                  {selectedDecal.type === 'logo' ? (
                    <div className="space-y-3">
                      <div className="aspect-square w-16 sm:w-20 mx-auto rounded-lg bg-[#161618] border border-[#222] p-3 flex items-center justify-center overflow-hidden">
                        <img src={selectedDecal.content} alt="Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                      <button 
                        onClick={onAssetChange}
                        className="w-full py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">sync</span>
                        <span className="hidden sm:inline">Change</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input 
                        value={selectedDecal.content}
                        onChange={(e) => onUpdateDecal(selectedDecal.id, { content: e.target.value })}
                        className="w-full bg-[#161618] border border-[#222] rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-primary transition-colors font-mono"
                        placeholder="Enter text..."
                      />
                      
                      <div className="space-y-2 pt-2">
                        <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] block">Appearance</label>
                        <div className="grid grid-cols-5 gap-2">
                          {COLOR_PRESETS.map(color => (
                            <button
                              key={color}
                              onClick={() => onUpdateDecal(selectedDecal.id, { color })}
                              className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedDecal.color === color ? 'border-white' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <div className="relative size-6">
                            <input 
                              type="color" 
                              value={selectedDecal.color || '#3b82f6'}
                              onChange={(e) => onUpdateDecal(selectedDecal.id, { color: e.target.value })}
                              className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            />
                            <div 
                              className="size-full rounded-full border-2 border-white/20 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500"
                              title="Custom Color"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                      <span>Scale</span>
                      <span className="text-primary font-mono">{((selectedDecal.scale[0] / state.modelScale) * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min={state.modelScale * 0.01} max={state.modelScale * 1.5} step={state.modelScale * 0.005}
                      value={selectedDecal.scale[0]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        onUpdateDecal(selectedDecal.id, { scale: [v, v, v] });
                      }}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                      <span>Rotate</span>
                      <span className="text-primary font-mono">{Math.round((selectedDecal.rotation[2] * 180) / Math.PI)}°</span>
                    </div>
                    <input 
                      type="range" min={-Math.PI} max={Math.PI} step="0.01"
                      value={selectedDecal.rotation[2]}
                      onChange={(e) => onUpdateDecal(selectedDecal.id, { rotation: [0, 0, parseFloat(e.target.value)] })}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222] space-y-4">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Visibility & Mirror</label>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                        <span>Opacity</span>
                        <span className="text-primary font-mono">{Math.round((selectedDecal.opacity || 1) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0.1" max="1" step="0.01"
                        value={selectedDecal.opacity || 1}
                        onChange={(e) => onUpdateDecal(selectedDecal.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full accent-primary"
                      />
                   </div>

                   <button 
                    onClick={() => onUpdateDecal(selectedDecal.id, { mirror: !selectedDecal.mirror })}
                    className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase border transition-all flex items-center justify-center gap-2 ${selectedDecal.mirror ? 'bg-primary/20 border-primary text-primary' : 'bg-[#0c0c0e] border-[#222] text-zinc-500'}`}
                   >
                     <span className="material-symbols-outlined text-sm">content_copy</span>
                     Symmetry Mirror {selectedDecal.mirror ? 'ON' : 'OFF'}
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <span className="material-symbols-outlined text-4xl sm:text-5xl text-zinc-700">select_all</span>
              <p className="text-[9px] sm:text-[10px] text-zinc-600 px-4 leading-relaxed font-bold uppercase tracking-widest">Select an element</p>
            </div>
          )}
        </div>
      </div>

      {/* STACK PANEL */}
      <div className="h-48 sm:h-60 bg-[#121214]/95 backdrop-blur-2xl border border-[#222] rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
        <div className="px-5 py-3 border-b border-[#222] flex items-center justify-between bg-[#161618]">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono hidden sm:inline">Stack</span>
          <span className="material-symbols-outlined text-zinc-500 text-lg sm:hidden">layers</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black border border-primary/20">{state.decals.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-3 space-y-1.5">
          {state.decals.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-2">
              <span className="material-symbols-outlined text-xl sm:text-2xl">layers</span>
            </div>
          ) : (
            state.decals.map((d) => (
              <div 
                key={d.id}
                onClick={() => setState(p => ({ ...p, selectedDecalId: d.id, toolMode: ToolMode.SELECT }))}
                className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all border group ${state.selectedDecalId === d.id ? 'bg-primary/10 border-primary text-primary shadow-lg' : 'bg-[#161618] border-[#222] text-zinc-500 hover:border-zinc-400'}`}
              >
                <button 
                  title={d.visible ? "Hide" : "Show"}
                  onClick={(e) => { e.stopPropagation(); onUpdateDecal(d.id, { visible: !d.visible }); }}
                  className={`material-symbols-outlined text-[18px] transition-all hover:scale-110 ${d.visible ? 'text-primary' : 'text-zinc-700'}`}
                  style={{ fontVariationSettings: d.visible ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {d.visible ? 'visibility' : 'visibility_off'}
                </button>
                <span className="flex-1 text-[10px] sm:text-[11px] font-bold truncate uppercase tracking-tight">
                  {d.type === 'text' ? d.content : 'Graphic'}
                </span>
                <button 
                  title="Remove"
                  onClick={(e) => { e.stopPropagation(); onRemoveDecal(d.id); }}
                  className="material-symbols-outlined text-[16px] text-zinc-600 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
