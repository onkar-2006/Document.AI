import os
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

class VectorStoreManager:
    def __init__(self):
        self.index_name = os.getenv("PINECONE_INDEX")
        self.embeddings = OpenAIEmbeddings(
            model="openai/text-embedding-3-small", 
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1"
        )

        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    def get_session_retriever(self, thread_id: str):
        # Explicitly connect to the existing index
        vectorstore = PineconeVectorStore(
            index_name=self.index_name, 
            embedding=self.embeddings,
            pinecone_api_key=os.getenv("PINECONE_API_KEY")
        )
      
        print(f"DEBUG: Retrieving docs for thread_id: {thread_id}")
        
        return vectorstore.as_retriever(
            search_kwargs={
                "filter": {"thread_id": thread_id}, 
                "k": 5
            }
        )

    def load_vectorStore(self, docs):
        """
        Uploads documents to Pinecone. 
        """
        if not docs:
            print("DEBUG: No documents to load into Pinecone.")
            return
            
        print(f"DEBUG: Loading {len(docs)} chunks into Pinecone for thread: {docs[0].metadata.get('thread_id')}")
        
        return PineconeVectorStore.from_documents(
            docs, 
            self.embeddings, 
            index_name=self.index_name,
            pinecone_api_key=os.getenv("PINECONE_API_KEY")
        )
