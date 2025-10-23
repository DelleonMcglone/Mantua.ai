#!/bin/bash
echo "========================================"
echo "🔄 Mantua.AI Safe Restart Script"
echo "========================================"

# Step 1: Find and stop only the Node dev server (not SSH bridge)
PID=$(ps aux | grep "tsx server/index.ts" | grep -v grep | awk '{print $2}')

if [ -n "$PID" ]; then
  echo "🛑 Stopping Node dev server (PID: $PID)..."
  kill -9 $PID
else
  echo "ℹ️ No active Node dev server found."
fi

# Step 2: Free port 5000 if still held
echo "🧹 Clearing port 5000..."
npx kill-port 5000 >/dev/null 2>&1

# Step 3: Restart the frontend
echo "🚀 Restarting frontend on port 5000..."
npm run dev &

echo "✅ Restart complete! Check the Ports tab for localhost:5000."
echo "========================================"
