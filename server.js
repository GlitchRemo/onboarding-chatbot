// server.js - RAG Onboarding Chatbot with Ollama
const express = require('express');
const cors = require('cors');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OllamaEmbeddings } = require('@langchain/community/embeddings/ollama');
const { Ollama } = require('@langchain/community/llms/ollama');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const fs = require('fs').promises;
const path = require('path');

class OnboardingChatbot {
    constructor() {
        this.vectorStore = null;
        this.embeddings = null;
        this.llm = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Onboarding Chatbot...');
            
            // Initialize Ollama embeddings (using nomic-embed-text model)
            this.embeddings = new OllamaEmbeddings({
                model: 'nomic-embed-text',
                baseUrl: 'http://localhost:11434',
            });

            // Initialize Ollama LLM (using llama2 model)
            this.llm = new Ollama({
                model: 'llama2',
                baseUrl: 'http://localhost:11434',
                temperature: 0.7,
            });

            // Load and process documentation
            await this.loadDocumentation();
            
            this.isInitialized = true;
            console.log('✅ Chatbot initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing chatbot:', error);
            throw error;
        }
    }

    async loadDocumentation() {
        try {
            const docsPath = path.join(__dirname, 'docs');
            const files = await fs.readdir(docsPath);
            
            let allDocuments = [];
            
            // Process each documentation file
            for (const file of files) {
                if (file.endsWith('.txt') || file.endsWith('.md')) {
                    const filePath = path.join(docsPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    
                    // Split documents into chunks
                    const textSplitter = new RecursiveCharacterTextSplitter({
                        chunkSize: 1000,
                        chunkOverlap: 200,
                    });
                    
                    const docs = await textSplitter.createDocuments([content], [
                        { source: file, type: 'onboarding_doc' }
                    ]);
                    
                    allDocuments.push(...docs);
                }
            }

            console.log(`📚 Loaded ${allDocuments.length} document chunks`);
            
            // Create vector store from documents
            this.vectorStore = await MemoryVectorStore.fromDocuments(
                allDocuments,
                this.embeddings
            );
            
            console.log('🔍 Vector store created successfully');
        } catch (error) {
            console.error('❌ Error loading documentation:', error);
            throw error;
        }
    }

    async semanticSearch(query, topK = 5) {
        if (!this.vectorStore) {
            throw new Error('Vector store not initialized');
        }

        try {
            // Perform semantic search
            const results = await this.vectorStore.similaritySearch(query, topK);
            return results.map(doc => ({
                content: doc.pageContent,
                metadata: doc.metadata,
                relevanceScore: doc.score || 0
            }));
        } catch (error) {
            console.error('❌ Error in semantic search:', error);
            throw error;
        }
    }

    async generateResponse(query) {
        if (!this.isInitialized) {
            throw new Error('Chatbot not initialized');
        }

        try {
            console.log(`🤔 Processing query: ${query}`);
            
            // Step 1: Semantic Search
            const retrievedDocs = await this.semanticSearch(query, 3);
            
            // Step 2: Create context from retrieved documents
            const context = retrievedDocs
                .map(doc => doc.content)
                .join('\n\n');
            
            // Step 3: Create prompt for LLM
            const prompt = this.createPrompt(query, context);
            
            // Step 4: Generate response using LLM
            const rawResponse = await this.llm.invoke(prompt);
            
            // Step 5: Post-process response
            const finalResponse = this.postProcessResponse(rawResponse);
            
            return {
                query: query,
                response: finalResponse,
                context: retrievedDocs,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error generating response:', error);
            throw error;
        }
    }

    createPrompt(query, context) {
        return `You are a helpful onboarding assistant. Use the following context to answer the user's question about our company's onboarding process. If the context doesn't contain relevant information, say so politely and provide general guidance.

Context:
${context}

Question: ${query}

Answer: Provide a helpful, clear, and concise answer based on the context above. If you're not sure about something, be honest about it.`;
    }

    postProcessResponse(response) {
        // Clean up the response
        let cleaned = response
            .replace(/\s+/g, ' ')  // Remove extra whitespace
            .replace(/\n\s*\n/g, '\n\n')  // Clean up line breaks
            .trim();
            
        // Remove any incomplete sentences at the end
        const sentences = cleaned.split(/[.!?]+/);
        if (sentences.length > 1 && sentences[sentences.length - 1].trim().length < 10) {
            sentences.pop();
            cleaned = sentences.join('. ') + '.';
        }
        
        return cleaned;
    }
}

// Express server setup
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Global chatbot instance (Singleton pattern)
const chatbot = new OnboardingChatbot();

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'RAG Onboarding Chatbot API',
        status: chatbot.isInitialized ? 'ready' : 'initializing',
        endpoints: {
            chat: 'POST /chat',
            health: 'GET /health'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: chatbot.isInitialized ? 'healthy' : 'initializing',
        timestamp: new Date().toISOString()
    });
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                error: 'Message is required'
            });
        }
        
        if (!chatbot.isInitialized) {
            return res.status(503).json({
                error: 'Chatbot is still initializing. Please try again in a moment.'
            });
        }
        
        const result = await chatbot.generateResponse(message);
        res.json(result);
    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Initialize chatbot and start server
async function startServer() {
    try {
        await chatbot.initialize();
        
        app.listen(port, () => {
            console.log(`🌟 RAG Onboarding Chatbot running on http://localhost:${port}`);
            console.log('📝 Ready to help with onboarding questions!');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();