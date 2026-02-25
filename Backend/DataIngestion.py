import os
from markitdown import MarkItDown
import os
from langchain_community.document_loaders import PyPDFLoader

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
            
            full_text = "\n".join([doc.page_content for doc in docs])

            return full_text.strip()
            
        except Exception as e:
            print(f"Extraction Error with PyPDFLoader: {e}")
            return ""

    def from_office(self, file_path):

        from markitdown import MarkItDown
        md = MarkItDown()

        result = md.convert(file_path)
        return result.text_content

    def from_url(self, url):
        result = self.md_converter.convert(url)
        return result.text_content
    