module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'ed-squadrone-tracker',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        exe: 'ed-squadrone-tracker.exe',
        setupExe: 'ED-Squadrone-Tracker-Setup.exe',
        title: 'ED Squadrone Tracker',
        //name: 'ED: Squadrone Tracker'
        //noMsi: false,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Kejax',
          name: 'ED-Squadrone-Tracker'
        },
        prerelease: true,
        draft: true
      }
    }
  ],
};
