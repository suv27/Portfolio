import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { SOARWorkflowViewer } from '../../src/features/soar-workflow/SOARWorkflowViewer.js';

describe('SOARWorkflowViewer', () => {
  let viewer: SOARWorkflowViewer;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'soar-workflow-viewer';
    document.body.appendChild(container);
    viewer = new SOARWorkflowViewer('soar-workflow-viewer');
  });

  afterEach(() => {
    if (viewer) {
      viewer.cleanup();
    }
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => viewer.initialize()).not.toThrow();
    });

    it('should render viewer with default workflow', () => {
      viewer.initialize();
      const status = viewer.getWorkflowStatus();
      expect(status).toHaveProperty('workflowId');
      expect(status).toHaveProperty('currentStep');
      expect(status).toHaveProperty('totalSteps');
    });

    it('should throw error if element not found', () => {
      expect(() => {
        const badViewer = new SOARWorkflowViewer('non-existent');
      }).toThrow();
    });
  });

  describe('activation and deactivation', () => {
    it('should activate viewer', () => {
      viewer.initialize();
      viewer.activate();
      expect(viewer.isFeatureActive()).toBe(true);
    });

    it('should deactivate viewer', () => {
      viewer.initialize();
      viewer.activate();
      viewer.deactivate();
      expect(viewer.isFeatureActive()).toBe(false);
    });
  });

  describe('workflow status', () => {
    it('should get workflow status', () => {
      viewer.initialize();
      const status = viewer.getWorkflowStatus();
      expect(status.workflowId).toBe('incident-response');
      expect(status.currentStep).toBe(0);
      expect(status.totalSteps).toBeGreaterThan(0);
    });

    it('should return steps in status', () => {
      viewer.initialize();
      const status = viewer.getWorkflowStatus();
      const steps = status.steps as Array<{ id: string; name: string; status: string }>;
      expect(steps).toBeInstanceOf(Array);
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('custom workflow', () => {
    it('should add custom workflow', () => {
      viewer.initialize();
      const customWorkflow = {
        id: 'custom-workflow',
        name: 'Custom Workflow',
        description: 'A custom workflow for testing',
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            description: 'First step',
            type: 'ingestion' as const,
            status: 'pending' as const,
            duration: 5,
            dependencies: []
          }
        ],
        totalDuration: 5
      };

      expect(() => viewer.addWorkflow(customWorkflow)).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      viewer.initialize();
      viewer.activate();
      expect(() => viewer.cleanup()).not.toThrow();
    });
  });

  describe('safe execution', () => {
    it('should handle errors gracefully', () => {
      viewer.initialize();
      const errorHandler = vi.fn();
      viewer.safeExecute(
        () => {
          throw new Error('Test error');
        },
        errorHandler
      );
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
