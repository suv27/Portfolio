import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { TerminalContact } from '../../src/features/terminal-contact/TerminalContact.js';

describe('TerminalContact', () => {
  let terminal: TerminalContact;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'terminal-contact';
    document.body.appendChild(container);
    terminal = new TerminalContact('terminal-contact');
  });

  afterEach(() => {
    if (terminal) {
      terminal.cleanup();
    }
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => terminal.initialize()).not.toThrow();
    });

    it('should render terminal with default commands', () => {
      terminal.initialize();
      const sessionInfo = terminal.getSessionInfo();
      expect(sessionInfo).toHaveProperty('user');
      expect(sessionInfo).toHaveProperty('currentDirectory');
      expect(sessionInfo).toHaveProperty('isLoggedIn');
    });

    it('should throw error if element not found', () => {
      expect(() => {
        const badTerminal = new TerminalContact('non-existent');
      }).toThrow();
    });
  });

  describe('activation and deactivation', () => {
    it('should activate terminal', () => {
      terminal.initialize();
      terminal.activate();
      expect(terminal.isFeatureActive()).toBe(true);
    });

    it('should deactivate terminal', () => {
      terminal.initialize();
      terminal.activate();
      terminal.deactivate();
      expect(terminal.isFeatureActive()).toBe(false);
    });
  });

  describe('command history', () => {
    it('should get command history', () => {
      terminal.initialize();
      const history = terminal.getCommandHistory();
      expect(history).toBeInstanceOf(Array);
    });

    it('should start with empty history', () => {
      terminal.initialize();
      const history = terminal.getCommandHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('session information', () => {
    it('should get session information', () => {
      terminal.initialize();
      const sessionInfo = terminal.getSessionInfo();
      expect(sessionInfo.user).toBe('guest');
      expect(sessionInfo.currentDirectory).toBe('/home/guest');
      expect(sessionInfo.isLoggedIn).toBe(false);
    });
  });

  describe('custom commands', () => {
    it('should add custom command', () => {
      terminal.initialize();
      const customCommand = {
        name: 'test',
        description: 'Test command',
        handler: () => 'Test output'
      };

      expect(() => terminal.addCommand(customCommand)).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      terminal.initialize();
      terminal.activate();
      expect(() => terminal.cleanup()).not.toThrow();
    });
  });

  describe('safe execution', () => {
    it('should handle errors gracefully', () => {
      terminal.initialize();
      const errorHandler = vi.fn();
      terminal.safeExecute(
        () => {
          throw new Error('Test error');
        },
        errorHandler
      );
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
