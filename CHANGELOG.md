# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this
project adheres to [Semantic Versioning](http://semver.org/).

### [Unreleased]

## [3.0.1 - 2019-01-17]

* Adds ability to use suffixesToIgnoreInInput without createFilesInFolderWithPattern

## [3.0.0 - 2019-01-02]

* Adds ability to provide dynamic template replacements at the time of file creation

## [2.3.0 - 2018-11-09]

* Adds UPPER_SNAKE_CASE transform (__upperSnakeCase_name__ or {{upperSnakeCase name}})
* Adds ability to use no transform for files names (use __name__ token)
* Adds number of steps and current step to UI for user input

## [2.2.0 - 2018-07-02]

* Skip content replacement on files that cannot read by handlebars. Useful for non-text files like images and video.

## [2.1.1 - 2018-05-06]

* Uses async/await
* Fixes conflict detection

## [2.1.0 - 2018-05-06]
 
* Only ignore OS created files (.DS_Store, Thumbs.db, etc.) instead of all hidden files and folders
* Display template selection menu in a user friendly way
* Added upperCase and lowerCase as a new replacement option.

## [2.0.0 - 2018-4-30]

* Added multi-folder support and support for expanding ~ (home) directory paths.

## [1.5.0 - 2017-12-17]

* Added lowerDotCase as a new replacement option.

## [1.4.0 - 2017-09-03]

* Windows support

## [1.3.0] - 2017-06-02

* Can now have a nested folder structure!

## [1.1.0] - 2017-04-11

* Fix mixing dependency in release

## [1.0.0] - 2017-04-11

* Initial release
