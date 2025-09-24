# Construct an index of monster files by name and keywords

import os
import json
import sys

name_dict = {}
path_index = {}
keyword_index = {}
ev_index = {}
role_index = {}
card = {}

monsters_path = sys.argv[1]
data_path = monsters_path + "/../"

for root, _, files in os.walk(monsters_path):
    for filename in files:
        if filename.endswith(".json"):
            filepath = os.path.join(root, filename)
            with open(filepath, "r") as f:
                monster = json.load(f)

                # ID index
                monster_id = monster["name"].lower().replace(" ", "-")
                name_dict[monster_id] = monster["name"]

                # Name index
                path_index[monster_id] = os.path.relpath(filepath, monsters_path)

                # Keyword index
                try:
                    for keyword in monster["system"]["monster"]["keywords"]:
                        keyword_lower = keyword.lower()
                        if keyword_lower not in keyword_index:
                            keyword_index[keyword_lower] = []
                        keyword_index[keyword_lower].append(monster_id)
                except KeyError:
                    pass

                # EV index
                try:
                    ev = monster["system"]["monster"]["ev"]
                    if ev not in ev_index:
                        ev_index[ev] = []
                    ev_index[ev].append(monster_id)
                except KeyError:
                    pass

                # Role index
                try:
                    role = monster["system"]["monster"]["role"].lower()
                    if not role:  # Fall back to organization if role is empty (e.g. leader)
                        role = monster["system"]["monster"]["organization"].lower()
                    if role not in role_index:
                        role_index[role] = []
                    role_index[role].append(monster_id)
                except KeyError:
                    pass

                # Card information
                try:
                    card[monster_id] = {
                        "name": monster["name"],
                        "ev": monster["system"]["monster"]["ev"],
                        "level": monster["system"]["monster"]["level"],
                        "role": monster["system"]["monster"]["role"],
                        "organization": monster["system"]["monster"]["organization"],
                        "keywords": monster["system"]["monster"]["keywords"]
                    }
                except KeyError:
                    pass


monster_index = {
    "name": name_dict,
    "path": path_index,
    "keyword": keyword_index,
    "ev": ev_index,
    "role": role_index,
    "card": card
}

with open(data_path + "monster_index.json", "w") as f:
    json.dump(monster_index, f, indent=2)