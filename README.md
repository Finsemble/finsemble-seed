
# Finsemble Seed for io.Connect Desktop 🌱

This version of the Finsemble Seed project is compatible with IO.Connect Desktop (iocd) version [**9.4.0.2**](https://interop.io/download/?path=/install/enterprise/finsemble-9.4/stable-offline/9.4.0.2/ioConnectDesktopInstaller&type=b). It also continues to support the legacy Finsemble container (FEA). With this seed version you can run your Finsemble project against either container.

> _This is a Beta. Not all features are working yet. See below for details._

> _Customers wishing to work directly with iocd instead of finsemble-seed should read [IOCD quickstart](./docs/iocd-quickstart.md)_

## Installing

1) In order to run the Beta you must first install io.Connect Desktop from the above link. The desktop installer that you will eventually deliver to your end users will be iocd + your finsemble project + any new iocd customizations that you implement.

2) Update your package.json:
    a) Change `@finsemble/finsemble-core` entry to match the version in this branch.
    b) Copy the `iocd` and `dev-iocd` scripts from this branch.
    c) Copy the "io-connect" subdirectory from this branch into your project.
    d) Run `yarn install`.

## Upgrading from a previous beta version

1) Delete your yarn.lock or package-lock.json file (important!)
2) Update the `@finsemble/finsemble-core` version in package.json
3) Merge the "io-connect" subdirectory (Likely there will be minimal or no changes)
4) Run `yarn install`

## Running

`yarn iocd` - Launch your project using the io.Connect Desktop (iocd) container.

`yarn start` - Launch your project using the legacy FEA container.

Or, `yarn dev-iocd` vs `yarn dev`, which will build your project and launch the container in a single command.

## Documentation

[io.Connect Desktop Documentation](https://docs.interop.io/)

[Finsemble Documentation](https://documentation.finsemble.com/)

## Beta Details

The purpose of this beta is so that you can get a sense for how your project will perform when running under iocd. Please provide us with notes on anything that doesn't function correctly or any other general feedback by sending an email to support@finsemble.com.

> Note: You can launch io.Connect Desktop from the start menu, but _it will only run your seed project when you launch using `yarn iocd` or `yarn dev-iocd`._

### Terminology changes

"Workspaces" -> "Layouts" - In iocd, a "global layout" refers to the arrangement of windows and their data context which may be saved/restored and saved by name. The term "workspace" now refers to aggregated groups of windows, a [new feature](https://docs.interop.io/desktop/capabilities/windows/workspaces/overview/index.html).

"Toolbar" ~= "Launcher" - In iocd, toolbars are sometimes referred to as launchers. The Finsemble Toolbar is compatible with iocd but a new, more powerful launcher will be available in an upcoming release.

### What is working?

- FSBL API should be fully functional.
- The io.Connect Desktop API is fully functional. You can `import * from "@interopio/desktop"` in your apps, or you can use `window.iop` to test the API (please do not build code that relies on iop because this will not be a permanent feature).
- FDC3 is fully functional (`window.fdc3` object).
- Toolbar, dialogs, and system tray are fully functional. If you've customized these components then your customizations should be functional.
- Window operations such as tabbing and grouping
- Apps specified in apps.json or loaded using any FSBL API will work as expected
- Authentication (SSO) should be fully functional, including "dynamic config" (loading apps based on user login)
- Your theming/CSS customization should be fully functional.
- Generating installers
- .NET is now available with the beta. Use the latest finsemble.dll with "iocd" tag. (TODO - copy breaking changes from Maksim link)

### What will you need to change?

- The WindowTitleBar component will no longer be supported under iocd (which uses a different windowing paradigm than Finsemble). If you've customized the WindowTitleBar then you will need to re-implement those changes using the new DecoratorWindow template (`yarn template DecoratorWindow`). This uses iocd's ["extensible web groups"](https://docs.interop.io/desktop/capabilities/windows/window-management/overview/index.html#extending_web_groups).
- The advanced app launcher is functional but if you've customized any of the underlying code then it may need to be re-implemented. Please check and let us know if you find anything not functioning.
- Your splash screen image may be smaller on io.CD than it was on Finsemble. This is due to how the two systems interpret screen resolution. You'll need to create a larger image if this is a concern. Please note that io.CD now supports [_interactive_](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/user-interface/index.html#splash_screen) splash screens. You can see an example of this behavior when you run the copy of io.CD that we provided. [see installer section below](#creating-installers-for-your-end-users)
- Your installed icon may be rendered smaller than expected. To solve this problem you can create a 128x128 icon and save it as io-connect/installer/assets/icon.ico. [see installer section below](#creating-installers-for-your-end-users)
- io.CD does not support moving images on the installer dialog. You may need to create a static image and you may need to resize that image in order to have the best appearance. You can save such an image to io-connect/installer/assets/banner.gif which will override the default installer image.
- launchExternalProcess() has been removed. If you are using this feature then you can now achieve the same thing by adding an app config for your external app and simply launching it with spawn() or with the io.CD appManager API.
- Storage adapters will continue to work as expected with some caveats. Importing clients from @finsemble/finsemble-core will no longer work! For instance, this was a common approach that is now defunct:

    ```
    const { Logger, ConfigClient } = require("@finsemble/finsemble-core").Clients;
    ConfigClient.initialize();
    ```
    Instead, _storage adapters must now use FSBL.Clients on the global window object just like other applications_.

    The `baseName` is still available on the `this` object of a storage adapter. This is set to the value of `start_app.uuid` in the manifest, defaulting to "Finsemble" if it doesn't exist. If you've used this pattern:
    
    ```
    this.getCombinedKey = function(e, t) {
          return `${e.baseName}:${e.userName}:${t.topic}:${t.key}`
    }
    ```

    Then change to using `this.baseName`.

- formGoup() and ejectFromGroup() are no longer supported. Please use the io.CD snap(), createGroup(), and ungroup() functions if you need programmatic control over groups.

- isAlwaysOnTop() is no longer available.

- If you have a visible authentication component (login) then you should remove the close button because io.CD now automatically provides a close button as an overlay icon.

#### <a name="dot_net_breaking_changes">.NET Breaking changes</a>

- DragAndDrop, LinkerClient, TitlebarService, WPFWindowTitleBar (titlebar control), and SystemManagerClient have been removed.
- The WPFWindowTitleBar is no longer necessary because io.CD provides a titlebar for .NET windows. You should remove this control from your code because it no longer functions (to customize titlebars use `yarn template DecoratorWindow` and see instructions in the template that is created.)
    - When you remove the control, also undo the related changes in your WPF xaml file:
        - remove the link to `headerControl`
        - remove `WindowStyle` setting
        - remove `AllowsTransparency` setting
- The ChartIQ.Finsemble.* namespace has been deprecated. Use InteropIO.* instead. (Classes from ChartIQ.Finsemble have been deprecated too, but not removed.)
- Some previously deprecated functions have been removed. They are: 
    - WindowClient: GetSpawnData, GetComponentState, IsAlwaysOnTop, currentWindowState
    - ConfigClient: GetValue, SetValue
    - SearchClient: InvokeItemAction

### What is not working?

- Notifications are based on the iocd notification system which uses a new notification panel which is still under development. Some Finsemble functionality such as history, muting and snoozing is not yet available.
- There is no data conversion being performed yet. Changes to workspaces when launched under iocd will only persist locally (not back to your storage adapter.)
- User edited tab names are not yet interchangeable between iocd and FEA
- Worksheets and security lookup are not yet functional in the Bloomberg Adapter.
- Window tiling is not yet available. You can tile into iocd "Workspaces" which are a [powerful new feature](https://docs.interop.io/desktop/capabilities/windows/workspaces/overview/index.html).
- Customizing DecoratorWindow per app is not yet supported.
- Linker channels cannot be linked to multiple channels
- Layouts/workspaces do not support percentages
- User preferences for system restart, notifications, and download settings are not yet functional

### What is different?

- Mac is not currently supported (in production or development.)

- Windowing behavior is different in iocd than on legacy Finsemble. When windows are snapped together they now form a group which can be maximized and which responds to Microsoft Window snapping and aero commands. These groups contain an extra titlebar (which can optionally be disabled but which provides more intuitive maximization.)

- iocd is located in `AppData/local/interop.io/io.Connect Desktop`. The `UserData` subdirectory contains log files and other information. The `Cache` directory contains Chromium cache. The `Desktop\config` and `Desktop\assets` folders contain system information.

- An "io-connect" subdirectory in your project will contain configurations specific to io.Connect Desktop. After running `yarn iocd` several subdirectories will be created under io-connect. This contains iocd config files `system.json` and `stickywindows.json`. You can add any iocd config to these files. See [these schemas](https://docs.interop.io/desktop/developers/configuration/overview/index.html) for more information on available switches.

    Please note that these files are generated only once. Changes to Finsemble's config.json that are made after generating these files will not be picked up. If you delete system.json, then it will be regenerated with the new changes (but remember to reapply any customizations that you previously made).

    You may also request that any configuration be made _permanent_ for your company. We provide a service to maintain these config files for you, so that you don't have to worry about merging locally. The version of io.CD that we provide to you will then come pre-configured with this config.

    To prevent Finsemble from merging a file from the io-connect folder, simply modify it to contain an empty `{}`.

- An `iop` global will be available on the window object to test the new API.

- Some additional CSS styles have been added to theme.css to customized new window elements. These all begin with --t42 or --g42.

- The central logger is available and functional. The central logger will no longer contain system logs. System logs are available in application.log on the filesystem.

- Your FDC3/Finsemble app configs will be automatically converted to [io.CD's format](https://docs.interop.io/desktop/assets/configuration/application.json). You can now optionally add a `hostManifests.[io.Connect]` entry in addition to your `hostManifests.Finsemble` entry. The values from this entry will override any converted values. You may also use this additional host manifest to configure any io.CD feature. Finally, if you want to bypass all conversion, create this new entry and remove the `hostManifests.Finsemble` entry. (Please note that this will also bypass all of the FDC3 conversion as well - so you would need a complete and correct io.CD app config entry.)

- Taskbar icon behavior is different in io.CD than Finsemble. In io.CD, multiple instances of the same app appear as sub-icons to a single taskbar icon. This mimics MS Windows behavior. Grouped and tabbed collections of windows have unique icons that are indicative of groups and tabs, and the thumbnail image associated with the taskbar displays the entire group.

- io.CD does not support window blur(). blur() calls will have no effect. We recommend focusing the toolbar as an alternative to blurring specific windows.

- Right clicking on the system tray will pull up the io.CD utilities menu by default. If you've created a custom Finsemble system tray then right clicking will bring up your system tray while holding the shift key while right clicking will bring up the io.CD utilities menu.

- fin.getSnapshot() is implemented but with slightly different behavior. The original implementation was a passthrough to Electron's capturePage() function. That passthrough accepted parameters that allowed you to capture only a region of the window. This is no longer supported in io.CD which can only capture the entire window. The parameters are therefore ignored. (Note that all windows loaded from a Finsemble config have allowCapture set to true. This can be overridden in the app config. Normally in io.CD, allowCapture defaults to false.)

- addSelectClientCertificateListener() and addCertificateErrorListener() functions are no longer active. io.CD will now automatically present users with a UI for picking security certificates.

- io.CD uses actual monitor pixels for calculations. Finsemble used browser pixels. This can vary slightly from computer to computer because of the devicePixelRatio that Chrome computes. When using AppsClient.spawn(), the polyfill adjusts for this devicePixelRatio so that apps continue to launch in the same location on io.CD as they did on Finsemble. However, using io.cd's application.start() method will use the actual monitor pixels. Calls to getBounds() and setBounds() use the absolute monitor pixels on all of finsembleWindow, WindowClient.getBounds() and io.cd's window bounds calls. The net result of this is that a call to finsembleWindow.getBounds() may not return the same values as were set by AppClient.spawn().

- Listeners on config will no longer trigger if a ConfigClient call is made but has no impact on config. Previously, Finsemble would trigger listeners even if no changes were made, but io.CD filters out such events.

- Launch groups no longer support the `spawnOnStartup` config.

- groupOnSpawn is no longer supported.

- opacity and transparency are now only supported on `{ mode: "frameless"}` windows. Frameless windows are transparent by default, so opacity can be achieved by simply setting the background color on the app's <html> element.

- The NonConfiguredComponent has been eliminated. Apps without a config simply no longer launch.

- If a modified workspace is passed back to the "load-requested" event then the modified layout will overwrite the saved layout. This is different from Finsemble where the layout would not be saved until the user explicitly saved it. Also, the "close-completed" event will now be received after "load-requested". Not before, as was the case in Finsemble.

- Finsemble's previous functions for manipulating browser views are no longer available. setShape() is no longer available.

### Coming soon

- Data migration - We are working on a detailed plan for migrating end user data such as workspaces, favorites, and preferences. This data resides in Finsemble's storage adapters. This seed project is able to read Finsemble's storage adapters but our plan is to migrate your end user data to iocd's "remote store" concept which we believe to be an easier and more reliable long-term approach to persistence. Future versions of the seed project will contain switches that will allow you to automatically trigger data migration from legacy storage adapters to remote stores (you will also have the option of performing a full one-time conversion if you prefer that route.) See [this link](https://docs.interop.io/desktop/developers/configuration/system/index.html) for more information on iocd configuration and remote stores.

- Mac Support - iocd is currently compatible only with MS Windows, taking advantage of native APIs for an improved user experience. A Mac compatible version will be available in an upcoming release.

- Auto Update - iocd does not yet support auto update functionality (such as is available through Finsemble via the Squirrel packager.)

## Creating installers for your end users

The io-connect/installers folder contains a copy of the IO Connect Desktop's "extensible installer" configuration. This provides very [extensive customization capabilities](https://docs.interop.io/desktop/getting-started/how-to/rebrand-io-connect/installer/index.html). Installers for your end users are _modified versions of the installer that we provided to you._.

In order to generate an installer you must have io.Connect Desktop installed on your machine, and you must have a copy of the original installer executable that you were provided.

(1) Add an `iocdInstaller` entry to your project.json that points to the location on your filesystem where you have the _original installer that we provided to you_. (Alternatively, you can set this in an environment variable "IOCDINSTALLER" or add this variable to a `.env` file in your project's root.)
(2) Run `yarn makeInstaller-iocd.

> The installer we provide should already be embedded with your client key but you can always specify the client key in your project.json file as `{"clientKey": "<your key>"}`.

Running `yarn makeInstaller-iocd` will read your project.json installer settings, processing those values into the various templates in io-connect/installer/templates. It will also copy image files, modifying config files and all other steps required to generate an installer. The installer will be generated in the `pkg` folder of your project's root.

The "io-connect/installer" folder contains a readme file that explains in more detail how this process works and how to further customize the installer process.

Please note that the default install directory is now %LocalAppData%/"your product name". This can be changed in io-connect/installer/templates/extensibility.json. Please note that io.CD is a large install and we do not recommend installing it in AppData/Roaming.

If you've configured certificate files and passwords in your project.json then your installer will be signed. You can also use the new `windowsSign` field which accepts all parameters supported by `@electron/windows-sign`. This gives you access to modern signing technology supported by Microsoft.

Installer configs that are no longer available:
`download` - The electron binary is no longer involved in installer generation
`electronPackagerOptions` - Electron packager is no longer used to generate installers.
`electronWinstallerOptions` - Electron Winstaller is no longer used to generate installers.
`buildTimeout` - The installer generation process is now very quick.
`deleteUserDataOnUninstall` - UserData is now automatically deleted when io.CD is uninstalled.
`logging` - Logging is automatically to the console.

> io.CD will boot slowly if it cannot access Finsemble resources such as fsbl-service or the polyfill preload. You may see the error "Failed to refresh preload scripts" in your application.log when this happens. Be sure that you've deployed the seed's `public` folder and that it is being served. To test an installer against local seed files, you can set the manifest url to "http://localhost:3375/configs/application/manifest-local.json" and then run `yarn iocd --serve`.

> If you test your generated installer on the same machine that you've been developing io.cd, please note that your installer will replace your installed io.cd in the Windows program registry. You can continue to use both, so long as you don't remove the app from add/remove programs or by uninstalling. If you do remove, then you will need to reinstall io.cd. Your custom installer version will be in `AppData/Local/yourProductName` while your developer version of io.cd will be in `AppData/Local/interop.io`.

### Delivering to your end users

You can provide the generated installer directly to your end users. It will install your customized and branded version of iocd. If they are upgrading, then their AppData/.../UserData folder will remain untouched and their Chromium cache (AppData/.../Cache) will be migrated forward so they do not lose any data.

Alternatively, you can deliver the `AppData/local/io.connect/io.Connect Desktop` folder yourself. This contains the executable and all required support files. (iocd does not require any registry entries.) The easiest way to do this is to generate an installer per the above instructions, then install that installer on a local development box, and finally zip up the resulting AppData/.../io.Connect Desktop folder, being careful to exclude the UserData and Cache folders. You can then copy that folder to your end user's desktops (e.g. using group policy.) and create a shortcut to AppData/.../Desktop/io-connect-desktop.exe.

> Note that the `io-connect-desktop.exe` and `io-connect-desktop-inner.exe` executables are signed via authenticode as interop.io.

## Additional Configurations

Finsemble's manifest now accepts a new `iocd` root level config. This contains the following options:

`enableLegacyLoggerRecipe` - When set to true, logger.service.logMessages will be enabled. This is necessary if you're using Finsemble's logger recipe.

`iocdDialogs` - By default, the existing Finsemble dialogs are used wherever possible. If you have not overridden YesNoDialog or SingleInputDialog then you can set this to false so that io.CD's default dialogs will be used.

`timeout` - Finsemble service will make itself visible if it has not completed its boot process within 40 seconds. You can then hit F12 to get devtools and diagnose the issue. If 40 seconds it not enough for your environment then set `timeout` to the number of milliseconds to wait. (e.g. `60000`)

apps.json supports a `hostManifests.["io.Connect]` entry. You can put any valid iocd app config in this section and it will read by iocd, and will override any relevant conversions.

## Troubleshooting

Chrome Devtools for apps is enabled by clicking F12. (You can click shift-F12 to get devtools for the window frame but this is rarely necessary.)

`yarn iocd` opens a debugging port 9222. You can open http://localhost:9222 in your browser similar to how Finsemble supports http://localhost:9090, or open chrome://inspect/#devices and add localhost:9222 to your configuration for node debugging. This can be useful for debugging startup problems.

If you encounter any problems please provide a copy of `application.log`. This can be found in AppData/io.Connect/io.Connect Desktop/User Data/ENV-REGION/logs. You can search this log for `[Error]` or `[warn]` and sometimes find the issue, or send to us for debugging.

Please also send us `fsbl-service.log` which can be found in the "logs/applications" subdirectory. The entry `Apps added by config service` reveals the converted io.CD app configs which can reveal config conversion issues.

If you're having a problem with a specific app, please also provide us with the application config.

More difficult problems may require a console capture from the `fsbl-service` app. To accomplish this, right click the iocd system tray icon and choose "Applications". Find "fsbl-service" and open the devconsole (the "script" icon). This displays the Chromium dev tools for this service. From the "Default levels" pulldown, add "verbose". You can then look for JS errors or copy & paste the console output. (You can also find `fsbl-service` in the central logger which is accessible from the Finsemble toolbar.)

If your toolbar isn't rendering properly then check F12 on the toolbar for any console errors.

### The "io-connect" folder

Your seed project auto-generates files in the io-connect folder. For instance, the Finsemble manifest and config.json are converted into a very small system.json file that includes all of the override configurations that are necessary to make iocd run Finsemble. stickywindows.json is another small file that is generated. _These files are only generated one time_: if you make ongoing changes to manifest or config.json then you should delete system.json so that the conversion is applied again.

You can modify system.json and stickywindows.json to change iocd behavior. (The main versions of these files are at `AppData/local/interop.io/io.Connect Desktop/Desktop/config`.) See [IOCD quickstart](./docs/iocd-quickstart.md) for more information.

`gilding.json` tells iocd how to find these override configs. For Finsemble seed, it points to a REST endpoint that is started by Finsemble's CLI. In production, you probably will not use the gilding feature.

`systemAppStore` contains app configs for a few system apps that are required by Finsemble, such as the fsbl-service app. This file is modified by the CLI. You should avoid making changes to this file because they could be overwritten. Let us know if you find it necessary to modify these app configs.

`configOverrides` contains _another_ override of system.json. This is used only to set the ENV and REGION variables (because these variables are not supported in remote configs). You don't have to worry about these files because they are only necessary to support launching in multiple environments while developing.

The installer directory contains all the files necessary for generating installers. See [Creating Installers For Your End Users](#creating-installers-for-your-end-users) for more information.