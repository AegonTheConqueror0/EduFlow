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
  PlusCircle
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
}: PresenterDashboardProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'roulette' | 'roster'>('content');

  const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  const handleUpdateSlide = (updatedSlide: Slide) => {
    const updated = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    onUpdateSlides(updated);
  };

  const handleCreateNewSlide = () => {
    const newSlide: Slide = {
      id: 's' + Date.now(),
      title: `New Concept Screen ${slides.length + 1}`,
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="educator-presenter-dashboard-layout">
      {/* Sidebar: Slides deck list */}
      <div className="xl:col-span-3 bg-white p-4 rounded-2xl border border-flat-border shadow-3xs flex flex-col space-y-4">
        <div className="flex items-center justify-between">
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

        {/* Thumbnail slides map */}
        <div className="space-y-2 max-h-[350px] xl:max-h-[500px] overflow-y-auto pr-1" id="pres-slides-deck-list">
          {slides.map((slide, index) => {
            const isActive = slide.id === activeSlideId;
            return (
              <div
                key={slide.id}
                onClick={() => onSelectSlide(slide.id)}
                className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-2 select-none ${
                  isActive 
                    ? 'border-slate-800 bg-slate-50/70 ring-1 ring-slate-800/20 shadow-2xs' 
                    : 'border-slate-200 hover:border-slate-350 bg-white'
                }`}
              >
                <div className="text-[10px] sm:text-xs font-mono font-medium text-slate-400 mt-0.5 bg-slate-100 border rounded px-1 w-5 text-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {slide.title || 'Untitled Slide'}
                  </h4>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-1 font-mono">
                    {slide.backgroundStyle} • {slide.blocks.length} elements {slide.autoAdvance && `(⏲️ ${slide.duration}s)`}
                  </p>
                </div>

                {/* Secondary copy/delete quick triggers in rail */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSlide(slide);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50"
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
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global timing automations info */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 text-[11px] text-slate-500 font-sans mt-auto leading-relaxed">
          <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-500" /> Auto advance guidelines
          </p>
          Configure slides to tick automatically to enforce a rigorous timeline for student quizzes, timers, or presentation agendas.
        </div>
      </div>

      {/* Primary Work area: Tab switching panels */}
      <div className="xl:col-span-9 space-y-4">
        {/* Presenter controls strip */}
        <div className="bg-white p-4 rounded-2xl border border-flat-border shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
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

        {/* Tab contents map */}
        <div className="bg-white p-6 rounded-2xl border border-flat-border shadow-3xs" id="active-presenter-tab-wrapper">
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
