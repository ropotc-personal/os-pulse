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
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Github result: ${response.status}`);
        }

        const rawData: any = await response.json();
        let rawIssues: any[] = [];

        if (Array.isArray(rawData)) {
            rawIssues = rawData;
        } else if (rawData?.payload?.contentfulRawJsonResponse?.items) {
            console.log('Detected wrapped Contentful payload structure. Extracting items...');
            rawIssues = rawData.payload.contentfulRawJsonResponse.items;
        } else if (rawData?.items) {
            rawIssues = rawData.items;
        } else {
            console.log('Unknown structure preview:', JSON.stringify(rawData).substring(0, 200));
            throw new Error('Data format is unknown and could not be parsed.');
        }

        const issues: GitHubIssue[] = rawIssues.map((issue: any) => {
            const fields = issue.fields || issue;
            return {
                id: issue.id || issue.sys?.id || Math.random(),
                title: fields.title || 'No Title',
                url: fields.html_url || fields.url || '#',
                repo: repo,
                createdAt: fields.created_at || issue.sys?.createdAt || new Date().toISOString()
            };
        });




        const dataDir = path.join(process.cwd(), 'src', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dataPath = path.join(dataDir, 'issues.json');
        fs.writeFileSync(dataPath, JSON.stringify(issues, null, 2), 'utf-8');

        console.log(`This operation succeeded! Saved ${issues.length} issues to src/data/issues.json`);

    } catch (error: any) {
        console.error('Error - could not get data:', error.message);
    }
}

fetchGoodFirstIssues();
