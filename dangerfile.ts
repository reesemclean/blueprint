import { danger, warn, message } from "danger"
import * as _ from "lodash"

// Request a CHANGELOG entry if not declared #trivial
const hasChangelog = _.includes(danger.git.modified_files, "changelog.md")
const isTrivial = _.includes((danger.github.pr.body + danger.github.pr.title), "#trivial")
if (!hasChangelog && !isTrivial) {
  warn("Please add a changelog entry for your changes.")

  // Politely ask for their name on the entry too
  const changelogDiff = danger.git.diffForFile("changelog.md")
  const contributorName = danger.github.pr.user.login
  if (changelogDiff && _.includes(changelogDiff, contributorName)) {
    warn("Please add your GitHub name to the changelog entry, so we can attribute you correctly.")
  }
}

message(":tada: Thanks!");
