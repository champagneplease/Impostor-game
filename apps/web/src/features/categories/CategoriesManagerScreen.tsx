import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  HelpCircle,
  FileJson,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useGameStore } from '../../stores/useGameStore';
import { StorageService } from '../../services/storageService';
import { CategoryItem, WordItem, INITIAL_CATEGORIES, INITIAL_WORDS } from '@impostor/shared';

export const CategoriesManagerScreen: React.FC = () => {
  const { setView } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  // Modales
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [targetCatIdForWord, setTargetCatIdForWord] = useState<string>('');
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);

  // Estado de inputs para nueva categoría
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Estado de inputs para nueva palabra
  const [newWordText, setNewWordText] = useState('');
  const [newWordDiff, setNewWordDiff] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newWordHint, setNewWordHint] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const storage = StorageService.load();
  const allCategories = [...INITIAL_CATEGORIES, ...storage.customCategories];
  const allWords = [...INITIAL_WORDS, ...storage.customWords];

  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Crear Categoría
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = `custom_cat_${Date.now()}`;
    const newCategory: CategoryItem = {
      id: newId,
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      icon: 'Folder',
      isCustom: true,
      enabled: true,
    };

    const current = StorageService.load();
    current.customCategories.push(newCategory);
    StorageService.save(current);

    setNewCatName('');
    setNewCatDesc('');
    setIsAddCatModalOpen(false);
    showNotification('success', `Categoría «${newCategory.name}» creada correctamente.`);
  };

  // Crear Palabra
  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordText.trim() || !targetCatIdForWord) return;

    const singleWordHint = newWordHint.trim() ? newWordHint.trim().split(/\s+/)[0] : undefined;

    const newWord: WordItem = {
      id: `custom_w_${Date.now()}`,
      categoryId: targetCatIdForWord,
      text: newWordText.trim(),
      difficulty: newWordDiff,
      impostorHint: singleWordHint,
      tags: ['personalizada'],
      enabled: true,
    };

    const current = StorageService.load();
    current.customWords.push(newWord);
    StorageService.save(current);

    setNewWordText('');
    setNewWordHint('');
    setIsAddWordModalOpen(false);
    showNotification('success', `Palabra «${newWord.text}» agregada a la categoría.`);
  };

  // Eliminar Categoría Personalizada
  const handleDeleteCategory = (catId: string, catName: string) => {
    if (!confirm(`¿Eliminar la categoría «${catName}» y todas sus palabras personalizadas?`)) return;

    const current = StorageService.load();
    current.customCategories = current.customCategories.filter((c) => c.id !== catId);
    current.customWords = current.customWords.filter((w) => w.categoryId !== catId);
    StorageService.save(current);

    showNotification('success', `Categoría «${catName}» eliminada.`);
  };

  // Eliminar Palabra Personalizada
  const handleDeleteWord = (wordId: string, wordText: string) => {
    const current = StorageService.load();
    current.customWords = current.customWords.filter((w) => w.id !== wordId);
    StorageService.save(current);

    showNotification('success', `Palabra «${wordText}» eliminada.`);
  };

  // Exportar JSON
  const handleExportJson = () => {
    const jsonStr = StorageService.exportCategories();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impostor-categorias-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Archivo JSON exportado correctamente.');
  };

  // Importar JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importCategories(content);
      if (res.success) {
        showNotification('success', `Se importaron las categorías personalizadas con éxito.`);
      } else {
        showNotification('error', res.error || 'Error al importar.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Restaurar por defecto
  const handleResetDefaults = () => {
    StorageService.resetToDefaultCategories();
    setIsResetConfirmModalOpen(false);
    showNotification('success', 'Se restablecieron las categorías predeterminadas.');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fadeIn">
      {/* Barra de Encabezado */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
          Administrador de Contenido
        </span>
      </div>

      {/* Título y Acciones Globales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Categorías y Palabras</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Explora las 24 categorías oficiales o crea tus propios paquetes para jugar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddCatModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Nueva Categoría
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportJson}
            title="Exportar JSON"
            icon={<Download className="w-4 h-4" />}
          >
            Exportar
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <div className="inline-flex items-center justify-center font-bold text-xs px-3.5 py-2 gap-1.5 min-h-[36px] rounded-2xl bg-dark-800 hover:bg-dark-700 text-slate-100 border border-slate-700/60 shadow-sm transition-all active:scale-95">
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </div>
          </label>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsResetConfirmModalOpen(true)}
            title="Restaurar por defecto"
            icon={<RotateCcw className="w-4 h-4 text-red-400" />}
          >
            Restaurar
          </Button>
        </div>
      </div>

      {/* Notificación Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-red-500/10 border-red-500/40 text-red-300'
              : 'bg-red-950/60 border-red-500/50 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4 text-red-400" />
          ) : (
            <HelpCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar categorías por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Lista Acordeón de Categorías */}
      <div className="flex flex-col gap-3">
        {filteredCategories.map((category) => {
          const catWords = allWords.filter((w) => w.categoryId === category.id);
          const isExpanded = expandedCatId === category.id;

          return (
            <Card key={category.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedCatId(isExpanded ? null : category.id)}
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-center text-red-400">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{category.name}</span>
                      {category.isCustom && (
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          Personalizada
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {catWords.length} palabras registradas
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTargetCatIdForWord(category.id);
                      setIsAddWordModalOpen(true);
                    }}
                    title="Añadir palabra a esta categoría"
                    icon={<Plus className="w-4 h-4 text-red-400" />}
                  >
                    Palabra
                  </Button>

                  {category.isCustom && (
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setExpandedCatId(isExpanded ? null : category.id)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contenido Desplegable: Palabras de la categoría */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {catWords.map((word) => (
                      <div
                        key={word.id}
                        className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col overflow-hidden pr-1">
                          <span className="font-bold text-slate-200 truncate">{word.text}</span>
                          {word.impostorHint && (
                            <span className="text-[10px] text-slate-400 truncate">
                              Pista: {word.impostorHint}
                            </span>
                          )}
                        </div>

                        {word.id.startsWith('custom_w_') && (
                          <button
                            onClick={() => handleDeleteWord(word.id, word.text)}
                            className="text-slate-500 hover:text-red-400 transition-colors shrink-0 p-1"
                            title="Eliminar palabra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal: Crear Categoría */}
      <Modal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        title="Crear Nueva Categoría"
      >
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              placeholder="Ej: Series Argentinas"
              value={newCatName}
              maxLength={50}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Descripción (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Producciones icónicas de la televisión nacional"
              value={newCatDesc}
              maxLength={150}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <Button size="lg" type="submit" className="w-full mt-2">
            Guardar Categoría
          </Button>
        </form>
      </Modal>

      {/* Modal: Agregar Palabra */}
      <Modal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        title="Agregar Palabra a Categoría"
      >
        <form onSubmit={handleCreateWord} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Palabra o Frase</label>
            <input
              type="text"
              placeholder="Ej: Los Simuladores"
              value={newWordText}
              maxLength={100}
              onChange={(e) => setNewWordText(e.target.value)}
              required
              className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Pista para el Impostor (1 sola palabra, opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Felino, Mago, Rescate..."
              value={newWordHint}
              maxLength={50}
              onChange={(e) => setNewWordHint(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Dificultad</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  type="button"
                  key={diff}
                  onClick={() => setNewWordDiff(diff)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    newWordDiff === diff
                      ? 'bg-red-600 text-white border-red-500 font-black'
                      : 'bg-dark-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Normal' : 'Difícil'}
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" type="submit" className="w-full mt-2">
            Guardar Palabra
          </Button>
        </form>
      </Modal>

      {/* Modal: Confirmación de Restaurar Predeterminados */}
      <Modal
        isOpen={isResetConfirmModalOpen}
        onClose={() => setIsResetConfirmModalOpen(false)}
        title="Confirmar Restablecimiento"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs text-slate-300 leading-relaxed">
            ¿Estás seguro de que deseas eliminar todas las categorías y palabras personalizadas y
            restaurar el banco de fábrica?
          </p>

          <div className="flex gap-2">
            <Button
              size="md"
              variant="danger"
              className="flex-1"
              onClick={handleResetDefaults}
            >
              Sí, Restablecer
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
