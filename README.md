[![Finsemble SmartDesktop](./public/assets/img/Finsemble+Cosaic.svg)](https://documentation.finsemble.com/)

# Finsemble Seed 🌱

## What is it?

Finsemble is a smart desktop platform that allows any type of application to sync, link, and share information, even if
they weren’t originally designed to.

Finsemble Seed is just that - a kernel packed with everything you need to grow your own SmartDesktop and <del>rule the
world</del> turbocharge your workflow.

## But really, what is it?

- If you're in a hurry, check out our [2 minute intro](https://www.youtube.com/watch?v=Y_CL7nrowL8)
- If you're developer and want the nitty-gritty details, check out our
  [talk at CovalenceConf 2020](https://www.youtube.com/watch?v=3dNzaNN3unA&t=377s).
- Once you've got the gist, checkout the [developer documentation](https://documentation.finsemble.com/) for the full
  details.

## Getting Started

1. 📡 Clone the repository.
   ```
   git clone https://github.com/chartiq/finsemble-seed
   ```
2. 📦 Install the deps

   (Note, we recommend using the [Yarn Package Manager](https://yarnpkg.com/) - it's fast and reliable. But you can also
   use npm. **If using npm you must use a version >= 7.x.x. Lower versions will encounter errors regarding changing
   folder names with missing permissions**)

   ```
   cd finsemble-seed
   yarn install
   ```

3. 🚀 Start it!
   ```
   yarn start
   ```

Go ahead and take it for a spin!

When you're ready to go deeper, check out the check out the
[seed project tutorial](https://documentation.finsemble.com/tutorial-gettingStarted.html), which will walk you through
all the basics of building your SmartDesktop.

## What's Inside

The seed project bundles together a Webpack-based build system, a set of bare-bones SmartDesktop components you can use
as examples, and the necessary config files to orchestrate it all. Below is a brief outline of what's included in the seed project.

- _public_ - Contains the statically-hosted assets for your SmartDesktop

   - _assets_ - CSS and images used to create the SmartDesktop's look and feel.

   - _configs_ - Contains all the necessary configuration for the SmartDesktop

      - _configs/other/server-environment-startup.json_ - Used to define the development and production server
         configurations used by the Finsemble application.

      - _configs/application_ - Contains all of the base configurations for the Finsemble application. The files in this
         folder are merged together to build the application configuration. This configuration can be changed at run time
         using dynamic configuration. Contains the application manifest used to start up the Finsemble application. The
         default manifest for development is included, and additional configurations can be placed in this folder.

- _webpack_ - Includes all of the files used by the seed project to build

  - _webpack.finsemble-built-in.entries.json_ - Specifies the entry and output files for the files built for a default
    SmartDesktop.

  - _webpack.components.entries.json_ - This file is where developer-added files should be listed. This file is empty in
    the base Finsemble seed project to prevent merge conflicts when updating the seed project.

  - _webpack.adapters.entries.json_ - Specifies storage adapters to be built.

- _src_ - The folder where your Finsemble components should be placed for the Finsemble build process. It also includes
  the source for the default UI components included with the Finsemble seed project.

  - _src/adapters_ - Contains an example Storage Adapter that saves data to local storage.

  - _src/components_ - Default location of all the SmartDesktop's components, including built-in components. You can add
    to this folder automatically using Finsemble CLI (run `finsemble-cli add component --help` for more info).

  - _src/preloads_ - Default location for
    [preload scripts](https://documentation.finsemble.com/tutorial-SecurityPolicies.html#trusted-preloads).

  - _src/services_ - Default location for user-defined services. You can to this folder automatically using the
    Finsemble CLI (run `finsemble-cli add service --help` for more info).

- _gulpfile.js_ - The main gulpfile for the project includes the basic tasks used to build and run a Finsemble
  application for development.

- _gulpfile-extensions-example.js_ (optional) - File that can be used to add/modify the functionality of the gulpfile.
  This file is included to prevent conflicts when upgrading your base project.

## The API, Please

Everything else there is to know about Finsemble and how to build on it can be found in our
[developer documentation](https://documentation.finsemble.com/).

## Getting Help

Having trouble? Perhaps we've covered it in the [FAQ](https://documentation.finsemble.com/tutorial-FAQ.html).

Still having trouble? Shoot us a line at support@finsemble.com! We'll be happy to help.

Prefer the easy-button? Our solutions engineers can integrate your apps together in a POC faster than you can say
"Desktop Interoperability". Schedule a [demo](https://cosaic.io/contact)!
