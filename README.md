# OpenRouter Studio

A modern web application for exploring and testing AI models through the OpenRouter API. Built with React, TypeScript, and Express, this tool provides an intuitive interface for comparing model responses and discovering the best AI models for your needs.

## Features

- **Arena Mode**: Blind comparison system where you vote for the better response without knowing which model generated it
- **Star Voting System**: Rate model responses and contribute to community rankings
- **Model Explorer**: Browse and filter through hundreds of AI models from various providers
- **Interactive Testing**: Test prompts with different models and compare responses
- **Real-time Statistics**: Track usage metrics and response times
- **Dark/Light Theme**: Seamless theme switching for better user experience

## Screenshots

### Main Interface
The clean, modern interface makes it easy to test and compare AI models.

### Arena Mode
Compare multiple models side-by-side without knowing which is which.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/openrouter-studio.git
cd openrouter-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

### API Key Setup

1. Sign up for an OpenRouter account at [openrouter.ai](https://openrouter.ai/)
2. Generate an API key from your dashboard
3. Enter your API key in the application interface

## Usage

### Basic Testing
1. Enter your OpenRouter API key
2. Select a model from the dropdown
3. Type your prompt
4. Adjust temperature and other parameters
5. Click "Send Request" to get a response

### Arena Mode & Star Voting
1. Navigate to Arena Mode for blind model comparisons
2. Enter your prompt - the system randomly selects models
3. Rate responses with 1-5 stars without knowing which model generated them
4. Vote for your preferred response in head-to-head comparisons
5. View community rankings and consensus results based on collective voting
6. Contribute to the global understanding of model performance across different use cases

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite
- **API**: OpenRouter REST API

## How Arena Mode Works

The Arena Mode creates an unbiased environment for model evaluation:

- **Blind Testing**: Models are selected randomly and responses are shown without attribution
- **Star Ratings**: Rate each response from 1-5 stars based on quality, helpfulness, and accuracy
- **Head-to-Head Voting**: Choose the better response when comparing two models directly
- **Consensus Algorithm**: Aggregates community votes to generate reliable model rankings
- **Performance Insights**: See which models excel at different types of tasks
- **Fair Evaluation**: Removes brand bias by focusing purely on response quality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking

## API Endpoints

- `GET /api/models` - Fetch available models
- `POST /api/chat/completions` - Send chat completion request
- `GET /api/stats` - Get usage statistics

## Configuration

The application uses environment variables for configuration:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (defaults to 5000)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [LobeHub](https://lobehub.com/) for providing free vector icons
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide React](https://lucide.dev/) for beautiful icons

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yanoshercohen/openrouter-studio/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Made with ❤️ for the AI community. Star ⭐ this repo if you find it useful!
