import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, SlideBlock, Student } from '../types';
import { HelpCircle, Star, Award, Sparkles, Volume2, ShieldAlert, AlertCircle, RefreshCw, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';

function getYouTubeId(url: string | undefined): string | null {
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

interface PublicViewProps {
  activeSlide: Slide;
  activeStudent: Student | null;
  onClearActiveStudent?: () => void;
  countdownValue?: number;
  totalSlidesCount?: number;
  currentSlideIndex?: number;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  logoUrl?: string;
  logos?: string[];
  logoAlignment?: 'left' | 'center' | 'right';
}

export default function PublicView({
  activeSlide,
  activeStudent,
  onClearActiveStudent,
  countdownValue = 0,
  totalSlidesCount = 1,
  currentSlideIndex = 0,
  onNextSlide,
  onPrevSlide,
  logoUrl,
  logos,
  logoAlignment = 'center',
}: PublicViewProps) {
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Derived active brand logo list and alignment sequence
  const slideLogos = activeSlide && activeSlide.logos && activeSlide.logos.length > 0 
    ? activeSlide.logos 
    : (logos && logos.length > 0 ? logos : (logoUrl ? [logoUrl] : []));

  const slideLogoAlign = activeSlide && activeSlide.logoAlignment 
    ? activeSlide.logoAlignment 
    : logoAlignment;

  // Persistent master presentation brand logo for the player-level header bar
  const masterHeaderLogo = logos && logos.length > 0 ? logos[0] : logoUrl;

  // Keyboard navigation listener for standard clicker remotes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore clicker triggers if user is actively writing in a form input
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (e.key === ' ') {
          e.preventDefault(); // Stop default page scrolling behavior
        }
        if (onNextSlide) {
          onNextSlide();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (onPrevSlide) {
          onPrevSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNextSlide, onPrevSlide]);

  // Sync state with native browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = !!document.fullscreenElement;
      if (!isNativeFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Handle Fullscreen requesting to target container
  const toggleFullscreen = () => {
    const container = document.getElementById('public-slide-presentation-screen');
    if (!container) return;

    if (!isFullscreen) {
      setIsFullscreen(true);
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          // Fallback custom maximized simulation is active in state so it is perfectly fine
        });
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Reset quiz selection if active slide changes
  useEffect(() => {
    setSelectedQuizAnswer(null);
    setShowAnswerFeedback(false);
  }, [activeSlide.id]);

  // Determine container style classes
  const getStyleClasses = () => {
    switch (activeSlide.backgroundStyle) {
      case 'editorial':
        return {
          bg: 'bg-[#faf6f0] text-amber-950 selection:bg-amber-200',
          card: 'bg-[#f4ebe1] border-amber-900/15 shadow-xs text-amber-950',
          title: isFullscreen 
            ? 'font-serif text-4xl sm:text-5xl lg:text-7xl font-semibold text-amber-950 mb-10 tracking-tight'
            : 'font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-amber-950 mb-6 tracking-tight line-clamp-2',
          highlight: 'bg-amber-100/80 border-[#92400e20] text-amber-900',
          accent: 'font-serif',
          monoText: 'font-serif text-amber-900/60'
        };
      case 'ocean':
        return {
          bg: 'bg-gradient-to-br from-[#0c4a6e] to-[#0f172a] text-sky-100 selection:bg-sky-500/20',
          card: 'bg-[#0f172a]/70 border-sky-400/20 shadow-md backdrop-blur-xs text-sky-100',
          title: isFullscreen
            ? 'font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-10 tracking-tight'
            : 'font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight drop-shadow-xs line-clamp-2',
          highlight: 'bg-sky-950/80 border-sky-500/30 text-sky-300',
          accent: 'font-display',
          monoText: 'font-mono text-sky-400/70'
        };
      case 'terminal':
        return {
          bg: 'bg-[#050b14] text-emerald-400 selection:bg-emerald-950',
          card: 'bg-[#081220] border-emerald-950 shadow-xs text-emerald-300',
          title: isFullscreen
            ? 'font-mono text-3xl sm:text-4xl lg:text-6xl font-semibold text-emerald-100 mb-10 tracking-tight'
            : 'font-mono text-2xl sm:text-3xl lg:text-4xl font-semibold text-emerald-100 mb-6 tracking-tight line-clamp-2',
          highlight: 'bg-[#051a10] border-emerald-900/80 text-emerald-400',
          accent: 'font-mono',
          monoText: 'font-mono text-emerald-500/50'
        };
      case 'slate':
      default:
        return {
          bg: 'bg-[#f8fafc] text-slate-800 selection:bg-sky-100',
          card: 'bg-white border-slate-200 shadow-sm text-slate-700',
          title: isFullscreen
            ? 'font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-10 tracking-tight'
            : 'font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-slate-900 mb-6 tracking-tight line-clamp-2',
          highlight: 'bg-sky-50/70 border-sky-100 text-sky-800',
          accent: 'font-sans',
          monoText: 'font-mono text-slate-400'
        };
    }
  };

  const style = getStyleClasses();

  return (
    <div 
      className={`${
        isFullscreen 
          ? 'fixed inset-0 w-screen h-screen z-[9999] flex flex-col justify-between p-8 sm:p-16 md:p-24 rounded-none border-none' 
          : 'relative w-full h-full min-h-[500px] flex flex-col justify-between p-6 sm:p-12 rounded-3xl border'
      } transition-all duration-300 overflow-y-auto ${style.bg}`}
      id="public-slide-presentation-screen"
    >
      {/* Decorative Slide Background elements overlay depending on theme */}
      {activeSlide.backgroundStyle === 'ocean' && (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-sky-400 filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full bg-indigo-500 filter blur-3xl" />
        </div>
      )}

      {/* Public View Header Area */}
      <div className="flex items-center justify-between w-full relative z-10 select-none">
        <div className="flex items-center space-x-2">
          {masterHeaderLogo ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#ffffff10] border border-[#ffffff10] rounded-xl backdrop-blur-3xs" id="public-header-brand-logo">
              <img 
                src={masterHeaderLogo} 
                alt="Presentation Logo" 
                className="h-4.5 w-auto object-contain max-w-[80px]"
                referrerPolicy="no-referrer"
              />
              <span className="text-[9px] font-mono text-current/40 uppercase tracking-wider hidden sm:inline border-l border-[#ffffff20] pl-2 font-bold">Formal Slide Show</span>
            </div>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono font-medium px-2.5 py-1 bg-[#ffffff10] border border-[#ffffff10] rounded-full uppercase tracking-wider backdrop-blur-3xs">
              EduFlow Public Slide Screen
            </span>
          )}
          {activeSlide.autoAdvance && countdownValue > 0 && (
            <span className="flex items-center space-x-1 text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              <span>Auto-Advance Pacing: {countdownValue}s</span>
            </span>
          )}
        </div>

        <div className="text-xs sm:text-sm font-mono flex items-center space-x-3 text-current/70">
          <span>Slide {currentSlideIndex + 1} of {totalSlidesCount}</span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/15 text-current border border-current/10 font-bold transition-all hover:scale-103 shadow-3xs cursor-pointer select-none"
            title="Toggle TV / Projector Fullscreen Mode"
            id="btn-toggle-fullscreen-projection"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Presenter TV Projection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Slide Core Content container */}
      <div className="flex-1 my-10 max-w-4xl mx-auto w-full flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Subjective Brand Logos on Top of Slide */}
            {slideLogos && slideLogos.length > 0 && (
              <div 
                className={`flex flex-wrap gap-4 mb-6 animate-fade-in ${
                  slideLogoAlign === 'left' 
                    ? 'justify-start' 
                    : slideLogoAlign === 'right' 
                      ? 'justify-end' 
                      : 'justify-center'
                }`}
                id="slide-top-logo-container"
              >
                {slideLogos.map((logoSrc, logoIdx) => (
                  <img 
                    key={`slide-logo-emblem-${logoIdx}`}
                    src={logoSrc} 
                    alt={`Brand Logo Emblem ${logoIdx + 1}`} 
                    className={`object-contain max-h-16 w-auto filter drop-shadow-xs select-none`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            )}

            {/* Display title always first */}
            <h2 className={`${style.title}`}>
              {activeSlide.title || 'Untitled Session Slide'}
            </h2>

            {/* Slide Blocks loop */}
            <div className={`${isFullscreen ? 'space-y-8' : 'space-y-4'}`}>
              {activeSlide.blocks.map((block) => {
                switch (block.type) {
                  case 'heading':
                    return (
                      <h3 
                        key={block.id} 
                        className={`font-semibold tracking-tight text-current/95 my-2 ${
                          isFullscreen ? 'text-2xl sm:text-3xl lg:text-5xl' : 'text-xl sm:text-2xl'
                        }`}
                      >
                        {block.content}
                      </h3>
                    );

                  case 'highlight':
                    return (
                      <div 
                        key={block.id} 
                        className={`flex items-start rounded-2xl border leading-relaxed ${style.highlight} font-medium ${
                          isFullscreen ? 'p-8 text-lg sm:text-xl md:text-2xl gap-4' : 'p-5 text-sm sm:text-base'
                        }`}
                      >
                        <AlertCircle className={`flex-shrink-0 text-current mt-0.5 ${isFullscreen ? 'w-7 h-7 mr-4' : 'w-5 h-5 mr-3'}`} />
                        <p>{block.content}</p>
                      </div>
                    );

                  case 'list':
                    return (
                      <div key={block.id} className={`${isFullscreen ? 'space-y-6' : 'space-y-3'}`}>
                        {block.content && (
                          <h4 className={`uppercase tracking-wider text-current/60 font-medium font-mono ${
                            isFullscreen ? 'text-base sm:text-lg lg:text-xl' : 'text-sm'
                          }`}>
                            {block.content}
                          </h4>
                        )}
                        <ul className={`list-disc ${isFullscreen ? 'space-y-4 pl-10' : 'space-y-2.5 pl-6'}`}>
                          {(block.listItems || []).map((item, i) => (
                            <li key={i} className={`leading-relaxed text-current/90 font-medium ${
                              isFullscreen ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-base sm:text-lg'
                            }`}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );

                  case 'quiz':
                    return (
                      <div key={block.id} className={`rounded-2xl border ${style.card} ${isFullscreen ? 'p-10' : 'p-6'}`}>
                        <div className="flex items-center space-x-2 text-current/70 text-xs uppercase tracking-wider font-mono mb-3">
                          <HelpCircle className="w-4 h-4 text-sky-400" />
                          <span>Student Concept Check</span>
                        </div>
                        
                        <p className={`font-medium text-current/90 ${
                          isFullscreen ? 'text-xl sm:text-2xl lg:text-3xl mb-6' : 'text-lg sm:text-xl mb-4'
                        }`}>
                          {block.content}
                        </p>

                        {/* Interactive Public Choices */}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 ${isFullscreen ? 'gap-4 mt-6' : ''}`}>
                          {(block.options || []).map((opt, i) => {
                            const isSelected = selectedQuizAnswer === opt;
                            const isCorrect = opt === block.correctAnswer;
                            
                            let choiceStyle = 'bg-black/5 hover:bg-black/10 text-current border border-white/10';
                            if (activeSlide.backgroundStyle === 'ocean') {
                              choiceStyle = 'bg-sky-950/50 hover:bg-sky-900/60 text-sky-100 border border-sky-800';
                            } else if (activeSlide.backgroundStyle === 'slate') {
                              choiceStyle = 'bg-slate-50 hover:bg-slate-150 text-slate-800 border border-slate-200';
                            } else if (activeSlide.backgroundStyle === 'terminal') {
                              choiceStyle = 'bg-[#0c1e30] hover:bg-[#122e4d] text-emerald-400 border border-emerald-950';
                            }

                            if (selectedQuizAnswer) {
                              if (isCorrect) {
                                choiceStyle = 'bg-emerald-500 text-white border-emerald-400 font-semibold';
                              } else if (isSelected) {
                                choiceStyle = 'bg-rose-500 text-white border-rose-400 font-semibold';
                              } else {
                                choiceStyle = 'opacity-30 border-transparent';
                              }
                            }

                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setSelectedQuizAnswer(opt);
                                  setShowAnswerFeedback(true);
                                }}
                                className={`rounded-xl text-left transition-all tracking-tight cursor-pointer ${
                                  isFullscreen 
                                    ? 'px-6 py-5 text-base sm:text-lg lg:text-2xl font-medium' 
                                    : 'px-4 py-3 text-xs sm:text-sm'
                                } ${choiceStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {showAnswerFeedback && (
                          <div className="mt-4 flex items-center justify-between text-xs font-mono pt-3 border-t border-current/10">
                            <span className="text-emerald-400 font-bold">✓ Correct Option Highlighted!</span>
                            <button
                              onClick={() => {
                                setSelectedQuizAnswer(null);
                                setShowAnswerFeedback(false);
                              }}
                              className="text-current/50 hover:text-current transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin-once" />
                              <span>Reset Quiz state</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );

                  case 'image':
                    return (
                      <div key={block.id} className={`border text-center relative ${style.card} ${isFullscreen ? 'p-8 rounded-3xl' : 'p-4 rounded-3xl'}`}>
                        {/* Simulates a high-fidelity image visualization block */}
                        <div className="aspect-video w-full rounded-2xl bg-black/10 overflow-hidden flex flex-col items-center justify-center relative border border-current/10">
                          {block.imageUrl ? (
                            <img 
                              src={block.imageUrl} 
                              alt={block.caption || block.content || 'Active Slide Photo'} 
                              className="absolute inset-0 w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <>
                              <SplashImageBackground keyword={block.imagePrompt || 'active learning'} />
                              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 bg-[#090d16]/80 text-white rounded-xl backdrop-blur-xs max-w-md border border-white/10 shadow-lg">
                                <span className="text-[10px] tracking-widest uppercase font-mono text-[#38bdf8] mb-1 font-bold">
                                  Conceptual Illustration Placeholder
                                </span>
                                <p className="text-xs font-medium truncate w-full">
                                  "{block.imagePrompt}"
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        {block.caption && (
                          <p className={`font-medium mt-2 text-current/70 italic ${isFullscreen ? 'text-base' : 'text-xs sm:text-sm'}`}>
                            {block.caption} {block.content && `(${block.content})`}
                          </p>
                        )}
                      </div>
                    );

                  case 'video':
                    {
                      const ytId = getYouTubeId(block.videoUrl);
                      return (
                        <div key={block.id} className={`border text-center relative ${style.card} ${isFullscreen ? 'p-8 rounded-3xl' : 'p-4 rounded-3xl'}`}>
                          {/* Rich interactive YouTube Playable Video Framework */}
                          <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative border border-current/10 shadow-lg">
                            {ytId ? (
                              <iframe
                                className="absolute inset-0 w-full h-full border-none"
                                src={`https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0`}
                                title={block.content || "YouTube video player"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-slate-950">
                                <span className="text-sm font-semibold opacity-85">No YouTube Video Configured</span>
                                <span className="text-xs opacity-60 mt-1">Configure your lesson video inside the Slide editor.</span>
                              </div>
                            )}
                          </div>
                          {block.content && (
                            <h4 className={`font-semibold tracking-tight text-current/95 mt-3 ${
                              isFullscreen ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-sm sm:text-base'
                            }`}>
                              {block.content}
                            </h4>
                          )}
                          {block.caption && (
                            <p className={`font-medium mt-1 text-current/60 italic ${isFullscreen ? 'text-base' : 'text-xs sm:text-sm'}`}>
                              {block.caption}
                            </p>
                          )}
                        </div>
                      );
                    }

                  case 'text':
                  default:
                    return (
                      <p 
                        key={block.id} 
                        className={`leading-relaxed text-current/85 ${
                          isFullscreen ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-base sm:text-lg lg:text-xl'
                        }`}
                      >
                        {block.content}
                      </p>
                    );
                }
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Public View Footer Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm select-none border-t border-current/10 pt-4 mt-8 gap-4">
        <div className="flex items-center space-x-2 text-current/50 font-mono">
          <span>EduFlow Interactive Presentation Suite</span>
        </div>
        
        {/* On-Screen Clicker Helper Slide Controller */}
        <div className="flex items-center space-x-3 text-current">
          <button
            type="button"
            disabled={currentSlideIndex === 0}
            onClick={onPrevSlide}
            className="p-1.5 rounded-lg border border-current/10 bg-black/5 hover:bg-black/15 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            title="Previous Slide (Back)"
            id="public-btn-prev-slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-medium opacity-70">
            Slide {currentSlideIndex + 1} / {totalSlidesCount}
          </span>
          
          <button
            type="button"
            disabled={currentSlideIndex === totalSlidesCount - 1}
            onClick={onNextSlide}
            className="p-1.5 rounded-lg border border-current/10 bg-black/5 hover:bg-black/15 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            title="Next Slide (Forward)"
            id="public-btn-next-slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar of slide collection */}
        <div className="w-full sm:w-1/3 h-1.5 bg-[#ffffff15] rounded-full overflow-hidden mt-3 sm:mt-0 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-sky-400 transition-all duration-350"
            style={{ width: `${((currentSlideIndex + 1)/ totalSlidesCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Oral Recitation Selection Screen Overlay Alert! */}
      <AnimatePresence>
        {activeStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="absolute inset-x-8 bottom-8 sm:inset-x-12 sm:bottom-12 bg-[#020617] text-white p-6 rounded-2xl border border-[#1e293b] shadow-2xl flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 z-50 animate-glow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">
                  Live Classroom Recitation Call
                </span>
                <p className="text-lg sm:text-xl font-medium tracking-tight text-white font-display">
                  {activeStudent.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
              <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono">
                Participation Recitations: {activeStudent.recitationCount}
              </div>
              {onClearActiveStudent && (
                <button
                  type="button"
                  onClick={onClearActiveStudent}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Screen alert
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Background simulation graphic placeholder generator using clean shapes
function SplashImageBackground({ keyword }: { keyword: string }) {
  return (
    <div className="absolute inset-0 z-0 opacity-15 overflow-hidden flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4 w-full h-full p-4">
        {[...Array(12)].map((_, idx) => (
          <div 
            key={idx}
            className="border-2 border-dashed border-current/20 rounded-xl flex items-center justify-center text-current/30 text-xs font-mono uppercase transform"
            style={{
              transform: `rotate(${(idx * 15) % 45}deg) scale(${0.8 + (idx % 3) * 0.1})`,
            }}
          >
            {keyword.split(' ')[idx % keyword.split(' ').length]}
          </div>
        ))}
      </div>
    </div>
  );
}
