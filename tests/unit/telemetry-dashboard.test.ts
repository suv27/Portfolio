import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { TelemetryDashboard } from '../../src/features/telemetry/TelemetryDashboard.js';

describe('TelemetryDashboard', () => {
  let dashboard: TelemetryDashboard;
  let container: HTMLElement;

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'telemetry-dashboard';
    document.body.appendChild(container);
    dashboard = new TelemetryDashboard('telemetry-dashboard');
  });

  afterEach(() => {
    if (dashboard) {
      dashboard.cleanup();
    }
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => dashboard.initialize()).not.toThrow();
    });

    it('should render dashboard with default metrics', () => {
      dashboard.initialize();
      const metrics = dashboard.getCurrentMetrics();
      expect(metrics).toHaveProperty('alertNoise');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('assets');
      expect(metrics).toHaveProperty('mttr');
    });

    it('should throw error if element not found', () => {
      expect(() => {
        const badDashboard = new TelemetryDashboard('non-existent');
      }).toThrow();
    });
  });

  describe('activation and deactivation', () => {
    it('should activate dashboard', () => {
      dashboard.initialize();
      dashboard.activate();
      expect(dashboard.isFeatureActive()).toBe(true);
    });

    it('should deactivate dashboard', () => {
      dashboard.initialize();
      dashboard.activate();
      dashboard.deactivate();
      expect(dashboard.isFeatureActive()).toBe(false);
    });
  });

  describe('metric management', () => {
    it('should update metric values', () => {
      dashboard.initialize();
      const metrics = dashboard.getCurrentMetrics();
      expect(metrics).toHaveProperty('alertNoise');
    });

    it('should get metric value', () => {
      dashboard.initialize();
      const metrics = dashboard.getCurrentMetrics();
      expect(metrics).toHaveProperty('uptime');
    });

    it('should return undefined for non-existent metric', () => {
      dashboard.initialize();
      const metrics = dashboard.getCurrentMetrics();
      expect(metrics['non-existent']).toBeUndefined();
    });
  });

  describe('custom metrics configuration', () => {
    it('should set custom metrics configuration', () => {
      const customConfig = [
        {
          key: 'custom1',
          label: 'Custom Metric 1',
          value: 100,
          unit: '%',
          target: 100,
          variance: 1
        }
      ];

      dashboard.initialize();
      dashboard.setMetricsConfig(customConfig);

      const metrics = dashboard.getCurrentMetrics();
      expect(metrics).toHaveProperty('custom1');
      expect(metrics.custom1).toBe(100);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      dashboard.initialize();
      dashboard.activate();
      dashboard.cleanup();

      const metrics = dashboard.getCurrentMetrics();
      expect(Object.keys(metrics).length).toBe(0);
    });
  });

  describe('safe execution', () => {
    it('should handle errors gracefully', () => {
      dashboard.initialize();
      const errorHandler = vi.fn();
      dashboard.safeExecute(
        () => {
          throw new Error('Test error');
        },
        errorHandler
      );
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
