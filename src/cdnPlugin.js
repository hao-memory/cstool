import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import glob from 'glob';
import config from './config';

class cdnPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.plugin('done', () => {
      const fileOutputPath = compiler.outputPath;
      const files = glob.sync(join(fileOutputPath, '**/*.{html,js,css,map}'));
      const { cdnMapping, environment } = config;
      const { env, cwd, packageName } = this.options;
      const envDomain = environment[env].domain || environment.dev.domain;
      const pkgPath = join(cwd, 'package.json');
      const pkg = existsSync(pkgPath) ? require(pkgPath) : {}; // eslint-disable-line
      const projectName = packageName || pkg.name || '';
      let dummyDomain = config.dummy_domain;
      if (dummyDomain && /\/$/.test(dummyDomain)) {
        dummyDomain = dummyDomain.replace(/\/$/, '');
      }
      const strRegex = `${dummyDomain}\/([^"|^)]+)`;// eslint-disable-line
      const regex = new RegExp(strRegex, 'g');
      files.forEach((file) => {
        let fileContent = readFileSync(file, 'utf-8');
        fileContent = fileContent.replace(regex, (search) => {
          let retVal = search;
          Object.keys(cdnMapping).forEach((cdnKey) => {
            const entry = cdnMapping[cdnKey];
            const tmpRegex = new RegExp(`${strRegex}\.${entry.name}$`, 'g'); // eslint-disable-line
            const domain = `//${entry.cdn}.${envDomain}`;
            if (tmpRegex.test(search)) {
              retVal = search.replace(tmpRegex, `${domain}/${projectName}/$1.${entry.name}`);
            }
          });
          return retVal;
        }).replace(dummyDomain, `//${cdnMapping.image.cdn}.${envDomain}/${projectName}`);
        writeFileSync(file, fileContent, 'utf-8');
      });
    });
  }
}

export default cdnPlugin;
