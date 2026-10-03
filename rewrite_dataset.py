import pandas as pd
import random
import re
import numpy as np

random.seed(42)

df = pd.read_csv('/Users/mansiagarwal/data/codemix/codemix_india_55k.csv')

subjects = {
    'product_review': [("washing machine", "E"), ("earphones", "E"), ("AC", "E"), ("phone", "E"), ("laptop", "E"), ("smartwatch", "E"), ("shoes", "E"), ("jacket", "E"), ("kurti", "H"), ("fridge", "E"), ("tv", "E"), ("camera", "E"), ("powerbank", "E"), ("trimmer", "E"), ("scooter", "E")],
    'daily_life': [("monsoon", "E"), ("traffic", "E"), ("auto", "E"), ("local train", "E"), ("cab", "E"), ("metro", "E"), ("bijli ka bill", "H"), ("paani", "H"), ("wifi", "E"), ("maid", "E"), ("grocery", "E"), ("gym", "E"), ("garmi", "H"), ("pollution", "E")],
    'entertainment': [("movie", "E"), ("interview", "E"), ("music video", "E"), ("concert", "E"), ("web series", "E"), ("trailer", "E"), ("show", "E"), ("standup comedy", "E"), ("vlog", "E")],
    'festival': [("Holi", "H"), ("Rakhi", "H"), ("Durga Puja", "H"), ("Eid", "H"), ("Diwali", "H"), ("Navratri", "H"), ("Ganesh Chaturthi", "H"), ("Makar Sankranti", "H"), ("Onam", "H"), ("Christmas", "E")],
    'work': [("work from home", "E"), ("salary hike", "E"), ("team meeting", "E"), ("project", "E"), ("boss", "E"), ("appraisal", "E"), ("promotion", "E"), ("WFH", "E"), ("client call", "E"), ("HR", "E")],
    'relationships': [("shaadi", "H"), ("date", "E"), ("breakup", "E"), ("boyfriend", "E"), ("girlfriend", "E"), ("dost", "H"), ("best friend", "E"), ("rishtedaar", "H"), ("family trip", "E"), ("bhai", "H")],
    'education': [("online class", "E"), ("exam", "E"), ("college", "E"), ("tuition", "E"), ("viva", "E"), ("assignment", "E"), ("result", "E"), ("professor", "E"), ("hostel", "E"), ("canteen", "E")],
    'food': [("street food", "E"), ("dosa", "H"), ("cafe", "E"), ("biryani", "H"), ("momo", "H"), ("pani puri", "H"), ("pizza", "E"), ("burger", "E"), ("dhaba", "H"), ("chai", "H"), ("samosa", "H")],
    'politics': [("chunav", "H"), ("GST", "E"), ("tax", "E"), ("budget", "E"), ("election", "E"), ("neta", "H"), ("scheme", "E"), ("policy", "E"), ("news", "E"), ("protest", "E")],
    'sports': [("olympics", "E"), ("IPL", "E"), ("cricket", "E"), ("football", "E"), ("World Cup", "E"), ("test series", "E"), ("badminton", "E")]
}

positive_templates = [
    ([("bhai", "H"), ("kya", "H"), ("mast", "H"), ("tha", "H")], "prefix"),
    ([("ekdum", "H"), ("kamaal", "H"), ("nikla", "H"), ("yaar", "H")], "suffix"),
    ([("totally", "E"), ("worth it", "E"), ("hai", "H")], "suffix"),
    ([("sach me", "H"), ("bohot", "H"), ("badhiya", "H"), ("tha", "H")], "suffix"),
    ([("is", "E"), ("the", "E"), ("best", "E"), ("tbh", "E")], "suffix"),
    ([("ne", "H"), ("dil", "H"), ("khush", "H"), ("kar diya", "H")], "suffix"),
    ([("paisa vasool", "H"), ("experience", "E"), ("raha", "H")], "suffix"),
    ([("gajab", "H"), ("ka", "H"), ("scene", "E"), ("hai", "H")], "suffix"),
    ([("mind blowing", "E"), ("tha", "H"), ("kasam se", "H")], "suffix"),
    ([("is", "E"), ("lit", "E"), ("bro", "E")], "suffix"),
    ([("ek number", "H"), ("cheez", "H"), ("hai", "H")], "suffix"),
    ([("superb", "E"), ("tha", "H"), ("maza", "H"), ("aa gaya", "H")], "suffix"),
    ([("ki", "H"), ("quality", "E"), ("ekdum", "H"), ("top notch", "E"), ("hai", "H")], "suffix")
]

negative_templates = [
    ([("ekdum", "H"), ("bakwaas", "H"), ("tha", "H")], "suffix"),
    ([("pura", "H"), ("mood off", "E"), ("kar diya", "H")], "suffix"),
    ([("paisa barbaad", "H"), ("ho gaya", "H")], "suffix"),
    ([("is", "E"), ("so", "E"), ("bad", "E"), ("smh", "E")], "suffix"),
    ([("ne", "H"), ("bohot", "H"), ("nirasha", "H"), ("kiya", "H")], "suffix"),
    ([("bilkul", "H"), ("ghatiya", "H"), ("nikla", "H")], "suffix"),
    ([("time waste", "E"), ("tha", "H"), ("sach me", "H")], "suffix"),
    ([("kya", "H"), ("faltu", "H"), ("hai", "H"), ("ye", "H")], "suffix"),
    ([("is", "E"), ("the", "E"), ("worst", "E")], "suffix"),
    ([("dimag kharab", "H"), ("kar diya", "H")], "suffix"),
    ([("bekaar", "H"), ("experience", "E"), ("raha", "H")], "suffix"),
    ([("not recommended", "E"), ("at all", "E")], "suffix")
]

neutral_templates = [
    ([("theek thaak", "H"), ("tha", "H")], "suffix"),
    ([("average", "E"), ("type", "E"), ("tha", "H")], "suffix"),
    ([("na", "H"), ("zyada", "H"), ("accha", "H"), ("na", "H"), ("bura", "H")], "suffix"),
    ([("normal", "E"), ("sa", "H"), ("tha", "H")], "suffix"),
    ([("kuch", "H"), ("khaas", "H"), ("nahi", "H")], "suffix"),
    ([("chalta hai", "H"), ("bhai", "H")], "suffix"),
    ([("is", "E"), ("okay", "E"), ("i guess", "E")], "suffix"),
    ([("pata nahi", "H"), ("kaisa", "H"), ("hoga", "H")], "suffix"),
    ([("so-so", "E"), ("experience", "E"), ("tha", "H")], "suffix"),
    ([("thik", "H"), ("hi", "H"), ("hai", "H")], "suffix"),
    ([("kuch", "H"), ("keh", "H"), ("nahi sakte", "H")], "suffix")
]

# Slang insertions based on region
region_slang = {
    'North India': [("bc", "H"), ("guru", "H"), ("bhaiya", "H")],
    'South India': [("da", "O"), ("macha", "O"), ("aiyo", "O")],
    'West India': [("bhau", "H"), ("baila", "H")],
    'East India': [("babu", "H"), ("dada", "H")]
}

def apply_typos(word):
    if random.random() < 0.05 and len(word) > 4:
        idx = random.randint(0, len(word)-2)
        word = word[:idx] + word[idx+1] + word[idx] + word[idx+2:]
    return word

def apply_transliteration_variants(word):
    variants = {
        "accha": ["acha", "achha", "aacha"],
        "badhiya": ["badiya", "bdia", "badhya"],
        "ekdum": ["ekdm", "akdum", "ek dam"],
        "bohot": ["bahut", "bhot", "bht"],
        "theek": ["thik", "thk"],
        "kya": ["kia", "ky"],
        "bhai": ["bhi", "bhia"],
        "yaar": ["yr"],
        "nahi": ["nhi", "nai", "ni"],
        "tha": ["th"],
        "hai": ["h"],
        "kar diya": ["krdia", "kar dia"]
    }
    if word in variants and random.random() < 0.4:
        return random.choice(variants[word])
    return word

def generate_row(row):
    domain = row['domain']
    if pd.isna(domain) or domain not in subjects:
        domain = random.choice(list(subjects.keys()))
        
    sentiment = row['sentiment_label']
    region = row['region_context']
    
    subject, sub_lang = random.choice(subjects[domain])
    
    if sentiment == 'Positive':
        template, position = random.choice(positive_templates)
    elif sentiment == 'Negative':
        template, position = random.choice(negative_templates)
    else:
        template, position = random.choice(neutral_templates)
    
    words_langs = [(subject, sub_lang)]
    
    if position == "suffix":
        words_langs.extend(template)
    else:
        words_langs = template + words_langs
        
    # Regional injection
    if pd.notna(region) and region in region_slang and random.random() < 0.2:
        words_langs.append(random.choice(region_slang[region]))
        
    # Emoji
    if random.random() < 0.3:
        if sentiment == 'Positive':
            words_langs.append((random.choice(["🔥", "😍", "❤️", "👍"]), "O"))
        elif sentiment == 'Negative':
            words_langs.append((random.choice(["😭", "🤦‍♂️", "😡", "👎", "🤮"]), "O"))
        else:
            words_langs.append((random.choice(["🤷‍♂️", "😐", "🤔", "👀"]), "O"))
            
    final_text_parts = []
    e_count = 0
    h_count = 0
    
    for word, lang in words_langs:
        sub_words = word.split()
        for w in sub_words:
            if lang == "E": e_count += 1
            if lang == "H": h_count += 1
        
        mod_word = word.lower() if random.random() < 0.7 else word
        mod_word = apply_transliteration_variants(mod_word)
        mod_word = apply_typos(mod_word)
        final_text_parts.append(mod_word)
        
    text = " ".join(final_text_parts)
    
    # Random punctuation
    if random.random() < 0.4:
        text += random.choice([".", "!", "...", " ??"])
        
    if random.random() < 0.3 and len(text) > 0:
        text = text[0].upper() + text[1:]
        
    # Stats calculation
    word_count = len(text.split())
    char_count = len(text)
    
    total_eh = e_count + h_count
    if total_eh > 0:
        hindi_word_ratio = h_count / total_eh
        english_word_ratio = e_count / total_eh
        cmi = (min(h_count, e_count) / total_eh) * 100
    else:
        hindi_word_ratio = 0.0
        english_word_ratio = 0.0
        cmi = 0.0
        
    # Determine primary language
    if hindi_word_ratio > 0.6:
        primary_language = 'Hindi-dominant'
    elif english_word_ratio > 0.6:
        primary_language = 'English-dominant'
    else:
        primary_language = 'Balanced'
        
    return pd.Series([text, word_count, char_count, hindi_word_ratio, english_word_ratio, cmi, primary_language])

print("Applying transformation...")
new_cols = df.apply(generate_row, axis=1)
df['text'] = new_cols[0]
df['word_count'] = new_cols[1]
df['char_count'] = new_cols[2]
df['hindi_word_ratio'] = new_cols[3].round(3)
df['english_word_ratio'] = new_cols[4].round(3)
df['code_mixing_index'] = new_cols[5].round(1)
df['primary_language'] = new_cols[6]

df.to_csv('/Users/mansiagarwal/data/codemix/codemix_india_55k_cleaned.csv', index=False)
print("Finished saving codemix_india_55k_cleaned.csv!")

# Print some samples
print("\nSamples:")
print(df[['text', 'sentiment_label', 'code_mixing_index', 'hindi_word_ratio']].head(10))

