const axios = require('axios');

const interviewService = {
  getGeminiResponse: async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }
      );
      
      const aiText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) return null;
      
      // Try to parse JSON
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error("LLM Generation Error:", err.message);
      return null;
    }
  },

  generateNextQuestion: async (parsedResume, interviewState) => {
    const skills = parsedResume.detectedSkills || [];
    const projects = parsedResume.extractedProjects || [];
    
    const topicPool = [
      ...skills,
      ...projects.map(p => p.name)
    ].filter(Boolean);

    if (topicPool.length === 0) {
      topicPool.push("General Experience");
    }

    let targetTopic = "";
    let difficulty = interviewState.currentDifficulty || 1;
    let type = "Resume/Project Understanding";
    const targetRole = interviewState.targetRole || "Software Engineer";

    // Adaptive Question Selection Logic
    if (interviewState.askedQuestions.length === 0) {
      difficulty = 1;
      type = "Resume/Project Understanding";
      targetTopic = projects.length > 0 ? projects[0].name : (skills[0] || "General Experience");
    } else {
      const lastAnswer = interviewState.askedQuestions[interviewState.askedQuestions.length - 1];
      const lastScore = lastAnswer.score || 50;

      // Adaptive difficulty tuning (slower, deliberate jumps)
      if (lastScore >= 80) difficulty = Math.min(4, difficulty + 1);
      else if (lastScore >= 60) difficulty = difficulty; // Maintain
      else if (lastScore >= 40) difficulty = difficulty; // Maintain
      else difficulty = Math.max(1, difficulty - 1); // Decrease

      // Rotate question types to avoid generic repetitive loops
      const questionTypes = [
        "Technical Concepts",
        "Implementation Details",
        "Debugging/Troubleshooting",
        "Scenario-Based Problem Solving",
        "Architecture/Design Trade-offs",
        "Why/Decision Making"
      ];
      
      // Follow-up context check (30% chance to follow up on the SAME topic if they answered well)
      if (lastScore >= 60 && Math.random() > 0.7) {
        targetTopic = lastAnswer.topic || targetTopic;
        type = "Follow-up Question";
      } else {
        // Pick a new topic from the pool, prioritizing ones NOT heavily asked
        targetTopic = topicPool[interviewState.askedQuestions.length % topicPool.length];
        type = questionTypes[interviewState.askedQuestions.length % questionTypes.length];
      }
    }

    const previousQnA = interviewState.askedQuestions.map(q => `[Previous Q]: ${q.question}\n[Candidate Answer]: ${q.answer}`).join("\n\n");

    const prompt = `
You are an expert AI Technical Interviewer conducting a realistic, adaptive technical interview.
Target Role: "${targetRole}"

DO NOT ASK GENERIC QUESTIONS.
NEVER ask "Tell me about your experience with X" or "Could you tell me more about X" or "How familiar are you with X". 
You MUST ask a specific, concrete technical, theoretical, or project-based question.

CANDIDATE RESUME CONTEXT:
- Claimed Skills: ${skills.join(', ')}
- Claimed Projects: ${JSON.stringify(projects)}

STRICT INTERVIEW CONSTRAINTS:
1. Target Topic to assess: "${targetTopic}"
2. Difficulty Level: Level ${difficulty} (1=Basic concepts, 2=Intermediate usage, 3=Advanced optimization/architecture, 4=Deep expert/scenario/debugging)
3. Question Type: ${type}
4. DO NOT invent or assume any technologies, libraries, or project features NOT explicitly mentioned in the resume. 
5. If the Target Topic is a project, ask a specific question about HOW they built it or what technical challenges they solved using the skills they claimed.
6. If the Target Topic is a skill, ask a specific technical interview question (e.g. difference between X and Y, how to optimize Z, how X works under the hood).
7. If 'Previous QnA Context' exists, you may use it to create a contextual follow-up, but do NOT repeat previous questions.

Previous QnA Context:
${previousQnA || "None. This is the first question of the interview. Make it a welcoming introductory project/experience question."}

Generate the next interview question strictly following these constraints.
Respond ONLY with a valid JSON object matching this schema:
{
  "question": "The specific technical/project interview question text",
  "topic": "${targetTopic}",
  "relatedProject": "Name of project if applicable, else null",
  "difficulty": ${difficulty},
  "questionType": "${type}",
  "resumeEvidence": "Brief explanation of where this is found in the resume"
}
`;

    let generatedQuestion = await interviewService.getGeminiResponse(prompt);
    let isValid = false;
    let retries = 0;

    // Strict Validation Loop
    while (!isValid && retries < 3) {
      if (generatedQuestion && generatedQuestion.question) {
        const qText = generatedQuestion.question.toLowerCase();
        
        // 1. Check for generic ban list
        const isGeneric = qText.includes("tell me about your experience") || 
                          qText.includes("could you tell me more about") ||
                          qText.includes("how familiar are you with") ||
                          qText.includes("what is your experience with");

        // 2. Hallucination heuristic: ensure generated topic is in our pool
        const matchedTopic = topicPool.find(t => t.toLowerCase() === (generatedQuestion.topic || '').toLowerCase());
        const mentionsSkill = skills.some(s => qText.includes(s.toLowerCase()));
        const mentionsProject = projects.some(p => qText.includes(p.name.toLowerCase()));
        
        if (isGeneric) {
           console.warn("[AI Interview] Rejected GENERIC question:", generatedQuestion.question);
           generatedQuestion = await interviewService.getGeminiResponse(prompt + "\n\nCRITICAL FIX: YOUR PREVIOUS QUESTION WAS REJECTED FOR BEING TOO GENERIC. DO NOT USE 'Tell me about your experience'. ASK A REAL TECHNICAL OR PROJECT IMPLEMENTATION QUESTION.");
        } else if (matchedTopic || mentionsSkill || mentionsProject || targetTopic === "General Experience") {
          isValid = true;
        } else {
           console.warn("[AI Interview] Rejected hallucinated/unrelated question:", generatedQuestion.question);
           generatedQuestion = await interviewService.getGeminiResponse(prompt + "\n\nCRITICAL FIX: YOUR PREVIOUS QUESTION WAS REJECTED BECAUSE IT INCLUDED TECHNOLOGIES NOT IN THE RESUME. STICK STRICTLY TO THE PROVIDED RESUME.");
        }
      } else {
         generatedQuestion = await interviewService.getGeminiResponse(prompt);
      }
      retries++;
    }

    if (!isValid || !generatedQuestion) {
      // Robust Fallback that is NOT generic "Tell me about"
      generatedQuestion = {
        question: `Based on your resume, you listed ${targetTopic}. Can you explain a specific technical challenge you faced while working with this, and how you solved it?`,
        topic: targetTopic,
        relatedProject: null,
        difficulty: difficulty,
        questionType: "Problem Solving",
        resumeEvidence: "Fallback generated from resume topics"
      };
    }

    return generatedQuestion;
  },

  evaluateAnswer: async (questionObj, answer, parsedResume) => {
    const prompt = `
You are evaluating a candidate's answer to an interview question.
Question: "${questionObj.question}"
Candidate Answer: "${answer}"

RESUME CONTEXT:
Skills: ${parsedResume.detectedSkills?.join(', ')}
Projects: ${JSON.stringify(parsedResume.extractedProjects)}

Evaluate the candidate's answer based on Relevance, Correctness, Technical Understanding, and Evidence that they actually know what they claimed in their resume.

Respond ONLY with a valid JSON object matching this schema:
{
  "score": 0, // Integer 0 to 100
  "feedback": "Internal brief reason for the score",
  "trickCaught": false // Set true if the question was a trick and they correctly disagreed
}
`;
    
    let evaluation = await interviewService.getGeminiResponse(prompt);
    if (!evaluation) {
      // Fallback naive evaluation based on length
      const score = Math.min(100, Math.max(30, answer.length * 2));
      evaluation = { score, feedback: "Fallback evaluation", trickCaught: false };
    }
    return evaluation;
  }
};

module.exports = interviewService;
