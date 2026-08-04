export const AIActions = {
  optimize: "Optimize this text for maximum impact, making it engaging and clear.",
  rewrite: "Rewrite this text in a completely different way while preserving the core meaning.",
  expand: "Expand this text with more relevant details, making it comprehensive and informative.",
  shorten: "Shorten this text significantly, keeping only the most essential points.",
  humanize: "Rewrite this text to sound more natural, human, and conversational, removing robotic or overly formal phrasing.",
  fix_grammar: "Fix all grammatical errors and typos in this text without changing its meaning.",
  improve_readability: "Improve the readability of this text, making it flow better and easier to understand.",
  simplify: "Simplify this text so it is easy to understand for a general audience, removing jargon.",
  make_premium: "Rewrite this text to sound highly premium, exclusive, and state-of-the-art.",
  generate_tags: "Generate a comma-separated list of relevant tags or keywords based on this text. Return ONLY the comma-separated list without any extra formatting.",
  generate_skills: "Extract or generate a comma-separated list of relevant professional skills based on this text. Return ONLY the comma-separated list without any extra formatting.",
  generate_technologies: "Extract or generate a comma-separated list of relevant technologies, frameworks, or tools based on this text. Return ONLY the comma-separated list without any extra formatting.",
  generate_summary: "Write a concise 1-2 sentence summary of this text.",
} as const;

export type AIAction = keyof typeof AIActions;

export const AITones = {
  professional: "Use a highly professional, formal tone suitable for a senior executive or corporate environment.",
  technical: "Use a technical tone, focusing on engineering details, architecture, and developer terminology.",
  corporate: "Use a corporate, business-focused tone, highlighting impact, ROI, and metrics.",
  startup: "Use a dynamic, fast-paced startup tone—innovative, energetic, and disruptive.",
  academic: "Use an academic tone, focusing on research, methodology, and empirical evidence.",
  portfolio: "Use a tone optimized for a personal portfolio—showcasing achievements with confidence and clarity.",
  minimal: "Keep the tone extremely minimal, direct, and to the point. No fluff.",
  creative: "Use a highly creative, engaging, and imaginative tone.",
  premium: "Use a sophisticated, premium, and exclusive tone.",
  recruiter_friendly: "Use a tone that directly appeals to technical recruiters—highlighting impact and skills clearly.",
  ats_friendly: "Use a straightforward, keyword-rich tone optimized for Applicant Tracking Systems (ATS).",
  investor_pitch: "Use an ambitious, persuasive tone suitable for an investor pitch, focusing on problem-solving and market potential.",
  github_style: "Use a tone typical of high-quality GitHub documentation—clear, technical, and community-focused.",
  readme_style: "Write this as if it were a high-quality README file introduction.",
  website_style: "Write this as engaging marketing copy for a modern website landing page.",
  linkedin_style: "Write this as a compelling, professional LinkedIn post or summary.",
} as const;

export type AITone = keyof typeof AITones;

export function buildPrompt(text: string, action: AIAction | 'custom', customPrompt?: string, tone?: AITone, context?: string) {
  let prompt = "";

  if (action !== 'custom') {
    prompt += AIActions[action] + "\n\n";
  } else if (customPrompt) {
    prompt += customPrompt + "\n\n";
  } else {
    prompt += "Improve this text.\n\n";
  }

  if (tone) {
    prompt += AITones[tone] + "\n\n";
  }

  if (context) {
    prompt += `Context: ${context}\n\n`;
  }

  prompt += `Text to process:\n"""\n${text}\n"""\n\n`;
  prompt += "Return only the final result text. Do not include introductory phrases like 'Here is the result:' or wrap it in markdown unless specifically asked to output markdown.";

  return prompt;
}
