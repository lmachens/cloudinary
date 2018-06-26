Package.describe({
  name: 'lmachens:cloudinary',
  summary: 'Upload files to Cloudinary',
  version: '5.0.6',
  git: 'https://github.com/lmachens/cloudinary'
});

Npm.depends({
  cloudinary: '1.10.0', // Server side
  'cloudinary-core': '2.5.0' // Client side
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');

  // Core Packages
  api.use(['meteor-base@1.0.1', 'mongo', 'underscore'], ['client', 'server']);
  api.use(['check', 'ecmascript@0.9.0', 'random', 'reactive-var'], ['client', 'server']);

  // External Packages
  api.use(['matb33:collection-hooks@0.7.3', 'audit-argument-checks'], ['client', 'server'], {
    weak: true
  });

  // Core Files
  api.addFiles('server/configuration.js', 'server');
  api.addFiles('server/signature.js', 'server');

  api.addFiles('client/functions.js', 'client');

  api.export('Cloudinary', ['server', 'client']);
});
