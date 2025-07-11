#!/bin/bash

# NestJS Boilerplate Setup Script
# Handles complete project setup with optional configurations

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default options
SKIP_CLEANUP=false
SKIP_SSL=false
SKIP_INSTALL=false
USE_YARN=false
VERBOSE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}\n"
}

# Function to show help
show_help() {
    cat << EOF
${CYAN}NestJS Boilerplate Setup Script${NC}

USAGE:
    ./setup.sh [OPTIONS]

OPTIONS:
    --no-cleanup        Skip post module cleanup (keep post module)
    --no-ssl           Skip SSL certificate generation
    --no-install       Skip dependency installation
    --use-yarn         Use yarn instead of npm
    --verbose          Show detailed output
    -h, --help         Show this help message

EXAMPLES:
    # Full setup with post module cleanup
    ./setup.sh

    # Setup without removing post module
    ./setup.sh --no-cleanup

    # Setup with yarn and verbose output
    ./setup.sh --use-yarn --verbose

    # Minimal setup (no SSL, no cleanup)
    ./setup.sh --no-ssl --no-cleanup

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

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        --no-ssl)
            SKIP_SSL=true
            shift
            ;;
        --no-install)
            SKIP_INSTALL=true
            shift
            ;;
        --use-yarn)
            USE_YARN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Function to detect package manager
detect_package_manager() {
    if [ "$USE_YARN" = true ]; then
        if command -v yarn >/dev/null 2>&1; then
            echo "yarn"
        else
            print_error "Yarn not found. Install yarn or use --no-yarn flag"
            exit 1
        fi
    else
        if command -v npm >/dev/null 2>&1; then
            echo "npm"
        else
            print_error "npm not found. Please install Node.js and npm"
            exit 1
        fi
    fi
}

# Function to run commands with optional verbose output
run_command() {
    local cmd="$1"
    local description="$2"
    
    if [ "$VERBOSE" = true ]; then
        print_status "Running: $cmd"
    fi
    
    if [ "$VERBOSE" = true ]; then
        eval "$cmd"
    else
        eval "$cmd" >/dev/null 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        print_success "$description"
    else
        print_error "Failed: $description"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        print_success "Node.js found: $node_version"
    else
        print_error "Node.js not found. Please install Node.js (v18+ recommended)"
        exit 1
    fi
    
    # Check package manager
    local pkg_manager=$(detect_package_manager)
    if [ "$pkg_manager" = "yarn" ]; then
        local yarn_version=$(yarn --version)
        print_success "Yarn found: v$yarn_version"
    else
        local npm_version=$(npm --version)
        print_success "npm found: v$npm_version"
    fi
    
    # Check OpenSSL (only if SSL generation is not skipped)
    if [ "$SKIP_SSL" = false ]; then
        if command -v openssl >/dev/null 2>&1; then
            local openssl_version=$(openssl version | cut -d' ' -f2)
            print_success "OpenSSL found: $openssl_version"
        else
            print_warning "OpenSSL not found. SSL generation will be skipped"
            print_warning "Install OpenSSL to enable HTTPS development"
            SKIP_SSL=true
        fi
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root"
        exit 1
    fi
    
    if [ ! -f "nest-cli.json" ]; then
        print_error "nest-cli.json not found. This doesn't appear to be a NestJS project"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to install dependencies
install_dependencies() {
    if [ "$SKIP_INSTALL" = true ]; then
        print_warning "Skipping dependency installation"
        return
    fi
    
    print_section "Installing Dependencies"
    
    local pkg_manager=$(detect_package_manager)
    
    if [ "$pkg_manager" = "yarn" ]; then
        run_command "yarn install" "Dependencies installed with yarn"
    else
        run_command "npm install" "Dependencies installed with npm"
    fi
}

# Function to setup environment file
setup_environment() {
    print_section "Setting up Environment"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            run_command "cp .env.example .env" "Environment file created from .env.example"
        else
            print_warning ".env.example not found, creating basic .env"
            cat > .env << EOF
NODE_ENV=development
PORT=3000
USE_HTTPS=false
SSL_KEY_PATH=ssl/private-key.pem
SSL_CERT_PATH=ssl/certificate.pem
HTTPS_PORT=3443
ENABLE_DOCUMENTATION=true
EOF
            print_success "Basic .env file created"
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Function to generate SSL certificates
generate_ssl_certificates() {
    if [ "$SKIP_SSL" = true ]; then
        print_warning "Skipping SSL certificate generation"
        return
    fi
    
    print_section "Generating SSL Certificates"
    
    if [ -f "scripts/generate-ssl-certs.mjs" ]; then
        run_command "node scripts/generate-ssl-certs.mjs" "SSL certificates generated"
    else
        print_warning "SSL generation script not found, creating certificates manually"
        
        # Create ssl directory
        mkdir -p ssl
        
        # Generate private key
        run_command "openssl genrsa -out ssl/private-key.pem 2048" "Private key generated"
        
        # Generate certificate
        run_command "openssl req -new -x509 -key ssl/private-key.pem -out ssl/certificate.pem -days 365 -subj '/C=US/ST=Dev/L=Development/O=NestJS-App/CN=localhost'" "Certificate generated"
        
        # Create .gitignore for ssl directory
        echo "# Ignore all SSL certificates" > ssl/.gitignore
        echo "*.pem" >> ssl/.gitignore
        echo "*.key" >> ssl/.gitignore
        echo "*.crt" >> ssl/.gitignore
        echo "*.csr" >> ssl/.gitignore
        
        print_success "SSL certificates created manually"
    fi
}

# Function to cleanup post module
cleanup_post_module() {
    if [ "$SKIP_CLEANUP" = true ]; then
        print_warning "Skipping post module cleanup (keeping post module)"
        return
    fi
    
    print_section "Cleaning up Post Module"
    
    local pkg_manager=$(detect_package_manager)
    
    if [ -d "src/modules/post" ]; then
        if [ -f "scripts/cleanup-post-module.ts" ]; then
            if [ "$pkg_manager" = "yarn" ]; then
                run_command "yarn cleanup:post" "Post module cleaned up"
            else
                run_command "npm run cleanup:post" "Post module cleaned up"
            fi
        else
            print_warning "Cleanup script not found, removing post module manually"
            run_command "rm -rf src/modules/post" "Post module directory removed"
            print_warning "Manual cleanup may leave references in other files"
        fi
    else
        print_success "Post module not found (already cleaned up)"
    fi
}

# Function to validate setup
validate_setup() {
    print_section "Validating Setup"
    
    local pkg_manager=$(detect_package_manager)
    
    # Check if validation script exists and run it
    if [ -f "scripts/validate-fixes.ts" ]; then
        if [ "$pkg_manager" = "yarn" ]; then
            if yarn validate:fixes >/dev/null 2>&1; then
                print_success "Setup validation passed"
            else
                print_warning "Some validation checks failed (this may be expected)"
            fi
        else
            if npm run validate:fixes >/dev/null 2>&1; then
                print_success "Setup validation passed"
            else
                print_warning "Some validation checks failed (this may be expected)"
            fi
        fi
    else
        print_warning "Validation script not found, skipping validation"
    fi
    
    # Basic file checks
    local checks_passed=0
    local total_checks=0
    
    # Check .env file
    total_checks=$((total_checks + 1))
    if [ -f ".env" ]; then
        checks_passed=$((checks_passed + 1))
        print_success "✓ .env file exists"
    else
        print_error "✗ .env file missing"
    fi
    
    # Check SSL certificates (if not skipped)
    if [ "$SKIP_SSL" = false ]; then
        total_checks=$((total_checks + 2))
        if [ -f "ssl/private-key.pem" ]; then
            checks_passed=$((checks_passed + 1))
            print_success "✓ SSL private key exists"
        else
            print_error "✗ SSL private key missing"
        fi
        
        if [ -f "ssl/certificate.pem" ]; then
            checks_passed=$((checks_passed + 1))
            print_success "✓ SSL certificate exists"
        else
            print_error "✗ SSL certificate missing"
        fi
    fi
    
    # Check node_modules (if not skipped)
    if [ "$SKIP_INSTALL" = false ]; then
        total_checks=$((total_checks + 1))
        if [ -d "node_modules" ]; then
            checks_passed=$((checks_passed + 1))
            print_success "✓ Dependencies installed"
        else
            print_error "✗ Dependencies not installed"
        fi
    fi
    
    # Check post module cleanup (if not skipped)
    if [ "$SKIP_CLEANUP" = false ]; then
        total_checks=$((total_checks + 1))
        if [ ! -d "src/modules/post" ]; then
            checks_passed=$((checks_passed + 1))
            print_success "✓ Post module cleaned up"
        else
            print_warning "✓ Post module still exists (cleanup may have failed)"
        fi
    fi
    
    print_status "Validation summary: $checks_passed/$total_checks checks passed"
}

# Function to show next steps
show_next_steps() {
    print_section "Setup Complete! Next Steps"
    
    local pkg_manager=$(detect_package_manager)
    
    echo -e "${GREEN}🎉 Your NestJS boilerplate is ready!${NC}\n"
    
    echo -e "${CYAN}To start development:${NC}"
    
    if [ "$SKIP_SSL" = false ]; then
        echo -e "  ${YELLOW}# Start with HTTPS (recommended)${NC}"
        if [ "$pkg_manager" = "yarn" ]; then
            echo -e "  yarn start:https"
        else
            echo -e "  npm run start:https"
        fi
        echo -e "  ${BLUE}# Access at: https://localhost:3443${NC}"
        echo -e "  ${BLUE}# API docs: https://localhost:3443/documentation${NC}\n"
    fi
    
    echo -e "  ${YELLOW}# Or start with HTTP${NC}"
    if [ "$pkg_manager" = "yarn" ]; then
        echo -e "  yarn start:dev"
    else
        echo -e "  npm run start:dev"
    fi
    echo -e "  ${BLUE}# Access at: http://localhost:3000${NC}"
    echo -e "  ${BLUE}# API docs: http://localhost:3000/documentation${NC}\n"
    
    echo -e "${CYAN}To generate API clients with Orval:${NC}"
    echo -e "  ${YELLOW}# Install Orval${NC}"
    echo -e "  npm install -g @orval/cli"
    echo -e "  ${YELLOW}# Generate client (after starting the server)${NC}"
    echo -e "  orval --config orval.config.js\n"
    
    if [ "$SKIP_CLEANUP" = false ]; then
        echo -e "${CYAN}To restore post module if needed:${NC}"
        if [ "$pkg_manager" = "yarn" ]; then
            echo -e "  yarn rollback:post\n"
        else
            echo -e "  npm run rollback:post\n"
        fi
    fi
    
    echo -e "${CYAN}Additional commands:${NC}"
    if [ "$pkg_manager" = "yarn" ]; then
        echo -e "  yarn validate:fixes     ${BLUE}# Validate setup${NC}"
        echo -e "  yarn ssl:generate       ${BLUE}# Regenerate SSL certs${NC}"
        echo -e "  yarn cleanup:post       ${BLUE}# Remove post module${NC}"
    else
        echo -e "  npm run validate:fixes  ${BLUE}# Validate setup${NC}"
        echo -e "  npm run ssl:generate    ${BLUE}# Regenerate SSL certs${NC}"
        echo -e "  npm run cleanup:post    ${BLUE}# Remove post module${NC}"
    fi
    
    echo -e "\n${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    echo -e "${CYAN}"
    cat << "EOF"
    _   _           _     _  _____ 
   | \ | |         | |   | |/ ____|
   |  \| | ___  ___| |_  | | (___  
   | . ` |/ _ \/ __| __| | |\___ \ 
   | |\  |  __/\__ \ |_  | |____) |
   |_| \_|\___||___/\__| |_|_____/ 
                                   
   Boilerplate Setup Script
EOF
    echo -e "${NC}"
    
    print_status "Starting NestJS boilerplate setup..."
    print_status "Options: SKIP_CLEANUP=$SKIP_CLEANUP, SKIP_SSL=$SKIP_SSL, SKIP_INSTALL=$SKIP_INSTALL, USE_YARN=$USE_YARN"
    
    check_prerequisites
    setup_environment
    install_dependencies
    generate_ssl_certificates
    cleanup_post_module
    validate_setup
    show_next_steps
}

# Run main function
main "$@"
