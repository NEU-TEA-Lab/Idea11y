from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import Dict, List

load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=openai_api_key)

summary_cache: Dict[str, str] = {}

def generate_cluster_summary(title: str, content: list) -> str:
    cache_key = str(sorted(content))
    
    # Check if we have a cached result
    if cache_key in summary_cache:
        print("AI: Using cached summary!")
        return summary_cache[cache_key]
    
    prompt = f"Given these ideas:\n\n{content}\n\n. Provide a meaningful summary in ideally 4 words (max of 8 words) that captures the main theme."
    result = _get_completion(prompt)
    # Cache the result
    summary_cache[cache_key] = result
    return result

def _get_completion(prompt: str) -> str:
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",  #"gpt-3.5-turbo" TODO:Update this for user study
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        print("AI: Getting GPT request success!")
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return ""
