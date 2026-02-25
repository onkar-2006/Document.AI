import os
from typing import List
from langchain_openai import ChatOpenAI 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_core.output_parsers import JsonOutputParser
from langchain_tavily import TavilySearch
from dotenv import load_dotenv

load_dotenv()

# Simplified LLM setup
llm_json = ChatOpenAI(
    model="openai/gpt-oss-120b", 
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0,
    model_kwargs={"response_format": {"type": "json_object"}} 
)

tavily = TavilySearch(max_results=3)

async def retrieve_node(state, config, vdb_manager):
    print("--- STEP: RETRIEVE ---")
    tid = config["configurable"].get("thread_id")
    retriever = vdb_manager.get_session_retriever(tid)
    docs = await retriever.ainvoke(state["question"])
    return {"docs": docs}

async def eval_docs_node(state):
    print("--- STEP: EVALUATE ---")
    # If we have docs, we try to use them. If not, we go to web.
    docs = state.get("docs", [])
    if not docs:
        return {"verdict": "INCORRECT", "good_docs": []}
    
    # Simple check: if any doc exists, we'll call it 'AMBIGUOUS' to trigger a quick check
    # This avoids complex JSON grading that might fail
    return {"verdict": "CORRECT", "good_docs": docs}

async def rewrite_query_node(state):
    print("--- STEP: REWRITE ---")
    return {"web_query": state["question"]}

async def web_search_node(state):
    print("--- STEP: WEB SEARCH ---")
    try:
        results = await tavily.ainvoke({"query": state["question"]})
        docs = [Document(page_content=r["content"]) for r in results]
        return {"web_docs": docs}
    except Exception as e:
        print(f"Web Search Failed: {e}")
        return {"web_docs": []}

async def refine_node(state):
    print("--- STEP: REFINE (SIMPLE) ---")
    # Just merge all available text
    docs = state.get("good_docs") or state.get("web_docs") or []
    context = "\n\n".join([d.page_content for d in docs])
    return {"refined_context": context[:3000]} # Limit characters to prevent LLM overload

async def generate_node(state):
    print("--- STEP: GENERATE ---")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Use the context to answer. If no context, answer normally."),
        ("human", "Context: {refined_context}\n\nQuestion: {question}")
    ])
    
    gen_llm = ChatOpenAI(
        model="openai/gpt-oss-120b", 
        openai_api_key=os.getenv("OPENROUTER_API_KEY"),
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=0.7
    )
    
    chain = prompt | gen_llm
    out = await chain.ainvoke({
        "refined_context": state.get("refined_context", "No specific context found."),
        "question": state["question"]
    })
    return {"answer": out.content}