#!/bin/bash

# LobsterClaw Deploy Script
# Usage: ./deploy.sh [hosting|functions|firestore|all]

set -e

echo "🦞 LobsterClaw Deploy"
echo "===================="

cd "$(dirname "$0")"

# Build the app
echo "📦 Building app..."
cd app
npm run build
cd ..

# Deploy based on argument
case "${1:-all}" in
  hosting)
    echo "🌐 Deploying hosting..."
    firebase deploy --only hosting
    ;;
  functions)
    echo "⚡ Deploying functions..."
    firebase deploy --only functions
    ;;
  firestore)
    echo "🗄️ Deploying Firestore rules & indexes..."
    firebase deploy --only firestore
    ;;
  all)
    echo "🚀 Deploying everything..."
    firebase deploy
    ;;
  *)
    echo "Usage: ./deploy.sh [hosting|functions|firestore|all]"
    exit 1
    ;;
esac

echo ""
echo "✅ Deploy complete!"
echo "🌐 https://lobsterclaw-c9af9.web.app"
