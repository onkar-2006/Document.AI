import asyncio
import sys
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

def main():

    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        print("Windows Selector Policy enforced.")

   
    from endpoint import app

    config = uvicorn.Config(
        app=app, 
        host="0.0.0.0", 
        port=8000, 
        loop="asyncio" 
    )
    server = uvicorn.Server(config)
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(server.serve())


if __name__ == "__main__":
    main()