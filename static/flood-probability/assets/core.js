(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('details-summary')

},{"details-summary":2}],2:[function(require,module,exports){
/* global $ */

if (!('open' in document.createElement('details'))) {
  var $html = $('html')
  var $style = $('<style>')
  var $head = $('head', $html)

  var rules = [
    '.no-details details > * { display: none; }',
    '.no-details details > summary { display: inline-block; }',
    '.no-details details[open] > * { display: block; }',
    '.no-details details[open] > summary { display: inline-block; }',
    '.no-details details > summary:before { float: left; width: 20px; content: \'► \'; }',
    '.no-details details[open] > summary:before { content: \'▼ \'; }'
  ]

  $style.text(rules.join('\n'))
  $head.prepend($style)

  // Add conditional classname based on support for details/summary
  $html.addClass('no-details')

  $(function () {
    var $body = $(document.body)
    $body.addClass('no-details')

    function toggle () {
      var $summary = $(this)
      var $details = $summary.parent()
      var $content = $details.children().not($summary)
      var isOpen = $details.is('[open]')

      if (isOpen) {
        $details.removeAttr('open')
        $summary.attr('aria-expanded', false)
        $content.attr('aria-hidden', true)
      } else {
        $details.attr('open', '')
        $summary.attr('aria-expanded', true)
        $content.attr('aria-hidden', false)
      }
    }

    $body.find('details > summary').attr('tabindex', '0')
    $body.on('click', 'details > summary', toggle)
    $body.on('keyup', 'details > summary', function (e) {
      if (e.keyCode === 32 || (e.keyCode === 13)) {
        toggle.call(this)
      }
    })
  })
}

},{}]},{},[1])
//# sourceMappingURL=core.js.map
