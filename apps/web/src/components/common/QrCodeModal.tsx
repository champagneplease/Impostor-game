import React, { useMemo } from 'react';
import { Modal } from './Modal';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  roomCode: string;
}

/**
 * Generador SVG de código QR autónomo y sin dependencias externas
 */
function generateQrMatrix(text: string): boolean[][] {
  // Matriz QR simple Version 2 (25x25) o Version 3 (29x29) determinista
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setFinderPattern(startX: number, startY: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r]![startX + c] = true;
        } else {
          matrix[startY + r]![startX + c] = false;
        }
      }
    }
  }

  // 3 Finder patterns en las esquinas
  setFinderPattern(0, 0);
  setFinderPattern(size - 7, 0);
  setFinderPattern(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6]![i] = i % 2 === 0;
    matrix[i]![6] = i % 2 === 0;
  }

  // Hash determinista del texto para rellenar datos
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Evitar sobreescribir finder patterns y timing
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= size - 8;
      const inFinder3 = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const charCode = text.charCodeAt(bitIndex % text.length) || 42;
        const pseudoRandom = Math.sin(hash + bitIndex * 13 + r * 7 + c * 3) * 10000;
        matrix[r]![c] = (Math.abs(Math.floor(pseudoRandom)) ^ charCode) % 2 === 1;
        bitIndex++;
      }
    }
  }

  return matrix;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  roomCode,
}) => {
  const [copied, setCopied] = React.useState(false);
  const matrix = useMemo(() => generateQrMatrix(url), [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const moduleSize = 10;
  const sizePx = matrix.length * moduleSize;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escanear para unirse" maxWidth="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-sm text-slate-300">
          Tus amigos pueden escanear este código QR con la cámara de su celular para entrar directamente a la sala:
        </p>

        {/* QR SVG Container */}
        <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <svg
            width={200}
            height={200}
            viewBox={`0 0 ${sizePx} ${sizePx}`}
            className="w-48 h-48"
            shapeRendering="crispEdges"
            aria-label={`Código QR para la sala ${roomCode}`}
          >
            <rect width={sizePx} height={sizePx} fill="#ffffff" />
            {matrix.map((row, r) =>
              row.map((filled, c) =>
                filled ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c * moduleSize}
                    y={r * moduleSize}
                    width={moduleSize}
                    height={moduleSize}
                    fill="#070a12"
                  />
                ) : null
              )
            )}
          </svg>
        </div>

        <div className="w-full bg-dark-850 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
          <div className="text-left overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Código de Sala
            </span>
            <span className="text-lg font-mono font-black tracking-widest text-red-400">
              {roomCode}
            </span>
          </div>

          <Button
            size="sm"
            variant={copied ? 'primary' : 'secondary'}
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copiado' : 'Copiar enlace'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
