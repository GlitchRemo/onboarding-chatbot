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

            // Initialize Ollama LLM (using Gemma2 model)
            this.llm = new Ollama({
                model: 'gemma2:9b',
                baseUrl: 'http://localhost:11434',
                temperature: 0.2,
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

    generateTitle(query) {
        // Create a concise, relevant title based on the query
        const cleanQuery = query.toLowerCase().trim();
        
        // Handle common question patterns
        if (cleanQuery.includes('what is') || cleanQuery.includes('what are')) {
            const match = cleanQuery.match(/what (?:is|are) (.+?)(?:\?|$)/);
            if (match) {
                return this.capitalizeTitle(match[1]);
            }
        }
        
        if (cleanQuery.includes('how to') || cleanQuery.includes('how do')) {
            const match = cleanQuery.match(/how (?:to|do) (.+?)(?:\?|$)/);
            if (match) {
                return `How to ${this.capitalizeTitle(match[1])}`;
            }
        }
        
        // Default: extract key words
        const words = cleanQuery.split(/\s+/);
        const stopWords = ['what', 'is', 'are', 'how', 'do', 'does', 'can', 'could', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about'];
        
        const keyWords = words
            .filter(word => !stopWords.includes(word) && word.length > 2)
            .slice(0, 3);
        
        return keyWords.length > 0 ? this.capitalizeTitle(keyWords.join(' ')) : 'Information';
    }
    
    capitalizeTitle(text) {
        return text.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async generateResponse(query) {
        if (!this.isInitialized) {
            throw new Error('Chatbot not initialized');
        }

        try {
            console.log(`🤔 Processing query: ${query}`);
            
            // Step 1: Generate title
            const title = this.generateTitle(query);
            
            // Step 2: Semantic Search
            const retrievedDocs = await this.semanticSearch(query, 3);
            
            // Step 3: Create context from retrieved documents
            const context = retrievedDocs
                .map(doc => doc.content)
                .join('\n\n');
            
            // Step 4: Create prompt for LLM
            const prompt = this.createPrompt(query, context);
            
            // Step 5: Generate response using LLM
            const rawResponse = await this.llm.invoke(prompt);
            
            // Step 6: Post-process response with title
            const formattedResponse = this.formatResponse(title, rawResponse);

            if (!context.trim() || context.length < 50) {
                return {
                    query: query,
                    response: `${title}\n\nI don't have information about "${query}" in my knowledge base...`,
                    context: [],
                    timestamp: new Date().toISOString()
                };
            }
            
            return {
                query: query,
                response: formattedResponse,
                context: retrievedDocs,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error generating response:', error);
            throw error;
        }
    }

    createPrompt(query, context) {
        return `Context: ${context}

    Question: ${query}

     Instructions:
    - If you encounter any German words or phrases in the question or context, translate them to English before answering.
    - Do NOT retain any German phrases in the final response — everything must be fully in English.
    - Proper nouns (e.g., brand or product names like "Lobster") may be preserved, but titles like "Technische Vision" must be translated to their English equivalents only.
    - The final output should **not** include German words in parentheses.

    Format your response as:
    TITLE: [One descriptive title for this topic]
    CONTENT: [Your numbered point answers]

    If the context is not relevant, respond with:
    TITLE: Out of Scope
    CONTENT: I don't have information about this topic in my knowledge base. I'm here to help with onboarding and project-related questions.

    Example:
    TITLE: Commit Message Guidelines
    CONTENT: 1. Use conventional commits format...

    Answer:`;
    }

    formatResponse(title, rawResponse) {
        // Extract title and content from LLM response
        const titleMatch = rawResponse.match(/TITLE:\s*(.+)/);
        const contentMatch = rawResponse.match(/CONTENT:\s*([\s\S]+)/);
        
        const llmTitle = titleMatch ? titleMatch[1].trim() : title;
        const content = contentMatch ? contentMatch[1].trim() : rawResponse.trim();
        
        // Clean up the content
        let cleaned = content.replace(/^(Answer:|Response:|Here.*?:|Based.*?:)/i, '').trim();
        
        // Split by numbered points or sentences
        let sentences = [];
        if (cleaned.match(/\d+\./)) {
            sentences = cleaned.split(/(?=\d+\.)/);
        } else {
            sentences = cleaned.split(/(?:\.\s+(?=[A-Z])|\n)/);
        }
        
        const processedLines = [];
        
        for (let sentence of sentences) {
            sentence = sentence.trim();
            if (sentence.length === 0) continue;
            
            // Remove numbering and symbols
            sentence = sentence.replace(/^\d+\.\s*/, '');
            sentence = sentence.replace(/^[-*•+:]\s*/, '');
            sentence = sentence.replace(/\*+/g, '');
            sentence = sentence.replace(/:\s*$/, '');
            
            // Clean formatting
            sentence = sentence.replace(/\*\*(.*?)\*\*/g, '$1');
            sentence = sentence.replace(/\*(.*?)\*/g, '$1');
            sentence = sentence.replace(/`(.*?)`/g, '$1');
            sentence = sentence.replace(/\s+/g, ' ').trim();

            sentence = sentence.replace(/`/g, ''); // Remove backticks
            sentence = sentence.replace(/shell\s+/gi, ''); // Remove "shell " prefix
            sentence = sentence.replace(/bash\s+/gi, ''); // Remove "bash " prefix  
            sentence = sentence.replace(/```[\w]*\s*/g, ''); // Remove code block markers
            
            if (sentence.length < 20) continue;
            
            if (sentence && !sentence.match(/[.!?]$/)) {
                sentence += '.';
            }
            
            processedLines.push(sentence);
        }
        
        // Convert to bullet points
        const bulletPoints = processedLines.map(line => `- ${line}`);
        
        // Use LLM-generated title
        const formattedTitle = `<strong>${llmTitle}</strong>\n\n`;
        const formattedBullets = bulletPoints.join('\n\n');
        
        return formattedTitle + formattedBullets;
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
        },
        features: [
            'Semantic search with RAG',
            'Auto-generated titles',
            'Formatted bullet point responses',
            'Clean, structured output'
        ]
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
        
        // Ensure proper content type for formatted text
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({
            ...result,
            // Add both plain text and HTML versions for better compatibility
            formattedResponse: result.response.replace(/\n/g, '<br>'),
            plainResponse: result.response
        });
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