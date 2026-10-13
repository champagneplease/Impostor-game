import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { useGameStore } from '../src/stores/useGameStore';
import { StorageService } from '../src/services/storageService';

describe('Pruebas del Frontend: El Impostor', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      currentView: 'home',
      sharedPlayers: ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'],
    });
  });

  it('debe renderizar la pantalla de inicio con título y las dos modalidades directamente visibles', () => {
    render(<App />);
    const headings = screen.getAllByText(/EL IMPOSTOR/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/Dispositivo compartido/i)).toBeInTheDocument();
    expect(screen.getByText(/Multijugador online/i)).toBeInTheDocument();
  });

  it('debe navegar a la pantalla de configuración del modo compartido al pulsar en su tarjeta', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Dispositivo compartido/i));

    expect(screen.getByText(/Configurar Partida/i)).toBeInTheDocument();
    expect(screen.getByText(/Participantes/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Comenzar Reparto de Roles!/i)).toBeInTheDocument();
  });

  it('debe navegar a la pantalla de categorías y listar las categorías', () => {
    render(<App />);
    // Botón de categorías en la grilla rápida
    const catCards = screen.getAllByText(/^Categorías$/i);
    fireEvent.click(catCards[0]!);

    expect(screen.getByText(/Categorías y Palabras/i)).toBeInTheDocument();
    expect(screen.getByText(/Fútbol/i)).toBeInTheDocument();
    expect(screen.getByText(/Películas/i)).toBeInTheDocument();
  });

  it('debe navegar a la pantalla de estadísticas', () => {
    render(<App />);
    const statsCards = screen.getAllByText(/^Estadísticas$/i);
    fireEvent.click(statsCards[0]!);

    expect(screen.getByText(/Récords y Clasificación/i)).toBeInTheDocument();
    expect(screen.getByText(/Partidas Jugadas/i)).toBeInTheDocument();
  });

  it('debe navegar al manual de reglas oficial', () => {
    render(<App />);
    const rulesCards = screen.getAllByText(/^Reglas$/i);
    fireEvent.click(rulesCards[0]!);

    expect(screen.getByText(/Reglas del Impostor/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Objetivo del Juego/i)).toBeInTheDocument();
    expect(screen.getByText(/4. Votaciones y Empates/i)).toBeInTheDocument();
  });

  it('debe persistir preferencias en localStorage', () => {
    StorageService.updatePreferences({ soundEnabled: false });
    const loaded = StorageService.load();
    expect(loaded.preferences.soundEnabled).toBe(false);

    StorageService.updatePreferences({ soundEnabled: true });
    expect(StorageService.load().preferences.soundEnabled).toBe(true);
  });

  it('debe permitir cambiar el modo de votación entre en grupo e individual', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Dispositivo compartido/i));

    expect(screen.getByText(/Votación en grupo \(Rápida\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Individual \(Por turnos\)/i)).toBeInTheDocument();

    const indBtn = screen.getByText(/Individual \(Por turnos\)/i);
    fireEvent.click(indBtn);

    expect(useGameStore.getState().sharedSettings.votingMode).toBe('individual');
  });
});
