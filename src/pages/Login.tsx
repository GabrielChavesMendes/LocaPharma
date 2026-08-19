import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  // Adaptação para o novo enunciado: familiar ou medico
  const [accountType, setAccountType] = useState<'familiar' | 'medico'>('familiar');
  const navigate = useNavigate(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [crm, setCrm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: profile } = await supabase.from('profiles').select('account_type').eq('id', data.user.id).single();
        if (profile) localStorage.setItem('locapharma_user', profile.account_type);

      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            account_type: accountType,
            crm: accountType === 'medico' ? crm : null
          });
          if (profileError) throw profileError;
        }
        localStorage.setItem('locapharma_user', accountType);
      }
      navigate('/map');
    } catch (error: any) {
      alert("Erro na autenticação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-inter bg-white">
      
      {/* LADO ESQUERDO - Foco em Logística Hospitalar */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F8F9FA] items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-80"></div>
         <div className="absolute inset-0 bg-blue-900/40"></div>
         
         <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-8 mt-auto mb-16 border border-white/20">
            <h2 className="font-montserrat font-bold text-2xl text-gray-900 mb-3">
              Logística de Saúde Integrada
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Plataforma WebGIS dedicada ao entorno hospitalar de Belo Horizonte. Localize farmácias de plantão e laboratórios de radiografia com precisão espacial.
            </p>
         </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          
          <div className="flex justify-center items-center gap-3 mb-10">
            <img src={logo} alt="LocaPharma Logo" className="w-12 h-12 object-contain" />
            <span className="font-montserrat font-bold text-3xl text-primary">LocaPharma</span>
          </div>

          <div className="flex border-b border-gray-200 mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 pb-3 font-montserrat font-semibold transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              Login
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 pb-3 font-montserrat font-semibold transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              Cadastro
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Perfil de Acesso</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setAccountType('familiar')} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${accountType === 'familiar' ? 'border-primary bg-blue-50 text-primary border-2' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    Familiar de Paciente
                  </button>
                  <button type="button" onClick={() => setAccountType('medico')} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${accountType === 'medico' ? 'border-primary bg-blue-50 text-primary border-2' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    Médico Solicitante
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            )}

            {!isLogin && accountType === 'medico' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CRM (Registro Médico)</label>
                <input type="text" required value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="Ex: 123456-MG" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {accountType === 'medico' ? 'E-mail Institucional / Clínico' : 'Endereço de E-mail'}
              </label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-800 text-white font-medium py-3 mt-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? <><LogIn size={18} /> Acessar WebGIS</> : <><UserPlus size={18} /> Criar Conta</>)}
            </button>
          </form>

        </div>
      </div>
      
    </div>
  );
}