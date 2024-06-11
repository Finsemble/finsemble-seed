@echo off
setlocal

rem Zip up the custom installer files folder
cd custom-installer-files
call ..\7z.exe a -y ..\custom-installer-files.7z *
cd ..

rem create a self extracting executable by concatenating (1) the self-extractor, (2) instructions for the self-extactor,
rem (3) the files to be self extracted. Put them in a binary file (/b) called "sfx-installer.exe" and suppress prompts (/y)
rem When sfx-installer.exe is eventually run (on the end user's desktop) it will extract the custom-installer-files and
rem then use the variables in config.txt to start the installation (by running ioConnectDesktopInstaller.exe /ext:extensibility.json)
copy /y /b 7zSD-nonadmin.sfx + config.txt + custom-installer-files.7z sfx-installer.exe

rem Now customize the installer exe that we just generated!

rem Compile the resource script file (that you've edited) into a binary resource file
ResourceHacker.exe -open info.rc -save info.res -action compile -log con

rem Overwrite the executable with the contents of the binary resource file that was just generated
ResourceHacker.exe -open sfx-installer.exe  -save sfx-installer.exe -action addoverwrite -res info.res -mask VersionInfo,, -log con

rem Overwrite the executable's icons with the one that you've modified
ResourceHacker.exe -open sfx-installer.exe  -save sfx-installer.exe -action addoverwrite -res installer-icon-composite.ico -mask ICONGROUP,1, -log con
ResourceHacker.exe -open sfx-installer.exe  -save sfx-installer.exe -action addoverwrite -res installer-icon-composite.ico -mask ICONGROUP,101, -log con

rem Here's how to regenerate info.rc if necessary
rem ResourceHacker.exe -open sfx-installer.exe  -save info.rc -action extract -mask VersionInfo,, -log con

if exist ie4uinit.exe call ie4uinit.exe show
if exist ie4uinit.exe call ie4uinit.exe -ClearIconCache
if exist IconsRefresh.exe call IconsRefresh.exe
call verify > nul