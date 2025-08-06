# RAG Onboarding Chatbot

A Retrieval-Augmented Generation (RAG) chatbot built with Node.js and Ollama for employee onboarding assistance. This chatbot can answer questions about company policies, procedures, benefits, and more using your documentation.

## 🏗️ Architecture

This implementation follows the RAG architecture pattern described in the referenced article:

1. **Client Interaction**: Web interface for user queries
2. **Semantic Search**: Vector database search using embeddings
3. **Contextual Data Retrieval**: Relevant document chunks are retrieved
4. **LLM Processing**: Ollama LLM generates responses using context
5. **Post-processing**: Response refinement and formatting
6. **Response Delivery**: Clean, contextual answers to users

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Ollama installed on your system

### Installation

1. **Clone or create the project directory**:
   ```bash
   mkdir rag-onboarding-chatbot
   cd rag-onboarding-chatbot
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Install and setup Ollama**:
   
   **On macOS/Linux**:
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Or visit https://ollama.ai/ for other installation methods
   ```
   
   **On Windows**:
   - Download and install from https://ollama.ai/

4. **Pull required models**:
   ```bash
   # Pull the embedding model (for semantic search)
   ollama pull nomic-embed-text
   
   # Pull the LLM model (for response generation)
   ollama pull gemma2:9b
   
   # Optional: Use other models like mistral, codellama, etc.
   # ollama pull mistral
   ```

5. **Start Ollama server** (if not already running):
   ```bash
   ollama serve
   ```

6. **Start the chatbot server**:
   ```bash
   npm start
   ```

6. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
rag-onboarding-chatbot/
├── server.js              # Main application server
├── package.json          # Dependencies
├── .env                  # Configuration
├── docs/                 # Documentation files
│   ├── contributing.md
│   ├── getting-started.md
│   └── workflows.md
└── public/
    └── index.html        # Web chat interface
```

## 📚 Adding Your Documentation

1. Place your documentation files in the `docs/` directory
2. Supported formats: `.txt`, `.md`
3. The system will automatically process and index these files
4. Restart the server to reload new documents

Example documentation structure:
- Company policies
- Employee handbook
- Technical procedures
- FAQ documents
- Training materials

## 🔧 Configuration

Edit the `.env` file to customize settings:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Server Configuration
PORT=3000

# Model Configuration
EMBEDDING_MODEL=nomic-embed-text
LLM_MODEL=gemma2:9b

# Vector Store Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## 🤖 Available Models

You can use different Ollama models by changing the configuration:

**LLM Models** (for response generation):
- `llama2` - Good general purpose model
- `mistral` - Fast and efficient
- `codellama` - Good for technical content
- `neural-chat` - Optimized for conversations
- `gemma2:9b` – Lightweight and powerful, well-suited for RAG applications

**Embedding Models** (for semantic search):
- `nomic-embed-text` - Recommended for general text
- `all-minilm` - Smaller, faster alternative

To change models:
```bash
# Pull new model
ollama pull mistral

# Update .env file
LLM_MODEL=mistral

# Restart server
npm start
```

## 🔍 API Endpoints

### GET /
- Returns API information and status

### GET /health
- Health check endpoint

### POST /chat
- Send a message to the chatbot
- Request body: `{ "message": "your question here" }`
- Response: Structured JSON with answer and context

Example API usage:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the company benefits?"}'
```

## 🎯 Features

- **Semantic Search**: Finds relevant information using vector embeddings
- **Context-Aware Responses**: Uses retrieved documents to provide accurate answers
- **Real-time Chat Interface**: Web-based chat UI
- **Singleton Pattern**: Efficient resource management
- **Document Processing**: Automatic text chunking and indexing
- **Post-processing**: Response cleanup and formatting
- **Error Handling**: Graceful error management
- **Extensible**: Easy to add new models and features

## 🔧 Troubleshooting

### Common Issues

1. **"Chatbot not initialized" error**:
   - Wait for initialization to complete
   - Check that Ollama is running: `ollama list`

2. **Model not found error**:
   - Ensure you've pulled the required models
   - Verify model names in configuration

3. **Connection refused error**:
   - Start Ollama server: `ollama serve`
   - Check Ollama is running on port 11434

4. **Empty responses**:
   - Ensure documentation files are in the `docs/` directory
   - Check file formats are supported (.txt, .md)

### Debugging

Enable debug logging by setting:
```bash
NODE_ENV=development npm start
```

## 🤝 Contributing

Feel free to customize and extend this chatbot:

- Add new document processors
- Implement different vector stores
- Add authentication
- Enhance the UI
- Add conversation memory
- Implement feedback mechanisms

## 📝 License

MIT License - Feel free to use and modify for your needs.

## 🆘 Support

For issues with:
- **Ollama**: Check the [Ollama documentation](https://github.com/ollama/ollama)
- **LangChain**: Check the [LangChain documentation](https://js.langchain.com/)
- **This project**: Create an issue or modify the code as needed