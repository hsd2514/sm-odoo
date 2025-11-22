import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layout, TrendingUp, ShieldCheck, Package, Users, Bell } from 'lucide-react';

const Landing = () => {
  return (
    <>
      {/* Theme Styles */}
      <style>{`
        :root {
          --color-primary: #4f46e5;
          --color-secondary: #0f172a;
          --color-bg-main: #f0f4f8;
          --color-border: #0f172a;
          --shadow-hard: 4px 4px 0px 0px #0f172a;
          --radius-base: 0.75rem;
        }

        body {
          background-color: var(--color-bg-main);
          color: var(--color-secondary);
          font-family: 'Inter', sans-serif;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .btn-primary {
          background-color: var(--color-primary);
          color: white;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-base);
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          box-shadow: 2px 2px 0px 0px #0f172a;
          transition: all 0.15s ease;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary:hover {
          transform: translate(-2px, -2px);
          box-shadow: var(--shadow-hard);
        }
      `}</style>

      <div className="min-h-screen flex flex-col overflow-x-hidden">
        
        {/* Navigation */}
        <nav className="sticky top-0 z-50 pt-4 px-4">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between bg-white/90 backdrop-blur border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#0f172a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 border-2 border-slate-900 rounded-lg flex items-center justify-center text-white">
                <Package size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">StockMaster</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wide px-4 hidden sm:block">
                Log in
              </Link>
              <Link to="/signup">
                <button className="btn-primary">Get Access</button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow">
          <section className="pt-20 pb-32 px-4">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              {/* Hero Text */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 border-2 border-slate-900 rounded-lg text-indigo-900 text-xs font-bold uppercase tracking-wider mb-8 shadow-[2px_2px_0px_0px_#0f172a]">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                  System v2.0 Live
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[0.95] tracking-tight">
                  CONTROL <br />
                  <span className="text-indigo-600">EVERYTHING.</span>
                </h1>
                <p className="text-lg text-slate-600 font-bold max-w-lg mb-10 leading-relaxed">
                  The inventory platform for professionals. Precision tracking, tactile design, and zero latency.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <button className="btn-primary w-full sm:w-auto h-14 text-lg bg-slate-900 border-slate-900 text-white hover:bg-slate-800">
                      Start Now <ArrowRight size={20} />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative">
                <div className="bg-white border-2 border-slate-900 rounded-xl p-6 relative z-20 shadow-[8px_8px_0px_0px_#0f172a] rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-slate-900 flex items-center justify-center">
                        <Layout size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Warehouse A</div>
                        <div className="font-black text-slate-900">Main Dashboard</div>
                      </div>
                    </div>
                    <Bell size={20} className="text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-indigo-50 border-2 border-indigo-100 rounded-lg p-4">
                      <div className="text-indigo-600 font-bold text-xs uppercase mb-1">Stock</div>
                      <div className="text-3xl font-black text-slate-900">24k</div>
                    </div>
                    <div className="bg-slate-50 border-2 border-slate-100 rounded-lg p-4">
                      <div className="text-slate-600 font-bold text-xs uppercase mb-1">Flow</div>
                      <div className="text-3xl font-black text-slate-900">85%</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-2 border-slate-100 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white border-2 border-slate-200 rounded flex items-center justify-center font-bold text-xs">0{i}</div>
                           <span className="font-bold text-sm text-slate-700">Product_Sku_{i}</span>
                         </div>
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 border-y-2 border-slate-900 bg-white">
             <div className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase">Built for Scale</h2>
                  <div className="h-2 w-24 bg-indigo-600 mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { icon: TrendingUp, title: "Real-Time Sync", desc: "Websocket updates across all devices." },
                    { icon: ShieldCheck, title: "Secure Core", desc: "Enterprise grade encryption for data." },
                    { icon: Users, title: "Team Roles", desc: "Granular permission controls." }
                  ].map((feature, i) => (
                    <div key={i} className="bg-white p-8 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#0f172a] transition-all">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-lg border-2 border-slate-900 flex items-center justify-center mb-6">
                        <feature.icon size={24} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-3 uppercase">{feature.title}</h3>
                      <p className="text-slate-600 font-bold text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          </section>

          {/* --- THE ORANGE CTA SECTION YOU LOVED --- */}
          <section className="py-24 bg-orange-500 border-b-2 border-slate-900 relative overflow-hidden">
            
            {/* Cool stripe pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <div className="bg-white border-4 border-black p-12 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                
                <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-slate-900 leading-none">
                  Ready to <br />
                  Take Control?
                </h2>
                
                <p className="text-xl font-bold text-slate-600 mb-10 max-w-xl mx-auto">
                  Join high-growth brands managing inventory without the headache.
                </p>
                
                <Link to="/signup">
                  <button className="bg-black hover:bg-slate-800 text-white border-2 border-black h-16 px-12 text-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] hover:-translate-y-1 transition-all">
                    Get Access Now
                  </button>
                </Link>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-slate-900">
                <Package size={18} />
              </div>
              <span className="font-black text-lg uppercase tracking-tight">StockMaster</span>
            </div>
            <div className="text-slate-400 text-sm font-bold">
              © 2025 StockMaster Inc.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Landing;