/**
 * Certificate Analysis Prompts
 *
 * Three distinct prompt tiers used for retry escalation.
 * Each includes the OCR text as supplementary context.
 */

const CATEGORIES = [
  "Certificate", "Internship", "Workshop", "Webinar", "Course", "Hackathon",
  "Competition", "Bootcamp", "Training", "Achievement", "Seminar", "Conference", "Volunteer Work",
];

function buildOcrContext(ocrText: string | null): string {
  if (!ocrText || ocrText.trim().length === 0) return "";
  return `\n\nOCR-extracted text from the document (use this as supplementary context — it may be imperfect):\n"""\n${ocrText.substring(0, 4000)}\n"""`;
}

/**
 * Prompt Tier 1 — Default (temperature 0.1)
 * Concise, structured, expects the full JSON schema.
 */
export function getAnalysisPromptTier1(ocrText: string | null): string {
  return `You are a certificate and credential analysis AI. Analyze this document and extract all information.

RULES:
- Return ONLY valid JSON. No markdown, no explanations, no code fences.
- Use null for any field you cannot determine with confidence.
- Set "requiresCategoryReview" to true when "categoryConfidence" is below 0.8.
- "confidence" is your overall confidence in the extraction accuracy (0.0 to 1.0).
- For dates, use ISO 8601 format (YYYY-MM-DD) when possible, otherwise use the date as written.
- "category" must be one of: ${JSON.stringify(CATEGORIES)}.
- "certificateType" should be one of: certificate, award, participation, completion, recognition, license, diploma, letter, badge, other.
- "difficulty" should be one of: beginner, intermediate, advanced, expert.
- "importance" should be one of: low, medium, high, critical.
- "credibility" should be one of: verified, unverified, unknown.
- Generate a professional "reflection" describing what was learned, skills gained, and future impact.
- Generate a "resumeSummary" as a compelling resume bullet point.
- Generate a "portfolioSummary" suitable for a portfolio showcase.
- Generate a "linkedinSummary" suitable for a LinkedIn post or certification entry.
- "professionalSummary" should be a comprehensive 2-3 sentence professional description.
${buildOcrContext(ocrText)}

Extract every piece of information visible in the document including title, organization, participant name, certificate number, dates, skills, technologies, location, achievement, and more. Return the complete JSON object.`;
}

/**
 * Prompt Tier 2 — Retry (temperature 0.3)
 * More explicit field-by-field instructions.
 */
export function getAnalysisPromptTier2(ocrText: string | null): string {
  return `Analyze this document carefully. This is a certificate, award, or credential document.

You MUST return ONLY a JSON object (no markdown, no explanations, no wrapping).

For EACH field below, extract the value or set to null if not found:

- "title": The main title or name of the certificate/award/course
- "organization": The issuing organization, institution, or company
- "participantName": The name of the person who received this
- "certificateNumber": Any credential ID, certificate number, or serial number
- "category": One of ${JSON.stringify(CATEGORIES)}
- "categoryConfidence": Your confidence in the category (0.0-1.0)
- "requiresCategoryReview": true if categoryConfidence < 0.8
- "certificateType": certificate/award/participation/completion/recognition/license/diploma/letter/badge/other
- "eventType": hackathon/workshop/webinar/competition/conference/seminar/bootcamp/training/course/internship/volunteer/sports/cultural/technical/other
- "description": Detailed description of what this certificate represents
- "achievement": Any specific achievement mentioned (e.g., "First Place", "Top 10")
- "position": Rank or position if applicable
- "location": City, venue, or location mentioned
- "issueDate": Date issued (ISO format YYYY-MM-DD preferred)
- "expiryDate": Expiry date if any
- "startDate": Course or event start date (ISO format YYYY-MM-DD preferred)
- "endDate": Course or event end date (ISO format YYYY-MM-DD preferred)
- "completionDate": Date of completion (ISO format YYYY-MM-DD preferred)
- "duration": Duration of the course or event (e.g. '3 months', '40 hours')
- "verificationUrl": URL to verify the credential or certificate
- "skills": Array of relevant skills
- "technologies": Array of technologies/frameworks/tools mentioned
- "tags": Array of relevant tags for categorization
- "keywords": Array of searchable keywords
- "professionalSummary": 2-3 sentence professional description
- "resumeSummary": One compelling resume bullet point
- "portfolioSummary": Portfolio showcase description
- "linkedinSummary": LinkedIn-ready description
- "reflection": Professional reflection on learning and impact
- "seoTitle": SEO-optimized page title
- "seoDescription": SEO meta description
- "confidence": Overall extraction confidence (0.0-1.0)
- "difficulty": beginner/intermediate/advanced/expert
- "importance": low/medium/high/critical
- "credibility": verified/unverified/unknown
- "competitionLevel": Description of competition level if applicable
- "domain": Professional domain (e.g., "Software Engineering", "Data Science")
- "subdomain": Specific subdomain (e.g., "Machine Learning", "Web Development")
- "estimatedHours": Estimated hours to complete (number or null)
${buildOcrContext(ocrText)}`;
}

/**
 * Prompt Tier 3 — Final retry (temperature 0.5)
 * Simplified, focusing on essential fields only.
 */
export function getAnalysisPromptTier3(ocrText: string | null): string {
  return `Look at this document image and extract the key information. Return ONLY valid JSON.

Required fields (set to null if not found):
{
  "title": "certificate/award title",
  "organization": "issuing org",
  "participantName": "recipient name or null",
  "certificateNumber": "ID/number or null",
  "category": one of ${JSON.stringify(CATEGORIES)},
  "categoryConfidence": 0.0-1.0,
  "requiresCategoryReview": true/false,
  "certificateType": "certificate/award/participation/completion/other or null",
  "eventType": "type or null",
  "description": "what this document represents",
  "achievement": "specific achievement or null",
  "position": "rank or null",
  "location": "location or null",
  "issueDate": "date or null",
  "expiryDate": "date or null",
  "startDate": "date or null",
  "endDate": "date or null",
  "completionDate": "date or null",
  "duration": "duration (e.g. '3 months', '40 hours') or null",
  "verificationUrl": "URL to verify credential or null",
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1"],
  "tags": ["tag1"],
  "keywords": ["keyword1"],
  "professionalSummary": "professional description",
  "resumeSummary": "resume bullet or null",
  "portfolioSummary": "portfolio text or null",
  "linkedinSummary": "linkedin text or null",
  "reflection": "reflection text or null",
  "seoTitle": "SEO title",
  "seoDescription": "SEO description",
  "confidence": 0.0-1.0,
  "difficulty": "beginner/intermediate/advanced/expert or null",
  "importance": "low/medium/high/critical or null",
  "credibility": "verified/unverified/unknown",
  "competitionLevel": "level or null",
  "domain": "domain or null",
  "subdomain": "subdomain or null",
  "estimatedHours": number or null
}

ONLY return the JSON. No explanations. No markdown. No code fences.
${buildOcrContext(ocrText)}`;
}

/** Returns the prompt for the given retry tier (0-indexed) */
export function getAnalysisPrompt(tier: number, ocrText: string | null): string {
  switch (tier) {
    case 0: return getAnalysisPromptTier1(ocrText);
    case 1: return getAnalysisPromptTier2(ocrText);
    case 2: return getAnalysisPromptTier3(ocrText);
    default: return getAnalysisPromptTier1(ocrText);
  }
}

/** Returns the temperature for the given retry tier */
export function getRetryTemperature(tier: number): number {
  switch (tier) {
    case 0: return 0.1;
    case 1: return 0.3;
    case 2: return 0.5;
    default: return 0.1;
  }
}
