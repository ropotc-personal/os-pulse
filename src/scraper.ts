import * as fs from 'fs';
import * as path from 'path';

interface GitHubIssue {
    id: number;
    title: string;
    url: string;
    repo: string;
    createdAt: string;
}

async function fetchGoodFirstIssues() {
    const repo = 'microsoft/TypeScript';

    const url = 'https://github.com';

    try {
        console.log(`Verifying new issues ${repo}...`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'OS-Pulse-App',
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Github result: ${response.status}`);
        }

        const data: any = await response.json();

        const issues: GitHubIssue[] = data.map((issue: any) => ({
            id: issue.id,
            title: issue.title,
            url: issue.html_url,
            repo: repo,
            createdAt: issue.created_at
        }));

        const dataDir = path.join(process.cwd(), 'src', 'data');

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dataPath = path.join(dataDir, 'issues.json');
        fs.writeFileSync(dataPath, JSON.stringify(issues, null, 2), 'utf-8');

        console.log(`This operation succeeded, we saved ${issues.length} issues`);

    } catch (error: any) {
        console.error('Error - could not get data:', error.message);
        process.exit(1);
    }
}

fetchGoodFirstIssues();
