import React, { useState, useRef } from 'react';
import { Presentation } from '../types';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Edit3, 
  Check, 
  X, 
  FileText, 
  Play, 
  Clock,
  Sparkles,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileDown,
  Award
} from 'lucide-react';
import { 
  downloadPresentationPDF, 
  downloadPresentationPPTX, 
  downloadPresentationLegacyPPT 
} from '../utils/exportUtils';

interface PresentationManagerProps {
  presentations: Presentation[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: (title: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onImport: (presentation: Presentation) => void;
  onExport: (id: string) => void;
  onUpdateLogo: (id: string, logoUrl: string | undefined) => void;
  onUpdateLogos?: (id: string, logos: string[]) => void;
  onUpdateLogoAlignment?: (id: string, logoAlignment: 'left' | 'center' | 'right') => void;
  isSaving?: boolean;
  lastSavedAt?: string;
}

export default function PresentationManager({
  presentations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onDuplicate,
  onRename,
  onImport,
  onExport,
  onUpdateLogo,
  onUpdateLogos,
  onUpdateLogoAlignment,
  isSaving = false,
  lastSavedAt
}: PresentationManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleVal, setEditTitleVal] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoInputVal, setLogoInputVal] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPresentation = presentations.find(p => p.id === activeId) || presentations[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || `Presentation #${presentations.length + 1}`;
    onCreate(title);
    setNewTitle('');
    setErrorMessage(null);
  };

  const startRename = (p: Presentation) => {
    setEditingId(p.id);
    setEditTitleVal(p.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitleVal.trim()) {
      onRename(id, editTitleVal.trim());
    }
    setEditingId(null);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic schema validation
        if (json && typeof json === 'object' && json.title && Array.isArray(json.slides)) {
          onImport({
            id: json.id || 'imported_' + Math.random().toString(36).substr(2, 9),
            title: json.title,
            slides: json.slides,
            lastSavedAt: new Date().toISOString()
          });
          // Reset file input
          if (fileInputRef.current) fileInputRef.current.value = '';
          setErrorMessage(null);
        } else {
          setErrorMessage('Invalid presentation file format! Make sure it contains correct slides schema.');
        }
      } catch (err) {
        setErrorMessage('Failed to parse presentation file JSON. Please try another valid file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden" id="presentation-deck-manager">
      {/* Top Selector Panel Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-2 bg-sky-50 rounded-xl text-sky-600 border border-sky-100">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Presentation</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[300px]">
                {currentPresentation?.title || 'No presentation active'}
              </span>
              <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">
                {currentPresentation?.slides.length} slides
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {/* Quick Info status indicator */}
          <div className="text-right hidden md:block">
            {isSaving ? (
              <span className="text-[10px] font-mono text-amber-500 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Auto-saving to cloud...
              </span>
            ) : lastSavedAt ? (
              <span className="text-[10px] font-mono text-slate-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-emerald-500" />
                Saved: {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              isOpen 
                ? 'bg-slate-800 text-white' 
                : 'bg-white text-slate-705 border border-slate-200 hover:bg-slate-50 shadow-3xs'
            }`}
            id="btn-toggle-presentation-catalog"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{isOpen ? 'Close Browser catalog' : 'Manage Presentations'}</span>
          </button>
        </div>
      </div>

      {/* Catalog Dropdown / Drawer View */}
      {isOpen && (
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4" id="presentation-catalog-drawer">
          
          {/* Controls: New presentation form and Imports */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-150">
            <form onSubmit={handleCreate} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Name new presentation stack..."
                className="flex-1 text-xs outline-none bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2 focus:border-sky-505 transition-all text-slate-800 font-medium"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                id="input-new-presentation-title"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                id="btn-submit-new-presentation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
            </form>

            <div className="flex items-center gap-2 border-t md:border-t-0 pt-2.5 md:pt-0 border-dashed border-slate-200">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="import-presentation-file-picker"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 bg-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer text-slate-700"
                id="btn-trigger-import-file"
                title="Import presentation payload JSON"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="flex items-center gap-2 bg-sky-50/70 text-sky-800 text-[11px] p-2.5 rounded-xl border border-sky-100 font-medium">
            <Info className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <p>Select any presentation from your catalog to make edits. Active saves are stored instantly within your local browser profile.</p>
          </div>

          {/* Active Presentation Export Hub Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4" id="export-hub-panel">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <span className="text-[10px] bg-indigo-105 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase font-mono">Export Hub</span>
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Download Presentation Elements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 space-y-2">
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  Download slide contents instantly. All converted presentation packages are formatted cleanly for offline review, offline classrooms, projector displays or printable distribution notes.
                </p>
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  No account connection or network access needed.
                </div>
              </div>

              {/* Exporter triggers */}
              <div className="md:col-span-6 grid grid-cols-1 gap-2">
                {/* PPTX modern */}
                <button
                  type="button"
                  onClick={() => downloadPresentationPPTX(currentPresentation)}
                  className="w-full flex items-center justify-between text-left px-3.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-3xs cursor-pointer transition-all hover:scale-[1.015]"
                  id="download-btn-pptx"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-200" />
                    <div>
                      <span className="block leading-none">PowerPoint Slide Show</span>
                      <span className="block text-[8px] font-mono text-orange-100/70 font-normal mt-0.5">Recommended format (.pptx)</span>
                    </div>
                  </div>
                  <FileDown className="w-4 h-4 text-white" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {/* PDF Document */}
                  <button
                    type="button"
                    onClick={() => downloadPresentationPDF(currentPresentation)}
                    className="flex items-center justify-between text-left px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-[10px] sm:text-xs cursor-pointer transition-all hover:scale-[1.01]"
                    id="download-btn-pdf"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Award className="w-3.5 h-3.5 text-rose-400" />
                      <div>
                        <span className="block text-[11px] leading-none">PDF Layout</span>
                        <span className="block text-[7px] text-slate-400/80 font-normal mt-0.5">Landscape (.pdf)</span>
                      </div>
                    </div>
                    <FileDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* PPT legacy compatibility */}
                  <button
                    type="button"
                    onClick={() => downloadPresentationLegacyPPT(currentPresentation)}
                    className="flex items-center justify-between text-left px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[10px] sm:text-xs cursor-pointer transition-all hover:scale-[1.01]"
                    id="download-btn-ppt"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-405" />
                      <div>
                        <span className="block text-[11px] text-slate-800 leading-none">Legacy Office</span>
                        <span className="block text-[7px] text-slate-400 font-normal mt-0.5">PowerPoint (.ppt)</span>
                      </div>
                    </div>
                    <FileDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Error Banner */}
          {errorMessage && (
            <div className="flex items-center justify-between gap-3 bg-rose-50 text-rose-800 text-[11px] p-2.5 rounded-xl border border-rose-100 font-medium animate-bounce" id="presentation-manager-error-banner">
              <div className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 cursor-pointer" onClick={() => setErrorMessage(null)} />
                <p>{errorMessage}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMessage(null)} 
                className="text-rose-400 hover:text-rose-700 font-bold p-1 text-[12px] flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Catalog List representation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {presentations.map((p) => {
              const isActive = p.id === activeId;
              const isEditing = editingId === p.id;
              const isDeleting = deletingId === p.id;
              
              return (
                <div 
                  key={p.id}
                  className={`bg-white rounded-2xl border p-4.5 transition-all flex flex-col justify-between relative overflow-hidden ${
                    isDeleting
                      ? 'border-rose-300 bg-rose-50/10 shadow-3xs'
                      : isActive 
                        ? 'ring-2 ring-sky-500 border-transparent shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                  id={`presentation-card-${p.id}`}
                >
                  {isDeleting ? (
                    <div className="flex flex-col h-full justify-between space-y-3" id={`delete-confirmation-${p.id}`}>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          Delete presentation?
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          Are you sure you want to delete <span className="font-bold text-slate-705">"{p.title}"</span>? This will permanently erase its slides.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(p.id);
                            setDeletingId(null);
                          }}
                          className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all shadow-3xs hover:scale-101"
                          id={`btn-confirm-delete-${p.id}`}
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                          id={`btn-cancel-delete-${p.id}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {/* Presentation Title Field */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <input
                              type="text"
                              className="w-full text-xs text-slate-800 outline-none border border-sky-400 bg-sky-50/20 rounded p-1 font-bold"
                              value={editTitleVal}
                              onChange={e => setEditTitleVal(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveRename(p.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(p.id)}
                              className="p-1 rounded bg-sky-500 text-white cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-500 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1 w-full">
                            <h4 className="text-xs font-bold text-slate-800 truncate flex-1 hover:text-sky-600 transition-colors cursor-pointer" onClick={() => onSelect(p.id)}>
                              {p.title}
                            </h4>
                            <button
                              type="button"
                              onClick={() => startRename(p)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title="Rename title"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Metadata counters */}
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                          <span>{p.slides.length} Slides</span>
                          <span>•</span>
                          <span className="truncate">Saved: {new Date(p.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="border-t border-slate-100 pt-3 mt-3.5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelect(p.id)}
                          disabled={isActive}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-tight transition-all cursor-pointer flex items-center gap-1 ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          id={`btn-open-presentation-${p.id}`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Active Now</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Open Presentation</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center space-x-1">
                          {/* Copy duplication option */}
                          <button
                            type="button"
                            onClick={() => onDuplicate(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Duplicate (Clone)"
                            id={`btn-duplicate-presentation-${p.id}`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Download option */}
                          <button
                            type="button"
                            onClick={() => onExport(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Export download as JSON"
                            id={`btn-export-presentation-${p.id}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete option */}
                          <button
                            type="button"
                            onClick={() => {
                              if (presentations.length <= 1) {
                                setErrorMessage('Cannot delete the last remaining presentation stack. You must keep at least one active.');
                                return;
                              }
                              setDeletingId(p.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete presentation"
                            id={`btn-delete-presentation-${p.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
