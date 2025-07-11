#!/usr/bin/env tsx

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
}

interface ValidationReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  results: ValidationResult[];
  recommendations: string[];
}

class BoilerplateValidator {
  private results: ValidationResult[] = [];
  private recommendations: string[] = [];

  async validate(): Promise<ValidationReport> {
    console.log('🔍 Validating NestJS boilerplate fixes...\n');

    await this.validatePostModuleCleanup();
    await this.validateOpenAPIDocumentation();
    await this.validateCustomDecorators();
    await this.validateAuthParameterValidation();
    await this.validateHTTPSSetup();
    await this.validateOverallConfiguration();

    return this.generateReport();
  }

  private async validatePostModuleCleanup(): Promise<void> {
    console.log('📋 Checking post module cleanup...');

    // Check if cleanup script exists
    const cleanupScriptExists = await this.fileExists('scripts/cleanup-post-module.ts');
    this.addResult(cleanupScriptExists, 'Cleanup script exists', 
      cleanupScriptExists ? undefined : 'Run the script creation steps');

    // Check if package.json has cleanup commands
    const packageJson = await this.readJsonFile('package.json');
    const hasCleanupScript = packageJson?.scripts?.['cleanup:post'];
    const hasRollbackScript = packageJson?.scripts?.['rollback:post'];
    
    this.addResult(hasCleanupScript && hasRollbackScript, 
      'Package.json contains cleanup and rollback scripts');

    // Check if post module still exists
    const postModuleExists = await this.directoryExists('src/modules/post');
    this.addResult(!postModuleExists, 
      'Post module removed (run cleanup:post if still present)',
      postModuleExists ? 'Run: yarn cleanup:post' : undefined);
  }

  private async validateOpenAPIDocumentation(): Promise<void> {
    console.log('📝 Checking OpenAPI documentation...');

    // Check UUIDParam decorator enhancement
    const httpDecorators = await this.readFile('src/decorators/http.decorators.ts');
    const hasApiParam = httpDecorators?.includes('ApiParam');
    const hasUUIDFormat = httpDecorators?.includes('format: \'uuid\'');
    
    this.addResult(hasApiParam && hasUUIDFormat, 
      'UUIDParam decorator includes proper API documentation');

    // Check if controllers use proper parameter decorators
    const controllers = await this.findFiles('src/modules/*/*.controller.ts');
    let controllersWithUUIDParams = 0;
    
    for (const controller of controllers) {
      const content = await this.readFile(controller);
      if (content?.includes('@UUIDParam')) {
        controllersWithUUIDParams++;
      }
    }
    
    this.addResult(controllersWithUUIDParams > 0, 
      `Found ${controllersWithUUIDParams} controllers using UUIDParam decorator`);
  }

  private async validateCustomDecorators(): Promise<void> {
    console.log('🎨 Checking custom decorator compatibility...');

    const fieldDecorators = await this.readFile('src/decorators/field.decorators.ts');
    
    // Check if custom properties are filtered from Swagger
    const hasSwaggerFiltering = fieldDecorators?.includes('delete (swaggerOptions as any)');
    this.addResult(hasSwaggerFiltering, 
      'Field decorators filter custom properties from Swagger schemas');

    // Check specific field decorator improvements
    const hasStringFieldFix = fieldDecorators?.includes('toLowerCase') && 
                              fieldDecorators?.includes('delete (swaggerOptions as any).toLowerCase');
    const hasNumberFieldFix = fieldDecorators?.includes('delete (swaggerOptions as any).min');
    const hasBooleanFieldFix = fieldDecorators?.includes('delete (swaggerOptions as any).nullable');
    
    this.addResult(hasStringFieldFix && hasNumberFieldFix && hasBooleanFieldFix, 
      'All field decorators properly filter custom properties');
  }

  private async validateAuthParameterValidation(): Promise<void> {
    console.log('🔐 Checking auth parameter validation...');

    const swaggerSchema = await this.readFile('src/decorators/swagger.schema.ts');
    
    // Check ApiFile decorator improvements
    const hasRequiredFix = swaggerSchema?.includes('required: isRequired ? Object.keys(properties) : undefined');
    this.addResult(hasRequiredFix, 
      'ApiFile decorator properly handles required field validation');

    // Check auth controller for proper decorators
    const authController = await this.readFile('src/modules/auth/auth.controller.ts');
    const hasApiFileUsage = authController?.includes('@ApiFile');
    
    this.addResult(hasApiFileUsage, 
      'Auth controller uses ApiFile decorator for file uploads');
  }

  private async validateHTTPSSetup(): Promise<void> {
    console.log('🔒 Checking HTTPS development setup...');

    // Check SSL generation script
    const sslScriptExists = await this.fileExists('scripts/generate-ssl-certs.mjs');
    this.addResult(sslScriptExists, 'SSL certificate generation script exists');

    // Check package.json scripts
    const packageJson = await this.readJsonFile('package.json');
    const hasSSLScript = packageJson?.scripts?.['ssl:generate'];
    const hasHTTPSScript = packageJson?.scripts?.['start:https'];
    
    this.addResult(hasSSLScript && hasHTTPSScript, 
      'Package.json contains SSL and HTTPS scripts');

    // Check main.ts HTTPS support
    const mainTs = await this.readFile('src/main.ts');
    const hasHTTPSSupport = mainTs?.includes('USE_HTTPS') && mainTs?.includes('httpsOptions');
    
    this.addResult(hasHTTPSSupport, 
      'main.ts includes HTTPS configuration support');

    // Check development documentation
    const devDocs = await this.readFile('docs/development.md');
    const hasHTTPSDoc = devDocs?.includes('HTTPS Development Setup');
    
    this.addResult(hasHTTPSDoc, 
      'Development documentation includes HTTPS setup guide');
  }

  private async validateOverallConfiguration(): Promise<void> {
    console.log('⚙️ Checking overall configuration...');

    try {
      // Check if TypeScript compiles without major errors
      console.log('   Checking TypeScript compilation...');
      execSync('npx tsc --noEmit --skipLibCheck', { 
        cwd: ROOT_DIR, 
        stdio: 'pipe' 
      });
      this.addResult(true, 'TypeScript compilation successful');
    } catch (error) {
      this.addResult(false, 'TypeScript compilation has errors', 
        'Check and fix compilation errors');
    }

    // Check dependencies
    const packageJson = await this.readJsonFile('package.json');
    const hasTsx = packageJson?.devDependencies?.tsx;
    
    this.addResult(!!hasTsx, 'Required dependencies present (tsx for scripts)');

    // Add recommendations
    this.recommendations.push(
      'Run "yarn ssl:generate" to set up HTTPS development',
      'Run "yarn cleanup:post" to remove post module if not needed',
      'Test API documentation at /documentation endpoint',
      'Validate OpenAPI schema with Orval or similar tools',
      'Configure production SSL certificates for deployment'
    );
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(join(ROOT_DIR, path));
      return true;
    } catch {
      return false;
    }
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(join(ROOT_DIR, path));
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  private async readFile(path: string): Promise<string | null> {
    try {
      return await fs.readFile(join(ROOT_DIR, path), 'utf-8');
    } catch {
      return null;
    }
  }

  private async readJsonFile(path: string): Promise<any | null> {
    try {
      const content = await fs.readFile(join(ROOT_DIR, path), 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async findFiles(pattern: string): Promise<string[]> {
    try {
      const globPattern = pattern.replace(/\*/g, '**');
      // Simple file finding - in a real implementation, you'd use a proper glob library
      const result = execSync(`find . -path "./${globPattern}" -type f`, { 
        cwd: ROOT_DIR, 
        encoding: 'utf-8' 
      });
      return result.trim().split('\n').filter(Boolean).map(f => f.replace('./', ''));
    } catch {
      return [];
    }
  }

  private addResult(passed: boolean, message: string, details?: string): void {
    this.results.push({ passed, message, details });
    const icon = passed ? '✅' : '❌';
    console.log(`   ${icon} ${message}`);
    if (details && !passed) {
      console.log(`      ${details}`);
    }
  }

  private generateReport(): ValidationReport {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log(`\n📊 Validation Summary:`);
    console.log(`   Total checks: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   Success rate: ${Math.round((passed / total) * 100)}%\n`);

    if (this.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.recommendations.forEach(rec => console.log(`   - ${rec}`));
      console.log();
    }

    const isSuccess = failed === 0;
    console.log(isSuccess ? 
      '🎉 All validations passed! Your boilerplate is ready for Orval API generation.' :
      '⚠️  Some validations failed. Please address the issues above.'
    );

    return {
      summary: { total, passed, failed },
      results: this.results,
      recommendations: this.recommendations,
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new BoilerplateValidator();
  validator.validate().then((report) => {
    process.exit(report.summary.failed > 0 ? 1 : 0);
  });
}

export { BoilerplateValidator };
