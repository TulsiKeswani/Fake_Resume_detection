require('dotenv').config();
const service = require('./services/githubVerificationService');

(async () => {
  const result = await service.fetchGithubProfileData('krishnabagul06');
  console.log("Valid:", result.valid);
  if (result.valid) {
    console.log("Repos fetched:", result.repos.length);
    console.log("First repo files:", result.repos[0]?.files);
    console.log("First repo languages:", result.repos[0]?.all_languages);

    const skills = service.verifySkills(['react', 'javascript', 'docker'], result);
    console.log("Skills:", JSON.stringify(skills, null, 2));

    const projects = service.verifyProjects([{name: 'React', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.'}], result);
    console.log("Projects:", JSON.stringify(projects, null, 2));
  } else {
    console.log(result.error);
  }
})();
