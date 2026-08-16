const axios = require('axios');

/**
 * Normalizes a skill/technology string for comparison
 */
const normalizeSkill = (skill) => {
  if (!skill) return '';
  let s = skill.toLowerCase().trim();
  const map = {
    'javascript': 'javascript',
    'js': 'javascript',
    'react.js': 'react',
    'reactjs': 'react',
    'react': 'react',
    'node.js': 'node',
    'nodejs': 'node',
    'natural language processing': 'nlp',
    'machine learning': 'machine learning',
    'ml': 'machine learning',
    'mongodb': 'mongodb',
    'mongo': 'mongodb',
    'python': 'python',
    'docker': 'docker',
    'aws': 'aws',
    'typescript': 'typescript',
    'ts': 'typescript',
    'java': 'java',
    'c++': 'c++',
    'cpp': 'c++'
  };
  return map[s] || s;
};

/**
 * Calculates a similarity score between two strings
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  
  const tokens1 = s1.split(/[\s-_]+/).filter(t => t.length > 2);
  const tokens2 = s2.split(/[\s-_]+/).filter(t => t.length > 2);
  
  let matchCount = 0;
  for (const t1 of tokens1) {
    if (tokens2.some(t2 => t2.includes(t1) || t1.includes(t2))) matchCount++;
  }
  
  if (tokens1.length === 0 && tokens2.length === 0) return 0;
  return Math.round((matchCount / Math.max(tokens1.length, tokens2.length)) * 100);
};

const githubVerificationService = {
  /**
   * Fetch all necessary public data for a GitHub user
   */
  fetchGithubProfileData: async (username) => {
    try {
      const headers = process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
      
      const userRes = await axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 5000 });
      const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers, timeout: 8000 });
      
      const repos = Array.isArray(reposRes.data) ? reposRes.data : [];
      
      // We will deeply analyze the top 15 recently updated repos to avoid rate limits
      const limit = Math.min(repos.length, 15);
      for (let i = 0; i < limit; i++) {
        // Fetch README
        try {
          const readmeRes = await axios.get(`https://api.github.com/repos/${username}/${repos[i].name}/readme`, {
            headers: { ...headers, Accept: 'application/vnd.github.v3.raw' },
            timeout: 3000
          });
          repos[i].readme = readmeRes.data;
        } catch (err) {
          repos[i].readme = ''; 
        }

        // Fetch repo contents to check for dependencies and source files
        try {
          const contentsRes = await axios.get(`https://api.github.com/repos/${username}/${repos[i].name}/contents`, {
            headers, timeout: 3000
          });
          if (Array.isArray(contentsRes.data)) {
            repos[i].files = contentsRes.data.map(f => f.name.toLowerCase());
          } else {
            repos[i].files = [];
          }
        } catch (err) {
          repos[i].files = [];
        }

        // Fetch languages
        try {
          const langRes = await axios.get(repos[i].languages_url, { headers, timeout: 3000 });
          repos[i].all_languages = Object.keys(langRes.data || {}).map(l => l.toLowerCase());
        } catch (err) {
          repos[i].all_languages = [];
        }
      }

      return {
        valid: true,
        profile: userRes.data,
        repos: repos,
        analyzedCount: limit
      };
    } catch (error) {
      console.warn(`[GitHub Service] Error fetching data for ${username}:`, error.message);
      let errorMsg = error.message;
      if (error.response && error.response.status === 403) {
        errorMsg = "GitHub API rate limit exceeded. Please add a valid GITHUB_TOKEN to your .env file.";
      } else if (error.response && error.response.status === 404) {
        errorMsg = "GitHub user not found.";
      }
      return { valid: false, error: errorMsg };
    }
  },

  /**
   * Verify skills against GitHub data
   */
  verifySkills: (claimedSkills, githubData) => {
    if (!githubData || !githubData.valid || !githubData.repos) return [];

    return claimedSkills.map(skill => {
      const normalizedSkill = normalizeSkill(skill);
      let repoLanguageMatches = 0;
      let topicMatches = 0;
      let readmeMatches = 0;
      let descriptionMatches = 0;
      let dependencyMatches = 0;
      let sourceCodeMatches = 0;
      
      let evidence = [];

      githubData.repos.forEach(repo => {
        let repoHasLanguage = false;
        let repoHasSource = false;
        let repoHasDep = false;
        let repoHasReadme = false;
        let repoHasDesc = false;
        let repoHasTopic = false;

        // 1. Language evidence
        if (repo.language && normalizeSkill(repo.language) === normalizedSkill) {
          repoHasLanguage = true;
        }
        if (repo.all_languages && repo.all_languages.some(l => normalizeSkill(l) === normalizedSkill)) {
          repoHasLanguage = true;
        }

        // 2. Source Code Evidence (Files)
        if (repo.files && repo.files.length > 0) {
          const extMap = {
            'python': ['.py', '.ipynb'],
            'javascript': ['.js', '.jsx'],
            'react': ['.jsx', '.tsx'],
            'typescript': ['.ts', '.tsx'],
            'java': ['.java'],
            'c++': ['.cpp', '.hpp', '.cc', '.cxx']
          };
          const exts = extMap[normalizedSkill] || [];
          if (exts.some(ext => repo.files.some(f => f.endsWith(ext)))) {
            repoHasSource = true;
          }
        }

        // 3. Dependency Evidence
        if (repo.files && repo.files.length > 0) {
          const depMap = {
            'python': ['requirements.txt', 'pipfile', 'pyproject.toml'],
            'javascript': ['package.json'],
            'node': ['package.json'],
            'react': ['package.json'],
            'java': ['pom.xml', 'build.gradle'],
            'docker': ['dockerfile', 'docker-compose.yml', 'docker-compose.yaml']
          };
          const deps = depMap[normalizedSkill] || [];
          if (deps.some(d => repo.files.includes(d))) {
            repoHasDep = true;
          }
        }

        // 4. Description evidence
        if (repo.description && repo.description.toLowerCase().includes(normalizedSkill)) {
          repoHasDesc = true;
        }

        // 5. Topics evidence
        if (repo.topics && repo.topics.some(t => normalizeSkill(t) === normalizedSkill)) {
          repoHasTopic = true;
        }

        // 6. README evidence
        if (repo.readme && repo.readme.toLowerCase().includes(normalizedSkill)) {
          repoHasReadme = true;
        }

        if (repoHasLanguage) repoLanguageMatches++;
        if (repoHasSource) sourceCodeMatches++;
        if (repoHasDep) dependencyMatches++;
        if (repoHasReadme) readmeMatches++;
        if (repoHasDesc) descriptionMatches++;
        if (repoHasTopic) topicMatches++;
      });

      // Assemble Evidence
      if (repoLanguageMatches > 0) evidence.push(`✓ Found as a repository language in ${repoLanguageMatches} repos.`);
      if (sourceCodeMatches > 0) evidence.push(`✓ Found specific source files (e.g., .py, .js) in ${sourceCodeMatches} repos.`);
      if (dependencyMatches > 0) evidence.push(`✓ Found dependency files (e.g., package.json, requirements.txt) in ${dependencyMatches} repos.`);
      if (readmeMatches > 0) evidence.push(`✓ Found mentions in README contents of ${readmeMatches} repos.`);
      if (descriptionMatches > 0) evidence.push(`✓ Found in repository descriptions of ${descriptionMatches} repos.`);
      if (topicMatches > 0) evidence.push(`✓ Found in repository topics of ${topicMatches} repos.`);

      // Scoring Weighting System (Max 100)
      let score = 0;
      
      // Repository language: max 20
      score += Math.min(20, repoLanguageMatches * 10);
      
      // Source-code evidence: max 30
      score += Math.min(30, sourceCodeMatches * 15);
      
      // Dependency/package evidence: max 20
      score += Math.min(20, dependencyMatches * 20);
      
      // README / description: max 20
      score += Math.min(10, readmeMatches * 5) + Math.min(10, descriptionMatches * 5);
      
      // Topics/metadata: max 10
      score += Math.min(10, topicMatches * 5);

      score = Math.min(100, score);

      let status = 'Unverified';
      if (score >= 90) status = 'Strongly Verified';
      else if (score >= 75) status = 'Verified';
      else if (score >= 50) status = 'Partially Verified';
      else if (score >= 25) status = 'Weak Evidence';

      return {
        name: skill,
        score,
        status,
        evidence: evidence.length > 0 ? evidence : ["No sufficient public GitHub evidence found."]
      };
    });
  },

  /**
   * Verify projects against GitHub data
   */
  verifyProjects: (claimedProjects, githubData) => {
    if (!githubData || !githubData.valid || !githubData.repos) return [];

    return claimedProjects.map(project => {
      let bestScore = 0;
      let bestRepo = null;
      let evidence = [];

      githubData.repos.forEach(repo => {
        let repoScore = 0;
        let repoEvidence = [];

        // 1. Name similarity (Max 30)
        const nameSim = calculateSimilarity(project.name, repo.name);
        if (nameSim > 80) {
          repoScore += 30;
          repoEvidence.push("✓ Project name strongly matches repository name.");
        } else if (nameSim > 50) {
          repoScore += 15;
          repoEvidence.push("✓ Project name partially matches repository name.");
        }

        // 2. Description/README similarity (Max 30)
        let descSimScore = 0;
        if (project.description && repo.description) {
          const descSim = calculateSimilarity(project.description, repo.description);
          if (descSim > 50) descSimScore += 15;
        }
        if (project.description && repo.readme) {
          if (repo.readme.toLowerCase().includes(project.description.toLowerCase().substring(0, 20))) {
             descSimScore += 15;
          }
        }
        if (descSimScore > 0) {
          repoScore += Math.min(30, descSimScore);
          repoEvidence.push("✓ Repository description or README contains similar project details.");
        }

        // 3. Technology overlap (Max 20)
        if (project.technologies && Array.isArray(project.technologies)) {
          let techMatchCount = 0;
          project.technologies.forEach(tech => {
            const nTech = normalizeSkill(tech);
            const inLang = (repo.language && normalizeSkill(repo.language) === nTech) || (repo.all_languages && repo.all_languages.some(l => normalizeSkill(l) === nTech));
            const inReadme = repo.readme && repo.readme.toLowerCase().includes(nTech);
            const inTopics = repo.topics && repo.topics.some(t => normalizeSkill(t) === nTech);
            if (inLang || inReadme || inTopics) techMatchCount++;
          });
          
          if (techMatchCount > 0) {
            repoScore += Math.min(20, techMatchCount * 10);
            repoEvidence.push(`✓ Technology stack overlaps (${techMatchCount} matching technologies found).`);
          }
        }

        // 4. Repository structure / General Evidence (Max 20)
        // Give some points if it has source files, dependencies, etc. indicating it's a real project, not just a blank repo
        if (repo.files && repo.files.length > 2) {
           repoScore += 10;
           repoEvidence.push("✓ Repository contains populated source structure.");
        }
        if (repo.stargazers_count > 0 || repo.forks_count > 0) {
           repoScore += 10;
           repoEvidence.push("✓ Repository has community engagement (stars/forks).");
        }

        // Require at least name or description match to consider it the SAME project
        if (nameSim < 50 && descSimScore === 0) {
           repoScore = 0;
           repoEvidence = [];
        }

        if (repoScore > bestScore) {
          bestScore = repoScore;
          bestRepo = repo;
          evidence = repoEvidence;
        }
      });

      let status = 'Insufficient Public Evidence';
      if (bestScore >= 75) status = 'Verified';
      else if (bestScore >= 50) status = 'Partially Verified';
      else if (bestScore >= 25) status = 'Weak Evidence';
      
      if (bestScore === 0) {
         evidence = ["No matching public GitHub repository found. The project may be private, hosted elsewhere, deleted, or not publicly available."];
      } else if (bestRepo) {
         evidence.unshift(`Matching repository found: ${bestRepo.name}`);
      }

      return {
        name: project.name,
        score: Math.min(100, bestScore),
        status,
        evidence
      };
    });
  },

  /**
   * Identify GitHub identity confidence
   */
  verifyIdentity: (candidateName, githubData) => {
    if (!githubData || !githubData.valid || !githubData.profile) return { score: 0, status: 'Unknown', message: 'No profile data' };

    const githubName = githubData.profile.name || githubData.profile.login;
    const similarity = calculateSimilarity(candidateName, githubName);

    let status = 'Low Confidence';
    if (similarity >= 80) status = 'High Confidence';
    else if (similarity >= 50) status = 'Medium Confidence';

    return {
      score: similarity,
      status,
      message: similarity < 50 ? "GitHub identity could not be confidently matched." : "Identity matches public GitHub profile."
    };
  }
};

module.exports = githubVerificationService;
