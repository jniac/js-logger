# js-logger

proposition for as js Logger :

```javascript

    let logger = new Logger()

    logger.debug('hello!')               // "hello!"

```

### levels:

```javascript

    let logger = new Logger()
    let count = 1

    logger.debug('hello!', count++)       // "hello! 1"
    logger.info('hello!', count++)        // "hello! 2"
    logger.warn('hello!', count++)        // "hello! 3"
    logger.error('hello!', count++)       // "hello! 4"

    logger.setLevel('warn')

    logger.debug('hello!', count++)       // muted!
    logger.info('hello!', count++)        // muted!
    logger.warn('hello!', count++)        // "hello! 7"
    logger.error('hello!', count++)       // "hello! 8"

```

### override:

```javascript

    logger.out = (...args) => {

        console.log('a log is coming...')
        console.log(...args)

    }

    logger.debug('hello!')       // "a log is coming..." & "hello!"

```

### formats:

```javascript

    logger.format.default = (logger, ...args) => [logger.currentLevel.toUpperCase(), ...args]

    logger.debug('hello!')      // "DEBUG hello!"
    logger.warn('be careful!')  // "WARN be careful!"

```

```javascript

    logger.setFormat({

        time: (logger, ...args) => [new Date().toTimeString().slice(0, 8), ...args],

        caps: (logger, ...args) => args.map(value => String(value).toUpperCase()),

        red: (logger, ...args) => [`%c${args.join(' ')}`, 'font-size: 24px; color: red;']

    })

    logger.time.debug('hello', true, false)     // "15:34:21 hello true false"
    logger.caps.debug('hello', true, false)     // "HELLO TRUE FALSE"
    logger.red.debug('hello', true, false)      // "hello true false" (big & red in the browser console)

```
