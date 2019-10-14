import * as webdriver from 'selenium-webdriver';
import { default as express } from 'express';
import * as fs from 'fs';
import { default as detectPort } from 'detect-port';
import * as browserstack from 'browserstack-local';
import * as ReactDOM from 'react-dom/server';
import * as SparkMD5 from 'spark-md5';
import { ServerStyleSheet } from 'styled-components';

let app: express.Application, server: any;
const sheet = new ServerStyleSheet();

export default class ReactBrowserstackScreenshot {
  constructor(options: any) {
    this.user = options.user;
    this.key = options.key;
    if (options.port) {
      this.port = options.port;
    }
  }

  user: string = null
  key: string = null
  port = 3009

  OS = [
    {
      os: 'Windows',
      os_version: [
        {
          version: '10',
          browsers: [
            {
              browserName: 'IE',
              browser_version : ['11.0'],
            },
            {
              browserName: 'Edge',
              browser_version : ['insider preview', '18.0']//, '17.0', '16.0', '15.0',],
            },
            {
              browserName: 'Firefox',
              browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
            },
            {
              browserName: 'Chrome',
              browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
            }
          ]
        },
        // {
        //   version: '8.1',
        //   browsers: [
        //     {
        //       browserName: 'IE',
        //       browser_version : ['11.0'],
        //     },
        //     {
        //       browserName: 'Firefox',
        //       browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
        //     },
        //     {
        //       browserName: 'Chrome',
        //       browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
        //     }
        //   ]
        // },
        // {
        //   version: '8',
        //   browsers: [
        //     {
        //       browserName: 'IE',
        //       browser_version : ['11.0'],
        //     },
        //     {
        //       browserName: 'Firefox',
        //       browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
        //     },
        //     {
        //       browserName: 'Chrome',
        //       browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
        //     }
        //   ]
        // },
        // {
        //   version: '7',
        //   browsers: [
        //     {
        //       browserName: 'IE',
        //       browser_version : ['11.0'],
        //     },
        //     {
        //       browserName: 'Edge',
        //       browser_version : ['insider preview', '18.0']//, '17.0', '16.0', '15.0',],
        //     },
        //     {
        //       browserName: 'Firefox',
        //       browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
        //     },
        //     {
        //       browserName: 'Chrome',
        //       browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
        //     }
        //   ]
        // },
        // {
        //   version: 'XP',
        //   browsers: [
        //     {
        //       browserName: 'IE',
        //       browser_version : ['11.0'],
        //     },
        //     {
        //       browserName: 'Edge',
        //       browser_version : ['insider preview', '18.0']//, '17.0', '16.0', '15.0',],
        //     },
        //     {
        //       browserName: 'Firefox',
        //       browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
        //     },
        //     {
        //       browserName: 'Chrome',
        //       browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
        //     }
        //   ]
        // }
      ]
    },
    {
      os: 'OS X',
      os_version: [
        {
          version: 'Mojave',
          browsers: [
            {
              browserName : 'Safari',
              browser_version: ['12.1']
            },
            {
              browserName: 'Firefox',
              browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
            },
            {
              browserName: 'Chrome',
              browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
            }
          ]
        },
        // {
        //   version: 'High Sierra',
        //   browsers: [
        //     {
        //       browserName : 'Safari',
        //       browser_version: ['11.0']
        //     },
        //     {
        //       browserName: 'Firefox',
        //       browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
        //     },
        //     {
        //       browserName: 'Chrome',
        //       browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
        //     }
        //   ]
        // },
      //   {
      //     version: 'Sierra',
      //     browsers: [
      //       {
      //         browserName : 'Safari',
      //         browser_version: ['10.1']
      //       },
      //       {
      //         browserName: 'Firefox',
      //         browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
      //       },
      //       {
      //         browserName: 'Chrome',
      //         browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
      //       }
      //     ]
      //   },
      //   {
      //     version: 'El Capitan',
      //     browsers: [
      //       {
      //         browserName : 'Safari',
      //         browser_version: ['9.1']
      //       },
      //       {
      //         browserName: 'Firefox',
      //         browser_version : ['69.0', '70.0 beta', '68.0']//, '67.0', '66.0'],
      //       },
      //       {
      //         browserName: 'Chrome',
      //         browser_version : ['78.0 beta', '77.0', '76.0']// , '75.0', '74.0',],
      //       }
      //     ]
      //   }
      ]
    }
  ]

  createHtml = async (reactDOM) => {
    try {
      const dom = sheet.collectStyles(reactDOM);
      const html = ReactDOM.renderToString(dom);
      const styleTags = sheet.getStyleTags();
      const hash = SparkMD5.hash(html);

      const template = `<!DOCTYPE html><html lang="en"><head>
<link rel="stylesheet" type="text/css" href="http://cdn.boomtrain.net/fonts/v1/font.css">
<style>

html {
  box-sizing: border-box;
}

*, *:after, *:before {
  box-sizing: inherit;
}

*:focus {
  outline: none;
}

body {
  font-family: Lato;
  font-size: 14px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
}
</style>
${styleTags}
</head>
<body>
${html}
</body>
</html>
`;

      await new Promise((resolve, reject) => {
        fs.writeFile(`${process.cwd()}/html/${hash}.html`, template, err => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
      return hash;
    } catch (err) {
      throw err;
    }
  }

  screenshot = async (reactDOM: any) => {
    const hash = await this.createHtml(reactDOM);
    const capabilities = []
    this.OS.forEach(os => {
      os.os_version.forEach(osVersion => {
        osVersion.browsers.forEach(browser => {
          browser.browser_version.forEach(version => {
            capabilities.push({
              'browserName': browser.browserName,
              'browser_version': version,
              'os': os.os,
              'os_version': osVersion.version,
              'resolution': '1024x768',
              'browserstack.user': this.user,
              'browserstack.key': this.key,
              'name': 'Test',
              'browserstack.local': true
            });
          });
        });
      });
    });

    const queue = async index => {
      await this.makeScreenshot(capabilities[index], reactDOM, hash)
      if (capabilities[index+1]) {
        await queue(index + 1)
      }
    }

    await queue(0)
  }

  makeScreenshot = async (capabilities, reactDOM, hash) => {
    this.driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();
    try {

      await this.driver.get(`http://localhost:${this.port}/${hash}`);
      const image = await this.driver.takeScreenshot()
      this.driver.quit();
      await new Promise((resolve, reject) => {
        fs.writeFile(`${process.cwd()}/screenshots/${capabilities.os}_${capabilities.os_version}_${capabilities.browserName}_${capabilities.browser_version}.png`, image, 'base64', function (err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    } catch (err) {
      this.driver.quit();
      console.log('maybe invalid browser version', err)
    }
    this.driver = null;
  }

  startServer = async () => {
    if (!app) {
      const port = await detectPort(3009);

      if (port === 3009) {
        app = express();
        app.get('/:hash', (req: any, res: any) => res.sendFile(`${process.cwd()}/html/${req.params.hash}.html`));

        await new Promise(resolve => {
          const bs_local = new browserstack.Local();
          const bs_local_args = {
            'key': this.key
          };
          // starts the Local instance with the required arguments
          bs_local.start(bs_local_args, function () {
            server = app.listen(port, () => {
  
              const shutDown = () => {
                if (this.driver) this.driver.quit()
                bs_local.stop(function () {
                });
  
                server.close(() => {
                  process.exit(0);
                });
  
                setTimeout(() => {
                  console.error('Could not close connections in time, forcefully shutting down');
                  process.exit(1);
                }, 10000);
              }
  
              process.on('SIGTERM', shutDown);
              process.on('SIGINT', shutDown);
              resolve()
            });
          });
        });
      }

    }
    return app;
  }
  stopServer = () => {
    server.close()
  }
}