import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPortfolioContext(contextType?: string) {
  const supabase = await createSupabaseServerClient();
  
  let contextStr = "This content is for a premium, modern software engineering portfolio.";

  try {
    // In a real application, you might query the user's profile, main skills, or current projects.
    // For this example, we keep it relatively static or expand it based on contextType.
    if (contextType) {
       contextStr += ` The content should be tailored for a ${contextType} section.`;
    }
  } catch (error) {
    console.error("Failed to get context:", error);
  }
  
  return contextStr;
}
