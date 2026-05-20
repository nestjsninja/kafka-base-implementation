import { spawn } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const targetOrder = ['lint', 'test', 'build'];
const groupOrder = ['apps', 'core', 'components', 'shared-libs'];
const groupLabels = {
  apps: 'Apps',
  core: 'Core Libraries',
  components: 'Component Libraries',
  'shared-libs': 'Shared Libraries',
};

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const { quiet = false, ...spawnOptions } = options;
    const child = spawn(command, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...spawnOptions,
    });
    let output = '';

    child.stdout.on('data', (chunk) => {
      if (!quiet) {
        process.stdout.write(chunk);
      }
      output += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      if (!quiet) {
        process.stderr.write(chunk);
      }
      output += chunk.toString();
    });

    child.on('close', (code) => {
      resolve({
        code: code ?? 1,
        output: output.trim(),
      });
    });
  });
}

async function readProjects() {
  const result = await run('npx', ['nx', 'show', 'projects', '--json'], {
    quiet: true,
  });

  if (result.code !== 0) {
    throw new Error('Unable to list Nx projects.');
  }

  return JSON.parse(result.output);
}

async function readProject(projectName) {
  const result = await run('npx', ['nx', 'show', 'project', projectName, '--json'], {
    quiet: true,
  });

  if (result.code !== 0) {
    throw new Error(`Unable to read Nx project "${projectName}".`);
  }

  return JSON.parse(result.output);
}

function classifyProject(project) {
  if (project.projectType === 'application' || project.root.startsWith('apps/')) {
    return 'apps';
  }

  if (project.tags?.includes('scope:core') || project.root.startsWith('libs/core/')) {
    return 'core';
  }

  if (
    project.tags?.includes('scope:components') ||
    project.root.startsWith('libs/components/')
  ) {
    return 'components';
  }

  return 'shared-libs';
}

async function runTarget(projectName, targetName) {
  const startedAt = Date.now();
  const result = await run('npx', [
    'nx',
    'run',
    `${projectName}:${targetName}`,
    '--skip-nx-cache',
  ]);

  return {
    code: result.code,
    durationMs: Date.now() - startedAt,
    output: result.output,
    status: result.code === 0 ? 'Passed' : 'Failed',
    target: targetName,
  };
}

function skippedResult(targetName) {
  return {
    code: 0,
    durationMs: 0,
    output: '',
    status: 'Skipped',
    target: targetName,
  };
}

function formatDuration(durationMs) {
  return durationMs > 0 ? `${(durationMs / 1000).toFixed(1)}s` : '-';
}

function formatStatus(result) {
  if (result.status === 'Skipped') {
    return '➖ Skipped';
  }

  return result.code === 0 ? '✅ Passed' : '❌ Failed';
}

function projectTable(projects) {
  return [
    '| Project | Type | Lint | Test | Build |',
    '| --- | --- | --- | --- | --- |',
    ...projects.map((project) => {
      const cells = targetOrder.map((targetName) => {
        const result = project.results[targetName];
        return `${formatStatus(result)} (${formatDuration(result.durationMs)})`;
      });

      return `| ${project.name} | ${project.projectType} | ${cells.join(' | ')} |`;
    }),
  ].join('\n');
}

function failureSections(projects) {
  const sections = [];

  for (const project of projects) {
    for (const targetName of targetOrder) {
      const result = project.results[targetName];

      if (result.code === 0 || result.status === 'Skipped') {
        continue;
      }

      const tail = result.output.split('\n').slice(-40).join('\n');
      sections.push(
        `### ${project.name}:${targetName}`,
        '',
        '```text',
        tail,
        '```',
        '',
      );
    }
  }

  return sections;
}

function writeSummary(projects) {
  const failed = projects.flatMap((project) =>
    targetOrder
      .map((targetName) => project.results[targetName])
      .filter((result) => result.code !== 0),
  );
  const status = failed.length === 0 ? '✅ Passed' : '❌ Failed';
  const lines = ['# Quality Gate', '', `**Status:** ${status}`, ''];

  for (const group of groupOrder) {
    const groupedProjects = projects.filter((project) => project.group === group);

    if (groupedProjects.length === 0) {
      continue;
    }

    lines.push(`## ${groupLabels[group]}`, '', projectTable(groupedProjects), '');
  }

  const failures = failureSections(projects);

  if (failures.length > 0) {
    lines.push('## Failures', '', ...failures);
  }

  const content = `${lines.join('\n')}\n`;

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, content);
  } else {
    console.log(content);
  }
}

export async function main() {
  const projectNames = await readProjects();
  const projects = [];

  for (const projectName of projectNames) {
    const project = await readProject(projectName);
    const results = {};

    console.log(`\n==> ${projectName}`);

    for (const targetName of targetOrder) {
      if (!project.targets?.[targetName]) {
        results[targetName] = skippedResult(targetName);
        continue;
      }

      console.log(`\n--> ${projectName}:${targetName}`);
      results[targetName] = await runTarget(projectName, targetName);
    }

    projects.push({
      group: classifyProject(project),
      name: projectName,
      projectType: project.projectType ?? 'unknown',
      results,
      root: project.root,
    });
  }

  writeSummary(projects);

  if (
    projects.some((project) =>
      targetOrder.some((targetName) => project.results[targetName].code !== 0),
    )
  ) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
