const { execSync } = require('node:child_process');
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

function run(command) {
    console.log(`> ${command}`);
    return execSync(command, { encoding: 'utf-8', stdio: 'inherit' });
}

function runSilent(command) {
    try {
        return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
    }
    catch {
        return '';
    }
}

async function main() {
    const bumpType = process.argv[2] || 'patch';

    if (!['patch', 'minor', 'major'].includes(bumpType)) {
        console.error('Usage: node scripts/release.js [patch|minor|major]');
        process.exit(1);
    }

    console.log(`Starting automated release process (${bumpType})...`);

    // 1. Bump version
    console.log('Bumping version...');
    runSilent(`npm version ${bumpType} --no-git-tag-version`);
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const newVersion = pkg.version;
    console.log(`Bumped version to ${newVersion}`);

    // 2. Generate changelog
    console.log('Generating changelog...');
    let lastTag = runSilent('git describe --tags --abbrev=0');

    if (!lastTag) {
        lastTag = runSilent('git rev-list --max-parents=0 HEAD');
    }

    const logCmd = lastTag
        ? `git log ${lastTag}..HEAD --oneline`
        : 'git log --oneline';

    const logs = runSilent(logCmd);
    let changelogEntries = '*No significant changes detected.*';

    if (logs && logs.trim().length > 0) {
        changelogEntries = logs
            .split('\n')
            .filter(Boolean)
            .map(line => `- ${line}`)
            .join('\n');
    }

    const changelogPath = join(process.cwd(), 'CHANGELOG.md');
    const today = new Date().toISOString().split('T')[0];
    const newChangelogEntry = `## v${newVersion} (${today})\n\n${changelogEntries}\n\n`;

    let currentChangelog = '';

    if (existsSync(changelogPath)) {
        currentChangelog = readFileSync(changelogPath, 'utf8');
    }

    writeFileSync(changelogPath, newChangelogEntry + currentChangelog);
    console.log('Updated CHANGELOG.md');

    // 3. Commit and tag
    console.log('Committing version bump and changelog...');
    run('git add package.json CHANGELOG.md');

    try {
        runSilent('git add pnpm-lock.yaml');
    }
    catch { }

    try {
        runSilent('git add package-lock.json');
    }
    catch { }

    // Ensure there are changes before committing
    if (runSilent('git diff --cached --name-only').length > 0) {
        run(`git commit -m "chore(release): bump version to v${newVersion}"`);
        run(`git tag v${newVersion}`);
        console.log(`Committed and tagged v${newVersion}`);
    }
    else {
        console.log('No changes to commit, skipping commit and tag.');
    }

    // 4. Push to GitHub (This triggers the GitHub Action for building)
    console.log('Pushing to GitHub (which will trigger the CI/CD build)...');
    run('git push origin HEAD');
    run('git push origin --tags');

    console.log(`Release v${newVersion} initiated successfully! Check GitHub Actions for the build progress.`);
}

main().catch((err) => {
    console.error('Release failed:', err.message);
    process.exit(1);
});
