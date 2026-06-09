import { Slide, Student } from './types';

export const INITIAL_SLIDES: Slide[] = [
  {
    id: 's1',
    title: 'Welcome to EduFlow Interactive',
    backgroundStyle: 'slate',
    autoAdvance: false,
    duration: 15,
    blocks: [
      {
        id: 'b1-1',
        type: 'heading',
        content: 'EduFlow Interactive',
      },
      {
        id: 'b1-2',
        type: 'text',
        content: 'Welcome to the future of learning pacing! This interactive presentation tool helps teachers design structured flow, trigger rapid oral recitation checks, and manage slides in real-time from a dual-monitor presenter console.',
      },
      {
        id: 'b1-3',
        type: 'highlight',
        content: '💡 PRO-TIP: Click "Toggle Presenter View" at the top to focus exclusively on either the private student-facing deck or the educator dashboard.',
      }
    ]
  },
  {
    id: 's2',
    title: 'The Art of Active Recall',
    backgroundStyle: 'editorial',
    autoAdvance: false,
    duration: 30,
    blocks: [
      {
        id: 'b2-1',
        type: 'heading',
        content: 'Active Recall vs. Passive Review',
      },
      {
        id: 'b2-2',
        type: 'text',
        content: 'Active recall involves testing your memory rather than rereading. By randomly selecting students for rapid explanation, we maintain engagement and optimize cognitive retrieval paths.',
      },
      {
        id: 'b2-3',
        type: 'list',
        content: 'Key benefits of randomized recitation:',
        listItems: [
          'Eliminates selection bias and encourages focus for everyone',
          'Strengthens active retrieval and builds confidence under low-stakes testing',
          'Provides instant progress checks for the educator in real-time'
        ]
      }
    ]
  },
  {
    id: 's3',
    title: 'Quick Concept Check 🧠',
    backgroundStyle: 'ocean',
    autoAdvance: false,
    duration: 0,
    blocks: [
      {
        id: 'b3-1',
        type: 'heading',
        content: 'Concept Check: Retrieval Practice',
      },
      {
        id: 'b3-2',
        type: 'quiz',
        content: 'Which of the following studies demonstrates the highest long-term retention rate?',
        options: [
          'Rereading text 4 times (Repeated Reading)',
          'Reading text once + doing 3 active recall sessions (Retrieval Practice)',
          'Creating mind maps and summaries of the notes (Concept Mapping)',
          'Listening to an audio lecture review twice (Auditory Review)'
        ],
        correctAnswer: 'Reading text once + doing 3 active recall sessions (Retrieval Practice)'
      }
    ]
  },
  {
    id: 's4',
    title: 'Live Educational Telemetry',
    backgroundStyle: 'terminal',
    autoAdvance: true,
    duration: 10,
    blocks: [
      {
        id: 'b4-1',
        type: 'heading',
        content: 'Timed & Automated Flows',
      },
      {
        id: 'b4-2',
        type: 'text',
        content: 'By enabling the "Auto-Advance" toggle on this slide, the deck will advance automatically once the countdown expires. This is ideal for speed rounds, vocabulary drills, or silent reading intervals.',
      },
      {
        id: 'b4-3',
        type: 'highlight',
        content: '⏱️ Note: Once countdown starts in the presenter view, the system handles the pacing for you! You can focus entirely on student interaction.'
      }
    ]
  }
];

export const INITIAL_ROSTER: Student[] = [
  { id: 'st1', name: 'Alexander Thompson', recitationCount: 2, absent: false },
  { id: 'st2', name: 'Sophia Rodriguez', recitationCount: 1, absent: false },
  { id: 'st3', name: 'Marcus Chen', recitationCount: 3, absent: false },
  { id: 'st4', name: 'Emily Kowalski', recitationCount: 0, absent: false },
  { id: 'st5', name: 'Amara Okafor', recitationCount: 2, absent: false },
  { id: 'st6', name: 'Liam Gallagher', recitationCount: 1, absent: false },
  { id: 'st7', name: 'Yuki Sato', recitationCount: 0, absent: false },
  { id: 'st8', name: 'Carlos Mendoza', recitationCount: 4, absent: false },
  { id: 'st9', name: 'Isabella Dubois', recitationCount: 2, absent: false },
  { id: 'st10', name: 'Zayn Malik', recitationCount: 1, absent: true },
];
