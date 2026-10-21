@echo off
REM Servidor local para probar la app en el aula (red del colegio).
REM Abre http://localhost:8780/aves-ar/  - y en los celulares usa la IP de esta PC.
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   Servidor de Aves de la Patagonia
echo   ---------------------------------
echo   En este PC:      http://localhost:8780/index.html
echo.
echo   Para verlo en el celular, usa la IP de esta PC.
echo   (se muestra abajo; si no, abri en la PC:  ipconfig)
echo.
python -m http.server 8780
pause
