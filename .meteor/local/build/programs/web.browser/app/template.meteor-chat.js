(function(){
Template.body.addContent((function() {
  var view = this;
  return Spacebars.include(view.lookupTemplate("chat"));
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("chat");
Template["chat"] = new Template("Template.chat", (function() {
  var view = this;
  return HTML.DIV({
    "class": "container"
  }, "\n\n        ", HTML.DIV({
    "class": "navbar navbar-fixed-top"
  }, "\n            ", HTML.DIV({
    "class": "navbar-inner"
  }, "\n                ", HTML.Raw('<a class="brand" href="#">MeteorChat</a>'), "\n                ", HTML.Raw('<ul class="nav">\n                    <li><a href="https://github.com/dasniko/meteor-chat" target="_blank">Source</a></li>\n                    <li><a href="http://www.n-k.de" target="_blank">Contact</a></li>\n                </ul>'), "\n                ", HTML.UL({
    "class": "nav pull-right"
  }, "\n                    ", HTML.LI(HTML.A({
    href: "http://www.meteor.com",
    target: "_blank"
  }, "Meteor release ", Blaze.View("lookup:release", function() {
    return Spacebars.mustache(view.lookup("release"));
  }))), "\n                    ", HTML.LI(HTML.A(Blaze._TemplateWith(function() {
    return {
      align: Spacebars.call("right")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("loginButtons"));
  }))), "\n                "), "\n            "), "\n        "), "\n\n        ", Blaze.If(function() {
    return Spacebars.call(view.lookup("currentUser"));
  }, function() {
    return [ "\n        ", HTML.DIV({
      "class": "row-fluid"
    }, "\n            ", HTML.DIV({
      "class": "span12 well"
    }, "\n                ", Spacebars.include(view.lookupTemplate("input")), "\n            "), "\n        "), "\n        ", HTML.DIV({
      "class": "row-fluid"
    }, "\n            ", HTML.DIV({
      "class": "span8 well"
    }, "\n                ", Spacebars.include(view.lookupTemplate("messages")), "\n            "), "\n            ", HTML.DIV({
      "class": "span4 well"
    }, "\n                ", Spacebars.include(view.lookupTemplate("rooms")), "\n            "), "\n        "), "\n        " ];
  }, function() {
    return [ "\n        ", HTML.DIV({
      "class": "hero-unit"
    }, "\n            ", HTML.H1("Welcome to MeteorChat"), "\n            ", HTML.P("Please login!"), "\n        "), "\n        " ];
  }), "\n\n    ");
}));

Template.__checkName("input");
Template["input"] = new Template("Template.input", (function() {
  var view = this;
  return HTML.Raw('<input type="text" id="msg" placeholder="Your message goes here..." style="width: 50%; margin-bottom: 0px">\n    <input type="button" value="Send message" class="btn btn-primary sendMsg">');
}));

Template.__checkName("messages");
Template["messages"] = new Template("Template.messages", (function() {
  var view = this;
  return [ HTML.H4("Room: ", Blaze.View("lookup:roomname", function() {
    return Spacebars.mustache(view.lookup("roomname"));
  })), "\n    ", HTML.DIV({
    id: "messages",
    style: "background-color: #ffffff; border: 1px solid darkgray; max-height: 200px; overflow: auto"
  }, "\n        ", Blaze.Each(function() {
    return Spacebars.call(view.lookup("messages"));
  }, function() {
    return [ "\n            ", Spacebars.include(view.lookupTemplate("message")), "\n        " ];
  }), "\n    ") ];
}));

Template.__checkName("message");
Template["message"] = new Template("Template.message", (function() {
  var view = this;
  return HTML.P(HTML.STRONG(Blaze.View("lookup:user", function() {
    return Spacebars.mustache(view.lookup("user"));
  })), " ", HTML.SPAN({
    style: "font-size: 0.7em; color: darkgray"
  }, "(", Blaze.View("lookup:timestamp", function() {
    return Spacebars.mustache(view.lookup("timestamp"));
  }), ")"), ": ", HTML.I(Blaze.View("lookup:msg", function() {
    return Spacebars.mustache(view.lookup("msg"));
  })));
}));

Template.__checkName("rooms");
Template["rooms"] = new Template("Template.rooms", (function() {
  var view = this;
  return [ HTML.Raw("<h4>Join a room:</h4>\n    "), HTML.UL("\n    ", Blaze.Each(function() {
    return Spacebars.call(view.lookup("rooms"));
  }, function() {
    return [ "\n        ", Spacebars.include(view.lookupTemplate("room")), "\n    " ];
  }), "\n    ") ];
}));

Template.__checkName("room");
Template["room"] = new Template("Template.room", (function() {
  var view = this;
  return HTML.LI({
    style: function() {
      return [ "cursor: pointer; ", Spacebars.mustache(view.lookup("roomstyle")) ];
    }
  }, Blaze.View("lookup:roomname", function() {
    return Spacebars.mustache(view.lookup("roomname"));
  }));
}));

})();
