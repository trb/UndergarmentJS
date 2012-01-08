var ug = (function($) {
    var parseArgs = function(args) {
        var data = args[0] || {};
        if (typeof data === 'function') {
            data = data();
        }
        
        return data;
    };
    
    var Undergarment = {
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
            var data = arguments[2] || {};
            
            this_ = this;
            window.setInterval(function() {
                this_.trigger(id, data);
            }, interval);
        },
        
        _connect: function(id_source, id_target) {
            var handler = this.handlerById(id_target);
            
            this.on(id_source, handler);
        },
        
        connect: function() {
            var usage = 'Wrong function signature for connect! ' +
                'Either connect(id_source, id_target) or ' +
                "connect([ 'id_source', 'id_target', .. ])"; 
            
            if (arguments.length === 1) {
                if (typeof arguments[0] === 'object') {
                    for (var i=0; i<arguments[0].length; i+=2) {
                        this._connect(arguments[0][i], arguments[0][i+1]);
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
            
            var this_ = this;
            var _fire = function(event) {
                if (this_.connections[event] !== undefined) {
                    this_.connections[event].fire(data);
                }
            };
            
            var events = event.split('.');
            var baseEvent = events.splice(0, 1)[0];
            
            _fire(baseEvent);
            
            var event = baseEvent;
            for (var i=0; i<events.length; ++i) {
                event+= '.' + events[i];
                _fire(event);
            }
        },
        
        on: function(event, handler) {
            if (this.connections[event] === undefined) {
                this.connections[event] = $.Callbacks();
            }
            
            this.connections[event].add(handler);
        },
        
        off: function(event, handler) {
            if (this.connections[event] === undefined) {
                return; // success, nothing existed and nothing can be removed
            }
            
            this.connections[event].remove(handler);
        },
        
        addResourceUrl: function(id, url) {
            var data = arguments[2] || {};
            var method = arguments[3] || 'GET';
            
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
        
        addTemplateMustache: function(id, template) {
            var toHtml = function(data) {
                return Mustache.to_html(template, data);
            };
            
            this.addTemplate(id, toHtml);
        },
        
        addEvent: function(id, elementSelector, event) {
            var data = arguments[3] || {};
            this_ = this;
            
            $(elementSelector).on(event, function(eventObject) {
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
            this_ = this;
            this.elements[id] = function() {
                var data = parseArgs(arguments);
                $(elementSelector)[handler](data);
                
                this_.trigger(id);
            };
        }
    };
    
    return Undergarment;
})(jQuery);