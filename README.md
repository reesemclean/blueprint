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
// Where your Blueprint templates are stored. Templates are loaded relative to your VSCode program files, unless proceeded by './'. 

"blueprint.templatesPath": [
  "blueprint-templates", // Loaded from VSCode Program Files
  "./blueprint-templates"
]

// Folders can also be aliased 
"blueprint.templatesPath": {
  "Modules": "blueprint-templates/modules"
}
```

## Available Transforms

| Helper Name  | Example Use In Templates | Example Use in File/Folder Names | Sample Result          |
|--------------|--------------------------|----------------------------------|------------------------|
| camelCase    | {{camelCase name}}       | \_\_camelCase_name\_\_               | thisIsCamelCase        |
| pascalCase   | {{pascalCase name}}      | \_\_pascalCase_name\_\_              | ThisIsPascalCase       |
| snakeCase    | {{snakeCase name}}       | \_\_snakeCase_name\_\_               | this_is_snake_case     |
| kebabCase    | {{kebabCase name}}       | \_\_kebabCase_name\_\_               | this-is-kebab-case     |
| lowerDotCase | {{lowerDotCase name}}    | \_\_lowerDotCase_name\_\_            | this.is.lower.dot.case |

## Examples

Example templates can be found here:
[blueprint-examples](https://github.com/reesemclean/blueprint-examples)

We will continue to add new templates that we think may be helpful to use!

## Known Issues

## Release Notes

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
