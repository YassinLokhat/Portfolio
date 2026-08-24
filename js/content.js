/**
 * Loads page lists from static JSON files and fills matching [data-bind] regions.
 * Works on any static host. Requires HTTP(S) — fetch() does not work with file://.
 *
 * HTML:
 *   <body data-content-src="data/origami.json">
 *   <div class="slideshow-container" data-bind="slides" data-bind-type="slideshow">
 *
 * JSON slides can be an array of { src, alt, caption } or a range:
 *   { "directory": "...", "prefix": "origami-", "extension": ".jpg", "from": 1, "to": 75, "pad": 2, "alt": "photo {n} of {total}" }
 */

(function () {
	var LOAD_ERROR = "Could not load this content. Open the site through a local web server rather than a file:// URL.";

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	function richText(value) {
		return escapeHtml(value || "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
	}

	function lookup(data, path) {
		return path.split(".").reduce(function (current, key) {
			return current == null ? undefined : current[key];
		}, data);
	}

	function expandSlides(slides) {
		if (!slides) {
			return [];
		}
		if (Array.isArray(slides)) {
			return slides;
		}

		var from = Number(slides.from) || 1;
		var to = Number(slides.to) || from;
		var pad = Number(slides.pad) || 0;
		var total = Math.max(0, to - from + 1);
		var items = [];

		for (var n = from; n <= to; n++) {
			var num = pad > 0 ? String(n).padStart(pad, "0") : String(n);
			var alt = String(slides.alt || "")
				.replace(/\{n\}/g, String(n))
				.replace(/\{total\}/g, String(total));
			items.push({
				src: (slides.directory || "") + (slides.prefix || "") + num + (slides.extension || ""),
				alt: alt
			});
		}

		return items;
	}

	function clearGenerated(el) {
		el.querySelectorAll(".slide, .content-status, [data-generated]").forEach(function (node) {
			node.remove();
		});
	}

	function showStatus(el, message, isError) {
		var p = document.createElement("p");
		p.className = "content-status" + (isError ? " error" : "");
		p.textContent = message;
		el.insertBefore(p, el.querySelector(".prev") || el.firstChild);
	}

	function createSlide(slide, isFirst) {
		var wrap = document.createElement("div");
		wrap.className = isFirst ? "slide active" : "slide";

		var img = document.createElement("img");
		img.src = slide.src;
		img.alt = slide.alt || "";
		img.decoding = "async";
		wrap.appendChild(img);

		if (slide.caption) {
			var caption = document.createElement("div");
			caption.className = "slide-caption";
			caption.textContent = slide.caption;
			wrap.appendChild(caption);
		}

		return wrap;
	}

	function ensureSlideshowButtons(container) {
		if (!container.querySelector(".prev")) {
			var prev = document.createElement("button");
			prev.className = "prev";
			prev.type = "button";
			prev.setAttribute("aria-label", "Previous slide");
			prev.textContent = "❮";
			container.appendChild(prev);
		}
		if (!container.querySelector(".next")) {
			var next = document.createElement("button");
			next.className = "next";
			next.type = "button";
			next.setAttribute("aria-label", "Next slide");
			next.textContent = "❯";
			container.appendChild(next);
		}
	}

	function fillSlideshow(container, slides) {
		var items = expandSlides(slides);
		clearGenerated(container);
		ensureSlideshowButtons(container);

		var prevBtn = container.querySelector(".prev");
		items.forEach(function (slide, index) {
			container.insertBefore(createSlide(slide, index === 0), prevBtn);
		});

		if (items.length === 0) {
			showStatus(container, "No slides yet.");
		}
	}

	function fillHighlights(container, highlights) {
		clearGenerated(container);
		(highlights || []).forEach(function (item) {
			var col = document.createElement("div");
			col.className = "col-lg-4";
			col.setAttribute("data-generated", "");

			var inner = document.createElement("div");
			inner.className = "text-container";

			var imageWrap = document.createElement("div");
			imageWrap.className = "image-container";

			var img = document.createElement("img");
			img.className = "img-fluid";
			img.src = item.src;
			img.alt = item.alt || "";
			img.loading = "lazy";
			img.decoding = "async";
			imageWrap.appendChild(img);

			var caption = document.createElement("p");
			caption.innerHTML = richText(item.caption || "");

			inner.appendChild(imageWrap);
			inner.appendChild(caption);
			col.appendChild(inner);
			container.appendChild(col);
		});
	}

	function downloadSentence(downloads) {
		if (!downloads || downloads.length === 0) {
			return "";
		}

		var links = downloads.map(function (item) {
			return '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.label) + "</a>";
		});

		var joined = links.length === 1
			? links[0]
			: links.slice(0, -1).join(", ") + " or " + links[links.length - 1];

		return "Download the " + joined + ".";
	}

	function fillProjects(container, projects) {
		clearGenerated(container);

		(projects || []).forEach(function (project) {
			var wrap = document.createElement("div");
			wrap.id = project.id || "";
			wrap.className = "text-container project-container";
			wrap.setAttribute("data-generated", "");

			var title = document.createElement("h4");
			title.className = "h4-heading";
			title.textContent = project.name || "";
			wrap.appendChild(title);

			if (project.image) {
				var img = document.createElement("img");
				img.className = "img-fluid";
				img.src = project.image;
				img.alt = project.imageAlt || "";
				img.loading = "lazy";
				img.decoding = "async";
				wrap.appendChild(img);
			}

			if (project.description) {
				var desc = document.createElement("p");
				desc.innerHTML = richText(project.description);
				wrap.appendChild(desc);
			}

			var downloads = downloadSentence(project.downloads);
			if (downloads) {
				var dl = document.createElement("p");
				dl.innerHTML = downloads;
				wrap.appendChild(dl);
			}

			var slides = expandSlides(project.slides);
			if (slides.length > 0) {
				var gallery = document.createElement("div");
				gallery.className = "basic-0 pt-5";
				gallery.id = "gallery-" + (project.id || "");

				var inner = document.createElement("div");
				inner.className = "container";
				var row = document.createElement("div");
				row.className = "row";
				var col = document.createElement("div");
				col.className = "col-xl-10 offset-xl-1";

				var slideshow = document.createElement("div");
				slideshow.className = "slideshow-container";
				slideshow.setAttribute("role", "region");
				slideshow.setAttribute("aria-roledescription", "carousel");
				slideshow.setAttribute("aria-label", project.galleryLabel || (project.name + " screenshots"));
				fillSlideshow(slideshow, slides);

				col.appendChild(slideshow);
				row.appendChild(col);
				inner.appendChild(row);
				gallery.appendChild(inner);
				wrap.appendChild(gallery);
			}

			container.appendChild(wrap);
		});
	}

	function fillProjectNav(container, projects) {
		clearGenerated(container);
		container.innerHTML = "";

		var navItems = (projects || []).filter(function (project) {
			return project.inNav !== false;
		});

		navItems.forEach(function (project, index) {
			if (index > 0) {
				var divider = document.createElement("div");
				divider.className = "dropdown-divider";
				container.appendChild(divider);
			}

			var link = document.createElement("a");
			link.className = "dropdown-item page-scroll";
			link.href = "#" + project.id;
			link.textContent = project.name;
			container.appendChild(link);
		});
	}

	var renderers = {
		slideshow: fillSlideshow,
		highlights: fillHighlights,
		projects: fillProjects,
		"project-nav": fillProjectNav
	};

	function inferType(el) {
		if (el.classList.contains("slideshow-container")) {
			return "slideshow";
		}
		return el.getAttribute("data-bind-type") || "";
	}

	function bindElement(el, data) {
		var path = el.getAttribute("data-bind");
		var type = el.getAttribute("data-bind-type") || inferType(el);
		var renderer = renderers[type];
		if (!path || !renderer) {
			return;
		}
		renderer(el, lookup(data, path));
	}

	function showBindErrors() {
		document.querySelectorAll("[data-bind]").forEach(function (el) {
			clearGenerated(el);
			if (el.classList.contains("dropdown-menu")) {
				return;
			}
			showStatus(el, LOAD_ERROR, true);
		});
	}

	async function boot() {
		var src = document.body.getAttribute("data-content-src");
		if (!src) {
			return;
		}

		try {
			var response = await fetch(src, { cache: "no-cache" });
			if (!response.ok) {
				throw new Error(response.status + " " + response.statusText);
			}
			var data = await response.json();
			document.querySelectorAll("[data-bind]").forEach(function (el) {
				bindElement(el, data);
			});
			if (typeof window.initSlideshows === "function") {
				window.initSlideshows();
			}
			if (window.jQuery && jQuery.fn.scrollspy) {
				jQuery("body").scrollspy("refresh");
			}
		} catch (err) {
			console.error("content.js:", err);
			showBindErrors();
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
