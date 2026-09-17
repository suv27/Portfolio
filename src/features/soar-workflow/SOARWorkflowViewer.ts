import { InteractiveFeature } from '../base.js';

/**
 * Workflow step configuration
 */
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'ingestion' | 'analysis' | 'action' | 'notification';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  duration: number;
  dependencies: string[];
}

/**
 * Workflow configuration
 */
interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  totalDuration: number;
}

/**
 * Automated SOAR & Triage Workflow Viewer
 * Interactive pipeline diagram modeled after incident response playbooks
 */
export class SOARWorkflowViewer extends InteractiveFeature {
  private static readonly DEFAULT_WORKFLOWS: Workflow[] = [
    {
      id: 'incident-response',
      name: 'Incident Response Pipeline',
      description: 'Automated incident response from alert to resolution',
      steps: [
        {
          id: 'alert-ingestion',
          name: 'Alert Ingestion',
          description: 'Receive and parse alerts from Splunk/Datadog',
          type: 'ingestion',
          status: 'pending',
          duration: 2,
          dependencies: []
        },
        {
          id: 'artifact-extraction',
          name: 'Artifact Extraction',
          description: 'Extract IP addresses, user IDs, and timestamps',
          type: 'analysis',
          status: 'pending',
          duration: 5,
          dependencies: ['alert-ingestion']
        },
        {
          id: 'threat-enrichment',
          name: 'Threat Enrichment',
          description: 'Cross-reference with threat intelligence feeds',
          type: 'analysis',
          status: 'pending',
          duration: 3,
          dependencies: ['artifact-extraction']
        },
        {
          id: 'iam-isolation',
          name: 'IAM Account Isolation',
          description: 'Disable compromised IAM credentials',
          type: 'action',
          status: 'pending',
          duration: 8,
          dependencies: ['threat-enrichment']
        },
        {
          id: 'ticket-generation',
          name: 'Ticket Generation',
          description: 'Create incident ticket in Jira/ServiceNow',
          type: 'notification',
          status: 'pending',
          duration: 2,
          dependencies: ['iam-isolation']
        },
        {
          id: 'notification',
          name: 'Team Notification',
          description: 'Notify on-call security team via Slack/PagerDuty',
          type: 'notification',
          status: 'pending',
          duration: 1,
          dependencies: ['ticket-generation']
        }
      ],
      totalDuration: 21
    }
  ];

  private workflows: Workflow[];
  private activeWorkflow: Workflow | null;
  private currentStepIndex: number;
  private executionTimer: number | null;

  constructor(elementId: string = 'soar-workflow-viewer') {
    super(elementId);
    this.workflows = SOARWorkflowViewer.DEFAULT_WORKFLOWS;
    this.activeWorkflow = null;
    this.currentStepIndex = 0;
    this.executionTimer = null;
  }

  /**
   * Initialize the SOAR workflow viewer
   */
  public initialize(): void {
    this.renderViewer();
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
    this.stopExecution();
    this.resetWorkflow();
  }

  /**
   * Render the workflow viewer UI
   */
  private renderViewer(): void {
    this.element.innerHTML = `
      <div class="soar-workflow-container">
        <div class="workflow-header">
          <h3>Automated SOAR & Triage Workflow</h3>
          <div class="workflow-controls">
            <select class="workflow-selector" id="workflow-selector">
              ${this.workflows.map(workflow => `
                <option value="${workflow.id}">${workflow.name}</option>
              `).join('')}
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
  private loadWorkflow(workflowId: string): void {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    this.activeWorkflow = workflow;
    this.currentStepIndex = 0;
    this.resetStepStatuses();

    // Update UI
    const descriptionEl = this.element.querySelector('#workflow-description');
    const totalStepsEl = this.element.querySelector('#total-steps');
    const totalDurationEl = this.element.querySelector('#total-duration');

    if (descriptionEl instanceof HTMLElement) descriptionEl.textContent = workflow.description;
    if (totalStepsEl instanceof HTMLElement) totalStepsEl.textContent = workflow.steps.length.toString();
    if (totalDurationEl instanceof HTMLElement) totalDurationEl.textContent = `${workflow.totalDuration}s`;

    this.renderSteps();
  }

  /**
   * Reset all step statuses
   */
  private resetStepStatuses(): void {
    if (this.activeWorkflow) {
      this.activeWorkflow.steps.forEach(step => {
        step.status = 'pending';
      });
    }
  }

  /**
   * Render workflow steps
   */
  private renderSteps(): void {
    if (!this.activeWorkflow) return;

    const stepsContainer = this.element.querySelector('#workflow-steps');
    if (!stepsContainer) return;

    stepsContainer.innerHTML = this.activeWorkflow.steps.map((step, index) => {
      const typeIcon = this.getStepTypeIcon(step.type);
      const statusClass = `step-${step.status}`;
      const connector = index < this.activeWorkflow!.steps.length - 1 ? '<div class="step-connector"></div>' : '';

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
    }).join('');
  }

  /**
   * Get icon for step type
   */
  private getStepTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      ingestion: '📥',
      analysis: '🔍',
      action: '⚡',
      notification: '📢'
    };
    return icons[type] || '📋';
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Workflow selector
    const selector = this.element.querySelector('#workflow-selector');
    if (selector) {
      this.addEventListener(selector as HTMLElement, 'change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.loadWorkflow(target.value);
      });
    }

    // Execute button
    const executeButton = this.element.querySelector('[data-action="execute"]');
    if (executeButton) {
      this.addEventListener(executeButton as HTMLElement, 'click', () => {
        this.executeWorkflow();
      });
    }

    // Reset button
    const resetButton = this.element.querySelector('[data-action="reset"]');
    if (resetButton) {
      this.addEventListener(resetButton as HTMLElement, 'click', () => {
        this.resetWorkflow();
      });
    }

    // Step clicks for details
    if (this.activeWorkflow) {
      this.activeWorkflow.steps.forEach((step, index) => {
        const stepElement = this.element.querySelector(`[data-step="${step.id}"]`);
        if (stepElement) {
          this.addEventListener(stepElement as HTMLElement, 'click', () => {
            this.showStepDetails(step, index);
          });
        }
      });
    }
  }

  /**
   * Execute the workflow
   */
  private executeWorkflow(): void {
    if (!this.activeWorkflow || this.currentStepIndex >= this.activeWorkflow.steps.length) {
      this.resetWorkflow();
      return;
    }

    this.updateExecutionStatus('Executing workflow...');
    this.executeNextStep();
  }

  /**
   * Execute the next step in the workflow
   */
  private executeNextStep(): void {
    if (!this.activeWorkflow || this.currentStepIndex >= this.activeWorkflow.steps.length) {
      this.completeWorkflow();
      return;
    }

    const step = this.activeWorkflow.steps[this.currentStepIndex];
    step.status = 'in-progress';
    this.updateStepVisualization(step.id);

    this.updateExecutionStatus(`Executing: ${step.name}`);

    // Simulate step execution
    this.executionTimer = window.setTimeout(() => {
      step.status = 'completed';
      this.updateStepVisualization(step.id);
      this.updateProgress();

      this.currentStepIndex++;
      this.executeNextStep();
    }, step.duration * 100); // Speed up for demo (real duration * 100ms)
  }

  /**
   * Update step visualization
   */
  private updateStepVisualization(stepId: string): void {
    const stepElement = this.element.querySelector(`[data-step="${stepId}"]`);
    if (stepElement instanceof HTMLElement && this.activeWorkflow) {
      const step = this.activeWorkflow.steps.find(s => s.id === stepId);
      if (step) {
        stepElement.setAttribute('class', `workflow-step step-${step.status}`);
        const statusEl = stepElement.querySelector('.step-status');
        if (statusEl instanceof HTMLElement) {
          statusEl.textContent = step.status;
        }
      }
    }
  }

  /**
   * Update progress bar
   */
  private updateProgress(): void {
    if (!this.activeWorkflow) return;

    const progress = (this.currentStepIndex / this.activeWorkflow.steps.length) * 100;
    const progressFill = this.element.querySelector('#progress-fill');
    const progressText = this.element.querySelector('#progress-text');

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
  private updateExecutionStatus(message: string): void {
    const statusEl = this.element.querySelector('#execution-status');
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = message;
    }
  }

  /**
   * Complete the workflow
   */
  private completeWorkflow(): void {
    this.updateExecutionStatus('Workflow completed successfully');
    this.updateProgress();
    this.currentStepIndex = 0;
  }

  /**
   * Stop workflow execution
   */
  private stopExecution(): void {
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
  }

  /**
   * Reset the workflow
   */
  private resetWorkflow(): void {
    this.stopExecution();
    this.currentStepIndex = 0;
    this.resetStepStatuses();
    this.renderSteps();
    this.updateProgress();
    this.updateExecutionStatus('Ready to execute workflow');
  }

  /**
   * Show step details
   */
  private showStepDetails(step: WorkflowStep, index: number): void {
    const dependencies = step.dependencies.map(depId => {
      const depStep = this.activeWorkflow?.steps.find(s => s.id === depId);
      return depStep?.name || depId;
    }).join(', ') || 'None';

    this.updateExecutionStatus(
      `Step ${index + 1}: ${step.name} | Type: ${step.type} | Dependencies: ${dependencies} | Duration: ${step.duration}s`
    );
  }

  /**
   * Add a custom workflow
   */
  public addWorkflow(workflow: Workflow): void {
    this.workflows.push(workflow);
    const selector = this.element.querySelector('#workflow-selector');
    if (selector) {
      const option = document.createElement('option');
      option.value = workflow.id;
      option.textContent = workflow.name;
      selector.appendChild(option);
    }
  }

  /**
   * Get current workflow status
   */
  public getWorkflowStatus(): Record<string, unknown> {
    if (!this.activeWorkflow) {
      return { status: 'no-workflow' };
    }

    return {
      workflowId: this.activeWorkflow.id,
      currentStep: this.currentStepIndex,
      totalSteps: this.activeWorkflow.steps.length,
      steps: this.activeWorkflow.steps.map(step => ({
        id: step.id,
        name: step.name,
        status: step.status
      }))
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopExecution();
    super.cleanup();
  }
}
