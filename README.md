# Undergarment.js

An everything-agnostic binding framework build on jQuery 1.7+. Undergarment
allows you to compartmentalize your application, which simplifies maintenance,
even for more complex interactions.

The only true requirement as of now is jQuery.Callbacks, although addEvent,
addElement and addResourceUrl also require jQuery. But they can be replaced with
addResource, on and trigger and can be regarded as shortcuts when jQuery is
available.

Undergarments foundation is a function that accepts either no or one data argument,
processes it and passes it on to other functions via jQuery.Callbacks.
These functions are called "foundation functions".

To clarify, an example of such functions:

A resource:

    function() {
        var data = {
            recipient: 'Dave',
            message: 'I can\'t let you do that',
            sender: 'Hal'
        };
        
        trigger('resource:message', data);
    }

A template:

    function(data) {
        var html = 'Hi ' + data.recipient + '!<br />'
                 + data.sender + ' send you a message: <br />'
                 + '<span class="message">' + data.message + '</span>';
                    
        trigger('template:message', html);
    }
    
An element:

    function(html) {
        $('#messages').append(html);
        
        trigger('element:messages');
    }
    
Now you just have to connect them:

    on('show_message', 'resource:message');
    on('resource:message', 'template:message');
    on('template:message', 'element:message');
    
Let's say you want to display the message after five seconds:

    setTimeout(function() {
        ug.trigger('show_message');
    }, 5000);
    
Now after five seconds, resource:message hands its message object
to template:message, which in turn hands the html to element:messages, where
the html is appended and displayed.

# Documentation

Undergarment provides wrappers to create the foundation functions and facilities
to handle binding/triggering those functions. All 'data' parameters in the
wrapper signatures may be functions, that are evaluated every time the
foundation function is triggered. They have to return a pure data object.

## Wrappers

The following wrappers are available:

**addResourceUrl(id, url, [data={}], [method='get'])**

Creates a foundation function that'll use jQuerys ajax facilities to request
the url, with 'data' as parameters using 'method' as the HTTP method ('get' or 'post').
The method may be given in lower or upper case.

**addResource(id, data)**

Creates a foundation function that simply provides data. Since 'data' may be a
function that gets executed everytime the foundation function is triggered, this
wrapper can be used to retrieve data via another frameworks ajax facilities,
or provide data from a form, and so on. It's very flexible.

**addTemplate(id, htmlGenerator)**

Creates a foundation function that executes htmlGenerator with its data as a
parameter. As the name suggests, htmlGenerator has to return a plain string
which may contain html.

**addEvent(id, elementSelector, event, [data])**

Does not create a foundation function, but a jQuery event listener on
'elementSelector' for 'event'. The data parameter will be evaluated every time
the event is triggered, and passed on to the listening foundation function.
Usually used to trigger resources.

**addElement(id, elementSelector, [handler])**

Creates a foundation function that will call 'handler' on 'elementSelector' with
its data. 'handler' defaults to html which updates the element, but any jQuery
manipulation function that accepts a single string as a parameter can be used.
Usually used to add a templates generated html to the DOM.

## Binding

After you've created all your foundation functions, you need to define which
are called when. To identify a foundation function, the 'id' you passed to the
wrapper is prepended with a type based on the wrapper method:

- addResource/addResourceUrl => 'resources'
- addTemplate => 'templates'
- addEvent => 'events'
- addElement => 'elements'

The following methods are provided to handle binding/triggering:

**connect(idSource, idTarget)**

Will trigger idTarget after idSource is completed.

**connect([idSource-1, idTarget-1, idSource-2, idTarget-2, ..., idSource-n, idTarget-n])**

Same as connect(idSource, idTarget), only for multiple sources/targets at once.
Expects an array as parameter, where the source id is followed by the target id.
It should therefore have an even number of parameters.

**trigger(event, [data])**

Can be used to trigger any foundation functions. 'event' must include the prepended
type. If you want to trigger all foundation functions listening on
'resources:user', you'd call trigger('resources:user', {_userData_})

**on(event, handler)**

Is used by the connect method. Allows you to listen on any internal event. For
example, if you have a resource 'resources:save_form' that saves some user input,
and you want to inform the user that the input was successfully saved, you'd
call on('resources:save_form', informUser). informUser would be function you
defined earlier that shows a success message.

**interval(id, interval)**

Allows you to periodically trigger an internal event, it actually just calls
trigger() every 'interval' milliseconds. If you have a resource
'resources:keepalive', you could use interval('resources:keepalive', 60000) to
update the users session every 60 seconds.

# Examples and use cases

Take a look at the examples in the examples/ folder. Particularly the todo-list
example is interesting, as it uses keyboard navgiation as well as mouse events.
You can't see it now, but Undergarment proved to be very useful when adding the
keyboard navigation. I just had to add event listeners to keyboard events, and
not care about the rendering of templates or adding the html to the DOM, and
so on.
