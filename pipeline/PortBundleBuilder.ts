// port_your_bond/pipeline/PortBundleBuilder.ts
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

export function buildPortBundle(
  outputDir: string,
  taggedPath: string,
  seedPath: string,
  digestPath: string
): string {
  const zipPath = path.join(outputDir, 'PORT_BOND_BUNDLE.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.file(taggedPath, { name: 'conversation_tagged.json' });
  archive.file(seedPath, { name: 'port_seed.json' });
  archive.file(digestPath, { name: 'memory_digest.txt' });

  const threadPath = path.join(outputDir, 'thread_library.json');
  if (fs.existsSync(threadPath)) {
    archive.file(threadPath, { name: 'thread_library.json' });
  }

  const readmePath = path.join(__dirname, '../examples/README_host_import_instructions.txt');
  if (fs.existsSync(readmePath)) {
    archive.file(readmePath, { name: 'README_host_import_instructions.txt' });
  }

  archive.finalize();
  return zipPath;
}
