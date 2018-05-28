
// https://github.com/jniac/js-logger

const Levels = {

    debug: 0,
    info: 1,
    warn: 2,
    error: 3,

}

const defautFormat = {

    ms: (time, ...args) => [...args, time.toFixed(1) + 'ms'],

}

const noop = () => {}
const identity = (...args) => args

const allowLog = (logger, currentLevel) => {

    let { level, parent } = logger

    return Levels[currentLevel] >= Levels[level] || (parent && allowLog(parent, currentLevel))

}

const applyFormat = (logger, name, args) => {

    let format = logger.format[name] || defautFormat[name]

    return format ? format(...args) : args

}

let currentLogger, currentFormat, currentLevel

const log = (...args) => {

    let { prefix, format } = currentLogger

    args = applyFormat(currentLogger, 'default', args)

    args = applyFormat(currentLogger, currentFormat, args)

    if (prefix)
        args.unshift(prefix)

    currentLogger.out(...args)

    // do not forget to reset the currentFormat
    currentFormat = null

    return currentLogger

}

export default class Logger {

    static setFormat(format) {

        Object.assign(defautFormat, format)

        return Logger

    }

    static get currentLogger() { return currentLogger }
    static get currentLevel() { return currentLevel }
    static get currentFormat() { return currentFormat }

    constructor({ prefix, level = 'debug', format = null, parent = null } = {}) {


        Object.assign(this, {

            prefix,
            level,
            parent,
            format: {},

        })

        this.setFormat(format)

        this.proxied = new Proxy(this, {

            get: (target, key) => {

                // 1
                // check if key match a property (instance or prototype)
                if (key in target || key in Logger.prototype)
                    return target[key]

                // 2
                // if not, define the target as the current logger:
                currentLogger = target

                // 3
                // check and define the currentLevel, if ok, return log method (or noop according to the level constraint)
                currentLevel = (key in Levels) && key

                if (currentLevel)
                    return allowLog(currentLogger, currentLevel) ? log : noop

                // 4
                // the log method was not invoked, maybe the key refers to a format, if so, activate the format
                currentFormat = (key in target.format || key in defautFormat) && key

                if (currentFormat)
                    return target.proxied

                // 4 nothing matched, create a new property
                return target[key]

            },

        })

        return this.proxied

    }

    get verbose() { return this.level === Levels.debug }
    set verbose(value) { this.level = value ? 'debug' : 'info' }

    setFormat(format) {

        Object.assign(this.format, format)

        return this

    }

    setParent(parent) {

        return Object.assign(this, { parent })

    }

    out(...args) {

        console.log(...args)

    }

}
