import { danger, fail, warn, message } from "danger"
import fs from "fs"

// Make sure there are changelog entries
const hasChangelog = danger.git.modified_files.includes("changelog.md")
if (!hasChangelog) { fail("No Changelog changes!") }

message(":tada:, this worked @" + danger.github.pr.user.login)