Undergarment.js
====

This is still very much a work in progress. It will allow developers to easily
manage html generation chains, e.g.:

event -> resource -> template -> DOMElement

Or with more words: When the user triggers an event (e.g. submits a form), a
resource is triggered (e.g. a url that verifies form information). The response
value is passed to the template, which generates HTML that is added to the
DOMElement.

A better explaination and some examples will be added later.
