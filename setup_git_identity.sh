#!/bin/bash
echo "========================================"
echo "🪪 Mantua.AI Git Identity Auto-Setup"
echo "========================================"

# Set Git global identity
git config --global user.name "Delleon McGlone"
git config --global user.email "dbmcglone@gmail.com"

# Confirm setup
echo ""
echo "✅ Git identity configured as:"
git config --get user.name
git config --get user.email

# Add useful defaults
git config --global color.ui auto
git config --global core.editor "nano"
git config --global pull.rebase false

echo ""
echo "✨ You’re now ready to commit and push without re-authenticating."
echo "========================================"
