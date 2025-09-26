#!/bin/bash

# Clone monsters list from draw-steel Foundry module on Github. Assumes pre-configured SSH keys.

OUTPUT_PATH="data/monsters-original"

echo "🔄 Cloning monster data from draw-steel repository..."
git clone git@github.com:MetaMorphic-Digital/draw-steel.git
find draw-steel/src/packs/monsters -name "folders_*.json" -type f -delete
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH
mv draw-steel/src/packs/monsters/* $OUTPUT_PATH
rm -rf draw-steel

echo "✅ Monster data clone complete!"