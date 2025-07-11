# NestJS Boilerplate Setup Script (PowerShell)
# Handles complete project setup with optional configurations

param(
    [switch]$NoCleanup,
    [switch]$NoSSL,
    [switch]$NoInstall,
    [switch]$UseYarn,
    [switch]$Verbose,
    [switch]$Help
)

# Color functions
function Write-Status { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Section { param($Message) Write-Host "`n=== $Message ===`n" -ForegroundColor Magenta }

# Show help
function Show-Help {
    Write-Host @"
NestJS Boilerplate Setup Script (PowerShell)

USAGE:
    .\setup.ps1 [OPTIONS]

OPTIONS:
    -NoCleanup      Skip post module cleanup (keep post module)
    -NoSSL          Skip SSL certificate generation
    -NoInstall      Skip dependency installation
    -UseYarn        Use yarn instead of npm
    -Verbose        Show detailed output
    -Help           Show this help message

EXAMPLES:
    # Full setup with post module cleanup
    .\setup.ps1

    # Setup without removing post module
    .\setup.ps1 -NoCleanup

    # Setup with yarn and verbose output
    .\setup.ps1 -UseYarn -Verbose

    # Minimal setup (no SSL, no cleanup)
    .\setup.ps1 -NoSSL -NoCleanup

WHAT THIS SCRIPT DOES:
    1. 📦 Installs project dependencies (npm/yarn)
    2. 🔐 Generates SSL certificates for HTTPS development
    3. 🧹 Cleans up post module (optional)
    4. ✅ Validates the setup
    5. 📋 Provides next steps

REQUIREMENTS:
    - Node.js (v18+ recommended)
    - npm or yarn
    - OpenSSL (for SSL certificate generation)
    - Git (recommended)
"@
}

if ($Help) {
    Show-Help
    exit 0
}

# Function to run commands
function Invoke-Command-Safe {
    param($Command, $Description)
    
    if ($Verbose) {
        Write-Status "Running: $Command"
    }
    
    try {
        if ($Verbose) {
            Invoke-Expression $Command
        } else {
            Invoke-Expression $Command | Out-Null
        }
        Write-Success $Description
        return $true
    } catch {
        Write-Error "Failed: $Description - $($_.Exception.Message)"
        return $false
    }
}

# Check prerequisites
function Test-Prerequisites {
    Write-Section "Checking Prerequisites"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        Write-Error "Node.js not found. Please install Node.js (v18+ recommended)"
        exit 1
    }
    
    # Check package manager
    if ($UseYarn) {
        try {
            $yarnVersion = yarn --version
            Write-Success "Yarn found: v$yarnVersion"
            $script:PackageManager = "yarn"
        } catch {
            Write-Error "Yarn not found. Install yarn or remove -UseYarn flag"
            exit 1
        }
    } else {
        try {
            $npmVersion = npm --version
            Write-Success "npm found: v$npmVersion"
            $script:PackageManager = "npm"
        } catch {
            Write-Error "npm not found. Please install Node.js and npm"
            exit 1
        }
    }
    
    # Check OpenSSL
    if (-not $NoSSL) {
        try {
            $opensslVersion = (openssl version).Split(' ')[1]
            Write-Success "OpenSSL found: $opensslVersion"
        } catch {
            Write-Warning "OpenSSL not found. SSL generation will be skipped"
            Write-Warning "Install OpenSSL to enable HTTPS development"
            $script:NoSSL = $true
        }
    }
    
    # Check project files
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root"
        exit 1
    }
    
    if (-not (Test-Path "nest-cli.json")) {
        Write-Error "nest-cli.json not found. This doesn't appear to be a NestJS project"
        exit 1
    }
    
    Write-Success "All prerequisites met"
}

# Install dependencies
function Install-Dependencies {
    if ($NoInstall) {
        Write-Warning "Skipping dependency installation"
        return
    }
    
    Write-Section "Installing Dependencies"
    
    if ($PackageManager -eq "yarn") {
        Invoke-Command-Safe "yarn install" "Dependencies installed with yarn"
    } else {
        Invoke-Command-Safe "npm install" "Dependencies installed with npm"
    }
}

# Setup environment
function Set-Environment {
    Write-Section "Setting up Environment"
    
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Environment file created from .env.example"
        } else {
            Write-Warning ".env.example not found, creating basic .env"
            @"
NODE_ENV=development
PORT=3000
USE_HTTPS=false
SSL_KEY_PATH=ssl/private-key.pem
SSL_CERT_PATH=ssl/certificate.pem
HTTPS_PORT=3443
ENABLE_DOCUMENTATION=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Success "Basic .env file created"
        }
    } else {
        Write-Success "Environment file already exists"
    }
}

# Generate SSL certificates
function New-SSLCertificates {
    if ($NoSSL) {
        Write-Warning "Skipping SSL certificate generation"
        return
    }
    
    Write-Section "Generating SSL Certificates"
    
    if (Test-Path "scripts/generate-ssl-certs.mjs") {
        Invoke-Command-Safe "node scripts/generate-ssl-certs.mjs" "SSL certificates generated"
    } else {
        Write-Warning "SSL generation script not found, creating certificates manually"
        
        # Create ssl directory
        New-Item -ItemType Directory -Path "ssl" -Force | Out-Null
        
        # Generate private key
        Invoke-Command-Safe "openssl genrsa -out ssl/private-key.pem 2048" "Private key generated"
        
        # Generate certificate
        Invoke-Command-Safe "openssl req -new -x509 -key ssl/private-key.pem -out ssl/certificate.pem -days 365 -subj '/C=US/ST=Dev/L=Development/O=NestJS-App/CN=localhost'" "Certificate generated"
        
        # Create .gitignore for ssl directory
        @"
# Ignore all SSL certificates
*.pem
*.key
*.crt
*.csr
"@ | Out-File -FilePath "ssl/.gitignore" -Encoding UTF8
        
        Write-Success "SSL certificates created manually"
    }
}

# Cleanup post module
function Remove-PostModule {
    if ($NoCleanup) {
        Write-Warning "Skipping post module cleanup (keeping post module)"
        return
    }
    
    Write-Section "Cleaning up Post Module"
    
    if (Test-Path "src/modules/post") {
        if (Test-Path "scripts/cleanup-post-module.ts") {
            if ($PackageManager -eq "yarn") {
                Invoke-Command-Safe "yarn cleanup:post" "Post module cleaned up"
            } else {
                Invoke-Command-Safe "npm run cleanup:post" "Post module cleaned up"
            }
        } else {
            Write-Warning "Cleanup script not found, removing post module manually"
            Remove-Item -Path "src/modules/post" -Recurse -Force
            Write-Success "Post module directory removed"
            Write-Warning "Manual cleanup may leave references in other files"
        }
    } else {
        Write-Success "Post module not found (already cleaned up)"
    }
}

# Validate setup
function Test-Setup {
    Write-Section "Validating Setup"
    
    # Check if validation script exists and run it
    if (Test-Path "scripts/validate-fixes.ts") {
        try {
            if ($PackageManager -eq "yarn") {
                yarn validate:fixes | Out-Null
            } else {
                npm run validate:fixes | Out-Null
            }
            Write-Success "Setup validation passed"
        } catch {
            Write-Warning "Some validation checks failed (this may be expected)"
        }
    } else {
        Write-Warning "Validation script not found, skipping validation"
    }
    
    # Basic file checks
    $checksPassed = 0
    $totalChecks = 0
    
    # Check .env file
    $totalChecks++
    if (Test-Path ".env") {
        $checksPassed++
        Write-Success "✓ .env file exists"
    } else {
        Write-Error "✗ .env file missing"
    }
    
    # Check SSL certificates (if not skipped)
    if (-not $NoSSL) {
        $totalChecks += 2
        if (Test-Path "ssl/private-key.pem") {
            $checksPassed++
            Write-Success "✓ SSL private key exists"
        } else {
            Write-Error "✗ SSL private key missing"
        }
        
        if (Test-Path "ssl/certificate.pem") {
            $checksPassed++
            Write-Success "✓ SSL certificate exists"
        } else {
            Write-Error "✗ SSL certificate missing"
        }
    }
    
    # Check node_modules (if not skipped)
    if (-not $NoInstall) {
        $totalChecks++
        if (Test-Path "node_modules") {
            $checksPassed++
            Write-Success "✓ Dependencies installed"
        } else {
            Write-Error "✗ Dependencies not installed"
        }
    }
    
    # Check post module cleanup (if not skipped)
    if (-not $NoCleanup) {
        $totalChecks++
        if (-not (Test-Path "src/modules/post")) {
            $checksPassed++
            Write-Success "✓ Post module cleaned up"
        } else {
            Write-Warning "✓ Post module still exists (cleanup may have failed)"
        }
    }
    
    Write-Status "Validation summary: $checksPassed/$totalChecks checks passed"
}

# Show next steps
function Show-NextSteps {
    Write-Section "Setup Complete! Next Steps"
    
    Write-Host "🎉 Your NestJS boilerplate is ready!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "To start development:" -ForegroundColor Cyan
    
    if (-not $NoSSL) {
        Write-Host "  # Start with HTTPS (recommended)" -ForegroundColor Yellow
        if ($PackageManager -eq "yarn") {
            Write-Host "  yarn start:https"
        } else {
            Write-Host "  npm run start:https"
        }
        Write-Host "  # Access at: https://localhost:3443" -ForegroundColor Blue
        Write-Host "  # API docs: https://localhost:3443/documentation" -ForegroundColor Blue
        Write-Host ""
    }
    
    Write-Host "  # Or start with HTTP" -ForegroundColor Yellow
    if ($PackageManager -eq "yarn") {
        Write-Host "  yarn start:dev"
    } else {
        Write-Host "  npm run start:dev"
    }
    Write-Host "  # Access at: http://localhost:3000" -ForegroundColor Blue
    Write-Host "  # API docs: http://localhost:3000/documentation" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "To generate API clients with Orval:" -ForegroundColor Cyan
    Write-Host "  # Install Orval" -ForegroundColor Yellow
    Write-Host "  npm install -g @orval/cli"
    Write-Host "  # Generate client (after starting the server)" -ForegroundColor Yellow
    Write-Host "  orval --config orval.config.js"
    Write-Host ""
    
    if (-not $NoCleanup) {
        Write-Host "To restore post module if needed:" -ForegroundColor Cyan
        if ($PackageManager -eq "yarn") {
            Write-Host "  yarn rollback:post"
        } else {
            Write-Host "  npm run rollback:post"
        }
        Write-Host ""
    }
    
    Write-Host "Additional commands:" -ForegroundColor Cyan
    if ($PackageManager -eq "yarn") {
        Write-Host "  yarn validate:fixes     # Validate setup" -ForegroundColor Blue
        Write-Host "  yarn ssl:generate       # Regenerate SSL certs" -ForegroundColor Blue
        Write-Host "  yarn cleanup:post       # Remove post module" -ForegroundColor Blue
    } else {
        Write-Host "  npm run validate:fixes  # Validate setup" -ForegroundColor Blue
        Write-Host "  npm run ssl:generate    # Regenerate SSL certs" -ForegroundColor Blue
        Write-Host "  npm run cleanup:post    # Remove post module" -ForegroundColor Blue
    }
    
    Write-Host "`nHappy coding! 🚀" -ForegroundColor Green
}

# Main execution
function Main {
    Write-Host @"
    _   _           _     _  _____ 
   | \ | |         | |   | |/ ____|
   |  \| | ___  ___| |_  | | (___  
   | . ` |/ _ \/ __| __| | |\___ \ 
   | |\  |  __/\__ \ |_  | |____) |
   |_| \_|\___||___/\__| |_|_____/ 
                                   
   Boilerplate Setup Script (PowerShell)
"@ -ForegroundColor Cyan
    
    Write-Status "Starting NestJS boilerplate setup..."
    Write-Status "Options: NoCleanup=$NoCleanup, NoSSL=$NoSSL, NoInstall=$NoInstall, UseYarn=$UseYarn"
    
    Test-Prerequisites
    Set-Environment
    Install-Dependencies
    New-SSLCertificates
    Remove-PostModule
    Test-Setup
    Show-NextSteps
}

# Run main function
Main
