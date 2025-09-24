# Clone monsters list from draw-steel Foundry module on Github. Assumes pre-configured SSH keys.

OUTPUT_PATH="node/monster-viewer/public/data/monsters"

git clone git@github.com:MetaMorphic-Digital/draw-steel.git
find draw-steel/src/packs/monsters -name "folders_*.json" -type f -delete
rm -rf $OUTPUT_PATH/*
mv draw-steel/src/packs/monsters/* $OUTPUT_PATH
rm -rf draw-steel

python3 scripts/monster_index.py $OUTPUT_PATH