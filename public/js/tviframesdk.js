var TV = (function() {
  var self = {};

  self.opts = {};

  self.callbacks = {};

  self.init = function(opts) {
    defaults = {
      api_url: 'https://api.thingiverse.com',
      target_url: 'http://thingiverse.com',
      target: parent
    };
    
    $.extend(defaults, opts);
    self.opts = defaults;
    
    $.receiveMessage(
      function(msg) {
        self.receiveMessage(msg.data);
      },
      self.opts.target_url
    );
  }

  // communication

  self.receiveMessage = function(data) {
    try {
        msg = JSON.parse(data);
    } catch (e) {
        return false;
    }
      
    if ($.inArray(msg.callback, Object.keys(self.callbacks)) > -1) {
      self.callbacks[msg.callback](msg.result);
      delete self.callbacks[msg.callback];
    } else {
      self.log('Received Unknown Callback: "' + msg.callback + '" Data: ' + data);
    }
  }
  
  self.sendMessage = function(data, callback) {
    data.params.access_token = self.opts.access_token;
    data.params.callback = TV.guid();
    self.callbacks[data.params.callback] = callback;
    
    msg = JSON.stringify(data);
    
    $.postMessage(
      msg,
      self.opts.target_url,
      self.opts.target
    );
  }

  // dialogs

  /*
  Dialog Names:
    address
      returns: address_id
    payment
      params: thing_id - int Thing ID
              amount - int Total amount in USD
              charges - object of charges breakdown {'Fee Name': int amount in USD}
                      - Use 'Shipping' for shipping charges
              address_id - int address id to use for shipping address
      returns: order_id or error string
  */
  
  self.dialog = function(dialog_name, params, callback) {
    if (typeof params === 'function') {
      _callback = params;
      _params = callback || {};
    } else {
      _callback = callback;
      _params = params || {};
    }
    
    self.sendMessage(
      {
        cmd: dialog_name,
        params: _params
      },
      _callback
    );
  }

  // api
  
  self.api = function(path, params, callback) {
    if (typeof params === 'function') {
      _callback = params;
      _params = callback || {};
    } else {
      _callback = callback;
      _params = params || {};
    }
    
    if (params.method) {
      method = _params.method;
    } else {
      method = 'GET';
    }
    
    if (/^http.*/.test(path)) {
      url = path;
    } else {
      url = self.opts.api_url + path;
    }
    
    $.ajax({
      url: url,
      type: method,
      data: _params,
      dataType: 'json',
      headers: { 'Authorization' : 'Bearer ' + self.opts.access_token },
      success: _callback
    });
  }

  // utility

  self.log = function (msg) {
    if (window.console) {
      console.log('[APP] ' + msg);
    }
  }  

  self.guid = function() {
    return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
  }

  return self;
}());
