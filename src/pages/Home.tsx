import { Link } from 'react-router-dom';
import { Compass, Pill, FlaskConical, Check } from 'lucide-react';
import logo from '../assets/logo.png'; // Atualizado para a nova logo

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-inter text-gray-800">
      
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={logo} alt="LocaPharma Logo" className="w-8 h-8 object-contain" />
          <span className="font-montserrat font-bold text-xl text-primary">
            LocaPharma WebGIS
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link to="/" className="text-primary border-b-2 border-primary pb-1">Home</Link>
        </nav>
        <div>
          <Link 
            to="/login" 
            className="bg-primary hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
          >
            Login
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex flex-col lg:flex-row items-center justify-between mt-12 lg:mt-24 px-8 max-w-7xl mx-auto gap-12">
        {/* Text Content */}
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Compass size={14} />
            GIS Healthcare Intelligence
          </div>
          
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-gray-900 leading-tight mb-6">
            Saúde ao seu alcance: encontre <span className="text-primary">farmácias</span> e <span className="text-secondary">laboratórios</span> em tempo real.
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
            Plataforma GIS de alta precisão para logística hospitalar. Localize recursos médicos críticos próximos a centros de saúde com velocidade e confiabilidade clínica.
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/map" 
              className="flex items-center gap-2 bg-primary hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium shadow-md shadow-blue-200 transition-all"
            >
              <Compass size={20} />
              Explorar Mapa
            </Link>
            <button className="px-8 py-3 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all">
              Saiba Mais
            </button>
          </div>
        </div>

        {/* Hero Visual Card (Mockup representation) */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-gray-800">Rede Integrada</span>
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Check size={14} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <Pill className="text-primary mb-2" size={20} />
                <div className="font-bold text-xl text-gray-900">24/7</div>
                <div className="text-xs text-gray-500">Farmácias Abertas</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <FlaskConical className="text-secondary mb-2" size={20} />
                <div className="font-bold text-xl text-gray-900">15m</div>
                <div className="text-xs text-gray-500">Laboratórios Próximos</div>
              </div>
            </div>
            <div className="bg-blue-50/50 h-32 rounded-xl border border-blue-100 flex items-center justify-center overflow-hidden relative">
                {/* Repesentação simplificada do mapa no card */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <Compass className="text-primary mb-1" size={24} />
                    <span className="text-sm font-semibold text-primary">Hospital Central</span>
                    <span className="text-xs text-gray-500">Raio de 2km</span>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-8 mt-32 mb-24">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl text-gray-900 mb-4">
            Precisão Geográfica para Saúde
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Soluções especializadas para cidadãos em busca de acesso rápido e profissionais de saúde gerenciando logística crítica.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Cidadão */}
          <div className="bg-white p-10 rounded-2xl border border-gray-200 hover:border-primary/30 transition-colors shadow-sm">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-6">
              <Pill size={24} />
            </div>
            <h3 className="font-montserrat font-bold text-2xl text-gray-900 mb-4">Para Cidadãos</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Encontre medicamentos vitais com agilidade. Mapeie as farmácias mais próximas aos hospitais e verifique a disponibilidade em tempo real para evitar deslocamentos desnecessários.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <Check size={16} className="text-primary" /> Roteamento de emergência
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <Check size={16} className="text-primary" /> Status de funcionamento (24h)
              </li>
            </ul>
          </div>

          {/* Card Profissional */}
          <div className="bg-white p-10 rounded-2xl border border-gray-200 hover:border-secondary/30 transition-colors shadow-sm">
            <div className="bg-teal-50 w-12 h-12 rounded-lg flex items-center justify-center text-secondary mb-6">
              <FlaskConical size={24} />
            </div>
            <h3 className="font-montserrat font-bold text-2xl text-gray-900 mb-4">Para Profissionais de Saúde</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Otimize o encaminhamento de pacientes. Localize laboratórios de diagnóstico com base em especialidades e tempo de resposta, integrando os dados ao fluxo hospitalar.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <Check size={16} className="text-secondary" /> Filtros por especialidade
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <Check size={16} className="text-secondary" /> Integração de logística
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-neutral py-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LocaPharma Logo" className="w-6 h-6 grayscale opacity-60" />
            <span className="font-montserrat font-bold text-lg text-primary">
              LocaPharma WebGIS
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 LocaPharma WebGIS platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}