import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, SlideBlock, Student } from '../types';
import { HelpCircle, Star, Award, Sparkles, Volume2, ShieldAlert, AlertCircle, RefreshCw, Maximize2, Minimize2, ChevronLeft, ChevronRight, Shuffle, X } from 'lucide-react';
import RecitationRoulette from './RecitationRoulette';

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
  students?: Student[];
  onUpdateRoster?: (students: Student[]) => void;
  onStudentSelected?: (student: Student) => void;
  previewMode?: boolean;
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
  students = [],
  onUpdateRoster,
  onStudentSelected,
  previewMode = false,
}: PublicViewProps) {
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showRouletteDrawer, setShowRouletteDrawer] = useState<boolean>(false);

  const [scale, setScale] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Measure and compute proper width-based scaling for split-screen presentation preview
  useEffect(() => {
    if (!previewMode || isFullscreen) {
      setScale(1);
      return;
    }
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        // Standard high-definition virtual canvas space ratio base
        setScale(Math.max(0.15, Math.min(1.5, width / 1024)));
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [previewMode, isFullscreen, activeSlide.id]);

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
            ? 'font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-amber-950 mb-6 tracking-tight'
            : 'font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-amber-950 mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-amber-100/80 border-[#92400e20] text-amber-900',
          accent: 'font-serif',
          monoText: 'font-serif text-amber-900/60'
        };
      case 'ocean':
        return {
          bg: 'bg-gradient-to-br from-[#0c4a6e] to-[#0f172a] text-sky-100 selection:bg-sky-500/20',
          card: 'bg-[#0f172a]/70 border-sky-400/20 shadow-md backdrop-blur-xs text-sky-100',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight drop-shadow-xs line-clamp-2',
          highlight: 'bg-sky-950/80 border-sky-500/30 text-sky-300',
          accent: 'font-display',
          monoText: 'font-mono text-sky-400/70'
        };
      case 'terminal':
        return {
          bg: 'bg-[#050b14] text-emerald-400 selection:bg-emerald-950',
          card: 'bg-[#081220] border-emerald-950 shadow-xs text-emerald-300',
          title: isFullscreen
            ? 'font-mono text-2xl sm:text-3xl lg:text-5xl font-semibold text-emerald-100 mb-6 tracking-tight'
            : 'font-mono text-xl sm:text-2xl lg:text-3xl font-semibold text-emerald-100 mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-[#051a10] border-emerald-900/80 text-emerald-400',
          accent: 'font-mono',
          monoText: 'font-mono text-emerald-500/50'
        };
      case 'midnight_aurora':
        return {
          bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#311042] to-[#0c0a24] text-purple-100 selection:bg-purple-500/20',
          card: 'bg-[#180e29]/80 border-purple-500/20 shadow-md text-purple-100',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-purple-950/75 border-purple-500/20 text-purple-300',
          accent: 'font-display',
          monoText: 'font-mono text-purple-400/70'
        };
      case 'forest_moss':
        return {
          bg: 'bg-gradient-to-br from-[#062419] to-[#0b130e] text-emerald-100 selection:bg-emerald-500/20',
          card: 'bg-[#0c1c14]/80 border-emerald-550 shadow-md text-emerald-100',
          title: isFullscreen
            ? 'font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight'
            : 'font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-white mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-emerald-950/75 border-emerald-500/10 text-emerald-300',
          accent: 'font-serif',
          monoText: 'font-mono text-emerald-400/60'
        };
      case 'soft_lavender':
        return {
          bg: 'bg-[#fafafc] text-indigo-950 selection:bg-indigo-100',
          card: 'bg-white border-indigo-100 shadow-sm text-indigo-950',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-indigo-950 mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-indigo-950 mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-indigo-50/80 border-indigo-100/60 text-indigo-900',
          accent: 'font-sans',
          monoText: 'font-mono text-indigo-400'
        };
      case 'sunset_glow':
        return {
          bg: 'bg-gradient-to-br from-[#451a03] to-[#1c0a00] text-orange-50 selection:bg-orange-500/20',
          card: 'bg-[#2d1102]/80 border-orange-550 shadow-md text-orange-50',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-6xl font-black text-orange-100 mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-100 mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-orange-950/80 border-orange-500/20 text-orange-300',
          accent: 'font-display',
          monoText: 'font-mono text-orange-400/70'
        };
      case 'minimal_chalk':
        return {
          bg: 'bg-[#121214] text-zinc-300 selection:bg-zinc-800',
          card: 'bg-[#1c1c1f] border-zinc-800 text-zinc-200',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-white mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-zinc-900 border-zinc-800 text-zinc-300',
          accent: 'font-sans',
          monoText: 'font-mono text-zinc-500'
        };
      case 'cyberpunk_neon':
        return {
          bg: 'bg-[#0c0517] text-cyan-400 selection:bg-pink-950',
          card: 'bg-[#110724] border-pink-500/20 shadow-pink-500/5 text-pink-400',
          title: isFullscreen
            ? 'font-mono text-2xl sm:text-3xl lg:text-5xl font-black text-pink-500 mb-6 tracking-tight uppercase'
            : 'font-mono text-xl sm:text-2xl lg:text-3xl font-bold text-pink-500 mb-4 tracking-tight uppercase line-clamp-2',
          highlight: 'bg-[#1a0014] border-pink-500/30 text-cyan-300',
          accent: 'font-mono',
          monoText: 'font-mono text-cyan-500/60'
        };
      case 'candy_pop':
        return {
          bg: 'bg-[#fff5f6] text-rose-950 selection:bg-rose-100',
          card: 'bg-white border-rose-105 shadow-sm text-rose-900',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-5xl font-black text-rose-600 mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-rose-600 mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-rose-50/80 border-rose-100/60 text-rose-800',
          accent: 'font-sans',
          monoText: 'font-mono text-rose-400'
        };
      case 'slate':
      default:
        return {
          bg: 'bg-[#f8fafc] text-slate-800 selection:bg-sky-100',
          card: 'bg-white border-slate-200 shadow-sm text-slate-700',
          title: isFullscreen
            ? 'font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight'
            : 'font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-900 mb-4 tracking-tight line-clamp-2',
          highlight: 'bg-sky-50/70 border-sky-100 text-sky-800',
          accent: 'font-sans',
          monoText: 'font-mono text-slate-400'
        };
    }
  };

  const style = getStyleClasses();

  const renderBlock = (block: SlideBlock) => {
    const alignClass = block.alignment === 'center'
      ? 'text-center'
      : block.alignment === 'right'
        ? 'text-right'
        : 'text-left';

    // Build custom font/color overrides dynamically
    const inlineStyle: React.CSSProperties = {};
    if (block.fontColor) {
      inlineStyle.color = block.fontColor;
    }

    const isNumericSize = block.fontSize !== undefined && block.fontSize !== null && (
      typeof block.fontSize === 'number' || 
      /^\d+/.test(String(block.fontSize))
    );

    if (isNumericSize) {
      const numericVal = parseFloat(String(block.fontSize));
      if (!isNaN(numericVal)) {
        if (/^\d+$/.test(String(block.fontSize).trim()) || typeof block.fontSize === 'number') {
          inlineStyle.fontSize = `${numericVal}px`;
        } else {
          inlineStyle.fontSize = String(block.fontSize);
        }
      }
    }

    let fontFamilyClass = '';
    if (block.fontFamily) {
      switch (block.fontFamily) {
        case 'sans': fontFamilyClass = 'font-sans'; break;
        case 'serif': fontFamilyClass = 'font-serif'; break;
        case 'mono': fontFamilyClass = 'font-mono'; break;
        case 'display': fontFamilyClass = 'font-display font-bold tracking-tight'; break;
        case 'handwritten': fontFamilyClass = 'font-handwritten tracking-wide'; break;
      }
    }

    // Adapt font-sizes or default to standard size if not defined
    const getHeadingSize = () => {
      if (isNumericSize) return '';
      if (block.fontSize) {
        switch (block.fontSize) {
          case 'xs': return 'text-[11px] sm:text-xs-heading';
          case 'sm': return 'text-xs sm:text-sm-heading';
          case 'base': return 'text-sm sm:text-base';
          case 'lg': return 'text-base sm:text-lg';
          case 'xl': return 'text-lg sm:text-xl';
          case '2xl': return 'text-xl sm:text-2xl';
          case '3xl': return 'text-2xl sm:text-3xl';
          case '4xl': return 'text-3xl sm:text-4xl';
          case '5xl': return 'text-4xl sm:text-5xl lg:text-6xl';
        }
      }
      return isFullscreen ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-lg sm:text-xl lg:text-2xl';
    };

    const getNormalSize = () => {
      if (isNumericSize) return '';
      if (block.fontSize) {
        switch (block.fontSize) {
          case 'xs': return 'text-[10px] sm:text-[11px]';
          case 'sm': return 'text-[11px] sm:text-xs';
          case 'base': return 'text-xs sm:text-sm';
          case 'lg': return 'text-sm sm:text-base';
          case 'xl': return 'text-base sm:text-lg';
          case '2xl': return 'text-lg sm:text-xl';
          case '3xl': return 'text-xl sm:text-2xl';
          case '4xl': return 'text-2xl sm:text-3xl';
          case '5xl': return 'text-3xl sm:text-4xl lg:text-5xl';
        }
      }
      return isFullscreen ? 'text-sm sm:text-base lg:text-lg' : 'text-xs sm:text-sm';
    };

    switch (block.type) {
      case 'heading':
        return (
          <h3 
            key={block.id} 
            style={inlineStyle}
            className={`font-semibold tracking-tight text-current/95 my-1.5 ${alignClass} ${fontFamilyClass} ${getHeadingSize()}`}
          >
            {block.content}
          </h3>
        );

      case 'highlight':
        return (
          <div 
            key={block.id} 
            className={`flex items-start rounded-xl border leading-relaxed ${alignClass} ${style.highlight} font-medium ${
              isFullscreen ? 'p-5 text-sm sm:text-base gap-3' : 'p-3 text-xs sm:text-sm'
            }`}
          >
            <AlertCircle className={`flex-shrink-0 text-current mt-0.5 ${isFullscreen ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-1.5'}`} />
            <p 
              className={`flex-1 ${fontFamilyClass} ${getNormalSize()}`}
              style={inlineStyle}
            >
              {block.content}
            </p>
          </div>
        );

      case 'list':
        return (
          <div key={block.id} className={`space-y-1.5 ${alignClass}`}>
            {block.content && (
              <h4 
                style={inlineStyle}
                className={`uppercase tracking-wider text-current/60 font-medium font-mono ${fontFamilyClass} ${
                  isFullscreen ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
                }`}
              >
                {block.content}
              </h4>
            )}
            <ul className={`list-disc ${block.alignment === 'center' ? 'list-none' : 'pl-5'} space-y-1`}>
              {(block.listItems || []).map((item, i) => (
                <li 
                  key={i} 
                  style={inlineStyle}
                  className={`leading-relaxed text-current/90 font-medium ${fontFamilyClass} ${getNormalSize()}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'quiz':
        return (
          <div key={block.id} className={`rounded-xl border ${style.card} ${isFullscreen ? 'p-5' : 'p-4'} text-left`}>
            <div className="flex items-center space-x-1.5 text-current/70 text-[9px] uppercase tracking-wider font-mono mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Student Concept Check</span>
            </div>
            
            <p 
              style={inlineStyle}
              className={`font-medium text-current/90 ${fontFamilyClass} ${getNormalSize()} ${
                isFullscreen ? 'mb-3' : 'mb-2.5'
              }`}
            >
              {block.content}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
                    className={`rounded-lg text-left transition-all tracking-tight cursor-pointer px-3 py-1.5 text-xs font-medium ${choiceStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showAnswerFeedback && (
              <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono pt-2 border-t border-current/10">
                <span className="text-emerald-400 font-bold">✓ Correct Option Highlighted!</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuizAnswer(null);
                    setShowAnswerFeedback(false);
                  }}
                  className="text-current/50 hover:text-current transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Reset Quiz</span>
                </button>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className={`border text-center relative ${style.card} p-2 rounded-2xl`}>
            <div className="aspect-video w-full rounded-xl bg-black/5 overflow-hidden flex flex-col items-center justify-center relative border border-current/10">
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
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-2.5 bg-[#090d16]/80 text-white rounded-lg backdrop-blur-xs max-w-[200px] border border-white/10 shadow-md">
                    <span className="text-[8px] tracking-widest uppercase font-mono text-[#38bdf8] mb-0.5 font-bold">
                      Illustration
                    </span>
                    <p className="text-[9px] font-medium truncate w-full">
                      "{block.imagePrompt}"
                    </p>
                  </div>
                </>
              )}
            </div>
            {block.caption && (
              <p 
                style={inlineStyle}
                className={`font-medium mt-1 text-current/70 italic ${fontFamilyClass} ${getNormalSize()}`}
              >
                {block.caption} {block.content && `(${block.content})`}
              </p>
            )}
          </div>
        );

      case 'video':
        {
          const ytId = getYouTubeId(block.videoUrl);
          return (
            <div key={block.id} className={`border text-center relative ${style.card} p-2 rounded-2xl`}>
              <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative border border-current/10 shadow-md">
                {ytId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full border-none"
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0`}
                    title={block.content || "YouTube video player"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-white bg-slate-950">
                    <span className="text-xs font-semibold opacity-85">No YouTube Video</span>
                  </div>
                )}
              </div>
              {block.content && (
                <h4 
                  style={inlineStyle}
                  className={`font-semibold tracking-tight text-current/95 mt-1.5 ${fontFamilyClass} ${getNormalSize()}`}
                >
                  {block.content}
                </h4>
              )}
              {block.caption && (
                <p 
                  style={inlineStyle}
                  className={`font-medium mt-0.5 text-current/60 italic ${fontFamilyClass} ${getNormalSize()}`}
                >
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
            style={inlineStyle}
            className={`leading-relaxed text-current/85 ${alignClass} ${fontFamilyClass} ${getNormalSize()}`}
          >
            {block.content}
          </p>
        );
    }
  };

  const layout = activeSlide.layoutStyle || 'stacked';
  const hasMedia = activeSlide.blocks.some(b => b.type === 'image' || b.type === 'video');

  if (previewMode && !isFullscreen) {
    const virtualWidth = 1024;
    const virtualHeight = 576; // 16:9 Aspect Ratio of high definition screens

    // Determine the style values dynamically so it matches the color scheme accurately
    let previewBgStyle: React.CSSProperties = {
      width: `${virtualWidth}px`,
      height: `${virtualHeight}px`,
      transform: `scale(${scale})`,
    };

    switch (activeSlide.backgroundStyle) {
      case 'editorial':
        previewBgStyle.backgroundColor = '#faf6f0';
        previewBgStyle.color = '#3b2314';
        break;
      case 'ocean':
        previewBgStyle.backgroundImage = 'linear-gradient(to bottom right, #0c4a6e, #0f172a)';
        previewBgStyle.color = '#e0f2fe';
        break;
      case 'terminal':
        previewBgStyle.backgroundColor = '#050b14';
        previewBgStyle.color = '#34d399';
        break;
      case 'midnight_aurora':
        previewBgStyle.backgroundImage = 'linear-gradient(to bottom right, #1e1b4b, #311042, #0c0a24)';
        previewBgStyle.color = '#f3e8ff';
        break;
      case 'forest_moss':
        previewBgStyle.backgroundImage = 'linear-gradient(to bottom right, #062419, #0b130e)';
        previewBgStyle.color = '#d1fae5';
        break;
      case 'soft_lavender':
        previewBgStyle.backgroundColor = '#fafafc';
        previewBgStyle.color = '#1e1b4b';
        break;
      case 'sunset_glow':
        previewBgStyle.backgroundImage = 'linear-gradient(to bottom right, #451a03, #1c0a00)';
        previewBgStyle.color = '#fff7ed';
        break;
      case 'minimal_chalk':
        previewBgStyle.backgroundColor = '#121214';
        previewBgStyle.color = '#d4d4d8';
        break;
      case 'cyberpunk_neon':
        previewBgStyle.backgroundColor = '#0c0517';
        previewBgStyle.color = '#f472b6';
        break;
      case 'slate':
      default:
        previewBgStyle.backgroundColor = '#f8fafc';
        previewBgStyle.color = '#1e293b';
        break;
    }

    return (
      <div 
        ref={containerRef} 
        className="w-full aspect-video rounded-2xl border border-flat-border overflow-hidden relative shadow-3xs select-none bg-slate-900"
        id="public-slide-presentation-screen-preview-wrapper"
      >
        <div 
          className="absolute origin-top-left transition-all duration-305 flex flex-col justify-between p-8"
          style={previewBgStyle}
        >
          {/* Decorative Slide Background elements overlay depending on theme */}
          {activeSlide.backgroundStyle === 'ocean' && (
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-sky-400 filter blur-3xl" />
              <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full bg-indigo-500 filter blur-3xl" />
            </div>
          )}

          {/* Public View Header Area */}
          <div className="flex items-center justify-between w-full relative z-10 select-none">
            <div className="flex items-center space-x-2">
              {masterHeaderLogo ? (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-[#ffffff10] border border-[#ffffff10] rounded-xl backdrop-blur-3xs" id="public-header-brand-logo-preview">
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
                <span className="flex items-center space-x-1 text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  <span>Auto-Advance Pacing: {countdownValue}s</span>
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm font-mono flex items-center space-x-3 text-current/70">
              <span>Slide {currentSlideIndex + 1} of {totalSlidesCount}</span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/10 hover:bg-black/20 text-current border border-current/10 font-bold text-[10px] tracking-tight cursor-pointer"
                title="Toggle TV / Projector Fullscreen Mode"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Main Slide Core Content container */}
          <div className="flex-1 my-6 max-w-[95%] xl:max-w-[1440px] 2xl:max-w-[1680px] mx-auto w-full flex flex-col justify-center relative z-10 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Subjective Brand Logos on Top of Slide */}
                {slideLogos && slideLogos.length > 0 && (
                  <div 
                    className={`flex flex-wrap gap-4 mb-4 ${
                      slideLogoAlign === 'left' 
                        ? 'justify-start' 
                        : slideLogoAlign === 'right' 
                          ? 'justify-end' 
                          : 'justify-center'
                    }`}
                  >
                    {slideLogos.map((logoSrc, logoIdx) => (
                      <img 
                        key={`slide-logo-emblem-preview-${logoIdx}`}
                        src={logoSrc} 
                        alt={`Brand Logo Emblem ${logoIdx + 1}`} 
                        className="object-contain max-h-12 w-auto filter drop-shadow-xs select-none"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                )}

                {/* Display title always first, if present */}
                {activeSlide.title && activeSlide.title.trim() !== '' && (
                  <h2 className={style.title}>
                    {activeSlide.title}
                  </h2>
                )}

                {/* Slide Layout dispatcher: Supports standard Stacked or Side-by-side Splits */}
                {(layout === 'split' || layout === 'split-reverse') && hasMedia ? (
                  <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Content Column */}
                    <div className={`col-span-7 space-y-4 ${layout === 'split-reverse' ? 'order-2' : 'order-1'}`}>
                      {activeSlide.blocks.filter(b => b.type !== 'image' && b.type !== 'video').map(b => renderBlock(b))}
                    </div>
                    {/* Media Column */}
                    <div className={`col-span-5 space-y-4 ${layout === 'split-reverse' ? 'order-1' : 'order-2'}`}>
                      {activeSlide.blocks.filter(b => b.type === 'image' || b.type === 'video').map(b => renderBlock(b))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {activeSlide.blocks.map(b => renderBlock(b))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Public View Footer Controls */}
          <div className="relative z-10 flex flex-row items-center justify-between text-xs sm:text-sm select-none border-t border-current/10 pt-4 mt-8 gap-4">
            <div className="flex items-center space-x-2 text-current/50 font-mono text-[10px]">
              <span>EduFlow Suite</span>
            </div>
            
            {/* On-Screen Clicker Helper Slide Controller */}
            <div className="flex items-center space-x-3 text-current">
              <button
                type="button"
                disabled={currentSlideIndex === 0}
                onClick={onPrevSlide}
                className="p-1 px-1.5 rounded border border-current/10 bg-black/5 hover:bg-black/15 transition-all text-[11px] font-bold cursor-pointer"
              >
                Prev
              </button>
              
              <span className="text-[10px] font-mono font-medium opacity-70">
                {currentSlideIndex + 1} / {totalSlidesCount}
              </span>
              
              <button
                type="button"
                disabled={currentSlideIndex === totalSlidesCount - 1}
                onClick={onNextSlide}
                className="p-1 px-1.5 rounded border border-current/10 bg-black/5 hover:bg-black/15 transition-all text-[11px] font-bold cursor-pointer"
              >
                Next
              </button>
            </div>

            {/* Progress Bar of slide collection */}
            <div className="w-24 h-1 bg-[#ffffff15] rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-400 transition-all duration-350"
                style={{ width: `${((currentSlideIndex + 1)/ totalSlidesCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Oral Recitation Selection Screen Overlay Alert */}
          <AnimatePresence>
            {activeStudent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className="absolute inset-x-8 bottom-8 bg-[#020617] text-white p-4 rounded-xl border border-[#1e293b] shadow-2xl flex items-center justify-between z-50 alert-overlay"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">
                      Recitation Call
                    </span>
                    <p className="text-sm font-semibold tracking-tight text-white font-display">
                      {activeStudent.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono">
                    Recitations: {activeStudent.recitationCount}
                  </div>
                  {onClearActiveStudent && (
                    <button
                      type="button"
                      onClick={onClearActiveStudent}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating trigger button inside the scaled container */}
          {students && students.length > 0 && !showRouletteDrawer && (
            <button
              type="button"
              onClick={() => setShowRouletteDrawer(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-35 bg-sky-600/90 hover:bg-sky-500 text-white px-1 py-3 rounded-r border border-l-0 border-white/20 text-[9px] font-bold tracking-wider select-none cursor-pointer"
              style={{ writingMode: 'vertical-lr' }}
            >
              <span>WHEEL</span>
            </button>
          )}

          {/* Oral Recitation drawer inside mock projector area */}
          <AnimatePresence>
            {showRouletteDrawer && students && students.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRouletteDrawer(false)}
                  className="absolute inset-0 bg-black/40 z-40 cursor-pointer"
                />
                
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 190 }}
                  className={`absolute left-0 top-0 bottom-0 h-full w-[260px] z-50 flex flex-col border-r shadow-2xl backdrop-blur-md ${
                    ['ocean', 'terminal', 'midnight_aurora', 'forest_moss', 'sunset_glow', 'minimal_chalk', 'cyberpunk_neon'].includes(activeSlide.backgroundStyle)
                      ? 'bg-slate-950/95 border-white/10 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between p-3 border-b border-current/10">
                    <span className="font-bold text-[9px] uppercase tracking-wider font-mono text-sky-400">Oral Roulette</span>
                    <button
                      type="button"
                      onClick={() => setShowRouletteDrawer(false)}
                      className="p-1 rounded hover:bg-black/10 text-current/60 hover:text-current"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 flex flex-col justify-center items-center scale-90">
                    {onUpdateRoster && onStudentSelected ? (
                      <RecitationRoulette
                        students={students}
                        onUpdateRoster={onUpdateRoster}
                        onStudentSelected={(s) => {
                          onStudentSelected(s);
                          setTimeout(() => {
                            setShowRouletteDrawer(false);
                          }, 2500);
                        }}
                        compact={true}
                      />
                    ) : null}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${
        isFullscreen 
          ? 'fixed inset-0 w-screen h-screen z-[9999] flex flex-col justify-between p-4 sm:p-8 md:p-12 rounded-none border-none' 
          : 'relative w-full h-full min-h-[480px] flex flex-col justify-between p-4 sm:p-6 lg:p-8 rounded-2xl border'
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
          {students && students.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRouletteDrawer(!showRouletteDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all hover:scale-103 shadow-3xs cursor-pointer select-none ${
                showRouletteDrawer
                  ? 'bg-sky-500 text-white border-sky-400'
                  : 'bg-black/5 hover:bg-black/15 text-current border-current/10'
              }`}
              title="Toggle Recitation Wheel Drawer"
              id="btn-toggle-integrated-roulette"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{showRouletteDrawer ? 'Hide Wheel' : 'Oral Roulette'}</span>
            </button>
          )}
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
      <div className="flex-1 my-6 max-w-[95%] xl:max-w-[1440px] 2xl:max-w-[1680px] mx-auto w-full flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Subjective Brand Logos on Top of Slide */}
            {slideLogos && slideLogos.length > 0 && (
              <div 
                className={`flex flex-wrap gap-4 mb-4 animate-fade-in ${
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
                    className={`object-contain max-h-12 w-auto filter drop-shadow-xs select-none`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            )}

            {/* Display title always first, if present */}
            {activeSlide.title && activeSlide.title.trim() !== '' && (
              <h2 className={`${style.title}`}>
                {activeSlide.title}
              </h2>
            )}

            {/* Slide Layout dispatcher: Supports standard Stacked or Side-by-side Splits */}
            {(layout === 'split' || layout === 'split-reverse') && hasMedia ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Content Column (paragraphs, bullet lists, custom highlight boxes, quizzes) */}
                <div className={`md:col-span-7 space-y-4 ${layout === 'split-reverse' ? 'md:order-2' : 'md:order-1'}`}>
                  {activeSlide.blocks.filter(b => b.type !== 'image' && b.type !== 'video').map(b => renderBlock(b))}
                </div>
                {/* Media Column (images/photo blocks or YouTube iframe frames) */}
                <div className={`md:col-span-5 space-y-4 ${layout === 'split-reverse' ? 'md:order-1' : 'md:order-2'}`}>
                  {activeSlide.blocks.filter(b => b.type === 'image' || b.type === 'video').map(b => renderBlock(b))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-[95%] xl:max-w-[1300px] 2xl:max-w-[1500px] mx-auto w-full">
                {activeSlide.blocks.map(b => renderBlock(b))}
              </div>
            )}
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

      {/* Floating vertical pull tab to show wheel on the left edge */}
      {students && students.length > 0 && !showRouletteDrawer && (
        <button
          type="button"
          onClick={() => setShowRouletteDrawer(true)}
          className="absolute left-0 top-1/2 -translate-y-76 z-35 bg-sky-600/90 hover:bg-sky-500 text-white px-1.5 py-4 rounded-r-xl shadow-lg flex flex-col items-center gap-1.5 cursor-pointer text-[9px] font-bold tracking-wider hover:pl-2.5 transition-all duration-200 border border-l-0 border-white/20 select-none font-sans"
          style={{ writingMode: 'vertical-lr' }}
          id="btn-floating-roulette-trigger"
        >
          <Shuffle className="w-3.5 h-3.5 transform -rotate-90" />
          <span>ROSTER WHEEL</span>
        </button>
      )}

      {/* Slide-out Recitation Roulette Drawer */}
      <AnimatePresence>
        {showRouletteDrawer && students && students.length > 0 && (
          <>
            {/* Dark backing overlay scrim to click out and focus */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRouletteDrawer(false)}
              className="absolute inset-0 bg-black/40 z-40 cursor-pointer"
            />
            
            {/* Actual drawer pane */}
            <motion.div
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: 'spring', damping: 26, stiffness: 190 }}
              className={`absolute left-0 top-0 bottom-0 h-full w-[310px] sm:w-[360px] z-50 flex flex-col border-r shadow-2xl backdrop-blur-md ${
                ['ocean', 'terminal', 'midnight_aurora', 'forest_moss', 'sunset_glow', 'minimal_chalk', 'cyberpunk_neon'].includes(activeSlide.backgroundStyle)
                  ? 'bg-slate-950/95 border-white/10 text-slate-100'
                  : 'bg-white/95 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-current/10">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-sky-450 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="font-bold text-[10px] uppercase tracking-wider font-mono text-sky-400">Oral Roulette Panel</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRouletteDrawer(false)}
                  className="p-1 px-1.5 rounded-md hover:bg-black/10 text-current/60 hover:text-current cursor-pointer transition-colors"
                  title="Close Wheel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
                {onUpdateRoster && onStudentSelected ? (
                  <RecitationRoulette
                    students={students}
                    onUpdateRoster={onUpdateRoster}
                    onStudentSelected={(s) => {
                      onStudentSelected(s);
                      // Auto close drawer after a small delay to focus fully on the selection call splash overlay
                      setTimeout(() => {
                        setShowRouletteDrawer(false);
                      }, 2500);
                    }}
                    compact={true}
                  />
                ) : (
                  <p className="text-xs text-center text-current/50">Recitation handlers are not configured correctly.</p>
                )}
              </div>
            </motion.div>
          </>
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
