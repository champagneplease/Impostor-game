import React from 'react';
import {
  ArrowLeft,
  Shield,
  Skull,
  Vote,
  Smartphone,
  Wifi,
  HelpCircle,
  KeyRound,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useGameStore } from '../../stores/useGameStore';

export const RulesScreen: React.FC = () => {
  const { setView } = useGameStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
          Manual Oficial
        </span>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Reglas de El Yilpostor</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Guía completa de mecánicas, roles, votaciones y condiciones de victoria.
        </p>
      </div>

      {/* 1. Objetivo General */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-red-500">
          <Shield className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">1. Objetivo del Juego</h2>
        </div>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          En cada ronda, se selecciona una <strong>categoría</strong> y una{' '}
          <strong>palabra secreta</strong> al azar. Todos los participantes reciben la palabra en
          secreto, salvo uno o más jugadores elegidos como <strong>Impostores</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl">
            <strong className="text-white block mb-1">Equipo Inocente:</strong>
            Dar pistas sutiles para reconocerse entre sí e identificar al impostor en la votación.
          </div>
          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl">
            <strong className="text-red-400 block mb-1">Equipo Impostor:</strong>
            Engañar a los demás fingiendo saber la palabra y deducirla escuchando las pistas ajenas.
          </div>
        </div>
      </Card>

      {/* 2. Modalidades de Juego */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-red-400">
          <Smartphone className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">2. Modalidades de Juego</h2>
        </div>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div>
            <strong className="text-white block">Modo Dispositivo Compartido:</strong>
            Se juega desde un único celular, tablet o computadora por turnos. La aplicación cuenta con
            cortinas visuales para que cada uno vea su rol en privado y luego pase el dispositivo.
            Funciona <strong>100% offline</strong> sin necesidad de conexión a internet.
          </div>
          <div>
            <strong className="text-white block">Modo Multijugador Online:</strong>
            Cada participante se une desde su propio navegador utilizando un código de sala o enlace
            compartido. El servidor en Render sincroniza las fases y entrega los roles de forma privada
            y segura en tiempo real.
          </div>
        </div>
      </Card>

      {/* 3. Pistas del Impostor */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-amber-400">
          <HelpCircle className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">3. Modo de Pistas</h2>
        </div>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>Con pista (1 sola palabra):</strong> El impostor recibe una pista de exactamente 
            <strong> una sola palabra</strong> vinculada a la palabra secreta (por ejemplo: si la palabra es <em>Travis Scott</em>, recibe «Trap»; si es <em>Lionel Messi</em>, recibe «Zurdo»). Le ayuda a integrarse sin revelar directamente la respuesta.
          </p>
          <p>
            <strong>Sin pista (Modo experto):</strong> El impostor solo sabe que es el impostor y la
            categoría temática. Deberá improvisar con máxima audacia.
          </p>
        </div>
      </Card>

      {/* 4. Votación y Empates */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-sky-400">
          <Scale className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">4. Votaciones y Empates</h2>
        </div>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Al finalizar el debate, cada jugador emite un único voto secreto contra su principal
            sospechoso. Nadie puede ver los votos ajenos hasta el cierre.
          </p>
          <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl space-y-1.5">
            <strong className="text-amber-300 block">Resolución de Empates:</strong>
            <p>1. Si hay un jugador con mayoría estricta de votos, es el acusado.</p>
            <p>
              2. Si hay empate entre los más votados, se realiza una segunda votación de desempate
              únicamente entre los candidatos empatados.
            </p>
            <p>
              3. Si la segunda votación también termina en empate, no se expulsa a nadie y{' '}
              <strong>el equipo impostor gana automáticamente</strong> por falta de consenso.
            </p>
          </div>
        </div>
      </Card>

      {/* 5. Última Oportunidad */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-purple-400">
          <KeyRound className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">5. La Última Oportunidad</h2>
        </div>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          Si la mayoría descubre y expulsa al impostor, este tiene una última oportunidad de oro:
        </p>
        <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
          <p>
            • Dispone de un único intento para adivinar la palabra secreta exacta.
          </p>
          <p>
            • Si la acierta, <strong>el equipo impostor roba la victoria</strong>.
          </p>
          <p>
            • Si falla o no sabe qué decir, <strong>el equipo inocente se corona ganador</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
};
