import os, uuid, shutil
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException,Form, Optional
from pydantic import BaseModel
from contextlib import asynccontextmanager
from langchain_core.messages import HumanMessage
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row 
from fastapi.middleware.cors import CORSMiddleware 
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from rag_graph import graph_builder
from DataIngestion import DataIngestion
from DataStorage import DataSplitter
from VectorStore import VectorStoreManager

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL not found in environment variables!")

ingestor = DataIngestion()
splitter = DataSplitter()
vdb_manager = VectorStoreManager()

class ChatRequest(BaseModel):
    question: str
    thread_id: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    connection_kwargs = {
        "autocommit": True,
        "row_factory": dict_row,
        "prepare_threshold": None, 
    }
    
    async with AsyncConnectionPool(
        conninfo=DB_URL, 
        max_size=10,
        kwargs=connection_kwargs,
        open=False 
    ) as pool:
        await pool.open() 
        checkpointer = AsyncPostgresSaver(pool)
        
        await checkpointer.setup()
        
        app.state.runnable = graph_builder.compile(checkpointer=checkpointer)
        print("RAG System Online: Database stabilized.")
        yield

app = FastAPI(lifespan=lifespan)


origins = [
    "http://localhost:5173",
    "https://rag-deployment-frontend-latest.onrender.com", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: ChatRequest):
    config = {"configurable": {"thread_id": request.thread_id}}
    inputs = {"question": request.question} 
    
    try:
    
        res = await app.state.runnable.ainvoke(inputs, config=config)
        
        final_answer = res.get("answer", "I processed your request but couldn't generate a specific answer.")
        
        return {"answer": final_answer, "thread_id": request.thread_id}
    
    except Exception as e:
        print(f"!!! GRAPH EXECUTION ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Graph Error: {str(e)}")

@app.post("/ingest")
async def ingest(
    thread_id: str, 
    background_tasks: BackgroundTasks, 
    file: Optional[UploadFile] = File(None),  
    url: Optional[str] = Form(None)          
):
    text = ""
    source_name = ""
    
    try:

        if file:
            source_name = file.filename
            path = f"tmp_{uuid.uuid4()}_{file.filename}"
            with open(path, "wb") as f: 
                shutil.copyfileobj(file.file, f)

            if file.filename.lower().endswith('.pdf'):
                text = ingestor.from_pdf(path)

            elif file.filename.lower().endswith(('.docx', '.pptx', '.xlsx')):
                text = ingestor.from_office(path)
            else:

                with open(path, "r", encoding="utf-8") as f:
                    text = f.read()
            
            if os.path.exists(path):
                os.remove(path)

        elif url:
            source_name = url
            text = ingestor.from_url(url)

        else:
            raise HTTPException(status_code=400, detail="No file or URL provided.")

        if not text or len(text.strip()) < 10:
             raise HTTPException(status_code=400, detail="Content extraction failed or content too short.")

        metadata = {"thread_id": thread_id, "source": source_name}
        docs = splitter.split_text_to_docs(text, metadata)
        
        print(f"--- INGESTING: {len(docs)} chunks from {source_name} ---")
        vdb_manager.load_vectorStore(docs)
        
        return {
            "status": "success", 
            "message": f"Successfully indexed {len(docs)} chunks.", 
            "thread_id": thread_id,
            "source": source_name
        }
        
    except Exception as e:
        print(f"!!! INGESTION ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

