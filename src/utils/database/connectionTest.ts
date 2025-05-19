
import { supabase } from "@/integrations/supabase/client";

/**
 * Tests basic database connection
 */
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Error testing database connection:", error);
      return { success: false, message: `Database connection test failed: ${error.message}` };
    }

    console.log("Database connection test successful");
    return { success: true, message: "Database connection test successful" };
  } catch (error) {
    console.error("Error testing database connection:", error);
    return { success: false, message: `Database connection test failed: ${error}` };
  }
};

// Alias function to match the import in ConnectionTestCard.tsx
export const testSupabaseConnection = testConnection;
