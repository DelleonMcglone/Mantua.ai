#!/bin/bash
echo "========================================"
echo "🧠 Mantua.AI Environment Validation Script"
echo "========================================"
echo ""

# 1. Git verification
echo "🔍 Checking Git connection..."
git status >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Git initialized"
else
    echo "❌ Git not initialized. Run: git init"
fi

echo ""
echo "🔗 Checking remote origin..."
git remote -v || echo "❌ No remote found — add with: git remote add origin <repo-url>"

# 2. Node.js and npm validation
echo ""
echo "🧰 Checking Node.js environment..."
node -v && npm -v || echo "❌ Node or npm not found — ensure Node.js is installed"

# 3. Python + FastAPI check
echo ""
echo "🐍 Checking Python environment..."
python3 --version || python --version
pip show fastapi >/dev/null 2>&1 && echo "✅ FastAPI detected" || echo "⚠️ FastAPI not found"

# 4. Folder structure check
echo ""
echo "📁 Checking project directories..."
for dir in client server shared; do
    if [ -d "$dir" ]; then
        echo "✅ Found directory: $dir/"
    else
        echo "❌ Missing directory: $dir/"
    fi
done

# 5. .gitignore confirmation
echo ""
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore found"
else
    echo "⚠️ .gitignore missing — create one to avoid tracking node_modules, .env, etc."
fi

# 6. Replit + SSH confirmation
echo ""
if [ -d ".replit" ] || [ -f ".replit" ]; then
    echo "✅ Replit configuration found"
else
    echo "⚠️ .replit config not found"
fi

# 7. Test frontend start command
echo ""
if [ -f "package.json" ]; then
    echo "�� Checking npm run dev availability..."
    grep -q "\"dev\"" package.json && echo "✅ 'npm run dev' script detected" || echo "⚠️ 'dev' script not found in package.json"
else
    echo "⚠️ package.json missing — is the frontend initialized?"
fi

# 8. Python API startup test (FastAPI)
echo ""
if [ -d "server" ]; then
    echo "🧪 Testing FastAPI entrypoint (dry run)..."
    grep -q "FastAPI" server/*.py && echo "✅ FastAPI detected in server files" || echo "⚠️ No FastAPI instance found"
fi

echo ""
echo "✅ Validation complete."
echo "If all checks show ✅, your environment is ready for Mantua build!"
echo "========================================"
