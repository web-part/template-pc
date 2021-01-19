

const response = require('./proxy/response');


module.exports = {
    '/proxy/': {
        target: 'http://kisapp.kingdee.com:8088/',
        changeOrigin: true,
        pathRewrite: {
            '^/proxy/': '/',
        },

        onProxyRes: response,
    },
};