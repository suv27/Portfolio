import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { ThreatSimulator } from '../../src/features/threat-simulator/ThreatSimulator.js';

describe('ThreatSimulator', () => {
  let simulator: ThreatSimulator;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'threat-simulator';
    document.body.appendChild(container);
    simulator = new ThreatSimulator('threat-simulator');
  });

  afterEach(() => {
    if (simulator) {
      simulator.cleanup();
    }
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => simulator.initialize()).not.toThrow();
    });

    it('should render simulator with default nodes', () => {
      simulator.initialize();
      const nodeStatuses = simulator.getNodeStatuses();
      expect(nodeStatuses).toHaveProperty('cloudflare');
      expect(nodeStatuses).toHaveProperty('waf');
      expect(nodeStatuses).toHaveProperty('alb');
    });

    it('should throw error if element not found', () => {
      expect(() => {
        const badSimulator = new ThreatSimulator('non-existent');
      }).toThrow();
    });
  });

  describe('activation and deactivation', () => {
    it('should activate simulator', () => {
      simulator.initialize();
      simulator.activate();
      expect(simulator.isFeatureActive()).toBe(true);
    });

    it('should deactivate simulator', () => {
      simulator.initialize();
      simulator.activate();
      simulator.deactivate();
      expect(simulator.isFeatureActive()).toBe(false);
    });
  });

  describe('traffic flow management', () => {
    it('should get traffic flows', () => {
      simulator.initialize();
      const flows = simulator.getTrafficFlows();
      expect(flows.length).toBeGreaterThan(0);
      expect(flows[0]).toHaveProperty('from');
      expect(flows[0]).toHaveProperty('to');
      expect(flows[0]).toHaveProperty('volume');
      expect(flows[0]).toHaveProperty('status');
    });
  });

  describe('node status management', () => {
    it('should get node statuses', () => {
      simulator.initialize();
      const statuses = simulator.getNodeStatuses();
      expect(statuses).toHaveProperty('cloudflare');
      expect(statuses.cloudflare).toBe('active');
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      simulator.initialize();
      simulator.activate();
      expect(() => simulator.cleanup()).not.toThrow();
    });
  });

  describe('safe execution', () => {
    it('should handle errors gracefully', () => {
      simulator.initialize();
      const errorHandler = vi.fn();
      simulator.safeExecute(
        () => {
          throw new Error('Test error');
        },
        errorHandler
      );
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
