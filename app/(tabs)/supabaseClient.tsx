import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vqczuukjhdqflcrvlqmq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3p1dWtqaGRxZmxjcnZscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwNzQ0NDksImV4cCI6MjAzNTY1MDQ0OX0.eDKHnInIkzh1zXV8ulx_8FYKl1cLE3yrAGTTOKgT1Os";
export const supabase = createClient(supabaseUrl, supabaseKey);
