
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

const applyFormat = (logger, name, args) => {

    let format = logger.format[name] || defautFormat[name]

    return format ? format(...args) : args

}

const log = (logger, currentLevel, ...args) => {

    let { prefix, format, currentFormat } = logger

    logger.currentLevel = currentLevel
    Logger.current = logger

    args = applyFormat(logger, 'default', args)

    args = applyFormat(logger, currentFormat, args)

    if (prefix)
        args.unshift(prefix)
        
    logger.out(...args)

    return logger

}

export default class Logger {

    static setFormat(format) {

        Object.assign(defautFormat, format)

        return Logger

    }

    constructor({ prefix, level = 'debug', format = null } = {}) {

        this.prefix = prefix
        this.format = {

            default: null,

        }

        this.setLevel(level)
        this.setFormat(format)

        this.proxied = new Proxy(this, {

            get: (target, key) => {

                let currentFormat = (key in target.format || key in defautFormat) && key

                target.currentFormat = currentFormat

                if (currentFormat)
                    return target

                if (key in Levels) {

                    target.currentLevel = key

                }

                return target[key]

            },

        })

        return this.proxied

    }

    setLevel(level) {

        for (let [key, index] of Object.entries(Levels)) {

            Object.defineProperty(this, key, {

                value: Levels[level] > index ? noop : log.bind(null, this, key),
                configurable: true,

            })

        }

        Object.assign(this, { level })

        return this

    }

    get verbose() { return this.level === Levels.debug }
    set verbose(value) { this.setLevel(value ? 'debug' : 'info') }

    setFormat(format) {

        Object.assign(this.format, format)

        return this

    }

    out(...args) {

        console.log(...args)

    }

}
