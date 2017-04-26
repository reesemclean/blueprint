# Require Changelog to be modified if more than 20 lines of code have to been changed and #trivial does not appear in pull request title
# declared_trivial = (github.pr_title + github.pr_body).include?("#trivial")
# if !git.modified_files.include?("CHANGELOG.md") && !declared_trivial
#  fail("Please include an entry in #{github.html_link("CHANGELOG.md")}—if this is a trivial Pull Request that does not require a changelog entry please include #trivial in the title.", sticky: false)
# end

# Make it more obvious that a PR is a work in progress and shouldn't be merged yet
# warn("PR is marked as Work in Progress") if github.pr_title.include? "[WIP]"

# Warn when there is a big PR
# warn("Big PR - Consider breaking this into several smaller pull requests") if git.lines_of_code > 500

# Don't let testing shortcuts get into master by accident
# fail("fdescribe left in tests") if `grep -r fdescribe specs/ `.length > 1
# fail("fit left in tests") if `grep -r fit specs/ `.length > 1

# Warn if there are changes to the package.json file. 
# warn "#{github.html_link("package.json")} was edited." if git.modified_files.include? "package.json"

# message(":tada:  Thanks for the Pull Request!");