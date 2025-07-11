#!/usr/bin/env tsx

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

interface CleanupResult {
  removedFiles: string[];
  modifiedFiles: string[];
  errors: string[];
  rollbackData: {
    files: Record<string, string>;
    directories: string[];
  };
}

class PostModuleCleanup {
  private result: CleanupResult = {
    removedFiles: [],
    modifiedFiles: [],
    errors: [],
    rollbackData: {
      files: {},
      directories: [],
    },
  };

  async execute(): Promise<CleanupResult> {
    console.log('🧹 Starting Post Module Cleanup...\n');

    try {
      // 1. Analyze dependencies
      await this.analyzeDependencies();

      // 2. Create rollback data
      await this.createRollbackData();

      // 3. Remove post-related files
      await this.removePostFiles();

      // 4. Update imports and references
      await this.updateReferences();

      // 5. Update metadata.ts
      await this.updateMetadata();

      // 6. Clean up TypeORM relations
      await this.cleanupTypeOrmRelations();

      // 7. Update app.module.ts
      await this.updateAppModule();

      console.log('✅ Post Module Cleanup completed successfully!');
      this.printSummary();

    } catch (error) {
      this.result.errors.push(`Cleanup failed: ${error.message}`);
      console.error('❌ Cleanup failed:', error.message);
      await this.rollback();
    }

    return this.result;
  }

  private async analyzeDependencies(): Promise<void> {
    console.log('📊 Analyzing dependencies...');
    
    // Check for imports in other modules
    const userEntityPath = join(ROOT_DIR, 'src/modules/user/user.entity.ts');
    const userEntityContent = await fs.readFile(userEntityPath, 'utf-8');
    
    if (userEntityContent.includes('PostEntity')) {
      console.log('⚠️  Found PostEntity dependency in UserEntity - will be cleaned up');
    }

    // Scan for other potential dependencies
    const srcDir = join(ROOT_DIR, 'src');
    await this.scanForPostReferences(srcDir);
  }

  private async scanForPostReferences(dir: string, basePath = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'post') {
        await this.scanForPostReferences(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        if (content.includes('Post') && !relativePath.includes('post/')) {
          console.log(`📍 Found Post reference in: ${relativePath}`);
        }
      }
    }
  }

  private async createRollbackData(): Promise<void> {
    console.log('💾 Creating rollback data...');
    
    const postModuleDir = join(ROOT_DIR, 'src/modules/post');
    await this.backupDirectory(postModuleDir, 'modules/post');
    
    // Backup files that will be modified
    const filesToBackup = [
      'src/app.module.ts',
      'src/metadata.ts',
      'src/modules/user/user.entity.ts',
    ];

    for (const file of filesToBackup) {
      const filePath = join(ROOT_DIR, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        this.result.rollbackData.files[file] = content;
      } catch (error) {
        console.log(`⚠️  Could not backup ${file}: ${error.message}`);
      }
    }
  }

  private async backupDirectory(dir: string, relativePath: string): Promise<void> {
    try {
      const stat = await fs.stat(dir);
      if (stat.isDirectory()) {
        this.result.rollbackData.directories.push(relativePath);
        
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const entryRelativePath = join(relativePath, entry.name);
          
          if (entry.isDirectory()) {
            await this.backupDirectory(fullPath, entryRelativePath);
          } else {
            const content = await fs.readFile(fullPath, 'utf-8');
            this.result.rollbackData.files[entryRelativePath] = content;
          }
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not backup directory ${dir}: ${error.message}`);
    }
  }

  private async removePostFiles(): Promise<void> {
    console.log('🗑️  Removing post-related files...');
    
    const postModuleDir = join(ROOT_DIR, 'src/modules/post');
    await this.removeDirectory(postModuleDir);
  }

  private async removeDirectory(dir: string): Promise<void> {
    try {
      const stat = await fs.stat(dir);
      if (stat.isDirectory()) {
        const entries = await fs.readdir(dir);
        
        for (const entry of entries) {
          const entryPath = join(dir, entry);
          const entryStat = await fs.stat(entryPath);
          
          if (entryStat.isDirectory()) {
            await this.removeDirectory(entryPath);
          } else {
            await fs.unlink(entryPath);
            this.result.removedFiles.push(entryPath.replace(ROOT_DIR, ''));
          }
        }
        
        await fs.rmdir(dir);
        this.result.removedFiles.push(dir.replace(ROOT_DIR, ''));
      }
    } catch (error) {
      this.result.errors.push(`Failed to remove ${dir}: ${error.message}`);
    }
  }

  private async updateReferences(): Promise<void> {
    console.log('🔧 Updating imports and references...');
    
    // Update UserEntity to remove post relation
    await this.updateUserEntity();
  }

  private async updateUserEntity(): Promise<void> {
    const userEntityPath = join(ROOT_DIR, 'src/modules/user/user.entity.ts');
    const content = await fs.readFile(userEntityPath, 'utf-8');
    
    // Remove PostEntity import
    let updatedContent = content.replace(
      /import\s+{\s*PostEntity\s*}\s+from\s+['"][^'"]*post[^'"]*['"];\n?/g,
      ''
    );
    
    // Remove posts relation
    updatedContent = updatedContent.replace(
      /\s*@OneToMany\(\(\)\s*=>\s*PostEntity,\s*\([^)]*\)\s*=>\s*[^)]*\)\s*posts\?\s*:\s*PostEntity\[\];\s*/g,
      ''
    );
    
    if (updatedContent !== content) {
      await fs.writeFile(userEntityPath, updatedContent);
      this.result.modifiedFiles.push('src/modules/user/user.entity.ts');
      console.log('✅ Updated UserEntity');
    }
  }

  private async updateMetadata(): Promise<void> {
    console.log('📝 Updating metadata.ts...');
    
    const metadataPath = join(ROOT_DIR, 'src/metadata.ts');
    const content = await fs.readFile(metadataPath, 'utf-8');
    
    // Remove all post-related imports and metadata
    let updatedContent = content
      .replace(/["']\.\/modules\/post\/[^"']*["']:\s*await\s+import\([^)]*\),?\s*/g, '')
      .replace(/,\s*,/g, ',') // Clean up double commas
      .replace(/{\s*,/g, '{') // Clean up leading commas
      .replace(/,\s*}/g, '}'); // Clean up trailing commas
    
    // Remove post-related model definitions
    updatedContent = updatedContent.replace(
      /\[import\([^)]*post[^)]*\),\s*{[^}]*}\],?\s*/g,
      ''
    );
    
    // Remove post controller references
    updatedContent = updatedContent.replace(
      /\[import\([^)]*post\.controller[^)]*\),\s*{[^}]*}\],?\s*/g,
      ''
    );
    
    if (updatedContent !== content) {
      await fs.writeFile(metadataPath, updatedContent);
      this.result.modifiedFiles.push('src/metadata.ts');
      console.log('✅ Updated metadata.ts');
    }
  }

  private async cleanupTypeOrmRelations(): Promise<void> {
    console.log('🔗 Cleaning up TypeORM relations...');
    // Relations are already handled in updateUserEntity
    console.log('✅ TypeORM relations cleaned');
  }

  private async updateAppModule(): Promise<void> {
    console.log('📦 Updating app.module.ts...');
    
    const appModulePath = join(ROOT_DIR, 'src/app.module.ts');
    const content = await fs.readFile(appModulePath, 'utf-8');
    
    // Remove PostModule import
    let updatedContent = content.replace(
      /import\s+{\s*PostModule\s*}\s+from\s+['"][^'"]*post[^'"]*['"];\n?/g,
      ''
    );
    
    // Remove PostModule from imports array
    updatedContent = updatedContent.replace(
      /\s*PostModule,?\s*/g,
      ''
    );
    
    // Clean up any double commas or trailing commas
    updatedContent = updatedContent
      .replace(/,\s*,/g, ',')
      .replace(/\[\s*,/g, '[')
      .replace(/,\s*\]/g, ']');
    
    if (updatedContent !== content) {
      await fs.writeFile(appModulePath, updatedContent);
      this.result.modifiedFiles.push('src/app.module.ts');
      console.log('✅ Updated app.module.ts');
    }
  }

  private async rollback(): Promise<void> {
    console.log('🔄 Rolling back changes...');
    
    try {
      // Restore modified files
      for (const [filePath, content] of Object.entries(this.result.rollbackData.files)) {
        if (!filePath.startsWith('modules/post')) {
          const fullPath = join(ROOT_DIR, 'src', filePath);
          await fs.writeFile(fullPath, content);
          console.log(`✅ Restored ${filePath}`);
        }
      }
      
      // Restore post module
      const postModuleDir = join(ROOT_DIR, 'src/modules/post');
      await fs.mkdir(postModuleDir, { recursive: true });
      
      for (const [filePath, content] of Object.entries(this.result.rollbackData.files)) {
        if (filePath.startsWith('modules/post')) {
          const fullPath = join(ROOT_DIR, 'src', filePath);
          await fs.mkdir(dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content);
        }
      }
      
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  private printSummary(): void {
    console.log('\n📋 Cleanup Summary:');
    console.log(`🗑️  Removed ${this.result.removedFiles.length} files`);
    console.log(`🔧 Modified ${this.result.modifiedFiles.length} files`);
    
    if (this.result.modifiedFiles.length > 0) {
      console.log('\n📝 Modified files:');
      this.result.modifiedFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    if (this.result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      this.result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n💾 Rollback data saved for recovery if needed');
  }

  async createRollbackScript(): Promise<void> {
    const rollbackScript = `#!/usr/bin/env tsx

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const ROLLBACK_DATA = ${JSON.stringify(this.result.rollbackData, null, 2)};

async function rollback() {
  console.log('🔄 Starting rollback...');
  
  try {
    // Restore files
    for (const [filePath, content] of Object.entries(ROLLBACK_DATA.files)) {
      const fullPath = join(ROOT_DIR, 'src', filePath);
      await fs.mkdir(dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
      console.log(\`✅ Restored \${filePath}\`);
    }
    
    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
  }
}

rollback();
`;

    const rollbackPath = join(ROOT_DIR, 'scripts/rollback-post-module.ts');
    await fs.writeFile(rollbackPath, rollbackScript);
    console.log(`\n💾 Rollback script saved to: ${rollbackPath}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new PostModuleCleanup();
  cleanup.execute().then(async (result) => {
    if (result.errors.length === 0) {
      await cleanup.createRollbackScript();
    }
    process.exit(result.errors.length > 0 ? 1 : 0);
  });
}

export { PostModuleCleanup };
