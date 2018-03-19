import crypto from 'crypto';
import { join } from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import config from './config';

function getRandomSalt() {
  return Math.random().toString().slice(2, 5);
}

function cryptPwd(name, salt) {
  const saltName = `${name}:${salt}`;
  const md5 = crypto.createHash('md5');
  const result = md5.update(saltName).digest('hex');
  return result;
}

export default function zip(args, callback) {
  console.log('zip start');
  const pkg = require(join(args.cwd, 'package.json')); //eslint-disable-line
  const pkgName = pkg.name;
  const random = cryptPwd(`${pkg.name}`, getRandomSalt());
  const zipName = `${pkgName}-${random}`;
  const zipOutputPath = `${join(config.build.assetsRoot, zipName)}.zip`;
  const output = createWriteStream(zipOutputPath);
  const directoryLocalPath = config.build.assetsLocalRoot;
  const archive = archiver('zip');
  output.on('close', () => {
    console.log(archive.pointer(), ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    if (typeof callback === 'function') {
      callback();
    }
  });
  archive.on('error', (err) => {
    console.err(err);
    throw err;
  });
  archive.pipe(output);
  console.log('zipping path:', directoryLocalPath);
  // archive.directory(directoryPath, pkg.name);
  archive.glob('**', {
    cwd: directoryLocalPath,
    name: pkg.name
  });
  archive.finalize();
}
