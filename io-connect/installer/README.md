## Running the installer

(1) Add an `iocdInstaller` entry to your project.json that points to the location on your filesystem where you have the _original installer that we provided to you_.
(2) Run `yarn makeInstaller-iocd.

The installer will be placed in your seed's `pkg` folder (at the root).

This command will create a `tmp` folder in the format required by produce-sfx-installer.bat (sfx stands for "self extracting executable" which is a special type of 7z file.) Files are copied or processed from assets, templates, and utilities (as discussed below). (The tmp directory is not removed, so that issues may be debugged.)

Note that this process takes your _installed_ system.json file, and then merges your remoteConfigs system files into it (while lightly modifying for production installation.) You can check in the `tmp/zip` directory to see what exactly is being created.

See (Extensible Installer documentation)[https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/installer/index.html] for more information on customization.

> Note: As an alternative to putting your client key and installer location in project.json, you may put them in environment variables `iocdInstaller` and `clientKey`. You may put these in a `.env` file at the root of your seed. This file is gitignored so that it will only apply to your machine.

## Contents of the installer folder

### Templates

Templates drive the creation of the installer. These will be automatically processed with values from project.json, but you may also modify the templates directly if you want deeper customization.

**config.txt** - A config file that powers the self-extracting zip file that will be your installer. The ExecuteFile name must match the name of the exe from custom-installer-files that was zipped up. The `Title` field will be modified to match your product name.

**copy-resources.bat** - This utility will run on your end users' desktops after the installation process is completed. By default, it copies your custom icon.ico file into the io.Connect Desktop assets/images folder. This icon then becomes the default icon for your desktop. You can modify this script if you need to perform any other post-installation actions.

**extensibility.json** - This contains the config that powers the extensible installer. This is processed at runtime by the iocd installer code. You should set the `value` fields for `DocumentationUrl` and `SupportEmailOrUrl` to point to locations that will be useful for your end users. These correspond with the buttons that appear on the final page of the installer.

**info.rc** - A resource script file. This will be used to set the internal resources for the installer. These will be set to the values you've specified in project.json.

### Assets

Anything in the assets folder is bundled into the installer. Some assets are used by the installer itself:

**assets/banner.gif** - The banner is displayed during the installation process. By default, public/assets/img/installer-image-windows.gif will be used but you can override this by placing a banner.gif file in the assets folder. (You can change this to a png by modifying the extensibility.json template.) Please note that moving gifs/pngs are not currently supported in the installer screen. 600x300 is the ideal size.

**assets/logo.png** - This logo displays in the top left corner of the installer startup screen. By default, public/assets/img/Finsemble_SystemTray_Icon.png is used, but you can override this by putting a logo.png file in the assets folder.

**assets/icon.ico** - By default, the icon from your seed project's public/assets/img/installer_icon.ico will be used as your executable icon (and your installer icon). You can instead put an icon directly into assets (or you can modify templates/copy-resources.bat). Note, the installer-icon-composite.ico that is used by the installer cannot be overridden through assets.

**assets/logo.ico** - By default, the icon from your seed project's public/assets/img/installer_icon.ico will be used as your default taskbar icon. You can instead put an icon directly into assets (or you can modify templates/copy-resources.bat). See [logo.ico](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/user-interface/index.html#icons-ioconnect_desktop);

**assets/tray.ico** - By default, the icon from your seed project's public/assets/img/installer_icon.ico will be used as your default tray icon. You can instead put an icon directly into assets (or you can modify templates/copy-resources.bat). See [tray.ico](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/user-interface/index.html#icons-tray);

### Utilities

These are used by the installer generation. You will generally not modify these.

**7z.dll, 7z.exe** - A utility for zipping files. This is used by the batch scripts to generate an installer.

**7zSD-nonadmin.sfx** - A "stub" that is used to create the self-extracting zip file that will be your installer.

**produce-sfx-installer.bat** - A batch script that produces the installer. This is run by `yarn makeInstaller-iocd`.

**utilities/ResourceHacker.exe** - A utility for modifying windows executables and resource files.

