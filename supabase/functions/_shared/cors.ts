export const corsHeaders = {
  "Access-Control-Allow-Origin": "https://project-52mb8vo4d-ujkims-projects.vercel.app/",
  "Access-Control-Allow-Headers":
    "x-csrf-token, x-requested-with, accept, accept-version, content-length, content-md5, date, x-api-version, authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Credentials": "true",  // ✅ Add this if your request includes credentials (cookies, auth headers)
  "Vary": "Origin",  // ✅ Ensures proper handling when multiple origins exist
};
