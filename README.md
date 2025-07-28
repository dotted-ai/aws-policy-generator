# AWS IAM Policy Generator

A modern web application that provides an intuitive interface for creating and customizing AWS IAM policies. Build IAM policies visually by selecting AWS services, actions, and resources through an easy-to-use interface rather than writing JSON manually.

## Features

- **Visual Policy Builder** - Create IAM policies through an intuitive interface
- **Statement Management** - Add, edit, and remove policy statements with ease
- **Pre-built Templates** - Quick start templates for common use cases:
  - S3 bucket access policies
  - DynamoDB table permissions
  - EC2 instance management
  - Lambda function execution roles
- **Real-time Validation** - Instant policy validation with detailed error reporting
- **Custom Actions & Resources** - Support for custom actions and resource ARNs
- **Export Options** - Copy to clipboard or download as JSON file
- **Service-specific Suggestions** - Intelligent action suggestions based on selected AWS services

## Technology Stack

- **Next.js 15.2.4** with App Router
- **React 19** with Server Components
- **TypeScript 5** for type safety
- **Tailwind CSS 3.4.17** for styling
- **shadcn/ui** component library
- **React Hook Form** for form management
- **Zod** for schema validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aws-policy-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select AWS Service** - Choose the AWS service you want to create policies for
2. **Add Statements** - Create policy statements by selecting:
   - Effect (Allow/Deny)
   - Actions (service-specific permissions)
   - Resources (ARNs or wildcards)
   - Conditions (optional)
3. **Validate Policy** - Real-time validation ensures your policy is syntactically correct
4. **Export Policy** - Copy to clipboard or download as JSON file

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities
└── public/               # Static assets
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build       # Build for production
npm run start       # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Target Users

- AWS developers and administrators
- DevOps engineers
- Security professionals working with IAM policies
- Anyone who needs to create AWS IAM policies without writing JSON manually

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.