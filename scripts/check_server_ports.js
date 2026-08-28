import http from 'http';

async function checkPort(port) {
    return new Promise(resolve => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            console.log(`Port ${port} responded with status:`, res.statusCode);
            resolve(true);
        });
        req.on('error', (e) => {
            console.log(`Port ${port} error:`, e.message);
            resolve(false);
        });
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    await checkPort(5173);
    await checkPort(3000);
    await checkPort(8080);
}
main();
