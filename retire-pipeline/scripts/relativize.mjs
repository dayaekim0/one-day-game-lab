// next export 결과물(out/)의 절대 경로(/_next/...)를 상대 경로로 바꿔서
// GitHub Pages 하위 폴더 등 어떤 경로에 올려도 열리게 만든다.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

let changed = 0;
for (const file of walk(OUT)) {
  let src = readFileSync(file, "utf8");
  const before = src;
  if (file.endsWith(".html") || file.endsWith(".txt")) {
    src = src
      .replaceAll('"/_next/', '"./_next/')
      .replaceAll('"/icon.svg', '"./icon.svg')
      .replaceAll('"/manifest.webmanifest', '"./manifest.webmanifest');
  } else if (/webpack-[\w]+\.js$/.test(file)) {
    // 런타임 청크 로딩 경로를 현재 문서 기준으로 계산
    src = src.replace(/(\w)\.p="\/_next\/"/, '$1.p=new URL("./_next/",document.baseURI).href');
  } else if (file.endsWith(".webmanifest")) {
    src = src.replaceAll('"/icon.svg', '"./icon.svg').replace('"start_url":"/"', '"start_url":"./"');
  }
  if (src !== before) {
    writeFileSync(file, src);
    changed++;
  }
}
console.log(`relativize: ${changed} files updated`);
