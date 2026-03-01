@echo off
cd /d C:\Users\Harshith\WebstormProjects\untitled2

echo === STEP 1: Remove old .git if nested ===
if exist "ai-cricket-predictor\.git" (
    rmdir /s /q "ai-cricket-predictor\.git"
    echo Removed nested .git in ai-cricket-predictor
)

echo === STEP 2: Init git ===
git init

echo === STEP 3: Remove any cached .env files ===
git rm -r --cached ai-cricket-predictor/.env 2>nul
git rm -r --cached .env 2>nul

echo === STEP 4: Add all files ===
git add .

echo === STEP 5: Verify .env is NOT staged ===
echo --- Checking for .env in staged files ---
git diff --cached --name-only | findstr /i ".env"
if %ERRORLEVEL%==0 (
    echo WARNING: .env file found in staged files! Removing...
    git rm --cached ai-cricket-predictor/.env 2>nul
) else (
    echo OK: No .env secrets in staged files
)

echo === STEP 6: Commit ===
git commit -m "Cricket Predictor - ready for Vercel deployment"

echo === STEP 7: Set branch and remote ===
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/harshithmgowda/cricketiplmode12.git

echo === STEP 8: Push ===
git push -u origin main --force

echo === DONE ===
echo Check https://github.com/harshithmgowda/cricketiplmode12 now!
pause

