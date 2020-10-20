
module.exports = (info) => {
    console.log(`[RATE LIMIT] Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
}