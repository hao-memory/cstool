import { join } from 'path';

const baseDir = process.cwd();
export default {
  build: {
    env: {
      NODE_ENV: '"production"'
    },
    assetsRoot: join(baseDir, 'dist'),
    assetsLocalRoot: join(baseDir, 'dist-local'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    staticDirPath: join(baseDir, 'static')
  },
  dev: {
    env: {
      NODE_ENV: '"development"'
    }
  },
  server: {
    port: 9000,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/'
  },
  dummy_domain: '@dummy_domain@/',
  environment: {
    dev: {
      domain: 'dev.rs.com',
      aureuma_domain: 'aureuma.test.rs.com'
    },
    uat1: {
      domain: 'uat1.rs.com',
      aureuma_domain: 'aureuma.test.rs.com'
    },
    stg: {
      domain: 'mklmall.com',
      aureuma_domain: 'aureuma.test.rs.com'
    },
    prd: {
      domain: 'mmall.com',
      aureuma_domain: 'aureuma.mmall.com'
    }
  },
  cdnMapping: {
    js: {
      cdn: 'static1',
      name: 'js'
    },
    css: {
      cdn: 'static2',
      name: 'css'
    },
    image: {
      cdn: 'static3',
      name: 'image'
    },
    png: {
      cdn: 'static3',
      name: 'png'
    },
    jpg: {
      cdn: 'static3',
      name: 'jpg'
    },
    gif: {
      cdn: 'static3',
      name: 'gif'
    },
    bmp: {
      cdn: 'static3',
      name: 'bmp'
    },
    others: {
      cdn: 'static4',
      name: 'others'
    }
  }
};
