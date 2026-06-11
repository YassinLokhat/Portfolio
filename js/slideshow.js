/**
 * Slideshow - Multi-instance support
 * Usage:
 *   HTML : <div class="slideshow-container" data-autoplay="5000">
 *              <div class="slide">...</div>
 *              <button class="prev">❮</button>
 *              <button class="next">❯</button>
 *          </div>
 *
 *   The buttons inside each container control only that container.
 *   data-autoplay (ms) is optional; omit or set to "0" to disable auto-advance.
 */

class Slideshow {
    /**
     * @param {HTMLElement} container - The .slideshow-container element
     */
    constructor(container) {
        this.container  = container;
        this.slides     = Array.from(container.querySelectorAll('.slide'));
        this.current    = 0;
        this.interval   = null;
        this.delay      = parseInt(container.dataset.autoplay ?? '5000', 10);

        if (this.slides.length === 0) return;

        this._bindButtons();
        this._show(0);

        if (this.delay > 0) this._startAuto();
    }

    /* ── public API ───────────────────────────── */

    move(n) {
        this._show(this.current + n);
        this._resetAuto();
    }

    goTo(n) {
        this._show(n);
        this._resetAuto();
    }

    /* ── private ──────────────────────────────── */

    _show(n) {
        const len = this.slides.length;
        this.current = ((n % len) + len) % len;   // wrap-around, handles negative

        this.slides.forEach((s, i) => {
            s.classList.toggle('active', i === this.current);
        });
    }

    _bindButtons() {
        const prev = this.container.querySelector('.prev');
        const next = this.container.querySelector('.next');

        if (prev) prev.addEventListener('click', () => this.move(-1));
        if (next) next.addEventListener('click', () => this.move(1));
    }

    _startAuto() {
        if (this.delay <= 0) return;
        this.interval = setInterval(() => this.move(1), this.delay);
    }

    _resetAuto() {
        if (this.delay <= 0) return;
        clearInterval(this.interval);
        this._startAuto();
    }
}

/* ── Keyboard navigation (last focused container) ─── */
let _focusedSlideshow = null;

document.addEventListener('DOMContentLoaded', () => {
    // Instantiate one Slideshow per .slideshow-container found on the page
    const instances = [];

    document.querySelectorAll('.slideshow-container').forEach(container => {
        const sw = new Slideshow(container);
        instances.push(sw);

        // Track which slideshow the user last interacted with for keyboard nav
        container.addEventListener('mouseenter', () => { _focusedSlideshow = sw; });
        container.addEventListener('touchstart',  () => { _focusedSlideshow = sw; }, { passive: true });
    });

    // Default: keyboard controls the first slideshow (or whichever was last hovered)
    if (instances.length > 0) _focusedSlideshow = instances[0];

    document.addEventListener('keydown', e => {
        if (!_focusedSlideshow) return;
        if (e.key === 'ArrowLeft')  _focusedSlideshow.move(-1);
        if (e.key === 'ArrowRight') _focusedSlideshow.move(1);
    });
});

/* ── Legacy global helpers (backward-compat with inline onclick="changeSlide(±1)") ─── */

/**
 * Returns the Slideshow instance whose .slideshow-container contains `el`.
 * Falls back to the first instance on the page.
 */
function _getSlideshowForElement(el) {
    const container = el ? el.closest('.slideshow-container') : null;
    if (container && container._swInstance) return container._swInstance;
    // If onclick is used without a reference, control the focused one
    return _focusedSlideshow;
}

// Keep the old function names working when used as onclick="changeSlide(1)"
// They will act on the slideshow that was last hovered/touched.
function changeSlide(n) {
    if (_focusedSlideshow) _focusedSlideshow.move(n);
}

function currentSlide(n) {
    if (_focusedSlideshow) _focusedSlideshow.goTo(n - 1); // was 1-based
}
