import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyPress(event: KeyboardEvent) {
      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
        }
      });
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [shortcuts, enabled]);
}

export const quizShortcuts: KeyboardShortcut[] = [
  {
    key: 'ArrowRight',
    action: () => {},
    description: 'Next question',
  },
  {
    key: 'ArrowLeft',
    action: () => {},
    description: 'Previous question',
  },
  {
    key: '1',
    action: () => {},
    description: 'Select option A',
  },
  {
    key: '2',
    action: () => {},
    description: 'Select option B',
  },
  {
    key: '3',
    action: () => {},
    description: 'Select option C',
  },
  {
    key: '4',
    action: () => {},
    description: 'Select option D',
  },
  {
    key: 'Enter',
    action: () => {},
    description: 'Submit answer',
  },
  {
    key: 'Escape',
    action: () => {},
    description: 'Pause quiz',
  },
  {
    key: 'h',
    ctrl: true,
    action: () => {},
    description: 'Show help',
  },
];
