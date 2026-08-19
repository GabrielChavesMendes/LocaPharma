import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Route as RouteIcon, Loader2, UserCircle, ArrowUpDown, Navigation, Search, Map as MapIcon, Moon, Mountain, Radar } from 'lucide-react';
import logo from '../assets/logo.png';
import Map from '../components/Map';
import { supabase } from '../lib/supabase';

const HOSPITAL_CENTER: [number, number] = [-19.9245, -43.9276];

const dic = {
  pt: { title: "GIS Hospitalar", search: "Buscar hospital âncora...", radius: "Raio", originTitle: "Origem da Rota e Distância", gpsOn: "Baseado no seu GPS", gpsOff: "Baseado na Âncora (Hospital)", surr: "Entorno", dist: "DISTÂNCIA", loading: "Mapeando região...", notFound: "Hospital ou local não encontrado.", route: "Rota", clear: "Limpar pesquisa e voltar ao Hospital", noResults: "Nenhum estabelecimento ativo." },
  en: { title: "Hospital GIS", search: "Search anchor hospital...", radius: "Radius", originTitle: "Route Origin & Distance", gpsOn: "Based on your GPS", gpsOff: "Based on Anchor (Hospital)", surr: "Surroundings", dist: "DISTANCE", loading: "Mapping region...", notFound: "Hospital or location not found.", route: "Route", clear: "Clear search & return to Hospital", noResults: "No active facilities found." }
};

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad; const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function DashboardGIS() {
  const userType = localStorage.getItem('locapharma_user') || 'familiar';
  const isMedico = userType === 'medico';
  
  // Puxa o idioma e o tema salvos
  const lang = (localStorage.getItem('locapharma_lang') as 'pt' | 'en') || 'pt';
  const t = dic[lang];
  const roleDisplay = userType === 'medico' ? (lang === 'pt' ? 'Médico' : 'Doctor') : (lang === 'pt' ? 'Familiar' : 'Family');

  const [anchorLoc, setAnchorLoc] = useState<[number, number]>(HOSPITAL_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState<number>(2500); 
  const [useRealGPS, setUseRealGPS] = useState(false);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  const routeOrigin = (useRealGPS && userLoc) ? userLoc : anchorLoc;
  const savedTheme = localStorage.getItem('locapharma_theme') || 'light';
  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'relief'>(savedTheme as any);
  
  const [layers] = useState({ farmacias: true, laboratorios: isMedico });  const [nearbyList, setNearbyList] = useState<any[]>([]);
  const [routeTarget, setRouteTarget] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'alphabetical'>('distance');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]));
    const fetchSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('saved_locations').select('facility_id').eq('user_id', user.id);
        if (data) setSavedIds(data.map(d => d.facility_id));
      }
    };
    fetchSaved();
  }, []);

  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true);
      const [lat, lng] = anchorLoc;
      const overpassQuery = `[out:json][timeout:25];(nwr["amenity"="pharmacy"](around:${searchRadius}, ${lat}, ${lng});nwr["amenity"="clinic"](around:${searchRadius}, ${lat}, ${lng});nwr["amenity"="hospital"](around:${searchRadius}, ${lat}, ${lng}););out center;`;

      try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
        const data = await response.json();
        const mapped = data.elements.map((el: any) => ({
          id: el.id, name: el.tags?.name || 'Centro de Saúde',
          type: el.tags?.amenity === 'clinic' || el.tags?.amenity === 'hospital' ? 'laboratorio' : 'farmacia',
          lat: el.lat || el.center?.lat, lng: el.lon || el.center?.lon,
        })).filter((fac: any) => fac.lat && fac.lng);
        setNearbyList(mapped);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchRealData();
  }, [anchorLoc, searchRadius]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Belo Horizonte')}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setAnchorLoc([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setSearchQuery('');
      } else alert(t.notFound);
    } catch (error) { alert("Error."); } finally { setIsLoading(false); }
  };

  const visibleFacilities = [...nearbyList]
    .map(item => ({ ...item, distance: getDistanceInMeters(routeOrigin[0], routeOrigin[1], item.lat, item.lng) }))
    .filter(item => (item.type === 'farmacia' && layers.farmacias) || (item.type === 'laboratorio' && layers.laboratorios))
    .sort((a, b) => sortBy === 'distance' ? a.distance - b.distance : a.name.localeCompare(b.name));

  return (
    <div className={`flex h-screen w-full font-inter overflow-hidden ${mapStyle === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      <aside className={`w-80 flex flex-col border-r z-10 shadow-sm relative ${mapStyle === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 flex items-center justify-between border-b ${mapStyle === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-bold text-lg leading-tight">{t.title}</h1>
              <p className="text-xs text-primary font-medium uppercase">{roleDisplay}</p>
            </div>
          </div>
          <Link to="/profile" className={`p-2 rounded-full hover:scale-105 transition-all shadow-sm border ${mapStyle === 'dark' ? 'bg-gray-700 text-blue-400 border-gray-600' : 'bg-blue-50 text-primary border-blue-100'}`}>
            <UserCircle size={24} />
          </Link>
        </div>

        <div className={`p-4 border-b space-y-3 ${mapStyle === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className={`flex-1 px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${mapStyle === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
            />
            <button type="submit" className="bg-primary text-white p-2 rounded-md hover:bg-blue-800 transition-colors">
              <Search size={18} />
            </button>
          </form>
          
          <div className={`flex items-center justify-between px-3 py-2 rounded-md border ${mapStyle === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300'}`}>
            <span className="text-xs font-bold flex items-center gap-1"><Radar size={14}/> {t.radius}</span>
            <select 
              value={searchRadius} onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="text-sm bg-transparent font-medium text-primary outline-none cursor-pointer"
            >
              <option value={1000}>1 km</option>
              <option value={2500}>2.5 km</option>
              <option value={5000}>5 km</option>
            </select>
          </div>
        </div>

        <div className={`p-6 border-b ${mapStyle === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.originTitle}</h2>
          <button 
            onClick={() => setUseRealGPS(!useRealGPS)}
            className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg border transition-all ${useRealGPS ? 'bg-primary text-white border-primary' : (mapStyle === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100')}`}
          >
            <Navigation size={16} /> {useRealGPS ? t.gpsOn : t.gpsOff}
          </button>
        </div>
        
        <div className={`flex-1 overflow-y-auto p-6 ${mapStyle === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <MapPin size={14} /> {t.surr} ({visibleFacilities.length})
            </h2>
            <button onClick={() => setSortBy(prev => prev === 'distance' ? 'alphabetical' : 'distance')} className={`flex items-center gap-1 text-[10px] border px-2 py-1 rounded-md font-bold ${mapStyle === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
              <ArrowUpDown size={12} /> {sortBy === 'distance' ? t.dist : 'A-Z'}
            </button>
          </div>
          
          {isLoading ? <div className="py-10 flex flex-col items-center"><Loader2 className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">{t.loading}</span></div> : (
            <div className="space-y-3">
              {visibleFacilities.length === 0 && <p className="text-xs text-gray-500 text-center py-4">{t.noResults}</p>}
              {visibleFacilities.map(item => (
                <div key={item.id} className={`p-3 rounded-lg border shadow-sm text-sm ${mapStyle === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="font-bold truncate">{item.name}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 uppercase">{item.type} • {(item.distance / 1000).toFixed(1)}km</span>
                    <button onClick={() => setRouteTarget([item.lat, item.lng])} className="flex items-center gap-1 text-xs text-primary font-bold bg-blue-50/10 hover:bg-blue-50/30 px-2 py-1 rounded">
                      <RouteIcon size={12}/> {t.route}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 relative z-0">
        <Map activeCenter={routeOrigin} activeLayers={layers} facilities={nearbyList} routeTarget={routeTarget} savedIds={savedIds} onSaveSuccess={(id) => setSavedIds(prev => [...prev, id])} mapStyle={mapStyle} />
        
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          <button onClick={() => setMapStyle('light')} className={`p-2 rounded-lg shadow-md transition-colors ${mapStyle === 'light' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`} title="Modo Claro"><MapIcon size={20} /></button>
          <button onClick={() => setMapStyle('dark')} className={`p-2 rounded-lg shadow-md transition-colors ${mapStyle === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`} title="Modo Escuro"><Moon size={20} /></button>
          <button onClick={() => setMapStyle('relief')} className={`p-2 rounded-lg shadow-md transition-colors ${mapStyle === 'relief' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`} title="Modo Relevo"><Mountain size={20} /></button>
        </div>
      </main>
    </div>
  );
}