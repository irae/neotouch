goog.provide('treesaver.layout.Figure');

goog.require('treesaver.array');
goog.require('treesaver.capabilities');
goog.require('treesaver.dom');
// Block requires Figure, so avoid a circular dependency
//goog.require('treesaver.layout.Block');
goog.require('treesaver.layout.FigureSize');
goog.require('treesaver.string'); // String.trim

goog.scope(function() {
  var array = treesaver.array,
      capabilities = treesaver.capabilities,
      dom = treesaver.dom,
      FigureSize = treesaver.layout.FigureSize;

  /**
   * A figure element
   * @param {!Element} el HTML element.
   * @param {!number} baseLineHeight The normal line height used across
   *                                 the article content (in pixels).
   * @param {?Object} indices Current block and figure index.
   * @constructor
   */
  treesaver.layout.Figure = function(el, baseLineHeight, indices) {
    this.anchorIndex = indices.index;
    this.figureIndex = indices.figureIndex;
    indices.figureIndex += 1;
    this.fallback = null;
    this.sizes = {};

    this.optional = !dom.hasClass(el, 'required');
    this.zoomable = dom.hasClass(el, 'zoomable');
    this.scrollable = dom.hasClass(el, 'scroll');

    // Go through and process our sizes
    array.toArray(el.childNodes).forEach(function(childNode) {
      if (childNode.nodeType !== 1) {
        // TODO: What if content is just a ext node? (take parent?)
        if (childNode.data && childNode.data.trim()) {
          treesaver.debug.info('textNode ignored in figure: ' + childNode.data);
        }

        return;
      }

      this.processElement(childNode);
    }, this);

    // Now check for a fallback, and process separately
    if (this.sizes['fallback']) {
      // TODO: Support multiple fallbacks?
      // TODO: Requirements on fallback?
      this.processFallback(this.sizes['fallback'][0].html, el, baseLineHeight, indices);

      // Remove the fallback from figure sizes
      delete this.sizes['fallback'];
    }
  };
});

goog.scope(function() {
  var Figure = treesaver.layout.Figure,
      array = treesaver.array,
      capabilities = treesaver.capabilities,
      dom = treesaver.dom,
      FigureSize = treesaver.layout.FigureSize;

  /**
   * @type {number}
   */
  Figure.prototype.anchorIndex;

  /**
   * @type {number}
   */
  Figure.prototype.figureIndex;

  /**
   * @type {?treesaver.layout.Block}
   */
  Figure.prototype.fallback;

  /**
   * @type {Object.<string, Array.<treesaver.layout.FigureSize>>}
   */
  Figure.prototype.sizes;

  /**
   * Does this figure need to be displayed? If not, then it may be omitted
   * when there is not enough space.
   * @type {boolean}
   */
  Figure.prototype.optional;

  /**
   * Does the figure support zooming/lightboxing?
   * @type {boolean}
   */
  Figure.prototype.zoomable;

  /**
   * Does the figure support scrolling?
   * @type {boolean}
   */
  Figure.prototype.scrollable;

  /**
   * @param {!string} html
   * @param {!Node} node HTML node.
   * @param {!number} baseLineHeight The normal line height used across
   *                                 the article content (in pixels).
   * @param {!Object} indices Current block and figure index.
   */
  Figure.prototype.processFallback = function processFallback(html,
      node, baseLineHeight, indices) {
    // Create the child node
    var parent = node.parentNode,
        fallbackContainer = document.createElement('div'),
        /** @type {!Node} */
        fallbackNode;

    fallbackContainer.innerHTML = html;
    // Is there only one element in our payload?
    if (fallbackContainer.childNodes.length === 1) {
      // Great, just use that one
      fallbackNode = /** @type {!Node} */ fallbackContainer.firstChild;
    }
    else {
      // Use the wrapper as the fallback node
      fallbackNode = fallbackContainer;
    }

    // Cast for compiler
    fallbackNode = /** @type {!Element} */ (fallbackNode);

    // Insert into the tree, to get proper styling
    parent.insertBefore(fallbackNode, node);

    // Add flags into DOM for zooming
    if (this.zoomable) {
      dom.addClass(fallbackNode, 'zoomable');
      fallbackNode.setAttribute('data-figureindex', this.figureIndex);
      if (capabilities.IS_NATIVE_APP || treesaver.capabilities.SUPPORTS_TOUCH) {
        // Need dummy handler in order to get bubbled events
        fallbackNode.setAttribute('onclick', 'void(0)');
      }
    }

    // Figures are skipped during sanitization, so must do it manually here
    treesaver.layout.Block.sanitizeNode(fallbackNode, baseLineHeight);

    // Construct
    this.fallback = new treesaver.layout.Block(fallbackNode, baseLineHeight, indices, true);
    this.fallback.figure = this;
    if (this.fallback.blocks) {
      // Set the figure on any child blocks
      this.fallback.blocks.forEach(function(block) {
        block.figure = this;
        block.withinFallback = true;
      }, this);
    }

    // Remove the node
    parent.removeChild(fallbackNode);

    // Done
  };

  /**
   * Retrieve a qualifying figureSize for the given size name
   *
   * @param {!string} size
   * @return {?treesaver.layout.FigureSize} Null if not found.
   */
  Figure.prototype.getSize = function(size) {
    var i, len;

    if (this.sizes[size]) {
      for (i = 0, len = this.sizes[size].length; i < len; i += 1) {
        if (this.sizes[size][i].meetsRequirements()) {
          return this.sizes[size][i];
        }
      }
    }

    // None found
    return null;
  };

  /**
   * Retrieve the largest figureSize that fits within the allotted space
   *
   * @param {!treesaver.dimensions.Size} maxSize
   * @param {boolean=} isLightbox True if display is for a lightbox.
   * @return {?{name: string, figureSize: treesaver.layout.FigureSize}} Null if none fit
   */
  Figure.prototype.getLargestSize = function(maxSize, isLightbox) {
    var maxArea = -Infinity,
        availArea = maxSize.w * maxSize.h,
        closest,
        closestArea = Infinity,
        max,
        current,
        sizes = this.sizes;

    if (isLightbox && this.sizes['lightbox']) {
      // Only look at lightbox figures
      sizes = { 'lightbox': this.sizes['lightbox'] };
    }

    for (current in sizes) {
      this.sizes[current].forEach(function(figureSize) {
        if (!figureSize.meetsRequirements()) {
          // Not eligible
          return;
        }

        var area = figureSize.minW * figureSize.minH;

        if ((figureSize.minW && figureSize.minW > maxSize.w) ||
            (figureSize.minH && figureSize.minH > maxSize.h)) {
          // Too big
          if (!max && this.scrollable) {
            // If nothing fits yet, find something at least near
            if (area <= closestArea) {
              closestArea = area;
              closest = {
                name: current,
                figureSize: figureSize
              };
            }
          }

          return;
        }

        // TODO: How to estimate dimensions when no info is provided?
        //
        // Use this current size only if it's bigger than the one we
        // found before (based on area)
        if (area >= maxArea) {
          maxArea = area;
          max = {
            name: current,
            figureSize: figureSize
          };
        }
      }, this);
    }

    return max || closest;
  };

  /**
   * @param {!Array.<string>} sizes
   * @param {!string} html
   * @param {number} minW
   * @param {number} minH
   * @param {?Array.<string>} requirements
   */
  Figure.prototype.saveSizes = function saveSizes(sizes, html, minW, minH, requirements) {
    // First, create the FigureSize
    var figureSize = new FigureSize(html, minW, minH, requirements);

    sizes.forEach(function(size) {
      if (this.sizes[size]) {
        this.sizes[size].push(figureSize);
      }
      else {
        this.sizes[size] = [figureSize];
      }
    }, this);
  };

  /**
   * @param {!Element} el
   */
  Figure.prototype.processElement = function processElement(el) {
    var sizes = el.getAttribute('data-sizes'),
        // Use native width & height if available, otherwise use custom data- properties
        minW = parseInt(el.getAttribute(dom.hasAttr(el, 'width') ? 'width' : 'data-minwidth'), 10),
        minH = parseInt(el.getAttribute(dom.hasAttr(el, 'height') ? 'height' : 'data-minheight'), 10),
        requirements = dom.hasAttr(el, 'data-requires') ?
          el.getAttribute('data-requires').split(' ') : null,
        html;

    if (requirements) {
      if (!capabilities.check(requirements)) {
        // Does not meet requirements, skip
        return;
      }
    }

    // Remove class=hidden or hidden attribute in case used for display cloaking
    el.removeAttribute('hidden');
    dom.removeClass(el, 'hidden');

    // TODO: Remove properties we don't need to store (data-*)

    // Set up any scrollable elements
    treesaver.ui.Scrollable.initDomTree(el);

    // Grab HTML
    html = dom.outerHTML(el);

    if (!sizes) {
      sizes = ['fallback'];
    }
    else {
      sizes = sizes.split(' ');
    }

    this.saveSizes(sizes, html, minW, minH, requirements);
  };

  /**
   * @param {!Element} el
   * @return {boolean} True if the element is a figure.
   */
  Figure.isFigure = function(el) {
    var nodeName = el.nodeName.toLowerCase();
    return el.nodeType === 1 && nodeName === 'figure';
  };

  if (goog.DEBUG) {
    // Expose for testing
    Figure.prototype.toString = function() {
      return '[Figure: ' + this.index + '/' + this.figureIndex + ']';
    };
  }
});
