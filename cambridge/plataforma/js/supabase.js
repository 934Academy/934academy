// ════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SUPABASE
// ════════════════════════════════════════════════════════════
// ⚠️ IMPORTANTE: Sustituye estos dos valores por los tuyos.
// Los encuentras en: Supabase → Settings ⚙️ → API
// ════════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://quefnolglctrknvwpapl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWZub2xnbGN0cmtudndwYXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTIwODIsImV4cCI6MjA5NTgyODA4Mn0.wVHxpRP9W-FUEFUIa7majuQUh39FSotGeUZ9zviXCUY';

// ════════════════════════════════════════════════════════════
// NO TOQUES NADA A PARTIR DE AQUÍ
// ════════════════════════════════════════════════════════════
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
