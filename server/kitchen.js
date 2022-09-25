#!/usr/bin/env node

var amqp = require("amqplib/callback_api");

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Type: food [Desserts] [Thai dishes] [Italian dishes] [drinks]");
  process.exit(1);
}

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    // var queue = 'order_queue';

    // channel.assertQueue(queue, {
    //   durable: true
    // });
    // channel.prefetch(1);
    // console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    // channel.consume(
    //   queue,
    //   function (msg) {
    //     var secs = msg.content.toString().split(".").length - 1;
    //     console.log(" [x] Received");
    //     console.log(JSON.parse(msg.content));

    //     setTimeout(function () {
    //       console.log(" [x] Done");
    //       channel.ack(msg);
    //     }, secs * 1000);
    //   },
    //   {
    //     noAck: false,
    //   }
    // );

    var exchange = "order_routing";

    channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      function (error2, q) {
        if (error2) {
          throw error2;
        }
        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          args[0]
        );

        args.forEach(function (severity) {
          channel.bindQueue(q.queue, exchange, severity);
        });

        channel.consume(
          q.queue,
          function (msg) {
            console.log(
              " [x] %s: '%s'",
              msg.fields.routingKey,
              msg.content.toString()
            );
            channel.ack(msg);
          },
          {
            noAck: false,
          }
        );
      }
    );
  });
});
