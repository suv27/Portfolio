var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/features/base.ts
var SecurityFeature = class {
  constructor(elementId) {
    __publicField(this, "element");
    __publicField(this, "isActive");
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    this.element = element;
    this.isActive = false;
  }
  /**
   * Activate the feature
   */
  activate() {
    this.isActive = true;
    this.onActivate();
  }
  /**
   * Deactivate the feature
   */
  deactivate() {
    this.isActive = false;
    this.onDeactivate();
  }
  /**
   * Check if feature is active
   */
  isFeatureActive() {
    return this.isActive;
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this.isActive = false;
  }
  /**
   * Safely execute a function with error handling
   */
  safeExecute(fn, errorHandler) {
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
};
var TelemetryFeature = class extends SecurityFeature {
  constructor(elementId) {
    super(elementId);
    __publicField(this, "metrics");
    __publicField(this, "updateInterval");
    this.metrics = /* @__PURE__ */ new Map();
    this.updateInterval = null;
  }
  /**
   * Update a metric value
   */
  updateMetric(key, value) {
    this.metrics.set(key, value);
    this.onMetricUpdate(key, value);
  }
  /**
   * Get a metric value
   */
  getMetric(key) {
    return this.metrics.get(key);
  }
  /**
   * Start automatic updates
   */
  startUpdates(intervalMs) {
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
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  /**
   * Cleanup includes stopping updates
   */
  cleanup() {
    this.stopUpdates();
    this.metrics.clear();
  }
};
var InteractiveFeature = class extends SecurityFeature {
  constructor(elementId) {
    super(elementId);
    __publicField(this, "eventListeners");
    this.eventListeners = [];
  }
  /**
   * Add event listener with automatic cleanup
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }
  /**
   * Remove all registered event listeners
   */
  removeAllEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
  /**
   * Cleanup includes removing event listeners
   */
  cleanup() {
    this.removeAllEventListeners();
  }
};

// src/features/telemetry/TelemetryDashboard.ts
var _TelemetryDashboard = class _TelemetryDashboard extends TelemetryFeature {
  constructor(elementId = "telemetry-dashboard") {
    super(elementId);
    __publicField(this, "metricsConfig");
    __publicField(this, "UPDATE_INTERVAL_MS", 2e3);
    this.metricsConfig = _TelemetryDashboard.DEFAULT_METRICS;
  }
  /**
   * Initialize the telemetry dashboard
   */
  initialize() {
    this.renderDashboard();
    this.initializeMetrics();
  }
  /**
   * Hook for activation
   */
  onActivate() {
    this.startUpdates(this.UPDATE_INTERVAL_MS);
  }
  /**
   * Hook for deactivation
   */
  onDeactivate() {
    this.stopUpdates();
  }
  /**
   * Initialize metrics from config
   */
  initializeMetrics() {
    this.metricsConfig.forEach((config) => {
      this.updateMetric(config.key, config.value);
    });
  }
  /**
   * Render the dashboard HTML
   */
  renderDashboard() {
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
          ${this.metricsConfig.map((config) => this.renderMetric(config)).join("")}
        </div>
      </div>
    `;
    this.updateTimestamp();
  }
  /**
   * Render a single metric
   */
  renderMetric(config) {
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
  updateTimestamp() {
    const timestampEl = this.element.querySelector(".telemetry-timestamp");
    if (timestampEl instanceof HTMLElement) {
      const now = /* @__PURE__ */ new Date();
      timestampEl.textContent = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }
  /**
   * Hook for metric updates
   */
  onMetricUpdate(key, value) {
    const metricEl = this.element.querySelector(`[data-metric="${key}"]`);
    if (metricEl) {
      const numberEl = metricEl.querySelector(".metric-number");
      if (numberEl instanceof HTMLElement) {
        numberEl.textContent = value.toFixed(1);
        this.animateValueChange(numberEl);
      }
    }
  }
  /**
   * Animate value change for visual feedback
   */
  animateValueChange(element) {
    element.classList.add("value-updated");
    setTimeout(() => {
      element.classList.remove("value-updated");
    }, 500);
  }
  /**
   * Update metrics with simulated variations
   */
  update() {
    this.updateTimestamp();
    this.metricsConfig.forEach((config) => {
      const currentValue = this.getMetric(config.key) ?? config.value;
      const variation = (Math.random() - 0.5) * config.variance;
      const newValue = Math.max(0, currentValue + variation);
      if (config.key === "uptime") {
        const clampedValue = Math.min(100, Math.max(99.5, newValue));
        this.updateMetric(config.key, clampedValue);
      } else if (config.key === "assets") {
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
  setMetricsConfig(config) {
    this.metricsConfig = config;
    this.renderDashboard();
    this.initializeMetrics();
  }
  /**
   * Get current metrics as object
   */
  getCurrentMetrics() {
    const result = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  /**
   * Cleanup includes stopping updates
   */
  cleanup() {
    this.stopUpdates();
    this.metrics.clear();
    super.cleanup();
  }
};
__publicField(_TelemetryDashboard, "DEFAULT_METRICS", [
  { key: "alertNoise", label: "Alert Noise Reduced", value: 35, unit: "%", target: 35, variance: 0.5 },
  { key: "uptime", label: "Uptime", value: 99.9, unit: "%", target: 99.9, variance: 0.01 },
  { key: "assets", label: "Cloud Assets Secured", value: 2847, unit: "", target: 2847, variance: 5 },
  { key: "mttr", label: "MTTR Speedup", value: 40, unit: "%", target: 40, variance: 1 }
]);
var TelemetryDashboard = _TelemetryDashboard;

// src/features/threat-simulator/ThreatSimulator.ts
var _ThreatSimulator = class _ThreatSimulator extends InteractiveFeature {
  constructor(elementId = "threat-simulator") {
    super(elementId);
    __publicField(this, "nodes");
    __publicField(this, "attackVectors");
    __publicField(this, "trafficFlows");
    __publicField(this, "activeAttack");
    __publicField(this, "selectedNode");
    this.nodes = _ThreatSimulator.DEFAULT_NODES;
    this.attackVectors = _ThreatSimulator.ATTACK_VECTORS;
    this.trafficFlows = [];
    this.activeAttack = null;
    this.selectedNode = null;
  }
  /**
   * Initialize the threat simulator
   */
  initialize() {
    this.renderSimulator();
    this.setupEventListeners();
    this.initializeTrafficFlows();
  }
  /**
   * Hook for activation
   */
  onActivate() {
    this.startSimulation();
  }
  /**
   * Hook for deactivation
   */
  onDeactivate() {
    this.stopSimulation();
    this.activeAttack = null;
    this.resetNodeStatuses();
  }
  /**
   * Initialize default traffic flows
   */
  initializeTrafficFlows() {
    this.trafficFlows = [
      { from: "cloudflare", to: "waf", volume: 100, status: "allowed" },
      { from: "waf", to: "alb", volume: 100, status: "allowed" },
      { from: "alb", to: "service1", volume: 30, status: "allowed" },
      { from: "alb", to: "service2", volume: 40, status: "allowed" },
      { from: "alb", to: "service3", volume: 30, status: "allowed" }
    ];
  }
  /**
   * Render the simulator UI
   */
  renderSimulator() {
    this.element.innerHTML = `
      <div class="threat-simulator-container">
        <div class="simulator-header">
          <h3>L7 Threat Mitigation Simulator</h3>
          <div class="simulator-controls">
            <button class="btn btn-reset" data-action="reset">Reset</button>
            <button class="btn btn-start" data-action="start">Start Simulation</button>
          </div>
        </div>

        <div class="simulator-body">
          <div class="attack-vectors-panel">
            <h4>Attack Vectors</h4>
            <div class="attack-list">
              ${this.attackVectors.map((vector) => this.renderAttackVector(vector)).join("")}
            </div>
          </div>

          <div class="network-visualization">
            <svg class="network-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              ${this.renderConnections()}
              ${this.renderNodes()}
            </svg>
          </div>

          <div class="traffic-panel">
            <h4>Traffic Analysis</h4>
            <div class="traffic-flows">
              ${this.trafficFlows.map((flow) => this.renderTrafficFlow(flow)).join("")}
            </div>
            <div class="traffic-stats">
              <div class="stat">
                <span class="stat-label">Total Traffic:</span>
                <span class="stat-value" id="total-traffic">0</span>
              </div>
              <div class="stat">
                <span class="stat-label">Blocked:</span>
                <span class="stat-value" id="blocked-traffic">0</span>
              </div>
              <div class="stat">
                <span class="stat-label">Allowed:</span>
                <span class="stat-value" id="allowed-traffic">0</span>
              </div>
            </div>
          </div>
        </div>

        <div class="simulator-footer">
          <div class="status-message" id="simulator-status">
            System Active - Select an attack vector to simulate
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render an attack vector button
   */
  renderAttackVector(vector) {
    const severityClass = `severity-${vector.severity}`;
    return `
      <button class="attack-vector ${severityClass}" data-attack="${vector.id}">
        <span class="attack-name">${vector.name}</span>
        <span class="attack-severity">${vector.severity.toUpperCase()}</span>
      </button>
    `;
  }
  /**
   * Render network connections
   */
  renderConnections() {
    return this.trafficFlows.map((flow) => {
      const fromNode = this.nodes.find((n) => n.id === flow.from);
      const toNode = this.nodes.find((n) => n.id === flow.to);
      if (!fromNode || !toNode) return "";
      const statusClass = `connection-${flow.status}`;
      return `
        <line
          class="network-connection ${statusClass}"
          x1="${fromNode.x}"
          y1="${fromNode.y}"
          x2="${toNode.x}"
          y2="${toNode.y}"
          data-from="${flow.from}"
          data-to="${flow.to}"
        />
      `;
    }).join("");
  }
  /**
   * Render network nodes
   */
  renderNodes() {
    return this.nodes.map((node) => {
      const statusClass = `node-${node.status}`;
      const typeIcon = this.getNodeIcon(node.type);
      return `
        <g class="network-node ${statusClass}" data-node="${node.id}" transform="translate(${node.x}, ${node.y})">
          <circle r="4" class="node-circle" />
          <text y="8" text-anchor="middle" class="node-label">${node.name}</text>
          <text y="12" text-anchor="middle" class="node-icon">${typeIcon}</text>
        </g>
      `;
    }).join("");
  }
  /**
   * Get icon for node type
   */
  getNodeIcon(type) {
    const icons = {
      cloudflare: "\u2601\uFE0F",
      waf: "\u{1F6E1}\uFE0F",
      alb: "\u2696\uFE0F",
      microservice: "\u{1F527}"
    };
    return icons[type] || "\u{1F4E6}";
  }
  /**
   * Render a traffic flow entry
   */
  renderTrafficFlow(flow) {
    const fromNode = this.nodes.find((n) => n.id === flow.from);
    const toNode = this.nodes.find((n) => n.id === flow.to);
    const statusClass = `flow-${flow.status}`;
    return `
      <div class="traffic-flow ${statusClass}" data-flow-from="${flow.from}" data-flow-to="${flow.to}">
        <span class="flow-path">${fromNode?.name} \u2192 ${toNode?.name}</span>
        <span class="flow-volume">${flow.volume} req/s</span>
        <span class="flow-status">${flow.status}</span>
      </div>
    `;
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.attackVectors.forEach((vector) => {
      const button = this.element.querySelector(`[data-attack="${vector.id}"]`);
      if (button) {
        this.addEventListener(button, "click", () => {
          this.simulateAttack(vector);
        });
      }
    });
    const resetButton = this.element.querySelector('[data-action="reset"]');
    if (resetButton) {
      this.addEventListener(resetButton, "click", () => {
        this.resetSimulation();
      });
    }
    const startButton = this.element.querySelector('[data-action="start"]');
    if (startButton) {
      this.addEventListener(startButton, "click", () => {
        this.startSimulation();
      });
    }
    this.nodes.forEach((node) => {
      const nodeElement = this.element.querySelector(`[data-node="${node.id}"]`);
      if (nodeElement) {
        this.addEventListener(nodeElement, "click", () => {
          this.selectNode(node);
        });
      }
    });
  }
  /**
   * Simulate an attack
   */
  simulateAttack(vector) {
    this.activeAttack = vector;
    this.updateStatusMessage(`Simulating ${vector.name} attack...`);
    this.processAttackTraffic(vector);
  }
  /**
   * Process attack traffic through the network
   */
  processAttackTraffic(vector) {
    this.trafficFlows = this.trafficFlows.map((flow) => {
      const attackVolume = vector.trafficVolume;
      let newVolume = flow.volume;
      let newStatus = flow.status;
      if (flow.from === "cloudflare" && flow.to === "waf") {
        const blockedAmount = attackVolume * 0.3;
        newVolume = flow.volume + attackVolume - blockedAmount;
        newStatus = "filtered";
      }
      if (flow.from === "waf" && flow.to === "alb") {
        if (vector.severity === "critical" || vector.severity === "high") {
          const blockedAmount = attackVolume * 0.8;
          newVolume = flow.volume + attackVolume * 0.2;
          newStatus = "blocked";
        } else {
          newVolume = flow.volume + attackVolume * 0.5;
          newStatus = "filtered";
        }
      }
      this.updateNodeStatus(flow.to, vector.severity);
      return { ...flow, volume: Math.floor(newVolume), status: newStatus };
    });
    this.updateVisualization();
    this.updateTrafficStats();
    setTimeout(() => {
      this.updateStatusMessage(`${vector.name} attack mitigated. ${vector.severity.toUpperCase()} threat neutralized.`);
    }, 1500);
  }
  /**
   * Update node status based on attack severity
   */
  updateNodeStatus(nodeId, severity) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      if (severity === "critical") {
        node.status = "blocked";
      } else if (severity === "high") {
        node.status = "warning";
      } else {
        node.status = "active";
      }
    }
  }
  /**
   * Reset node statuses
   */
  resetNodeStatuses() {
    this.nodes.forEach((node) => {
      node.status = "active";
    });
  }
  /**
   * Update the visualization
   */
  updateVisualization() {
    this.trafficFlows.forEach((flow) => {
      const connection = this.element.querySelector(`[data-from="${flow.from}"][data-to="${flow.to}"]`);
      if (connection instanceof HTMLElement) {
        connection.setAttribute("class", `network-connection connection-${flow.status}`);
      }
    });
    this.nodes.forEach((node) => {
      const nodeElement = this.element.querySelector(`[data-node="${node.id}"]`);
      if (nodeElement instanceof HTMLElement) {
        nodeElement.setAttribute("class", `network-node node-${node.status}`);
      }
    });
    this.trafficFlows.forEach((flow) => {
      const flowElement = this.element.querySelector(`[data-flow-from="${flow.from}"][data-flow-to="${flow.to}"]`);
      if (flowElement instanceof HTMLElement) {
        const volumeEl = flowElement.querySelector(".flow-volume");
        const statusEl = flowElement.querySelector(".flow-status");
        if (volumeEl instanceof HTMLElement) volumeEl.textContent = `${flow.volume} req/s`;
        if (statusEl instanceof HTMLElement) statusEl.textContent = flow.status;
        flowElement.setAttribute("class", `traffic-flow flow-${flow.status}`);
      }
    });
  }
  /**
   * Update traffic statistics
   */
  updateTrafficStats() {
    const totalTraffic = this.trafficFlows.reduce((sum, flow) => sum + flow.volume, 0);
    const blockedTraffic = this.trafficFlows.filter((flow) => flow.status === "blocked").reduce((sum, flow) => sum + flow.volume, 0);
    const allowedTraffic = this.trafficFlows.filter((flow) => flow.status === "allowed").reduce((sum, flow) => sum + flow.volume, 0);
    const totalEl = this.element.querySelector("#total-traffic");
    const blockedEl = this.element.querySelector("#blocked-traffic");
    const allowedEl = this.element.querySelector("#allowed-traffic");
    if (totalEl instanceof HTMLElement) totalEl.textContent = totalTraffic.toString();
    if (blockedEl instanceof HTMLElement) blockedEl.textContent = blockedTraffic.toString();
    if (allowedEl instanceof HTMLElement) allowedEl.textContent = allowedTraffic.toString();
  }
  /**
   * Update status message
   */
  updateStatusMessage(message) {
    const statusEl = this.element.querySelector("#simulator-status");
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = message;
    }
  }
  /**
   * Select a node
   */
  selectNode(node) {
    this.selectedNode = node;
    this.updateStatusMessage(`Selected: ${node.name} (${node.type}) - Status: ${node.status}`);
  }
  /**
   * Start simulation
   */
  startSimulation() {
    this.updateStatusMessage("Simulation started. Select an attack vector to begin.");
  }
  /**
   * Stop simulation
   */
  stopSimulation() {
    this.updateStatusMessage("Simulation stopped.");
  }
  /**
   * Reset simulation
   */
  resetSimulation() {
    this.activeAttack = null;
    this.resetNodeStatuses();
    this.initializeTrafficFlows();
    this.updateVisualization();
    this.updateTrafficStats();
    this.updateStatusMessage("Simulation reset. System ready.");
  }
  /**
   * Get current traffic flows
   */
  getTrafficFlows() {
    return [...this.trafficFlows];
  }
  /**
   * Get current node statuses
   */
  getNodeStatuses() {
    return this.nodes.reduce((acc, node) => {
      acc[node.id] = node.status;
      return acc;
    }, {});
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this.activeAttack = null;
    this.selectedNode = null;
    super.cleanup();
  }
};
__publicField(_ThreatSimulator, "DEFAULT_NODES", [
  { id: "cloudflare", name: "Cloudflare", type: "cloudflare", x: 10, y: 50, status: "active" },
  { id: "waf", name: "AWS WAF", type: "waf", x: 30, y: 50, status: "active" },
  { id: "alb", name: "ALB", type: "alb", x: 50, y: 50, status: "active" },
  { id: "service1", name: "Auth Service", type: "microservice", x: 70, y: 30, status: "active" },
  { id: "service2", name: "API Gateway", type: "microservice", x: 70, y: 50, status: "active" },
  { id: "service3", name: "Data Service", type: "microservice", x: 70, y: 70, status: "active" }
]);
__publicField(_ThreatSimulator, "ATTACK_VECTORS", [
  {
    id: "sqli",
    name: "SQL Injection",
    description: "OWASP Top 10 SQLi attack pattern detected",
    severity: "critical",
    trafficVolume: 1e3
  },
  {
    id: "scraper",
    name: "Aggregator Scraping",
    description: "Plaid/Intuit aggregator scraping detected",
    severity: "medium",
    trafficVolume: 500
  },
  {
    id: "credential-stuffing",
    name: "Credential Stuffing",
    description: "Automated credential stuffing attack",
    severity: "high",
    trafficVolume: 800
  },
  {
    id: "ddos",
    name: "DDoS Attack",
    description: "Distributed denial of service attempt",
    severity: "critical",
    trafficVolume: 2e3
  }
]);
var ThreatSimulator = _ThreatSimulator;

// src/features/soar-workflow/SOARWorkflowViewer.ts
var _SOARWorkflowViewer = class _SOARWorkflowViewer extends InteractiveFeature {
  constructor(elementId = "soar-workflow-viewer") {
    super(elementId);
    __publicField(this, "workflows");
    __publicField(this, "activeWorkflow");
    __publicField(this, "currentStepIndex");
    __publicField(this, "executionTimer");
    this.workflows = _SOARWorkflowViewer.DEFAULT_WORKFLOWS;
    this.activeWorkflow = null;
    this.currentStepIndex = 0;
    this.executionTimer = null;
  }
  /**
   * Initialize the SOAR workflow viewer
   */
  initialize() {
    this.renderViewer();
    this.setupEventListeners();
  }
  /**
   * Hook for activation
   */
  onActivate() {
  }
  /**
   * Hook for deactivation
   */
  onDeactivate() {
    this.stopExecution();
    this.resetWorkflow();
  }
  /**
   * Render the workflow viewer UI
   */
  renderViewer() {
    this.element.innerHTML = `
      <div class="soar-workflow-container">
        <div class="workflow-header">
          <h3>Automated SOAR & Triage Workflow</h3>
          <div class="workflow-controls">
            <select class="workflow-selector" id="workflow-selector">
              ${this.workflows.map((workflow) => `
                <option value="${workflow.id}">${workflow.name}</option>
              `).join("")}
            </select>
            <button class="btn btn-execute" data-action="execute">Execute Workflow</button>
            <button class="btn btn-reset" data-action="reset">Reset</button>
          </div>
        </div>

        <div class="workflow-info">
          <p class="workflow-description" id="workflow-description"></p>
          <div class="workflow-metrics">
            <div class="metric">
              <span class="metric-label">Total Steps:</span>
              <span class="metric-value" id="total-steps">0</span>
            </div>
            <div class="metric">
              <span class="metric-label">Estimated Duration:</span>
              <span class="metric-value" id="total-duration">0s</span>
            </div>
            <div class="metric">
              <span class="metric-label">MTTR Reduction:</span>
              <span class="metric-value">40%</span>
            </div>
          </div>
        </div>

        <div class="workflow-visualization">
          <div class="workflow-steps" id="workflow-steps">
            <!-- Steps will be rendered here -->
          </div>
        </div>

        <div class="workflow-footer">
          <div class="execution-status" id="execution-status">
            Ready to execute workflow
          </div>
          <div class="execution-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
            </div>
            <span class="progress-text" id="progress-text">0%</span>
          </div>
        </div>
      </div>
    `;
    this.loadWorkflow(this.workflows[0].id);
  }
  /**
   * Load a workflow by ID
   */
  loadWorkflow(workflowId) {
    const workflow = this.workflows.find((w) => w.id === workflowId);
    if (!workflow) return;
    this.activeWorkflow = workflow;
    this.currentStepIndex = 0;
    this.resetStepStatuses();
    const descriptionEl = this.element.querySelector("#workflow-description");
    const totalStepsEl = this.element.querySelector("#total-steps");
    const totalDurationEl = this.element.querySelector("#total-duration");
    if (descriptionEl instanceof HTMLElement) descriptionEl.textContent = workflow.description;
    if (totalStepsEl instanceof HTMLElement) totalStepsEl.textContent = workflow.steps.length.toString();
    if (totalDurationEl instanceof HTMLElement) totalDurationEl.textContent = `${workflow.totalDuration}s`;
    this.renderSteps();
  }
  /**
   * Reset all step statuses
   */
  resetStepStatuses() {
    if (this.activeWorkflow) {
      this.activeWorkflow.steps.forEach((step) => {
        step.status = "pending";
      });
    }
  }
  /**
   * Render workflow steps
   */
  renderSteps() {
    if (!this.activeWorkflow) return;
    const stepsContainer = this.element.querySelector("#workflow-steps");
    if (!stepsContainer) return;
    stepsContainer.innerHTML = this.activeWorkflow.steps.map((step, index) => {
      const typeIcon = this.getStepTypeIcon(step.type);
      const statusClass = `step-${step.status}`;
      const connector = index < this.activeWorkflow.steps.length - 1 ? '<div class="step-connector"></div>' : "";
      return `
        <div class="workflow-step ${statusClass}" data-step="${step.id}" data-index="${index}">
          <div class="step-header">
            <span class="step-icon">${typeIcon}</span>
            <span class="step-number">${index + 1}</span>
            <span class="step-name">${step.name}</span>
            <span class="step-duration">${step.duration}s</span>
          </div>
          <div class="step-description">${step.description}</div>
          <div class="step-status">${step.status}</div>
        </div>
        ${connector}
      `;
    }).join("");
  }
  /**
   * Get icon for step type
   */
  getStepTypeIcon(type) {
    const icons = {
      ingestion: "\u{1F4E5}",
      analysis: "\u{1F50D}",
      action: "\u26A1",
      notification: "\u{1F4E2}"
    };
    return icons[type] || "\u{1F4CB}";
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const selector = this.element.querySelector("#workflow-selector");
    if (selector) {
      this.addEventListener(selector, "change", (e) => {
        const target = e.target;
        this.loadWorkflow(target.value);
      });
    }
    const executeButton = this.element.querySelector('[data-action="execute"]');
    if (executeButton) {
      this.addEventListener(executeButton, "click", () => {
        this.executeWorkflow();
      });
    }
    const resetButton = this.element.querySelector('[data-action="reset"]');
    if (resetButton) {
      this.addEventListener(resetButton, "click", () => {
        this.resetWorkflow();
      });
    }
    if (this.activeWorkflow) {
      this.activeWorkflow.steps.forEach((step, index) => {
        const stepElement = this.element.querySelector(`[data-step="${step.id}"]`);
        if (stepElement) {
          this.addEventListener(stepElement, "click", () => {
            this.showStepDetails(step, index);
          });
        }
      });
    }
  }
  /**
   * Execute the workflow
   */
  executeWorkflow() {
    if (!this.activeWorkflow || this.currentStepIndex >= this.activeWorkflow.steps.length) {
      this.resetWorkflow();
      return;
    }
    this.updateExecutionStatus("Executing workflow...");
    this.executeNextStep();
  }
  /**
   * Execute the next step in the workflow
   */
  executeNextStep() {
    if (!this.activeWorkflow || this.currentStepIndex >= this.activeWorkflow.steps.length) {
      this.completeWorkflow();
      return;
    }
    const step = this.activeWorkflow.steps[this.currentStepIndex];
    step.status = "in-progress";
    this.updateStepVisualization(step.id);
    this.updateExecutionStatus(`Executing: ${step.name}`);
    this.executionTimer = window.setTimeout(() => {
      step.status = "completed";
      this.updateStepVisualization(step.id);
      this.updateProgress();
      this.currentStepIndex++;
      this.executeNextStep();
    }, step.duration * 100);
  }
  /**
   * Update step visualization
   */
  updateStepVisualization(stepId) {
    const stepElement = this.element.querySelector(`[data-step="${stepId}"]`);
    if (stepElement instanceof HTMLElement && this.activeWorkflow) {
      const step = this.activeWorkflow.steps.find((s) => s.id === stepId);
      if (step) {
        stepElement.setAttribute("class", `workflow-step step-${step.status}`);
        const statusEl = stepElement.querySelector(".step-status");
        if (statusEl instanceof HTMLElement) {
          statusEl.textContent = step.status;
        }
      }
    }
  }
  /**
   * Update progress bar
   */
  updateProgress() {
    if (!this.activeWorkflow) return;
    const progress = this.currentStepIndex / this.activeWorkflow.steps.length * 100;
    const progressFill = this.element.querySelector("#progress-fill");
    const progressText = this.element.querySelector("#progress-text");
    if (progressFill instanceof HTMLElement) {
      progressFill.style.width = `${progress}%`;
    }
    if (progressText instanceof HTMLElement) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
  }
  /**
   * Update execution status
   */
  updateExecutionStatus(message) {
    const statusEl = this.element.querySelector("#execution-status");
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = message;
    }
  }
  /**
   * Complete the workflow
   */
  completeWorkflow() {
    this.updateExecutionStatus("Workflow completed successfully");
    this.updateProgress();
    this.currentStepIndex = 0;
  }
  /**
   * Stop workflow execution
   */
  stopExecution() {
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
  }
  /**
   * Reset the workflow
   */
  resetWorkflow() {
    this.stopExecution();
    this.currentStepIndex = 0;
    this.resetStepStatuses();
    this.renderSteps();
    this.updateProgress();
    this.updateExecutionStatus("Ready to execute workflow");
  }
  /**
   * Show step details
   */
  showStepDetails(step, index) {
    const dependencies = step.dependencies.map((depId) => {
      const depStep = this.activeWorkflow?.steps.find((s) => s.id === depId);
      return depStep?.name || depId;
    }).join(", ") || "None";
    this.updateExecutionStatus(
      `Step ${index + 1}: ${step.name} | Type: ${step.type} | Dependencies: ${dependencies} | Duration: ${step.duration}s`
    );
  }
  /**
   * Add a custom workflow
   */
  addWorkflow(workflow) {
    this.workflows.push(workflow);
    const selector = this.element.querySelector("#workflow-selector");
    if (selector) {
      const option = document.createElement("option");
      option.value = workflow.id;
      option.textContent = workflow.name;
      selector.appendChild(option);
    }
  }
  /**
   * Get current workflow status
   */
  getWorkflowStatus() {
    if (!this.activeWorkflow) {
      return { status: "no-workflow" };
    }
    return {
      workflowId: this.activeWorkflow.id,
      currentStep: this.currentStepIndex,
      totalSteps: this.activeWorkflow.steps.length,
      steps: this.activeWorkflow.steps.map((step) => ({
        id: step.id,
        name: step.name,
        status: step.status
      }))
    };
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopExecution();
    super.cleanup();
  }
};
__publicField(_SOARWorkflowViewer, "DEFAULT_WORKFLOWS", [
  {
    id: "incident-response",
    name: "Incident Response Pipeline",
    description: "Automated incident response from alert to resolution",
    steps: [
      {
        id: "alert-ingestion",
        name: "Alert Ingestion",
        description: "Receive and parse alerts from Splunk/Datadog",
        type: "ingestion",
        status: "pending",
        duration: 2,
        dependencies: []
      },
      {
        id: "artifact-extraction",
        name: "Artifact Extraction",
        description: "Extract IP addresses, user IDs, and timestamps",
        type: "analysis",
        status: "pending",
        duration: 5,
        dependencies: ["alert-ingestion"]
      },
      {
        id: "threat-enrichment",
        name: "Threat Enrichment",
        description: "Cross-reference with threat intelligence feeds",
        type: "analysis",
        status: "pending",
        duration: 3,
        dependencies: ["artifact-extraction"]
      },
      {
        id: "iam-isolation",
        name: "IAM Account Isolation",
        description: "Disable compromised IAM credentials",
        type: "action",
        status: "pending",
        duration: 8,
        dependencies: ["threat-enrichment"]
      },
      {
        id: "ticket-generation",
        name: "Ticket Generation",
        description: "Create incident ticket in Jira/ServiceNow",
        type: "notification",
        status: "pending",
        duration: 2,
        dependencies: ["iam-isolation"]
      },
      {
        id: "notification",
        name: "Team Notification",
        description: "Notify on-call security team via Slack/PagerDuty",
        type: "notification",
        status: "pending",
        duration: 1,
        dependencies: ["ticket-generation"]
      }
    ],
    totalDuration: 21
  }
]);
var SOARWorkflowViewer = _SOARWorkflowViewer;

// src/features/architecture-blueprint/ArchitectureBlueprint.ts
var _ArchitectureBlueprint = class _ArchitectureBlueprint extends InteractiveFeature {
  constructor(elementId = "architecture-blueprint") {
    super(elementId);
    __publicField(this, "vpcs");
    __publicField(this, "transitGateway");
    __publicField(this, "irsaConfigs");
    __publicField(this, "activeTab");
    __publicField(this, "selectedVpc");
    __publicField(this, "viewMode");
    this.vpcs = _ArchitectureBlueprint.DEFAULT_VPCS;
    this.transitGateway = _ArchitectureBlueprint.TRANSIT_GATEWAY;
    this.irsaConfigs = _ArchitectureBlueprint.IRSA_CONFIGS;
    this.activeTab = "vpc";
    this.selectedVpc = null;
    this.viewMode = "2d";
  }
  /**
   * Initialize the architecture blueprint viewer
   */
  initialize() {
    this.renderBlueprint();
    this.setupEventListeners();
  }
  /**
   * Hook for activation
   */
  onActivate() {
  }
  /**
   * Hook for deactivation
   */
  onDeactivate() {
    this.selectedVpc = null;
  }
  /**
   * Render the blueprint viewer UI
   */
  renderBlueprint() {
    this.element.innerHTML = `
      <div class="architecture-blueprint-container">
        <div class="blueprint-header">
          <h3>Cloud Architecture Blueprint Explorer</h3>
          <div class="blueprint-controls">
            <div class="view-toggle">
              <button class="btn btn-view active" data-view="2d" data-action="set-view">2D</button>
              <button class="btn btn-view" data-view="3d" data-action="set-view">3D</button>
            </div>
            <button class="btn btn-export" data-action="export">Export Terraform</button>
          </div>
        </div>

        <div class="blueprint-tabs">
          <button class="tab-btn active" data-tab="vpc">VPC Network Design</button>
          <button class="tab-btn" data-tab="tgw">Transit Gateway</button>
          <button class="tab-btn" data-tab="irsa">Kubernetes IRSA</button>
        </div>

        <div class="blueprint-content">
          <div class="tab-content active" id="tab-vpc">
            ${this.renderVPCTab()}
          </div>
          <div class="tab-content" id="tab-tgw">
            ${this.renderTGWTab()}
          </div>
          <div class="tab-content" id="tab-irsa">
            ${this.renderIRSATab()}
          </div>
        </div>

        <div class="blueprint-footer">
          <div class="blueprint-info" id="blueprint-info">
            Select a VPC to view detailed configuration
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render VPC tab content
   */
  renderVPCTab() {
    return `
      <div class="vpc-overview">
        <div class="vpc-list">
          ${this.vpcs.map((vpc) => this.renderVPCCard(vpc)).join("")}
        </div>
        <div class="vpc-visualization" id="vpc-visualization">
          <div class="visualization-placeholder">
            Select a VPC to view network topology
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render a VPC card
   */
  renderVPCCard(vpc) {
    const typeClass = `vpc-type-${vpc.type}`;
    return `
      <div class="vpc-card ${typeClass}" data-vpc="${vpc.id}">
        <div class="vpc-header">
          <span class="vpc-name">${vpc.name}</span>
          <span class="vpc-cidr">${vpc.cidr}</span>
        </div>
        <div class="vpc-details">
          <span class="vpc-type">${vpc.type}</span>
          <span class="vpc-subnets">${vpc.subnets.length} subnets</span>
        </div>
      </div>
    `;
  }
  /**
   * Render Transit Gateway tab content
   */
  renderTGWTab() {
    return `
      <div class="tgw-overview">
        <div class="tgw-diagram">
          <div class="tgw-central">
            <div class="tgw-node">
              <span class="tgw-name">${this.transitGateway.name}</span>
              <span class="tgw-id">${this.transitGateway.id}</span>
            </div>
          </div>
          <div class="tgw-attachments">
            ${this.transitGateway.attachments.map((attachmentId) => {
      const vpc = this.vpcs.find((v) => v.id === attachmentId);
      return vpc ? `
                <div class="tgw-attachment" data-attachment="${attachmentId}">
                  <div class="attachment-line"></div>
                  <div class="attachment-node">
                    <span class="attachment-name">${vpc.name}</span>
                    <span class="attachment-cidr">${vpc.cidr}</span>
                  </div>
                </div>
              ` : "";
    }).join("")}
          </div>
        </div>
        <div class="tgw-details">
          <h4>Transit Gateway Configuration</h4>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${this.transitGateway.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Attachments:</span>
            <span class="detail-value">${this.transitGateway.attachments.length}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Route Tables:</span>
            <span class="detail-value">Auto-generated</span>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render Kubernetes IRSA tab content
   */
  renderIRSATab() {
    return `
      <div class="irsa-overview">
        <div class="irsa-list">
          ${this.irsaConfigs.map((config) => this.renderIRSAConfig(config)).join("")}
        </div>
        <div class="irsa-details">
          <h4>IAM Roles for Service Accounts (IRSA)</h4>
          <p>Configures fine-grained IAM permissions for Kubernetes pods using OpenID Connect.</p>
          <div class="irsa-benefits">
            <div class="benefit">
              <span class="benefit-icon">\u{1F512}</span>
              <span class="benefit-text">Least privilege access</span>
            </div>
            <div class="benefit">
              <span class="benefit-icon">\u{1F3AF}</span>
              <span class="benefit-text">Pod-level IAM scoping</span>
            </div>
            <div class="benefit">
              <span class="benefit-icon">\u{1F680}</span>
              <span class="benefit-text">No credential management</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render an IRSA configuration
   */
  renderIRSAConfig(config) {
    return `
      <div class="irsa-config" data-irsa="${config.serviceAccount}">
        <div class="irsa-header">
          <span class="irsa-service-account">${config.serviceAccount}</span>
          <span class="irsa-namespace">${config.namespace}</span>
        </div>
        <div class="irsa-role">
          <span class="role-label">IAM Role:</span>
          <span class="role-arn">${config.iamRole}</span>
        </div>
        <div class="irsa-policies">
          <span class="policies-label">Policies:</span>
          <div class="policy-list">
            ${config.policies.map((policy) => `<span class="policy-tag">${policy}</span>`).join("")}
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const tabButtons = this.element.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => {
      this.addEventListener(button, "click", (e) => {
        const target = e.target;
        const tab = target.dataset.tab;
        this.switchTab(tab);
      });
    });
    const viewButtons = this.element.querySelectorAll('[data-action="set-view"]');
    viewButtons.forEach((button) => {
      this.addEventListener(button, "click", (e) => {
        const target = e.target;
        const view = target.dataset.view;
        this.setViewMode(view);
      });
    });
    const exportButton = this.element.querySelector('[data-action="export"]');
    if (exportButton) {
      this.addEventListener(exportButton, "click", () => {
        this.exportTerraform();
      });
    }
    this.vpcs.forEach((vpc) => {
      const vpcCard = this.element.querySelector(`[data-vpc="${vpc.id}"]`);
      if (vpcCard) {
        this.addEventListener(vpcCard, "click", () => {
          this.selectVPC(vpc);
        });
      }
    });
    this.irsaConfigs.forEach((config) => {
      const irsaConfig = this.element.querySelector(`[data-irsa="${config.serviceAccount}"]`);
      if (irsaConfig) {
        this.addEventListener(irsaConfig, "click", () => {
          this.showIRSADetails(config);
        });
      }
    });
  }
  /**
   * Switch between tabs
   */
  switchTab(tab) {
    this.activeTab = tab;
    const tabButtons = this.element.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => {
      const buttonTab = button.getAttribute("data-tab");
      if (buttonTab === tab) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
    const tabContents = this.element.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      content.classList.remove("active");
    });
    const activeContent = this.element.querySelector(`#tab-${tab}`);
    if (activeContent instanceof HTMLElement) {
      activeContent.classList.add("active");
    }
  }
  /**
   * Set view mode (2D or 3D)
   */
  setViewMode(mode) {
    this.viewMode = mode;
    const viewButtons = this.element.querySelectorAll('[data-action="set-view"]');
    viewButtons.forEach((button) => {
      const buttonView = button.getAttribute("data-view");
      if (buttonView === mode) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
    this.updateBlueprintInfo(`View mode switched to ${mode.toUpperCase()}`);
  }
  /**
   * Select a VPC
   */
  selectVPC(vpc) {
    this.selectedVpc = vpc;
    this.renderVPCVisualization(vpc);
    this.updateBlueprintInfo(`Selected: ${vpc.name} (${vpc.cidr}) - ${vpc.subnets.length} subnets`);
  }
  /**
   * Render VPC network visualization
   */
  renderVPCVisualization(vpc) {
    const visualization = this.element.querySelector("#vpc-visualization");
    if (!(visualization instanceof HTMLElement)) return;
    visualization.innerHTML = `
      <div class="vpc-network-diagram">
        <div class="vpc-container">
          <div class="vpc-boundary">
            <span class="vpc-label">${vpc.name}</span>
            <span class="vpc-cidr-label">${vpc.cidr}</span>
            <div class="subnets-container">
              ${vpc.subnets.map((subnet) => this.renderSubnetNode(subnet)).join("")}
            </div>
          </div>
        </div>
        <div class="subnet-legend">
          <div class="legend-item">
            <span class="legend-color public"></span>
            <span>Public</span>
          </div>
          <div class="legend-item">
            <span class="legend-color private"></span>
            <span>Private</span>
          </div>
          <div class="legend-item">
            <span class="legend-color isolated"></span>
            <span>Isolated</span>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render a subnet node
   */
  renderSubnetNode(subnet) {
    const typeClass = `subnet-${subnet.type}`;
    return `
      <div class="subnet-node ${typeClass}" data-subnet="${subnet.id}">
        <span class="subnet-name">${subnet.name}</span>
        <span class="subnet-cidr">${subnet.cidr}</span>
        <span class="subnet-az">${subnet.availabilityZone}</span>
      </div>
    `;
  }
  /**
   * Show IRSA configuration details
   */
  showIRSADetails(config) {
    const details = `
      Service Account: ${config.serviceAccount}
      Namespace: ${config.namespace}
      Cluster: ${config.clusterName}
      IAM Role: ${config.iamRole}
      Policies: ${config.policies.join(", ")}
    `;
    this.updateBlueprintInfo(details);
  }
  /**
   * Export Terraform configuration
   */
  exportTerraform() {
    const terraformConfig = this.generateTerraformConfig();
    this.updateBlueprintInfo("Terraform configuration generated (see console)");
    console.log("Terraform Configuration:", terraformConfig);
  }
  /**
   * Generate Terraform configuration
   */
  generateTerraformConfig() {
    let config = "# Terraform Configuration\n\n";
    this.vpcs.forEach((vpc) => {
      config += `resource "aws_vpc" "${vpc.id}" {
`;
      config += `  cidr_block           = "${vpc.cidr}"
`;
      config += `  enable_dns_support   = true
`;
      config += `  enable_dns_hostnames = true
`;
      config += `  tags = {
`;
      config += `    Name = "${vpc.name}"
`;
      config += `    Environment = "${vpc.type}"
`;
      config += `  }
`;
      config += `}

`;
      vpc.subnets.forEach((subnet) => {
        config += `resource "aws_subnet" "${subnet.id}" {
`;
        config += `  vpc_id                  = aws_vpc.${vpc.id}.id
`;
        config += `  cidr_block              = "${subnet.cidr}"
`;
        config += `  availability_zone       = "${subnet.availabilityZone}"
`;
        config += `  map_public_ip_on_launch = ${subnet.type === "public" ? "true" : "false"}
`;
        config += `  tags = {
`;
        config += `    Name = "${subnet.name}"
`;
        config += `    Type = "${subnet.type}"
`;
        config += `  }
`;
        config += `}

`;
      });
    });
    config += `resource "aws_ec2_transit_gateway" "${this.transitGateway.id}" {
`;
    config += `  description = "${this.transitGateway.name}"
`;
    config += `  tags = {
`;
    config += `    Name = "${this.transitGateway.name}"
`;
    config += `  }
`;
    config += `}

`;
    return config;
  }
  /**
   * Update blueprint info panel
   */
  updateBlueprintInfo(message) {
    const infoEl = this.element.querySelector("#blueprint-info");
    if (infoEl instanceof HTMLElement) {
      infoEl.textContent = message;
    }
  }
  /**
   * Get current VPC configurations
   */
  getVPCConfigs() {
    return [...this.vpcs];
  }
  /**
   * Get IRSA configurations
   */
  getIRSAConfigs() {
    return [...this.irsaConfigs];
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this.selectedVpc = null;
    super.cleanup();
  }
};
__publicField(_ArchitectureBlueprint, "DEFAULT_VPCS", [
  {
    id: "vpc-prod",
    name: "Production VPC",
    cidr: "10.0.0.0/16",
    type: "production",
    subnets: [
      { id: "public-1a", name: "Public Subnet 1A", cidr: "10.0.1.0/24", type: "public", availabilityZone: "us-east-1a" },
      { id: "public-1b", name: "Public Subnet 1B", cidr: "10.0.2.0/24", type: "public", availabilityZone: "us-east-1b" },
      { id: "private-1a", name: "Private Subnet 1A", cidr: "10.0.3.0/24", type: "private", availabilityZone: "us-east-1a" },
      { id: "private-1b", name: "Private Subnet 1B", cidr: "10.0.4.0/24", type: "private", availabilityZone: "us-east-1b" },
      { id: "isolated-1a", name: "Isolated Subnet 1A", cidr: "10.0.5.0/24", type: "isolated", availabilityZone: "us-east-1a" }
    ]
  },
  {
    id: "vpc-staging",
    name: "Staging VPC",
    cidr: "10.1.0.0/16",
    type: "staging",
    subnets: [
      { id: "staging-public-1a", name: "Staging Public 1A", cidr: "10.1.1.0/24", type: "public", availabilityZone: "us-east-1a" },
      { id: "staging-private-1a", name: "Staging Private 1A", cidr: "10.1.2.0/24", type: "private", availabilityZone: "us-east-1a" }
    ]
  }
]);
__publicField(_ArchitectureBlueprint, "TRANSIT_GATEWAY", {
  id: "tgw-main",
  name: "Main Transit Gateway",
  attachments: ["vpc-prod", "vpc-staging"]
});
__publicField(_ArchitectureBlueprint, "IRSA_CONFIGS", [
  {
    clusterName: "prod-cluster",
    namespace: "security",
    serviceAccount: "security-scanner",
    iamRole: "arn:aws:iam::123456789012:role/security-scanner-role",
    policies: ["AmazonS3ReadOnlyAccess", "CloudWatchLogsFullAccess"]
  },
  {
    clusterName: "prod-cluster",
    namespace: "application",
    serviceAccount: "api-service",
    iamRole: "arn:aws:iam::123456789012:role/api-service-role",
    policies: ["AmazonDynamoDBFullAccess", "AmazonSQSFullAccess"]
  }
]);
var ArchitectureBlueprint = _ArchitectureBlueprint;

// src/features/terminal-contact/TerminalContact.ts
var _TerminalContact = class _TerminalContact extends InteractiveFeature {
  constructor(elementId = "terminal-contact") {
    super(elementId);
    __publicField(this, "commands");
    __publicField(this, "session");
    __publicField(this, "commandHistory");
    __publicField(this, "historyIndex");
    this.commands = _TerminalContact.DEFAULT_COMMANDS;
    this.session = {
      history: [],
      currentDirectory: "/home/guest",
      user: "guest",
      isLoggedIn: false
    };
    this.commandHistory = [];
    this.historyIndex = -1;
  }
  /**
   * Initialize the terminal contact module
   */
  initialize() {
    this.renderTerminal();
    this.setupEventListeners();
    this.displayWelcomeMessage();
  }
  /**
   * Hook for activation
   */
  onActivate() {
    this.focusInput();
  }
  /**
   * Hook for deactivation
   */
  onDeactivate() {
  }
  /**
   * Render the terminal UI
   */
  renderTerminal() {
    this.element.innerHTML = `
      <div class="terminal-container">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="terminal-button close"></span>
            <span class="terminal-button minimize"></span>
            <span class="terminal-button maximize"></span>
          </div>
          <div class="terminal-title">starlyn-cli v1.0.0</div>
        </div>

        <div class="terminal-body">
          <div class="terminal-output" id="terminal-output">
            <!-- Output will be rendered here -->
          </div>

          <div class="terminal-input-line">
            <span class="terminal-prompt" id="terminal-prompt">guest@starlyn-security:~$</span>
            <input
              type="text"
              class="terminal-input"
              id="terminal-input"
              autocomplete="off"
              spellcheck="false"
              placeholder="Type 'help' for available commands..."
            />
          </div>
        </div>

        <div class="terminal-footer">
          <span class="terminal-info">Press Tab for autocomplete | \u2191/\u2193 for history</span>
        </div>
      </div>
    `;
  }
  /**
   * Display welcome message
   */
  displayWelcomeMessage() {
    const welcomeMessage = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                    STARLYN SECURITY CLI v1.0.0                      \u2551
\u2551              Secure Communication Terminal Interface                 \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

Welcome to the Starlyn Security CLI.
This terminal provides a secure, command-line interface for communication
and information retrieval.

Type 'help' to see available commands or 'view-skills' to see my expertise.

SECURITY NOTICE: All communications are encrypted and logged for audit purposes.
`;
    this.appendOutput(welcomeMessage, "system");
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const input = this.element.querySelector("#terminal-input");
    if (!(input instanceof HTMLInputElement)) return;
    this.addEventListener(input, "keydown", (e) => this.handleKeyDown(e));
    this.addEventListener(input, "input", () => this.handleInput());
    this.addEventListener(this.element, "click", () => this.focusInput());
  }
  /**
   * Handle keyboard input
   */
  handleKeyDown(event) {
    const input = event.target;
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        this.executeCommand(input.value);
        input.value = "";
        break;
      case "Tab":
        event.preventDefault();
        this.autocomplete(input.value);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.navigateHistory(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.navigateHistory(1);
        break;
      case "l":
        if (event.ctrlKey) {
          event.preventDefault();
          this.clearTerminal();
        }
        break;
    }
  }
  /**
   * Handle input changes
   */
  handleInput() {
  }
  /**
   * Execute a command
   */
  executeCommand(commandLine) {
    const trimmedCommand = commandLine.trim();
    if (!trimmedCommand) {
      return;
    }
    this.commandHistory.push(trimmedCommand);
    this.historyIndex = this.commandHistory.length;
    this.appendCommand(trimmedCommand);
    const parts = trimmedCommand.split(" ");
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    const command = this.findCommand(commandName);
    if (command) {
      try {
        const output = command.handler(args);
        this.appendOutput(output, "success");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Command execution failed";
        this.appendOutput(`Error: ${errorMessage}`, "error");
      }
    } else {
      this.appendOutput(`Command not found: ${commandName}. Type 'help' for available commands.`, "error");
    }
    this.scrollToBottom();
  }
  /**
   * Find a command by name or alias
   */
  findCommand(name) {
    return this.commands.find(
      (cmd) => cmd.name === name || cmd.aliases?.includes(name)
    );
  }
  /**
   * Autocomplete command
   */
  autocomplete(input) {
    const parts = input.split(" ");
    const currentPart = parts[parts.length - 1].toLowerCase();
    if (parts.length === 1) {
      const matches = this.commands.filter(
        (cmd) => cmd.name.startsWith(currentPart) || cmd.aliases?.some((alias) => alias.startsWith(currentPart))
      );
      if (matches.length === 1) {
        const inputElement = this.element.querySelector("#terminal-input");
        if (inputElement instanceof HTMLInputElement) {
          inputElement.value = matches[0].name + " ";
        }
      } else if (matches.length > 1) {
        const names = matches.map((cmd) => cmd.name).sort().join("  ");
        this.appendOutput(names, "info");
      }
    }
  }
  /**
   * Navigate command history
   */
  navigateHistory(direction) {
    const inputElement = this.element.querySelector("#terminal-input");
    if (!(inputElement instanceof HTMLInputElement)) return;
    if (this.commandHistory.length === 0) return;
    this.historyIndex += direction;
    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      inputElement.value = "";
      return;
    }
    inputElement.value = this.commandHistory[this.historyIndex];
  }
  /**
   * Append command to output
   */
  appendCommand(command) {
    const prompt = this.element.querySelector("#terminal-prompt");
    const promptText = prompt ? prompt.textContent : "$";
    this.appendOutput(`${promptText} ${command}`, "command");
  }
  /**
   * Append output to terminal
   */
  appendOutput(text, type = "info") {
    const output = this.element.querySelector("#terminal-output");
    if (!(output instanceof HTMLElement)) return;
    const line = document.createElement("div");
    line.className = `terminal-line terminal-${type}`;
    line.textContent = text;
    output.appendChild(line);
  }
  /**
   * Clear terminal
   */
  clearTerminal() {
    const output = this.element.querySelector("#terminal-output");
    if (output instanceof HTMLElement) {
      output.innerHTML = "";
    }
    this.appendOutput("Terminal cleared.", "system");
  }
  /**
   * Scroll to bottom of terminal
   */
  scrollToBottom() {
    const output = this.element.querySelector("#terminal-output");
    if (output instanceof HTMLElement) {
      output.scrollTop = output.scrollHeight;
    }
  }
  /**
   * Focus input field
   */
  focusInput() {
    const input = this.element.querySelector("#terminal-input");
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }
  /**
   * Add a custom command
   */
  addCommand(command) {
    this.commands.push(command);
  }
  /**
   * Get command history
   */
  getCommandHistory() {
    return [...this.commandHistory];
  }
  /**
   * Get session information
   */
  getSessionInfo() {
    return { ...this.session };
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this.commandHistory = [];
    super.cleanup();
  }
};
__publicField(_TerminalContact, "DEFAULT_COMMANDS", [
  {
    name: "help",
    description: "Display available commands",
    handler: () => {
      const commands = _TerminalContact.DEFAULT_COMMANDS.map((cmd) => {
        const aliases = cmd.aliases ? ` (${cmd.aliases.join(", ")})` : "";
        return `  ${cmd.name}${aliases} - ${cmd.description}`;
      }).join("\n");
      return `Available commands:
${commands}`;
    }
  },
  {
    name: "view-skills",
    description: "View professional skills and expertise",
    handler: () => {
      return `
Professional Skills:
  Cloud Security: AWS, Cloudflare, Kubernetes, Docker, Terraform
  Languages: Python, Go, Bash, SQL, JavaScript
  Security Tools: Datadog, Splunk, Wiz, GuardDuty, AWS WAF
  Identity: OAuth 2.0, SAML, IAM, IRSA
  Automation: SOAR pipelines, incident response automation
`;
    }
  },
  {
    name: "view-experience",
    description: "View work experience",
    handler: () => {
      return `
Work Experience:
  Senior Security Software Engineer - Capital One (2023-Present)
  Security Software Engineer - Capital One (2021-2023)
  Associate Software Engineer - Capital One (2019-2021)
`;
    }
  },
  {
    name: "view-projects",
    description: "View featured projects",
    handler: () => {
      return `
Featured Projects:
  StarShell Perimeter - Cloud security interception engine
  Automated SOAR - Forensic triage pipeline
  PureProof - Digital identity platform
`;
    }
  },
  {
    name: "send-message",
    description: "Send a secure message (usage: send-message --from <email> --message <text>)",
    handler: (args) => {
      const emailIndex = args.indexOf("--from");
      const messageIndex = args.indexOf("--message");
      if (emailIndex === -1 || messageIndex === -1) {
        return "Usage: send-message --from <email> --message <text>";
      }
      const email = args[emailIndex + 1];
      const message = args.slice(messageIndex + 1).join(" ");
      if (!email || !message) {
        return "Error: Email and message are required";
      }
      const formData = {
        email,
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      sessionStorage.setItem("terminalMessage", JSON.stringify(formData));
      return `Message queued for secure transmission.
From: ${email}
Message: ${message}

Type 'execute' to send or 'clear' to cancel.`;
    }
  },
  {
    name: "execute",
    description: "Execute the queued message",
    handler: () => {
      const storedMessage = sessionStorage.getItem("terminalMessage");
      if (!storedMessage) {
        return "No message queued. Use send-message first.";
      }
      const formData = JSON.parse(storedMessage);
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");
      if (emailInput && messageInput) {
        emailInput.value = formData.email;
        messageInput.value = formData.message;
        const form = document.getElementById("contactForm");
        if (form) {
          form.dispatchEvent(new Event("submit"));
        }
        sessionStorage.removeItem("terminalMessage");
        return "Message transmitted securely via encrypted channel.";
      }
      return "Error: Unable to access contact form.";
    }
  },
  {
    name: "clear",
    description: "Clear the terminal screen",
    handler: () => {
      const terminalOutput = document.querySelector(".terminal-output");
      if (terminalOutput) {
        terminalOutput.innerHTML = "";
      }
      return "Terminal cleared.";
    }
  },
  {
    name: "whoami",
    description: "Display current user information",
    handler: () => {
      return `User: guest@starlyn-security
Session: ${Date.now()}
Permissions: read-only`;
    }
  },
  {
    name: "ls",
    description: "List available sections",
    aliases: ["dir"],
    handler: () => {
      return `
Available Sections:
  about/          - Professional summary
  experience/     - Work experience
  education/      - Education & certifications
  projects/       - Featured projects
  contact/        - Contact information
`;
    }
  },
  {
    name: "cd",
    description: "Navigate to section (usage: cd <section>)",
    handler: (args) => {
      if (args.length === 0) {
        return "Usage: cd <section>";
      }
      const section = args[0];
      const validSections = ["about", "experience", "education", "projects", "contact"];
      if (validSections.includes(section)) {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return `Navigated to /${section}`;
        }
        return `Section /${section} not found in DOM`;
      }
      return `Section /${section} does not exist. Use 'ls' to see available sections.`;
    }
  },
  {
    name: "status",
    description: "Check system status",
    handler: () => {
      return `
System Status:
  Perimeter: SECURE
  Firewall: ACTIVE
  WAF: TUNED
  Uptime: 99.9%
  Last Audit: 2024-01-15
  Threat Level: LOW
`;
    }
  }
]);
var TerminalContact = _TerminalContact;
export {
  ArchitectureBlueprint,
  InteractiveFeature,
  SOARWorkflowViewer,
  SecurityFeature,
  TelemetryDashboard,
  TelemetryFeature,
  TerminalContact,
  ThreatSimulator
};
