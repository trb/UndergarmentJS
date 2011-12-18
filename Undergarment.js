(function($) {
    var parseArgs = function(args) {
        var data = args[0] || {};
        if (typeof data === 'function') {
            data = data();
        }
        
        return data;
    };
    
    var Connect = {
        connections: {},
        resources: {},
        templates: {},
        elements: {},
        events: {},
        
        handlerById: function(id) {
            var category = id.split(':')[0] + 's';
            if (this[category] === undefined) {
                throw 'Category must be one of: resource, template, '
                       + 'element or event; "' + category + '" given';
            }
            if (this[category][id] === undefined) {
                throw 'Target not found: ' + id;
            }
            return this[category][id];
        },
        
        interval: function(id, interval) {
            this_ = this;
            window.setInterval(function() {
                var handler = this_.handlerById(id);
                handler();
            }, interval);
        },
        
        _connect: function(id_source, id_target) {
            if (this.connections[id_source] === undefined) {
                this.connections[id_source] = $.Callbacks();
            }
            
            var handler = this.handlerById(id_target);
            this.connections[id_source].add(handler);
        },
        
        connect: function() {
            var usage = 'Wrong function signature for connect! ' +
                'Either connect(id_source, id_target) or ' +
                "connect({ 'id_source': 'id_target', .. })"; 
            
            if (arguments.length == 1) {
                if (typeof arguments[0] === 'object') {
                    for (var id_source in arguments[0]) {
                        this._connect(id_source, arguments[0][id_source]);
                    }
                } else {
                    throw usage; 
                }
            } else {
                this._connect(arguments[0], arguments[1]);
            }
        },
        
        trigger: function(event) {
            var data = arguments[1] || {};
            if (typeof data === 'function') {
                data = data();
            }
            
            if (this.connections[event] !== undefined) {
                this.connections[event].fire(data);
            }
        },
        
        addResourceUrl: function(id, url) {
            var data = arguments[1] || {};
            var method = arguments[2] || 'GET';
            
            if  (typeof data === 'function') {
                data = data();
            }
            
            this_ = this;
            this.resources[id] = function() {
                $.ajax(url, {
                    type: method.toUpperCase(),
                    data: data,
                    
                    success: function(data) {
                        this_.trigger(id, data);
                    },
                    error: function() {
                        throw 'Resource request went wrong, id/url: '
                            + id + '/' + url;
                    }
                });
            };
        },
        
        addResource: function(id, data) {
            this_ = this;
            this.resources[id] = function() {
                if (typeof data === 'function') {
                    var payload = data();
                } else {
                    var payload = {};
                }
                this_.trigger(id, data);
            };
        },
        
        addTemplate: function(id, htmlGenerator) {
            this_ = this;
            this.templates[id] = function() {
                var data = parseArgs(arguments);
                this_.trigger(id, htmlGenerator(data));
            };
        },
        
        addEvent: function(id, elementSelector, event) {
            var data = arguments[3] || {};
            this_ = this;
            $(elementSelector).on(event, function(eventObject) {
                eventObject.preventDefault();
                if (typeof data === 'function') {
                    var payload = data();
                } else {
                    var payload = data;
                }
                this_.trigger(id, payload);
            });
        },
        
        addElement: function(id, elementSelector) {
            var handler = arguments[2] || 'html';
            this.elements[id] = function() {
                var data = parseArgs(arguments);
                $(elementSelector)[handler](data);
            };
        }
    };
    
    window.Connect = Connect;
})(jQuery);