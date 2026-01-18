import { GlassCard } from "@/components/ui/glass-card";
import { BarChart3, Download, Calendar } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Rapports
        </h2>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-primary-500/20">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:border-primary-500/30 transition-all">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Rapport Hebdomadaire
          </h3>
          <p className="text-sm text-slate-400">
            Résumé des heures de la semaine
          </p>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:border-primary-500/30 transition-all">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Rapport Mensuel
          </h3>
          <p className="text-sm text-slate-400">
            Analyse mensuelle par projet
          </p>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:border-primary-500/30 transition-all">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Export Personnalisé
          </h3>
          <p className="text-sm text-slate-400">
            Créer un rapport sur mesure
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
