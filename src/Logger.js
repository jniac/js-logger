
const Levels = {

    debug: 0,
    info: 1,
    warn: 2,
    error: 3,

}

const defautFormat = {

    ms: (logger, time, ...args) => [...args, time.toFixed(1) + 'ms'],

}

const noop = () => {}
const identity = (...args) => args

const log = (logger, level, ...args) => {

    let { format, currentFormat } = logger

    if (format.prefix)
        args.unshift(prefix)

    if (format.default)
        args = format.default(logger, ...args)

    if (currentFormat)
        args = format[currentFormat](logger, ...args)

    logger.out(...args)

    return logger

}

export default class Logger {

    constructor(level = 'debug', format = defautFormat) {

        this.format = {

            default: null,
            prefix: null,

        }

        this.setLevel(level)
        this.setFormat(format)

        this.proxied = new Proxy(this, {

            get: (target, key) => {

                target.currentFormat = key in target.format && key

                if (key in target.format)
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
