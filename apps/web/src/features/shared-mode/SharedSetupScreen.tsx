import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Shuffle,
  Target,
  ArrowLeft,
  Sparkles,
  Check,
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

    // Ajustar impostores si supera el límite
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
      // Dejar la primera por defecto
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
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
          Dispositivo compartido
        </span>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Configurar Partida</h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Añade a tus amigos y personaliza las reglas antes de repartir los roles.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs font-bold text-red-200">
          {errorMessage}
        </div>
      )}

      {/* 1. Lista de Jugadores */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-lime-400" />
            <h2 className="text-base font-bold text-white">
              Participantes ({sharedPlayers.length})
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Mínimo: 3 (Recomendado: 4+)</span>
        </div>

        {/* Formulario agregar participante */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del jugador..."
            value={newPlayerName}
            maxLength={25}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className="flex-1 bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500"
          />
          <Button onClick={handleAddPlayer} size="md" icon={<Plus className="w-4 h-4" />}>
            Añadir
          </Button>
        </div>

        {/* Chips de jugadores */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sharedPlayers.map((player, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 border border-slate-700/80 text-xs font-semibold text-slate-200"
            >
              <span className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 text-[10px] flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span>{player}</span>
              <button
                onClick={() => handleRemovePlayer(idx)}
                className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                title={`Eliminar a ${player}`}
                aria-label={`Eliminar a ${player}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Cantidad de Impostores y Dificultad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impostores */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Impostores
            </span>
            <span className="text-lg font-black text-lime-400">{sharedSettings.impostorCount}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => {
              const disabled = num >= sharedPlayers.length;
              const isSelected = sharedSettings.impostorCount === num;
              return (
                <button
                  key={num}
                  disabled={disabled}
                  onClick={() => updateSharedSettings({ impostorCount: num })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-lime-500 text-dark-950 border-lime-400 shadow-glow font-black'
                      : disabled
                      ? 'opacity-30 border-slate-800 bg-dark-950 text-slate-600 pointer-events-none'
                      : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'
                  }`}
                >
                  {num} {num === 1 ? 'Impostor' : 'Impostores'}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Dificultad */}
        <Card className="flex flex-col gap-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Dificultad del banco de palabras
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'easy', label: 'Fácil' },
              { id: 'medium', label: 'Normal' },
              { id: 'hard', label: 'Difícil' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => updateSharedSettings({ difficulty: d.id as DifficultyLevel })}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  sharedSettings.difficulty === d.id
                    ? 'bg-lime-500 text-dark-950 border-lime-400 shadow-glow'
                    : 'bg-dark-950 border-slate-800 text-slate-300 hover:bg-dark-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* 3. Selección de Categorías */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <h2 className="text-sm font-bold text-white">
              Categorías Habilitadas ({sharedSettings.selectedCategoryIds.length}/{allCategories.length})
            </h2>
          </div>
          <button
            onClick={toggleSelectAllCategories}
            className="text-xs font-semibold text-lime-400 hover:text-lime-300 underline"
          >
            {sharedSettings.selectedCategoryIds.length === allCategories.length
              ? 'Deseleccionar todas'
              : 'Seleccionar todas'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
          {allCategories.map((cat) => {
            const isSelected = sharedSettings.selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-lime-500/10 border-lime-500/40 text-lime-300 font-bold'
                    : 'bg-dark-950 border-slate-800 text-slate-400 hover:bg-dark-800/80 hover:text-slate-200'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Reglas Configurables */}
      <Card className="flex flex-col gap-4">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Reglas de la partida
        </h2>

        {/* Pista del Impostor */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
          <div>
            <span className="text-sm font-bold text-white block">Pista para el Impostor (1 palabra)</span>
            <span className="text-xs text-slate-400">
              {sharedSettings.enableHints
                ? 'El impostor recibe una pista de 1 sola palabra para orientarse'
                : 'Sin pista: El impostor solo ve su rol'}
            </span>
          </div>
          <button
            onClick={() => updateSharedSettings({ enableHints: !sharedSettings.enableHints })}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              sharedSettings.enableHints ? 'bg-lime-500' : 'bg-slate-700'
            }`}
            aria-label="Alternar pistas del impostor"
          >
            <div
              className={`w-5 h-5 rounded-full bg-dark-950 shadow-md transition-transform ${
                sharedSettings.enableHints ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Última Oportunidad */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
          <div>
            <span className="text-sm font-bold text-white block">Última oportunidad al descubrir</span>
            <span className="text-xs text-slate-400">
              Si descubren al impostor, puede intentar adivinar la palabra exacta para ganar
            </span>
          </div>
          <button
            onClick={() =>
              updateSharedSettings({ allowLastChanceGuess: !sharedSettings.allowLastChanceGuess })
            }
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              sharedSettings.allowLastChanceGuess ? 'bg-lime-500' : 'bg-slate-700'
            }`}
            aria-label="Alternar última oportunidad"
          >
            <div
              className={`w-5 h-5 rounded-full bg-dark-950 shadow-md transition-transform ${
                sharedSettings.allowLastChanceGuess ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Duración del Debate */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
          <div>
            <span className="text-sm font-bold text-white block">Duración del debate</span>
            <span className="text-xs text-slate-400">Tiempo límite de conversación antes de votar</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { sec: 0, label: 'Libre' },
              { sec: 120, label: '2 min' },
              { sec: 180, label: '3 min' },
              { sec: 300, label: '5 min' },
            ].map((t) => (
              <button
                key={t.sec}
                onClick={() => updateSharedSettings({ debateDurationSeconds: t.sec })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  sharedSettings.debateDurationSeconds === t.sec
                    ? 'bg-lime-500 text-dark-950 border-lime-400 shadow-glow'
                    : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Botón Comenzar */}
      <div className="pt-2">
        <Button size="xl" className="w-full text-lg shadow-glow py-5" onClick={handleStart}>
          ¡Comenzar Reparto de Roles!
        </Button>
      </div>
    </div>
  );
};
