import React, { useState, useEffect } from 'react';
import { Slide, Student, ViewMode, Presentation } from './types';
import { INITIAL_SLIDES, INITIAL_ROSTER } from './data';
import PresenterDashboard from './components/PresenterDashboard';
import PublicView from './components/PublicView';
import PresentationManager from './components/PresentationManager';
import LandingPage from './components/LandingPage';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Tv, 
  Settings, 
  Terminal, 
  UserCheck, 
  FileText, 
  Volume2, 
  Sparkles, 
  HelpCircle,
  Database,
  ArrowRight,
  ClipboardList,
  BookOpen,
  MonitorCheck,
  CheckCircle,
  UserCheck2,
  Clock,
  Flame,
  LogOut,
  User as UserIcon,
  Loader2
} from 'lucide-react';

export default function App() {
  // Authentication & Loading States
  const [user, setUser] = useState<User | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState<boolean>(true);

  // Core Presentation & Session States
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [activePresentationId, setActivePresentationId] = useState<string>('p1');
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [activeSlideId, setActiveSlideId] = useState<string>(INITIAL_SLIDES[0].id);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_ROSTER);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const activePresentation = presentations.find(p => p.id === activePresentationId) || presentations[0];

  // Helper: Save presentation to Firestore
  const savePresentationToFirestore = async (pres: Presentation, uid: string) => {
    if (!uid || uid.startsWith('demo-') || !auth.currentUser) {
      console.log('Skipping Firestore save for guest/demo session.');
      return;
    }
    const path = `users/${uid}/presentations/${pres.id}`;
    try {
      const docRef = doc(db, 'users', uid, 'presentations', pres.id);
      await setDoc(docRef, {
        id: pres.id,
        title: pres.title,
        userId: uid,
        slides: pres.slides,
        lastSavedAt: pres.lastSavedAt,
        logoUrl: pres.logoUrl || null,
        logos: pres.logos || [],
        logoAlignment: pres.logoAlignment || 'center'
      });
    } catch (err) {
      console.error('Failed to save presentation to Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Helper: Delete presentation from Firestore
  const deletePresentationFromFirestore = async (presId: string, uid: string) => {
    if (!uid || uid.startsWith('demo-') || !auth.currentUser) {
      console.log('Skipping Firestore delete for guest/demo session.');
      return;
    }
    const path = `users/${uid}/presentations/${presId}`;
    try {
      const docRef = doc(db, 'users', uid, 'presentations', presId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete presentation from Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Helper: Save roster to Firestore
  const saveRosterToFirestore = async (updatedStudents: Student[], uid: string) => {
    if (!uid || uid.startsWith('demo-') || !auth.currentUser) {
      console.log('Skipping Firestore roster save for guest/demo session.');
      return;
    }
    const path = `users/${uid}/rosters/default_roster`;
    try {
      const docRef = doc(db, 'users', uid, 'rosters', 'default_roster');
      await setDoc(docRef, {
        id: 'default_roster',
        name: 'Default Class Roster',
        userId: uid,
        students: updatedStudents
      });
    } catch (err) {
      console.error('Failed to save roster to Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Handle Auth State Changes & Fetch user specific datasets on Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingWorkspace(true);
        try {
          // 1. Fetch user presentations from Firestore
          const collectionPath = `users/${currentUser.uid}/presentations`;
          let qSnap;
          try {
            qSnap = await getDocs(collection(db, 'users', currentUser.uid, 'presentations'));
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, collectionPath);
            throw err;
          }

          const fetchedPresentations: Presentation[] = [];
          qSnap.forEach(docSnap => {
            fetchedPresentations.push(docSnap.data() as Presentation);
          });

          if (fetchedPresentations.length > 0) {
            setPresentations(fetchedPresentations);
            // Default active ID to the first item, or check local preference
            const savedActiveId = localStorage.getItem(`eduflow_active_id_${currentUser.uid}`);
            const isValidSaved = fetchedPresentations.some(p => p.id === savedActiveId);
            const initialId = isValidSaved && savedActiveId ? savedActiveId : fetchedPresentations[0].id;
            setActivePresentationId(initialId);
            
            const targetP = fetchedPresentations.find(p => p.id === initialId) || fetchedPresentations[0];
            setSlides(targetP.slides);
            if (targetP.slides.length > 0) {
              setActiveSlideId(targetP.slides[0].id);
            }
          } else {
            // Seed default presentation for the new user in Firestore
            const initialDefault: Presentation = {
              id: 'p1',
              title: 'Introduction to Active Recall',
              slides: INITIAL_SLIDES,
              lastSavedAt: new Date().toISOString()
            };
            await savePresentationToFirestore(initialDefault, currentUser.uid);
            setPresentations([initialDefault]);
            setActivePresentationId('p1');
            setSlides(INITIAL_SLIDES);
            setActiveSlideId(INITIAL_SLIDES[0].id);
          }

          // 2. Fetch user class roster from Firestore
          const rosterPath = `users/${currentUser.uid}/rosters/default_roster`;
          const rosterRef = doc(db, 'users', currentUser.uid, 'rosters', 'default_roster');
          let rosterSnap;
          try {
            rosterSnap = await getDoc(rosterRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, rosterPath);
            throw err;
          }

          if (rosterSnap.exists()) {
            const rosterData = rosterSnap.data();
            if (rosterData && Array.isArray(rosterData.students)) {
              setStudents(rosterData.students);
            }
          } else {
            // Seed standard class roster in Firestore
            await saveRosterToFirestore(INITIAL_ROSTER, currentUser.uid);
            setStudents(INITIAL_ROSTER);
          }

        } catch (err) {
          console.error('Error fetching Workspace data from Firestore:', err);
          // Standard local fallback in case of permissions or offline status
          loadLocalFallback();
        } finally {
          setLoadingWorkspace(false);
        }
      } else {
        // Clear local active objects and set auth ready
        setPresentations([]);
        loadLocalFallback();
        setLoadingWorkspace(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLocalFallback = () => {
    const saved = localStorage.getItem('eduflow_presentations');
    let localItems: Presentation[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localItems = parsed;
        }
      } catch (err) {
        console.error('Failed local parse', err);
      }
    }
    if (localItems.length === 0) {
      localItems = [
        {
          id: 'p1',
          title: 'Introduction to Active Recall',
          slides: INITIAL_SLIDES,
          lastSavedAt: new Date().toISOString()
        }
      ];
    }
    setPresentations(localItems);
    const savedActiveId = localStorage.getItem('eduflow_active_presentation_id') || 'p1';
    setActivePresentationId(localItems.some(p => p.id === savedActiveId) ? savedActiveId : localItems[0].id);
    setStudents(INITIAL_ROSTER);
  };

  // Sync active presentation slide data whenever activeId changes
  useEffect(() => {
    const targetPres = presentations.find(p => p.id === activePresentationId);
    if (targetPres) {
      setSlides(targetPres.slides);
      if (targetPres.slides.length > 0) {
        // Set to first slide index of target
        const hasActiveInTarget = targetPres.slides.some(s => s.id === activeSlideId);
        if (!hasActiveInTarget) {
          setActiveSlideId(targetPres.slides[0].id);
        }
      }
    }
  }, [activePresentationId, presentations]);

  // Persist presentations list and active ID to localStorage & Firestore where applicable
  useEffect(() => {
    if (presentations.length > 0) {
      localStorage.setItem('eduflow_presentations', JSON.stringify(presentations));
    }
  }, [presentations]);

  useEffect(() => {
    if (activePresentationId && activePresentationId !== 'undefined') {
      localStorage.setItem('eduflow_active_presentation_id', activePresentationId);
      if (user) {
        localStorage.setItem(`eduflow_active_id_${user.uid}`, activePresentationId);
      }
    }
  }, [activePresentationId, user]);

  const handleUpdateSlides = (updatedSlides: Slide[]) => {
    setSlides(updatedSlides);
    setIsSaving(true);
    
    setPresentations(prev => prev.map(p => {
      if (p.id === activePresentationId) {
        const updated = {
          ...p,
          slides: updatedSlides,
          lastSavedAt: new Date().toISOString()
        };
        if (user) {
          savePresentationToFirestore(updated, user.uid);
        }
        return updated;
      }
      return p;
    }));

    setTimeout(() => {
      setIsSaving(false);
    }, 400);
  };

  const handleUpdateLogo = (id: string, logoUrl: string | undefined) => {
    setIsSaving(true);
    setPresentations(prev => prev.map(p => {
      if (p.id === id) {
        const curLogos = p.logos || [];
        const nextLogos = logoUrl 
          ? (curLogos.length === 0 ? [logoUrl] : curLogos)
          : curLogos;
        const updated = {
          ...p,
          logoUrl,
          logos: nextLogos,
          lastSavedAt: new Date().toISOString()
        };
        if (user) {
          savePresentationToFirestore(updated, user.uid);
        }
        return updated;
      }
      return p;
    }));

    setTimeout(() => {
      setIsSaving(false);
    }, 400);
  };

  const handleUpdateLogos = (id: string, logos: string[]) => {
    setIsSaving(true);
    setPresentations(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          logos,
          logoUrl: logos[0] || undefined,
          lastSavedAt: new Date().toISOString()
        };
        if (user) {
          savePresentationToFirestore(updated, user.uid);
        }
        return updated;
      }
      return p;
    }));
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleUpdateLogoAlignment = (id: string, alignment: 'left' | 'center' | 'right') => {
    setIsSaving(true);
    setPresentations(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          logoAlignment: alignment,
          lastSavedAt: new Date().toISOString()
        };
        if (user) {
          savePresentationToFirestore(updated, user.uid);
        }
        return updated;
      }
      return p;
    }));
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleCreatePresentation = async (title: string) => {
    const newPresId = 'p_' + Math.random().toString(36).substring(2, 11);
    const newPres: Presentation = {
      id: newPresId,
      title: title,
      slides: [
        {
          id: 'slide_' + Math.random().toString(36).substring(2, 11),
          title: 'Welcome to your new slide deck',
          backgroundStyle: 'slate',
          autoAdvance: false,
          duration: 15,
          blocks: [
            {
              id: 'block_' + Math.random().toString(36).substring(2, 11),
              type: 'heading',
              content: title,
            },
            {
              id: 'block_' + Math.random().toString(36).substring(2, 11),
              type: 'text',
              content: 'Welcome to your brand new presentation stack! Click here or open the presenter dashboard block builder to design, order, and preview personalized active-learning quiz blocks.',
            }
          ]
        }
      ],
      lastSavedAt: new Date().toISOString()
    };

    setPresentations(prev => [...prev, newPres]);
    setActivePresentationId(newPresId);
    if (user) {
      await savePresentationToFirestore(newPres, user.uid);
    }
  };

  const handleDeletePresentation = async (id: string) => {
    const remaining = presentations.filter(p => p.id !== id);
    if (remaining.length === 0) return;

    setPresentations(remaining);
    if (activePresentationId === id) {
      setActivePresentationId(remaining[0].id);
    }
    if (user) {
      await deletePresentationFromFirestore(id, user.uid);
    }
  };

  const handleDuplicatePresentation = async (id: string) => {
    const target = presentations.find(p => p.id === id);
    if (!target) return;

    const duplicateId = 'p_' + Math.random().toString(36).substring(2, 11);
    const clonedSlides = JSON.parse(JSON.stringify(target.slides)) as Slide[];
    const remappedSlides = clonedSlides.map(slide => {
      const newSlideId = 'slide_' + Math.random().toString(36).substring(2, 11);
      return {
        ...slide,
        id: newSlideId,
        blocks: (slide.blocks || []).map(block => ({
          ...block,
          id: 'block_' + Math.random().toString(36).substring(2, 11)
        }))
      };
    });

    const duplicate: Presentation = {
      id: duplicateId,
      title: `${target.title} (Copy)`,
      slides: remappedSlides,
      lastSavedAt: new Date().toISOString()
    };

    setPresentations(prev => [...prev, duplicate]);
    setActivePresentationId(duplicateId);
    if (user) {
      await savePresentationToFirestore(duplicate, user.uid);
    }
  };

  const handleRenamePresentation = async (id: string, newTitle: string) => {
    setPresentations(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          title: newTitle,
          lastSavedAt: new Date().toISOString()
        };
        if (user) {
          savePresentationToFirestore(updated, user.uid);
        }
        return updated;
      }
      return p;
    }));
  };

  const handleImportPresentation = async (imported: Presentation) => {
    const newPresId = 'p_' + Math.random().toString(36).substring(2, 11);
    const clonedSlides = JSON.parse(JSON.stringify(imported.slides || [])) as Slide[];
    const remappedSlides = clonedSlides.map(slide => {
      const newSlideId = 'slide_' + Math.random().toString(36).substring(2, 11);
      return {
        ...slide,
        id: newSlideId,
        blocks: (slide.blocks || []).map(block => ({
          ...block,
          id: 'block_' + Math.random().toString(36).substring(2, 11)
        }))
      };
    });

    const newPres: Presentation = {
      id: newPresId,
      title: imported.title || 'Imported Presentation',
      slides: remappedSlides.length > 0 ? remappedSlides : [
        {
          id: 'slide_' + Math.random().toString(36).substring(2, 11),
          title: 'Empty Imported Slide',
          backgroundStyle: 'slate',
          autoAdvance: false,
          duration: 15,
          blocks: []
        }
      ],
      lastSavedAt: new Date().toISOString()
    };

    setPresentations(prev => [...prev, newPres]);
    setActivePresentationId(newPresId);
    if (user) {
      await savePresentationToFirestore(newPres, user.uid);
    }
  };

  const handleExportPresentation = (id: string) => {
    const target = presentations.find(p => p.id === id);
    if (!target) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(target, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeName = target.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadAnchor.setAttribute("download", `eduflow-${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleUpdateRoster = (newRoster: Student[]) => {
    setStudents(newRoster);
    if (user) {
      saveRosterToFirestore(newRoster, user.uid);
    }
  };

  const handleSignOut = async () => {
    setLoadingWorkspace(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  // Slide auto advancement timers
  const [isAutoplayRunning, setIsAutoplayRunning] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(0);

  // View control: 'split' screen is perfect for local testing!
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showDocumentationCenter, setShowDocumentationCenter] = useState<boolean>(true);

  const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Sync autoplay countdown when active slide changes
  useEffect(() => {
    if (activeSlide) {
      setCountdownValue(activeSlide.autoAdvance ? activeSlide.duration : 0);
    }
  }, [activeSlideId]);

  // Autoplay advanced countdown timer tick loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoplayRunning && activeSlide.autoAdvance) {
      interval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            // Timer expired! Advance to next slide in sequence
            const nextIdx = (activeSlideIndex + 1) % slides.length;
            setActiveSlideId(slides[nextIdx].id);
            return slides[nextIdx].autoAdvance ? slides[nextIdx].duration : 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoplayRunning, activeSlideId, slides, activeSlideIndex]);

  const handleStudentSelectedByRoulette = (student: Student) => {
    setActiveStudent(student);
  };

  const handleClearActiveStudent = () => {
    setActiveStudent(null);
  };

  const handleToggleAutoplay = () => {
    setIsAutoplayRunning(!isAutoplayRunning);
  };

  const handleNextSlide = () => {
    const nextIdx = (activeSlideIndex + 1) % slides.length;
    setActiveSlideId(slides[nextIdx].id);
  };

  const handlePrevSlide = () => {
    const prevIdx = (activeSlideIndex - 1 + slides.length) % slides.length;
    setActiveSlideId(slides[prevIdx].id);
  };

  // Auth Loading Screen
  if (loadingWorkspace) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-slate-400">Loading Instructor Workspace...</h2>
          <p className="text-[10px] text-slate-500 font-mono">Synchronizing state with secure Cloud Firestore</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Render beautiful interactive landing page
  if (!user) {
    return (
      <LandingPage 
        onLoginSuccess={(signedInUser) => {
          setUser(signedInUser);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col font-sans" id="eduflow-interactive-root">
      
      {/* Dynamic Header Toolbar */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md border-b border-slate-950 flex flex-col md:flex-row items-center justify-between gap-4 select-none relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center border border-teal-450 shadow-md">
            <Tv className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
              <span>EduFlow Interactive</span>
              <span className="text-[9px] bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-widest border border-teal-500/25">Live</span>
            </h1>
            <p className="text-[10px] text-teal-300 font-mono tracking-wide">Automated Presentation Deck & Oral Recitation Suite</p>
          </div>
        </div>

        {/* View Selection Controls */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-x-1" id="sc-viewmode-selector">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'split' ? 'bg-teal-550 bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MonitorCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Screen</span> Tester
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'dashboard' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Teacher Dashboard</span>
          </button>
          <button
            onClick={() => setViewMode('public')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'public' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Public Projection</span>
          </button>
        </div>

        {/* Right side Profile, UTC Clock, Sign Out button */}
        <div className="flex items-center space-x-3">
          
          <div className="hidden xl:flex items-center gap-2 bg-slate-950 px-3 py-1 border border-slate-800 rounded-xl max-w-[170px]" title={`Signed in as ${user.email}`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="User Avatar" className="w-5 h-5 rounded-full border border-teal-550/40" />
            ) : (
              <UserIcon className="w-4 h-4 text-teal-400" />
            )}
            <span className="text-[10px] font-mono text-slate-300 truncate font-semibold">{user.displayName || user.email || 'Instructor'}</span>
          </div>

          <button
            onClick={() => setShowDocumentationCenter(!showDocumentationCenter)}
            className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showDocumentationCenter 
                ? 'bg-teal-500/10 text-teal-400 border-teal-450/30' 
                : 'text-slate-400 border-slate-800 hover:text-white'
            }`}
            id="btn-toggle-blueprints"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tech Blueprint Architecture</span>
          </button>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-505 hover:bg-rose-600/20 border border-rose-500/20 rounded-lg text-xs font-bold transition-all text-rose-400 flex items-center gap-1.5 cursor-pointer"
            title="Sign Out of Workspace"
            id="btn-workspace-signout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1700px] w-full mx-auto relative z-0">
        
        {/* Architecture Plan Callout alert */}
        {showDocumentationCenter && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs animate-fade-in" id="interactive-blueprint-documentation-panel">
            <div className="flex items-start justify-between border-b pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-teal-500" />
                <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-900">
                  EduFlow Technical Blueprint & Database Architectures
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDocumentationCenter(false)}
                className="text-xs text-slate-440 hover:text-slate-655 cursor-pointer font-bold px-2 py-1 rounded hover:bg-slate-50 border border-slate-200 transition-colors"
                id="btn-hide-blueprints"
              >
                Hide documentation panel
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 uppercase text-[11px] font-mono tracking-widest text-teal-600 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Recommended Tech Stacks
                </h3>
                <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2.5 shadow-3xs">
                  <p><strong>Frontend SPA:</strong> React + Vite (TS), Tailwind CSS for high density utility layouts, Framer Motion for wheel physics and slide easing transitions.</p>
                  <p><strong>Backend API Proxy:</strong> Node.js with Express server mapped to handle WebSockets or Server-Sent Events (SSE) for zero-latency synchronization between the dashboard and projector screen views.</p>
                  <p><strong>Database System:</strong> PostgreSQL (via Cloud SQL) for full relational integrity on historical class sessions, with Prisma or Drizzle ORM.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 uppercase text-[11px] font-mono tracking-widest text-teal-600 flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" /> Relational Postgres Schemas
                </h3>
                <div className="bg-slate-50 border p-3.5 rounded-xl space-y-3 font-mono text-[10px] leading-relaxed max-h-56 overflow-y-auto shadow-3xs">
                  <div>
                    <h4 className="font-bold text-slate-700">Table: presentation_slides</h4>
                    <p className="text-slate-500">
                      - id (UUID, PK)<br />
                      - title (VARCHAR, 255)<br />
                      - bg_style (VARCHAR, 50)<br />
                      - auto_advance (BOOLEAN)<br />
                      - duration (INT)<br />
                      - blocks (JSONB) -- block configurations<br />
                      - created_at (TIMESTAMP)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">Table: class_rosters</h4>
                    <p className="text-slate-500">
                      - id (UUID, PK)<br />
                      - name (VARCHAR, 100)<br />
                      - created_at (TIMESTAMP)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">Table: roster_students</h4>
                    <p className="text-slate-500">
                      - id (UUID, PK)<br />
                      - roster_id (UUID, FK)<br />
                      - name (VARCHAR, 100)<br />
                      - recitation_count (INT, DEFAULT 0)<br />
                      - is_absent (BOOLEAN, DEFAULT FALSE)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 uppercase text-[11px] font-mono tracking-widest text-teal-600 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Stepwise MVP Roadmap
                </h3>
                <div className="bg-slate-50 border p-3.5 rounded-xl space-y-1 text-xs shadow-3xs">
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                    <li><strong>Block Setup:</strong> Standardize state variables (Heading, Text, List, Highlight, Quiz blocks).</li>
                    <li><strong>Wheel Mechanics:</strong> Implement pure client-side rotation easing, canvas renders, and dynamic audio cues.</li>
                    <li><strong>Control Sync:</strong> Map Presenter events directly to listener observers.</li>
                    <li><strong>Durable Persistency:</strong> Embed Firestore collection schemas to store presentation edits permanently.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Presentation Manager Component */}
        <div className="mb-6">
          <PresentationManager
            presentations={presentations}
            activeId={activePresentationId}
            onSelect={setActivePresentationId}
            onCreate={handleCreatePresentation}
            onDelete={handleDeletePresentation}
            onDuplicate={handleDuplicatePresentation}
            onRename={handleRenamePresentation}
            onImport={handleImportPresentation}
            onExport={handleExportPresentation}
            onUpdateLogo={handleUpdateLogo}
            onUpdateLogos={handleUpdateLogos}
            onUpdateLogoAlignment={handleUpdateLogoAlignment}
            isSaving={isSaving}
            lastSavedAt={activePresentation?.lastSavedAt}
          />
        </div>

        {/* View Mode Router wrapper */}
        <div className="space-y-6">
          
          {/* VIEW: Split screen (Dual projection) - THE ULTIMATE EXPERIMENTAL PLAYGROUND! */}
          {viewMode === 'split' && (
            <PresenterDashboard
              slides={slides}
              activeSlideId={activeSlideId}
              onSelectSlide={setActiveSlideId}
              onUpdateSlides={handleUpdateSlides}
              students={students}
              onUpdateRoster={handleUpdateRoster}
              onStudentSelected={handleStudentSelectedByRoulette}
              countdownValue={countdownValue}
              isAutoplayRunning={isAutoplayRunning}
              onToggleAutoplay={handleToggleAutoplay}
              layoutMode="split"
              centerElement={
                <div className="flex flex-col h-full bg-white rounded-2xl border border-flat-border shadow-3xs overflow-hidden">
                  <div className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold justify-between shadow shrink-0 select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      Public Student Presentation View
                    </span>
                    <span className="text-[10px] font-mono opacity-60">Projector Screen Output</span>
                  </div>
                  <div className="flex-1 min-h-0 p-5 bg-slate-950 flex flex-col justify-center items-center overflow-y-auto relative" style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
                    <div className="w-full max-w-[95%]">
                      <PublicView
                        activeSlide={activeSlide}
                        activeStudent={activeStudent}
                        onClearActiveStudent={handleClearActiveStudent}
                        countdownValue={countdownValue}
                        totalSlidesCount={slides.length}
                        currentSlideIndex={activeSlideIndex}
                        onNextSlide={handleNextSlide}
                        onPrevSlide={handlePrevSlide}
                        logoUrl={activePresentation?.logoUrl}
                        logos={activePresentation?.logos}
                        logoAlignment={activePresentation?.logoAlignment}
                        students={students}
                        onUpdateRoster={handleUpdateRoster}
                        onStudentSelected={handleStudentSelectedByRoulette}
                        previewMode={true}
                      />
                    </div>
                  </div>
                </div>
              }
            />
          )}

          {/* VIEW: Standalone dashboard */}
          {viewMode === 'dashboard' && (
            <div className="bg-white p-6 rounded-3xl border border-flat-border shadow-xs">
              <PresenterDashboard
                slides={slides}
                activeSlideId={activeSlideId}
                onSelectSlide={setActiveSlideId}
                onUpdateSlides={handleUpdateSlides}
                students={students}
                onUpdateRoster={handleUpdateRoster}
                onStudentSelected={handleStudentSelectedByRoulette}
                countdownValue={countdownValue}
                isAutoplayRunning={isAutoplayRunning}
                onToggleAutoplay={handleToggleAutoplay}
              />
            </div>
          )}

          {/* VIEW: Standalone Public projection */}
          {viewMode === 'public' && (
            <div className="bg-white p-6 rounded-3xl border border-flat-border shadow-md max-w-5xl mx-auto">
              <PublicView
                activeSlide={activeSlide}
                activeStudent={activeStudent}
                onClearActiveStudent={handleClearActiveStudent}
                countdownValue={countdownValue}
                totalSlidesCount={slides.length}
                currentSlideIndex={activeSlideIndex}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                logoUrl={activePresentation?.logoUrl}
                logos={activePresentation?.logos}
                logoAlignment={activePresentation?.logoAlignment}
                students={students}
                onUpdateRoster={handleUpdateRoster}
                onStudentSelected={handleStudentSelectedByRoulette}
              />
            </div>
          )}

        </div>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs mt-auto border-t border-slate-950">
        <p className="font-mono">EduFlow Interactive • Live Session Workspace Sandbox • Compiled successfully with local synthetic sound synths</p>
      </footer>

    </div>
  );
}
