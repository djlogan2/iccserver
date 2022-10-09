Package.describe({
    name: 'json-protocol',
    version: '1.0.1',
    summary: 'JSON protocol to send arbitrary data over Meteor\'s websocket',
    git: 'https://github.com/wojtkowiak/meteor-custom-protocol',
    documentation: 'README.md'
});

Package.onUse(function onUse(api) {
    api.versionsFrom('1.4');
    api.use('ecmascript');
    api.use('underscore');
    api.use('custom-protocol');

    api.addFiles([
        'src/utils/Json.protocol.js',
        'src/utils/Json.protocol'
    ]);
    api.export('JsonProtocol');
});

Package.onTest(function onTest(api) {
    Npm.depends({
        'ultimate-chai': '4.1.0',
        sinon: '4.3.0'
    });
    api.use('ecmascript');
    api.use('json-protocol');
    api.use('cultofcoders:mocha');

    api.addFiles([
        'src/utils/tests/Json_protocol.test.js',
    ], ['server']);
    api.addFiles([
        'src/utils/tests/Json_protocol.test.js',
    ], ['client']);
});
