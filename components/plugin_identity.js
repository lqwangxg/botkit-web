module.exports = function(controller) {

  controller.middleware.spawn.use(function(bot, next) {

      bot.identity = {
          name: 'Botkit for Web',
          id: 'web',
      }

  });

  // SAVE USER INFO
  controller.middleware.receive.use(function(bot, message, next) {
    // ユーザ情報存在しない場合、処理飛ばす
    if (!message.user) {
      next();
      return;
    }

    controller.storage.users.get(message.user_profile, function(err, user) {
      if (!user) {
        user = {
          id: message.user_profile.id,
          attributes: {},
        }
      }

      user.name = message.user_profile.name;
      for (var key in message.user) {
        if (key != 'name' && key != 'id') {
          user.attributes[key] = message.user[key];
        }
      }

      controller.storage.users.save(user, function(err) {
        next();
      });

    });
    
  });

}
