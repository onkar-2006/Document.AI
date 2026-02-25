from langgraph.graph import StateGraph, START, END
from app_state import State
from graph_nodes import (
    retrieve_node, 
    eval_docs_node, 
    rewrite_query_node, 
    web_search_node, 
    refine_node, 
    generate_node
)
from VectorStore import VectorStoreManager
from functools import partial

vdb = VectorStoreManager()

workflow = StateGraph(State)

workflow.add_node("retrieve", partial(retrieve_node, vdb_manager=vdb))
workflow.add_node("eval", eval_docs_node)
workflow.add_node("rewrite_query", rewrite_query_node)
workflow.add_node("web_search", web_search_node)
workflow.add_node("refine", refine_node)
workflow.add_node("generate", generate_node)


workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "eval")

def route_after_eval(state):
    """
    Determines where to go based on the 'verdict' from eval_docs_node.
    Matches the CORRECT/INCORRECT/AMBIGUOUS logic in graph_nodes.py
    """
    verdict = state.get("verdict")
    if verdict == "CORRECT":
        return "refine"  
    else:
        return "rewrite_query"  

workflow.add_conditional_edges(
    "eval",
    route_after_eval,
    {
        "refine": "refine",
        "rewrite_query": "rewrite_query"
    }
)

workflow.add_edge("rewrite_query", "web_search")
workflow.add_edge("web_search", "refine")
workflow.add_edge("refine", "generate")
workflow.add_edge("generate", END)


graph_builder = workflow