# 🤖 Document.AI: Agentic RAG System (CRAG & LangGraph)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://rag-deployment-backend-latest.onrender.com)

> **Live Application:** [https://rag-deployment-backend-latest.onrender.com](https://rag-deployment-backend-latest.onrender.com)

This repository contains a full-stack **Agentic Retrieval-Augmented Generation (RAG)** application. It utilizes a **Corrective RAG (CRAG)** strategy, intelligently deciding whether to answer from local vector storage or fall back to a live web search via Tavily when local data is insufficient.

---

## 🏗️ System Architecture

The project is split into a **FastAPI** backend and a **React (Vite)** frontend, orchestrated by **LangGraph** to manage complex agentic loops and state.

![System Architecture](./Backend/assets/architecture_flow.png)

### 🧠 The Agentic Flow (CRAG)
1. **Ingestion**: User uploads a PDF or URL. Data is processed, chunked, and embedded.
2. **Retrieve**: The system fetches relevant chunks from the **Pinecone Vector Database** using metadata filters.
3. **Evaluate**: An LLM-based "Grader" node evaluates the quality of retrieved documents.
4. **Action Selection**:
    * **Relevant**: If documents are sufficient, the system generates an answer.
    * **Irrelevant/Ambiguous**: The system triggers a **Web Search (Tavily)** to supplement missing information.
5. **Final Generate**: The LLM (GPT-4o) synthesizes the final answer using the most accurate context.
6. **Persistence**: User history and graph states are saved to a **PostgreSQL** database using a LangGraph Checkpointer for seamless chat history.

---

## 🛠️ Tech Stack

### **Backend**
* **Language:** Python 3.10+
* **Orchestration:** [LangGraph](https://www.langchain.com/langgraph) (Agentic state management)
* **Framework:** FastAPI (High-performance API)
* **Vector Database:** [Pinecone](https://www.pinecone.io/) (Serverless Vector Search)
* **SQL Database:** PostgreSQL (Session & History persistence)
* **Search Engine:** [Tavily AI](https://tavily.com/) (Search optimized for LLMs)
* **Embeddings/LLM:** OpenAI (`text-embedding-3-small` / `GPT-4o`)

### **Frontend**
* **Framework:** React.js with Vite
* **Styling:** Tailwind CSS / Lucide Icons
* **HTTP Client:** Axios

---

## 📂 Project Structure

```text
FINAL_RAG/
├── Backend/                # Python FastAPI Logic
│   ├── DataIngestion.py    # PDF & URL processing logic
│   ├── DataStorage.py      # Text splitting & chunking
│   ├── VectorStore.py      # Pinecone integration
│   ├── rag_graph.py        # LangGraph workflow definition
│   ├── graph_nodes.py      # CRAG node logic (Retrieve/Grade/Search)
│   ├── endpoint.py         # API Route definitions
│   ├── main.py             # Server entry point
│   ├── requirements.txt    # Backend dependencies
│   └── Dockerfile          # Deployment configuration
├── rag_frontend/           # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Chat, Setup)
│   │   ├── assets/         # Styles & Images
│   │   └── main.jsx        # Frontend entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── .github/workflows/      # CI/CD automation
