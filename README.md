# image-tagging-public
Image tagging application for research on Personalized Gamification conducted by Gustavo Tondello from the HCI Games Group, University of Waterloo.

This project requires Node.js installed to run and build.

## Technologies and design packs used
- Vue.js (with Vuetify) for the user interface
- Google Firebase for database and file storage

### Avatar pack
All The avatars listed in the file /src/model/avatars.json should be made available as .png files in the folders /src/assets/avatars.
Originally, these avatars were provided from the DesignShock Material Design Avatars pack (https://www.designshock.com/flat_character/). However, the commercial license does not allow redistribution. Therefore, you must obtain your own license of the avatars pack and export the avatars as .png files, or provide your own avatars from any other source.

### Third-party license
All the icons provided in the folder /src/assets/icons are from https://game-icons.net/ (CC BY 3.0 - https://creativecommons.org/licenses/by/3.0/).
All the photos provided in the folder /images are from https://www.pexels.com/ with a free license (https://www.pexels.com/license/).

## Deployment
1. Compile and minify for production (see below)
2. Create a Google Firebase account. Enable database and file storage (and optionally, hosting)
3. Set the Firebase account data in config.js
4. Copy all the image files from the /images folder to a folder named /images on Firebase storage
5. Deploy the web files from the /dist folder (using Firebase hosting or any other web server)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
