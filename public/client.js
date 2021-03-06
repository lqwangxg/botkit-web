    var converter = new showdown.Converter();
    converter.setOption('openLinksInNewWindow', true);

    var Botkit = {
      config: {
        ws_url: (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host,
        reconnect_timeout: 3000,
        max_reconnect: 5
      },
      options: {
        sound: false,// true will play sound on received a message.
        use_sockets: true
      },
      reconnect_count: 0,
      guid: null,
      current_user: null,
      askHuman: false,
      callbackUser: null,

      on: function(event, handler) {
        this.message_window.addEventListener(event, function(evt) {
          handler(evt.detail);
        });
      },
      trigger: function(event, details) {
        var event = new CustomEvent(event, {
          detail: details
        });
        this.message_window.dispatchEvent(event);
      },
      request: function(url, body) {
        var that = this;
        return new Promise(function(resolve, reject) {
          var xmlhttp = new XMLHttpRequest();

          xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
              if (xmlhttp.status == 200) {
                var response = xmlhttp.responseText;
                var message = null;
                try {
                  message = JSON.parse(response);
                } catch (err) {
                  reject(err);
                  return;
                }
                resolve(message);
              } else {
                reject(new Error('status_' + xmlhttp.status));
              }
            }
          };

          xmlhttp.open("POST", url, true);
          xmlhttp.setRequestHeader("Content-Type", "application/json");
          xmlhttp.send(JSON.stringify(body));
        });

      },
      send: function(text, e) {
	      var that = this;
        if (e) e.preventDefault();
        if (!text) {
          return;
        }
        console.log(`send text: ${text}`);
        //送信者は誰？
        console.log(`送信者：`,that.current_user.id);

        var message = {
          type: 'outgoing', //右寄せ表示, default　incoming左寄せ
          user: that.current_user.id,
          text: text,
          askHuman: that.askHuman,
          answerUser: that.answerUser,
          callbackUser: that.callbackUser
        };
        
        this.clearReplies();
        //show in webclient contentContainer.
        console.log(`Clientへ送信内容：`, message);
        that.renderMessage(message);
        var message_s={
          type: 'message',
          text: text,
          user: that.current_user.id,
          user_profile:  that.current_user,
          askHuman: that.askHuman,
          answerUser: that.answerUser,
          callbackUser: that.callbackUser,
          channel: this.options.use_sockets ? {type:'socket', id: that.current_user.id } : {type:'webhook', id: that.current_user.id }
        }
        
        console.log(`Serverへ送信内容：`, message_s);
        // send to chat server.
        that.deliverMessage(message_s);

        this.input.value = '';
        this.trigger('sent', message);

        return false;
      },
      deliverMessage: function(message) {
        if (this.options.use_sockets) {
          this.socket.send(JSON.stringify(message));
        } else {
          this.webhook(message);
        }
        //console.log(`deliverMessage`, message);console.log(`deliverMessage`, message);
      },
      getHistory: function() {
        var that = this;
        if (that.current_user) {
          that.request('/botkit/history', {
            user: that.current_user.id
          }).then(function(history) {
            if (history.success) {
              that.trigger('history_loaded', history.history);
            } else {
              that.trigger('history_error', new Error(history.error));
            }
          }).catch(function(err) {
            that.trigger('history_error', err);
          });
        }
      },
      webhook: function(message) {
        var that = this;

        that.request('/botkit/receive', message).then(function(message) {
          that.trigger(message.type, message);
        }).catch(function(err) {
          that.trigger('webhook_error', err);
        });

      },
      connect: function(userid) {
        console.log('connect user:', userid);
        var that = this;
        if (!userid) {
          userid = Math.random().toString().substr(2,10);
        }
        
        const cookieID = 'botkit_userid_'+ userid;
        Botkit.setCookie(cookieID, userid, 1);
        that.current_user = {
          id:userid,
          timezone_offset: new Date().getTimezoneOffset()
        };
        console.log('connect cookieid:', cookieID);
        console.log('CONNECT WITH USER:', userid);
        
        // connect to the chat server!
        if (that.options.use_sockets) {
          that.connectWebsocket(that.config.ws_url);
        } else {
          that.connectWebhook();
        }

      },
      connectWebhook: function() {
        var that = this;
        if (Botkit.getCookie('botkit_guid')) {
          that.guid = Botkit.getCookie('botkit_guid');
          connectEvent = 'welcome_back';
        } else {
          that.guid = that.generate_guid();
          Botkit.setCookie('botkit_guid', that.guid, 1);
        }

        that.getHistory();

        // connect immediately
        that.trigger('connected', {});
        that.webhook({
          type: connectEvent,
          user: that.current_user.id,
          channel:{type:'webhook', id: that.current_user.id } 
        });

      },
      connectWebsocket: function(ws_url) {
        var that = this;
        // Create WebSocket connection.
        that.socket = new WebSocket(ws_url);
        console.log(`hello, connect to server......`);

        var connectEvent = 'hello';
        var cookieID ="";
        if(that.current_user && that.current_user.id){
          cookieID = 'botkit_userid_'+ that.current_user.id;
        }
        console.log('connectWebsocket by======== cookieID:',cookieID);

        if (Botkit.getCookie(cookieID)) {
          that.guid = Botkit.getCookie(cookieID);
          connectEvent = 'welcome_back';
        //} else {
        //  that.guid = that.generate_guid();
        //  Botkit.setCookie('botkit_guid', that.guid, 1);
        }
         

        that.getHistory();

        // Connection opened
        that.socket.addEventListener('open', function(event) {
          console.log('CONNECTED TO SOCKET');
          that.reconnect_count = 0;
          that.trigger('connected', event);
          that.deliverMessage({
            type: connectEvent,
            user: that.current_user.id,
            user_profile: that.current_user,
            channel:{type:'socket', id: that.current_user.id } 
          });
        });
        console.log('connectWebsocket user_profile:', that.current_user);


        that.socket.addEventListener('error', function(event) {
          console.error('ERROR', event);
        });

        that.socket.addEventListener('close', function(event) {
          console.log('SOCKET CLOSED!');
          that.trigger('disconnected', event);
          if (that.reconnect_count < that.config.max_reconnect) {
            setTimeout(function() {
              console.log('RECONNECTING ATTEMPT ', ++that.reconnect_count);
              that.connectWebsocket(that.config.ws_url);
            }, that.config.reconnect_timeout);
          } else {
            that.message_window.className = 'offline';
          }
        });

        // Listen for messages
        that.socket.addEventListener('message', function(event) {
          var message = null;
          try {
            message = JSON.parse(event.data);
          } catch (err) {
            that.trigger('socket_error', err);
            return;
          }

          that.trigger(message.type, message);
        });
      },
      clearReplies: function() {
        this.replies.innerHTML = '';
      },
      quickReply: function(payload) {
        this.send(payload);
      },
      focus: function() {
        this.input.focus();
      },
      renderMessage: function(message) {
        var that = this;
        if (!that.next_line) {
          that.next_line = document.createElement('div');
          that.message_list.appendChild(that.next_line);
        }
        //console.log("message:", message);
        if (message.text) {
          var messageIntent ;
          var username;
          var className;
          if(message.user){
            className = "guest";
            if(message.isSend){
              username = "ChatBot";
            }else{
              username = message.user;
            }

            if(message.answerUser){
              username = message.user;
              className = "human-user"

            }else if(message.to && message.user != message.to){
              className = "chatbot-user"
              username = "["+ message.user + " -> "+ message.to +"]"
            }else if(message.from && message.user != message.from){
              className = "user-chatbot"
              username = "["+ message.from + " -> "+ message.user +"]"
            }
            
          }
          //const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
          const nowDate = new Date();
          const nowString = nowDate.toLocaleDateString() + " " + nowDate.toLocaleTimeString();

          if(message.text){
            messageIntent = "<div class='"+className+"'>"+ nowString+ " " + username + ":</div>";
          }
          message.html = messageIntent + converter.makeHtml(message.text);
        }
        //console.log('html:', message.html);

        that.next_line.innerHTML = that.message_template({
          message: message
        });
        if (!message.isTyping) {
          delete(that.next_line);
        }
      },
      triggerScript: function(script, thread) {
        this.deliverMessage({
          type: 'trigger',
          user: this.guid,
          script: script,
          thread: thread,
          channel:{type:'socket', id: this.guid } 
        });
      },
      identifyUser: function(user) {
        user.timezone_offset = new Date().getTimezoneOffset();
        
        this.deliverMessage({
          type: 'identify',
          user: user,
          user_profile: {id: user},
          channel:{type:'socket', id: user } 
        });
      },
      receiveCommand: function(event) {
        console.log(`receiveCommand event:`, event);
        switch (event.data.name) {
          case 'trigger':
            // tell Botkit to trigger a specific script/thread
            console.log('TRIGGER', event.data.script, event.data.thread);
            Botkit.triggerScript(event.data.script, event.data.thread);
            break;
          case 'identify':
            // link this account info to this user
            console.log('IDENTIFY', event.data.user);
            Botkit.identifyUser(event.data.user);
            break;
          case 'connect':
            console.log(`receiveCommand on connect to :` + event.data.user);
            // link this account info to this user
            Botkit.connect(event.data.user);
            break;
          default:
            console.log('UNKNOWN COMMAND', event.data);
        }
      },
      sendEvent: function(event) {

        if (this.parent_window) {
          this.parent_window.postMessage(event, '*');
        }

      },
      setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      },
      getCookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      },
      generate_guid: function() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        //return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        //  s4() + '-' + s4() + s4() + s4();
        return s4() + s4() 
      },
      boot: function(user) {

        console.log('Booting up');

        var that = this;


        that.message_window = document.getElementById("message_window");

        that.message_list = document.getElementById("message_list");

        var source = document.getElementById('message_template').innerHTML;
        that.message_template = Handlebars.compile(source);

        that.replies = document.getElementById('message_replies');

        that.input = document.getElementById('messenger_input');

        that.focus();

        that.on('connected', function() {
          that.message_window.className = 'connected';
          that.input.disabled = false;
          that.sendEvent({
            name: 'connected'
          });
        })

        that.on('disconnected', function() {
          that.message_window.className = 'disconnected';
          that.input.disabled = true;
        });

        that.on('webhook_error', function(err) {

          alert('Error sending message!');
          console.error('Webhook Error', err);

        });

        that.on('typing', function() {
          that.clearReplies();
          that.renderMessage({
            isTyping: true
          });
        });

        that.on('sent', function() {
          if (that.options.sound) {
            var audio = new Audio('sent.mp3');
            audio.play();
          }
        });

        that.on('message', function() {
          if (that.options.sound) {
            var audio = new Audio('beep.mp3');
            audio.play();
          }
        });

        that.on('message', function(message) {
          console.log("message from server:", message);
          that.askHuman = !!message.askHuman;
          that.answerUser = !!message.answerUser;
          that.callbackUser = null;
          if(message.text.match(/(bye|quit|exit)/i)){
            that.answerUser = false;
            that.askHuman = false;
          }else if(message.askHuman){
            that.callbackUser = message.callbackUser;
            that.answerUser = true;
          }
          that.renderMessage(message);

        });

        that.on('message', function(message) {
          if (message.goto_link) {
            window.location = message.goto_link;
          }
        });


        that.on('message', function(message) {
          that.clearReplies();
          if (message.quick_replies) {

            var list = document.createElement('ul');

            var elements = [];
            for (var r = 0; r < message.quick_replies.length; r++) {
              (function(reply) {

                var li = document.createElement('li');
                var el = document.createElement('a');
                el.innerHTML = reply.title;
                el.href = '#';

                el.onclick = function() {
                  that.quickReply(reply.payload);
                }

                li.appendChild(el);
                list.appendChild(li);
                elements.push(li);

              })(message.quick_replies[r]);
            }

            that.replies.appendChild(list);

            // uncomment this code if you want your quick replies to scroll horizontally instead of stacking
            // var width = 0;
            // // resize this element so it will scroll horizontally
            // for (var e = 0; e < elements.length; e++) {
            //     width = width + elements[e].offsetWidth + 18;
            // }
            // list.style.width = width + 'px';

            if (message.disable_input) {
              that.input.disabled = true;
            } else {
              that.input.disabled = false;
            }
          } else {
            that.input.disabled = false;
          }
        });

        that.on('history_loaded', function(historyMessage) {
          if (history) {
            for (var m = 0; m < historyMessage.length; m++) {
              that.renderMessage({
                text: historyMessage[m].text,
                stime: historyMessage[m].stime,
                type: historyMessage[m].type == 'message_received' ? 'outgoing' : 'incoming', // set appropriate CSS class
              });
            }
          }
        });


        if (window.self !== window.top) {
          // this is embedded in an iframe.
          // send a message to the master frame to tell it that the chat client is ready
          // do NOT automatically connect... rather wait for the connect command.
          that.parent_window = window.parent;
          window.addEventListener("message", that.receiveCommand, false);
          that.sendEvent({
            type: 'event',
            name: 'booted'
          });
          console.log('Messenger booted in embedded mode');

        } else {

          console.log('Messenger booted in stand-alone mode');
          // this is a stand-alone client. connect immediately.
          that.connect(user);
        }

        return that;
      }
    };


    (function() {
      var user = {};
      var roles = document.getElementsByName('role');
      if(roles && roles.length >0 ){
        var role = roles[0].content;
        user = {
          id: role
        }
        console.log('role:', role);
      }
      
      // your page initialization code here
      // the DOM will be available here
      Botkit.boot(user.id);
    })();
