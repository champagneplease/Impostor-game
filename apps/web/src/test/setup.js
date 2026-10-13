import '@testing-library/jest-dom';
// Polyfills para entorno JSDOM
if (typeof window !== 'undefined') {
    // Mock para HTMLMediaElement / AudioContext
    window.AudioContext = class {
        state = 'running';
        currentTime = 0;
        createOscillator() {
            return {
                type: 'sine',
                frequency: {
                    setValueAtTime: () => { },
                    exponentialRampToValueAtTime: () => { },
                    linearRampToValueAtTime: () => { },
                },
                connect: () => { },
                start: () => { },
                stop: () => { },
            };
        }
        createGain() {
            return {
                gain: {
                    setValueAtTime: () => { },
                    exponentialRampToValueAtTime: () => { },
                },
                connect: () => { },
            };
        }
        destination = {};
        resume() {
            return Promise.resolve();
        }
    };
}
