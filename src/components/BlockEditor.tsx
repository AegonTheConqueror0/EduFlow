import React, { useState } from 'react';
import { Slide, SlideBlock, BlockType } from '../types';
import { 
  Type, 
  AlignLeft, 
  AlignCenter,
  AlignRight,
  List, 
  HelpCircle, 
  AlertCircle, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Layout,
  UploadCloud,
  Link2,
  X,
  Video,
  Award,
  Upload
} from 'lucide-react';

export function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  const trimmed = url.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  return null;
}

const PRESET_IMAGES = [
  {
    name: 'Mathematics',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Chemistry Lab',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Coding & Tech',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Geography Globe',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Creative Art',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Deep Space',
    url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800'
  }
];

interface BlockEditorProps {
  slide: Slide;
  onUpdateSlide: (updatedSlide: Slide) => void;
}

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: any; placeholder: string }[] = [
  { type: 'heading', label: 'Primary Heading', icon: Type, placeholder: 'Enter slide section header...' },
  { type: 'text', label: 'Paragraph content', icon: AlignLeft, placeholder: 'Enter explanation content text...' },
  { type: 'list', label: 'Numbered/Bullet list', icon: List, placeholder: 'Enter itemized points...' },
  { type: 'highlight', label: 'Callout Highlight', icon: AlertCircle, placeholder: 'Enter crucial terminology, key-concept or formula...' },
  { type: 'quiz', label: 'Interactive Quiz Check', icon: HelpCircle, placeholder: 'Enter multiple choice classroom question...' },
  { type: 'image', label: 'Image Keywords Accent', icon: ImageIcon, placeholder: 'Enter search keyword prompt for illustration placeholder...' },
  { type: 'video', label: 'YouTube Video Link', icon: Video, placeholder: 'Enter YouTube video link or 11-digit video ID...' }
];

export default function BlockEditor({ slide, onUpdateSlide }: BlockEditorProps) {
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  const [logoInputVal, setLogoInputVal] = useState('');

  const handleDrag = (e: React.DragEvent, blockId: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [blockId]: active }));
  };

  const handleDrop = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [blockId]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file, blockId);
    }
  };

  const processFile = (file: File, blockId: string) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleUpdateBlock(blockId, { imageUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpdateBlock = (blockId: string, updatedFields: Partial<SlideBlock>) => {
    const updatedBlocks = slide.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, ...updatedFields };
      }
      return b;
    });
    onUpdateSlide({ ...slide, blocks: updatedBlocks });
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: SlideBlock = {
      id: 'b' + Date.now() + Math.random().toString(36).substring(2, 5),
      type,
      content: '',
    };

    if (type === 'list') {
      newBlock.listItems = ['New bullet item'];
    } else if (type === 'quiz') {
      newBlock.content = 'Quiz Check: Does active recall improve focus?';
      newBlock.options = ['Yes, dramatically', 'No, it stays exactly identical', 'Only for science courses'];
      newBlock.correctAnswer = 'Yes, dramatically';
    } else if (type === 'image') {
      newBlock.content = 'Concept Illustration';
      newBlock.imagePrompt = 'active learning classroom flat vector illustration corporate design';
      newBlock.caption = 'Visual learning connection';
    } else if (type === 'video') {
      newBlock.content = 'Study Skills Crash Course';
      newBlock.videoUrl = 'https://www.youtube.com/watch?v=ScxYUR8g3A4';
      newBlock.caption = 'Recommended interactive lesson video';
    }

    onUpdateSlide({ ...slide, blocks: [...slide.blocks, newBlock] });
  };

  const handleDeleteBlock = (blockId: string) => {
    onUpdateSlide({
      ...slide,
      blocks: slide.blocks.filter(b => b.id !== blockId)
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...slide.blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;

    // Swap block configurations
    const tmp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = tmp;

    onUpdateSlide({ ...slide, blocks: newBlocks });
  };

  const handleUpdateSetting = (field: keyof Slide, value: any) => {
    onUpdateSlide({ ...slide, [field]: value });
  };

  return (
    <div className="space-y-6" id={`block-editor-slide-${slide.id}`}>
      {/* Slide settings panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-mono font-medium text-slate-500 uppercase flex items-center space-x-1">
          <Layout className="w-3.5 h-3.5" />
          <span>Slide Core Properties</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Slide Header Title</label>
            <input
              type="text"
              value={slide.title}
              onChange={e => handleUpdateSetting('title', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Enter slide dashboard identifier..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Layout Backing Style</label>
            <select
              value={slide.backgroundStyle}
              onChange={e => handleUpdateSetting('backgroundStyle', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="slate">Deep Slate (High Contrast Light)</option>
              <option value="editorial">Warm Editorial (Warm Cream Editorial)</option>
              <option value="ocean">Ocean Calm (Deep Blue Oceanic Waves)</option>
              <option value="terminal">Code Terminal (Sleek Hacker Terminal)</option>
            </select>
          </div>
        </div>

        {/* Timing advanced */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3 gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-advance-toggle"
              checked={slide.autoAdvance}
              onChange={e => handleUpdateSetting('autoAdvance', e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <label htmlFor="auto-advance-toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
              Enable Auto-Advance Flow (Programmable Timing)
            </label>
          </div>

          {slide.autoAdvance && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Advance Slide after:</span>
              <input
                type="number"
                min="3"
                max="300"
                value={slide.duration}
                onChange={e => handleUpdateSetting('duration', parseInt(e.target.value) || 10)}
                className="w-16 px-2 py-1 border border-slate-200 bg-white rounded text-xs text-center font-mono"
              />
              <span className="text-xs text-slate-500">sec</span>
            </div>
          )}
        </div>
      </div>

      {/* Slide Header Logo Properties Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <h4 className="text-xs font-mono font-medium text-slate-500 uppercase flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-teal-650" />
            <span>Slide Header Logo Properties</span>
          </h4>

          {/* Logo Alignment Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Alignment:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[
                { id: 'left', label: 'Left', icon: AlignLeft },
                { id: 'center', label: 'Center', icon: AlignCenter },
                { id: 'right', label: 'Right', icon: AlignRight }
              ].map((alignOption) => {
                const isSelected = (slide.logoAlignment || 'center') === alignOption.id;
                const AlignIcon = alignOption.icon;
                return (
                  <button
                    key={alignOption.id}
                    type="button"
                    onClick={() => handleUpdateSetting('logoAlignment', alignOption.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-teal-600 shadow-3xs border border-transparent'
                        : 'text-slate-500 hover:text-slate-805'
                    }`}
                    title={`${alignOption.label} Aligned Collection`}
                    id={`slide-align-btn-${alignOption.id}`}
                  >
                    <AlignIcon className="w-3 h-3" />
                    <span>{alignOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Active Logos list for this slide */}
          <div className="md:col-span-6 space-y-1.5">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Slide Logos Sequence ({(slide.logos || []).length})
            </span>
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-slate-200 min-h-[4rem] items-center animate-fade-in" id="slide-logo-preview-list">
              {(!slide.logos || slide.logos.length === 0) ? (
                <div className="text-center text-[10px] text-slate-400 font-mono w-full px-2 py-1">
                  Using Presentation Master Logos (No custom override set yet)
                </div>
              ) : (
                slide.logos.map((logoItem, idx) => (
                  <div 
                    key={`slide-logo-thumbnail-${idx}`}
                    className="relative group h-10 w-16 bg-slate-50 rounded-md border border-slate-200 p-0.5 flex items-center justify-center shadow-3xs overflow-hidden"
                    id={`slide-thumb-container-${idx}`}
                  >
                    <img 
                      src={logoItem} 
                      alt={`Slide Brand Logo ${idx + 1}`} 
                      className="h-full w-full object-contain filter drop-shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (slide.logos || []).filter((_, i) => i !== idx);
                        handleUpdateSetting('logos', updated);
                      }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow hover:scale-105"
                      id={`slide-delete-logo-idx-${idx}`}
                      title="Remove this logo"
                    >
                      <X className="w-2.5 h-2.5 font-bold" />
                    </button>
                    <span className="absolute bottom-0 right-0 py-0.5 px-1 bg-slate-900/60 text-white text-[6px] font-mono leading-none rounded-tl-xs">
                      #{idx + 1}
                    </span>
                  </div>
                ))
              )}
            </div>
            {slide.logos && slide.logos.length > 0 && (
              <button
                type="button"
                onClick={() => handleUpdateSetting('logos', undefined)}
                className="text-[9px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                Clear slide override & restore default presentation logo
              </button>
            )}
          </div>

          {/* Add a new logo to this slide */}
          <div className="md:col-span-6 space-y-2">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Add Slide-Specific Logo Override
            </span>
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 bg-white hover:bg-slate-50 focus-within:bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus-within:border-teal-500 transition-all items-center">
                <input
                  type="text"
                  placeholder="Paste brand logo image URL..."
                  value={logoInputVal}
                  onChange={(e) => setLogoInputVal(e.target.value)}
                  className="flex-1 text-[11px] outline-none text-slate-800 font-medium py-1 bg-transparent border-none"
                  id="slide-pasted-logo-url"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (logoInputVal.trim()) {
                        const curLogos = slide.logos || [];
                        handleUpdateSetting('logos', [...curLogos, logoInputVal.trim()]);
                        setLogoInputVal('');
                      }
                    }
                  }}
                />
                {logoInputVal.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      const curLogos = slide.logos || [];
                      handleUpdateSetting('logos', [...curLogos, logoInputVal.trim()]);
                      setLogoInputVal('');
                    }}
                    className="p-0.5 text-teal-600 hover:bg-teal-50 rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 font-bold" />
                  </button>
                )}
              </div>

              {/* Upload file for slide logo */}
              <div className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="slide-logo-file-picker"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const b64 = event.target?.result as string;
                        const curLogos = slide.logos || [];
                        handleUpdateSetting('logos', [...curLogos, b64]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('slide-logo-file-picker')?.click()}
                  className="w-full text-[11px] px-3 py-1.5 hover:border-slate-350 border border-slate-200 hover:bg-slate-50 bg-white rounded-lg font-bold text-slate-705 flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
                  id="btn-slide-upload-logo"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Quick choices of educational logos */}
            <div>
              <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-wide">Quick Emblems:</span>
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {[
                  { name: 'University', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150' },
                  { name: 'Corporate', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=150' },
                  { name: 'Science', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=150' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      const curLogos = slide.logos || [];
                      handleUpdateSetting('logos', [...curLogos, preset.url]);
                    }}
                    className="p-1 px-2 border border-slate-200 rounded text-[9px] hover:bg-white text-slate-600 flex items-center gap-1 cursor-pointer bg-slate-100"
                  >
                    <Award className="w-2.5 h-2.5 text-teal-500" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide body blocks wrapper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">Interactive Elements Grid</span>
          <span className="text-[10px] text-slate-400 font-sans">Blocks are rendered in sequence below</span>
        </div>

        {slide.blocks.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            This slide is current empty! Choose a content block below to begin designing.
          </div>
        ) : (
          <div className="space-y-3">
            {slide.blocks.map((block, index) => {
              const BlockIcon = AVAILABLE_BLOCKS.find(b => b.type === block.type)?.icon || Type;
              const placeholder = AVAILABLE_BLOCKS.find(b => b.type === block.type)?.placeholder || '';

              return (
                <div 
                  key={block.id} 
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs relative group transition-all hover:border-slate-300"
                  id={`block-wrapper-${block.id}`}
                >
                  {/* Floating Action Menu for Blocks */}
                  <div className="absolute right-3 top-3 flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleMoveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBlock(index, 'down')}
                      disabled={index === slide.blocks.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon label header */}
                  <div className="flex items-center space-x-2 text-slate-400 font-medium text-xs mb-3">
                    <BlockIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-600 uppercase tracking-wide font-mono text-[10px]">
                      {block.type} Block
                    </span>
                  </div>

                  {/* Real-time raw editing based on types */}
                  {block.type === 'heading' && (
                    <input
                      type="text"
                      className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none border-b border-dashed border-transparent focus:border-sky-500 pb-1"
                      placeholder={placeholder}
                      value={block.content}
                      onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                    />
                  )}

                  {block.type === 'text' && (
                    <textarea
                      rows={3}
                      className="w-full text-xs text-slate-755 placeholder-slate-300 outline-none border border-dashed border-slate-100 rounded-lg p-2 focus:border-sky-500 resize-none"
                      placeholder={placeholder}
                      value={block.content}
                      onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                    />
                  )}

                  {block.type === 'highlight' && (
                    <div className="flex items-start space-x-2 rounded-lg bg-sky-50 border border-sky-100 p-2 text-sky-800">
                      <textarea
                        rows={2}
                        className="w-full text-xs placeholder-sky-300 outline-none bg-transparent resize-none border-none focus:ring-0 p-0"
                        placeholder={placeholder}
                        value={block.content}
                        onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                      />
                    </div>
                  )}

                  {block.type === 'list' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full text-xs font-medium text-slate-600 placeholder-slate-300 outline-none border-b border-slate-100 focus:border-sky-500 pb-1"
                        placeholder="Bullet category title..."
                        value={block.content}
                        onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                      />
                      
                      {/* Sub bullets list */}
                      <div className="space-y-1.5 pl-3 border-l border-slate-150">
                        {(block.listItems || []).map((item, subIdx) => (
                          <div key={subIdx} className="flex items-center space-x-1">
                            <span className="text-xs text-slate-400 font-mono">•</span>
                            <input
                              type="text"
                              className="flex-1 text-xs text-slate-600 outline-none focus:border-b border-dashed border-sky-400 pb-0.5"
                              value={item}
                              onChange={e => {
                                const fresh = [...(block.listItems || [])];
                                fresh[subIdx] = e.target.value;
                                handleUpdateBlock(block.id, { listItems: fresh });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const fresh = (block.listItems || []).filter((_, i) => i !== subIdx);
                                handleUpdateBlock(block.id, { listItems: fresh });
                              }}
                              className="text-slate-300 hover:text-rose-500 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => {
                            const fresh = [...(block.listItems || []), 'New Bullet item'];
                            handleUpdateBlock(block.id, { listItems: fresh });
                          }}
                          className="text-[10px] text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1 mt-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Sub-bullet line</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {block.type === 'quiz' && (
                    <div className="space-y-3 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Quiz Prompt Title</label>
                        <input
                          type="text"
                          className="w-full text-xs font-semibold text-slate-800 outline-none bg-white border border-slate-200 rounded p-1.5 focus:border-sky-500"
                          value={block.content}
                          onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">Choices Options list</label>
                        {(block.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`quiz-correct-${block.id}`}
                              checked={block.correctAnswer === opt}
                              onChange={() => handleUpdateBlock(block.id, { correctAnswer: opt })}
                              className="text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
                              title="Set as core answer"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const fresh = [...(block.options || [])];
                                const oldVal = fresh[optIdx];
                                fresh[optIdx] = e.target.value;
                                const extra: Partial<SlideBlock> = { options: fresh };
                                if (block.correctAnswer === oldVal) {
                                  extra.correctAnswer = e.target.value;
                                }
                                handleUpdateBlock(block.id, extra);
                              }}
                              className="flex-1 text-xs bg-white border border-slate-200 rounded px-1.5 py-1 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const fresh = (block.options || []).filter((_, i) => i !== optIdx);
                                handleUpdateBlock(block.id, { options: fresh });
                              }}
                              className="text-slate-350 hover:text-rose-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const optText = `Option ${((block.options || []).length + 1)}`;
                            const fresh = [...(block.options || []), optText];
                            handleUpdateBlock(block.id, { options: fresh });
                          }}
                          className="text-[10px] text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1 mt-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add New Choice option</span>
                        </button>
                      </div>
                    </div>
                  )}                  {block.type === 'image' && (
                    <div className="space-y-4 p-4 bg-slate-50/50 border border-slate-150 rounded-xl" id={`image-block-editor-${block.id}`}>
                      {/* Active Media Preview or Status */}
                      <div className="relative aspect-video w-full rounded-lg bg-slate-900 border overflow-hidden flex flex-col items-center justify-center p-2 text-white">
                        {block.imageUrl ? (
                          <>
                            <img 
                              src={block.imageUrl} 
                              alt="Slide preview" 
                              className="absolute inset-0 w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute right-2 top-2 z-10">
                              <button
                                type="button"
                                onClick={() => handleUpdateBlock(block.id, { imageUrl: undefined })}
                                className="p-1 px-2 rounded-md bg-black/70 hover:bg-black text-rose-400 border border-rose-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 hover:scale-105 transition-all cursor-pointer shadow-md"
                                title="Clear Custom Image"
                                id={`btn-clear-image-${block.id}`}
                              >
                                <X className="w-3 h-3" />
                                <span>Reset Image</span>
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs p-1.5 rounded text-[10px] text-gray-300 font-mono truncate">
                              Live image: {block.imageUrl.startsWith('data:') ? 'Custom local file upload' : block.imageUrl}
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-bounce" />
                            <p className="text-xs font-semibold text-slate-300">Using Concept Illustration Placeholder Style</p>
                            <p className="text-[10px] text-slate-400 mt-1">"{block.imagePrompt}"</p>
                          </div>
                        )}
                      </div>

                      {/* File Upload Zone implementing required Drop & Pick */}
                      <div 
                        onDragOver={(e) => handleDrag(e, block.id, true)}
                        onDragLeave={(e) => handleDrag(e, block.id, false)}
                        onDrop={(e) => handleDrop(e, block.id)}
                        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative ${
                          dragActive[block.id] 
                            ? 'border-sky-500 bg-sky-50/30' 
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                        id={`dropzone-image-${block.id}`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`file-upload-${block.id}`}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processFile(e.target.files[0], block.id);
                            }
                          }}
                        />
                        <label 
                          htmlFor={`file-upload-${block.id}`}
                          className="flex flex-col items-center justify-center cursor-pointer space-y-1 w-full h-full select-none"
                        >
                          <UploadCloud className="w-6 h-6 text-sky-500" />
                          <span className="text-xs font-semibold text-slate-700">Drag & drop your presentation slide image here</span>
                          <span className="text-[10px] text-slate-400">or <span className="text-sky-600 font-bold hover:underline">browse files</span> on your computer</span>
                        </label>
                      </div>

                      {/* Stock Preset Catalog */}
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                          Quick Presets: Instant classroom topics
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {PRESET_IMAGES.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleUpdateBlock(block.id, { imageUrl: preset.url })}
                              className={`group relative aspect-video rounded-lg border overflow-hidden transition-all text-left flex flex-col justify-end p-1 select-none hover:scale-102 hover:shadow-3xs ${
                                block.imageUrl === preset.url ? 'ring-2 ring-sky-500 border-transparent' : 'border-slate-200'
                              }`}
                              style={{ 
                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%), url(${preset.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                              title={`Set ${preset.name} slide picture`}
                            >
                              <span className="text-[9px] font-bold text-white truncate w-full tracking-tight">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Image Web Address (URL) link */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
                          <Link2 className="w-3.5 h-3.5 text-slate-400" />
                          Custom Direct Image Web URL
                        </label>
                        <input
                          type="url"
                          className="w-full text-xs text-slate-800 outline-none bg-white border border-slate-200 rounded p-1.5 focus:border-sky-500 font-medium"
                          value={block.imageUrl || ''}
                          placeholder="https://example.com/slide-illustration-diagram.png"
                          onChange={e => handleUpdateBlock(block.id, { imageUrl: e.target.value || undefined })}
                        />
                      </div>

                      {/* Text keywords for placeholder generation */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Keyword Search string (fallback context)
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs text-slate-800 outline-none bg-white border border-slate-200 rounded p-1.5 focus:border-sky-500 font-medium"
                          value={block.imagePrompt}
                          placeholder="e.g. active learning classroom minimalist concept vector illustration"
                          onChange={e => handleUpdateBlock(block.id, { imagePrompt: e.target.value })}
                        />
                      </div>

                      {/* Caption fields */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">Caption Label</label>
                          <input
                            type="text"
                            className="w-full text-xs text-slate-755 outline-none bg-white border border-slate-200 rounded p-1"
                            value={block.caption || ''}
                            onChange={e => handleUpdateBlock(block.id, { caption: e.target.value })}
                            placeholder="Slide illustration caption"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">Image Primary Target Title</label>
                          <input
                            type="text"
                            className="w-full text-xs text-slate-755 outline-none bg-white border border-slate-200 rounded p-1"
                            value={block.content || ''}
                            onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                            placeholder="Figure, Diagram or Model Header"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-4 p-4 bg-slate-50/50 border border-slate-150 rounded-xl" id={`video-block-editor-${block.id}`}>
                      {/* Active Video Player Preview */}
                      <div className="relative aspect-video w-full rounded-lg bg-black border border-slate-200 overflow-hidden flex flex-col items-center justify-center text-white">
                        {getYouTubeId(block.videoUrl) ? (
                          <iframe
                            className="absolute inset-0 w-full h-full border-none"
                            src={`https://www.youtube.com/embed/${getYouTubeId(block.videoUrl)}`}
                            title="YouTube video player preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Video className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-pulse" />
                            <p className="text-xs font-semibold text-slate-300">Invalid YouTube Video Link</p>
                            <p className="text-[10px] text-slate-400 mt-1">Please insert a YouTube link or ID below.</p>
                          </div>
                        )}
                      </div>

                      {/* Video Link URL editing input */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
                          <Link2 className="w-3.5 h-3.5 text-slate-400" />
                          YouTube Video Web URL or Video ID
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs text-slate-800 outline-none bg-white border border-slate-200 rounded p-1.5 focus:border-sky-500 font-medium"
                          value={block.videoUrl || ''}
                          placeholder="e.g. https://www.youtube.com/watch?v=ScxYUR8g3A4"
                          onChange={e => handleUpdateBlock(block.id, { videoUrl: e.target.value })}
                        />
                      </div>

                      {/* Quick Presets Catalog */}
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                          Quick Presets: Classroom video topics
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: 'Active Recall Study Skills', url: 'https://www.youtube.com/watch?v=ScxYUR8g3A4' },
                            { name: 'TED-Ed: Workings of Memory', url: 'https://www.youtube.com/watch?v=y8YvVAnMC3o' },
                            { name: 'Crash Course Physics Basics', url: 'https://www.youtube.com/watch?v=b1t41Q3xRM8' },
                            { name: 'Our Solar System Planetary Walk', url: 'https://www.youtube.com/watch?v=libKVRa01L8' }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleUpdateBlock(block.id, { videoUrl: preset.url, content: preset.name })}
                              className={`px-2.5 py-1.5 rounded-lg border text-[10px] text-left transition-all font-medium flex items-center gap-1.5 cursor-pointer bg-white hover:bg-slate-50 ${
                                getYouTubeId(block.videoUrl) === getYouTubeId(preset.url) ? 'ring-2 ring-sky-500 border-transparent text-sky-700 font-bold' : 'border-slate-200 text-slate-705'
                              }`}
                              title={`Set video URL to ${preset.name}`}
                            >
                              <Video className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span className="truncate">{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Header and Caption properties */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">Video Title Header</label>
                          <input
                            type="text"
                            className="w-full text-xs text-slate-755 outline-none bg-white border border-slate-200 rounded p-1"
                            value={block.content || ''}
                            onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                            placeholder="Video Topic / Title"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">Supporting Caption</label>
                          <input
                            type="text"
                            className="w-full text-xs text-slate-755 outline-none bg-white border border-slate-200 rounded p-1"
                            value={block.caption || ''}
                            onChange={e => handleUpdateBlock(block.id, { caption: e.target.value })}
                            placeholder="Brief annotation or question"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Block Selector Bar */}
      <div className="border-t border-slate-100 pt-5">
        <span className="text-xs font-mono font-medium text-slate-500 uppercase block mb-3">Add Elements to Slide</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AVAILABLE_BLOCKS.map(blockSpec => {
            const SpecIcon = blockSpec.icon;
            return (
              <button
                key={blockSpec.type}
                type="button"
                onClick={() => handleAddBlock(blockSpec.type)}
                className="flex items-center space-x-2 p-2 rounded-xl border border-slate-200 text-left bg-slate-50 hover:bg-slate-100 transition-colors select-none group"
              >
                <div className="p-1.5 bg-white rounded-lg border border-slate-150 text-slate-600 transition-colors group-hover:text-sky-600">
                  <SpecIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{blockSpec.label}</p>
                  <p className="text-[9px] text-slate-400 truncate">{blockSpec.type}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
