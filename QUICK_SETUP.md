# Quick Setup Guide

This guide will get your NestJS boilerplate running with all fixes applied for Orval API client generation.

## 🚀 One-Command Setup

### Linux/macOS/WSL

```bash
# Full setup (recommended)
./setup.sh

# Or using npm
npm run setup
```

### Windows PowerShell

```powershell
# Full setup (recommended)
.\setup.ps1

# Or using npm
npm run setup:windows
```

## 📋 Setup Options

The setup script supports various flags to customize the installation:

### Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `--no-cleanup` | Keep the post module (don't remove it) | `./setup.sh --no-cleanup` |
| `--no-ssl` | Skip SSL certificate generation | `./setup.sh --no-ssl` |
| `--no-install` | Skip dependency installation | `./setup.sh --no-install` |
| `--use-yarn` | Use yarn instead of npm | `./setup.sh --use-yarn` |
| `--verbose` | Show detailed output | `./setup.sh --verbose` |
| `--help` | Show help message | `./setup.sh --help` |

### Examples

```bash
# Keep post module and use yarn
./setup.sh --no-cleanup --use-yarn

# Skip SSL generation (if OpenSSL not available)
./setup.sh --no-ssl

# Minimal setup (no cleanup, no SSL)
./setup.sh --no-cleanup --no-ssl

# Verbose output for debugging
./setup.sh --verbose
```

## 🔧 What the Setup Does

1. **📦 Installs Dependencies**
   - Runs `npm install` or `yarn install`
   - Includes all required packages including `tsx` for scripts

2. **🔐 Generates SSL Certificates**
   - Creates self-signed certificates for HTTPS development
   - Sets up `ssl/` directory with proper `.gitignore`
   - Updates `.env` with HTTPS configuration

3. **🧹 Cleans Up Post Module** (optional)
   - Removes unnecessary post module if not needed
   - Updates all references and imports
   - Creates rollback capability

4. **✅ Validates Setup**
   - Runs comprehensive validation checks
   - Verifies all components are working

5. **📋 Provides Next Steps**
   - Shows how to start development server
   - Explains Orval integration
   - Lists useful commands

## 🌐 After Setup

### Start Development Server

```bash
# HTTPS development (recommended)
npm run start:https
# Access: https://localhost:3443

# HTTP development
npm run start:dev
# Access: http://localhost:3000
```

### Generate API Client with Orval

```bash
# Install Orval globally
npm install -g @orval/cli

# Generate TypeScript client
npm run orval:generate
```

## 📁 Generated Structure

After setup, your project will have:

```
├── ssl/                          # SSL certificates for HTTPS
│   ├── private-key.pem
│   ├── certificate.pem
│   └── .gitignore
├── src/
│   └── api/                      # Generated API clients (after Orval)
│       ├── mutator.ts           # Custom Axios configuration
│       └── generated.ts         # Orval-generated client
├── scripts/
│   ├── cleanup-post-module.ts   # Post module cleanup
│   ├── generate-ssl-certs.mjs   # SSL certificate generator
│   └── validate-fixes.ts        # Setup validation
├── orval.config.js              # Orval configuration
├── setup.sh                     # Linux/macOS setup script
├── setup.ps1                    # Windows PowerShell setup script
└── .env                         # Environment configuration
```

## 🔍 Validation

Verify your setup is working correctly:

```bash
npm run validate:fixes
```

This checks:

- ✅ Dependencies installed
- ✅ SSL certificates generated
- ✅ Post module cleaned up (if requested)
- ✅ OpenAPI documentation working
- ✅ Custom decorators fixed
- ✅ TypeScript compilation

## 🆘 Troubleshooting

### Common Issues

**OpenSSL not found**

```bash
# Install OpenSSL
# Windows: https://slproweb.com/products/Win32OpenSSL.html
# macOS: brew install openssl
# Ubuntu/Debian: sudo apt-get install openssl
```

**Permission denied on setup.sh**

```bash
chmod +x setup.sh
./setup.sh
```

**PowerShell execution policy**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

**Node.js version issues**

- Requires Node.js v18+
- Update Node.js: <https://nodejs.org/>

### Manual Setup

If the automated setup fails, you can run commands manually:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Generate SSL certificates
npm run ssl:generate

# 4. Clean up post module (optional)
npm run cleanup:post

# 5. Validate setup
npm run validate:fixes
```

## 🎯 Next Steps

1. **Configure Database**: Update `.env` with your database settings
2. **Customize API**: Modify controllers and services as needed
3. **Generate Client**: Use Orval to generate API clients
4. **Deploy**: Follow deployment guide for production setup

## 📚 Additional Resources

- [Complete Setup Documentation](./ORVAL_READY_FIXES.md)
- [Development Guide](./docs/development.md)
- [Orval Documentation](https://orval.dev/)
- [NestJS Documentation](https://nestjs.com/)

---

**Happy coding! 🚀**
