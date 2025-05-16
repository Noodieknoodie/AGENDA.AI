@echo off
echo Starting AI Agenda Generator...
echo.

echo Starting backend server...
start cmd /k "cd backend && npm run dev"

echo Starting frontend development server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Services are starting. The application will be available at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo.

echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq *npm run dev*"
echo Done.
