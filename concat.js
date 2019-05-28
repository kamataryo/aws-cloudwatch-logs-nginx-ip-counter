const { promisify } = require('util')
const fs = require('fs')
const { LOG_STREAM_NAME } = process.env
const readdir = promisify(fs.readdir)
const readfile = promisify(fs.readFile)

const main = async () => {
  const dirs = await readdir(`./logs/${LOG_STREAM_NAME}`)

  const logs = (await Promise.all(
    dirs.map(dir => readfile(`./logs/${LOG_STREAM_NAME}/${dir}`))
  )).flatMap(data => JSON.parse(data.toString()).events)

  const ips = logs
    .filter(log => log.message.includes('"POST /app/form-free '))
    .map(log => {
      return {
        timestamp: log.timestamp,
        ip: log.message.match(
          /^([12]?[0-9]?[0-9]\.[12]?[0-9]?[0-9]\.[12]?[0-9]?[0-9]\.[12]?[0-9]?[0-9])/
        )[0]
      }
    })

  const summary = ips.reduce(
    (prev, { ip }) => ({ ...prev, [ip]: (prev[ip] || 0) + 1 }),
    {}
  )

  total = ips.length

  const minTime = ips.reduce(
    (prev, { timestamp }) => Math.min(prev, timestamp),
    ips[0].timestamp
  )

  const maxTime = ips.reduce(
    (prev, { timestamp }) => Math.max(prev, timestamp),
    ips[0].timestamp
  )

  const diff = 1000 * 3600 * 9
  console.log(summary, {
    total,
    minTime: new Date(minTime + diff),
    maxTime: new Date(maxTime + diff)
  })
}

// go!
main()
