import React, { useState } from 'react';
import { Skull, KeyRound, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useGameStore } from '../../stores/useGameStore';

export const SharedLastChanceScreen: React.FC = () => {
  const {
    sharedPlayers,
    sharedLastChanceImpostorId,
    sharedCategory,
    submitSharedLastChanceGuess,
  } = useGameStore();

  const [guessInput, setGuessInput] = useState('');

  const impostorIndex = sharedLastChanceImpostorId
    ? parseInt(sharedLastChanceImpostorId.replace('local_p_', ''), 10)
    : 0;
  const impostorName = sharedPlayers[impostorIndex] || 'Impostor';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    submitSharedLastChanceGuess(guessInput);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh] animate-fadeIn">
      <Card className="w-full flex flex-col items-center text-center p-8 gap-6 shadow-2xl border-red-500/50 bg-red-950/20">
        <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-glow-red">
          <Skull className="w-10 h-10" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
            ¡Impostor Descubierto!
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">{impostorName}</h2>
        </div>

        <div className="p-3 bg-dark-950 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed text-left flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Última oportunidad:</strong> Pásale el dispositivo a{' '}
            <strong className="text-white">{impostorName}</strong>. Si adivina la palabra secreta
            exacta, ¡robará la victoria para el equipo impostor!
          </span>
        </div>

        {sharedCategory && (
          <div className="text-xs text-slate-400">
            Categoría: <span className="text-white font-bold">{sharedCategory.name}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="text"
            placeholder="Escribe la palabra secreta..."
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            autoFocus
            className="w-full bg-dark-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-center font-bold"
          />

          <Button
            size="xl"
            type="submit"
            className="w-full py-4 text-base shadow-glow"
            disabled={!guessInput.trim()}
          >
            Confirmar Adivinanza
          </Button>
        </form>
      </Card>
    </div>
  );
};
