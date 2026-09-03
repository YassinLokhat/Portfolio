/* Description: Custom JS file */


(function($) {
    "use strict"; 
	
    /* Navbar Scripts */
    // jQuery to collapse the navbar on scroll
    $(window).on('scroll load', function() {
		var top = ($('.navbar').offset() || { "top": NaN }).top;
		if (!isNaN(top)) {
			if (top > 60) {
				$(".fixed-top").addClass("top-nav-collapse");
			} else {
				$(".fixed-top").removeClass("top-nav-collapse");
			}
		}
    });
    
	// Smooth-scroll only for same-page hash links; leave other pages to the browser
	function isSamePageHash(href) {
		if (!href) {
			return false;
		}
		if (href.charAt(0) === '#') {
			return href.length > 1;
		}
		var hashIndex = href.indexOf('#');
		if (hashIndex < 1) {
			return false;
		}
		var path = href.substring(0, hashIndex).replace(/^\.\//, '').replace(/^\//, '');
		if (!path) {
			return true;
		}
		var current = window.location.pathname.split('/').pop() || 'index.html';
		return path === current;
	}

	$(function() {
		$(document).on('click', 'a.page-scroll', function(event) {
			var href = $(this).attr('href') || '';
			if (!isSamePageHash(href)) {
				return;
			}
			var hash = href.substring(href.indexOf('#'));
			var $target = $(hash);
			var top = 0;
			if ($target.length) {
				top = $target.offset().top;
			} else if (hash !== '#header') {
				return;
			}
			event.preventDefault();
			$('html, body').stop().animate({
				scrollTop: top
			}, 600, 'easeInOutExpo');
		});
    });

    // offcanvas script from Bootstrap + added element to close menu on click in small viewport
    $('[data-toggle="offcanvas"], .navbar-nav li:not(.lang-switch) a:not(.dropdown-toggle)').on('click', function () {
        $('.offcanvas-collapse').toggleClass('open')
    })

    // hover in desktop mode
    function toggleDropdown (e) {
        const _d = $(e.target).closest('.dropdown'),
            _m = $('.dropdown-menu', _d);
        setTimeout(function(){
            const shouldOpen = e.type !== 'click' && _d.is(':hover');
            _m.toggleClass('show', shouldOpen);
            _d.toggleClass('show', shouldOpen);
            $('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
        }, e.type === 'mouseleave' ? 300 : 0);
    }
    $('body')
    .on('mouseenter mouseleave','.dropdown',toggleDropdown)
    .on('click', '.dropdown-menu a', toggleDropdown);


    /* Move Form Fields Label When User Types */
    // for input and textarea fields
    $("input, textarea").keyup(function(){
		if ($(this).val() != '') {
			$(this).addClass('notEmpty');
		} else {
			$(this).removeClass('notEmpty');
		}
	});
	

    /* Back To Top Button */
    // create the back to top button
    var backToTopLabel = (document.documentElement.getAttribute("lang") || "en").toLowerCase().indexOf("fr") === 0
        ? "Haut de page"
        : "Back to Top";
    $('body').prepend('<a href="#header" class="back-to-top page-scroll">' + backToTopLabel + '</a>');
    var amountScrolled = 700;
    $(window).scroll(function() {
        if ($(window).scrollTop() > amountScrolled) {
            $('a.back-to-top').fadeIn('500');
        } else {
            $('a.back-to-top').fadeOut('500');
        }
    });


	/* Removes Long Focus On Buttons */
	$(".button, a, button").mouseup(function() {
		$(this).blur();
	});

})(jQuery);