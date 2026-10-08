export interface FocusQuestion {
  id: string;
  category:
    | 'Deadline Management'
    | 'Academic Prioritization'
    | 'ERP Submission'
    | 'Group Projects'
    | 'Exam Preparation'
    | 'Time Management'
    | 'Professor Communication'
    | 'Assignment Planning'
    | 'College Life';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  correct: string;
  distractors: string[];
}

export const FOCUS_QUESTIONS: FocusQuestion[] = [
  // 1. Deadline Management (5)
  {
    id: 'dm-1',
    category: 'Deadline Management',
    difficulty: 'easy',
    prompt: 'You have a physics lab report due in 3 hours and code isn’t formatted:',
    correct: 'Focus on verifying calculated figures and submission requirements first',
    distractors: [
      'Spend 90 minutes picking a new syntax theme for the IDE',
      'Assume the TA will automatically give a grace period without asking',
    ],
  },
  {
    id: 'dm-2',
    category: 'Deadline Management',
    difficulty: 'medium',
    prompt: 'Two assignments are due at 11:59 PM: one weighted 25%, one weighted 2%:',
    correct: 'Dedicate 80% of your remaining energy to the 25% major deliverable',
    distractors: [
      'Spend the entire evening polishing the 2% quiz because it feels easier',
      'Alternate between tabs every 3 minutes without finishing either',
    ],
  },
  {
    id: 'dm-3',
    category: 'Deadline Management',
    difficulty: 'hard',
    prompt: 'Submission portal closes in 20 minutes and bibliography is unformatted:',
    correct: 'Format essential citations quickly using an auto-generator and submit before deadline',
    distractors: [
      'Manually type every DOI character by character and miss the cutoff time',
      'Close your laptop and plan to email the file 2 hours after portal lock',
    ],
  },
  {
    id: 'dm-4',
    category: 'Deadline Management',
    difficulty: 'easy',
    prompt: 'An unexpected family emergency occurs the evening before a major term deadline:',
    correct: 'Contact your professor immediately with a concise heads-up before the deadline',
    distractors: [
      'Disappear in silence for a week and then ask for retroactive sympathy',
      'Submit a blank corrupted file to cheat the timestamp check',
    ],
  },
  {
    id: 'dm-5',
    category: 'Deadline Management',
    difficulty: 'medium',
    prompt: 'A 10-page essay deadline is in 48 hours and you have only an outline:',
    correct: 'Draft section by section in 45-minute timed blocks without editing while typing',
    distractors: [
      'Rewrite the opening introductory paragraph 30 times until it feels poetic',
      'Scroll academic productivity forums looking for overnight writing hacks',
    ],
  },

  // 2. Academic Prioritization (5)
  {
    id: 'ap-1',
    category: 'Academic Prioritization',
    difficulty: 'easy',
    prompt: 'You have a heavy midterm tomorrow at 8:00 AM with 2 unreviewed core topics:',
    correct: 'Solve 3 practice problems per unreviewed topic and review theorem derivations',
    distractors: [
      'Color-code notes you already understand completely for 2 hours',
      'Scroll campus chat channels to assess peer anxiety levels',
    ],
  },
  {
    id: 'ap-2',
    category: 'Academic Prioritization',
    difficulty: 'medium',
    prompt: 'Choosing between attending an optional guest lecture or studying for a test worth 30%:',
    correct: 'Prioritize your 30% exam prep and review lecture slides later if available',
    distractors: [
      'Attend the optional talk while secretly stressing about failing the test',
      'Skip both and take an unplanned 4-hour guilt nap',
    ],
  },
  {
    id: 'ap-3',
    category: 'Academic Prioritization',
    difficulty: 'hard',
    prompt: 'You scored 62% on Quiz 1 and have the option for an error-analysis regrade:',
    correct: 'Rework every missed question from first principles and submit analysis on time',
    distractors: [
      'File the returned quiz in your bag and hope Quiz 2 is miraculously easier',
      'Complain to classmates that the grading was biased without checking the key',
    ],
  },
  {
    id: 'ap-4',
    category: 'Academic Prioritization',
    difficulty: 'easy',
    prompt: 'Your daily study plan has 7 tasks, but you only have 2 hours of focus time:',
    correct: 'Identify the top 2 highest-leverage tasks and defer low-impact admin tasks',
    distractors: [
      'Try to rush through all 7 simultaneously and do none of them well',
      'Spend the first 45 minutes redesigning your daily schedule tracker',
    ],
  },
  {
    id: 'ap-5',
    category: 'Academic Prioritization',
    difficulty: 'medium',
    prompt: 'Encountered a complex proof that you don’t understand after 2 hours of self-study:',
    correct: 'Write down your exact point of confusion and visit TA office hours tomorrow',
    distractors: [
      'Stare at the same textbook page for another 3 hours in frustration',
      'Memorize the final equation blindly without understanding constraints',
    ],
  },

  // 3. ERP Submission & Verification Loop (5)
  {
    id: 'erp-1',
    category: 'ERP Submission',
    difficulty: 'easy',
    prompt: 'You just finished your assignment PDF on your desktop 1 hour before midnight:',
    correct: 'Log into student ERP immediately, upload the file, and save confirmation proof',
    distractors: [
      'Close laptop assuming you will upload it between classes tomorrow',
      'Email the file to yourself and forget to complete the portal submission',
    ],
  },
  {
    id: 'erp-2',
    category: 'ERP Submission',
    difficulty: 'medium',
    prompt: 'The portal requires a single zipped archive with PDF report and source code:',
    correct: 'Verify zip contents and extract in a test folder to confirm all files open cleanly',
    distractors: [
      'Upload loose .docx files and assume the grading script handles them',
      'Upload the zip without checking if file size exceeds server limits',
    ],
  },
  {
    id: 'erp-3',
    category: 'ERP Submission',
    difficulty: 'hard',
    prompt: 'Your portal upload shows status "Draft / Saved" rather than "Submitted":',
    correct: 'Click final "Submit for Assessment" button and verify receipt number',
    distractors: [
      'Assume Draft status is identical to official submission in the ERP',
      'Log out without confirming the status change on the student dashboard',
    ],
  },
  {
    id: 'erp-4',
    category: 'ERP Submission',
    difficulty: 'easy',
    prompt: 'Uploaded assignment has an ambiguous grade on the portal 3 weeks later:',
    correct: 'Check portal feedback rubrics and cross-reference with syllabus grading policy',
    distractors: [
      'Assume the grade is finalized and never verify professor comments',
      'Send an angry all-caps message to the registrar office',
    ],
  },
  {
    id: 'erp-5',
    category: 'ERP Submission',
    difficulty: 'medium',
    prompt: 'University ERP maintenance window is scheduled 1 hour before assignment deadline:',
    correct: 'Submit your finished work 3 hours ahead of time to avoid server outages',
    distractors: [
      'Wait until 10 minutes before deadline and blame scheduled maintenance for late slip',
      'Refresh the 503 error page repeatedly hoping maintenance cancels',
    ],
  },

  // 4. Group Projects (5)
  {
    id: 'gp-1',
    category: 'Group Projects',
    difficulty: 'easy',
    prompt: 'Group slides presentation is due in 24 hours with conflicting formatting styles:',
    correct: 'Designate one member to standardize master fonts, margins, and transition cues',
    distractors: [
      'Debate aesthetic color palettes for 90 minutes without aligning content',
      'Leave each member’s slide completely mismatched during live presentation',
    ],
  },
  {
    id: 'gp-2',
    category: 'Group Projects',
    difficulty: 'medium',
    prompt: 'One group partner has not replied to messages 3 days before major deliverable:',
    correct: 'Clearly document missing responsibilities and reallocate critical parts with active team',
    distractors: [
      'Wait passively until presentation day without doing the missing work',
      'Spam angry messages without creating a concrete fallback plan',
    ],
  },
  {
    id: 'gp-3',
    category: 'Group Projects',
    difficulty: 'hard',
    prompt: 'Group member commits buggy code directly to the shared main branch:',
    correct: 'Rollback to last stable commit and review branch protection / PR workflows together',
    distractors: [
      'Try to patch 40 errors on main minutes before presentation deadline',
      'Delete the repository and restart from scratch in panic',
    ],
  },
  {
    id: 'gp-4',
    category: 'Group Projects',
    difficulty: 'easy',
    prompt: 'First group meeting for a semester project starts today:',
    correct: 'Set clear milestones, assign ownership, and agree on primary communication channel',
    distractors: [
      'Create a group chat and agree to "talk about it later sometime"',
      'Let one person take all tasks while others stay silent',
    ],
  },
  {
    id: 'gp-5',
    category: 'Group Projects',
    difficulty: 'medium',
    prompt: 'Two teammates strongly disagree on which architectural library to use:',
    correct: 'Evaluate both options against project rubric criteria and time constraints',
    distractors: [
      'Argue indefinitely until project deadline passes without coding',
      'Split the team in two and build two half-finished projects',
    ],
  },

  // 5. Exam Preparation (5)
  {
    id: 'ep-1',
    category: 'Exam Preparation',
    difficulty: 'easy',
    prompt: '3 days before a finals exam in an intensive quantitative course:',
    correct: 'Simulate past exam papers under realistic timed, closed-book exam conditions',
    distractors: [
      'Re-read lecture slides passively while highlighting in neon yellow',
      'Browse study tips on YouTube for 4 hours without solving a problem',
    ],
  },
  {
    id: 'ep-2',
    category: 'Exam Preparation',
    difficulty: 'medium',
    prompt: 'Stuck between cramming all night before an 8:30 AM exam or sleeping 7 hours:',
    correct: 'Get solid 7-hour sleep to protect memory retrieval and cognitive performance',
    distractors: [
      'Pull an all-nighter with caffeine and suffer brain fog during exam calculations',
      'Stay awake until 5:00 AM, sleep 1 hour, and risk oversleeping the exam',
    ],
  },
  {
    id: 'ep-3',
    category: 'Exam Preparation',
    difficulty: 'hard',
    prompt: 'Formula sheet is permitted on the exam, but limited to one handwritten page:',
    correct: 'Include boundary conditions, unit conversions, and step-by-step algorithms you stumble on',
    distractors: [
      'Write microscopic font copying entire derivations you already memorized',
      'Fill space with decorative chapter titles rather than actionable formulas',
    ],
  },
  {
    id: 'ep-4',
    category: 'Exam Preparation',
    difficulty: 'easy',
    prompt: 'Encountered a very difficult 10-point question on Page 1 of the exam booklet:',
    correct: 'Mark the question, proceed to questions you can solve quickly, and return later',
    distractors: [
      'Spend 45 minutes on question 1 and run out of time for the remaining 90 points',
      'Give up on the entire exam in panic because question 1 was unfamiliar',
    ],
  },
  {
    id: 'ep-5',
    category: 'Exam Preparation',
    difficulty: 'medium',
    prompt: 'Reviewing practice exam errors with 24 hours left before the actual test:',
    correct: 'Focus on understanding the failure root cause: concept gap vs calculation slip',
    distractors: [
      'Mark the question as "I probably know this anyway" without re-solving it',
      'Discard the practice test and search for new unverified online questions',
    ],
  },

  // 6. Time Management (5)
  {
    id: 'tm-1',
    category: 'Time Management',
    difficulty: 'easy',
    prompt: 'Starting a 90-minute deep study block on a complex theoretical topic:',
    correct: 'Silence phone notifications, close unrelated browser tabs, and set a single objective',
    distractors: [
      'Keep social media open on split screen for "quick notification checks"',
      'Listen to talk podcasts with lyrics that distract working memory',
    ],
  },
  {
    id: 'tm-2',
    category: 'Time Management',
    difficulty: 'medium',
    prompt: 'You have a 50-minute awkward gap between two university lectures:',
    correct: 'Use the pocket time for quick flashcard recall or reviewing next lecture’s notes',
    distractors: [
      'Scroll infinite feeds aimlessly in the hallway until class starts',
      'Start an extensive gaming session and arrive 20 minutes late to class',
    ],
  },
  {
    id: 'tm-3',
    category: 'Time Management',
    difficulty: 'hard',
    prompt: 'Feeling overwhelming afternoon energy crash after 2 hours of study:',
    correct: 'Take a 15-minute brisk walk outside, drink cold water, and stretch physically',
    distractors: [
      'Stare blankly at computer screen pretending to read while zoning out',
      'Drink 3 sugary sodas in a row and induce a worse sugar crash',
    ],
  },
  {
    id: 'tm-4',
    category: 'Time Management',
    difficulty: 'easy',
    prompt: 'Multiple friends invite you out on a night you reserved for crucial homework:',
    correct: 'Politely decline or negotiate a 1-hour dinner break after key homework sections are done',
    distractors: [
      'Abandon all homework, go out until 3 AM, and panic the next morning',
      'Agree to go out while carrying your laptop to the noisy party',
    ],
  },
  {
    id: 'tm-5',
    category: 'Time Management',
    difficulty: 'medium',
    prompt: 'You notice your calendar has 12 hours of scheduled work with zero breaks:',
    correct: 'Add explicit 10-15 minute buffers between blocks to prevent cognitive burnout',
    distractors: [
      'Assume you can sustain robotic 12-hour continuous focus without degrading quality',
      'Cancel all academic work and abandon the calendar entirely',
    ],
  },

  // 7. Professor Communication (5)
  {
    id: 'pc-1',
    category: 'Professor Communication',
    difficulty: 'easy',
    prompt: 'Writing an email to a professor asking for assignment clarification:',
    correct: 'Use clear subject line with course code, state your question concisely, and cite your attempt',
    distractors: [
      'Send a 1-sentence email: "hey how do we do homework 3" with no course code',
      'Write a 4-page life story before asking the actual assignment question',
    ],
  },
  {
    id: 'pc-2',
    category: 'Professor Communication',
    difficulty: 'medium',
    prompt: 'Visiting professor office hours for the first time this semester:',
    correct: 'Bring your specific lecture notes, textbook reference, and where your derivation stalled',
    distractors: [
      'Walk in, sit down, and say: "I don’t understand anything from the last 4 weeks"',
      'Ask the professor to do your homework problems while you take photos',
    ],
  },
  {
    id: 'pc-3',
    category: 'Professor Communication',
    difficulty: 'hard',
    prompt: 'Discovered an apparent typo in a homework question that renders it unsolvable:',
    correct: 'Politely email professor/TA with problem number, why it appears contradictory, and your assumptions',
    distractors: [
      'Post angry complaints on public campus review sites without asking the TA',
      'Leave the problem blank and write "question is broken" in the final submission',
    ],
  },
  {
    id: 'pc-4',
    category: 'Professor Communication',
    difficulty: 'easy',
    prompt: 'Requesting an academic recommendation letter from a faculty member:',
    correct: 'Ask at least 4 weeks in advance with your resume, draft statement, and deadline link',
    distractors: [
      'Ask 12 hours before the scholarship deadline with no materials attached',
      'Demand an immediate confirmation via direct social media DM',
    ],
  },
  {
    id: 'pc-5',
    category: 'Professor Communication',
    difficulty: 'medium',
    prompt: 'A grade discrepancy occurred due to an addition error on paper exam:',
    correct: 'Approach TA during office hours with the paper exam respectfully pointing out the sum error',
    distractors: [
      'Accuse the course staff of malicious grading fraud in front of class',
      'Throw away the paper exam and complain to department dean without speaking to TA',
    ],
  },

  // 8. Assignment Planning (5)
  {
    id: 'plan-1',
    category: 'Assignment Planning',
    difficulty: 'easy',
    prompt: 'A large software/engineering assignment is released with a 3-week deadline:',
    correct: 'Break it into 4 verifiable milestones (spec, prototype, core implementation, test & export)',
    distractors: [
      'Ignore it for 19 days and attempt to code the entire project in 1 sleepless night',
      'Read the assignment brief once and assume you can improvise without planning',
    ],
  },
  {
    id: 'plan-2',
    category: 'Assignment Planning',
    difficulty: 'medium',
    prompt: 'Assignment prompt contains ambiguous requirements for edge cases:',
    correct: 'Document explicit assumptions in your submission notes and confirm on class forum',
    distractors: [
      'Ignore all edge cases and hope the test suite only tests basic happy paths',
      'Delete the edge case tests so your code passes falsely',
    ],
  },
  {
    id: 'plan-3',
    category: 'Assignment Planning',
    difficulty: 'hard',
    prompt: 'Research project requires finding 8 peer-reviewed empirical papers:',
    correct: 'Search academic databases (IEEE, ACM, PubMed, JSTOR) and record citation bibtex early',
    distractors: [
      'Cite random blogs, Reddit threads, and unverified forums as scholarly evidence',
      'Wait until the final bibliography formatting hour to look for sources',
    ],
  },
  {
    id: 'plan-4',
    category: 'Assignment Planning',
    difficulty: 'easy',
    prompt: 'Creating a backup plan for a coding assignment:',
    correct: 'Commit code incrementally with descriptive git messages and push to remote repository',
    distractors: [
      'Keep single unversioned file named "final_version_v3_really_final.py" on desktop',
      'Work off an old USB thumb drive without local or cloud backups',
    ],
  },
  {
    id: 'plan-5',
    category: 'Assignment Planning',
    difficulty: 'medium',
    prompt: 'Completed draft is 30% over the strict page limit specified in rubric:',
    correct: 'Tighten prose, eliminate redundant filler phrases, and optimize diagram layouts',
    distractors: [
      'Change font size to 7pt and shrink margins to 0.1 inch to bypass visual checks',
      'Leave it over-length and accept automatic penalty deductions',
    ],
  },

  // 9. College Life & Sustainable Productivity (5)
  {
    id: 'cl-1',
    category: 'College Life',
    difficulty: 'easy',
    prompt: 'Studying in a noisy dorm lounge with constant hallway interruptions:',
    correct: 'Relocate to a quiet university library floor or silent study cubicle',
    distractors: [
      'Stay in the lounge for 4 hours while getting interrupted every 4 minutes',
      'Pretend to study while chatting about campus gossip for 3 hours',
    ],
  },
  {
    id: 'cl-2',
    category: 'College Life',
    difficulty: 'medium',
    prompt: 'Experiencing severe imposter syndrome after comparing grades with peers:',
    correct: 'Focus on your own progress trajectory, study techniques, and mastery metrics',
    distractors: [
      'Convince yourself you do not belong in your degree program and stop attending lectures',
      'Obsessively interrogate classmates about their GPA rankings',
    ],
  },
  {
    id: 'cl-3',
    category: 'College Life',
    difficulty: 'hard',
    prompt: 'Balancing a part-time campus job with 16 course credits during midterm week:',
    correct: 'Plan fixed weekly non-negotiable study windows and communicate shifts early',
    distractors: [
      'Double your job hours during finals week without adjusting study schedule',
      'Assume tasks will magically finish without a structured timetable',
    ],
  },
  {
    id: 'cl-4',
    category: 'College Life',
    difficulty: 'easy',
    prompt: 'Your laptop battery is at 12% and you have a 3-hour lab class with live grading:',
    correct: 'Grab your charger from your bag immediately and plug into classroom power outlet',
    distractors: [
      'Let laptop die mid-lab, losing unsaved code and your lab credit for the week',
      'Hope the battery percentage stays at 12% through positive thinking',
    ],
  },
  {
    id: 'cl-5',
    category: 'College Life',
    difficulty: 'medium',
    prompt: 'End of a demanding semester: all exams and ERP deliverables are closed:',
    correct: 'Take time to celebrate the milestone, rest, and reflect on study habits to keep',
    distractors: [
      'Immediately start stressing about next semester’s syllabi without resting',
      'Delete all course work files from your drive so you cannot reference them later',
    ],
  },
];
