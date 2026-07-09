#!/usr/bin/env node
/**
 * `nest start --watch`는 nest-cli.json의 deleteOutDir로 매 컴파일마다 dist/ 전체를
 * 지우고 다시 만든다. Prisma 클라이언트는 generated/prisma(별도 output 경로)에
 * 있어서 tsc 컴파일 대상이 아니라 dist/generated로 복사해줘야 하는데, nest의
 * 기본 tsc 빌더는 nest-cli.json의 "assets" 복사 기능을 지원하지 않는다(webpack/SWC
 * 빌더 전용). 그래서 별도 프로세스가 dist/generated를 계속 채워 넣는다.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GENERATED_SRC = path.join(ROOT, 'generated');
const DIST_DIR = path.join(ROOT, 'dist');
const GENERATED_DEST = path.join(DIST_DIR, 'generated');

function syncGenerated() {
  if (!fs.existsSync(GENERATED_SRC)) return;
  if (fs.existsSync(GENERATED_DEST)) return;
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.cpSync(GENERATED_SRC, GENERATED_DEST, { recursive: true });
}

syncGenerated();
const interval = setInterval(syncGenerated, 300);

const nestArgs = process.argv.slice(2);
const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['nest', 'start', ...nestArgs],
  { stdio: 'inherit', cwd: ROOT },
);

child.on('exit', (code) => {
  clearInterval(interval);
  process.exit(code ?? 0);
});
