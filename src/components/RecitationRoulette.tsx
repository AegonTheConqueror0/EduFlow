import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Plus, Trash2, Check, X, AlertCircle, Shuffle, Award, CheckSquare, PlusCircle } from 'lucide-react';
import { Student } from '../types';

interface RecitationRouletteProps {
  students: Student[];
  onUpdateRoster: (students: Student[]) => void;
  onStudentSelected: (student: Student) => void;
  compact?: boolean;
}

// Sparkle sound generator using Web Audio API
const playTickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Silently ignore audio constraints
  }
};

const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.25); // A5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
};

export default function RecitationRoulette({
  students,
  onUpdateRoster,
  onStudentSelected,
  compact = false,
}: RecitationRouletteProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [fairPickMode, setFairPickMode] = useState<boolean>(true); // Prioritizes low recitation count
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const confettiFrameRef = useRef<number | null>(null);
  
  // Physics representation
  const [spinAngle, setSpinAngle] = useState(0);
  const spinAngleRef = useRef(0);
  const spinSpeedRef = useRef(0);

  // Filter students (only those present)
  const activeStudents = students.filter(s => !s.absent);

  useEffect(() => {
    // Weighted selection pool
    if (fairPickMode) {
      // Find the minimum recitation count among active students
      const minCount = activeStudents.length > 0 ? Math.min(...activeStudents.map(s => s.recitationCount)) : 0;
      // We will duplicate students who have been picked less to increase their weight (fair treatment!)
      const pool: Student[] = [];
      activeStudents.forEach(s => {
        // More weights to lower counts
        const weight = Math.max(1, 4 - (s.recitationCount - minCount));
        for (let i = 0; i < weight; i++) {
          pool.push(s);
        }
      });
      setFilteredStudents(pool.length > 0 ? pool : activeStudents);
    } else {
      setFilteredStudents(activeStudents);
    }
  }, [students, fairPickMode]);

  // Handle Canvas Drawing for the Wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 15;

    // Clear background
    ctx.clearRect(0, 0, size, size);

    if (activeStudents.length === 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter';
      ctx.fillText('Please add active students to the roster', center, center);
      return;
    }

    const segmentsCount = activeStudents.length;
    const arcSize = (2 * Math.PI) / segmentsCount;

    // Save context coordinates
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(spinAngle);

    // Draw Wheel Segments
    for (let i = 0; i < segmentsCount; i++) {
      const student = activeStudents[i];
      const startAngle = i * arcSize;
      const endAngle = startAngle + arcSize;

      // Beautiful color palette
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      
      // Determine elegant color segment based on index
      // Warm modern editorial/slate vibes
      const colors = [
        '#0f172a', // Slate 900
        '#1e293b', // Slate 800
        '#334155', // Slate 700
        '#475569', // Slate 600
        '#0284c7', // Sky 600
        '#0369a1', // Sky 700
        '#0f766e', // Teal 700
        '#0d9488', // Teal 600
      ];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Border lines
      ctx.strokeStyle = '#ffffff20';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text label drawing
      ctx.save();
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      
      // Dynamic elegant font size depending on student name length and wheel size
      const maxLen = 14;
      const displayName = student.name.length > maxLen ? student.name.substring(0, maxLen - 2) + '..' : student.name;
      ctx.font = compact ? '11px Space Grotesk' : '15px Space Grotesk font-medium';
      
      // Text coordinates slightly inset
      ctx.fillText(displayName, radius - 20, 0);
      
      // Recitation counts as mini dots
      if (!compact) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`[${student.recitationCount}]`, radius - 150, 0);
      }
      
      ctx.restore();
    }

    // Inner center pin accent
    ctx.restore();

    ctx.beginPath();
    ctx.arc(center, center, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#38bdf8'; // Sky accent
    ctx.fill();

    // Reset shadow values for future drawing
    ctx.shadowBlur = 0;

  }, [activeStudents, spinAngle, isSpinning, compact]);

  // Particle Confetti Effect
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    interface ConfettiPiece {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const confettiList: ConfettiPiece[] = [];
    const colors = ['#38bdf8', '#0ea5e9', '#0d9488', '#10b981', '#fbbf24', '#f87171', '#c084fc'];

    for (let i = 0; i < 80; i++) {
      confettiList.push({
        x: canvas.width / 2,
        y: canvas.height - 20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 12,
        speedY: -(Math.random() * 8 + 8),
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      confettiList.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.25; // gravity
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height && p.x > 0 && p.x < canvas.width) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        confettiFrameRef.current = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (confettiFrameRef.current) {
      cancelAnimationFrame(confettiFrameRef.current);
    }
    animateConfetti();
  };

  // Wheel Physics Selection Engine
  const spinWheel = () => {
    if (activeStudents.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedStudent(null);

    // Dynamic power & targets
    const spinDuration = 3500; // 3.5 seconds
    const startTime = Date.now();
    const startAngle = spinAngleRef.current;
    
    // Choose selected indexed student based on weight selection (filteredStudents)
    const totalCount = activeStudents.length;
    const rosterSelect = filteredStudents[Math.floor(Math.random() * filteredStudents.length)];
    const targetIdx = activeStudents.findIndex(s => s.id === rosterSelect.id);
    
    // Calculate precise ending position to line up with pointing arrow at 270 degrees (pointing right or pointing top)
    // We let arrow be on TOP (pointing down at angular coordinate: 3 * Math.PI / 2)
    // To select targeting slice, angle = (3 * Math.PI / 2) - sliceMid
    const arcSize = (2 * Math.PI) / totalCount;
    const targetSlideAngle = (targetIdx * arcSize) + (arcSize / 2);
    // Add multiple rotations (3 to 6 rounds) for speed excitement
    const rotations = Math.floor(Math.random() * 4) + 6;
    const totalDistAngle = (rotations * 2 * Math.PI) + (Math.PI * 1.5 - targetSlideAngle) - (startAngle % (2 * Math.PI));

    const totalTargetAngle = startAngle + totalDistAngle;

    let lastTickAngle = startAngle;

    const animateWheel = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / spinDuration);

      // Easing out quadratic function
      const easeOut = (x: number): number => 1 - Math.pow(1 - x, 3);
      const easeProgress = easeOut(t);

      // Compute current angular coordinates
      const nextAngle = startAngle + easeProgress * totalDistAngle;
      spinAngleRef.current = nextAngle;
      setSpinAngle(nextAngle);

      // Play tick sound whenever we cross a boundary
      const currentRelativeAngle = nextAngle;
      const crossedSegments = Math.floor((currentRelativeAngle * totalCount) / (2 * Math.PI)) - 
                          Math.floor((lastTickAngle * totalCount) / (2 * Math.PI));
      if (crossedSegments > 0) {
        playTickSound();
        lastTickAngle = currentRelativeAngle;
      }

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animateWheel);
      } else {
        // Complete spin animation
        setIsSpinning(false);
        const finalAngle = totalTargetAngle % (2 * Math.PI);
        spinAngleRef.current = finalAngle;
        setSpinAngle(finalAngle);
        
        // Final selection outcome
        setSelectedStudent(rosterSelect);
        playChimeSound();
        triggerConfetti();

        // Increment count
        const updated = students.map(s => {
          if (s.id === rosterSelect.id) {
            return {
              ...s,
              recitationCount: s.recitationCount + 1,
              lastSelectedAt: new Date().toLocaleTimeString(),
            };
          }
          return s;
        });

        onUpdateRoster(updated);
        onStudentSelected({ ...rosterSelect, recitationCount: rosterSelect.recitationCount + 1 });
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animateWheel();
  };

  // Class List Operations
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: 'st' + Date.now(),
      name: newStudentName.trim(),
      recitationCount: 0,
      absent: false,
    };

    onUpdateRoster([...students, newStudent]);
    setNewStudentName('');
  };

  const handleToggleAbsent = (id: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, absent: !s.absent };
      }
      return s;
    });
    onUpdateRoster(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    onUpdateRoster(updated);
  };

  const resetRecitations = () => {
    const updated = students.map(s => ({ ...s, recitationCount: 0 }));
    onUpdateRoster(updated);
  };

  // Clean animation loop effects
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (confettiFrameRef.current) cancelAnimationFrame(confettiFrameRef.current);
    };
  }, []);

  return (
    <div className={`grid grid-cols-1 ${compact ? '' : '2xl:grid-cols-12 gap-8'} items-start w-full relative`} id="recitation-roulette-container">
      {/* Absolute Confetti Overlay Canvas */}
      <canvas 
        ref={confettiCanvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-30"
      />

      {/* Wheel Roulette Section */}
      <div className={`flex flex-col items-center bg-white p-6 rounded-2xl border border-flat-border shadow-xs w-full ${compact ? 'lg:col-span-12' : '2xl:col-span-7'}`}>
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-sky-50 rounded-lg text-sky-600">
              <Shuffle className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-slate-800 text-lg sm:text-xl font-display">Recitation Roulette</h3>
          </div>
          <button
            onClick={() => setFairPickMode(!fairPickMode)}
            className={`text-xs px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
              fairPickMode 
                ? 'bg-sky-50 text-sky-700 border-sky-100 font-medium' 
                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
            }`}
            title="When active, student picks prioritize individuals with lower recitation counts"
            id="fairpicker-toggle"
          >
            <Award className="w-3.5 h-3.5" />
            {fairPickMode ? 'Weighted (Fair)' : 'Pure Random'}
          </button>
        </div>

        {/* Visual Roulette Screen */}
        <div className="relative flex flex-col items-center justify-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full" style={{ minHeight: compact ? '220px' : '360px' }}>
          {activeStudents.length === 0 ? (
            <div className="text-center py-8 px-4 max-w-sm flex flex-col items-center justify-center" id="roulette-empty-view">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3 border border-slate-200">
                <AlertCircle className="w-6 h-6 text-slate-450" />
              </div>
              <h4 className="font-semibold text-slate-800 text-sm font-display mb-1">Roster is empty or all absent</h4>
              <p className="text-xs text-slate-500 mb-4 text-center leading-relaxed">
                Add active student names directly here to instantly populate the roulette and spin the wheel!
              </p>
              
              {/* Local Quick Add Box inside Wheel card */}
              <form onSubmit={handleAddStudent} className="flex gap-2 w-full mb-4" id="roulette-inline-add-form">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Enter student name..."
                  className="flex-1 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-sky-500 text-slate-705 shadow-2xs"
                  id="roulette-name-input"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs select-none transition-all cursor-pointer"
                  id="roulette-add-submit"
                >
                  Add Student
                </button>
              </form>
              
              <button
                type="button"
                onClick={() => {
                  const demoStudents: Student[] = [
                    { id: 'st1', name: 'Alexander Wright', recitationCount: 0, absent: false },
                    { id: 'st2', name: 'Sophia Martinez', recitationCount: 0, absent: false },
                    { id: 'st3', name: 'Ethan Thompson', recitationCount: 0, absent: false },
                    { id: 'st4', name: 'Chloe Jenkins', recitationCount: 0, absent: false },
                    { id: 'st5', name: 'Marcus Vance', recitationCount: 0, absent: false },
                    { id: 'st6', name: 'Emily Peterson', recitationCount: 0, absent: false },
                    { id: 'st7', name: 'Julian Albright', recitationCount: 0, absent: false },
                    { id: 'st8', name: 'Isabella Cruz', recitationCount: 0, absent: false }
                  ];
                  onUpdateRoster(demoStudents);
                }}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold bg-sky-50 hover:bg-sky-100 border border-sky-100 px-3.5 py-2 rounded-lg transition-all shadow-3xs cursor-pointer"
              >
                Load Sample Demo Class (8 students)
              </button>
            </div>
          ) : (
            <>
              {/* Custom Arrow Selector (Pointed on top of wheel) */}
              <div className="absolute top-4 z-10 transition-transform">
                <div className="w-5 h-5 bg-red-500 transform rotate-45 border-b border-r border-[#ffffff20] shadow-md" style={{ borderRadius: '0px 4px 0px 4px' }} />
                <div className="w-1.5 h-4 bg-red-500 mx-auto -mt-1.5 shadow" />
              </div>

              {/* Core Wheel Canvas wrapper */}
              <div className="relative overflow-hidden flex items-center justify-center my-2 p-1 bg-white border rounded-full shadow-md">
                <canvas
                  ref={canvasRef}
                  width={compact ? 240 : 340}
                  height={compact ? 240 : 340}
                  className="rounded-full transition-transform"
                />
              </div>

              {/* Trigger Action */}
              <div className="flex flex-col items-center w-full max-w-sm mt-3">
                <button
                  id="btn-spin-roulette"
                  disabled={isSpinning}
                  onClick={spinWheel}
                  className={`px-6 py-2.5 rounded-xl font-semibold shadow-xs text-sm active:translate-y-px transition-all flex items-center gap-2 w-full justify-center select-none ${
                    isSpinning
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-950 text-slate-50 hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  {isSpinning ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                      Selecting Student...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      Spin Roster Wheel!
                    </>
                  )}
                </button>
                
                {/* Collapsible/Subtle Quick Add form for existing wheel to quickly append list */}
                <form onSubmit={handleAddStudent} className="flex gap-2 w-full mt-4 border-t border-slate-100 pt-3.5" id="roulette-sub-add-form">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    placeholder="Quick add student to wheel..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 shadow-3xs"
                    id="roulette-sub-name-input"
                  />
                  <button
                    type="submit"
                    className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-3xs"
                    id="roulette-sub-add-submit"
                  >
                    Add
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Selection Modal/Chime overlay inside card */}
          <AnimatePresence>
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-slate-900/95 rounded-xl flex flex-col items-center justify-center p-6 text-center z-20"
              >
                <div className="w-14 h-14 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-400/30 text-sky-400 mb-3 animate-pulse">
                  <Trophy className="w-7 h-7" />
                </div>
                
                <span className="text-xs tracking-widest uppercase text-slate-400 font-bold mb-1">
                  Selected for Recitation
                </span>
                
                <h4 className="text-2xl sm:text-3xl font-display font-medium text-slate-50 tracking-tight">
                  {selectedStudent.name}
                </h4>

                <div className="mt-4 flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono">
                  <span>Recitations so far:</span>
                  <strong className="text-sky-400 font-bold text-sm">
                    {selectedStudent.recitationCount}
                  </strong>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold select-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Continue Session
                  </button>
                  <button
                    onClick={() => {
                      // Adjust recitation or give star bonus
                      const added = students.map(s => {
                        if (s.id === selectedStudent.id) {
                          return { ...s, recitationCount: Math.max(0, s.recitationCount + 1) }; // award double
                        }
                        return s;
                      });
                      onUpdateRoster(added);
                      playChimeSound();
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold select-none flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Excellence bonus (Increments recitation score count to reflect stellar active performance)"
                  >
                    <Award className="w-3.5 h-3.5" /> Award Point
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Roster Management Section */}
      {!compact && (
        <div className="2xl:col-span-5 flex flex-col space-y-4 w-full">
          <div className="bg-white p-5 rounded-2xl border border-flat-border shadow-xs">
            <h3 className="font-semibold text-slate-800 text-base sm:text-lg font-display mb-3 flex items-center justify-between">
              <span>Class Roster ({students.length})</span>
              <button
                type="button"
                onClick={resetRecitations}
                className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md px-2 py-1 transition-colors hover:bg-slate-50"
              >
                Reset Scores
              </button>
            </h3>

            {/* Quick Add Student */}
            <form onSubmit={handleAddStudent} className="flex gap-2 mb-4" id="roster-add-form">
              <input
                type="text"
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                placeholder="Enter Student Name..."
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
              <button
                type="submit"
                id="btn-add-student"
                className="p-1.5 bg-slate-900 border border-slate-900 rounded-lg text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Roster List scrollable */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1 select-none" id="student-roster-list">
              {students.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-slate-300 mb-1" />
                  No students in roster. Add some above!
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between py-2.5 transition-colors ${
                      student.absent ? 'opacity-45 bg-slate-50/50' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAbsent(student.id)}
                        className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                          student.absent
                            ? 'bg-slate-200 border-slate-300 text-slate-500'
                            : 'border-slate-300 text-emerald-600 hover:bg-slate-50'
                        }`}
                        title="Mark Present/Absent"
                      >
                        {!student.absent && <Check className="w-3 h-3" />}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium text-slate-700 truncate ${student.absent ? 'line-through' : ''}`}>
                          {student.name}
                        </p>
                        {student.lastSelectedAt && !student.absent && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Selected: {student.lastSelectedAt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-150 text-slate-600">
                        P: {student.recitationCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
