[![Finsemble SmartDesktop](./public/assets/img/Finsemble+Cosaic.svg)](https://documentation.finsemble.com/)

# Finsemble Seed 🌱

Note, the finsemble-seed project is intended for developers. If you're looking to get going quickly without any development then [contact us](https://cosaic.io/contact/) to get access to the **Finsemble Smart Desktop Designer** - a no-code GUI tool for assembling an FDC3 compliant smart desktop. If you are an existing Finsemble client, run `yarn sdd` to start using the Smart Desktop Designer.

## What is the "seed"?

Finsemble is a smart desktop platform. A smart desktop is a desktop based application that is composed from any number of smaller apps, including web, native and Citrix. Finsemble supports the [FDC3](https://fdc3.finos.org/) 1.2 standard for desktop interop.

This repo, the "seed", is an initial empty project for your smart desktop. The seed gives you the ability to launch Finsemble and is the starting point for assembling your smart desktop.

## But really, what is it?

- If you're in a hurry, check out our [2 minute intro](https://www.youtube.com/watch?v=Y_CL7nrowL8)
- If you're developer and want the nitty-gritty details, check out our
  [talk at CovalenceConf 2020](https://www.youtube.com/watch?v=3dNzaNN3unA&t=377s).
- Once you've got the gist, checkout the [developer documentation](https://documentation.finsemble.com/) for the full details.

## Getting Started

1. 📡 Clone the repository.
   ```
   git clone https://github.com/finsemble/finsemble-seed
   ```
2. 📦 Install npm dependencies

   (Note, we recommend using [yarn](https://yarnpkg.com/) - it's fast and reliable. But you can also
   use npm. **If using npm you must use a version >= 7.x.x. Lower versions will encounter errors regarding changing
   folder names with missing permissions**)

   ```
   cd finsemble-seed
   yarn install
   ```

3. 🚀 Start Finsemble!
   ```
   yarn start
   ```

Go ahead and take Finsemble for a spin!

When you're ready to go deeper, check out the [seed project tutorial](https://documentation.finsemble.com/tutorial-gettingStarted.html), which will walk you through all the basics of building your smart desktop.

## What's Inside

The seed project contains configuration and assets that you can customize to create your own smart desktop.

- _public_ - Contains the assets that you will host on your website. These power your smart desktop.

   - _assets_ - CSS and images used to create the smart desktop's look and feel.

   - _configs_ - Configuration for the smart desktop

      - _configs/application_ - Contains all of the base configurations for the Finsemble application.

- _project.json_ - Used to define the development and production server and installer configurations used by the Finsemble application.

## The API, please

Everything else there is to know about Finsemble and how to build on it can be found in our
[developer documentation](https://documentation.finsemble.com/).

## Getting Help

Having trouble? Perhaps we've covered it in the [FAQ](https://documentation.finsemble.com/tutorial-FAQ.html).

Still having trouble? Shoot us a line at support@finsemble.com! We'll be happy to help.

Prefer the easy-button? Our solutions engineers can integrate your apps together in a POC faster than you can say
"Desktop Interop". Schedule a [demo](https://cosaic.io/contact)!
