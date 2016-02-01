# add sass and browser-sync to wordpress themes

## Setup:
1. clone the repository with: `git clone https://github.com/eyal670/gulp-sass-for-wp-themes.git`

2. create folder named `dev` within the theme folder as follow:
```
  wordpress-root
  |-- wp-content
      |-- themes
          |-- theme-folder
              |-- dev
```
3. put the repository files inside the `dev` folder

4. navigate to dev folder and run `npm install`

5. #### enqueue css
  `wp_enqueue_style( 'native-code_css', get_template_directory_uri() . '/css/native-code.css' );`

  all scss files must be import into the file `dev/scss/native-code.scss`.
  check the theme `css` folder path with `gulp dir`

6. #### enqueue javascript
  `wp_enqueue_script( 'native-code_js', get_template_directory_uri() . '/js/native-code.js', array('jquery'), '', true );`

  all files within `dev/js` folder will be concat into a single file named `native-code.js`.
  check the the theme `js` folder path with `gulp dir`

## How to use :
- run `gulp` to start watching the files and fire browser-sync server
- run `gulp package` to wrap only the theme files in a zip file, file will be created in a folder named `package`
- add `--production` flag to minify the .js and .css files
- you can run `gulp dir` to check if directories paths setup is correct
