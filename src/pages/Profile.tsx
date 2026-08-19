import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Edit, Bookmark, MapPin, LogOut, Loader2, Camera, Trash2, Globe, Moon, Sun, User } from 'lucide-react';
import logo from '../assets/logo.png'; 
import { supabase } from '../lib/supabase';

// Dicionário de Tradução Completo (PT / EN)
const dic = {
  pt: { 
    overview: "Visão Geral", settings: "Configurações", saved: "Meus Locais Salvos", 
    theme: "Tema Visual", lang: "Idioma", logout: "Sair", 
    noLoc: "Nenhum local favoritado no mapa ainda.", danger: "Zona de Perigo", 
    delBtn: "Excluir Conta Permanentemente", confirmDel: "Tem certeza que deseja excluir sua conta e todos os locais salvos? Esta ação é irreversível.",
    uploadErr: "Erro ao enviar foto: ", removeErr: "Erro ao remover: "
  },
  en: { 
    overview: "Overview", settings: "Settings", saved: "My Saved Locations", 
    theme: "Visual Theme", lang: "Language", logout: "Logout", 
    noLoc: "No saved locations on the map yet.", danger: "Danger Zone", 
    delBtn: "Permanently Delete Account", confirmDel: "Are you sure you want to delete your account and all saved locations? This action is irreversible.",
    uploadErr: "Error uploading photo: ", removeErr: "Error removing location: "
  }
};

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  const [theme, setTheme] = useState(localStorage.getItem('locapharma_theme') || 'light');
  const [lang, setLang] = useState<'pt' | 'en'>((localStorage.getItem('locapharma_lang') as 'pt' | 'en') || 'pt');
  
  const [profile, setProfile] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const t = dic[lang];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');
        
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(pData);

        const { data: lData } = await supabase.from('saved_locations').select('*').eq('user_id', user.id).order('saved_at', { ascending: false });
        setSavedLocations(lData || []);
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchUserData();
  }, [navigate]);

  // Função robusta de Upload e salvamento definitivo do avatar
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const filePath = `public/${profile?.id}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Atualiza permanentemente no banco de dados
      const { error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile?.id);
      if (dbError) throw dbError;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
    } catch (error: any) { 
      alert(t.uploadErr + error.message); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleRemoveLocation = async (id: string) => {
    try {
      const { error } = await supabase.from('saved_locations').delete().eq('id', id);
      if (error) throw error;
      setSavedLocations(prev => prev.filter(loc => loc.id !== id));
    } catch (error: any) {
      alert(t.removeErr + error.message);
    }
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    localStorage.removeItem('locapharma_user'); 
    navigate('/login'); 
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.confirmDel) || !profile?.id) return;
    await supabase.from('profiles').delete().eq('id', profile.id);
    await handleLogout();
  };

  const toggleTheme = () => { 
    const newTheme = theme === 'light' ? 'dark' : 'light'; 
    setTheme(newTheme); 
    localStorage.setItem('locapharma_theme', newTheme); 
  };

  const changeLang = (newLang: 'pt' | 'en') => { 
    setLang(newLang); 
    localStorage.setItem('locapharma_lang', newLang); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className={`min-h-screen font-inter pb-16 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-[#F8F9FA] text-gray-800'}`}>
      <header className={`flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b shadow-sm mb-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl text-primary">LocaPharma</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/map" className="hover:text-primary transition-colors">Map</Link>
          <span className="text-primary border-b-2 border-primary pb-1">Profile</span>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2 rounded-md font-medium text-sm transition-colors">
          <LogOut size={16} /> {t.logout}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="col-span-1 space-y-6">
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`h-24 ${profile?.account_type === 'medico' ? 'bg-blue-900' : 'bg-gray-300'}`}></div>
            <div className="px-6 pb-6 relative flex flex-col items-center text-center">
              <div className="relative -top-12">
                <div className={`w-24 h-24 rounded-full p-1 border-4 flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-gray-700 border-gray-800' : 'bg-white border-white'}`}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:scale-105 shadow-lg border-2 border-white" title="Alterar Foto">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploading} />
                </label>
              </div>
              <div className="mt-2 w-full">
                <h2 className="font-bold text-lg">{profile?.full_name}</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">{profile?.account_type}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-2 shadow-sm flex flex-col gap-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Bookmark size={18} /> {t.overview}
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Settings size={18} /> {t.settings}
            </button>
          </div>
        </aside>

        <div className="col-span-1 lg:col-span-3 space-y-6">
          {activeTab === 'overview' && (
            <div className={`rounded-2xl border p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="flex items-center gap-2 font-bold mb-6">
                <Bookmark size={18} className="text-primary" /> {t.saved} ({savedLocations.length})
              </h3>
              
              {savedLocations.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                  <MapPin className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-sm font-medium">{t.noLoc}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedLocations.map((loc) => (
                    <div key={loc.id} className={`border rounded-xl p-4 flex justify-between items-start ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                      <div>
                        <h4 className="font-bold text-sm text-primary">{loc.facility_name}</h4>
                        <span className="text-[10px] font-bold uppercase text-gray-500 mt-1 block">{loc.facility_type}</span>
                      </div>
                      <button onClick={() => handleRemoveLocation(loc.id)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Remover Favorito">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold mb-6 flex items-center gap-2"><Edit size={18} className="text-primary" /> {t.settings}</h3>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 border rounded-xl ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? <Sun className="text-orange-500" /> : <Moon className="text-blue-400" />}
                      <div><p className="font-semibold text-sm">{t.theme}</p></div>
                    </div>
                    <button onClick={toggleTheme} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold transition-colors">
                      Alternar / Switch
                    </button>
                  </div>
                  
                  <div className={`flex items-center justify-between p-4 border rounded-xl ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <Globe className="text-green-500" />
                      <div><p className="font-semibold text-sm">{t.lang}</p></div>
                    </div>
                    <select value={lang} onChange={(e) => changeLang(e.target.value as 'pt'|'en')} className="px-3 py-2 bg-gray-100 text-gray-900 border-none rounded-lg text-xs font-bold outline-none cursor-pointer">
                      <option value="pt">Português (BR)</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border border-red-200 p-6 shadow-sm ${theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50'}`}>
                <h3 className="font-bold mb-2 text-red-600 flex items-center gap-2"><Trash2 size={18} /> {t.danger}</h3>
                <button onClick={handleDeleteAccount} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md">
                  {t.delBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}