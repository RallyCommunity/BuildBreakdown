## Overview

This Rakefile can be used to create a skeleton Rally app for use with Rally's App SDK.  You must have Ruby and the rake gem installed.

The normal workflow for creating an App is to start by creating an App with the new task.

Available tasks are:

    rake new[app_name,sdk_version]  # Create an app with the provided name (and optional SDK version)
    rake debug                      # Build a debug version of the app, useful for local development. 
    rake build                      # Build a deployable app which includes all JavaScript and CSS resources inline. Use after you app is working as you intend so that it can be copied into Rally.
    rake clean                      # Clean all generated output
    rake jslint                     # Run jslint on all JavaScript files used by this app
    
    
You can find more information on installing Ruby and using rake tasks to simplify app development here: https://rally1.rallydev.com/apps/2.0p/doc/#!/guide/appsdk_20_starter_kit

## License

AppTemplate is released under the MIT license.  See the file LICENSE for the full text.