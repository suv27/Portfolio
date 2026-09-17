import { TelemetryFeature } from '../base.js';

/**
 * Metric configuration interface
 */
interface MetricConfig {
  key: string;
  label: string;
  value: number;
  unit: string;
  target: number;
  variance: number;
}

/**
 * Live Security Telemetry & Metrics Dashboard
 * Displays simulated real-time security metrics in a dark-mode header
 */
export class TelemetryDashboard extends TelemetryFeature {
  private static readonly DEFAULT_METRICS: MetricConfig[] = [
    { key: 'alertNoise', label: 'Alert Noise Reduced', value: 35, unit: '%', target: 35, variance: 0.5 },
    { key: 'uptime', label: 'Uptime', value: 99.9, unit: '%', target: 99.9, variance: 0.01 },
    { key: 'assets', label: 'Cloud Assets Secured', value: 2847, unit: '', target: 2847, variance: 5 },
    { key: 'mttr', label: 'MTTR Speedup', value: 40, unit: '%', target: 40, variance: 1 }
  ];

  private metricsConfig: MetricConfig[];
  private readonly UPDATE_INTERVAL_MS = 2000;

  constructor(elementId: string = 'telemetry-dashboard') {
    super(elementId);
    this.metricsConfig = TelemetryDashboard.DEFAULT_METRICS;
  }

  /**
   * Initialize the telemetry dashboard
   */
  public initialize(): void {
    this.renderDashboard();
    this.initializeMetrics();
  }

  /**
   * Hook for activation
   */
  protected onActivate(): void {
    this.startUpdates(this.UPDATE_INTERVAL_MS);
  }

  /**
   * Hook for deactivation
   */
  protected onDeactivate(): void {
    this.stopUpdates();
  }

  /**
   * Initialize metrics from config
   */
  private initializeMetrics(): void {
    this.metricsConfig.forEach(config => {
      this.updateMetric(config.key, config.value);
    });
  }

  /**
   * Render the dashboard HTML
   */
  private renderDashboard(): void {
    this.element.innerHTML = `
      <div class="telemetry-container">
        <div class="telemetry-header">
          <span class="telemetry-status">
            <span class="status-indicator"></span>
            LIVE TELEMETRY
          </span>
          <span class="telemetry-timestamp"></span>
        </div>
        <div class="telemetry-metrics">
          ${this.metricsConfig.map(config => this.renderMetric(config)).join('')}
        </div>
      </div>
    `;

    this.updateTimestamp();
  }

  /**
   * Render a single metric
   */
  private renderMetric(config: MetricConfig): string {
    return `
      <div class="telemetry-metric" data-metric="${config.key}">
        <span class="metric-label">${config.label}</span>
        <span class="metric-value">
          <span class="metric-number">${config.value.toFixed(1)}</span>
          <span class="metric-unit">${config.unit}</span>
        </span>
      </div>
    `;
  }

  /**
   * Update the timestamp display
   */
  private updateTimestamp(): void {
    const timestampEl = this.element.querySelector('.telemetry-timestamp');
    if (timestampEl instanceof HTMLElement) {
      const now = new Date();
      timestampEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }

  /**
   * Hook for metric updates
   */
  protected onMetricUpdate(key: string, value: number): void {
    const metricEl = this.element.querySelector(`[data-metric="${key}"]`);
    if (metricEl) {
      const numberEl = metricEl.querySelector('.metric-number');
      if (numberEl instanceof HTMLElement) {
        numberEl.textContent = value.toFixed(1);
        this.animateValueChange(numberEl);
      }
    }
  }

  /**
   * Animate value change for visual feedback
   */
  private animateValueChange(element: HTMLElement): void {
    element.classList.add('value-updated');
    setTimeout(() => {
      element.classList.remove('value-updated');
    }, 500);
  }

  /**
   * Update metrics with simulated variations
   */
  protected update(): void {
    this.updateTimestamp();

    this.metricsConfig.forEach(config => {
      const currentValue = this.getMetric(config.key) ?? config.value;
      const variation = (Math.random() - 0.5) * config.variance;
      const newValue = Math.max(0, currentValue + variation);

      // Keep within reasonable bounds
      if (config.key === 'uptime') {
        const clampedValue = Math.min(100, Math.max(99.5, newValue));
        this.updateMetric(config.key, clampedValue);
      } else if (config.key === 'assets') {
        const clampedValue = Math.floor(newValue);
        this.updateMetric(config.key, clampedValue);
      } else {
        this.updateMetric(config.key, newValue);
      }
    });
  }

  /**
   * Set custom metrics configuration
   */
  public setMetricsConfig(config: MetricConfig[]): void {
    this.metricsConfig = config;
    this.renderDashboard();
    this.initializeMetrics();
  }

  /**
   * Get current metrics as object
   */
  public getCurrentMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Cleanup includes stopping updates
   */
  public cleanup(): void {
    this.stopUpdates();
    this.metrics.clear();
    super.cleanup();
  }
}
