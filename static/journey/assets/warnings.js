(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.LFW || (g.LFW = {})).WarningsPage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global $ */

function WarningsPage (options) {
  options = $.extend(true, {
    isLocalised: false
  }, options)

  var $warnings = $('ul.warnings-list')
  var hash = window.location.hash

  /*
   * Warnings filtering
   */
  function highlighter (str, element) {
    var regex = new RegExp(str, 'gi')
    element.html(element.html().replace(regex, function (matched) {
      return '<mark>' + matched + '</mark>'
    }))
  }

  function filterChange (form) {
    var $form = $(form)
    var $filter = $(form.filter)

    // Get the trimmed filter text
    var val = $filter.val().trim()

    // Lookup the DOM to find the details panel
    // that this filter input is contained within
    var $panel = $form.closest('details.details-severity')

    // Get all the notifications contained in the panel
    var $notifications = $panel.find('.details-content-severity li a')

    // Unhighlight any previously highlighted text
    $notifications.find('mark').contents().unwrap()

    // Loop through all the notifications
    $notifications.each(function () {
      var $notification = $(this)
      var $title = $notification.find('span')

      // Rejoin any split text to tidy up the DOM text node
      $title.get(0).normalize()

      // If there's no value to filter on, show the notification
      if (!val) {
        $notification.show()
      } else {
        // Compare the text node and filter value
        var notificationText = $title.text().toLowerCase()
        var matches = notificationText.indexOf(val.toLowerCase())
        if (matches > -1) {
          // If we hit a match, highlight and show
          highlighter(val, $title)
          $notification.show()
        } else {
          // If we fail to hit a match, hide the notification
          $notification.hide()
        }
      }
    })

    // Show/hide the reset button
    // Enabled/disable the submit button
    var $reset = $form.find('button[type="reset"]')
    var $submit = $form.find('button[type="submit"]')
    if (val) {
      $reset.show()
      $submit.removeAttr('disabled')
    } else {
      $reset.hide()
      $submit.attr('disabled', 'disabled')
    }
  }

  $warnings.on('submit', 'form.filter', function (e) {
    e.preventDefault()
    filterChange(this)
  })

  $warnings.on('input', 'form.filter input', function (e) {
    filterChange(this.form)
  })

  $warnings.on('reset', 'form.filter', function (e) {
    var $filter = $(this.filter)
    $filter.val('')
    filterChange(this)
    $filter.focus()
  })

  // Open the details summary
  // of the `hash` of applicable
  if (hash) {
    var $element = $(hash)
    $element.attr('open', '')
    $element.parents('details').attr('open', '')
  }
}

module.exports = WarningsPage

},{}]},{},[1])(1)
});
//# sourceMappingURL=warnings.js.map
