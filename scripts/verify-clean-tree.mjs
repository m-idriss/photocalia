import { execFileSync } from 'node:child_process';

const status = execFileSync('git', ['status', '--porcelain'], {
  encoding: 'utf8',
}).trim();

if (status) {
  console.error('Verification changed tracked or untracked files:');
  console.error(status);
  process.exit(1);
}

console.log('Working tree is clean.');
