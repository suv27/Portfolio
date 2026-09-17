import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { ArchitectureBlueprint } from '../../src/features/architecture-blueprint/ArchitectureBlueprint.js';

describe('ArchitectureBlueprint', () => {
  let blueprint: ArchitectureBlueprint;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'architecture-blueprint';
    document.body.appendChild(container);
    blueprint = new ArchitectureBlueprint('architecture-blueprint');
  });

  afterEach(() => {
    if (blueprint) {
      blueprint.cleanup();
    }
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => blueprint.initialize()).not.toThrow();
    });

    it('should render blueprint with default VPCs', () => {
      blueprint.initialize();
      const vpcs = blueprint.getVPCConfigs();
      expect(vpcs.length).toBeGreaterThan(0);
      expect(vpcs[0]).toHaveProperty('id');
      expect(vpcs[0]).toHaveProperty('name');
      expect(vpcs[0]).toHaveProperty('cidr');
    });

    it('should throw error if element not found', () => {
      expect(() => {
        const badBlueprint = new ArchitectureBlueprint('non-existent');
      }).toThrow();
    });
  });

  describe('activation and deactivation', () => {
    it('should activate blueprint', () => {
      blueprint.initialize();
      blueprint.activate();
      expect(blueprint.isFeatureActive()).toBe(true);
    });

    it('should deactivate blueprint', () => {
      blueprint.initialize();
      blueprint.activate();
      blueprint.deactivate();
      expect(blueprint.isFeatureActive()).toBe(false);
    });
  });

  describe('VPC configuration', () => {
    it('should get VPC configurations', () => {
      blueprint.initialize();
      const vpcs = blueprint.getVPCConfigs();
      expect(vpcs).toBeInstanceOf(Array);
      expect(vpcs.length).toBeGreaterThan(0);
    });

    it('should have production VPC', () => {
      blueprint.initialize();
      const vpcs = blueprint.getVPCConfigs();
      const prodVpc = vpcs.find(vpc => vpc.type === 'production');
      expect(prodVpc).toBeDefined();
      expect(prodVpc?.cidr).toBe('10.0.0.0/16');
    });
  });

  describe('IRSA configuration', () => {
    it('should get IRSA configurations', () => {
      blueprint.initialize();
      const irsaConfigs = blueprint.getIRSAConfigs();
      expect(irsaConfigs).toBeInstanceOf(Array);
      expect(irsaConfigs.length).toBeGreaterThan(0);
    });

    it('should have service account configurations', () => {
      blueprint.initialize();
      const irsaConfigs = blueprint.getIRSAConfigs();
      expect(irsaConfigs[0]).toHaveProperty('serviceAccount');
      expect(irsaConfigs[0]).toHaveProperty('iamRole');
      expect(irsaConfigs[0]).toHaveProperty('policies');
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      blueprint.initialize();
      blueprint.activate();
      expect(() => blueprint.cleanup()).not.toThrow();
    });
  });

  describe('safe execution', () => {
    it('should handle errors gracefully', () => {
      blueprint.initialize();
      const errorHandler = vi.fn();
      blueprint.safeExecute(
        () => {
          throw new Error('Test error');
        },
        errorHandler
      );
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
