@echo off
REM --- Crea environment virtuale Python in .venv ---
python -m venv .venv

REM --- Attiva l'ambiente ---
call .venv\Scripts\activate.bat

REM --- Aggiorna pip e installa le dipendenze ---
pip install --upgrade pip
pip install -r requirements.txt
call .venv\Scripts\activate.bat

echo.
echo ==============================================
echo L'ambiente virtuale è pronto e attivo!
echo Per avviare l'app: python backend\main.py
echo ==============================================
pause
