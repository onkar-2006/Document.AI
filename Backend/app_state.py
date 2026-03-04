from typing import List, TypedDict, Annotated, Optional
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from pydantic import BaseModel
import os

class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    question: str
    docs: List[Document]
    good_docs: List[Document]
    verdict: str
    refined_context: str
    web_docs: List[Document]
    web_query: str
    answer: str
    retrieval_metadata: List[dict] 

class DocEvalScore(BaseModel):
    score: float
    reason: str

class KeepOrDrop(BaseModel):
    keep: bool

class WebQuery(BaseModel):
    query: str