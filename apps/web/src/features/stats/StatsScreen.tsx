import React, { useState } from 'react';
import {
  BarChart3,
  Trophy,
  Skull,
  Shield,
  Flame,
  RotateCcw,
  History,
  ArrowLeft,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useGameStore } from '../../stores/useGameStore';
import { StorageService } from '../../services/storageService';

export const StatsScreen: React.FC = () => {
  const { setView } = useGameStore();
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history'>('leaderboard');

  const storage = StorageService.load();
  const { stats, history } = storage;

  const totalGames = stats.gamesPlayed;
  const normalWins = stats.normalWins;
  const impostorWins = stats.impostorWins;
  const impostorWinRate =
    totalGames > 0 ? Math.round((impostorWins / totalGames) * 100) : 0;
  const normalWinRate =
    totalGames > 0 ? Math.round((normalWins / totalGames) * 100) : 0;

  const playerRecords = Object.values(stats.players).sort(
    (a, b) => b.gamesPlayed - a.gamesPlayed || b.impostorWins - a.impostorWins
  );

  const handleClearStats = () => {
    StorageService.clearStats();
    setIsResetConfirmModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
          Estadísticas Locales
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Récords y Clasificación</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Historial de victorias, impostores y desempeño de tus amigos en este dispositivo.
          </p>
        </div>

        {totalGames > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsResetConfirmModalOpen(true)}
            icon={<RotateCcw className="w-4 h-4 text-red-400" />}
          >
            Reiniciar Estadísticas
          </Button>
        )}
      </div>

      {/* Métricas Globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Partidas Jugadas
          </span>
          <span className="text-3xl font-black text-white">{totalGames}</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] uppercase font-bold text-lime-400 tracking-wider">
            Victorias Ciudadanas
          </span>
          <span className="text-3xl font-black text-lime-400">{normalWins}</span>
          <span className="text-[10px] text-slate-400">{normalWinRate}% del total</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
            Victorias Impostor
          </span>
          <span className="text-3xl font-black text-red-400">{impostorWins}</span>
          <span className="text-[10px] text-slate-400">{impostorWinRate}% del total</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            Jugadores Únicos
          </span>
          <span className="text-3xl font-black text-amber-400">{playerRecords.length}</span>
        </Card>
      </div>

      {/* Tabs: Ranking vs Historial */}
      <div className="grid grid-cols-2 p-1 bg-dark-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-lime-500 text-dark-950 shadow-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clasificación por Jugador</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-lime-500 text-dark-950 shadow-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Partidas</span>
        </button>
      </div>

      {/* Tab 1: Tabla de Jugadores */}
      {activeTab === 'leaderboard' && (
        <Card className="p-0 overflow-hidden">
          {playerRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aún no hay estadísticas guardadas. ¡Juega una partida para empezar el ranking!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Jugador</th>
                    <th className="py-3.5 px-3 text-center">Partidas</th>
                    <th className="py-3.5 px-3 text-center">Impostor</th>
                    <th className="py-3.5 px-3 text-center">Victorias Imp.</th>
                    <th className="py-3.5 px-3 text-center">Atrapado</th>
                    <th className="py-3.5 px-3 text-center">Votos Recibidos</th>
                    <th className="py-3.5 px-3 text-center">Racha Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {playerRecords.map((p, idx) => (
                    <tr key={p.name} className="hover:bg-dark-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-300">
                        {p.gamesPlayed}
                      </td>
                      <td className="py-3.5 px-3 text-center text-red-400 font-bold">
                        {p.timesImpostor}
                      </td>
                      <td className="py-3.5 px-3 text-center text-lime-400 font-bold">
                        {p.impostorWins}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{p.timesCaught}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{p.votesReceived}</td>
                      <td className="py-3.5 px-3 text-center text-amber-400 font-bold">
                        {p.bestStreak}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Historial de Partidas */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-3">
          {history.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No hay partidas registradas en el historial todavía.
            </Card>
          ) : (
            history.map((game) => {
              const wonNormals = game.winner === 'normals';
              const dateStr = new Date(game.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Card
                  key={game.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        wonNormals
                          ? 'bg-lime-500/20 text-lime-400 border border-lime-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {wonNormals ? <Shield className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">«{game.secretWord}»</span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          ({game.categoryName})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Impostor: <strong className="text-red-300">{game.impostorNames.join(', ')}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <span
                      className={`font-black uppercase tracking-wide text-[11px] ${
                        wonNormals ? 'text-lime-400' : 'text-red-400'
                      }`}
                    >
                      {wonNormals ? 'Ganaron Inocentes' : 'Ganó Impostor'}
                    </span>
                    <span className="text-[10px] text-slate-500">{dateStr}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Confirmar Reinicio de Estadísticas */}
      <Modal
        isOpen={isResetConfirmModalOpen}
        onClose={() => setIsResetConfirmModalOpen(false)}
        title="Reiniciar Estadísticas"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs text-slate-300 leading-relaxed">
            ¿Deseas borrar todo el historial y las estadísticas registradas en este dispositivo?
            Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-2">
            <Button
              size="md"
              variant="danger"
              className="flex-1"
              onClick={handleClearStats}
            >
              Sí, Borrar Todo
            </Button>
            <Button
              size="md"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsResetConfirmModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
