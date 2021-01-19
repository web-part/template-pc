
const File = require('@definejs/file');
const zlib = require('zlib');
const iconv = require('iconv-lite');


const encoding$decode = {
    'gzip': 'gunzipSync',
};

const charset$decode = {
    'utf-8': 'utf8',
};


module.exports = function (proxy, req, res) {
    let chunks = [];

    proxy.headers['access-control-allow-origin'] = '*';

    proxy.on('data', function (chunk) {
        chunks.push(chunk);
    });

    proxy.on('end', function () {
        let body = Buffer.concat(chunks);
        let encoding = proxy.headers['content-encoding'].toLowerCase();
        let type = proxy.headers['content-type'].toLowerCase();
        let decode = encoding$decode[encoding];

        if (decode) {
            decode = zlib[decode];
            body = decode(body);
        }


        if (type.includes('charset=utf-8')) {
            body = iconv.decode(body, 'utf8');
        }
        else {
            body = body.toString();
        }

        let json = JSON.parse(body);

        File.writeJSON(`output/proxy/${req.url}.json`, json);

    });


};