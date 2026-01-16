# Beslutningsstøtte MVP

> Privacy-first medical decision support tool for calculating drug tapering schedules with multi-drug support, interaction risk assessment, and local-only data storage.

A production-ready React + TypeScript application that helps healthcare professionals create scientifically-based medication tapering plans. All data stored locally in IndexedDB - no backend, no cloud, no PII collection.

## ⚠️ Disclaimer

**Beslutningsstøtte – ikke medisinsk beslutning**

This tool is for decision support only. It does not replace clinical judgment or medical responsibility. All use is at your own risk.

## Features

- **Drug Library**: Manual entry of pharmacokinetic data (half-life, standard dose, etc.)
- **Tapering Calculator**: Calculate dose reduction schedules using pure mathematics
- **Risk Tags**: Simple interaction risk indicators (red/yellow/green) from local table
- **Journal Note Generator**: Create formatted clinical notes
- **Local Storage**: All data stored in IndexedDB - no backend, no server calls
- **Privacy-First**: No PII, no patient data, no tracking, no analytics

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI**: Material-UI (MUI)
- **Database**: IndexedDB (Dexie)
- **Build**: Vite
- **Testing**: Vitest
- **Code Quality**: ESLint (strict) + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```powershell
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Testing
npm run test
npm run test:ui
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Main application views
├── models/         # TypeScript type definitions
├── storage/        # IndexedDB database layer
├── utils/          # Pure utility functions
├── constants/      # Localization and configuration
└── theme/          # MUI theme configuration
```

## Code Principles

- **Minimal**: Only essential code, no boilerplate
- **Pure Functions**: Isolated side effects
- **Type Safety**: No `any` types
- **Accessibility**: ARIA labels, keyboard navigation
- **Security**: No external calls, no tracking
- **Privacy**: No personal/patient identifiers

## Quality Gates

✅ ESLint strict mode - zero warnings
✅ TypeScript strict mode
✅ Unit tests for calculations
✅ Error boundaries
✅ Input validation
✅ No dead code or unused imports

## License

Private/Internal Use Only

## Support

This is an MVP for evaluation. No support provided.
