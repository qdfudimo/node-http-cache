const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3010;

http.createServer((request, response) => {
    console.log('request url: ', request.url);
    if (request.url === '/script.js') {
        const filePath = path.join(__dirname, request.url); // 拼接当前脚本文件地址
        const stat = fs.statSync(filePath); // 获取当前脚本状态
        const mtime = stat.mtime.toGMTString() // 文件的最后修改时间
        const requestMtime = request.headers['if-modified-since']; // 来自浏览器传递的值

        console.log(stat);
        console.log(mtime, requestMtime);

        // 走协商缓存
        if (mtime === requestMtime) {
            response.statusCode = 304;
            response.end();
            return;
        }

        // 协商缓存失效，重新读取数据设置 Last-Modified 响应头
        console.log('协商缓存 Last-Modified 失效');
        response.writeHead(200, {
            'Content-Type': 'text/javascript',
            'Last-Modified': mtime,
            'Cache-Control': 'no-cache'
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(response);
    }
    if (request.url === '/') {
        // const html = fs.readFileSync('./index.html', 'utf-8');
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
        // console.log(html);
        response.writeHead(200, {
            'Content-Type': 'text/html',
        });
        response.end(html);
    }
}).listen(port);

console.log('server listening on port ', port);