import { createClient } from '@supabase/supabase-js';

// O Vite usa import.meta.env para ler as variáveis do arquivo .env de forma segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação de segurança para garantir que o .env foi lido corretamente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase. Verifique o seu arquivo .env.");
}

// Cria e exporta a conexão única com o banco de dados
export const supabase = createClient(supabaseUrl, supabaseAnonKey);