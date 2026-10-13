import { StorageService } from './storageService';
class AudioService {
    ctx = null;
    getContext() {
        if (typeof window === 'undefined')
            return null;
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }
        return this.ctx;
    }
    isEnabled() {
        return StorageService.load().preferences.soundEnabled;
    }
    playClick() {
        if (!this.isEnabled())
            return;
        const ctx = this.getContext();
        if (!ctx)
            return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        }
        catch { }
    }
    playReveal() {
        if (!this.isEnabled())
            return;
        const ctx = this.getContext();
        if (!ctx)
            return;
        try {
            const notes = [440, 554, 659, 880];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
                gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.06);
                osc.stop(ctx.currentTime + idx * 0.06 + 0.2);
            });
        }
        catch { }
    }
    playTimerTick() {
        if (!this.isEnabled())
            return;
        const ctx = this.getContext();
        if (!ctx)
            return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.03);
        }
        catch { }
    }
    playVictory() {
        if (!this.isEnabled())
            return;
        const ctx = this.getContext();
        if (!ctx)
            return;
        try {
            const melody = [523.25, 659.25, 783.99, 1046.5];
            melody.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
                gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.1);
                osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
            });
        }
        catch { }
    }
    playError() {
        if (!this.isEnabled())
            return;
        const ctx = this.getContext();
        if (!ctx)
            return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        }
        catch { }
    }
}
export const audioService = new AudioService();
