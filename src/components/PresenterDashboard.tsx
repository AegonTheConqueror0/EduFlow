import React, { useState } from 'react';
import { Slide, Student, BlockType } from '../types';
import BlockEditor from './BlockEditor';
import RecitationRoulette from './RecitationRoulette';
import { 
  Play, 
  Square, 
  Compass, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Copy, 
  Trash2, 
  Layers, 
  Users, 
  Settings, 
  TrendingUp, 
  Tv, 
  Sparkles,
  ClipboardList,
  Flame,
  LayoutTemplate,
  PlusCircle,
  ChevronUp,
  ChevronDown,
  Search,
  Type,
  List,
  AlertCircle,
  HelpCircle,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface PresenterDashboardProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onUpdateSlides: (updatedSlides: Slide[]) => void;
  students: Student[];
  onUpdateRoster: (students: Student[]) => void;
  onStudentSelected: (student: Student) => void;
  countdownValue: number;
  isAutoplayRunning: boolean;
  onToggleAutoplay: () => void;
  layoutMode?: 'standard' | 'split';
  centerElement?: React.ReactNode;
}

export default function PresenterDashboard({
  slides,
  activeSlideId,
  onSelectSlide,
  onUpdateSlides,
  students,
  onUpdateRoster,
  onStudentSelected,
  countdownValue,
  isAutoplayRunning,
  onToggleAutoplay,
  layoutMode = 'standard',
  centerElement,
}: PresenterDashboardProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'roulette' | 'roster'>('content');
  const [slideSearchQuery, setSlideSearchQuery] = useState('');

  const filteredSlides = slides.filter(slide => {
    if (!slideSearchQuery) return true;
    const query = slideSearchQuery.toLowerCase();
    const titleMatch = (slide.title || '').toLowerCase().includes(query);
    const bgMatch = (slide.backgroundStyle || '').toLowerCase().includes(query);
    const blocksMatch = slide.blocks.some(b => 
      (b.content || '').toLowerCase().includes(query) || 
      (b.caption || '').toLowerCase().includes(query) ||
      (b.type || '').toLowerCase().includes(query)
    );
    return titleMatch || bgMatch || blocksMatch;
  });

  const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  const handleUpdateSlide = (updatedSlide: Slide) => {
    const updated = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    onUpdateSlides(updated);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    onUpdateSlides(updated);
  };

  const handleCreateNewSlide = () => {
    const newSlide: Slide = {
      id: 's' + Date.now(),
      title: '',
      backgroundStyle: 'slate',
      autoAdvance: false,
      duration: 10,
      blocks: [
        {
          id: 'b' + Date.now() + '1',
          type: 'heading',
          content: 'New Section Core Topic',
        },
        {
          id: 'b' + Date.now() + '2',
          type: 'text',
          content: 'Add content blocks in the sidebar list to populate this slide screen.',
        }
      ]
    };
    onUpdateSlides([...slides, newSlide]);
    onSelectSlide(newSlide.id);
  };

  const handleDuplicateSlide = (slide: Slide) => {
    const dup: Slide = {
      ...slide,
      id: 's' + Date.now(),
      title: `${slide.title} (Copy)`,
      // Deep copy blocks
      blocks: slide.blocks.map(b => ({ ...b, id: 'b' + Date.now() + Math.random().toString(36).substring(2, 5) }))
    };
    onUpdateSlides([...slides, dup]);
    onSelectSlide(dup.id);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return; // Keep at least one slide
    const index = slides.findIndex(s => s.id === id);
    const updated = slides.filter(s => s.id !== id);
    onUpdateSlides(updated);
    
    // Choose selected slide index
    if (activeSlideId === id) {
      const nextActiveId = updated[Math.max(0, index - 1)].id;
      onSelectSlide(nextActiveId);
    }
  };

  const isSplit = layoutMode === 'split';

  return (
    <div className={`grid grid-cols-1 ${isSplit ? 'xl:grid-cols-12 h-screen xl:h-[calc(100vh-140px)] max-h-screen xl:max-h-[calc(100vh-140px)] min-h-[500px] overflow-hidden' : 'xl:grid-cols-12'} gap-6`} id="educator-presenter-dashboard-layout">
      {/* Sidebar: Slides deck list */}
      <div className={`xl:col-span-3 bg-white p-4 rounded-2xl border border-flat-border shadow-3xs flex flex-col space-y-4 ${
        isSplit ? 'h-full max-h-full overflow-hidden' : 'xl:sticky xl:top-4 max-h-[calc(100vh-140px)] overflow-y-auto'
      }`}>
        <div className="flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-slate-800 text-sm font-display uppercase tracking-wider flex items-center gap-1.5">
            <LayoutTemplate className="w-4 h-4 text-slate-500" />
            <span>Deck Navigation</span>
          </h3>
          <button
            type="button"
            id="btn-create-slide"
            onClick={handleCreateNewSlide}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
            title="Create fresh presentation slide"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Elegant Search bar for Presentation Slides */}
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search slides or concepts..."
            value={slideSearchQuery}
            onChange={(e) => setSlideSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 placeholder-slate-350 transition-all font-sans"
          />
          {slideSearchQuery && (
            <button
              type="button"
              onClick={() => setSlideSearchQuery('')}
              className="text-[9px] text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 font-bold cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Thumbnail slides map */}
        <div className={`space-y-2 ${isSplit ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-[350px] xl:max-h-[500px] overflow-y-auto'} pr-1`} id="pres-slides-deck-list">
          {filteredSlides.length === 0 ? (
            <div className="text-center py-8 px-4 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl font-medium">
              No matching slides found. Clear your search or create a new slide.
            </div>
          ) : (
            filteredSlides.map((slide) => {
              const originalIndex = slides.indexOf(slide);
              const isActive = slide.id === activeSlideId;

              // Get background style color dot
              const getDotColor = (styleStr: string) => {
                switch (styleStr) {
                  case 'slate': return '#0f172a';
                  case 'editorial': return '#b45309';
                  case 'ocean': return '#0284c7';
                  case 'terminal': return '#10b981';
                  case 'midnight_aurora': return '#8b5cf6';
                  case 'forest_moss': return '#15803d';
                  case 'soft_lavender': return '#6366f1';
                  case 'sunset_glow': return '#f97316';
                  case 'minimal_chalk': return '#52525b';
                  case 'cyberpunk_neon': return '#ec4899';
                  case 'candy_pop': return '#f43f5e';
                  default: return '#64748b';
                }
              };

              return (
                <div
                  key={slide.id}
                  onClick={() => onSelectSlide(slide.id)}
                  className={`group p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col space-y-2.5 select-none ${
                    isActive 
                      ? 'border-slate-800 bg-slate-50/90 ring-1 ring-slate-800/10 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/20 bg-white'
                  }`}
                >
                  {/* Row 1: Number, Title, and Element Count */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 rounded border border-slate-200/60 px-1.5 py-0.5 shrink-0">
                        {originalIndex + 1}
                      </span>
                      <h4 className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700 font-semibold'}`}>
                        {slide.title || '(Untitled Slide Title)'}
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100/50 border border-slate-200/40 rounded text-slate-500 font-bold shrink-0">
                      {slide.blocks.length} {slide.blocks.length === 1 ? 'elem' : 'elems'}
                    </span>
                  </div>

                  {/* Row 2: Theme Style with Color Dot and Timing */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="capitalize text-slate-500 font-medium flex items-center gap-1.5 min-w-0 truncate">
                      <span 
                        className="w-2 h-2 rounded-full border border-black/10 shrink-0 inline-block" 
                        style={{ backgroundColor: getDotColor(slide.backgroundStyle) }}
                      />
                      <span className="truncate">{slide.backgroundStyle.replace('_', ' ')}</span>
                    </span>
                    
                    {slide.autoAdvance && (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 font-bold shrink-0 flex items-center gap-0.5 text-[9px]">
                        ⏲️ {slide.duration}s
                      </span>
                    )}
                  </div>

                  {/* Row 3: Micro Elements Visual Composition */}
                  {slide.blocks.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100 w-full">
                      {slide.blocks.map((block) => {
                        let IconComponent = Type;
                        let tooltip = 'Text block';
                        let colorBadge = 'text-slate-500 bg-slate-50 border-slate-200';
                        switch (block.type) {
                          case 'heading':
                            IconComponent = Type;
                            tooltip = 'Main Heading';
                            colorBadge = 'text-slate-900 bg-slate-100/80 border-slate-200';
                            break;
                          case 'text':
                            IconComponent = Layers;
                            tooltip = 'Paragraph detail';
                            colorBadge = 'text-slate-600 bg-slate-50 border-slate-150';
                            break;
                          case 'highlight':
                            IconComponent = AlertCircle;
                            tooltip = 'Concept Callout';
                            colorBadge = 'text-amber-600 bg-amber-50 border-amber-200/40';
                            break;
                          case 'list':
                            IconComponent = List;
                            tooltip = 'Unordered List';
                            colorBadge = 'text-sky-600 bg-sky-50 border-sky-200/40';
                            break;
                          case 'quiz':
                            IconComponent = HelpCircle;
                            tooltip = 'Concept Quiz Check';
                            colorBadge = 'text-indigo-600 bg-indigo-50 border-indigo-200/40';
                            break;
                          case 'image':
                            IconComponent = ImageIcon;
                            tooltip = 'Visual Illustration';
                            colorBadge = 'text-rose-600 bg-rose-50 border-rose-200/40';
                            break;
                          case 'video':
                            IconComponent = Video;
                            tooltip = 'Video Clip';
                            colorBadge = 'text-red-600 bg-red-50 border-red-200/40';
                            break;
                        }
                        return (
                          <span 
                            key={block.id} 
                            className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-mono leading-none border shrink-0 ${colorBadge}`}
                            title={`${tooltip}: ${block.content || '(empty)'}`}
                          >
                            <IconComponent className="w-2 h-2" />
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Secondary copy/delete quick triggers in rail */}
                  <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(originalIndex, 'up');
                      }}
                      disabled={originalIndex === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                      title="Move slide up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(originalIndex, 'down');
                      }}
                      disabled={originalIndex === slides.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                      title="Move slide down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(slide);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-850 hover:bg-slate-100 cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {slides.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(slide.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>


      </div>

      {/* Center column: Public Student Presentation View */}
      {isSplit && centerElement && (
        <div className="xl:col-span-5 h-full max-h-full overflow-hidden flex flex-col" id="projection-center-col">
          {centerElement}
        </div>
      )}

      {/* Primary Work area: Tab switching panels */}
      <div className={`${isSplit ? 'xl:col-span-4 h-full max-h-full overflow-hidden' : 'xl:col-span-9'} flex flex-col space-y-4 ${!isSplit ? 'xl:sticky xl:top-4 max-h-[calc(100vh-140px)]' : ''}`}>
        {/* Sticky floating control center header */}
        <div className="bg-slate-100/95 backdrop-blur-md z-20 pb-3 space-y-3 px-2 rounded-xl">
          {/* Presenter controls strip */}
          <div className="bg-white p-4 rounded-2xl border border-flat-border shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onSelectSlide(slides[Math.max(0, activeSlideIndex - 1)].id)}
                disabled={activeSlideIndex === 0}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-center sm:text-left min-w-28 text-xs font-mono font-medium">
                Slide {activeSlideIndex + 1} of {slides.length}
              </div>
              <button
                type="button"
                onClick={() => onSelectSlide(slides[Math.min(slides.length - 1, activeSlideIndex + 1)].id)}
                disabled={activeSlideIndex === slides.length - 1}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {/* Auto timer running control */}
              <button
                type="button"
                onClick={onToggleAutoplay}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                  isAutoplayRunning
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {isAutoplayRunning ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Pause Timer ({countdownValue}s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Auto Flow</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workspace Tab switcher */}
          <div className="flex space-x-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 font-display ${
                activeTab === 'content'
                  ? 'border-slate-800 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Slide Blocks Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roulette')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 font-display flex items-center gap-1 ${
                activeTab === 'roulette'
                  ? 'border-slate-800 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Oral Roulette</span>
              <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-sky-100 animate-pulse" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 font-display ${
                activeTab === 'roster'
                  ? 'border-slate-800 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Roster & Scores ({students.length})
            </button>
          </div>
        </div>

        {/* Tab contents map */}
        <div className="bg-white p-6 rounded-2xl border border-flat-border shadow-3xs flex-1 min-h-0 overflow-y-auto" id="active-presenter-tab-wrapper">
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">
                    Editing: "{activeSlide.title}"
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Modifications will reflect immediately in the Public Slide Screen projection
                  </p>
                </div>
              </div>

              <BlockEditor 
                slide={activeSlide} 
                onUpdateSlide={handleUpdateSlide} 
                compact={isSplit}
              />
            </div>
          )}

          {activeTab === 'roulette' && (
            <RecitationRoulette
              students={students}
              onUpdateRoster={onUpdateRoster}
              onStudentSelected={onStudentSelected}
              compact={false}
            />
          )}

          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-slate-500" />
                    <span>Roster Participation Data Logs</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Toggle attendance or modify recitation counters for live session grading
                  </p>
                </div>
              </div>

              {/* Recitation statistics summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="bg-slate-50 border p-3 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Active Students</span>
                  <span className="text-lg font-bold text-slate-800">{students.filter(s => !s.absent).length} present</span>
                </div>
                <div className="bg-slate-50 border p-3 rounded-xl flex flex-col justify-center font-mono">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Recitations</span>
                  <span className="text-lg font-bold text-slate-800">{students.reduce((acc, s) => acc + s.recitationCount, 0)} points</span>
                </div>
                <div className="bg-slate-50 border p-3 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Leader of the day</span>
                  <span className="text-xs font-bold text-emerald-600 truncate">
                    {students.length > 0 
                      ? students.reduce((max, s) => s.recitationCount > max.recitationCount ? s : max, students[0]).name 
                      : 'None'
                    }
                  </span>
                </div>
              </div>

              {/* Embed full lists */}
              <StudentsManagementGrid 
                students={students} 
                onUpdateRoster={onUpdateRoster} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// In-tab students administrator helper component
function StudentsManagementGrid({ students, onUpdateRoster }: { students: Student[], onUpdateRoster: (students: Student[]) => void }) {
  const [name, setName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const fresh: Student = {
      id: 'st' + Date.now(),
      name: name.trim(),
      recitationCount: 0,
      absent: false
    };
    onUpdateRoster([...students, fresh]);
    setName('');
  };

  const setPoints = (id: string, count: number) => {
    onUpdateRoster(students.map(s => s.id === id ? { ...s, recitationCount: Math.max(0, count) } : s));
  };

  const removeRaw = (id: string) => {
    onUpdateRoster(students.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New Student Candidate..."
          className="flex-1 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      <div className="border border-slate-150 rounded-xl overflow-hidden shadow-3xs max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-150 text-left text-xs bg-white">
          <thead className="bg-slate-50 font-mono text-slate-400 uppercase text-[9px]">
            <tr>
              <th className="px-4 py-2.5 font-bold">Roster Status</th>
              <th className="px-4 py-2.5 font-bold">Student Full Name</th>
              <th className="px-4 py-2.5 font-bold">Participation Recitations Count</th>
              <th className="px-4 py-2.5 font-bold text-right">Delete Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 select-none">
            {students.map(student => (
              <tr key={student.id} className={student.absent ? 'bg-slate-50/50 opacity-40' : 'hover:bg-slate-50/30'}>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateRoster(students.map(s => s.id === student.id ? { ...s, absent: !s.absent } : s));
                    }}
                    className={`px-2 py-0.5 text-[9px] font-semibold font-mono rounded ${
                      student.absent ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {student.absent ? 'Absent' : 'Present'}
                  </button>
                </td>
                <td className="px-4 py-2 font-medium text-slate-800">
                  {student.name}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPoints(student.id, student.recitationCount - 1)}
                      className="w-5 h-5 border border-slate-200 text-slate-500 rounded flex items-center justify-center font-bold font-mono hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold w-6 text-center">{student.recitationCount}</span>
                    <button
                      type="button"
                      onClick={() => setPoints(student.id, student.recitationCount + 1)}
                      className="w-5 h-5 border border-slate-200 text-slate-500 rounded flex items-center justify-center font-bold font-mono hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeRaw(student.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
