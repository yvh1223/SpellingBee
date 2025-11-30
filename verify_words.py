#!/usr/bin/env python3
# ABOUTME: Verification script to find missing words from original images
# ABOUTME: Compares image word lists with current text files

# Words from images (manually extracted)
one_bee_words = [
    # One_BEE_1.jpeg - page 1
    "tag", "send", "deck", "stuck", "snug", "fish", "hold", "mind", "stay", "scrub",
    "draw", "brown", "cozy", "cosy", "tint", "milk", "yawn", "tank", "want", "crowd",
    "pond", "skirt", "sharks", "quilt",
    # page 2
    "twigs", "taffy", "comfy", "stretch", "tight", "candy", "scrunch", "ruby", "close",
    "tackle", "wire", "skater", "giant", "bucket", "chance", "baskets", "tender", "paste",
    "melon", "farmer", "parent", "tail", "hockey", "slime",
    # page 3
    "insects", "teeth", "shortcut", "bait", "lure", "cluster", "forest", "hollow",
    "spinning", "baffling", "sizzling", "hoist", "search", "remind",
    # One_BEE_2.jpeg
    "moment", "ajar", "basil", "triple", "satin", "ahoy", "signal", "answer", "shuffle",
    "minnows", "silver", "before", "circus", "writing", "kitchen", "sugar", "awkward",
    "seep", "sweet", "wheels", "faint", "fruit", "roam", "goats", "woozy", "limbs",
    "ahead", "señor", "unicorn", "faraway", "heater", "pirates", "understand", "wooden",
    "leaning", "breakfast", "window", "acrobat", "message", "chocolate", "forepaw",
    "elephant", "hedgehog", "recipe", "garbage", "surprise", "mermaid", "bombarded",
    "disability", "incredible", "leather", "countess", "nervous", "peppercorn",
    "cartwheel", "raise", "weather", "zooming", "attacked", "turnout", "eaten",
    "streetlights", "journey", "courtyard", "shouting", "asleep", "curious", "dinosaur",
    "brilliant", "vacuum", "gorgeous", "monsoon", "dangerous",
    "avocado", "valentine", "February", "formation", "especially"
]

two_bee_words = [
    # TWO_Bee_1.jpeg
    "dissolving", "nomad", "billowed", "skewer", "berlin", "lunacy", "conjure", "bracken",
    "noggin", "neon", "rakish", "hypnosis", "rotunda", "gusto", "toiletries", "gleaned",
    "jeered", "winsome", "prattling", "galore", "emporium", "atrium", "eccentric", "savant",
    "dubious", "ebony", "foreign", "paltry", "verdict", "garbled", "encourages", "imitation",
    "miniature", "receptionist", "preamble", "plausible", "reprimanding", "commotion",
    "oblivion", "immigrants", "steeple", "spectators", "lanyards", "suspicious", "parchment",
    "ramshackle", "fugitive", "heron",
    "scavenger", "fragments", "deflated", "unleash", "ration", "cosmetics", "crawdad",
    "frustration", "unruly", "mascot", "moustache", "mustache", "artifacts", "artefacts",
    "perfume", "sinister", "tuxedo", "discoveries", "lurches", "language", "prognosis",
    "Buffalo", "sequins", "gallop", "fabulous", "lanky", "fluently", "mysterious",
    "brandished", "sardines", "anguish", "conical", "rickety", "lilt", "pediatric",
    "porridge", "democracy", "rummage", "beige", "ancestral", "grimace", "gaunt",
    "enormous", "geranium", "nautical",
    # TWO_Bee_2.jpeg
    "almanac", "hippies", "samosas", "campaign", "pistachio", "mosque", "zombielike",
    "warlock", "colossus", "convulsively", "dimensional", "garishly", "graffitist",
    "Everest", "dexterity", "cavorting", "marauder", "conscience", "battlements",
    "deferential", "albatross", "khaki", "opalescent", "asphalt", "Yiddish",
    "talcum", "tranquilizer", "equestrian", "plaited", "monsieur", "manticores",
    "prestigious", "fraidycat", "guttural", "lo mein", "courier", "sans serif",
    "psyche", "stucco", "Frankenstein", "schema", "et cetera", "vidimus", "delphine",
    "slough", "archipelago", "serape", "sarape", "puissance", "pinioning",
    "chignon", "pheromone", "galleon", "magnanimous", "chartreuse", "wainscoting", "Nehru",
    "hesitate", "scorcher"
]

three_bee_words = [
    # Three_BEE_1.jpeg
    "gangly", "swaggering", "chimneys", "riveted", "plaid", "dirge", "zeal", "whittled",
    "depots", "fiberglass", "salvaged", "fissures", "enthusiastic", "discipline",
    "unfamiliar", "scurrying", "dignitaries", "dismissal", "skittish", "careened",
    "nomination", "opportunist", "dictatorship",
    "comrades", "sporadic", "promenade", "repugnant", "mincemeat", "parachute",
    "labyrinthine", "appointment", "foreseeable", "ratify", "scalpel", "reclusive",
    "compassionate", "burlap", "alkali", "officially", "crematorium", "haymarket",
    "amicable", "exuberant", "beautician", "equations", "assignment",
    "complacent", "syndicate", "promenade", "repugnant", "mincemeat", "parachute",
    "labyrinthine", "appointment", "foreseeable", "ratify", "scalpel", "reclusive",
    "compassionate", "burlap", "alkali", "officially", "crematorium", "haymarket",
    "amicable", "exuberant", "beautician", "equations", "assignment",
    "ultimatum", "whinnying", "squadron", "memoirs", "cylinders", "ominous", "muffler",
    "syndicate", "premises", "salient", "asogarh", "substantiality", "memorable",
    "formidable", "propaganda", "marquee", "proficient", "compunction", "emphatically",
    "ostracism", "onslaught", "ruefully", "misanthrope",
    "precocious", "ensemble", "cadre", "bye", "bellyfry", "lacrosse", "sluice", "cajolery",
    "vigilance", "residuals", "boutique", "peroxide", "aristocracy", "apocalypse",
    "mulberry", "hypocritical", "chlorine", "traumatic", "receipts", "sofaraway",
    "barraquets", "contentious", "precocious", "ensemble", "cadre", "bye", "bellyfry",
    "lacrosse", "sluice", "cajolery", "vigilance", "residuals", "boutique", "peroxide",
    "aristocracy", "apocalypse",
    # Three_BEE_2.jpeg
    "tuberculosis", "barricade", "confreres", "anonymously", "unparalleled", "barrette",
    "chassis", "junket", "quandary", "Erie", "gingham", "silhouette", "auxiliary",
    "thesaurus",
    "patriarchs", "chandelier", "dulce", "concierge", "latticework", "hibiscus", "tamale",
    "maracas", "gyroplane", "burpees", "Adriatic", "piccolo", "au revoir", "tulle",
    "boll weevil", "camphor", "Tucson", "paparazzi", "pumpernickel", "pogrom", "bursitis",
    "pâtisserie", "cycads", "sarsaparilla", "maître d'", "cannelloni", "boulangerie",
    "bronchitis",
    "Oswego", "diphtheria", "baklava", "corbels", "trebuchets", "Kilimanjaro", "fräulein",
    "protégé", "hors d'oeuvres", "maquisards", "Aubusson", "Charolais", "OR Charollais",
    "renowned", "begrudge", "invincible", "alfalfa", "chlorine", "mulberry", "hyperventilated",
    "hypocritical", "bulletin", "safari", "squalor", "substantially", "swaggering", "syndrome",
    "pizzeria", "bayonet"
]

# Read current files
def read_words_from_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

one_bee_current = read_words_from_file('/Users/yh/Projects/personal/spellingbee/schoolBee_1.txt')
two_bee_current = read_words_from_file('/Users/yh/Projects/personal/spellingbee/schoolBee_2.txt')
three_bee_current = read_words_from_file('/Users/yh/Projects/personal/spellingbee/schoolBee_3.txt')

# Remove duplicates and convert to lowercase for comparison
def normalize_words(words):
    # Keep original but create lowercase set for comparison
    return {w.lower(): w for w in words}

one_bee_image_norm = normalize_words(one_bee_words)
two_bee_image_norm = normalize_words(two_bee_words)
three_bee_image_norm = normalize_words(three_bee_words)

one_bee_current_norm = normalize_words(one_bee_current)
two_bee_current_norm = normalize_words(two_bee_current)
three_bee_current_norm = normalize_words(three_bee_current)

# Find missing words
one_bee_missing = set(one_bee_image_norm.keys()) - set(one_bee_current_norm.keys())
two_bee_missing = set(two_bee_image_norm.keys()) - set(two_bee_current_norm.keys())
three_bee_missing = set(three_bee_image_norm.keys()) - set(three_bee_current_norm.keys())

print("="*70)
print("WORD COUNT VERIFICATION")
print("="*70)
print(f"\n1B Words:")
print(f"  From images: {len(one_bee_image_norm)}")
print(f"  In file: {len(one_bee_current_norm)}")
print(f"  Missing: {len(one_bee_missing)}")

print(f"\n2B Words:")
print(f"  From images: {len(two_bee_image_norm)}")
print(f"  In file: {len(two_bee_current_norm)}")
print(f"  Missing: {len(two_bee_missing)}")

print(f"\n3B Words:")
print(f"  From images: {len(three_bee_image_norm)}")
print(f"  In file: {len(three_bee_current_norm)}")
print(f"  Missing: {len(three_bee_missing)}")

print(f"\nTotal from images: {len(one_bee_image_norm) + len(two_bee_image_norm) + len(three_bee_image_norm)}")
print(f"Total in files: {len(one_bee_current_norm) + len(two_bee_current_norm) + len(three_bee_current_norm)}")
print(f"Total missing: {len(one_bee_missing) + len(two_bee_missing) + len(three_bee_missing)}")

if one_bee_missing:
    print(f"\n{'='*70}")
    print("MISSING FROM 1B:")
    print("="*70)
    for word in sorted(one_bee_missing):
        print(f"  - {one_bee_image_norm[word]}")

if two_bee_missing:
    print(f"\n{'='*70}")
    print("MISSING FROM 2B:")
    print("="*70)
    for word in sorted(two_bee_missing):
        print(f"  - {two_bee_image_norm[word]}")

if three_bee_missing:
    print(f"\n{'='*70}")
    print("MISSING FROM 3B:")
    print("="*70)
    for word in sorted(three_bee_missing):
        print(f"  - {three_bee_image_norm[word]}")
