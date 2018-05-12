# Blueprint ![Build Status](https://travis-ci.org/reesemclean/blueprint.svg?branch=master)

Create custom file templates for your project.

* File GitHub [issues](https://github.com/reesemclean/blueprint/issues/new)
  anytime you run into unexpected situations/bugs.
* Fork [our project](https://github.com/reesemclean/blueprint), send us PRs!

## Usage

### Setup where your Blueprint templates will be stored

* Create a folder anywhere in your project matching the templates path setting.
  By default, the path is set to `blueprint-templates`. (See
  [Extension Settings](#Templates-Path) if you would like to change this)

![Use Alt](https://zippy.gfycat.com/BrokenAdorableKinglet.gif)

### Add templates

* Create a template group by adding a new folder under the blueprint templates
  storage folder
* Add a template to the group by creating a new file

![Use Alt](https://zippy.gfycat.com/UnitedUnequaledFlounder.gif)

### Create from a template

* Right click on the file or folder in the explorer
* Select "New file from template"
* Enter a name

![Use Alt](https://zippy.gfycat.com/AggravatingBreakableDwarfmongoose.gif)

## Extension Settings

### Templates Path

To change the default storage location for where Blueprint templates are stored,
navigate to `settings.json` or `⌘,` under Visual Studio Code preferences and
change the `blueprint.templatesPath` setting

Example:

```less
// Where your Blueprint templates are stored. Templates are loaded relative to your workspace root path. Defaults to ./blueprint-templates

Examples:
"blueprint.templatesPath": [
  "./blueprint-templates",
  "../path-one-level-up-from-workspace",
  "~/path-from-home-folder",
  "/path-from-root
]
```

## Available Transforms

| Helper Name  | Example Use In Templates | Example Use in File/Folder Names | Sample Result          |
|--------------|--------------------------|----------------------------------|------------------------|
| upperCase    | {{upperCase name}}       | \_\_upperCase_name\_\_               | THISISUPPERCASE        |
| lowerCase    | {{lowerCase name}}       | \_\_lowerCase_name\_\_               | thisislowercase        |
| camelCase    | {{camelCase name}}       | \_\_camelCase_name\_\_               | thisIsCamelCase        |
| pascalCase   | {{pascalCase name}}      | \_\_pascalCase_name\_\_              | ThisIsPascalCase       |
| snakeCase    | {{snakeCase name}}       | \_\_snakeCase_name\_\_               | this_is_snake_case     |
| kebabCase    | {{kebabCase name}}       | \_\_kebabCase_name\_\_               | this-is-kebab-case     |
| lowerDotCase | {{lowerDotCase name}}    | \_\_lowerDotCase_name\_\_            | this.is.lower.dot.case |

## manifest.json

You can optionally include a "manifest.json" file in your template folders. This enables a few additionally points of customization.

key | Description of Use
------------ | -------------
suffixesToIgnoreInInput | If the value is "component" for instance, if user enters "My First Component" as the input -- "My First" will be used in the substitutions. This is to enable you to put "Component" in the template and not have to worry about the user entering it or not.
createFilesInFolderWithPattern (DEPRECATED) | Create your template files within a folder -- uses the same transfrom as you would use during naming your files and folders. _This is possible now by just creating a top-level folder in your template. Previously we did not support folders within folders. You should use that technique instead of using this key._

## Examples

Example templates can be found here:
[blueprint-examples](https://github.com/reesemclean/blueprint-examples)

We will continue to add new templates that we think may be helpful to use!

## Known Issues

## Release Notes

### 2.1.1

Bug Fix: Fixes detection of possible overwrites on file creation.

### 2.1.0

Cleanup of template selection user interface; the template name is now emphasized again.

Allow templates to include hidden folders and files. System created files (Thumbs.db, .DS_Store, etc. are still ignored).

Added two new transform helpers: lowerCase and upperCase.

### 2.0.0

Adds ability to provide multiple folders of templates. Useful for using both a project local and a shared (global) templates.

Template folder paths also now expand ~ to the home directory.

### 1.5.0

Added a new transform helper: lowerDotCase!

### 1.4.0

Now supports non-unix paths, AKA Windows support!

### 1.3.0

You can now create folders and nested folder/file structures inside a template
folder. Folder names inside a template folder can be templated the same way that
file names are.

### 1.1.0

Fixes missing dependency in initial release.
