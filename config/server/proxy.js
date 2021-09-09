


const Proxy = require('@webpart/proxy');


module.exports = {
    '/proxy/': {
        target: 'http://120.76.123.129:8090/',
        changeOrigin: true,
        pathRewrite: {
            '^/proxy/': '/',
        },

        onProxyRes: function (proxyRes, req, res) {
            Proxy.catch(proxyRes, function (body) {
                const File = require('@definejs/file');
                let file = req.url.split('?')[0];
                let json = JSON.parse(body);

                File.writeJSON(`./output/proxy/${file}.json`, json);
            });
        },
    },
};