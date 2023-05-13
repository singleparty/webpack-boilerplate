const compressing = require('compressing')
const path = require('node:path')
const fse = require('fs-extra')

const tarStream = new compressing.tar.Stream()
origin_finalize = tarStream._finalize
tarStream._finalize = () => {
  debugger
}

const destStream = fse.createWriteStream(path.join(__dirname, 'destination.tar'))
tarStream.pipe(destStream).on('end', () => {
  debugger
})

new compressing.tgz.UncompressStream({ source: path.join(__dirname, './src.tar') })
  .on('error', (err) => {
    debugger
  })
  .on('finish', () => {
    debugger
    origin_finalize.call(tarStream)
  })
  .on('entry', function (header, stream, next) {
    stream.on('end', next)

    if (header.type === 'file') {
      tarStream.addEntry(stream, {
        relativePath: path.basename(header.name),
        suppressSizeWarning: true
      })
    } else {
      stream.resume()
    }
  })
