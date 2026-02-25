import os
from markitdown import MarkItDown

class DataIngestion:
    def __init__(self):
        self.md_converter = MarkItDown()

    def from_pdf(self, file_path):
        """MarkItDown for better table support"""
        if not os.path.exists(file_path): 
            return "File not found."
        try:
            result = self.md_converter.convert(file_path)
            return result.text_content
        except Exception as e:
            print(f"Extraction Error: {e}")
            return ""

    def from_office(self, file_path):
        result = self.md_converter.convert(file_path)
        return result.text_content


    def from_url(self, url):
        result = self.md_converter.convert(url)
        return result.text_content