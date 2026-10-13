import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Check,
  Vote,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';
import { StorageService } from '../../services/storageService';
import { DifficultyLevel, INITIAL_CATEGORIES } from '@impostor/shared';

export const SharedSetupScreen: React.FC = () => {
  const {
    setView,
    sharedPlayers,
    setSharedPlayers,
    sharedSettings,
    updateSharedSettings,
    startSharedGame,
  } = useGameStore();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storage = StorageService.load();
  const allCategories = [...INITIAL_CATEGORIES, ...storage.customCategories];

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    if (sharedPlayers.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage('Ya existe un participante con ese nombre.');
      return;
    }

    if (sharedPlayers.length >= 16) {
      setErrorMessage('El límite máximo es de 16 participantes.');
      return;
    }

    setSharedPlayers([...sharedPlayers, trimmed]);
    setNewPlayerName('');
    setErrorMessage(null);
  };

  const handleRemovePlayer = (index: number) => {
    if (sharedPlayers.length <= 3) {
      setErrorMessage('Se requieren al menos 3 jugadores.');
      return;
    }
    const updated = sharedPlayers.filter((_, idx) => idx !== index);
    setSharedPlayers(updated);

    if (sharedSettings.impostorCount >= updated.length) {
      updateSharedSettings({ impostorCount: Math.max(1, updated.length - 1) });
    }
    setErrorMessage(null);
  };

  const toggleCategory = (catId: string) => {
    const current = sharedSettings.selectedCategoryIds;
    if (current.includes(catId)) {
      if (current.length === 1) {
        setErrorMessage('Debes dejar al menos una categoría seleccionada.');
        return;
      }
      updateSharedSettings({ selectedCategoryIds: current.filter((id) => id !== catId) });
    } else {
      updateSharedSettings({ selectedCategoryIds: [...current, catId] });
    }
    setErrorMessage(null);
  };

  const toggleSelectAllCategories = () => {
    if (sharedSettings.selectedCategoryIds.length === allCategories.length) {
      updateSharedSettings({ selectedCategoryIds: [allCategories[0]!.id] });
    } else {
      updateSharedSettings({ selectedCategoryIds: allCategories.map((c) => c.id) });
    }
  };

  const handleStart = () => {
    if (sharedPlayers.length < 3) {
      setErrorMessage('Se necesitan al menos 3 jugadores para comenzar.');
      return;
    }
    if (sharedSettings.impostorCount >= sharedPlayers.length) {
      setErrorMessage('La cantidad de impostores debe ser menor al número total de jugadores.');
      return;
    }
    if (sharedSettings.selectedCategoryIds.length === 0) {
      setErrorMessage('Selecciona al menos una categoría.');
      return;
    }

    setErrorMessage(null);
    startSharedGame();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <span className="text-[11px] uppercase font-bold tracking-wider text-lime-400">
          Modo compartido
        </span>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Configurar Partida
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Añade participantes y define cómo quieren votar y jugar.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      {/* 1. Participantes */}
      <Card className="flex flex-col gap-4 border-white/[0.08] bg-dark-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-lime-400" />
            <h2 className="text-sm font-bold text-white">
              Jugadores ({sharedPlayers.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">Mínimo 3</span>
        </div>

        {/* Input para agregar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del jugador..."
            value={newPlayerName}
            maxLength={25}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className="flex-1 bg-dark-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500"
          />
          <Button onClick={handleAddPlayer} size="md" icon={<Plus className="w-4 h-4" />}>
            Agregar
          </Button>
        </div>

        {/* Chips de jugadores */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sharedPlayers.map((player, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-850 border border-white/[0.06] text-xs font-medium text-slate-200"
            >
              <span>{player}</span>
              <button
                onClick={() => handleRemovePlayer(idx)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title={`Eliminar a ${player}`}
                aria-label={`Eliminar a ${player}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Modo de Votación (Grupo vs Individual) */}
      <Card className="flex flex-col gap-3 border-white/[0.08] bg-dark-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Modo de Votación
          </span>
          <span className="text-[11px] text-lime-400 font-semibold">
            {sharedSettings.votingMode === 'group' ? 'Rápida en grupo' : 'Secreta por turnos'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Opción 1: En Grupo */}
          <button
            type="button"
            onClick={() => updateSharedSettings({ votingMode: 'group' })}
            className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              sharedSettings.votingMode === 'group'
                ? 'bg-lime-500/10 border-lime-500/50 text-white font-bold'
                : 'bg-dark-950/60 border-white/[0.06] text-slate-400 hover:bg-dark-850'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-lime-400" />
              <span className="text-xs font-bold text-white">Votación en grupo (Rápida)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Hablan en voz alta y eligen juntos al sospechoso sin pasarse el celular.
            </p>
          </button>

          {/* Opción 2: Individual */}
          <button
            type="button"
            onClick={() => updateSharedSettings({ votingMode: 'individual' })}
            className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              sharedSettings.votingMode === 'individual'
                ? 'bg-lime-500/10 border-lime-500/50 text-white font-bold'
                : 'bg-dark-950/60 border-white/[0.06] text-slate-400 hover:bg-dark-850'
            }`}
          >
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Individual (Por turnos)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Cada jugador vota en secreto pasando el celular uno por uno.
            </p>
          </button>
        </div>
      </Card>

      {/* 3. Impostores y Dificultad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Impostores */}
        <Card className="flex flex-col gap-2.5 border-white/[0.08] bg-dark-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Impostores
            </span>
            <span className="text-sm font-bold text-lime-400">{sharedSettings.impostorCount}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((num) => {
              const disabled = num >= sharedPlayers.length;
              const isSelected = sharedSettings.impostorCount === num;
              return (
                <button
                  key={num}
                  disabled={disabled}
                  onClick={() => updateSharedSettings({ impostorCount: num })}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-lime-500 text-dark-950 border-lime-400 font-bold'
                      : disabled
                      ? 'opacity-20 border-white/[0.04] bg-dark-950 text-slate-600 pointer-events-none'
                      : 'bg-dark-950/80 border-white/[0.06] text-slate-300 hover:bg-dark-850'
                  }`}
                >
                  {num} {num === 1 ? 'Impostor' : 'Impostores'}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Dificultad */}
        <Card className="flex flex-col gap-2.5 border-white/[0.08] bg-dark-900/60">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Dificultad
          </span>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'easy', label: 'Fácil' },
              { id: 'medium', label: 'Media' },
              { id: 'hard', label: 'Difícil' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => updateSharedSettings({ difficulty: d.id as DifficultyLevel })}
                className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                  sharedSettings.difficulty === d.id
                    ? 'bg-lime-500 text-dark-950 border-lime-400 font-bold'
                    : 'bg-dark-950/80 border-white/[0.06] text-slate-300 hover:bg-dark-850'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Categorías */}
      <Card className="flex flex-col gap-3 border-white/[0.08] bg-dark-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categorías ({sharedSettings.selectedCategoryIds.length}/{allCategories.length})
            </h2>
          </div>
          <button
            onClick={toggleSelectAllCategories}
            className="text-xs font-medium text-lime-400 hover:underline"
          >
            {sharedSettings.selectedCategoryIds.length === allCategories.length
              ? 'Deseleccionar todas'
              : 'Seleccionar todas'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {allCategories.map((cat) => {
            const isSelected = sharedSettings.selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-2 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-lime-500/10 border-lime-500/30 text-lime-300 font-semibold'
                    : 'bg-dark-950/60 border-white/[0.06] text-slate-400 hover:bg-dark-850'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3 h-3 text-lime-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 5. Reglas adicionales */}
      <Card className="flex flex-col gap-3 border-white/[0.08] bg-dark-900/60">
        {/* Pista del Impostor */}
        <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
          <div>
            <span className="text-xs font-bold text-white block">Pista al impostor (1 palabra)</span>
            <span className="text-[11px] text-slate-400">
              {sharedSettings.enableHints
                ? 'Recibe una pista de 1 sola palabra para orientarse'
                : 'Sin pista: Solo ve que es impostor'}
            </span>
          </div>
          <button
            onClick={() => updateSharedSettings({ enableHints: !sharedSettings.enableHints })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              sharedSettings.enableHints ? 'bg-lime-500' : 'bg-slate-700'
            }`}
            aria-label="Alternar pistas del impostor"
          >
            <div
              className={`w-5 h-5 rounded-full bg-dark-950 shadow transition-transform ${
                sharedSettings.enableHints ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Última Oportunidad */}
        <div className="flex items-center justify-between py-1 border-b border-white/[0.06]">
          <div>
            <span className="text-xs font-bold text-white block">Última oportunidad al descubrir</span>
            <span className="text-[11px] text-slate-400">
              El impostor descubierto puede adivinar la palabra exacta para ganar
            </span>
          </div>
          <button
            onClick={() =>
              updateSharedSettings({ allowLastChanceGuess: !sharedSettings.allowLastChanceGuess })
            }
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              sharedSettings.allowLastChanceGuess ? 'bg-lime-500' : 'bg-slate-700'
            }`}
            aria-label="Alternar última oportunidad"
          >
            <div
              className={`w-5 h-5 rounded-full bg-dark-950 shadow transition-transform ${
                sharedSettings.allowLastChanceGuess ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Duración del Debate */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
          <div>
            <span className="text-xs font-bold text-white block">Tiempo de debate</span>
            <span className="text-[11px] text-slate-400">Tiempo de charla antes de votar</span>
          </div>
          <div className="flex gap-1">
            {[
              { sec: 0, label: 'Libre' },
              { sec: 120, label: '2 min' },
              { sec: 180, label: '3 min' },
            ].map((t) => (
              <button
                key={t.sec}
                onClick={() => updateSharedSettings({ debateDurationSeconds: t.sec })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  sharedSettings.debateDurationSeconds === t.sec
                    ? 'bg-lime-500 text-dark-950 border-lime-400 font-bold'
                    : 'bg-dark-950/80 border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Botón Comenzar */}
      <div className="pt-1">
        <Button size="xl" className="w-full py-4 text-base font-black" onClick={handleStart}>
          ¡Comenzar Reparto de Roles!
        </Button>
      </div>
    </div>
  );
};
