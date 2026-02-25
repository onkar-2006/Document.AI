import os
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
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

    def get_session_retriever(self, thread_id: str):
        vectorstore = PineconeVectorStore(
            index_name=self.index_name, 
            embedding=self.embeddings
        )
      
        return vectorstore.as_retriever(
            search_kwargs={
                "filter": {"thread_id": thread_id}, 
                "k": 5
            }
        )

    def load_vectorStore(self, docs):
        """
        Uploads documents to Pinecone. 
        Note: Ensure your DataStorage.py added 'thread_id' to docs metadata!
        """
        return PineconeVectorStore.from_documents(
            docs, 
            self.embeddings, 
            index_name=self.index_name
        )