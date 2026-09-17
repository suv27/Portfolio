import { InteractiveFeature } from '../base.js';

/**
 * Command interface for terminal
 */
interface Command {
  name: string;
  description: string;
  handler: (args: string[]) => string;
  aliases?: string[];
}

/**
 * Terminal session state
 */
interface TerminalSession {
  history: string[];
  currentDirectory: string;
  user: string;
  isLoggedIn: boolean;
}

/**
 * Terminal-Driven Contact Module
 * Developer-focused contact interface styled as an interactive command-line shell
 */
export class TerminalContact extends InteractiveFeature {
  private static readonly DEFAULT_COMMANDS: Command[] = [
    {
      name: 'help',
      description: 'Display available commands',
      handler: () => {
        const commands = TerminalContact.DEFAULT_COMMANDS.map(cmd => {
          const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
          return `  ${cmd.name}${aliases} - ${cmd.description}`;
        }).join('\n');
        return `Available commands:\n${commands}`;
      }
    },
    {
      name: 'view-skills',
      description: 'View professional skills and expertise',
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
      name: 'view-experience',
      description: 'View work experience',
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
      name: 'view-projects',
      description: 'View featured projects',
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
      name: 'send-message',
      description: 'Send a secure message (usage: send-message --from <email> --message <text>)',
      handler: (args) => {
        const emailIndex = args.indexOf('--from');
        const messageIndex = args.indexOf('--message');

        if (emailIndex === -1 || messageIndex === -1) {
          return 'Usage: send-message --from <email> --message <text>';
        }

        const email = args[emailIndex + 1];
        const message = args.slice(messageIndex + 1).join(' ');

        if (!email || !message) {
          return 'Error: Email and message are required';
        }

        // Store the message data for form submission
        const formData = {
          email,
          message,
          timestamp: new Date().toISOString()
        };

        // Store in sessionStorage for the actual form submission
        sessionStorage.setItem('terminalMessage', JSON.stringify(formData));

        return `Message queued for secure transmission.\nFrom: ${email}\nMessage: ${message}\n\nType 'execute' to send or 'clear' to cancel.`;
      }
    },
    {
      name: 'execute',
      description: 'Execute the queued message',
      handler: () => {
        const storedMessage = sessionStorage.getItem('terminalMessage');
        if (!storedMessage) {
          return 'No message queued. Use send-message first.';
        }

        const formData = JSON.parse(storedMessage);

        // Populate the actual contact form
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const messageInput = document.getElementById('message') as HTMLTextAreaElement;

        if (emailInput && messageInput) {
          emailInput.value = formData.email;
          messageInput.value = formData.message;

          // Trigger form submission
          const form = document.getElementById('contactForm');
          if (form) {
            form.dispatchEvent(new Event('submit'));
          }

          sessionStorage.removeItem('terminalMessage');
          return 'Message transmitted securely via encrypted channel.';
        }

        return 'Error: Unable to access contact form.';
      }
    },
    {
      name: 'clear',
      description: 'Clear the terminal screen',
      handler: () => {
        const terminalOutput = document.querySelector('.terminal-output');
        if (terminalOutput) {
          terminalOutput.innerHTML = '';
        }
        return 'Terminal cleared.';
      }
    },
    {
      name: 'whoami',
      description: 'Display current user information',
      handler: () => {
        return `User: guest@starlyn-security\nSession: ${Date.now()}\nPermissions: read-only`;
      }
    },
    {
      name: 'ls',
      description: 'List available sections',
      aliases: ['dir'],
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
      name: 'cd',
      description: 'Navigate to section (usage: cd <section>)',
      handler: (args) => {
        if (args.length === 0) {
          return 'Usage: cd <section>';
        }

        const section = args[0];
        const validSections = ['about', 'experience', 'education', 'projects', 'contact'];

        if (validSections.includes(section)) {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            return `Navigated to /${section}`;
          }
          return `Section /${section} not found in DOM`;
        }

        return `Section /${section} does not exist. Use 'ls' to see available sections.`;
      }
    },
    {
      name: 'status',
      description: 'Check system status',
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
  ];

  private commands: Command[];
  private session: TerminalSession;
  private commandHistory: string[];
  private historyIndex: number;

  constructor(elementId: string = 'terminal-contact') {
    super(elementId);
    this.commands = TerminalContact.DEFAULT_COMMANDS;
    this.session = {
      history: [],
      currentDirectory: '/home/guest',
      user: 'guest',
      isLoggedIn: false
    };
    this.commandHistory = [];
    this.historyIndex = -1;
  }

  /**
   * Initialize the terminal contact module
   */
  public initialize(): void {
    this.renderTerminal();
    this.setupEventListeners();
    this.displayWelcomeMessage();
  }

  /**
   * Hook for activation
   */
  protected onActivate(): void {
    this.focusInput();
  }

  /**
   * Hook for deactivation
   */
  protected onDeactivate(): void {
    // Deactivation logic if needed
  }

  /**
   * Render the terminal UI
   */
  private renderTerminal(): void {
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
          <span class="terminal-info">Press Tab for autocomplete | ↑/↓ for history</span>
        </div>
      </div>
    `;
  }

  /**
   * Display welcome message
   */
  private displayWelcomeMessage(): void {
    const welcomeMessage = `
╔══════════════════════════════════════════════════════════════════════╗
║                    STARLYN SECURITY CLI v1.0.0                      ║
║              Secure Communication Terminal Interface                 ║
╚══════════════════════════════════════════════════════════════════════╝

Welcome to the Starlyn Security CLI.
This terminal provides a secure, command-line interface for communication
and information retrieval.

Type 'help' to see available commands or 'view-skills' to see my expertise.

SECURITY NOTICE: All communications are encrypted and logged for audit purposes.
`;

    this.appendOutput(welcomeMessage, 'system');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const input = this.element.querySelector('#terminal-input');
    if (!(input instanceof HTMLInputElement)) return;

    // Input handling
    this.addEventListener(input, 'keydown', (e) => this.handleKeyDown(e as KeyboardEvent));
    this.addEventListener(input, 'input', () => this.handleInput());

    // Focus handling
    this.addEventListener(this.element, 'click', () => this.focusInput());
  }

  /**
   * Handle keyboard input
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.executeCommand(input.value);
        input.value = '';
        break;

      case 'Tab':
        event.preventDefault();
        this.autocomplete(input.value);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.navigateHistory(-1);
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.navigateHistory(1);
        break;

      case 'l':
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
  private handleInput(): void {
    // Update prompt based on context if needed
  }

  /**
   * Execute a command
   */
  private executeCommand(commandLine: string): void {
    const trimmedCommand = commandLine.trim();

    if (!trimmedCommand) {
      return;
    }

    // Add to history
    this.commandHistory.push(trimmedCommand);
    this.historyIndex = this.commandHistory.length;

    // Display the command
    this.appendCommand(trimmedCommand);

    // Parse and execute
    const parts = trimmedCommand.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.findCommand(commandName);

    if (command) {
      try {
        const output = command.handler(args);
        this.appendOutput(output, 'success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Command execution failed';
        this.appendOutput(`Error: ${errorMessage}`, 'error');
      }
    } else {
      this.appendOutput(`Command not found: ${commandName}. Type 'help' for available commands.`, 'error');
    }

    // Scroll to bottom
    this.scrollToBottom();
  }

  /**
   * Find a command by name or alias
   */
  private findCommand(name: string): Command | undefined {
    return this.commands.find(cmd =>
      cmd.name === name || cmd.aliases?.includes(name)
    );
  }

  /**
   * Autocomplete command
   */
  private autocomplete(input: string): void {
    const parts = input.split(' ');
    const currentPart = parts[parts.length - 1].toLowerCase();

    if (parts.length === 1) {
      // Autocomplete command name
      const matches = this.commands.filter(cmd =>
        cmd.name.startsWith(currentPart) || cmd.aliases?.some(alias => alias.startsWith(currentPart))
      );

      if (matches.length === 1) {
        const inputElement = this.element.querySelector('#terminal-input');
        if (inputElement instanceof HTMLInputElement) {
          inputElement.value = matches[0].name + ' ';
        }
      } else if (matches.length > 1) {
        const names = matches.map(cmd => cmd.name).sort().join('  ');
        this.appendOutput(names, 'info');
      }
    }
  }

  /**
   * Navigate command history
   */
  private navigateHistory(direction: number): void {
    const inputElement = this.element.querySelector('#terminal-input');
    if (!(inputElement instanceof HTMLInputElement)) return;

    if (this.commandHistory.length === 0) return;

    this.historyIndex += direction;

    // Clamp index
    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      inputElement.value = '';
      return;
    }

    inputElement.value = this.commandHistory[this.historyIndex];
  }

  /**
   * Append command to output
   */
  private appendCommand(command: string): void {
    const prompt = this.element.querySelector('#terminal-prompt');
    const promptText = prompt ? prompt.textContent : '$';
    this.appendOutput(`${promptText} ${command}`, 'command');
  }

  /**
   * Append output to terminal
   */
  private appendOutput(text: string, type: 'command' | 'system' | 'success' | 'error' | 'info' = 'info'): void {
    const output = this.element.querySelector('#terminal-output');
    if (!(output instanceof HTMLElement)) return;

    const line = document.createElement('div');
    line.className = `terminal-line terminal-${type}`;
    line.textContent = text;
    output.appendChild(line);
  }

  /**
   * Clear terminal
   */
  private clearTerminal(): void {
    const output = this.element.querySelector('#terminal-output');
    if (output instanceof HTMLElement) {
      output.innerHTML = '';
    }
    this.appendOutput('Terminal cleared.', 'system');
  }

  /**
   * Scroll to bottom of terminal
   */
  private scrollToBottom(): void {
    const output = this.element.querySelector('#terminal-output');
    if (output instanceof HTMLElement) {
      output.scrollTop = output.scrollHeight;
    }
  }

  /**
   * Focus input field
   */
  private focusInput(): void {
    const input = this.element.querySelector('#terminal-input');
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }

  /**
   * Add a custom command
   */
  public addCommand(command: Command): void {
    this.commands.push(command);
  }

  /**
   * Get command history
   */
  public getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * Get session information
   */
  public getSessionInfo(): TerminalSession {
    return { ...this.session };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.commandHistory = [];
    super.cleanup();
  }
}
