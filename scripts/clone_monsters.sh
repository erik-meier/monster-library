#!/bin/bash

# Clone monsters list from draw-steel Foundry module on Github. Assumes pre-configured SSH keys.

OUTPUT_PATH="data/monsters-original"

echo "🔄 Cloning monster data from Steel Compendium bestiary..."
git clone https://github.com/SteelCompendium/data-bestiary-json
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH
mv data-bestiary-json/Monsters/* $OUTPUT_PATH
rm -rf data-bestiary-json

echo "✅ Monster data clone complete!"