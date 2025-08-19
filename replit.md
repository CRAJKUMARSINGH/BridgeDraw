# BridgeGAD - Bridge Technical Drawing Generator

## Overview

BridgeGAD is a specialized engineering application that generates technical AutoCAD DWG files and PDFs from bridge design parameters. The system processes LISP-formatted input data containing bridge engineering parameters, performs complex geometric calculations, and produces professional technical drawings with proper scaling, dimensions, and annotations. Built as a modern full-stack web application, it bridges traditional civil engineering workflows with contemporary web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Component-based UI using modern hooks and functional components for type-safe development
- **Vite Build System**: Fast development server with hot module replacement and optimized production builds
- **shadcn/ui Design System**: Consistent component library built on Radix UI primitives with Tailwind CSS styling
- **TanStack Query**: Robust server state management with caching, background updates, and optimistic updates
- **Wouter Router**: Lightweight client-side routing without React Router overhead
- **Custom Canvas Engine**: Specialized drawing system for technical engineering diagrams with coordinate transformations

### Backend Architecture
- **Express.js REST API**: Node.js server handling file processing, mathematical calculations, and drawing generation
- **TypeScript**: Full type safety across backend services for reliability in engineering calculations
- **Modular Route Structure**: Clean separation between bridge processing, file handling, and user management
- **In-Memory Storage**: Development-ready storage with interface designed for PostgreSQL migration
- **LISP Parser**: Custom parser for traditional engineering input formats used in civil engineering

### Data Processing Pipeline
- **Engineering Parameter Validation**: Zod schema validation ensuring input parameters meet engineering constraints
- **Bridge Calculator**: Mathematical engine implementing coordinate transformations, skew angle adjustments, and layout calculations
- **Drawing Generator**: SVG-based technical drawing creation with proper scaling, grid systems, and dimension annotations
- **Multi-Format Export**: Support for DWG (AutoCAD), PDF, and SVG output formats with customizable paper sizes and scales

### Database Design
- **Drizzle ORM**: Type-safe database operations with schema migration support
- **PostgreSQL with Neon**: Serverless database for scalable project storage
- **Project Management**: User projects, bridge parameters, cross-sections, and generated drawings
- **Batch Processing**: Support for processing multiple bridge files simultaneously with progress tracking

### Engineering Calculation Engine
- **Coordinate System Transformations**: Mathematical conversion between engineering coordinates and drawing coordinates
- **Skew Angle Processing**: Geometric adjustments for skewed bridge alignments
- **Scale Factor Management**: Dual scaling system for different drawing views (plan, elevation, sections)
- **Cross-Section Generation**: Automated creation of bridge cross-sections from chainage and level data

### File Processing Workflow
1. **Input Validation**: LISP format parsing with error handling for malformed data
2. **Parameter Extraction**: Structured data conversion from legacy formats
3. **Engineering Calculations**: Coordinate transformations and geometric processing
4. **Drawing Generation**: Technical drawing creation with proper annotations
5. **Export Processing**: Multi-format output with user-configurable settings

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver for scalable data storage
- **drizzle-orm**: Type-safe ORM for database operations with migration support
- **@tanstack/react-query**: Server state management with advanced caching and synchronization
- **@radix-ui/react-***: Comprehensive UI component primitives for accessibility and consistency
- **express**: Node.js web framework for REST API development

### Engineering and File Processing
- **ezdxf** (Python service): AutoCAD DWG file generation for professional CAD output
- **FastAPI** (Python service): High-performance API for DWG export functionality with automatic documentation
- **multer**: File upload handling for input data processing
- **zod**: Runtime type validation for engineering parameter validation

### Development and Build Tools
- **vite**: Modern build system with fast development server and optimized production builds
- **typescript**: Type safety across frontend and backend for reliable engineering calculations
- **tailwindcss**: Utility-first CSS framework for consistent design system
- **tsx**: TypeScript execution for development workflow
- **esbuild**: Fast JavaScript bundler for production builds

### UI and Interaction
- **wouter**: Lightweight routing for single-page application navigation
- **class-variance-authority**: Type-safe variant management for component styling
- **date-fns**: Date manipulation library for project timestamps and file metadata
- **lucide-react**: Icon library for consistent visual elements