import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEffect, useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pill, FlaskConical, Building2, UserRound, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const dic = {
  pt: { origin: "Ponto de Origem Ativo", saving: "Salvando...", saved: "Favoritado", saveBtn: "Salvar Favorito", loginReq: "Faça login para salvar!", error: "Erro ao salvar: " },
  en: { origin: "Active Origin Point", saving: "Saving...", saved: "Saved", saveBtn: "Save Favorite", loginReq: "Login required to save!", error: "Error saving: " }
};

const createCustomIcon = (iconElement: ReactNode, bgColorClass: string) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`w-8 h-8 ${bgColorClass} text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>{iconElement}</div>
  );
  return L.divIcon({ html: iconMarkup, className: 'custom-leaflet-icon bg-transparent border-none', iconSize: [32, 32], iconAnchor: [16, 16] });
};

const pharmacyIcon = createCustomIcon(<Pill size={16} />, 'bg-green-500');
const labIcon = createCustomIcon(<FlaskConical size={16} />, 'bg-[#00A7CB]');
const hospitalIcon = createCustomIcon(<Building2 size={16} />, 'bg-[#0052CC]');
const userIcon = createCustomIcon(<UserRound size={16} />, 'bg-red-500');

function RoutingControl({ start, end }: { start: [number, number], end: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!end) return;
    const routingControl = L.Routing.control({
      waypoints: [ L.latLng(start[0], start[1]), L.latLng(end[0], end[1]) ],
      routeWhileDragging: false, addWaypoints: false, show: false,
      lineOptions: { styles: [{ color: '#0052CC', weight: 4 }], extendToWaypoints: true, missingRouteTolerance: 0 }
    }).addTo(map);
    return () => { map.removeControl(routingControl); };
  }, [map, start, end]);
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 15, { animate: true }); }, [center, map]);
  return null;
}

interface MapProps {
  activeCenter: [number, number];
  activeLayers: { farmacias: boolean; laboratorios: boolean };
  facilities: any[];
  routeTarget: [number, number] | null;
  savedIds: string[];
  onSaveSuccess: (id: string) => void;
  mapStyle: 'light' | 'dark' | 'relief';
}

export default function Map({ activeCenter, activeLayers, facilities, routeTarget, savedIds, onSaveSuccess, mapStyle }: MapProps) {
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Puxa o idioma salvo
  const lang = (localStorage.getItem('locapharma_lang') as 'pt' | 'en') || 'pt';
  const t = dic[lang];

  const getFacilityIcon = (type: string) => {
    if (type === 'farmacia') return pharmacyIcon;
    if (type === 'laboratorio') return labIcon;
    return hospitalIcon;
  };

  const handleSaveLocation = async (facility: any) => {
    setSavingId(facility.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert(t.loginReq);
      const { error } = await supabase.from('saved_locations').insert({
        user_id: user.id, facility_id: String(facility.id), facility_name: facility.name,
        facility_type: facility.type, lat: facility.lat, lng: facility.lng
      });
      if (error) throw error;
      onSaveSuccess(String(facility.id));
    } catch (error: any) { alert(t.error + error.message); } finally { setSavingId(null); }
  };

  const getTileUrl = () => {
    if (mapStyle === 'dark') return 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
    if (mapStyle === 'relief') return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  };

  return (
    <MapContainer center={activeCenter} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer key={mapStyle} url={getTileUrl()} attribution='&copy; OpenStreetMap contributors' />
      <ChangeView center={activeCenter} />
      <RoutingControl start={activeCenter} end={routeTarget} />

      <Marker position={activeCenter} icon={userIcon}>
        <Popup className="font-inter rounded-xl"><strong>{t.origin}</strong></Popup>
      </Marker>

      {facilities.map((facility) => {
        const isPharmacy = facility.type === 'farmacia';
        const isLabOrHospital = facility.type !== 'farmacia';
        const isSaved = savedIds.includes(String(facility.id));

        if ((isPharmacy && activeLayers.farmacias) || (isLabOrHospital && activeLayers.laboratorios)) {
          return (
            <Marker key={facility.id} position={[facility.lat, facility.lng]} icon={getFacilityIcon(facility.type)}>
              <Popup className="font-inter p-0">
                <div className="p-2 min-w-[200px]">
                  <strong className={`block text-base ${isPharmacy ? 'text-green-600' : 'text-[#00A7CB]'}`}>{facility.name}</strong>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mt-1 mb-3">
                    {lang === 'en' ? (facility.type === 'farmacia' ? 'pharmacy' : 'laboratory/hospital') : facility.type}
                  </span>
                  
                  <button 
                    onClick={() => !isSaved && handleSaveLocation(facility)} disabled={isSaved || savingId === facility.id}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-2 px-3 rounded-lg text-xs transition-colors border ${isSaved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 hover:bg-blue-100 text-primary border-blue-100 disabled:opacity-70'}`}
                  >
                    {savingId === facility.id ? <><Loader2 size={14} className="animate-spin" /> {t.saving}</> : 
                     isSaved ? <><BookmarkCheck size={14} /> {t.saved}</> : <><BookmarkPlus size={14} /> {t.saveBtn}</>}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}