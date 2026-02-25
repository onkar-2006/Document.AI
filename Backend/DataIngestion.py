import os
from markitdown import MarkItDown
from PyPDF2 import PdfReader

class DataIngestion:
    def __init__(self):
        self.md_converter = MarkItDown()

    def from_pdf(self, file_path):
        if not os.path.exists(file_path): return "File not found."
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()

    def from_office(self, file_path):
        result = self.md_converter.convert(file_path)
        return result.text_content

    def from_url(self, url):
        result = self.md_converter.convert(url)
        return result.text_content