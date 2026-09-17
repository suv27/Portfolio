/**
 * Base class for all interactive security features
 * Provides common functionality and interface for portfolio security components
 */
export abstract class SecurityFeature {
  protected element: HTMLElement;
  protected isActive: boolean;

  constructor(elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    this.element = element;
    this.isActive = false;
  }

  /**
   * Initialize the feature
   */
  public abstract initialize(): void;

  /**
   * Activate the feature
   */
  public activate(): void {
    this.isActive = true;
    this.onActivate();
  }

  /**
   * Deactivate the feature
   */
  public deactivate(): void {
    this.isActive = false;
    this.onDeactivate();
  }

  /**
   * Check if feature is active
   */
  public isFeatureActive(): boolean {
    return this.isActive;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.isActive = false;
  }

  /**
   * Hook for activation logic
   */
  protected abstract onActivate(): void;

  /**
   * Hook for deactivation logic
   */
  protected abstract onDeactivate(): void;

  /**
   * Safely execute a function with error handling
   */
  public safeExecute(fn: () => void, errorHandler?: (error: Error) => void): void {
    try {
      fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (errorHandler) {
        errorHandler(err);
      } else {
        console.error(`Error in ${this.constructor.name}:`, err);
      }
    }
  }
}

/**
 * Base class for telemetry/metric features
 */
export abstract class TelemetryFeature extends SecurityFeature {
  protected metrics: Map<string, number>;
  protected updateInterval: number | null;

  constructor(elementId: string) {
    super(elementId);
    this.metrics = new Map();
    this.updateInterval = null;
  }

  /**
   * Update a metric value
   */
  public updateMetric(key: string, value: number): void {
    this.metrics.set(key, value);
    this.onMetricUpdate(key, value);
  }

  /**
   * Get a metric value
   */
  public getMetric(key: string): number | undefined {
    return this.metrics.get(key);
  }

  /**
   * Hook for metric updates
   */
  protected abstract onMetricUpdate(key: string, value: number): void;

  /**
   * Start automatic updates
   */
  protected startUpdates(intervalMs: number): void {
    if (this.updateInterval) {
      this.stopUpdates();
    }
    this.updateInterval = window.setInterval(() => {
      this.safeExecute(() => this.update());
    }, intervalMs);
  }

  /**
   * Stop automatic updates
   */
  protected stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update logic to be implemented by subclasses
   */
  protected abstract update(): void;

  /**
   * Cleanup includes stopping updates
   */
  public cleanup(): void {
    this.stopUpdates();
    this.metrics.clear();
  }
}

/**
 * Base class for interactive visual features
 */
export abstract class InteractiveFeature extends SecurityFeature {
  protected eventListeners: Array<{ element: HTMLElement; event: string; handler: EventListener }>;

  constructor(elementId: string) {
    super(elementId);
    this.eventListeners = [];
  }

  /**
   * Add event listener with automatic cleanup
   */
  protected addEventListener(element: HTMLElement, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Remove all registered event listeners
   */
  protected removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /**
   * Cleanup includes removing event listeners
   */
  public cleanup(): void {
    this.removeAllEventListeners();
  }
}
