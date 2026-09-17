import { InteractiveFeature } from '../base.js';

/**
 * Network node configuration
 */
interface NetworkNode {
  id: string;
  name: string;
  type: 'cloudflare' | 'waf' | 'alb' | 'microservice';
  x: number;
  y: number;
  status: 'active' | 'blocked' | 'warning';
}

/**
 * Attack vector configuration
 */
interface AttackVector {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trafficVolume: number;
}

/**
 * Traffic flow between nodes
 */
interface TrafficFlow {
  from: string;
  to: string;
  volume: number;
  status: 'allowed' | 'blocked' | 'filtered';
}

/**
 * Interactive L7 Threat Mitigation Simulator
 * Visual node map of enterprise ingress architecture with attack simulation
 */
export class ThreatSimulator extends InteractiveFeature {
  private static readonly DEFAULT_NODES: NetworkNode[] = [
    { id: 'cloudflare', name: 'Cloudflare', type: 'cloudflare', x: 10, y: 50, status: 'active' },
    { id: 'waf', name: 'AWS WAF', type: 'waf', x: 30, y: 50, status: 'active' },
    { id: 'alb', name: 'ALB', type: 'alb', x: 50, y: 50, status: 'active' },
    { id: 'service1', name: 'Auth Service', type: 'microservice', x: 70, y: 30, status: 'active' },
    { id: 'service2', name: 'API Gateway', type: 'microservice', x: 70, y: 50, status: 'active' },
    { id: 'service3', name: 'Data Service', type: 'microservice', x: 70, y: 70, status: 'active' }
  ];

  private static readonly ATTACK_VECTORS: AttackVector[] = [
    {
      id: 'sqli',
      name: 'SQL Injection',
      description: 'OWASP Top 10 SQLi attack pattern detected',
      severity: 'critical',
      trafficVolume: 1000
    },
    {
      id: 'scraper',
      name: 'Aggregator Scraping',
      description: 'Plaid/Intuit aggregator scraping detected',
      severity: 'medium',
      trafficVolume: 500
    },
    {
      id: 'credential-stuffing',
      name: 'Credential Stuffing',
      description: 'Automated credential stuffing attack',
      severity: 'high',
      trafficVolume: 800
    },
    {
      id: 'ddos',
      name: 'DDoS Attack',
      description: 'Distributed denial of service attempt',
      severity: 'critical',
      trafficVolume: 2000
    }
  ];

  private nodes: NetworkNode[];
  private attackVectors: AttackVector[];
  private trafficFlows: TrafficFlow[];
  private activeAttack: AttackVector | null;
  private selectedNode: NetworkNode | null;

  constructor(elementId: string = 'threat-simulator') {
    super(elementId);
    this.nodes = ThreatSimulator.DEFAULT_NODES;
    this.attackVectors = ThreatSimulator.ATTACK_VECTORS;
    this.trafficFlows = [];
    this.activeAttack = null;
    this.selectedNode = null;
  }

  /**
   * Initialize the threat simulator
   */
  public initialize(): void {
    this.renderSimulator();
    this.setupEventListeners();
    this.initializeTrafficFlows();
  }

  /**
   * Hook for activation
   */
  protected onActivate(): void {
    this.startSimulation();
  }

  /**
   * Hook for deactivation
   */
  protected onDeactivate(): void {
    this.stopSimulation();
    this.activeAttack = null;
    this.resetNodeStatuses();
  }

  /**
   * Initialize default traffic flows
   */
  private initializeTrafficFlows(): void {
    this.trafficFlows = [
      { from: 'cloudflare', to: 'waf', volume: 100, status: 'allowed' },
      { from: 'waf', to: 'alb', volume: 100, status: 'allowed' },
      { from: 'alb', to: 'service1', volume: 30, status: 'allowed' },
      { from: 'alb', to: 'service2', volume: 40, status: 'allowed' },
      { from: 'alb', to: 'service3', volume: 30, status: 'allowed' }
    ];
  }

  /**
   * Render the simulator UI
   */
  private renderSimulator(): void {
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
              ${this.attackVectors.map(vector => this.renderAttackVector(vector)).join('')}
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
              ${this.trafficFlows.map(flow => this.renderTrafficFlow(flow)).join('')}
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
  private renderAttackVector(vector: AttackVector): string {
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
  private renderConnections(): string {
    return this.trafficFlows.map(flow => {
      const fromNode = this.nodes.find(n => n.id === flow.from);
      const toNode = this.nodes.find(n => n.id === flow.to);
      if (!fromNode || !toNode) return '';

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
    }).join('');
  }

  /**
   * Render network nodes
   */
  private renderNodes(): string {
    return this.nodes.map(node => {
      const statusClass = `node-${node.status}`;
      const typeIcon = this.getNodeIcon(node.type);
      return `
        <g class="network-node ${statusClass}" data-node="${node.id}" transform="translate(${node.x}, ${node.y})">
          <circle r="4" class="node-circle" />
          <text y="8" text-anchor="middle" class="node-label">${node.name}</text>
          <text y="12" text-anchor="middle" class="node-icon">${typeIcon}</text>
        </g>
      `;
    }).join('');
  }

  /**
   * Get icon for node type
   */
  private getNodeIcon(type: string): string {
    const icons: Record<string, string> = {
      cloudflare: '☁️',
      waf: '🛡️',
      alb: '⚖️',
      microservice: '🔧'
    };
    return icons[type] || '📦';
  }

  /**
   * Render a traffic flow entry
   */
  private renderTrafficFlow(flow: TrafficFlow): string {
    const fromNode = this.nodes.find(n => n.id === flow.from);
    const toNode = this.nodes.find(n => n.id === flow.to);
    const statusClass = `flow-${flow.status}`;

    return `
      <div class="traffic-flow ${statusClass}" data-flow-from="${flow.from}" data-flow-to="${flow.to}">
        <span class="flow-path">${fromNode?.name} → ${toNode?.name}</span>
        <span class="flow-volume">${flow.volume} req/s</span>
        <span class="flow-status">${flow.status}</span>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Attack vector buttons
    this.attackVectors.forEach(vector => {
      const button = this.element.querySelector(`[data-attack="${vector.id}"]`);
      if (button) {
        this.addEventListener(button as HTMLElement, 'click', () => {
          this.simulateAttack(vector);
        });
      }
    });

    // Control buttons
    const resetButton = this.element.querySelector('[data-action="reset"]');
    if (resetButton) {
      this.addEventListener(resetButton as HTMLElement, 'click', () => {
        this.resetSimulation();
      });
    }

    const startButton = this.element.querySelector('[data-action="start"]');
    if (startButton) {
      this.addEventListener(startButton as HTMLElement, 'click', () => {
        this.startSimulation();
      });
    }

    // Node selection
    this.nodes.forEach(node => {
      const nodeElement = this.element.querySelector(`[data-node="${node.id}"]`);
      if (nodeElement) {
        this.addEventListener(nodeElement as HTMLElement, 'click', () => {
          this.selectNode(node);
        });
      }
    });
  }

  /**
   * Simulate an attack
   */
  private simulateAttack(vector: AttackVector): void {
    this.activeAttack = vector;
    this.updateStatusMessage(`Simulating ${vector.name} attack...`);
    this.processAttackTraffic(vector);
  }

  /**
   * Process attack traffic through the network
   */
  private processAttackTraffic(vector: AttackVector): void {
    // Simulate traffic flow with attack
    this.trafficFlows = this.trafficFlows.map(flow => {
      const attackVolume = vector.trafficVolume;
      let newVolume = flow.volume;
      let newStatus = flow.status;

      // Cloudflare filters some traffic
      if (flow.from === 'cloudflare' && flow.to === 'waf') {
        const blockedAmount = attackVolume * 0.3; // 30% blocked at edge
        newVolume = flow.volume + attackVolume - blockedAmount;
        newStatus = 'filtered';
      }

      // WAF blocks attack patterns
      if (flow.from === 'waf' && flow.to === 'alb') {
        if (vector.severity === 'critical' || vector.severity === 'high') {
          const blockedAmount = attackVolume * 0.8; // 80% blocked by WAF
          newVolume = flow.volume + (attackVolume * 0.2);
          newStatus = 'blocked';
        } else {
          newVolume = flow.volume + attackVolume * 0.5;
          newStatus = 'filtered';
        }
      }

      // Update node statuses based on attack
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
  private updateNodeStatus(nodeId: string, severity: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      if (severity === 'critical') {
        node.status = 'blocked';
      } else if (severity === 'high') {
        node.status = 'warning';
      } else {
        node.status = 'active';
      }
    }
  }

  /**
   * Reset node statuses
   */
  private resetNodeStatuses(): void {
    this.nodes.forEach(node => {
      node.status = 'active';
    });
  }

  /**
   * Update the visualization
   */
  private updateVisualization(): void {
    // Update connections
    this.trafficFlows.forEach(flow => {
      const connection = this.element.querySelector(`[data-from="${flow.from}"][data-to="${flow.to}"]`);
      if (connection instanceof HTMLElement) {
        connection.setAttribute('class', `network-connection connection-${flow.status}`);
      }
    });

    // Update nodes
    this.nodes.forEach(node => {
      const nodeElement = this.element.querySelector(`[data-node="${node.id}"]`);
      if (nodeElement instanceof HTMLElement) {
        nodeElement.setAttribute('class', `network-node node-${node.status}`);
      }
    });

    // Update traffic flows
    this.trafficFlows.forEach(flow => {
      const flowElement = this.element.querySelector(`[data-flow-from="${flow.from}"][data-flow-to="${flow.to}"]`);
      if (flowElement instanceof HTMLElement) {
        const volumeEl = flowElement.querySelector('.flow-volume');
        const statusEl = flowElement.querySelector('.flow-status');
        if (volumeEl instanceof HTMLElement) volumeEl.textContent = `${flow.volume} req/s`;
        if (statusEl instanceof HTMLElement) statusEl.textContent = flow.status;
        flowElement.setAttribute('class', `traffic-flow flow-${flow.status}`);
      }
    });
  }

  /**
   * Update traffic statistics
   */
  private updateTrafficStats(): void {
    const totalTraffic = this.trafficFlows.reduce((sum, flow) => sum + flow.volume, 0);
    const blockedTraffic = this.trafficFlows
      .filter(flow => flow.status === 'blocked')
      .reduce((sum, flow) => sum + flow.volume, 0);
    const allowedTraffic = this.trafficFlows
      .filter(flow => flow.status === 'allowed')
      .reduce((sum, flow) => sum + flow.volume, 0);

    const totalEl = this.element.querySelector('#total-traffic');
    const blockedEl = this.element.querySelector('#blocked-traffic');
    const allowedEl = this.element.querySelector('#allowed-traffic');

    if (totalEl instanceof HTMLElement) totalEl.textContent = totalTraffic.toString();
    if (blockedEl instanceof HTMLElement) blockedEl.textContent = blockedTraffic.toString();
    if (allowedEl instanceof HTMLElement) allowedEl.textContent = allowedTraffic.toString();
  }

  /**
   * Update status message
   */
  private updateStatusMessage(message: string): void {
    const statusEl = this.element.querySelector('#simulator-status');
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = message;
    }
  }

  /**
   * Select a node
   */
  private selectNode(node: NetworkNode): void {
    this.selectedNode = node;
    this.updateStatusMessage(`Selected: ${node.name} (${node.type}) - Status: ${node.status}`);
  }

  /**
   * Start simulation
   */
  private startSimulation(): void {
    this.updateStatusMessage('Simulation started. Select an attack vector to begin.');
  }

  /**
   * Stop simulation
   */
  private stopSimulation(): void {
    this.updateStatusMessage('Simulation stopped.');
  }

  /**
   * Reset simulation
   */
  private resetSimulation(): void {
    this.activeAttack = null;
    this.resetNodeStatuses();
    this.initializeTrafficFlows();
    this.updateVisualization();
    this.updateTrafficStats();
    this.updateStatusMessage('Simulation reset. System ready.');
  }

  /**
   * Get current traffic flows
   */
  public getTrafficFlows(): TrafficFlow[] {
    return [...this.trafficFlows];
  }

  /**
   * Get current node statuses
   */
  public getNodeStatuses(): Record<string, string> {
    return this.nodes.reduce((acc, node) => {
      acc[node.id] = node.status;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.activeAttack = null;
    this.selectedNode = null;
    super.cleanup();
  }
}
