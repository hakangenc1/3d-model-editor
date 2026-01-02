
import React from 'react';

interface HeaderProps {
  isReviewMode: boolean;
  toggleReview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onExportImage: () => void;
  onReset: () => void;
  hasModel: boolean;
  onToggleSidebar: () => void;
  isSidebarVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  isReviewMode, toggleReview, onUndo, onRedo, canUndo, canRedo, onExport, onExportImage, onReset, hasModel, onToggleSidebar, isSidebarVisible
}) => {
  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-6 bg-[#0c0c0e] border-b border-[#222] z-[60] relative">
      <div className="flex items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onReset} title="Return to home">
          <div className="size-7 bg-primary rounded shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px] font-bold">architecture</span>
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-100 hidden sm:inline">STUDIO<span className="text-primary">3D</span></span>
        </div>

        {hasModel && !isReviewMode && (
          <div className="flex items-center bg-[#161618] border border-[#222] rounded-md overflow-hidden h-8">
            <button 
              onClick={onUndo} disabled={!canUndo}
              className={`px-2 sm:px-3 hover:bg-[#1f1f22] transition-colors border-r border-[#222] ${canUndo ? 'text-zinc-300' : 'text-zinc-700'}`}
              title="Undo (Ctrl+Z)"
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
            </button>
            <button 
              onClick={onRedo} disabled={!canRedo}
              className={`px-2 sm:px-3 hover:bg-[#1f1f22] transition-colors ${canRedo ? 'text-zinc-300' : 'text-zinc-700'}`}
              title="Redo (Ctrl+Y)"
            >
              <span className="material-symbols-outlined text-[18px]">redo</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {hasModel && (
          <>
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md text-[11px] font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Exit Project"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Exit</span>
            </button>
            
            <div className="w-px h-4 bg-[#222] hidden sm:block" />
            
            <button 
              onClick={toggleReview}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border ${isReviewMode ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-[#161618] text-zinc-400 border-[#222] hover:border-zinc-300 h-[34px]'}`}
              title={isReviewMode ? "Design" : "Showroom"}
            >
              <span className="material-symbols-outlined text-lg">{isReviewMode ? 'edit' : 'visibility'}</span>
              <span className="hidden sm:inline">{isReviewMode ? 'Designer' : 'Showroom'}</span>
            </button>

            <button 
              onClick={onExportImage}
              className="px-3 sm:px-4 py-1.5 bg-[#161618] hover:bg-[#1f1f22] text-zinc-300 border border-[#222] rounded-md text-[11px] font-bold uppercase tracking-wider transition-all h-[34px] flex items-center"
              title="Download Snapshot"
            >
              <span className="material-symbols-outlined text-lg sm:mr-2">photo_camera</span>
              <span className="hidden sm:inline">Snapshot</span>
            </button>

            <button 
              onClick={onExport}
              className="px-3 sm:px-5 py-1.5 bg-zinc-100 hover:bg-white text-black rounded-md text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 h-[34px] flex items-center"
              title="Export GLB with Modifications"
            >
              <span className="material-symbols-outlined text-lg sm:hidden">download</span>
              <span className="hidden sm:inline">Export GLB</span>
            </button>

            {!isReviewMode && (
              <button 
                onClick={onToggleSidebar}
                className={`flex items-center justify-center size-8 sm:size-auto sm:px-3 sm:py-1.5 rounded-md transition-all border ${isSidebarVisible ? 'bg-primary/10 text-primary border-primary/20' : 'bg-[#161618] text-zinc-500 border-[#222]'}`}
                title="Toggle Panel"
              >
                <span className="material-symbols-outlined text-lg">{isSidebarVisible ? 'side_navigation' : 'dock_to_right'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
