import { expect, test } from '@playwright/test';

test('portfolio loads and shows the security command center', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Security Software Engineer/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible();
});

test('telemetry dashboard is visible and shows metrics', async ({ page }) => {
  await page.goto('/');

  // Check telemetry dashboard exists
  const telemetryDashboard = page.locator('#telemetry-dashboard');
  await expect(telemetryDashboard).toBeVisible();

  // Check for key metrics
  await expect(telemetryDashboard.locator('.telemetry-metric')).toHaveCount(4);
  await expect(telemetryDashboard.getByText('Alert Noise Reduced')).toBeVisible();
  await expect(telemetryDashboard.getByText('Uptime')).toBeVisible();
  await expect(telemetryDashboard.getByText('Cloud Assets Secured')).toBeVisible();
  await expect(telemetryDashboard.getByText('MTTR Speedup')).toBeVisible();
});

test('threat simulator is visible and interactive', async ({ page }) => {
  await page.goto('/');

  // Navigate to interactive features section
  await page.locator('a[href="#interactive-features"]').click();
  await expect(page.locator('#interactive-features')).toBeVisible();

  // Check threat simulator exists
  const threatSimulator = page.locator('#threat-simulator');
  await expect(threatSimulator).toBeVisible();

  // Check for attack vectors
  await expect(threatSimulator.getByText('SQL Injection')).toBeVisible();
  await expect(threatSimulator.getByText('Aggregator Scraping')).toBeVisible();
  await expect(threatSimulator.getByText('Credential Stuffing')).toBeVisible();

  // Check network visualization
  await expect(threatSimulator.locator('.network-visualization')).toBeVisible();
});

test('SOAR workflow viewer is visible and interactive', async ({ page }) => {
  await page.goto('/');

  // Navigate to interactive features section
  await page.locator('a[href="#interactive-features"]').click();
  await expect(page.locator('#interactive-features')).toBeVisible();

  // Check SOAR workflow viewer exists
  const soarViewer = page.locator('#soar-workflow-viewer');
  await expect(soarViewer).toBeVisible();

  // Check for workflow steps
  await expect(soarViewer.getByText('Alert Ingestion')).toBeVisible();
  await expect(soarViewer.getByText('Artifact Extraction')).toBeVisible();
  await expect(soarViewer.getByText('IAM Account Isolation')).toBeVisible();

  // Check execution controls
  await expect(soarViewer.getByText('Execute Workflow')).toBeVisible();
  await expect(soarViewer.getByText('Reset')).toBeVisible();
});

test('architecture blueprint explorer is visible and interactive', async ({ page }) => {
  await page.goto('/');

  // Navigate to interactive features section
  await page.locator('a[href="#interactive-features"]').click();
  await expect(page.locator('#interactive-features')).toBeVisible();

  // Check architecture blueprint exists
  const architectureBlueprint = page.locator('#architecture-blueprint');
  await expect(architectureBlueprint).toBeVisible();

  // Check for tabs
  await expect(architectureBlueprint.getByText('VPC Network Design')).toBeVisible();
  await expect(architectureBlueprint.getByText('Transit Gateway')).toBeVisible();
  await expect(architectureBlueprint.getByText('Kubernetes IRSA')).toBeVisible();

  // Check for VPC cards
  await expect(architectureBlueprint.getByText('Production VPC')).toBeVisible();
  await expect(architectureBlueprint.getByText('Staging VPC')).toBeVisible();
});

test('terminal contact module is visible and interactive', async ({ page }) => {
  await page.goto('/');

  // Navigate to interactive features section
  await page.locator('a[href="#interactive-features"]').click();
  await expect(page.locator('#interactive-features')).toBeVisible();

  // Check terminal contact exists
  const terminalContact = page.locator('#terminal-contact');
  await expect(terminalContact).toBeVisible();

  // Check for terminal interface
  await expect(terminalContact.locator('.terminal-container')).toBeVisible();
  await expect(terminalContact.locator('.terminal-input')).toBeVisible();
  await expect(terminalContact.getByText('starlyn-cli')).toBeVisible();
});

test('interactive features section is accessible from navigation', async ({ page }) => {
  await page.goto('/');

  // Check navigation includes interactive features link
  await expect(page.getByRole('link', { name: /Interactive Features/i })).toBeVisible();

  // Navigate to interactive features
  await page.getByRole('link', { name: /Interactive Features/i }).click();
  await expect(page.locator('#interactive-features')).toBeVisible();
});

test('all interactive features are responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // Navigate to interactive features
  await page.locator('a[href="#interactive-features"]').click();

  // Check telemetry dashboard adapts
  const telemetryDashboard = page.locator('#telemetry-dashboard');
  await expect(telemetryDashboard).toBeVisible();

  // Check threat simulator adapts
  const threatSimulator = page.locator('#threat-simulator');
  await expect(threatSimulator).toBeVisible();

  // Check other features are still accessible
  await expect(page.locator('#soar-workflow-viewer')).toBeVisible();
  await expect(page.locator('#architecture-blueprint')).toBeVisible();
  await expect(page.locator('#terminal-contact')).toBeVisible();
});
