# add sass and browser-sync to wordpress themes
## enqueue css
- `wp_enqueue_style( 'native-code_css', get_template_directory_uri() . '/css/native-code.css' );`

## enqueue javascript
- `wp_enqueue_script( 'native-code_js', get_template_directory_uri() . '/js/native-code.js', array('jquery'), '', true );`

## How to use :
- run `gulp` to start watching the files and run browser-sync server
- run `gulp package` to wrap only the theme files in a zip file
- add `--production` flag to minify the .js and .css filse
