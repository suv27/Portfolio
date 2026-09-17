import { InteractiveFeature } from '../base.js';

/**
 * VPC configuration
 */
interface VPCConfig {
  id: string;
  name: string;
  cidr: string;
  type: 'production' | 'staging' | 'dev';
  subnets: SubnetConfig[];
}

/**
 * Subnet configuration
 */
interface SubnetConfig {
  id: string;
  name: string;
  cidr: string;
  type: 'public' | 'private' | 'isolated';
  availabilityZone: string;
}

/**
 * Transit Gateway configuration
 */
interface TransitGatewayConfig {
  id: string;
  name: string;
  attachments: string[];
}

/**
 * Kubernetes IRSA configuration
 */
interface IRSAConfig {
  clusterName: string;
  namespace: string;
  serviceAccount: string;
  iamRole: string;
  policies: string[];
}

/**
 * Cloud Architecture Blueprint Explorer
 * Tabbed 2D/3D blueprint viewer showing multi-account AWS VPC network designs
 */
export class ArchitectureBlueprint extends InteractiveFeature {
  private static readonly DEFAULT_VPCS: VPCConfig[] = [
    {
      id: 'vpc-prod',
      name: 'Production VPC',
      cidr: '10.0.0.0/16',
      type: 'production',
      subnets: [
        { id: 'public-1a', name: 'Public Subnet 1A', cidr: '10.0.1.0/24', type: 'public', availabilityZone: 'us-east-1a' },
        { id: 'public-1b', name: 'Public Subnet 1B', cidr: '10.0.2.0/24', type: 'public', availabilityZone: 'us-east-1b' },
        { id: 'private-1a', name: 'Private Subnet 1A', cidr: '10.0.3.0/24', type: 'private', availabilityZone: 'us-east-1a' },
        { id: 'private-1b', name: 'Private Subnet 1B', cidr: '10.0.4.0/24', type: 'private', availabilityZone: 'us-east-1b' },
        { id: 'isolated-1a', name: 'Isolated Subnet 1A', cidr: '10.0.5.0/24', type: 'isolated', availabilityZone: 'us-east-1a' }
      ]
    },
    {
      id: 'vpc-staging',
      name: 'Staging VPC',
      cidr: '10.1.0.0/16',
      type: 'staging',
      subnets: [
        { id: 'staging-public-1a', name: 'Staging Public 1A', cidr: '10.1.1.0/24', type: 'public', availabilityZone: 'us-east-1a' },
        { id: 'staging-private-1a', name: 'Staging Private 1A', cidr: '10.1.2.0/24', type: 'private', availabilityZone: 'us-east-1a' }
      ]
    }
  ];

  private static readonly TRANSIT_GATEWAY: TransitGatewayConfig = {
    id: 'tgw-main',
    name: 'Main Transit Gateway',
    attachments: ['vpc-prod', 'vpc-staging']
  };

  private static readonly IRSA_CONFIGS: IRSAConfig[] = [
    {
      clusterName: 'prod-cluster',
      namespace: 'security',
      serviceAccount: 'security-scanner',
      iamRole: 'arn:aws:iam::123456789012:role/security-scanner-role',
      policies: ['AmazonS3ReadOnlyAccess', 'CloudWatchLogsFullAccess']
    },
    {
      clusterName: 'prod-cluster',
      namespace: 'application',
      serviceAccount: 'api-service',
      iamRole: 'arn:aws:iam::123456789012:role/api-service-role',
      policies: ['AmazonDynamoDBFullAccess', 'AmazonSQSFullAccess']
    }
  ];

  private vpcs: VPCConfig[];
  private transitGateway: TransitGatewayConfig;
  private irsaConfigs: IRSAConfig[];
  private activeTab: 'vpc' | 'tgw' | 'irsa';
  private selectedVpc: VPCConfig | null;
  private viewMode: '2d' | '3d';

  constructor(elementId: string = 'architecture-blueprint') {
    super(elementId);
    this.vpcs = ArchitectureBlueprint.DEFAULT_VPCS;
    this.transitGateway = ArchitectureBlueprint.TRANSIT_GATEWAY;
    this.irsaConfigs = ArchitectureBlueprint.IRSA_CONFIGS;
    this.activeTab = 'vpc';
    this.selectedVpc = null;
    this.viewMode = '2d';
  }

  /**
   * Initialize the architecture blueprint viewer
   */
  public initialize(): void {
    this.renderBlueprint();
    this.setupEventListeners();
  }

  /**
   * Hook for activation
   */
  protected onActivate(): void {
    // Activation logic if needed
  }

  /**
   * Hook for deactivation
   */
  protected onDeactivate(): void {
    this.selectedVpc = null;
  }

  /**
   * Render the blueprint viewer UI
   */
  private renderBlueprint(): void {
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
  private renderVPCTab(): string {
    return `
      <div class="vpc-overview">
        <div class="vpc-list">
          ${this.vpcs.map(vpc => this.renderVPCCard(vpc)).join('')}
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
  private renderVPCCard(vpc: VPCConfig): string {
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
  private renderTGWTab(): string {
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
            ${this.transitGateway.attachments.map(attachmentId => {
              const vpc = this.vpcs.find(v => v.id === attachmentId);
              return vpc ? `
                <div class="tgw-attachment" data-attachment="${attachmentId}">
                  <div class="attachment-line"></div>
                  <div class="attachment-node">
                    <span class="attachment-name">${vpc.name}</span>
                    <span class="attachment-cidr">${vpc.cidr}</span>
                  </div>
                </div>
              ` : '';
            }).join('')}
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
  private renderIRSATab(): string {
    return `
      <div class="irsa-overview">
        <div class="irsa-list">
          ${this.irsaConfigs.map(config => this.renderIRSAConfig(config)).join('')}
        </div>
        <div class="irsa-details">
          <h4>IAM Roles for Service Accounts (IRSA)</h4>
          <p>Configures fine-grained IAM permissions for Kubernetes pods using OpenID Connect.</p>
          <div class="irsa-benefits">
            <div class="benefit">
              <span class="benefit-icon">🔒</span>
              <span class="benefit-text">Least privilege access</span>
            </div>
            <div class="benefit">
              <span class="benefit-icon">🎯</span>
              <span class="benefit-text">Pod-level IAM scoping</span>
            </div>
            <div class="benefit">
              <span class="benefit-icon">🚀</span>
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
  private renderIRSAConfig(config: IRSAConfig): string {
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
            ${config.policies.map(policy => `<span class="policy-tag">${policy}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Tab buttons
    const tabButtons = this.element.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      this.addEventListener(button as HTMLElement, 'click', (e) => {
        const target = e.target as HTMLElement;
        const tab = target.dataset.tab as 'vpc' | 'tgw' | 'irsa';
        this.switchTab(tab);
      });
    });

    // View mode buttons
    const viewButtons = this.element.querySelectorAll('[data-action="set-view"]');
    viewButtons.forEach(button => {
      this.addEventListener(button as HTMLElement, 'click', (e) => {
        const target = e.target as HTMLElement;
        const view = target.dataset.view as '2d' | '3d';
        this.setViewMode(view);
      });
    });

    // Export button
    const exportButton = this.element.querySelector('[data-action="export"]');
    if (exportButton) {
      this.addEventListener(exportButton as HTMLElement, 'click', () => {
        this.exportTerraform();
      });
    }

    // VPC cards
    this.vpcs.forEach(vpc => {
      const vpcCard = this.element.querySelector(`[data-vpc="${vpc.id}"]`);
      if (vpcCard) {
        this.addEventListener(vpcCard as HTMLElement, 'click', () => {
          this.selectVPC(vpc);
        });
      }
    });

    // IRSA configs
    this.irsaConfigs.forEach(config => {
      const irsaConfig = this.element.querySelector(`[data-irsa="${config.serviceAccount}"]`);
      if (irsaConfig) {
        this.addEventListener(irsaConfig as HTMLElement, 'click', () => {
          this.showIRSADetails(config);
        });
      }
    });
  }

  /**
   * Switch between tabs
   */
  private switchTab(tab: 'vpc' | 'tgw' | 'irsa'): void {
    this.activeTab = tab;

    // Update tab buttons
    const tabButtons = this.element.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      const buttonTab = button.getAttribute('data-tab');
      if (buttonTab === tab) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Update tab content
    const tabContents = this.element.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = this.element.querySelector(`#tab-${tab}`);
    if (activeContent instanceof HTMLElement) {
      activeContent.classList.add('active');
    }
  }

  /**
   * Set view mode (2D or 3D)
   */
  private setViewMode(mode: '2d' | '3d'): void {
    this.viewMode = mode;

    const viewButtons = this.element.querySelectorAll('[data-action="set-view"]');
    viewButtons.forEach(button => {
      const buttonView = button.getAttribute('data-view');
      if (buttonView === mode) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    this.updateBlueprintInfo(`View mode switched to ${mode.toUpperCase()}`);
  }

  /**
   * Select a VPC
   */
  private selectVPC(vpc: VPCConfig): void {
    this.selectedVpc = vpc;
    this.renderVPCVisualization(vpc);
    this.updateBlueprintInfo(`Selected: ${vpc.name} (${vpc.cidr}) - ${vpc.subnets.length} subnets`);
  }

  /**
   * Render VPC network visualization
   */
  private renderVPCVisualization(vpc: VPCConfig): void {
    const visualization = this.element.querySelector('#vpc-visualization');
    if (!(visualization instanceof HTMLElement)) return;

    visualization.innerHTML = `
      <div class="vpc-network-diagram">
        <div class="vpc-container">
          <div class="vpc-boundary">
            <span class="vpc-label">${vpc.name}</span>
            <span class="vpc-cidr-label">${vpc.cidr}</span>
            <div class="subnets-container">
              ${vpc.subnets.map(subnet => this.renderSubnetNode(subnet)).join('')}
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
  private renderSubnetNode(subnet: SubnetConfig): string {
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
  private showIRSADetails(config: IRSAConfig): void {
    const details = `
      Service Account: ${config.serviceAccount}
      Namespace: ${config.namespace}
      Cluster: ${config.clusterName}
      IAM Role: ${config.iamRole}
      Policies: ${config.policies.join(', ')}
    `;
    this.updateBlueprintInfo(details);
  }

  /**
   * Export Terraform configuration
   */
  private exportTerraform(): void {
    const terraformConfig = this.generateTerraformConfig();
    this.updateBlueprintInfo('Terraform configuration generated (see console)');
    console.log('Terraform Configuration:', terraformConfig);
  }

  /**
   * Generate Terraform configuration
   */
  private generateTerraformConfig(): string {
    let config = '# Terraform Configuration\n\n';

    // VPC resources
    this.vpcs.forEach(vpc => {
      config += `resource "aws_vpc" "${vpc.id}" {\n`;
      config += `  cidr_block           = "${vpc.cidr}"\n`;
      config += `  enable_dns_support   = true\n`;
      config += `  enable_dns_hostnames = true\n`;
      config += `  tags = {\n`;
      config += `    Name = "${vpc.name}"\n`;
      config += `    Environment = "${vpc.type}"\n`;
      config += `  }\n`;
      config += `}\n\n`;

      // Subnets
      vpc.subnets.forEach(subnet => {
        config += `resource "aws_subnet" "${subnet.id}" {\n`;
        config += `  vpc_id                  = aws_vpc.${vpc.id}.id\n`;
        config += `  cidr_block              = "${subnet.cidr}"\n`;
        config += `  availability_zone       = "${subnet.availabilityZone}"\n`;
        config += `  map_public_ip_on_launch = ${subnet.type === 'public' ? 'true' : 'false'}\n`;
        config += `  tags = {\n`;
        config += `    Name = "${subnet.name}"\n`;
        config += `    Type = "${subnet.type}"\n`;
        config += `  }\n`;
        config += `}\n\n`;
      });
    });

    // Transit Gateway
    config += `resource "aws_ec2_transit_gateway" "${this.transitGateway.id}" {\n`;
    config += `  description = "${this.transitGateway.name}"\n`;
    config += `  tags = {\n`;
    config += `    Name = "${this.transitGateway.name}"\n`;
    config += `  }\n`;
    config += `}\n\n`;

    return config;
  }

  /**
   * Update blueprint info panel
   */
  private updateBlueprintInfo(message: string): void {
    const infoEl = this.element.querySelector('#blueprint-info');
    if (infoEl instanceof HTMLElement) {
      infoEl.textContent = message;
    }
  }

  /**
   * Get current VPC configurations
   */
  public getVPCConfigs(): VPCConfig[] {
    return [...this.vpcs];
  }

  /**
   * Get IRSA configurations
   */
  public getIRSAConfigs(): IRSAConfig[] {
    return [...this.irsaConfigs];
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.selectedVpc = null;
    super.cleanup();
  }
}
