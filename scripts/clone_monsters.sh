#!/bin/bash

# Clone monsters list from draw-steel Foundry module on Github. Assumes pre-configured SSH keys.

OUTPUT_PATH="data/monsters"

echo "🔄 Cloning monster data from draw-steel repository..."
git clone git@github.com:MetaMorphic-Digital/draw-steel.git
find draw-steel/src/packs/monsters -name "folders_*.json" -type f -delete
rm -rf $OUTPUT_PATH/*
mv draw-steel/src/packs/monsters/* $OUTPUT_PATH
rm -rf draw-steel

echo "📋 Creating monster index..."
node scripts/create-monster-index.js $OUTPUT_PATH

echo "✅ Monster data clone complete!"