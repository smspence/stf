var syrup = require('stf-syrup')

var logger = require('../../../util/logger')
var wire = require('../../../wire')
var wireutil = require('../../../wire/util')

module.exports = syrup.serial()
  .dependency(require('./service'))
  .dependency(require('../support/router'))
  .dependency(require('../support/push'))
  .define(function(options, service, router, push) {
    var log = logger.createLogger('device:plugins:wakelock')

    router.on(wire.WakelockSetEnableMessage, function(channel, message) {
      var reply = wireutil.reply(options.serial)
      log.info('Setting Wakelock "%s"', message.enabled)
      if (!message.enabled) {
        service.releaseWakeLock()
          .timeout(30000)
          .then(function() {
            push.send([
              channel
            , reply.okay()
            ])
          })
          .catch(function(err) {
            log.error('Setting wakelock disabled failed', err.stack)
            push.send([
              channel
            , reply.fail(err.message)
            ])
          })
      } else {
        service.acquireWakeLock()
          .timeout(30000)
          .then(function() {
            push.send([
              channel
            , reply.okay()
            ])
          })
          .catch(function(err) {
            log.error('Setting wakelock enabled failed', err.stack)
            push.send([
              channel
            , reply.fail(err.message)
            ])
          })
      }
    })
  })
