import { getGlobalVariable } from '../../utils/env';
import { expectFileToExist } from '../../utils/fs';
import { expectGitToBeClean } from '../../utils/git';
import { ng } from '../../utils/process';
import { updateJsonFile } from '../../utils/project';
import { expectToFail } from '../../utils/utils';

export default function () {
  // TODO(architect): Delete this test. It is now in devkit/build-angular.

  const usingWebpack = !getGlobalVariable('argv')['esbuild'];

  return ng('build', '--output-path', 'build-output', '--configuration=development')
    .then(() => expectFileToExist(`./build-output/${usingWebpack ? '' : 'browser/'}index.html`))
    .then(() => expectFileToExist(`./build-output/${usingWebpack ? '' : 'browser/'}main.js`))
    .then(() => expectToFail(expectGitToBeClean))
    .then(() =>
      updateJsonFile('angular.json', (workspaceJson) => {
        const appArchitect = workspaceJson.projects['test-project'].architect;
        appArchitect.build.options.outputPath = 'config-build-output';
      }),
    )
    .then(() => ng('build', '--configuration=development'))
    .then(() =>
      expectFileToExist(`./config-build-output/${usingWebpack ? '' : 'browser/'}index.html`),
    )
    .then(() => expectFileToExist(`./config-build-output/${usingWebpack ? '' : 'browser/'}main.js`))
    .then(() => expectToFail(expectGitToBeClean));
}
