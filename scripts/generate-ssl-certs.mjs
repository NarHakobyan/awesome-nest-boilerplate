#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const CERTS_DIR = join(ROOT_DIR, 'ssl');

async function generateSSLCertificates() {
    console.log('🔐 Generating SSL certificates for HTTPS development...\n');

    try {
        // Create ssl directory if it doesn't exist
        await fs.mkdir(CERTS_DIR, { recursive: true });

        // Check if certificates already exist
        const keyPath = join(CERTS_DIR, 'private-key.pem');
        const certPath = join(CERTS_DIR, 'certificate.pem');

        try {
            await Promise.all([
                fs.access(keyPath),
                fs.access(certPath),
            ]);

            console.log('✅ SSL certificates already exist in ssl/ directory');
            console.log('   Use --force to regenerate them\n');

            if (!process.argv.includes('--force')) {
                printUsageInstructions();
                return;
            }

            console.log('🔄 Regenerating certificates...\n');
        } catch {
            // Certificates don't exist, continue with generation
        }

        // Check if OpenSSL is available
        try {
            execSync('openssl version', { stdio: 'pipe' });
        } catch (error) {
            console.error('❌ OpenSSL is not installed or not available in PATH');
            console.error('   Please install OpenSSL to generate SSL certificates');
            console.error('   Windows: https://slproweb.com/products/Win32OpenSSL.html');
            console.error('   macOS: brew install openssl');
            console.error('   Linux: sudo apt-get install openssl (Ubuntu/Debian)');
            process.exit(1);
        }

        // Generate private key
        console.log('🔑 Generating private key...');
        execSync(`openssl genrsa -out "${keyPath}" 2048`, {
            stdio: 'pipe',
            cwd: ROOT_DIR
        });

        // Generate certificate
        console.log('📜 Generating certificate...');
        const opensslCommand = [
            'openssl req',
            '-new',
            '-x509',
            '-key', `"${keyPath}"`,
            '-out', `"${certPath}"`,
            '-days 365',
            '-subj "/C=US/ST=Dev/L=Development/O=NestJS-App/CN=localhost"',
            '-config', '<(echo "[req]"; echo "distinguished_name=req"; echo "[v3_req]"; echo "subjectAltName=@alt_names"; echo "[alt_names]"; echo "DNS.1=localhost"; echo "IP.1=127.0.0.1")',
            '-extensions v3_req'
        ].join(' ');

        try {
            // Try with bash for Linux/macOS
            execSync(`bash -c '${opensslCommand}'`, {
                stdio: 'pipe',
                cwd: ROOT_DIR
            });
        } catch {
            // Fallback for Windows or systems without bash
            execSync([
                'openssl req',
                '-new',
                '-x509',
                '-key', `"${keyPath}"`,
                '-out', `"${certPath}"`,
                '-days 365',
                '-subj "/C=US/ST=Dev/L=Development/O=NestJS-App/CN=localhost"'
            ].join(' '), {
                stdio: 'pipe',
                cwd: ROOT_DIR
            });
        }

        // Create .gitignore for ssl directory
        const gitignorePath = join(CERTS_DIR, '.gitignore');
        await fs.writeFile(gitignorePath, '# Ignore all SSL certificates\n*.pem\n*.key\n*.crt\n*.csr\n');

        console.log('✅ SSL certificates generated successfully!');
        console.log(`   Private key: ${keyPath}`);
        console.log(`   Certificate: ${certPath}\n`);

        // Update or create .env file
        await updateEnvFile();

        printUsageInstructions();

    } catch (error) {
        console.error('❌ Failed to generate SSL certificates:', error.message);
        process.exit(1);
    }
}

async function updateEnvFile() {
    const envPath = join(ROOT_DIR, '.env');
    const envExamplePath = join(ROOT_DIR, '.env.example');

    console.log('📝 Updating environment configuration...');

    try {
        let envContent = '';

        try {
            envContent = await fs.readFile(envPath, 'utf-8');
        } catch {
            // .env doesn't exist, try to copy from .env.example
            try {
                envContent = await fs.readFile(envExamplePath, 'utf-8');
                console.log('   Created .env from .env.example');
            } catch {
                console.log('   Created new .env file');
            }
        }

        // Add HTTPS configuration if not present
        const httpsConfigLines = [
            '# HTTPS Development Configuration',
            'USE_HTTPS=true',
            'SSL_KEY_PATH=ssl/private-key.pem',
            'SSL_CERT_PATH=ssl/certificate.pem',
            'HTTPS_PORT=3443',
        ];

        let updatedContent = envContent;
        let hasChanges = false;

        for (const line of httpsConfigLines) {
            if (line.startsWith('#') || !line.includes('=')) {
                continue;
            }

            const [key] = line.split('=');
            const regex = new RegExp(`^${key}=.*$`, 'm');

            if (!regex.test(updatedContent)) {
                if (!updatedContent.includes('# HTTPS Development Configuration')) {
                    updatedContent += '\n\n# HTTPS Development Configuration\n';
                }
                updatedContent += `${line}\n`;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            await fs.writeFile(envPath, updatedContent);
            console.log('   Added HTTPS configuration to .env');
        } else {
            console.log('   HTTPS configuration already present in .env');
        }

    } catch (error) {
        console.warn('⚠️  Could not update .env file:', error.message);
    }
}

function printUsageInstructions() {
    console.log('📋 How to use HTTPS in development:\n');
    console.log('1. Make sure your .env file contains:');
    console.log('   USE_HTTPS=true');
    console.log('   SSL_KEY_PATH=ssl/private-key.pem');
    console.log('   SSL_CERT_PATH=ssl/certificate.pem');
    console.log('   HTTPS_PORT=3443\n');

    console.log('2. Update your main.ts to use HTTPS:');
    console.log('   See docs/development.md for implementation details\n');

    console.log('3. Start your development server:');
    console.log('   npm run start:dev');
    console.log('   or');
    console.log('   yarn start:dev\n');

    console.log('4. Access your app at:');
    console.log('   https://localhost:3443\n');

    console.log('⚠️  Note: Your browser will show a security warning for self-signed certificates.');
    console.log('   Click "Advanced" and "Proceed to localhost" to continue.');
    console.log('   For production, use certificates from a trusted CA.\n');

    console.log('🔧 To regenerate certificates:');
    console.log('   npm run ssl:generate -- --force');
    console.log('   or');
    console.log('   yarn ssl:generate --force\n');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateSSLCertificates();
}

export { generateSSLCertificates };
