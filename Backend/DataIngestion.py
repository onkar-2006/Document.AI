import os
from markitdown import MarkItDown
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader

class DataIngestion:
    def __init__(self):
        self.md_converter = MarkItDown()

    def from_pdf(self, file_path):
        """Uses LangChain's PyPDFLoader for robust page-by-page extraction."""
        if not os.path.exists(file_path): 
            return "File not found."
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            return "\n".join([doc.page_content for doc in docs]).strip()
        except Exception as e:
            print(f"Extraction Error with PyPDFLoader: {e}")
            return ""

    def from_url(self, url):
        """
        Uses LangChain's WebBaseLoader to scrape text content from a URL.
        Note: Requires 'pip install beautifulsoup4'
        """
        try:
            loader = WebBaseLoader(url)
            docs = loader.load()
            full_text = "\n".join([doc.page_content for doc in docs])
            
            return " ".join(full_text.split()).strip()
            
        except Exception as e:
            print(f"Web Scraping Error: {e}")
            return ""


