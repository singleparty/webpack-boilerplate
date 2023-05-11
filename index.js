const compressing = require('compressing')
const path = require('node:path')
const fse = require('fs-extra')

const tarStream = new compressing.tar.Stream()
/* tarStream.addEntry(fse.createReadStream(path.join(__dirname, './src/App.vue')), {
  relativePath: 'fff/App.vue'
});
tarStream.addEntry(fse.createReadStream(path.join(__dirname, './src/main.ts')), {
  relativePath: 'fff/main.ts'
}); */
const buffers = []
new compressing.tgz.UncompressStream({ source: path.join(__dirname, './src.tar') })
  .on('error', (err) => {
    debugger
    console.log(err)
  })
  .on('finish', () => {
    debugger
    buffers.forEach(([buffer, name]) => {
      tarStream.addEntry(buffer, {
        relativePath: name
      })
    })
    
    const destStream = fse.createWriteStream(path.join(__dirname, 'destination.tar'))
    tarStream.pipe(destStream)
  })
  .on('entry', function (header, stream, next) {
    stream.on('end', next)

    // header.type => file | directory
    // header.name => path name

    if (header.type === 'file') {
      var tmp = []
      stream.on('data', function (d) {
        tmp.push(d)
      })
      stream.on('end', function () {
        buffers.push([Buffer.concat(tmp), path.basename(header.name)])
      })
      // stream.pipe(fs.createWriteStream(path.join(destDir, header.name)));
    } else {
      stream.resume()
      /* mkdirp(path.join(destDir, header.name), (err) => {
        if (err) return handleError(err)
        stream.resume()
      }) */
    }
  })
