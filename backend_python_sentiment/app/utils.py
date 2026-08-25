import re

def clean_text(text:str)->str:
    if not text:
        return ""
    cleaned=re.sub(r'\s+',' ',text).strip()
    return cleaned
