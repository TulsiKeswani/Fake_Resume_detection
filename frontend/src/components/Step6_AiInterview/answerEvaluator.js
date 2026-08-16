/**
 * SEMANTIC QUESTION ANSWER VALIDATION & CONCEPT MATCH ENGINE
 */

export const INTERVIEW_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the time complexity of binary search and why?',
    expectedAnswer: 'Binary search has a time complexity of O(log n) because the search space is halved at each iteration.',
    keyConcepts: [
      'logarithmic',
      'log n',
      'half',
      'halved',
      'divide',
      'sorted'
    ],
    criticalConcepts: ['logarithmic', 'log n', 'half', 'halved', 'divide'],
    wrongAnswerIndicators: ['o(n)', 'linear', 'checks each element', 'every element'],
    evaluationCriteria: 'Must specify logarithmic time complexity O(log n) and explain halving or dividing the search space.',
    difficulty: 'Medium',
    followUpQuestion: 'Excellent analysis. How does binary search behave if the input array is not sorted, and how would you handle duplicate values?',
    simplifiedFollowUpQuestion: 'Let’s clarify: why can’t binary search work efficiently on an unsorted list?'
  },
  {
    id: 'q2',
    question: 'Explain the difference between process and thread in operating systems.',
    expectedAnswer: 'A process is an independent executing program with its own memory space, whereas a thread is a lightweight execution unit inside a process that shares memory with other threads.',
    keyConcepts: [
      'process',
      'thread',
      'memory space',
      'independent',
      'shares memory',
      'lightweight'
    ],
    criticalConcepts: ['memory', 'shares', 'process', 'thread'],
    wrongAnswerIndicators: ['processes share memory by default', 'threads have independent address space'],
    evaluationCriteria: 'Must distinguish separate memory allocation for processes vs shared memory space for threads.',
    difficulty: 'Medium',
    followUpQuestion: 'Great explanation. What concurrency primitive would you use to prevent race conditions when threads share memory?',
    simplifiedFollowUpQuestion: 'Let’s simplify: do threads in the same process share heap memory?'
  },
  {
    id: 'q3',
    question: 'What is the purpose of React useEffect hook and when does cleanup run?',
    expectedAnswer: 'useEffect is used for handling side effects like data fetching or subscriptions. Cleanup runs before component unmount or before effect re-runs when dependencies change.',
    keyConcepts: [
      'side effect',
      'data fetching',
      'cleanup',
      'unmount',
      'dependency',
      'dependencies'
    ],
    criticalConcepts: ['side effect', 'cleanup', 'unmount', 'dependency'],
    wrongAnswerIndicators: ['cleanup runs during render', 'useEffect handles routing'],
    evaluationCriteria: 'Must mention managing side effects and explaining that cleanup runs on unmount or before dependency re-runs.',
    difficulty: 'Medium',
    followUpQuestion: 'Well answered. How would you prevent an infinite render loop when setting state inside useEffect?',
    simplifiedFollowUpQuestion: 'What happens if you omit the dependency array in useEffect?'
  }
];

/**
 * Normalizes text for semantic concept matching.
 */
function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates candidate spoken transcript against expected technical answer.
 */
export function evaluateAnswer(questionObj, candidateTranscript = '') {
  if (!candidateTranscript || candidateTranscript.trim().length === 0) {
    return {
      status: 'TIMEOUT',
      isCorrect: false,
      score: 0,
      conceptMatch: 0,
      conceptCoveragePercentage: 0,
      matchedConcepts: [],
      missingConcepts: questionObj?.keyConcepts || [],
      criticalConceptsMissing: questionObj?.criticalConcepts || [],
      reasoning: 'Unanswered / Timeout: No voice transcript received during 60-second timer.',
      explanation: 'No voice answer transcript recorded.',
      followUpQuestion: questionObj?.simplifiedFollowUpQuestion || 'Let’s move to the next technical topic.'
    };
  }

  const normalized = normalizeText(candidateTranscript);

  // Synonyms and semantic equivalences dictionary
  const techSynonyms = {
    'o(log n)': ['log n', 'logarithmic', 'logn', 'log(n)', 'logarithmic time', 'o log n'],
    'logarithmic': ['log n', 'logarithmic', 'logn', 'log(n)', 'logarithmic time'],
    'half': ['halved', 'halving', 'divide in half', 'divided in half', '50%', 'halfway', 'dividing'],
    'divide': ['divided', 'reduction', 'reducing', 'bisection', 'binary split', 'halved'],
    'process': ['process', 'execution program', 'app process'],
    'thread': ['thread', 'execution unit', 'worker thread', 'sub-thread'],
    'memory space': ['memory space', 'address space', 'isolated memory', 'allocated memory', 'own memory'],
    'shares memory': ['shares memory', 'shared memory', 'common memory', 'heap sharing', 'share memory'],
    'side effect': ['side effect', 'api call', 'fetching data', 'subscription', 'dom mutation', 'side-effects'],
    'cleanup': ['cleanup', 'clean up', 'unsubscribe', 'clear interval', 'garbage collect', 'cleaning up'],
    'unmount': ['unmount', 'component unmount', 'dismount', 'removed from dom']
  };

  const keyConcepts = questionObj.keyConcepts || [];
  const criticalConcepts = questionObj.criticalConcepts || keyConcepts;
  const wrongIndicators = questionObj.wrongAnswerIndicators || [];

  let matchedCount = 0;
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    const conceptNorm = normalizeText(concept);
    const synonyms = techSynonyms[conceptNorm] || [conceptNorm];

    const hasMatch = synonyms.some((term) => normalized.includes(term));
    if (hasMatch) {
      matchedCount++;
    } else {
      missingConcepts.push(concept);
    }
  });

  // Calculate concept coverage percentage
  const conceptMatch = Math.round((matchedCount / Math.max(1, keyConcepts.length)) * 100);

  // Check critical concept presence
  const criticalConceptsMissing = [];
  criticalConcepts.forEach((crit) => {
    const critNorm = normalizeText(crit);
    const synonyms = techSynonyms[critNorm] || [critNorm];
    if (!synonyms.some((term) => normalized.includes(term))) {
      criticalConceptsMissing.push(crit);
    }
  });

  // Contradiction and wrong answer indicator detection
  let contradictionDetected = false;
  let contradictionReason = '';

  for (const indicator of wrongIndicators) {
    if (normalized.includes(normalizeText(indicator))) {
      contradictionDetected = true;
      contradictionReason = `Stated incorrect concept: "${indicator}".`;
      break;
    }
  }

  if (questionObj.id === 'q1') {
    if ((normalized.includes('o n') || normalized.includes('linear')) && !normalized.includes('log') && !normalized.includes('half')) {
      contradictionDetected = true;
      contradictionReason = 'Candidate incorrectly stated linear complexity O(n) instead of logarithmic O(log n).';
    }
  } else if (questionObj.id === 'q2') {
    if (normalized.includes('same memory') && normalized.includes('process') && !normalized.includes('thread')) {
      contradictionDetected = true;
      contradictionReason = 'Candidate incorrectly stated processes share memory space by default.';
    }
  }

  // Final score computation & status assignment
  let score = 0;
  let status = 'INCORRECT';

  if (contradictionDetected) {
    score = 0; // Strictly 0 for contradictory answers
    status = 'INCORRECT';
  } else if (criticalConceptsMissing.length === 0 && conceptMatch >= 90) {
    score = Math.min(100, Math.max(90, conceptMatch));
    status = 'CORRECT';
  } else if (criticalConceptsMissing.length === 0 && conceptMatch >= 70) {
    score = Math.round(conceptMatch * 0.85); // 60-76 range
    status = 'INCOMPLETE';
  } else if (conceptMatch >= 40) {
    score = Math.round(conceptMatch * 0.5); // 20-35 range
    status = 'INCOMPLETE';
  } else {
    score = 0; // Below 40% concept match is INCORRECT
    status = 'INCORRECT';
  }

  const isCorrect = status === 'CORRECT';
  const followUp = isCorrect ? (questionObj.followUpQuestion || 'Can you elaborate further?') : (questionObj.simplifiedFollowUpQuestion || 'Let’s break down this concept further.');

  let reasoning = '';
  if (isCorrect) {
    reasoning = `CORRECT (${score}/100): Accurate explanation covering ${conceptMatch}% of required key technical concepts. All critical concepts validated.`;
  } else if (contradictionDetected) {
    reasoning = `INCORRECT (0/100): ${contradictionReason}`;
  } else if (criticalConceptsMissing.length > 0) {
    reasoning = `INCOMPLETE (${score}/100): Missing critical concept(s): ${criticalConceptsMissing.join(', ')}. Concept match: ${conceptMatch}%.`;
  } else {
    reasoning = `INCOMPLETE (${score}/100): Insufficient concept coverage (${conceptMatch}%). Missing: ${missingConcepts.join(', ')}.`;
  }

  return {
    status,
    isCorrect,
    score,
    conceptMatch,
    conceptCoveragePercentage: conceptMatch,
    matchedConcepts: keyConcepts.filter(c => !missingConcepts.includes(c)),
    missingConcepts,
    criticalConceptsMissing,
    reasoning,
    explanation: reasoning,
    followUpQuestion: followUp
  };
}
