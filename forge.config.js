module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'ed-squadrone-tracker',
    icon: 'img/ed-squadrone-tracker-transparent.ico',
    extraResource: [
      'img/ed-squadrone-tracker-transparent.png',
      'img/ed-squadrone-tracker-transparent.ico',
      'img/ed-squadrone-tracker-tray.png',
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        exe: 'ed-squadrone-tracker.exe',
        setupExe: 'ED-Squadrone-Tracker-Setup.exe',
        setupIcon: 'img/ed-squadrone-tracker-transparent.ico',
        title: 'ED Squadrone Tracker',
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
        draft: false
      }
    }
  ],
};
