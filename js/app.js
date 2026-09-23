(function () {
	var host = document.getElementById("particles-js");
	if (!host) {
		return;
	}

	var isDesktop = window.matchMedia("(min-width: 992px)").matches;
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!isDesktop || reduceMotion) {
		host.remove();
		return;
	}

	var script = document.createElement("script");
	script.src = "js/particles.min.js";
	script.onload = function () {
		window.particlesJS("particles-js", {
			particles: {
				number: {
					value: 28,
					density: {
						enable: true,
						value_area: 900
					}
				},
				color: {
					value: "#000000"
				},
				shape: {
					type: "circle"
				},
				opacity: {
					value: 0.1,
					random: false
				},
				size: {
					value: 4,
					random: true
				},
				line_linked: {
					enable: true,
					distance: 150,
					color: "#000000",
					opacity: 0.18,
					width: 1
				},
				move: {
					enable: true,
					speed: 0.7,
					direction: "none",
					random: false,
					straight: false,
					out_mode: "out"
				}
			},
			interactivity: {
				detect_on: "window",
				events: {
					onhover: {
						enable: true,
						mode: "repulse"
					},
					onclick: {
						enable: false
					},
					resize: true
				},
				modes: {
					repulse: {
						distance: 120
					}
				}
			},
			retina_detect: false
		});
	};
	document.body.appendChild(script);
})();
