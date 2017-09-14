/* global $ */
/* global jQuery */
/* global GOVUK */

$(document).ready(function () {
  // Turn off jQuery animation
  //jQuery.fx.off = true

  // Use GOV.UK selection-buttons.js to set selected
  // and focused states for block labels
  var $blockLabels = $(".block-label input[type='radio'], .block-label input[type='checkbox']")
  new GOVUK.SelectionButtons($blockLabels) // eslint-disable-line

  // Where .block-label uses the data-target attribute
  // to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()

  // Use GOV.UK shim-links-with-button-role.js to trigger a link styled to look like a button,
  // with role="button" when the space key is pressed.
  GOVUK.shimLinksWithButtonRole.init()

  // Details/summary polyfill
  // See /javascripts/vendor/details.polyfill.js

})

$(window).load(function () {
  // Only set focus for the error example pages
  if ($('.js-error-example').length) {
    // If there is an error summary, set focus to the summary
    if ($('.error-summary').length) {
      $('.error-summary').focus()
      $('.error-summary a').click(function (e) {
        e.preventDefault()
        var href = $(this).attr('href')
        $(href).focus()
      })
    } else {
      // Otherwise, set focus to the field with the error
      $('.error input:first').focus()
    }
  }

  // ScrollTo

  $(document).on('click keypress','a.scroll',function(e){
    e.preventDefault()
    var fragment = $(this).attr('href').split("#")[1]
    $('html,body')
    .animate({scrollTop: $('#'+fragment).offset().top},'medium')
    .promise().then(function() {
      // Animation complete
      // Set Link focus
      $('#'+fragment).attr('tabindex', '-1').focus()
      // Add hash to url
      window.location.hash = fragment
    })
  })

})
