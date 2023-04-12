const ExcelJS = require('exceljs')
const path = require('path')

async function main() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(path.join(__dirname, './错误码总表.xlsx'))
  const output = {}
  workbook.eachSheet((worksheet, sheetId) => {
    const { name } = worksheet
    worksheet.eachRow((row, rowNumber) => {
      const procSts = row.getCell(1).value.trim()
      const procCd = String(row.getCell(2).value).trim()
      const text = row.getCell(3).value
      const scene = row.getCell(4).value ?? ''
      const origin = name
      output[procSts] ||= {}
      output[procSts][procCd] ||= []
      const targetList = output[procSts][procCd]
      const isExist = targetList.find((item) => item.text === text)
      if (!isExist) {
        targetList.push({
          text,
          scene,
          origin
        })
      }
    })
  })
  const rows = []
  const kfzy = require('./kfzy.json').reduce((a, b) => {
    a[b[0]] = b[1]
    return a
  }, {})
  Object.keys(output).forEach((procSts) => {
    const procStsData = output[procSts]
    const sortProcCd = Object.keys(procStsData).sort((a, b) => a - b)
    sortProcCd.forEach((procCd) => {
      let data = procStsData[procCd]
      if (data.length > 1) {
        const _tmp = Array.from(new Set(data.map((item) => item.origin)))
        if (_tmp.includes('backend') && _tmp.length > 1) {
          // 移除 backend 文案
          data = data.filter((item) => item.origin !== 'backend')
        }
      }
      let roadmap = ''
      if (procSts === 'PGO00') {
        roadmap = JSON.stringify(kfzy[procCd] ?? '').match(/\"(.*)\"/)[1]
      }

      data.forEach((each, index) => {
        rows.push([procSts, procCd, each.text, each.origin, each.scene, index === 0 ? roadmap : ''])
      })
    })
  })

  const outputWorkbook = new ExcelJS.Workbook()
  const outputWorksheet = outputWorkbook.addWorksheet('错误码')
  outputWorksheet.columns = [
    { header: '所属系统', key: 'procSts', width: 10 },
    { header: '错误码', key: 'procCd', width: 10 },
    { header: '文案', key: 'text', width: 80 },
    { header: '文案来源', key: 'origin', width: 10 },
    { header: '场景', key: 'scene', width: 10 },
    { header: '开发指引文案', key: 'roadmap', width: 80 }
  ]
  outputWorksheet.addRows(rows)
  await outputWorkbook.xlsx.writeFile(path.join(__dirname, 'output.xlsx'))
}

main()
