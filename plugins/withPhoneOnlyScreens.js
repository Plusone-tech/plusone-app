const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Custom config plugin to restrict the Android app to phone screen sizes only.
 * This prevents the app from being installed or run on tablets.
 * 
 * It modifies the AndroidManifest.xml to add a <supports-screens> element with:
 * - android:smallScreens="true"
 * - android:normalScreens="true" 
 * - android:largeScreens="false"
 * - android:xlargeScreens="false"
 * - android:requiresSmallestWidthDp="320" (minimum width for phones)
 */
const withPhoneOnlyScreens = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Add the supports-screens element
    if (!manifest['supports-screens']) {
      manifest['supports-screens'] = [];
    }

    // Define screen support configuration - phones only, no tablets
    manifest['supports-screens'] = [
      {
        $: {
          'android:smallScreens': 'true',
          'android:normalScreens': 'true',
          'android:largeScreens': 'false',
          'android:xlargeScreens': 'false',
          'android:requiresSmallestWidthDp': '320'
        }
      }
    ];

    return config;
  });
};

module.exports = withPhoneOnlyScreens;
