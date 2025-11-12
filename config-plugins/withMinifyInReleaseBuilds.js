const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PROPERTY_NAME = 'android.enableMinifyInReleaseBuilds';
const PROPERTY_VALUE = 'true';

/**
 * Ensures the Android Gradle property needed for code shrinking is present.
 */
const withMinifyInReleaseBuilds = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const gradlePropertiesPath = path.join(config.modRequest.platformProjectRoot, 'gradle.properties');
      const contents = await fs.promises.readFile(gradlePropertiesPath, 'utf8');
      const lines = contents.split(/\r?\n/);

      let found = false;
      const updatedLines = lines.map((line) => {
        if (line.trim().startsWith(`${PROPERTY_NAME}=`)) {
          found = true;
          return `${PROPERTY_NAME}=${PROPERTY_VALUE}`;
        }
        return line;
      });

      if (!found) {
        if (updatedLines[updatedLines.length - 1].trim() !== '') {
          updatedLines.push('');
        }
        updatedLines.push(`${PROPERTY_NAME}=${PROPERTY_VALUE}`);
      }

      const updatedContents = updatedLines.join('\n');
      await fs.promises.writeFile(gradlePropertiesPath, updatedContents);
      return config;
    },
  ]);
};

module.exports = withMinifyInReleaseBuilds;
