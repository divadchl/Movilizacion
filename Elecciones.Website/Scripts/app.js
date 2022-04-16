/**
 * This library was created to emulate some jQuery features
 * used in this template only with Javascript and DOM
 * manipulation functions (IE10+).
 * All methods were designed for an adequate and specific use
 * and don't perform a deep validation on the arguments provided.
 *
 * IMPORTANT:
 * ==========
 * It's suggested NOT to use this library extensively unless you
 * understand what each method does. Instead, use only JS or
 * you might even need jQuery.
 */
(function (global, factory) {
  if (typeof exports === 'object') {
    // CommonJS-like
    module.exports = factory();
  } else {
    // Browser
    if (typeof global.jQuery === 'undefined') global.$ = factory();
  }
})(window, function () {
  // HELPERS
  function arrayFrom(obj) {
    return 'length' in obj && obj !== window ? [].slice.call(obj) : [obj];
  }

  function filter(ctx, fn) {
    return [].filter.call(ctx, fn);
  }

  function map(ctx, fn) {
    return [].map.call(ctx, fn);
  }

  function matches(item, selector) {
    return (Element.prototype.matches || Element.prototype.msMatchesSelector).call(item, selector);
  } // Events handler with simple scoped events support


  var EventHandler = function () {
    this.events = {};
  };

  EventHandler.prototype = {
    // event accepts: 'click' or 'click.scope'
    bind: function (event, listener, target) {
      var type = event.split('.')[0];
      target.addEventListener(type, listener, false);
      this.events[event] = {
        type: type,
        listener: listener
      };
    },
    unbind: function (event, target) {
      if (event in this.events) {
        target.removeEventListener(this.events[event].type, this.events[event].listener, false);
        delete this.events[event];
      }
    }
  }; // Object Definition

  var Wrap = function (selector) {
    this.selector = selector;
    return this._setup([]);
  }; // CONSTRUCTOR


  Wrap.Constructor = function (param, attrs) {
    var el = new Wrap(param);
    return el.init(attrs);
  }; // Core methods


  Wrap.prototype = {
    constructor: Wrap,

    /**
     * Initialize the object depending on param type
     * [attrs] only to handle $(htmlString, {attributes})
     */
    init: function (attrs) {
      // empty object
      if (!this.selector) return this; // selector === string

      if (typeof this.selector === 'string') {
        // if looks like markup, try to create an element
        if (this.selector[0] === '<') {
          var elem = this._setup([this._create(this.selector)]);

          return attrs ? elem.attr(attrs) : elem;
        } else return this._setup(arrayFrom(document.querySelectorAll(this.selector)));
      } // selector === DOMElement


      if (this.selector.nodeType) return this._setup([this.selector]);else // shorthand for DOMReady
        if (typeof this.selector === 'function') return this._setup([document]).ready(this.selector); // Array like objects (e.g. NodeList/HTMLCollection)

      return this._setup(arrayFrom(this.selector));
    },

    /**
     * Creates a DOM element from a string
     * Strictly supports the form: '<tag>' or '<tag/>'
     */
    _create: function (str) {
      var nodeName = str.substr(str.indexOf('<') + 1, str.indexOf('>') - 1).replace('/', '');
      return document.createElement(nodeName);
    },

    /** setup properties and array to element set */
    _setup: function (elements) {
      var i = 0;

      for (; i < elements.length; i++) delete this[i]; // clean up old set


      this.elements = elements;
      this.length = elements.length;

      for (i = 0; i < elements.length; i++) this[i] = elements[i]; // new set


      return this;
    },
    _first: function (cb, ret) {
      var f = this.elements[0];
      return f ? cb ? cb.call(this, f) : f : ret;
    },

    /** Common function for class manipulation  */
    _classes: function (method, classname) {
      var cls = classname.split(' ');

      if (cls.length > 1) {
        cls.forEach(this._classes.bind(this, method));
      } else {
        if (method === 'contains') {
          var elem = this._first();

          return elem ? elem.classList.contains(classname) : false;
        }

        return classname === '' ? this : this.each(function (i, item) {
          item.classList[method](classname);
        });
      }
    },

    /**
     * Multi purpose function to set or get a (key, value)
     * If no value, works as a getter for the given key
     * key can be an object in the form {key: value, ...}
     */
    _access: function (key, value, fn) {
      if (typeof key === 'object') {
        for (var k in key) {
          this._access(k, key[k], fn);
        }
      } else if (value === undefined) {
        return this._first(function (elem) {
          return fn(elem, key);
        });
      }

      return this.each(function (i, item) {
        fn(item, key, value);
      });
    },
    each: function (fn, arr) {
      arr = arr ? arr : this.elements;

      for (var i = 0; i < arr.length; i++) {
        if (fn.call(arr[i], i, arr[i]) === false) break;
      }

      return this;
    }
  };
  /** Allows to extend with new methods */

  Wrap.extend = function (methods) {
    Object.keys(methods).forEach(function (m) {
      Wrap.prototype[m] = methods[m];
    });
  }; // DOM READY


  Wrap.extend({
    ready: function (fn) {
      if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }

      return this;
    }
  }); // ACCESS

  Wrap.extend({
    /** Get or set a css value */
    css: function (key, value) {
      var getStyle = function (e, k) {
        return e.style[k] || getComputedStyle(e)[k];
      };

      return this._access(key, value, function (item, k, val) {
        var unit = typeof val === 'number' ? 'px' : '';
        return val === undefined ? getStyle(item, k) : item.style[k] = val + unit;
      });
    },

    /** Get an attribute or set it */
    attr: function (key, value) {
      return this._access(key, value, function (item, k, val) {
        return val === undefined ? item.getAttribute(k) : item.setAttribute(k, val);
      });
    },

    /** Get a property or set it */
    prop: function (key, value) {
      return this._access(key, value, function (item, k, val) {
        return val === undefined ? item[k] : item[k] = val;
      });
    },
    position: function () {
      return this._first(function (elem) {
        return {
          left: elem.offsetLeft,
          top: elem.offsetTop
        };
      });
    },
    scrollTop: function (value) {
      return this._access('scrollTop', value, function (item, k, val) {
        return val === undefined ? item[k] : item[k] = val;
      });
    },
    outerHeight: function (includeMargin) {
      return this._first(function (elem) {
        var style = getComputedStyle(elem);
        var margins = includeMargin ? parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10) : 0;
        return elem.offsetHeight + margins;
      });
    },

    /**
     * Find the position of the first element in the set
     * relative to its sibling elements.
     */
    index: function () {
      return this._first(function (el) {
        return arrayFrom(el.parentNode.children).indexOf(el);
      }, -1);
    }
  }); // LOOKUP

  Wrap.extend({
    children: function (selector) {
      var childs = [];
      this.each(function (i, item) {
        childs = childs.concat(map(item.children, function (item) {
          return item;
        }));
      });
      return Wrap.Constructor(childs).filter(selector);
    },
    siblings: function () {
      var sibs = [];
      this.each(function (i, item) {
        sibs = sibs.concat(filter(item.parentNode.children, function (child) {
          return child !== item;
        }));
      });
      return Wrap.Constructor(sibs);
    },

    /** Return the parent of each element in the current set */
    parent: function () {
      var par = map(this.elements, function (item) {
        return item.parentNode;
      });
      return Wrap.Constructor(par);
    },

    /** Return ALL parents of each element in the current set */
    parents: function (selector) {
      var par = [];
      this.each(function (i, item) {
        for (var p = item.parentElement; p; p = p.parentElement) par.push(p);
      });
      return Wrap.Constructor(par).filter(selector);
    },

    /**
     * Get the descendants of each element in the set, filtered by a selector
     * Selector can't start with ">" (:scope not supported on IE).
     */
    find: function (selector) {
      var found = [];
      this.each(function (i, item) {
        found = found.concat(map(item.querySelectorAll(
        /*':scope ' + */
        selector), function (fitem) {
          return fitem;
        }));
      });
      return Wrap.Constructor(found);
    },

    /** filter the actual set based on given selector */
    filter: function (selector) {
      if (!selector) return this;
      var res = filter(this.elements, function (item) {
        return matches(item, selector);
      });
      return Wrap.Constructor(res);
    },

    /** Works only with a string selector */
    is: function (selector) {
      var found = false;
      this.each(function (i, item) {
        return !(found = matches(item, selector));
      });
      return found;
    }
  }); // ELEMENTS

  Wrap.extend({
    /**
     * append current set to given node
     * expects a dom node or set
     * if element is a set, prepends only the first
     */
    appendTo: function (elem) {
      elem = elem.nodeType ? elem : elem._first();
      return this.each(function (i, item) {
        elem.appendChild(item);
      });
    },

    /**
     * Append a domNode to each element in the set
     * if element is a set, append only the first
     */
    append: function (elem) {
      elem = elem.nodeType ? elem : elem._first();
      return this.each(function (i, item) {
        item.appendChild(elem);
      });
    },

    /**
     * Insert the current set of elements after the element
     * that matches the given selector in param
     */
    insertAfter: function (selector) {
      var target = document.querySelector(selector);
      return this.each(function (i, item) {
        target.parentNode.insertBefore(item, target.nextSibling);
      });
    },

    /**
     * Clones all element in the set
     * returns a new set with the cloned elements
     */
    clone: function () {
      var clones = map(this.elements, function (item) {
        return item.cloneNode(true);
      });
      return Wrap.Constructor(clones);
    },

    /** Remove all node in the set from DOM. */
    remove: function () {
      this.each(function (i, item) {
        delete item.events;
        delete item.data;
        if (item.parentNode) item.parentNode.removeChild(item);
      });

      this._setup([]);
    }
  }); // DATASETS

  Wrap.extend({
    /**
     * Expected key in camelCase format
     * if value provided save data into element set
     * if not, return data for the first element
     */
    data: function (key, value) {
      var hasJSON = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
          dataAttr = 'data-' + key.replace(/[A-Z]/g, '-$&').toLowerCase();

      if (value === undefined) {
        return this._first(function (el) {
          if (el.data && el.data[key]) return el.data[key];else {
            var data = el.getAttribute(dataAttr);
            if (data === 'true') return true;
            if (data === 'false') return false;
            if (data === +data + '') return +data;
            if (hasJSON.test(data)) return JSON.parse(data);
            return data;
          }
        });
      } else {
        return this.each(function (i, item) {
          item.data = item.data || {};
          item.data[key] = value;
        });
      }
    }
  }); // EVENTS

  Wrap.extend({
    trigger: function (type) {
      type = type.split('.')[0]; // ignore namespace

      var event = document.createEvent('HTMLEvents');
      event.initEvent(type, true, false);
      return this.each(function (i, item) {
        item.dispatchEvent(event);
      });
    },
    blur: function () {
      return this.trigger('blur');
    },
    focus: function () {
      return this.trigger('focus');
    },
    on: function (event, callback) {
      return this.each(function (i, item) {
        if (!item.events) item.events = new EventHandler();
        event.split(' ').forEach(function (ev) {
          item.events.bind(ev, callback, item);
        });
      });
    },
    off: function (event) {
      return this.each(function (i, item) {
        if (item.events) {
          item.events.unbind(event, item);
          delete item.events;
        }
      });
    }
  }); // CLASSES

  Wrap.extend({
    toggleClass: function (classname) {
      return this._classes('toggle', classname);
    },
    addClass: function (classname) {
      return this._classes('add', classname);
    },
    removeClass: function (classname) {
      return this._classes('remove', classname);
    },
    hasClass: function (classname) {
      return this._classes('contains', classname);
    }
  });
  /**
   * Some basic features in this template relies on Bootstrap
   * plugins, like Collapse, Dropdown and Tab.
   * Below code emulates plugins behavior by toggling classes
   * from elements to allow a minimum interaction without animation.
   * - Only Collapse is required which is used by the sidebar.
   * - Tab and Dropdown are optional features.
   */
  // Emulate jQuery symbol to simplify usage

  var $ = Wrap.Constructor; // Emulates Collapse plugin

  Wrap.extend({
    collapse: function (action) {
      return this.each(function (i, item) {
        var $item = $(item).trigger(action + '.bs.collapse');
        if (action === 'toggle') $item.collapse($item.hasClass('show') ? 'hide' : 'show');else $item[action === 'show' ? 'addClass' : 'removeClass']('show');
      });
    }
  }); // Initializations

  $('[data-toggle]').on('click', function (e) {
    var target = $(e.currentTarget);
    if (target.is('a')) e.preventDefault();

    switch (target.data('toggle')) {
      case 'collapse':
        $(target.attr('href')).collapse('toggle');
        break;

      case 'tab':
        target.parent().parent().find('.active').removeClass('active');
        target.addClass('active');
        var tabPane = $(target.attr('href'));
        tabPane.siblings().removeClass('active show');
        tabPane.addClass('active show');
        break;

      case 'dropdown':
        var dd = target.parent().toggleClass('show');
        dd.find('.dropdown-menu').toggleClass('show');
        break;

      default:
        break;
    }
  });
  return Wrap.Constructor;
});
/*!
 *
 * Angle - Bootstrap Admin Template
 *
 * Version: 4.7.8
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */


(function () {
  'use strict';

  $(function () {
    // Restore body classes
    // -----------------------------------
    var $body = $('body');
    new StateToggler().restoreState($body); // enable settings toggle after restore

    $('#chk-fixed').prop('checked', $body.hasClass('layout-fixed'));
    $('#chk-collapsed').prop('checked', $body.hasClass('aside-collapsed'));
    $('#chk-collapsed-text').prop('checked', $body.hasClass('aside-collapsed-text'));
    $('#chk-boxed').prop('checked', $body.hasClass('layout-boxed'));
    $('#chk-float').prop('checked', $body.hasClass('aside-float'));
    $('#chk-hover').prop('checked', $body.hasClass('aside-hover')); // When ready display the offsidebar

    $('.offsidebar.d-none').removeClass('d-none');
  }); // doc ready
})(); // Knob chart
// -----------------------------------


(function () {
  'use strict';

  $(initKnob);

  function initKnob() {
    if (!$.fn.knob) return;
    var knobLoaderOptions1 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['info']
    };
    $('#knob-chart1').knob(knobLoaderOptions1);
    var knobLoaderOptions2 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['purple'],
      readOnly: true
    };
    $('#knob-chart2').knob(knobLoaderOptions2);
    var knobLoaderOptions3 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['info'],
      bgColor: APP_COLORS['gray'],
      angleOffset: -125,
      angleArc: 250
    };
    $('#knob-chart3').knob(knobLoaderOptions3);
    var knobLoaderOptions4 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['pink'],
      displayPrevious: true,
      thickness: 0.1,
      lineCap: 'round'
    };
    $('#knob-chart4').knob(knobLoaderOptions4);
  }
})(); // Chart JS
// -----------------------------------


(function () {
  'use strict';

  $(initChartJS);

  function initChartJS() {
    if (typeof Chart === 'undefined') return; // random values for demo

    var rFactor = function () {
      return Math.round(Math.random() * 100);
    }; // Line chart
    // -----------------------------------


    var lineData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(114,102,186,0.2)',
        borderColor: 'rgba(114,102,186,1)',
        pointBorderColor: '#fff',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(35,183,229,0.2)',
        borderColor: 'rgba(35,183,229,1)',
        pointBorderColor: '#fff',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }]
    };
    var lineOptions = {
      legend: {
        display: false
      }
    };
    var linectx = document.getElementById('chartjs-linechart').getContext('2d');
    var lineChart = new Chart(linectx, {
      data: lineData,
      type: 'line',
      options: lineOptions
    }); // Bar chart
    // -----------------------------------

    var barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        backgroundColor: '#23b7e5',
        borderColor: '#23b7e5',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }, {
        backgroundColor: '#5d9cec',
        borderColor: '#5d9cec',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }]
    };
    var barOptions = {
      legend: {
        display: false
      }
    };
    var barctx = document.getElementById('chartjs-barchart').getContext('2d');
    var barChart = new Chart(barctx, {
      data: barData,
      type: 'bar',
      options: barOptions
    }); //  Doughnut chart
    // -----------------------------------

    var doughnutData = {
      labels: ['Purple', 'Yellow', 'Blue'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#7266ba', '#fad732', '#23b7e5'],
        hoverBackgroundColor: ['#7266ba', '#fad732', '#23b7e5']
      }]
    };
    var doughnutOptions = {
      legend: {
        display: false
      }
    };
    var doughnutctx = document.getElementById('chartjs-doughnutchart').getContext('2d');
    var doughnutChart = new Chart(doughnutctx, {
      data: doughnutData,
      type: 'doughnut',
      options: doughnutOptions
    }); // Pie chart
    // -----------------------------------

    var pieData = {
      labels: ['Purple', 'Yellow', 'Blue'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#7266ba', '#fad732', '#23b7e5'],
        hoverBackgroundColor: ['#7266ba', '#fad732', '#23b7e5']
      }]
    };
    var pieOptions = {
      legend: {
        display: false
      }
    };
    var piectx = document.getElementById('chartjs-piechart').getContext('2d');
    var pieChart = new Chart(piectx, {
      data: pieData,
      type: 'pie',
      options: pieOptions
    }); // Polar chart
    // -----------------------------------

    var polarData = {
      datasets: [{
        data: [11, 16, 7, 3],
        backgroundColor: ['#f532e5', '#7266ba', '#f532e5', '#7266ba'],
        label: 'My dataset' // for legend

      }],
      labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4']
    };
    var polarOptions = {
      legend: {
        display: false
      }
    };
    var polarctx = document.getElementById('chartjs-polarchart').getContext('2d');
    var polarChart = new Chart(polarctx, {
      data: polarData,
      type: 'polarArea',
      options: polarOptions
    }); // Radar chart
    // -----------------------------------

    var radarData = {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(114,102,186,0.2)',
        borderColor: 'rgba(114,102,186,1)',
        data: [65, 59, 90, 81, 56, 55, 40]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151,187,205,0.2)',
        borderColor: 'rgba(151,187,205,1)',
        data: [28, 48, 40, 19, 96, 27, 100]
      }]
    };
    var radarOptions = {
      legend: {
        display: false
      }
    };
    var radarctx = document.getElementById('chartjs-radarchart').getContext('2d');
    var radarChart = new Chart(radarctx, {
      data: radarData,
      type: 'radar',
      options: radarOptions
    });
  }
})(); // Chartist
// -----------------------------------


(function () {
  'use strict';

  $(initChartists);

  function initChartists() {
    if (typeof Chartist === 'undefined') return; // Bar bipolar
    // -----------------------------------

    var data1 = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      series: [[1, 2, 4, 8, 6, -2, -1, -4, -6, -2]]
    };
    var options1 = {
      high: 10,
      low: -10,
      height: 280,
      axisX: {
        labelInterpolationFnc: function (value, index) {
          return index % 2 === 0 ? value : null;
        }
      }
    };
    new Chartist.Bar('#ct-bar1', data1, options1); // Bar Horizontal
    // -----------------------------------

    new Chartist.Bar('#ct-bar2', {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      series: [[5, 4, 3, 7, 5, 10, 3], [3, 2, 9, 5, 4, 6, 4]]
    }, {
      seriesBarDistance: 10,
      reverseData: true,
      horizontalBars: true,
      height: 280,
      axisY: {
        offset: 70
      }
    }); // Line
    // -----------------------------------

    new Chartist.Line('#ct-line1', {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      series: [[12, 9, 7, 8, 5], [2, 1, 3.5, 7, 3], [1, 3, 4, 5, 6]]
    }, {
      fullWidth: true,
      height: 280,
      chartPadding: {
        right: 40
      }
    }); // SVG Animation
    // -----------------------------------

    var chart1 = new Chartist.Line('#ct-line3', {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      series: [[1, 5, 2, 5, 4, 3], [2, 3, 4, 8, 1, 2], [5, 4, 3, 2, 1, 0.5]]
    }, {
      low: 0,
      showArea: true,
      showPoint: false,
      fullWidth: true,
      height: 300
    });
    chart1.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 2000 * data.index,
            dur: 2000,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      }
    }); // Slim animation
    // -----------------------------------

    var chart = new Chartist.Line('#ct-line2', {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      series: [[12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6], [4, 5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5], [5, 3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4], [3, 4, 5, 6, 7, 6, 4, 5, 6, 7, 6, 3]]
    }, {
      low: 0,
      height: 300
    }); // Let's put a sequence number aside so we can use it in the event callbacks

    var seq = 0,
        delays = 80,
        durations = 500; // Once the chart is fully created we reset the sequence

    chart.on('created', function () {
      seq = 0;
    }); // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations

    chart.on('draw', function (data) {
      seq++;

      if (data.type === 'line') {
        // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
        data.element.animate({
          opacity: {
            // The delay when we like to start the animation
            begin: seq * delays + 1000,
            // Duration of the animation
            dur: durations,
            // The value where the animation should start
            from: 0,
            // The value where it should end
            to: 1
          }
        });
      } else if (data.type === 'label' && data.axis === 'x') {
        data.element.animate({
          y: {
            begin: seq * delays,
            dur: durations,
            from: data.y + 100,
            to: data.y,
            // We can specify an easing function from Chartist.Svg.Easing
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'label' && data.axis === 'y') {
        data.element.animate({
          x: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 100,
            to: data.x,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'point') {
        data.element.animate({
          x1: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          x2: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'grid') {
        // Using data.axis we get x or y which we can use to construct our animation definition objects
        var pos1Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '1'] - 30,
          to: data[data.axis.units.pos + '1'],
          easing: 'easeOutQuart'
        };
        var pos2Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '2'] - 100,
          to: data[data.axis.units.pos + '2'],
          easing: 'easeOutQuart'
        };
        var animations = {};
        animations[data.axis.units.pos + '1'] = pos1Animation;
        animations[data.axis.units.pos + '2'] = pos2Animation;
        animations['opacity'] = {
          begin: seq * delays,
          dur: durations,
          from: 0,
          to: 1,
          easing: 'easeOutQuart'
        };
        data.element.animate(animations);
      }
    }); // For the sake of the example we update the chart every time it's created with a delay of 10 seconds

    chart.on('created', function () {
      if (window.__exampleAnimateTimeout) {
        clearTimeout(window.__exampleAnimateTimeout);
        window.__exampleAnimateTimeout = null;
      }

      window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
    });
  }
})(); // Easypie chart Loader
// -----------------------------------


(function () {
  'use strict';

  $(initEasyPieChart);

  function initEasyPieChart() {
    if (!$.fn.easyPieChart) return; // Usage via data attributes
    // <div class="easypie-chart" data-easypiechart data-percent="X" data-optionName="value"></div>

    $('[data-easypiechart]').each(function () {
      var $elem = $(this);
      var options = $elem.data();
      $elem.easyPieChart(options || {});
    }); // programmatic usage

    var pieOptions1 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['success'],
      trackColor: false,
      scaleColor: false,
      lineWidth: 10,
      lineCap: 'circle'
    };
    $('#easypie1').easyPieChart(pieOptions1);
    var pieOptions2 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['warning'],
      trackColor: false,
      scaleColor: false,
      lineWidth: 4,
      lineCap: 'circle'
    };
    $('#easypie2').easyPieChart(pieOptions2);
    var pieOptions3 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['danger'],
      trackColor: false,
      scaleColor: APP_COLORS['gray'],
      lineWidth: 15,
      lineCap: 'circle'
    };
    $('#easypie3').easyPieChart(pieOptions3);
    var pieOptions4 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['danger'],
      trackColor: APP_COLORS['yellow'],
      scaleColor: APP_COLORS['gray-dark'],
      lineWidth: 15,
      lineCap: 'circle'
    };
    $('#easypie4').easyPieChart(pieOptions4);
  }
})(); // CHART SPLINE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotSpline);

  function initFlotSpline() {
    var data = [{
      "label": "Uniques",
      "color": "#768294",
      "data": [["Mar", 70], ["Apr", 85], ["May", 59], ["Jun", 93], ["Jul", 66], ["Aug", 86], ["Sep", 60]]
    }, {
      "label": "Recurrent",
      "color": "#1f92fe",
      "data": [["Mar", 21], ["Apr", 12], ["May", 27], ["Jun", 24], ["Jul", 16], ["Aug", 39], ["Sep", 15]]
    }];
    var datav2 = [{
      "label": "Hours",
      "color": "#23b7e5",
      "data": [["Jan", 70], ["Feb", 20], ["Mar", 70], ["Apr", 85], ["May", 59], ["Jun", 93], ["Jul", 66], ["Aug", 86], ["Sep", 60], ["Oct", 60], ["Nov", 12], ["Dec", 50]]
    }, {
      "label": "Commits",
      "color": "#7266ba",
      "data": [["Jan", 20], ["Feb", 70], ["Mar", 30], ["Apr", 50], ["May", 85], ["Jun", 43], ["Jul", 96], ["Aug", 36], ["Sep", 80], ["Oct", 10], ["Nov", 72], ["Dec", 31]]
    }];
    var datav3 = [{
      "label": "Home",
      "color": "#1ba3cd",
      "data": [["1", 38], ["2", 40], ["3", 42], ["4", 48], ["5", 50], ["6", 70], ["7", 145], ["8", 70], ["9", 59], ["10", 48], ["11", 38], ["12", 29], ["13", 30], ["14", 22], ["15", 28]]
    }, {
      "label": "Overall",
      "color": "#3a3f51",
      "data": [["1", 16], ["2", 18], ["3", 17], ["4", 16], ["5", 30], ["6", 110], ["7", 19], ["8", 18], ["9", 110], ["10", 19], ["11", 16], ["12", 10], ["13", 20], ["14", 10], ["15", 20]]
    }];
    var options = {
      series: {
        lines: {
          show: false
        },
        points: {
          show: true,
          radius: 4
        },
        splines: {
          show: true,
          tension: 0.4,
          lineWidth: 1,
          fill: 0.5
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function (label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        min: 0,
        max: 150,
        // optional: use it for a clear represetation
        tickColor: '#eee',
        //position: 'right' or 'left',
        tickFormatter: function (v) {
          return v
          /* + ' visitors'*/
          ;
        }
      },
      shadowSize: 0
    };
    var chart = $('.chart-spline');
    if (chart.length) $.plot(chart, data, options);
    var chartv2 = $('.chart-splinev2');
    if (chartv2.length) $.plot(chartv2, datav2, options);
    var chartv3 = $('.chart-splinev3');
    if (chartv3.length) $.plot(chartv3, datav3, options);
  }
})(); // CHART AREA
// -----------------------------------


(function () {
  'use strict';

  $(initFlotArea);

  function initFlotArea() {
    var data = [{
      "label": "Uniques",
      "color": "#aad874",
      "data": [["Mar", 50], ["Apr", 84], ["May", 52], ["Jun", 88], ["Jul", 69], ["Aug", 92], ["Sep", 58]]
    }, {
      "label": "Recurrent",
      "color": "#7dc7df",
      "data": [["Mar", 13], ["Apr", 44], ["May", 44], ["Jun", 27], ["Jul", 38], ["Aug", 11], ["Sep", 39]]
    }];
    var options = {
      series: {
        lines: {
          show: true,
          fill: 0.8
        },
        points: {
          show: true,
          radius: 4
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function (label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        min: 0,
        tickColor: '#eee',
        // position: 'right' or 'left'
        tickFormatter: function (v) {
          return v + ' visitors';
        }
      },
      shadowSize: 0
    };
    var chart = $('.chart-area');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART BAR
// -----------------------------------


(function () {
  'use strict';

  $(initFlotBar);

  function initFlotBar() {
    var data = [{
      "label": "Sales",
      "color": "#9cd159",
      "data": [["Jan", 27], ["Feb", 82], ["Mar", 56], ["Apr", 14], ["May", 28], ["Jun", 77], ["Jul", 23], ["Aug", 49], ["Sep", 81], ["Oct", 20]]
    }];
    var options = {
      series: {
        bars: {
          align: 'center',
          lineWidth: 0,
          show: true,
          barWidth: 0.6,
          fill: 0.9
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function (label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-bar');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART BAR STACKED
// -----------------------------------


(function () {
  'use strict';

  $(initFlotBarStacked);

  function initFlotBarStacked() {
    var data = [{
      "label": "Tweets",
      "color": "#51bff2",
      "data": [["Jan", 56], ["Feb", 81], ["Mar", 97], ["Apr", 44], ["May", 24], ["Jun", 85], ["Jul", 94], ["Aug", 78], ["Sep", 52], ["Oct", 17], ["Nov", 90], ["Dec", 62]]
    }, {
      "label": "Likes",
      "color": "#4a8ef1",
      "data": [["Jan", 69], ["Feb", 135], ["Mar", 14], ["Apr", 100], ["May", 100], ["Jun", 62], ["Jul", 115], ["Aug", 22], ["Sep", 104], ["Oct", 132], ["Nov", 72], ["Dec", 61]]
    }, {
      "label": "+1",
      "color": "#f0693a",
      "data": [["Jan", 29], ["Feb", 36], ["Mar", 47], ["Apr", 21], ["May", 5], ["Jun", 49], ["Jul", 37], ["Aug", 44], ["Sep", 28], ["Oct", 9], ["Nov", 12], ["Dec", 35]]
    }];
    var datav2 = [{
      "label": "Pending",
      "color": "#9289ca",
      "data": [["Pj1", 86], ["Pj2", 136], ["Pj3", 97], ["Pj4", 110], ["Pj5", 62], ["Pj6", 85], ["Pj7", 115], ["Pj8", 78], ["Pj9", 104], ["Pj10", 82], ["Pj11", 97], ["Pj12", 110], ["Pj13", 62]]
    }, {
      "label": "Assigned",
      "color": "#7266ba",
      "data": [["Pj1", 49], ["Pj2", 81], ["Pj3", 47], ["Pj4", 44], ["Pj5", 100], ["Pj6", 49], ["Pj7", 94], ["Pj8", 44], ["Pj9", 52], ["Pj10", 17], ["Pj11", 47], ["Pj12", 44], ["Pj13", 100]]
    }, {
      "label": "Completed",
      "color": "#564aa3",
      "data": [["Pj1", 29], ["Pj2", 56], ["Pj3", 14], ["Pj4", 21], ["Pj5", 5], ["Pj6", 24], ["Pj7", 37], ["Pj8", 22], ["Pj9", 28], ["Pj10", 9], ["Pj11", 14], ["Pj12", 21], ["Pj13", 5]]
    }];
    var options = {
      series: {
        stack: true,
        bars: {
          align: 'center',
          lineWidth: 0,
          show: true,
          barWidth: 0.6,
          fill: 0.9
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function (label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-bar-stacked');
    if (chart.length) $.plot(chart, data, options);
    var chartv2 = $('.chart-bar-stackedv2');
    if (chartv2.length) $.plot(chartv2, datav2, options);
  }
})(); // CHART DONUT
// -----------------------------------


(function () {
  'use strict';

  $(initFlotDonut);

  function initFlotDonut() {
    var data = [{
      "color": "#39C558",
      "data": 60,
      "label": "Coffee"
    }, {
      "color": "#00b4ff",
      "data": 90,
      "label": "CSS"
    }, {
      "color": "#FFBE41",
      "data": 50,
      "label": "LESS"
    }, {
      "color": "#ff3e43",
      "data": 80,
      "label": "Jade"
    }, {
      "color": "#937fc7",
      "data": 116,
      "label": "AngularJS"
    }];
    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0.5 // This makes the donut shape

        }
      }
    };
    var chart = $('.chart-donut');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART LINE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotLine);

  function initFlotLine() {
    var data = [{
      "label": "Complete",
      "color": "#5ab1ef",
      "data": [["Jan", 188], ["Feb", 183], ["Mar", 185], ["Apr", 199], ["May", 190], ["Jun", 194], ["Jul", 194], ["Aug", 184], ["Sep", 74]]
    }, {
      "label": "In Progress",
      "color": "#f5994e",
      "data": [["Jan", 153], ["Feb", 116], ["Mar", 136], ["Apr", 119], ["May", 148], ["Jun", 133], ["Jul", 118], ["Aug", 161], ["Sep", 59]]
    }, {
      "label": "Cancelled",
      "color": "#d87a80",
      "data": [["Jan", 111], ["Feb", 97], ["Mar", 93], ["Apr", 110], ["May", 102], ["Jun", 93], ["Jul", 92], ["Aug", 92], ["Sep", 44]]
    }];
    var options = {
      series: {
        lines: {
          show: true,
          fill: 0.01
        },
        points: {
          show: true,
          radius: 4
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function (label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#eee',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-line');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART PIE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotPie);

  function initFlotPie() {
    var data = [{
      "label": "jQuery",
      "color": "#4acab4",
      "data": 30
    }, {
      "label": "CSS",
      "color": "#ffea88",
      "data": 40
    }, {
      "label": "LESS",
      "color": "#ff8153",
      "data": 90
    }, {
      "label": "SASS",
      "color": "#878bb6",
      "data": 75
    }, {
      "label": "Jade",
      "color": "#b2d767",
      "data": 120
    }];
    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0,
          label: {
            show: true,
            radius: 0.8,
            formatter: function (label, series) {
              return '<div class="flot-pie-label">' + //label + ' : ' +
              Math.round(series.percent) + '%</div>';
            },
            background: {
              opacity: 0.8,
              color: '#222'
            }
          }
        }
      }
    };
    var chart = $('.chart-pie');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // Morris
// -----------------------------------


(function () {
  'use strict';

  $(initMorris);

  function initMorris() {
    if (typeof Morris === 'undefined') return;
    var chartdata = [{
      y: "2006",
      a: 100,
      b: 90
    }, {
      y: "2007",
      a: 75,
      b: 65
    }, {
      y: "2008",
      a: 50,
      b: 40
    }, {
      y: "2009",
      a: 75,
      b: 65
    }, {
      y: "2010",
      a: 50,
      b: 40
    }, {
      y: "2011",
      a: 75,
      b: 65
    }, {
      y: "2012",
      a: 100,
      b: 90
    }];
    var donutdata = [{
      label: "Download Sales",
      value: 12
    }, {
      label: "In-Store Sales",
      value: 30
    }, {
      label: "Mail-Order Sales",
      value: 20
    }]; // Line Chart
    // -----------------------------------

    new Morris.Line({
      element: 'morris-line',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Serie A", "Serie B"],
      lineColors: ["#31C0BE", "#7a92a3"],
      resize: true
    }); // Donut Chart
    // -----------------------------------

    new Morris.Donut({
      element: 'morris-donut',
      data: donutdata,
      colors: ['#f05050', '#fad732', '#ff902b'],
      resize: true
    }); // Bar Chart
    // -----------------------------------

    new Morris.Bar({
      element: 'morris-bar',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Series A", "Series B"],
      xLabelMargin: 2,
      barColors: ['#23b7e5', '#f05050'],
      resize: true
    }); // Area Chart
    // -----------------------------------

    new Morris.Area({
      element: 'morris-area',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Serie A", "Serie B"],
      lineColors: ['#7266ba', '#23b7e5'],
      resize: true
    });
  }
})(); // Rickshaw
// -----------------------------------


(function () {
  'use strict';

  $(initMorris);

  function initMorris() {
    if (typeof Rickshaw === 'undefined') return;
    var seriesData = [[], [], []];
    var random = new Rickshaw.Fixtures.RandomData(150);

    for (var i = 0; i < 150; i++) {
      random.addData(seriesData);
    }

    var series1 = [{
      color: "#c05020",
      data: seriesData[0],
      name: 'New York'
    }, {
      color: "#30c020",
      data: seriesData[1],
      name: 'London'
    }, {
      color: "#6060c0",
      data: seriesData[2],
      name: 'Tokyo'
    }];
    var graph1 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw1"),
      series: series1,
      renderer: 'area'
    });
    graph1.render(); // Graph 2
    // -----------------------------------

    var graph2 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw2"),
      renderer: 'area',
      stroke: true,
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#f05050'
      }, {
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#fad732'
      }]
    });
    graph2.render(); // Graph 3
    // -----------------------------------

    var graph3 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw3"),
      renderer: 'line',
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#7266ba'
      }, {
        data: [{
          x: 0,
          y: 20
        }, {
          x: 1,
          y: 24
        }, {
          x: 2,
          y: 19
        }, {
          x: 3,
          y: 15
        }, {
          x: 4,
          y: 16
        }],
        color: '#23b7e5'
      }]
    });
    graph3.render(); // Graph 4
    // -----------------------------------

    var graph4 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw4"),
      renderer: 'bar',
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#fad732'
      }, {
        data: [{
          x: 0,
          y: 20
        }, {
          x: 1,
          y: 24
        }, {
          x: 2,
          y: 19
        }, {
          x: 3,
          y: 15
        }, {
          x: 4,
          y: 16
        }],
        color: '#ff902b'
      }]
    });
    graph4.render();
  }
})(); // SPARKLINE
// -----------------------------------


(function () {
  'use strict';

  $(initSparkline);

  function initSparkline() {
    $('[data-sparkline]').each(initSparkLine);

    function initSparkLine() {
      var $element = $(this),
          options = $element.data(),
          values = options.values && options.values.split(',');
      options.type = options.type || 'bar'; // default chart is bar

      options.disableHiddenCheck = true;
      $element.sparkline(values, options);

      if (options.resize) {
        $(window).resize(function () {
          $element.sparkline(values, options);
        });
      }
    }
  }
})(); // Start Bootstrap JS
// -----------------------------------


(function () {
  'use strict';

  $(initBootstrap);

  function initBootstrap() {
    // necessary check at least til BS doesn't require jQuery
    if (!$.fn || !$.fn.tooltip || !$.fn.popover) return; // POPOVER
    // -----------------------------------

    $('[data-toggle="popover"]').popover(); // TOOLTIP
    // -----------------------------------

    $('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    }); // DROPDOWN INPUTS
    // -----------------------------------

    $('.dropdown input').on('click focus', function (event) {
      event.stopPropagation();
    });
  }
})(); // Module: card-tools
// -----------------------------------


(function () {
  'use strict';

  $(initCardDismiss);
  $(initCardCollapse);
  $(initCardRefresh);
  /**
   * Helper function to find the closest
   * ascending .card element
   */

  function getCardParent(item) {
    var el = item.parentElement;

    while (el && !el.classList.contains('card')) el = el.parentElement;

    return el;
  }
  /**
   * Helper to trigger custom event
   */


  function triggerEvent(type, item, data) {
    var ev;

    if (typeof CustomEvent === 'function') {
      ev = new CustomEvent(type, {
        detail: data
      });
    } else {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(type, true, false, data);
    }

    item.dispatchEvent(ev);
  }
  /**
   * Dismiss cards
   * [data-tool="card-dismiss"]
   */


  function initCardDismiss() {
    var cardtoolSelector = '[data-tool="card-dismiss"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      new CardDismiss(item);
    });

    function CardDismiss(item) {
      var EVENT_REMOVE = 'card.remove';
      var EVENT_REMOVED = 'card.removed';
      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.removing = false; // prevents double execution

      this.clickHandler = function (e) {
        if (this.removing) return;
        this.removing = true; // pass callbacks via event.detail to confirm/cancel the removal

        triggerEvent(EVENT_REMOVE, this.cardParent, {
          confirm: this.confirm.bind(this),
          cancel: this.cancel.bind(this)
        });
      };

      this.confirm = function () {
        this.animate(this.cardParent, function () {
          triggerEvent(EVENT_REMOVED, this.cardParent);
          this.remove(this.cardParent);
        });
      };

      this.cancel = function () {
        this.removing = false;
      };

      this.animate = function (item, cb) {
        if ('onanimationend' in window) {
          // animation supported
          item.addEventListener('animationend', cb.bind(this));
          item.className += ' animated bounceOut'; // requires animate.css
        } else cb.call(this); // no animation, just remove

      };

      this.remove = function (item) {
        item.parentNode.removeChild(item);
      }; // attach listener


      item.addEventListener('click', this.clickHandler.bind(this), false);
    }
  }
  /**
   * Collapsed cards
   * [data-tool="card-collapse"]
   * [data-start-collapsed]
   */


  function initCardCollapse() {
    var cardtoolSelector = '[data-tool="card-collapse"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      var initialState = item.hasAttribute('data-start-collapsed');
      new CardCollapse(item, initialState);
    });

    function CardCollapse(item, startCollapsed) {
      var EVENT_SHOW = 'card.collapse.show';
      var EVENT_HIDE = 'card.collapse.hide';
      this.state = true; // true -> show / false -> hide

      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.wrapper = this.cardParent.querySelector('.card-wrapper');

      this.toggleCollapse = function (action) {
        triggerEvent(action ? EVENT_SHOW : EVENT_HIDE, this.cardParent);
        this.wrapper.style.maxHeight = (action ? this.wrapper.scrollHeight : 0) + 'px';
        this.state = action;
        this.updateIcon(action);
      };

      this.updateIcon = function (action) {
        this.item.firstElementChild.className = action ? 'fa fa-minus' : 'fa fa-plus';
      };

      this.clickHandler = function () {
        this.toggleCollapse(!this.state);
      };

      this.initStyles = function () {
        this.wrapper.style.maxHeight = this.wrapper.scrollHeight + 'px';
        this.wrapper.style.transition = 'max-height 0.5s';
        this.wrapper.style.overflow = 'hidden';
      }; // prepare styles for collapse animation


      this.initStyles(); // set initial state if provided

      if (startCollapsed) {
        this.toggleCollapse(false);
      } // attach listener


      this.item.addEventListener('click', this.clickHandler.bind(this), false);
    }
  }
  /**
   * Refresh cards
   * [data-tool="card-refresh"]
   * [data-spinner="standard"]
   */


  function initCardRefresh() {
    var cardtoolSelector = '[data-tool="card-refresh"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      new CardRefresh(item);
    });

    function CardRefresh(item) {
      var EVENT_REFRESH = 'card.refresh';
      var WHIRL_CLASS = 'whirl';
      var DEFAULT_SPINNER = 'standard';
      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.spinner = ((this.item.dataset || {}).spinner || DEFAULT_SPINNER).split(' '); // support space separated classes

      this.refresh = function (e) {
        var card = this.cardParent; // start showing the spinner

        this.showSpinner(card, this.spinner); // attach as public method

        card.removeSpinner = this.removeSpinner.bind(this); // Trigger the event and send the card

        triggerEvent(EVENT_REFRESH, card, {
          card: card
        });
      };

      this.showSpinner = function (card, spinner) {
        card.classList.add(WHIRL_CLASS);
        spinner.forEach(function (s) {
          card.classList.add(s);
        });
      };

      this.removeSpinner = function () {
        this.cardParent.classList.remove(WHIRL_CLASS);
      }; // attach listener


      this.item.addEventListener('click', this.refresh.bind(this), false);
    }
  }
})(); // GLOBAL CONSTANTS
// -----------------------------------


(function () {
  window.APP_COLORS = {
    'primary': '#5d9cec',
    'success': '#27c24c',
    'info': '#23b7e5',
    'warning': '#ff902b',
    'danger': '#f05050',
    'inverse': '#131e26',
    'green': '#37bc9b',
    'pink': '#f532e5',
    'purple': '#7266ba',
    'dark': '#3a3f51',
    'yellow': '#fad732',
    'gray-darker': '#232735',
    'gray-dark': '#3a3f51',
    'gray': '#dde6e9',
    'gray-light': '#e4eaec',
    'gray-lighter': '#edf1f2'
  };
  window.APP_MEDIAQUERY = {
    'desktopLG': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
  };
})(); // FULLSCREEN
// -----------------------------------


(function () {
  'use strict';

  $(initScreenFull);

  function initScreenFull() {
    if (typeof screenfull === 'undefined') return;
    var $doc = $(document);
    var $fsToggler = $('[data-toggle-fullscreen]'); // Not supported under IE

    var ua = window.navigator.userAgent;

    if (ua.indexOf("MSIE ") > 0 || !!ua.match(/Trident.*rv\:11\./)) {
      $fsToggler.addClass('d-none'); // hide element

      return; // and abort
    }

    $fsToggler.on('click', function (e) {
      e.preventDefault();

      if (screenfull.enabled) {
        screenfull.toggle(); // Switch icon indicator

        toggleFSIcon($fsToggler);
      } else {
        console.log('Fullscreen not enabled');
      }
    });
    if (screenfull.raw && screenfull.raw.fullscreenchange) $doc.on(screenfull.raw.fullscreenchange, function () {
      toggleFSIcon($fsToggler);
    });

    function toggleFSIcon($element) {
      if (screenfull.isFullscreen) $element.children('em').removeClass('fa-expand').addClass('fa-compress');else $element.children('em').removeClass('fa-compress').addClass('fa-expand');
    }
  }
})(); // LOAD CUSTOM CSS
// -----------------------------------


(function () {
  'use strict';

  $(initLoadCSS);

  function initLoadCSS() {
    $('[data-load-css]').on('click', function (e) {
      var element = $(this);
      if (element.is('a')) e.preventDefault();
      var uri = element.data('loadCss'),
          link;

      if (uri) {
        link = createLink(uri);

        if (!link) {
          $.error('Error creating stylesheet link element.');
        }
      } else {
        $.error('No stylesheet location defined.');
      }
    });
  }

  function createLink(uri) {
    var linkId = 'autoloaded-stylesheet',
        oldLink = $('#' + linkId).attr('id', linkId + '-old');
    $('head').append($('<link/>').attr({
      'id': linkId,
      'rel': 'stylesheet',
      'href': uri
    }));

    if (oldLink.length) {
      oldLink.remove();
    }

    return $('#' + linkId);
  }
})(); // TRANSLATION
// -----------------------------------


(function () {
  'use strict';

  $(initTranslation);
  var pathPrefix = '/Content/i18n'; // folder of json files

  var STORAGEKEY = 'jq-appLang';
  var savedLanguage = Storages.localStorage.get(STORAGEKEY);

  function initTranslation() {
    i18next.use(i18nextXHRBackend) // .use(LanguageDetector)
    .init({
      fallbackLng: savedLanguage || 'en',
      backend: {
        loadPath: pathPrefix + '/{{ns}}-{{lng}}.json'
      },
      ns: ['site'],
      defaultNS: 'site',
      debug: false
    }, function (err, t) {
      // initialize elements
      applyTranlations(); // listen to language changes

      attachChangeListener();
    });

    function applyTranlations() {
      var list = [].slice.call(document.querySelectorAll('[data-localize]'));
      list.forEach(function (item) {
        var key = item.getAttribute('data-localize');
        if (i18next.exists(key)) item.innerHTML = i18next.t(key);
      });
    }

    function attachChangeListener() {
      var list = [].slice.call(document.querySelectorAll('[data-set-lang]'));
      list.forEach(function (item) {
        item.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') e.preventDefault();
          var lang = item.getAttribute('data-set-lang');

          if (lang) {
            i18next.changeLanguage(lang, function (err) {
              if (err) console.log(err);else {
                applyTranlations();
                Storages.localStorage.set(STORAGEKEY, lang);
              }
            });
          }

          activateDropdown(item);
        });
      });
    }

    function activateDropdown(item) {
      if (item.classList.contains('dropdown-item')) {
        item.parentElement.previousElementSibling.innerHTML = item.innerHTML;
      }
    }
  }
})(); // NAVBAR SEARCH
// -----------------------------------


(function () {
  'use strict';

  $(initNavbarSearch);

  function initNavbarSearch() {
    var navSearch = new navbarSearchInput(); // Open search input

    var $searchOpen = $('[data-search-open]');
    $searchOpen.on('click', function (e) {
      e.stopPropagation();
    }).on('click', navSearch.toggle); // Close search input

    var $searchDismiss = $('[data-search-dismiss]');
    var inputSelector = '.navbar-form input[type="text"]';
    $(inputSelector).on('click', function (e) {
      e.stopPropagation();
    }).on('keyup', function (e) {
      if (e.keyCode == 27) // ESC
        navSearch.dismiss();
    }); // click anywhere closes the search

    $(document).on('click', navSearch.dismiss); // dismissable options

    $searchDismiss.on('click', function (e) {
      e.stopPropagation();
    }).on('click', navSearch.dismiss);
  }

  var navbarSearchInput = function () {
    var navbarFormSelector = 'form.navbar-form';
    return {
      toggle: function () {
        var navbarForm = $(navbarFormSelector);
        navbarForm.toggleClass('open');
        var isOpen = navbarForm.hasClass('open');
        navbarForm.find('input')[isOpen ? 'focus' : 'blur']();
      },
      dismiss: function () {
        $(navbarFormSelector).removeClass('open') // Close control
        .find('input[type="text"]').blur() // remove focus
        // .val('')                    // Empty input
        ;
      }
    };
  };
})(); // NOW TIMER
// -----------------------------------


(function () {
  'use strict';

  $(initNowTimer);

  function initNowTimer() {
    if (typeof moment === 'undefined') return;
    $('[data-now]').each(function () {
      var element = $(this),
          format = element.data('format');

      function updateTime() {
        var dt = moment(new Date()).format(format);
        element.text(dt);
      }

      updateTime();
      setInterval(updateTime, 1000);
    });
  }
})(); // Toggle RTL mode for demo
// -----------------------------------


(function () {
  'use strict';

  $(initRTL);

  function initRTL() {
    var maincss = $('#maincss');
    var bscss = $('#bscss');
    $('#chk-rtl').on('change', function () {
      // app rtl check
      maincss.attr('href', this.checked ? '/Content/css/app-rtl.css' : '/Content/css/app.css'); // bootstrap rtl check

      bscss.attr('href', this.checked ? '/Content/css/bootstrap-rtl.css' : '/Content/css/bootstrap.css');
    });
  }
})(); // SIDEBAR
// -----------------------------------


(function () {
  'use strict';

  $(initSidebar);
  var $html;
  var $body;
  var $sidebar;

  function initSidebar() {
    $html = $('html');
    $body = $('body');
    $sidebar = $('.sidebar'); // AUTOCOLLAPSE ITEMS
    // -----------------------------------

    var sidebarCollapse = $sidebar.find('.collapse');
    sidebarCollapse.on('show.bs.collapse', function (event) {
      event.stopPropagation();
      if ($(this).parents('.collapse').length === 0) sidebarCollapse.filter('.show').collapse('hide');
    }); // SIDEBAR ACTIVE STATE
    // -----------------------------------
    // Find current active item

    var currentItem = $('.sidebar .active').parents('li'); // hover mode don't try to expand active collapse

    if (!useAsideHover()) currentItem.addClass('active') // activate the parent
    .children('.collapse') // find the collapse
    .collapse('show'); // and show it
    // remove this if you use only collapsible sidebar items

    $sidebar.find('li > a + ul').on('show.bs.collapse', function (e) {
      if (useAsideHover()) e.preventDefault();
    }); // SIDEBAR COLLAPSED ITEM HANDLER
    // -----------------------------------

    var eventName = isTouch() ? 'click' : 'mouseenter';
    var subNav = $();
    $sidebar.find('.sidebar-nav > li').on(eventName, function (e) {
      if (isSidebarCollapsed() || useAsideHover()) {
        subNav.trigger('mouseleave');
        subNav = toggleMenuItem($(this)); // Used to detect click and touch events outside the sidebar

        sidebarAddBackdrop();
      }
    });
    var sidebarAnyclickClose = $sidebar.data('sidebarAnyclickClose'); // Allows to close

    if (typeof sidebarAnyclickClose !== 'undefined') {
      $('.wrapper').on('click.sidebar', function (e) {
        // don't check if sidebar not visible
        if (!$body.hasClass('aside-toggled')) return;
        var $target = $(e.target);

        if (!$target.parents('.aside-container').length && // if not child of sidebar
        !$target.is('#user-block-toggle') && // user block toggle anchor
        !$target.parent().is('#user-block-toggle') // user block toggle icon
        ) {
            $body.removeClass('aside-toggled');
          }
      });
    }
  }

  function sidebarAddBackdrop() {
    var $backdrop = $('<div/>', {
      'class': 'sideabr-backdrop'
    });
    $backdrop.insertAfter('.aside-container').on("click mouseenter", function () {
      removeFloatingNav();
    });
  } // Open the collapse sidebar submenu items when on touch devices
  // - desktop only opens on hover


  function toggleTouchItem($element) {
    $element.siblings('li').removeClass('open');
    $element.toggleClass('open');
  } // Handles hover to open items under collapsed menu
  // -----------------------------------


  function toggleMenuItem($listItem) {
    removeFloatingNav();
    var ul = $listItem.children('ul');
    if (!ul.length) return $();

    if ($listItem.hasClass('open')) {
      toggleTouchItem($listItem);
      return $();
    }

    var $aside = $('.aside-container');
    var $asideInner = $('.aside-inner'); // for top offset calculation
    // float aside uses extra padding on aside

    var mar = parseInt($asideInner.css('padding-top'), 0) + parseInt($aside.css('padding-top'), 0);
    var subNav = ul.clone().appendTo($aside);
    toggleTouchItem($listItem);
    var itemTop = $listItem.position().top + mar - $sidebar.scrollTop();
    var vwHeight = document.body.clientHeight;
    subNav.addClass('nav-floating').css({
      position: isFixed() ? 'fixed' : 'absolute',
      top: itemTop,
      bottom: subNav.outerHeight(true) + itemTop > vwHeight ? 0 : 'auto'
    });
    subNav.on('mouseleave', function () {
      toggleTouchItem($listItem);
      subNav.remove();
    });
    return subNav;
  }

  function removeFloatingNav() {
    $('.sidebar-subnav.nav-floating').remove();
    $('.sideabr-backdrop').remove();
    $('.sidebar li.open').removeClass('open');
  }

  function isTouch() {
    return $html.hasClass('touch');
  }

  function isSidebarCollapsed() {
    return $body.hasClass('aside-collapsed') || $body.hasClass('aside-collapsed-text');
  }

  function isSidebarToggled() {
    return $body.hasClass('aside-toggled');
  }

  function isMobile() {
    return document.body.clientWidth < APP_MEDIAQUERY.tablet;
  }

  function isFixed() {
    return $body.hasClass('layout-fixed');
  }

  function useAsideHover() {
    return $body.hasClass('aside-hover');
  }
})(); // SLIMSCROLL
// -----------------------------------


(function () {
  'use strict';

  $(initSlimsSroll);

  function initSlimsSroll() {
    if (!$.fn || !$.fn.slimScroll) return;
    $('[data-scrollable]').each(function () {
      var element = $(this),
          defaultHeight = 250;
      element.slimScroll({
        height: element.data('height') || defaultHeight
      });
    });
  }
})(); // Table Check All
// -----------------------------------


(function () {
  'use strict';

  $(initTableCheckAll);

  function initTableCheckAll() {
    $('[data-check-all]').on('change', function () {
      var $this = $(this),
          index = $this.index() + 1,
          checkbox = $this.find('input[type="checkbox"]'),
          table = $this.parents('table'); // Make sure to affect only the correct checkbox column

      table.find('tbody > tr > td:nth-child(' + index + ') input[type="checkbox"]').prop('checked', checkbox[0].checked);
    });
  }
})(); // TOGGLE STATE
// -----------------------------------


(function () {
  'use strict';

  $(initToggleState);

  function initToggleState() {
    var $body = $('body');
    var toggle = new StateToggler();
    $('[data-toggle-state]').on('click', function (e) {
      // e.preventDefault();
      e.stopPropagation();
      var element = $(this),
          classname = element.data('toggleState'),
          target = element.data('target'),
          noPersist = element.attr('data-no-persist') !== undefined; // Specify a target selector to toggle classname
      // use body by default

      var $target = target ? $(target) : $body;

      if (classname) {
        if ($target.hasClass(classname)) {
          $target.removeClass(classname);
          if (!noPersist) toggle.removeState(classname);
        } else {
          $target.addClass(classname);
          if (!noPersist) toggle.addState(classname);
        }
      } // some elements may need this when toggled class change the content size


      if (typeof Event === 'function') {
        // modern browsers
        window.dispatchEvent(new Event('resize'));
      } else {
        // old browsers and IE
        var resizeEvent = window.document.createEvent('UIEvents');
        resizeEvent.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(resizeEvent);
      }
    });
  } // Handle states to/from localstorage


  var StateToggler = function () {
    var STORAGE_KEY_NAME = 'jq-toggleState';
    /** Add a state to the browser storage to be restored later */

    this.addState = function (classname) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);
      if (data instanceof Array) data.push(classname);else data = [classname];
      Storages.localStorage.set(STORAGE_KEY_NAME, data);
    };
    /** Remove a state from the browser storage */


    this.removeState = function (classname) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);

      if (data) {
        var index = data.indexOf(classname);
        if (index !== -1) data.splice(index, 1);
        Storages.localStorage.set(STORAGE_KEY_NAME, data);
      }
    };
    /** Load the state string and restore the classlist */


    this.restoreState = function ($elem) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);
      if (data instanceof Array) $elem.addClass(data.join(' '));
    };
  };

  window.StateToggler = StateToggler;
})();
/**=========================================================
 * Module: trigger-resize.js
 * Triggers a window resize event from any element
 =========================================================*/


(function () {
  'use strict';

  $(initTriggerResize);

  function initTriggerResize() {
    var element = $('[data-trigger-resize]');
    var value = element.data('triggerResize');
    element.on('click', function () {
      setTimeout(function () {
        // all IE friendly dispatchEvent
        var evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt); // modern dispatchEvent way
        // window.dispatchEvent(new Event('resize'));
      }, value || 300);
    });
  }
})(); // Full Calendar
// -----------------------------------


(function () {
  'use strict';

  if (typeof FullCalendar === 'undefined') return; // When dom ready, init calendar and events

  $(initExternalEvents);
  $(initFullCalendar);

  function initFullCalendar() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable;
    /* initialize the external events */

    var containerEl = document.getElementById('external-events-list');
    new Draggable(containerEl, {
      itemSelector: '.fce-event',
      eventData: function (eventEl) {
        return {
          title: eventEl.innerText.trim()
        };
      }
    });
    /* initialize the calendar */

    var calendarEl = document.getElementById('calendar');
    var calendar = new Calendar(calendarEl, {
      events: createDemoEvents(),
      plugins: ['interaction', 'dayGrid', 'timeGrid', 'list', 'bootstrap'],
      themeSystem: 'bootstrap',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      editable: true,
      droppable: true,
      // this allows things to be dropped onto the calendar
      eventReceive: function (info) {
        var styles = getComputedStyle(info.draggedEl);
        info.event.setProp('backgroundColor', styles.backgroundColor);
        info.event.setProp('borderColor', styles.borderColor); // is the "remove after drop" checkbox checked?

        if (document.getElementById('drop-remove').checked) {
          // if so, remove the element from the "Draggable Events" list
          info.draggedEl.parentNode.removeChild(info.draggedEl);
        }
      }
    });
    calendar.render();
  }

  function initExternalEvents() {
    var colorSelectorContainer = document.getElementById('external-event-color-selector');
    var addEventButton = document.getElementById('external-event-add-btn');
    var eventNameInput = document.getElementById('external-event-name');
    var colorSelectors = [].slice.call(colorSelectorContainer.querySelectorAll('.circle'));
    var currentSelector = colorSelectorContainer.querySelector('.circle'); // select first as default

    var containerEl = document.getElementById('external-events-list'); // control the color selector selectable behavior

    colorSelectors.forEach(function (sel) {
      sel.addEventListener('click', selectColorSelector(sel));
    }); // Create and add a new event to the list

    addEventButton.addEventListener('click', addNewExternalEvent);

    function selectColorSelector(sel) {
      return function (e) {
        // deselect all
        colorSelectors.forEach(unselectAllColorSelector); // select current

        sel.classList.add('selected');
        currentSelector = sel;
      };
    }

    function unselectAllColorSelector(el) {
      el.classList.remove('selected');
    }

    function addNewExternalEvent() {
      var name = eventNameInput.value;

      if (name) {
        var el = createElement(currentSelector);
        el.innerText = name;
        containerEl.insertBefore(el, containerEl.firstChild); // preppend
      }
    }

    function createElement(baseElement) {
      var styles = getComputedStyle(currentSelector);
      var element = document.createElement('div');
      element.style.backgroundColor = styles.backgroundColor;
      element.style.borderColor = styles.borderColor;
      element.style.color = '#fff';
      element.className = 'fce-event'; // make draggable

      return element;
    }
  }
  /**
   * Creates an array of events to display in the first load of the calendar
   * Wrap into this function a request to a source to get via ajax the stored events
   * @return Array The array with the events
   */


  function createDemoEvents() {
    // Date for the calendar events (dummy data)
    var date = new Date();
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();
    return [{
      title: 'All Day Event',
      start: new Date(y, m, 1),
      backgroundColor: '#f56954',
      //red
      borderColor: '#f56954' //red

    }, {
      title: 'Long Event',
      start: new Date(y, m, d - 5),
      end: new Date(y, m, d - 2),
      backgroundColor: '#f39c12',
      //yellow
      borderColor: '#f39c12' //yellow

    }, {
      title: 'Meeting',
      start: new Date(y, m, d, 10, 30),
      allDay: false,
      backgroundColor: '#0073b7',
      //Blue
      borderColor: '#0073b7' //Blue

    }, {
      title: 'Lunch',
      start: new Date(y, m, d, 12, 0),
      end: new Date(y, m, d, 14, 0),
      allDay: false,
      backgroundColor: '#00c0ef',
      //Info (aqua)
      borderColor: '#00c0ef' //Info (aqua)

    }, {
      title: 'Birthday Party',
      start: new Date(y, m, d + 1, 19, 0),
      end: new Date(y, m, d + 1, 22, 30),
      allDay: false,
      backgroundColor: '#00a65a',
      //Success (green)
      borderColor: '#00a65a' //Success (green)

    }, {
      title: 'Open Google',
      start: new Date(y, m, 28),
      end: new Date(y, m, 29),
      url: '//google.com/',
      backgroundColor: '#3c8dbc',
      //Primary (light-blue)
      borderColor: '#3c8dbc' //Primary (light-blue)

    }];
  }
})(); // JQCloud
// -----------------------------------


(function () {
  'use strict';

  $(initWordCloud);

  function initWordCloud() {
    if (!$.fn.jQCloud) return; //Create an array of word objects, each representing a word in the cloud

    var word_array = [{
      text: 'Lorem',
      weight: 13
      /*link: 'http://themicon.co'*/

    }, {
      text: 'Ipsum',
      weight: 10.5
    }, {
      text: 'Dolor',
      weight: 9.4
    }, {
      text: 'Sit',
      weight: 8
    }, {
      text: 'Amet',
      weight: 6.2
    }, {
      text: 'Consectetur',
      weight: 5
    }, {
      text: 'Adipiscing',
      weight: 5
    }, {
      text: 'Sit',
      weight: 8
    }, {
      text: 'Amet',
      weight: 6.2
    }, {
      text: 'Consectetur',
      weight: 5
    }, {
      text: 'Adipiscing',
      weight: 5
    }];
    $("#jqcloud").jQCloud(word_array, {
      width: 240,
      height: 200,
      steps: 7
    });
  }
})(); // Search Results
// -----------------------------------


(function () {
  'use strict';

  $(initSearch);

  function initSearch() {
    if (!$.fn.slider) return;
    if (!$.fn.chosen) return;
    if (!$.fn.datepicker) return; // BOOTSTRAP SLIDER CTRL
    // -----------------------------------

    $('[data-ui-slider]').slider(); // CHOSEN
    // -----------------------------------

    $('.chosen-select').chosen(); // DATETIMEPICKER
    // -----------------------------------

    $('#datetimepicker').datepicker({
      orientation: 'bottom',
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash'
      }
    });
  }
})(); // Demo Cards
// -----------------------------------


(function () {
  'use strict';

  $(initCardDemo);

  function initCardDemo() {
    /**
     * This functions show a demonstration of how to use
     * the card tools system via custom event.
     */
    var cardList = [].slice.call(document.querySelectorAll('.card.card-demo'));
    cardList.forEach(function (item) {
      item.addEventListener('card.refresh', function (event) {
        // get the card element that is refreshing
        var card = event.detail.card; // perform any action here, when it is done,
        // remove the spinner calling "removeSpinner"
        // setTimeout used to simulate async operation

        setTimeout(card.removeSpinner, 3000);
      });
      item.addEventListener('card.collapse.hide', function () {
        console.log('Card Collapse Hide');
      });
      item.addEventListener('card.collapse.show', function () {
        console.log('Card Collapse Show');
      });
      item.addEventListener('card.remove', function (event) {
        var confirm = event.detail.confirm;
        var cancel = event.detail.cancel; // perform any action  here

        console.log('Removing Card'); // Call confirm() to continue removing card
        // otherwise call cancel()

        confirm();
      });
      item.addEventListener('card.removed', function (event) {
        console.log('Removed Card');
      });
    });
  }
})(); // Nestable demo
// -----------------------------------


(function () {
  'use strict';

  $(initNestable);

  function initNestable() {
    if (!$.fn.nestable) return;

    var updateOutput = function (e) {
      var list = e.length ? e : $(e.target),
          output = list.data('output');

      if (window.JSON) {
        output.val(window.JSON.stringify(list.nestable('serialize'))); //, null, 2));
      } else {
        output.val('JSON browser support required for this demo.');
      }
    }; // activate Nestable for list 1


    $('#nestable').nestable({
      group: 1
    }).on('change', updateOutput); // activate Nestable for list 2

    $('#nestable2').nestable({
      group: 1
    }).on('change', updateOutput); // output initial serialised data

    updateOutput($('#nestable').data('output', $('#nestable-output')));
    updateOutput($('#nestable2').data('output', $('#nestable2-output')));
    $('.js-nestable-action').on('click', function (e) {
      var target = $(e.target),
          action = target.data('action');

      if (action === 'expand-all') {
        $('.dd').nestable('expandAll');
      }

      if (action === 'collapse-all') {
        $('.dd').nestable('collapseAll');
      }
    });
  }
})();
/**=========================================================
 * Module: notify.js
 * Create toggleable notifications that fade out automatically.
 * Based on Notify addon from UIKit (http://getuikit.com/docs/addons_notify.html)
 * [data-toggle="notify"]
 * [data-options="options in json format" ]
 =========================================================*/


(function () {
  'use strict';

  $(initNotify);

  function initNotify() {
    var Selector = '[data-notify]',
        autoloadSelector = '[data-onload]',
        doc = $(document);
    $(Selector).each(function () {
      var $this = $(this),
          onload = $this.data('onload');

      if (onload !== undefined) {
        setTimeout(function () {
          notifyNow($this);
        }, 800);
      }

      $this.on('click', function (e) {
        e.preventDefault();
        notifyNow($this);
      });
    });
  }

  function notifyNow($element) {
    var message = $element.data('message'),
        options = $element.data('options');
    if (!message) $.error('Notify: No message specified');
    $.notify(message, options || {});
  }
})();
/**
 * Notify Addon definition as jQuery plugin
 * Adapted version to work with Bootstrap classes
 * More information http://getuikit.com/docs/addons_notify.html
 */


(function () {
  var containers = {},
      messages = {},
      notify = function (options) {
    if ($.type(options) == 'string') {
      options = {
        message: options
      };
    }

    if (arguments[1]) {
      options = $.extend(options, $.type(arguments[1]) == 'string' ? {
        status: arguments[1]
      } : arguments[1]);
    }

    return new Message(options).show();
  },
      closeAll = function (group, instantly) {
    if (group) {
      for (var id in messages) {
        if (group === messages[id].group) messages[id].close(instantly);
      }
    } else {
      for (var id in messages) {
        messages[id].close(instantly);
      }
    }
  };

  var Message = function (options) {
    var $this = this;
    this.options = $.extend({}, Message.defaults, options);
    this.uuid = "ID" + new Date().getTime() + "RAND" + Math.ceil(Math.random() * 100000);
    this.element = $([// alert-dismissable enables bs close icon
    '<div class="uk-notify-message alert-dismissable">', '<a class="close">&times;</a>', '<div>' + this.options.message + '</div>', '</div>'].join('')).data("notifyMessage", this); // status

    if (this.options.status) {
      this.element.addClass('alert alert-' + this.options.status);
      this.currentstatus = this.options.status;
    }

    this.group = this.options.group;
    messages[this.uuid] = this;

    if (!containers[this.options.pos]) {
      containers[this.options.pos] = $('<div class="uk-notify uk-notify-' + this.options.pos + '"></div>').appendTo('body').on("click", ".uk-notify-message", function () {
        $(this).data("notifyMessage").close();
      });
    }
  };

  $.extend(Message.prototype, {
    uuid: false,
    element: false,
    timout: false,
    currentstatus: "",
    group: false,
    show: function () {
      if (this.element.is(":visible")) return;
      var $this = this;
      containers[this.options.pos].show().prepend(this.element);
      var marginbottom = parseInt(this.element.css("margin-bottom"), 10);
      this.element.css({
        "opacity": 0,
        "margin-top": -1 * this.element.outerHeight(),
        "margin-bottom": 0
      }).animate({
        "opacity": 1,
        "margin-top": 0,
        "margin-bottom": marginbottom
      }, function () {
        if ($this.options.timeout) {
          var closefn = function () {
            $this.close();
          };

          $this.timeout = setTimeout(closefn, $this.options.timeout);
          $this.element.hover(function () {
            clearTimeout($this.timeout);
          }, function () {
            $this.timeout = setTimeout(closefn, $this.options.timeout);
          });
        }
      });
      return this;
    },
    close: function (instantly) {
      var $this = this,
          finalize = function () {
        $this.element.remove();

        if (!containers[$this.options.pos].children().length) {
          containers[$this.options.pos].hide();
        }

        delete messages[$this.uuid];
      };

      if (this.timeout) clearTimeout(this.timeout);

      if (instantly) {
        finalize();
      } else {
        this.element.animate({
          "opacity": 0,
          "margin-top": -1 * this.element.outerHeight(),
          "margin-bottom": 0
        }, function () {
          finalize();
        });
      }
    },
    content: function (html) {
      var container = this.element.find(">div");

      if (!html) {
        return container.html();
      }

      container.html(html);
      return this;
    },
    status: function (status) {
      if (!status) {
        return this.currentstatus;
      }

      this.element.removeClass('alert alert-' + this.currentstatus).addClass('alert alert-' + status);
      this.currentstatus = status;
      return this;
    }
  });
  Message.defaults = {
    message: "",
    status: "normal",
    timeout: 5000,
    group: null,
    pos: 'top-center'
  };
  $["notify"] = notify;
  $["notify"].message = Message;
  $["notify"].closeAll = closeAll;
  return notify;
})();
/**=========================================================
 * Module: portlet.js
 * Drag and drop any card to change its position
 * The Selector should could be applied to any object that contains
 * card, so .col-* element are ideal.
 =========================================================*/


(function () {
  'use strict';

  var STORAGE_KEY_NAME = 'jq-portletState';
  $(initPortlets);

  function initPortlets() {
    // Component is NOT optional
    if (!$.fn.sortable) return;
    var Selector = '[data-toggle="portlet"]';
    $(Selector).sortable({
      connectWith: Selector,
      items: 'div.card',
      handle: '.portlet-handler',
      opacity: 0.7,
      placeholder: 'portlet box-placeholder',
      cancel: '.portlet-cancel',
      forcePlaceholderSize: true,
      iframeFix: false,
      tolerance: 'pointer',
      helper: 'original',
      revert: 200,
      forceHelperSize: true,
      update: savePortletOrder,
      create: loadPortletOrder
    }) // optionally disables mouse selection
    //.disableSelection()
    ;
  }

  function savePortletOrder(event, ui) {
    var data = Storages.localStorage.get(STORAGE_KEY_NAME);

    if (!data) {
      data = {};
    }

    data[this.id] = $(this).sortable('toArray');

    if (data) {
      Storages.localStorage.set(STORAGE_KEY_NAME, data);
    }
  }

  function loadPortletOrder() {
    var data = Storages.localStorage.get(STORAGE_KEY_NAME);

    if (data) {
      var porletId = this.id,
          cards = data[porletId];

      if (cards) {
        var portlet = $('#' + porletId);
        $.each(cards, function (index, value) {
          $('#' + value).appendTo(portlet);
        });
      }
    }
  } // Reset porlet save state


  window.resetPorlets = function (e) {
    Storages.localStorage.remove(STORAGE_KEY_NAME); // reload the page

    window.location.reload();
  };
})(); // HTML5 Sortable demo
// -----------------------------------


(function () {
  'use strict';

  $(initSortable);

  function initSortable() {
    if (typeof sortable === 'undefined') return;
    sortable('.sortable', {
      forcePlaceholderSize: true,
      placeholder: '<div class="box-placeholder p0 m0"><div></div></div>'
    });
  }
})(); // Sweet Alert
// -----------------------------------


(function () {
  'use strict';

  $(initSweetAlert);

  function initSweetAlert() {
    $('#swal-demo1').on('click', function (e) {
      e.preventDefault();
      swal("Here's a message!");
    });
    $('#swal-demo2').on('click', function (e) {
      e.preventDefault();
      swal("Here's a message!", "It's pretty, isn't it?");
    });
    $('#swal-demo3').on('click', function (e) {
      e.preventDefault();
      swal("Good job!", "You clicked the button!", "success");
    });
    $('#swal-demo4').on('click', function (e) {
      e.preventDefault();
      swal({
        title: 'Are you sure?',
        text: 'Your will not be able to recover this imaginary file!',
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: {
            text: 'Yes, delete it!',
            value: true,
            visible: true,
            className: "bg-danger",
            closeModal: true
          }
        }
      }).then(function () {
        swal('Booyah!');
      });
    });
    $('#swal-demo5').on('click', function (e) {
      e.preventDefault();
      swal({
        title: 'Are you sure?',
        text: 'Your will not be able to recover this imaginary file!',
        icon: 'warning',
        buttons: {
          cancel: {
            text: 'No, cancel plx!',
            value: null,
            visible: true,
            className: "",
            closeModal: false
          },
          confirm: {
            text: 'Yes, delete it!',
            value: true,
            visible: true,
            className: "bg-danger",
            closeModal: false
          }
        }
      }).then(function (isConfirm) {
        if (isConfirm) {
          swal('Deleted!', 'Your imaginary file has been deleted.', 'success');
        } else {
          swal('Cancelled', 'Your imaginary file is safe :)', 'error');
        }
      });
    });
  }
})(); // Color picker
// -----------------------------------


(function () {
  'use strict';

  $(initColorPicker);

  function initColorPicker() {
    if (!$.fn.colorpicker) return;
    $('.demo-colorpicker').colorpicker();
    $('#demo_selectors').colorpicker({
      colorSelectors: {
        'default': '#777777',
        'primary': APP_COLORS['primary'],
        'success': APP_COLORS['success'],
        'info': APP_COLORS['info'],
        'warning': APP_COLORS['warning'],
        'danger': APP_COLORS['danger']
      }
    });
  }
})(); // Forms Demo
// -----------------------------------


(function () {
  'use strict';

  $(initFormsDemo);

  function initFormsDemo() {
    if (!$.fn.slider) return;
    if (!$.fn.chosen) return;
    if (!$.fn.inputmask) return;
    if (!$.fn.filestyle) return;
    if (!$.fn.wysiwyg) return;
    if (!$.fn.datepicker) return; // BOOTSTRAP SLIDER CTRL
    // -----------------------------------

    $('[data-ui-slider]').slider(); // CHOSEN
    // -----------------------------------

    $('.chosen-select').chosen(); // MASKED
    // -----------------------------------

    $('[data-masked]').inputmask(); // FILESTYLE
    // -----------------------------------

    $('.filestyle').filestyle(); // WYSIWYG
    // -----------------------------------

    $('.wysiwyg').wysiwyg(); // DATETIMEPICKER
    // -----------------------------------

    $('#datetimepicker1').datepicker({
      orientation: 'bottom',
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash'
      }
    }); // only time

    $('#datetimepicker2').datepicker({
      format: 'mm-dd-yyyy'
    });
  }
})();
/**=========================================================
 * Module: Image Cropper
 =========================================================*/


(function () {
  'use strict';

  $(initImageCropper);

  function initImageCropper() {
    if (!$.fn.cropper) return;
    var $image = $('.img-container > img'),
        $dataX = $('#dataX'),
        $dataY = $('#dataY'),
        $dataHeight = $('#dataHeight'),
        $dataWidth = $('#dataWidth'),
        $dataRotate = $('#dataRotate'),
        options = {
      // data: {
      //   x: 420,
      //   y: 60,
      //   width: 640,
      //   height: 360
      // },
      // strict: false,
      // responsive: false,
      // checkImageOrigin: false
      // modal: false,
      // guides: false,
      // highlight: false,
      // background: false,
      // autoCrop: false,
      // autoCropArea: 0.5,
      // dragCrop: false,
      // movable: false,
      // rotatable: false,
      // zoomable: false,
      // touchDragZoom: false,
      // mouseWheelZoom: false,
      // cropBoxMovable: false,
      // cropBoxResizable: false,
      // doubleClickToggle: false,
      // minCanvasWidth: 320,
      // minCanvasHeight: 180,
      // minCropBoxWidth: 160,
      // minCropBoxHeight: 90,
      // minContainerWidth: 320,
      // minContainerHeight: 180,
      // build: null,
      // built: null,
      // dragstart: null,
      // dragmove: null,
      // dragend: null,
      // zoomin: null,
      // zoomout: null,
      aspectRatio: 16 / 9,
      preview: '.img-preview',
      crop: function (data) {
        $dataX.val(Math.round(data.x));
        $dataY.val(Math.round(data.y));
        $dataHeight.val(Math.round(data.height));
        $dataWidth.val(Math.round(data.width));
        $dataRotate.val(Math.round(data.rotate));
      }
    };
    $image.on({
      'build.cropper': function (e) {
        console.log(e.type);
      },
      'built.cropper': function (e) {
        console.log(e.type);
      },
      'dragstart.cropper': function (e) {
        console.log(e.type, e.dragType);
      },
      'dragmove.cropper': function (e) {
        console.log(e.type, e.dragType);
      },
      'dragend.cropper': function (e) {
        console.log(e.type, e.dragType);
      },
      'zoomin.cropper': function (e) {
        console.log(e.type);
      },
      'zoomout.cropper': function (e) {
        console.log(e.type);
      },
      'change.cropper': function (e) {
        console.log(e.type);
      }
    }).cropper(options); // Methods

    $(document.body).on('click', '[data-method]', function () {
      var data = $(this).data(),
          $target,
          result;

      if (!$image.data('cropper')) {
        return;
      }

      if (data.method) {
        data = $.extend({}, data); // Clone a new one

        if (typeof data.target !== 'undefined') {
          $target = $(data.target);

          if (typeof data.option === 'undefined') {
            try {
              data.option = JSON.parse($target.val());
            } catch (e) {
              console.log(e.message);
            }
          }
        }

        result = $image.cropper(data.method, data.option);

        if (data.method === 'getCroppedCanvas') {
          $('#getCroppedCanvasModal').modal().find('.modal-body').html(result);
        }

        if ($.isPlainObject(result) && $target) {
          try {
            $target.val(JSON.stringify(result));
          } catch (e) {
            console.log(e.message);
          }
        }
      }
    }).on('keydown', function (e) {
      if (!$image.data('cropper')) {
        return;
      }

      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }
    }); // Import image

    var $inputImage = $('#inputImage'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file;

        if (!$image.data('cropper')) {
          return;
        }

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);
            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset').cropper('replace', blobURL);
            $inputImage.val('');
          } else {
            alert('Please choose an image file.');
          }
        }
      });
    } else {
      $inputImage.parent().remove();
    } // Options


    $('.docs-options :checkbox').on('change', function () {
      var $this = $(this);

      if (!$image.data('cropper')) {
        return;
      }

      options[$this.val()] = $this.prop('checked');
      $image.cropper('destroy').cropper(options);
    }); // Tooltips

    $('[data-toggle="tooltip"]').tooltip();
  }
})(); // Select2
// -----------------------------------


(function () {
  'use strict';

  $(initSelect2);

  function initSelect2() {
    if (!$.fn.select2) return; // Select 2

    $('#select2-1').select2({
      theme: 'bootstrap4'
    });
    $('#select2-2').select2({
      theme: 'bootstrap4'
    });
    $('#select2-3').select2({
      theme: 'bootstrap4'
    });
    $('#select2-4').select2({
      placeholder: 'Select a state',
      allowClear: true,
      theme: 'bootstrap4'
    });
  }
})();

(function () {
  'use strict';

  if (typeof Dropzone === 'undefined') return; // Prevent Dropzone from auto discovering
  // This is useful when you want to create the
  // Dropzone programmatically later

  Dropzone.autoDiscover = false;
  $(initDropzone);

  function initDropzone() {
    // Dropzone settings
    var dropzoneOptions = {
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 100,
      maxFiles: 100,
      dictDefaultMessage: '<em class="fa fa-upload text-muted"></em><br>Drop files here to upload',
      // default messages before first drop
      paramName: 'file',
      // The name that will be used to transfer the file
      maxFilesize: 2,
      // MB
      addRemoveLinks: true,
      accept: function (file, done) {
        if (file.name === 'justinbieber.jpg') {
          done('Naha, you dont. :)');
        } else {
          done();
        }
      },
      init: function () {
        var dzHandler = this;
        this.element.querySelector('button[type=submit]').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          dzHandler.processQueue();
        });
        this.on('addedfile', function (file) {
          console.log('Added file: ' + file.name);
        });
        this.on('removedfile', function (file) {
          console.log('Removed file: ' + file.name);
        });
        this.on('sendingmultiple', function () {});
        this.on('successmultiple', function ()
        /*files, response*/
        {});
        this.on('errormultiple', function ()
        /*files, response*/
        {});
      }
    };
    var dropzoneArea = new Dropzone('#dropzone-area', dropzoneOptions);
  }
})(); // Forms Demo
// -----------------------------------


(function () {
  'use strict';

  $(initWizard);

  function initWizard() {
    if (!$.fn.validate) return; // FORM EXAMPLE
    // -----------------------------------

    var form = $("#example-form");
    form.validate({
      errorPlacement: function errorPlacement(error, element) {
        element.before(error);
      },
      rules: {
        confirm: {
          equalTo: "#password"
        }
      }
    });
    form.children("div").steps({
      headerTag: "h4",
      bodyTag: "fieldset",
      transitionEffect: "slideLeft",
      onStepChanging: function (event, currentIndex, newIndex) {
        form.validate().settings.ignore = ":disabled,:hidden";
        return form.valid();
      },
      onFinishing: function (event, currentIndex) {
        form.validate().settings.ignore = ":disabled";
        return form.valid();
      },
      onFinished: function (event, currentIndex) {
        alert("Submitted!"); // Submit form

        $(this).submit();
      }
    }); // VERTICAL
    // -----------------------------------

    $("#example-vertical").steps({
      headerTag: "h4",
      bodyTag: "section",
      transitionEffect: "slideLeft",
      stepsOrientation: "vertical"
    });
  }
})(); // Xeditable Demo
// -----------------------------------


(function () {
  'use strict';

  $(initXEditable);

  function initXEditable() {
    if (!$.fn.editable) return; // Font Awesome support

    $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit">' + '<i class="fa fa-fw fa-check"></i>' + '</button>' + '<button type="button" class="btn btn-default btn-sm editable-cancel">' + '<i class="fa fa-fw fa-times"></i>' + '</button>'; //defaults
    //$.fn.editable.defaults.url = 'url/to/server';
    //enable / disable

    $('#enable').click(function () {
      $('#user .editable').editable('toggleDisabled');
    }); //editables

    $('#username').editable({
      // url: 'url/to/server',
      type: 'text',
      pk: 1,
      name: 'username',
      title: 'Enter username',
      mode: 'inline'
    });
    $('#firstname').editable({
      validate: function (value) {
        if ($.trim(value) === '') return 'This field is required';
      },
      mode: 'inline'
    });
    $('#sex').editable({
      prepend: "not selected",
      source: [{
        value: 1,
        text: 'Male'
      }, {
        value: 2,
        text: 'Female'
      }],
      display: function (value, sourceData) {
        var colors = {
          "": "gray",
          1: "green",
          2: "blue"
        },
            elem = $.grep(sourceData, function (o) {
          return o.value == value;
        });

        if (elem.length) {
          $(this).text(elem[0].text).css("color", colors[value]);
        } else {
          $(this).empty();
        }
      },
      mode: 'inline'
    });
    $('#status').editable({
      mode: 'inline'
    });
    $('#group').editable({
      showbuttons: false,
      mode: 'inline'
    });
    $('#dob').editable({
      mode: 'inline'
    });
    $('#event').editable({
      placement: 'right',
      combodate: {
        firstItem: 'name'
      },
      mode: 'inline'
    });
    $('#comments').editable({
      showbuttons: 'bottom',
      mode: 'inline'
    });
    $('#note').editable({
      mode: 'inline'
    });
    $('#pencil').click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $('#note').editable('toggle');
    });
    $('#user .editable').on('hidden', function (e, reason) {
      if (reason === 'save' || reason === 'nochange') {
        var $next = $(this).closest('tr').next().find('.editable');

        if ($('#autoopen').is(':checked')) {
          setTimeout(function () {
            $next.editable('show');
          }, 300);
        } else {
          $next.focus();
        }
      }
    }); // TABLE
    // -----------------------------------

    $('#users a').editable({
      type: 'text',
      name: 'username',
      title: 'Enter username',
      mode: 'inline'
    });
  }
})();
/**
 * Used for user pages
 * Login and Register
 */


(function () {
  'use strict';

  $(initParsleyForPages);

  function initParsleyForPages() {
    // Parsley options setup for bootstrap validation classes
    var parsleyOptions = {
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        var el = ParsleyField.$element.parents('.form-group').find('input');
        if (!el.length) // support custom checkbox
          el = ParsleyField.$element.parents('.c-checkbox').find('label');
        return el;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
      },
      errorsWrapper: '<div class="text-help">',
      errorTemplate: '<div></div>'
    }; // Login form validation with Parsley

    var loginForm = $("#loginForm");
    if (loginForm.length) loginForm.parsley(parsleyOptions); // Register form validation with Parsley

    var registerForm = $("#registerForm");
    if (registerForm.length) registerForm.parsley(parsleyOptions);
  }
})();
/**=========================================================
 * Module: gmap.js
 * Init Google Map plugin
 =========================================================*/


(function () {
  'use strict';

  $(initGoogleMaps); // -------------------------
  // Map Style definition
  // -------------------------
  // Get more styles from http://snazzymaps.com/style/29/light-monochrome
  // - Just replace and assign to 'MapStyles' the new style array

  var MapStyles = [{
    featureType: 'water',
    stylers: [{
      visibility: 'on'
    }, {
      color: '#bdd1f9'
    }]
  }, {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{
      color: '#334165'
    }]
  }, {
    featureType: 'landscape',
    stylers: [{
      color: '#e9ebf1'
    }]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{
      color: '#c5c6c6'
    }]
  }, {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{
      color: '#fff'
    }]
  }, {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{
      color: '#fff'
    }]
  }, {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{
      color: '#d8dbe0'
    }]
  }, {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{
      color: '#cfd5e0'
    }]
  }, {
    featureType: 'administrative',
    stylers: [{
      visibility: 'on'
    }, {
      lightness: 33
    }]
  }, {
    featureType: 'poi.park',
    elementType: 'labels',
    stylers: [{
      visibility: 'on'
    }, {
      lightness: 20
    }]
  }, {
    featureType: 'road',
    stylers: [{
      color: '#d8dbe0',
      lightness: 20
    }]
  }];

  function initGoogleMaps() {
    if (!$.fn.gMap) return;
    var mapSelector = '[data-gmap]';
    var gMapRefs = [];
    $(mapSelector).each(function () {
      var $this = $(this),
          addresses = $this.data('address') && $this.data('address').split(';'),
          titles = $this.data('title') && $this.data('title').split(';'),
          zoom = $this.data('zoom') || 14,
          maptype = $this.data('maptype') || 'ROADMAP',
          // or 'TERRAIN'
      markers = [];

      if (addresses) {
        for (var a in addresses) {
          if (typeof addresses[a] == 'string') {
            markers.push({
              address: addresses[a],
              html: titles && titles[a] || '',
              popup: true
              /* Always popup */

            });
          }
        }

        var options = {
          controls: {
            panControl: true,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            overviewMapControl: true
          },
          scrollwheel: false,
          maptype: maptype,
          markers: markers,
          zoom: zoom // More options https://github.com/marioestrada/jQuery-gMap

        };
        var gMap = $this.gMap(options);
        var ref = gMap.data('gMap.reference'); // save in the map references list

        gMapRefs.push(ref); // set the styles

        if ($this.data('styled') !== undefined) {
          ref.setOptions({
            styles: MapStyles
          });
        }
      }
    }); //each
  }
})(); // jVectorMap
// -----------------------------------


(function () {
  'use strict';

  $(initVectorMap);

  function initVectorMap() {
    var element = $('[data-vector-map]');
    var seriesData = {
      'CA': 11100,
      // Canada
      'DE': 2510,
      // Germany
      'FR': 3710,
      // France
      'AU': 5710,
      // Australia
      'GB': 8310,
      // Great Britain
      'RU': 9310,
      // Russia
      'BR': 6610,
      // Brazil
      'IN': 7810,
      // India
      'CN': 4310,
      // China
      'US': 839,
      // USA
      'SA': 410 // Saudi Arabia

    };
    var markersData = [{
      latLng: [41.90, 12.45],
      name: 'Vatican City'
    }, {
      latLng: [43.73, 7.41],
      name: 'Monaco'
    }, {
      latLng: [-0.52, 166.93],
      name: 'Nauru'
    }, {
      latLng: [-8.51, 179.21],
      name: 'Tuvalu'
    }, {
      latLng: [7.11, 171.06],
      name: 'Marshall Islands'
    }, {
      latLng: [17.3, -62.73],
      name: 'Saint Kitts and Nevis'
    }, {
      latLng: [3.2, 73.22],
      name: 'Maldives'
    }, {
      latLng: [35.88, 14.5],
      name: 'Malta'
    }, {
      latLng: [41.0, -71.06],
      name: 'New England'
    }, {
      latLng: [12.05, -61.75],
      name: 'Grenada'
    }, {
      latLng: [13.16, -59.55],
      name: 'Barbados'
    }, {
      latLng: [17.11, -61.85],
      name: 'Antigua and Barbuda'
    }, {
      latLng: [-4.61, 55.45],
      name: 'Seychelles'
    }, {
      latLng: [7.35, 134.46],
      name: 'Palau'
    }, {
      latLng: [42.5, 1.51],
      name: 'Andorra'
    }];
    new VectorMap(element, seriesData, markersData);
  }
})(); // JVECTOR MAP
// -----------------------------------


(function () {
  'use strict'; // Allow Global access

  window.VectorMap = VectorMap;
  var defaultColors = {
    markerColor: '#23b7e5',
    // the marker points
    bgColor: 'transparent',
    // the background
    scaleColors: ['#878c9a'],
    // the color of the region in the serie
    regionFill: '#bbbec6' // the base region color

  };

  function VectorMap(element, seriesData, markersData) {
    if (!element || !element.length) return;
    var attrs = element.data(),
        mapHeight = attrs.height || '300',
        options = {
      markerColor: attrs.markerColor || defaultColors.markerColor,
      bgColor: attrs.bgColor || defaultColors.bgColor,
      scale: attrs.scale || 1,
      scaleColors: attrs.scaleColors || defaultColors.scaleColors,
      regionFill: attrs.regionFill || defaultColors.regionFill,
      mapName: attrs.mapName || 'world_mill_en'
    };
    element.css('height', mapHeight);
    init(element, options, seriesData, markersData);

    function init($element, opts, series, markers) {
      $element.vectorMap({
        map: opts.mapName,
        backgroundColor: opts.bgColor,
        zoomMin: 1,
        zoomMax: 8,
        zoomOnScroll: false,
        regionStyle: {
          initial: {
            'fill': opts.regionFill,
            'fill-opacity': 1,
            'stroke': 'none',
            'stroke-width': 1.5,
            'stroke-opacity': 1
          },
          hover: {
            'fill-opacity': 0.8
          },
          selected: {
            fill: 'blue'
          },
          selectedHover: {}
        },
        focusOn: {
          x: 0.4,
          y: 0.6,
          scale: opts.scale
        },
        markerStyle: {
          initial: {
            fill: opts.markerColor,
            stroke: opts.markerColor
          }
        },
        onRegionLabelShow: function (e, el, code) {
          if (series && series[code]) el.html(el.html() + ': ' + series[code] + ' visitors');
        },
        markers: markers,
        series: {
          regions: [{
            values: series,
            scale: opts.scaleColors,
            normalizeFunction: 'polynomial'
          }]
        }
      });
    } // end init

  }

  ;
})(); // BOOTGRID
// -----------------------------------


(function () {
  'use strict';

  $(initBootgrid);

  function initBootgrid() {
    if (!$.fn.bootgrid) return;
    $('#bootgrid-basic').bootgrid({
      templates: {
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    });
    $('#bootgrid-selection').bootgrid({
      selection: true,
      multiSelect: true,
      rowSelect: true,
      keepSelection: true,
      templates: {
        select: '<div class="custom-control custom-checkbox">' + '<input type="{{ctx.type}}" class="custom-control-input {{css.selectBox}}" id="customCheck1" value="{{ctx.value}}" {{ctx.checked}}>' + '<label class="custom-control-label" for="customCheck1"></label>' + '</div>',
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    });
    var grid = $('#bootgrid-command').bootgrid({
      formatters: {
        commands: function (column, row) {
          return '<button type="button" class="btn btn-sm btn-info mr-2 command-edit" data-row-id="' + row.id + '"><em class="fa fa-edit fa-fw"></em></button>' + '<button type="button" class="btn btn-sm btn-danger command-delete" data-row-id="' + row.id + '"><em class="fa fa-trash fa-fw"></em></button>';
        }
      },
      templates: {
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    }).on('loaded.rs.jquery.bootgrid', function () {
      /* Executes after data is loaded and rendered */
      grid.find('.command-edit').on('click', function () {
        console.log('You pressed edit on row: ' + $(this).data('row-id'));
      }).end().find('.command-delete').on('click', function () {
        console.log('You pressed delete on row: ' + $(this).data('row-id'));
      });
    });
  }
})(); // DATATABLES
// -----------------------------------


(function () {
  'use strict';

  $(initDatatables);

  function initDatatables() {
    if (!$.fn.DataTable) return; // Zero configuration

    $('#datatable1').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: '<em class="fas fa-search"></em>',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      }
    }); // Filter

    $('#datatable2').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: 'Search all columns:',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      },
      // Datatable Buttons setup
      dom: 'Bfrtip',
      buttons: [{
        extend: 'copy',
        className: 'btn-info'
      }, {
        extend: 'csv',
        className: 'btn-info'
      }, {
        extend: 'excel',
        className: 'btn-info',
        title: 'XLS-File'
      }, {
        extend: 'pdf',
        className: 'btn-info',
        title: $('title').text()
      }, {
        extend: 'print',
        className: 'btn-info'
      }]
    });
    $('#datatable3').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: 'Search all columns:',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      },
      // Datatable key setup
      keys: true
    });
  }
})(); // Custom Code
// -----------------------------------


(function () {
  'use strict';

  $(initCustom);

  function initCustom() {// custom code
  }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndyYXBwZXIuanMiLCJhcHAuaW5pdC5qcyIsImNoYXJ0cy9jaGFydC1rbm9iLmpzIiwiY2hhcnRzL2NoYXJ0LmpzIiwiY2hhcnRzL2NoYXJ0aXN0LmpzIiwiY2hhcnRzL2Vhc3lwaWVjaGFydC5qcyIsImNoYXJ0cy9mbG90LmpzIiwiY2hhcnRzL21vcnJpcy5qcyIsImNoYXJ0cy9yaWNrc2hhdy5qcyIsImNoYXJ0cy9zcGFya2xpbmUuanMiLCJjb21tb24vYm9vdHN0cmFwLXN0YXJ0LmpzIiwiY29tbW9uL2NhcmQtdG9vbHMuanMiLCJjb21tb24vY29uc3RhbnRzLmpzIiwiY29tbW9uL2Z1bGxzY3JlZW4uanMiLCJjb21tb24vbG9hZC1jc3MuanMiLCJjb21tb24vbG9jYWxpemUuanMiLCJjb21tb24vbmF2YmFyLXNlYXJjaC5qcyIsImNvbW1vbi9ub3cuanMiLCJjb21tb24vcnRsLmpzIiwiY29tbW9uL3NpZGViYXIuanMiLCJjb21tb24vc2xpbXNjcm9sbC5qcyIsImNvbW1vbi90YWJsZS1jaGVja2FsbC5qcyIsImNvbW1vbi90b2dnbGUtc3RhdGUuanMiLCJjb21tb24vdHJpZ2dlci1yZXNpemUuanMiLCJleHRyYXMvY2FsZW5kYXIuanMiLCJleHRyYXMvanFjbG91ZC5qcyIsImV4dHJhcy9zZWFyY2guanMiLCJlbGVtZW50cy9jYXJkcy5qcyIsImVsZW1lbnRzL25lc3RhYmxlLmpzIiwiZWxlbWVudHMvbm90aWZ5LmpzIiwiZWxlbWVudHMvcG9ybGV0cy5qcyIsImVsZW1lbnRzL3NvcnRhYmxlLmpzIiwiZWxlbWVudHMvc3dlZXRhbGVydC5qcyIsImZvcm1zL2NvbG9yLXBpY2tlci5qcyIsImZvcm1zL2Zvcm1zLmpzIiwiZm9ybXMvaW1hZ2Vjcm9wLmpzIiwiZm9ybXMvc2VsZWN0Mi5qcyIsImZvcm1zL3VwbG9hZC5qcyIsImZvcm1zL3dpemFyZC5qcyIsImZvcm1zL3hlZGl0YWJsZS5qcyIsInBhZ2VzL3BhZ2VzLmpzIiwibWFwcy9nbWFwLmpzIiwibWFwcy92ZWN0b3IubWFwLmRlbW8uanMiLCJtYXBzL3ZlY3Rvci5tYXAuanMiLCJ0YWJsZXMvYm9vdGdyaWQuanMiLCJ0YWJsZXMvZGF0YXRhYmxlLmpzIiwiY3VzdG9tLmpzIl0sIm5hbWVzIjpbImdsb2JhbCIsImZhY3RvcnkiLCJleHBvcnRzIiwibW9kdWxlIiwialF1ZXJ5IiwiJCIsIndpbmRvdyIsImFycmF5RnJvbSIsIm9iaiIsInNsaWNlIiwiY2FsbCIsImZpbHRlciIsImN0eCIsImZuIiwibWFwIiwibWF0Y2hlcyIsIml0ZW0iLCJzZWxlY3RvciIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtc01hdGNoZXNTZWxlY3RvciIsIkV2ZW50SGFuZGxlciIsImV2ZW50cyIsImJpbmQiLCJldmVudCIsImxpc3RlbmVyIiwidGFyZ2V0IiwidHlwZSIsInNwbGl0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInVuYmluZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJXcmFwIiwiX3NldHVwIiwiQ29uc3RydWN0b3IiLCJwYXJhbSIsImF0dHJzIiwiZWwiLCJpbml0IiwiY29uc3RydWN0b3IiLCJlbGVtIiwiX2NyZWF0ZSIsImF0dHIiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJub2RlVHlwZSIsInJlYWR5Iiwic3RyIiwibm9kZU5hbWUiLCJzdWJzdHIiLCJpbmRleE9mIiwicmVwbGFjZSIsImNyZWF0ZUVsZW1lbnQiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJfZmlyc3QiLCJjYiIsInJldCIsImYiLCJfY2xhc3NlcyIsIm1ldGhvZCIsImNsYXNzbmFtZSIsImNscyIsImZvckVhY2giLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImVhY2giLCJfYWNjZXNzIiwia2V5IiwidmFsdWUiLCJrIiwidW5kZWZpbmVkIiwiYXJyIiwiZXh0ZW5kIiwibWV0aG9kcyIsIk9iamVjdCIsImtleXMiLCJtIiwiYXR0YWNoRXZlbnQiLCJyZWFkeVN0YXRlIiwiY3NzIiwiZ2V0U3R5bGUiLCJlIiwic3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwidmFsIiwidW5pdCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInByb3AiLCJwb3NpdGlvbiIsImxlZnQiLCJvZmZzZXRMZWZ0IiwidG9wIiwib2Zmc2V0VG9wIiwic2Nyb2xsVG9wIiwib3V0ZXJIZWlnaHQiLCJpbmNsdWRlTWFyZ2luIiwibWFyZ2lucyIsInBhcnNlSW50IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwib2Zmc2V0SGVpZ2h0IiwiaW5kZXgiLCJwYXJlbnROb2RlIiwiY2hpbGRyZW4iLCJjaGlsZHMiLCJjb25jYXQiLCJzaWJsaW5ncyIsInNpYnMiLCJjaGlsZCIsInBhcmVudCIsInBhciIsInBhcmVudHMiLCJwIiwicGFyZW50RWxlbWVudCIsInB1c2giLCJmaW5kIiwiZm91bmQiLCJmaXRlbSIsInJlcyIsImlzIiwiYXBwZW5kVG8iLCJhcHBlbmRDaGlsZCIsImFwcGVuZCIsImluc2VydEFmdGVyIiwicXVlcnlTZWxlY3RvciIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwiY2xvbmUiLCJjbG9uZXMiLCJjbG9uZU5vZGUiLCJyZW1vdmUiLCJkYXRhIiwicmVtb3ZlQ2hpbGQiLCJoYXNKU09OIiwiZGF0YUF0dHIiLCJ0b0xvd2VyQ2FzZSIsInRlc3QiLCJKU09OIiwicGFyc2UiLCJ0cmlnZ2VyIiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiYmx1ciIsImZvY3VzIiwib24iLCJjYWxsYmFjayIsImV2Iiwib2ZmIiwidG9nZ2xlQ2xhc3MiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaGFzQ2xhc3MiLCJjb2xsYXBzZSIsImFjdGlvbiIsIiRpdGVtIiwiY3VycmVudFRhcmdldCIsInByZXZlbnREZWZhdWx0IiwidGFiUGFuZSIsImRkIiwiJGJvZHkiLCJTdGF0ZVRvZ2dsZXIiLCJyZXN0b3JlU3RhdGUiLCJpbml0S25vYiIsImtub2IiLCJrbm9iTG9hZGVyT3B0aW9uczEiLCJ3aWR0aCIsImRpc3BsYXlJbnB1dCIsImZnQ29sb3IiLCJBUFBfQ09MT1JTIiwia25vYkxvYWRlck9wdGlvbnMyIiwicmVhZE9ubHkiLCJrbm9iTG9hZGVyT3B0aW9uczMiLCJiZ0NvbG9yIiwiYW5nbGVPZmZzZXQiLCJhbmdsZUFyYyIsImtub2JMb2FkZXJPcHRpb25zNCIsImRpc3BsYXlQcmV2aW91cyIsInRoaWNrbmVzcyIsImxpbmVDYXAiLCJpbml0Q2hhcnRKUyIsIkNoYXJ0IiwickZhY3RvciIsIk1hdGgiLCJyb3VuZCIsInJhbmRvbSIsImxpbmVEYXRhIiwibGFiZWxzIiwiZGF0YXNldHMiLCJsYWJlbCIsImJhY2tncm91bmRDb2xvciIsImJvcmRlckNvbG9yIiwicG9pbnRCb3JkZXJDb2xvciIsImxpbmVPcHRpb25zIiwibGVnZW5kIiwiZGlzcGxheSIsImxpbmVjdHgiLCJnZXRFbGVtZW50QnlJZCIsImdldENvbnRleHQiLCJsaW5lQ2hhcnQiLCJvcHRpb25zIiwiYmFyRGF0YSIsImJhck9wdGlvbnMiLCJiYXJjdHgiLCJiYXJDaGFydCIsImRvdWdobnV0RGF0YSIsImhvdmVyQmFja2dyb3VuZENvbG9yIiwiZG91Z2hudXRPcHRpb25zIiwiZG91Z2hudXRjdHgiLCJkb3VnaG51dENoYXJ0IiwicGllRGF0YSIsInBpZU9wdGlvbnMiLCJwaWVjdHgiLCJwaWVDaGFydCIsInBvbGFyRGF0YSIsInBvbGFyT3B0aW9ucyIsInBvbGFyY3R4IiwicG9sYXJDaGFydCIsInJhZGFyRGF0YSIsInJhZGFyT3B0aW9ucyIsInJhZGFyY3R4IiwicmFkYXJDaGFydCIsImluaXRDaGFydGlzdHMiLCJDaGFydGlzdCIsImRhdGExIiwic2VyaWVzIiwib3B0aW9uczEiLCJoaWdoIiwibG93IiwiaGVpZ2h0IiwiYXhpc1giLCJsYWJlbEludGVycG9sYXRpb25GbmMiLCJCYXIiLCJzZXJpZXNCYXJEaXN0YW5jZSIsInJldmVyc2VEYXRhIiwiaG9yaXpvbnRhbEJhcnMiLCJheGlzWSIsIm9mZnNldCIsIkxpbmUiLCJmdWxsV2lkdGgiLCJjaGFydFBhZGRpbmciLCJyaWdodCIsImNoYXJ0MSIsInNob3dBcmVhIiwic2hvd1BvaW50IiwiZWxlbWVudCIsImFuaW1hdGUiLCJkIiwiYmVnaW4iLCJkdXIiLCJmcm9tIiwicGF0aCIsInNjYWxlIiwidHJhbnNsYXRlIiwiY2hhcnRSZWN0Iiwic3RyaW5naWZ5IiwidG8iLCJlYXNpbmciLCJTdmciLCJFYXNpbmciLCJlYXNlT3V0UXVpbnQiLCJjaGFydCIsInNlcSIsImRlbGF5cyIsImR1cmF0aW9ucyIsIm9wYWNpdHkiLCJheGlzIiwieSIsIngiLCJ4MSIsIngyIiwicG9zMUFuaW1hdGlvbiIsInVuaXRzIiwicG9zIiwicG9zMkFuaW1hdGlvbiIsImFuaW1hdGlvbnMiLCJfX2V4YW1wbGVBbmltYXRlVGltZW91dCIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJ1cGRhdGUiLCJpbml0RWFzeVBpZUNoYXJ0IiwiZWFzeVBpZUNoYXJ0IiwiJGVsZW0iLCJwaWVPcHRpb25zMSIsImR1cmF0aW9uIiwiZW5hYmxlZCIsImJhckNvbG9yIiwidHJhY2tDb2xvciIsInNjYWxlQ29sb3IiLCJsaW5lV2lkdGgiLCJwaWVPcHRpb25zMiIsInBpZU9wdGlvbnMzIiwicGllT3B0aW9uczQiLCJpbml0RmxvdFNwbGluZSIsImRhdGF2MiIsImRhdGF2MyIsImxpbmVzIiwic2hvdyIsInBvaW50cyIsInJhZGl1cyIsInNwbGluZXMiLCJ0ZW5zaW9uIiwiZmlsbCIsImdyaWQiLCJib3JkZXJXaWR0aCIsImhvdmVyYWJsZSIsInRvb2x0aXAiLCJ0b29sdGlwT3B0cyIsImNvbnRlbnQiLCJ4YXhpcyIsInRpY2tDb2xvciIsIm1vZGUiLCJ5YXhpcyIsIm1pbiIsIm1heCIsInRpY2tGb3JtYXR0ZXIiLCJ2Iiwic2hhZG93U2l6ZSIsInBsb3QiLCJjaGFydHYyIiwiY2hhcnR2MyIsImluaXRGbG90QXJlYSIsImluaXRGbG90QmFyIiwiYmFycyIsImFsaWduIiwiYmFyV2lkdGgiLCJpbml0RmxvdEJhclN0YWNrZWQiLCJzdGFjayIsImluaXRGbG90RG9udXQiLCJwaWUiLCJpbm5lclJhZGl1cyIsImluaXRGbG90TGluZSIsImluaXRGbG90UGllIiwiZm9ybWF0dGVyIiwicGVyY2VudCIsImJhY2tncm91bmQiLCJjb2xvciIsImluaXRNb3JyaXMiLCJNb3JyaXMiLCJjaGFydGRhdGEiLCJhIiwiYiIsImRvbnV0ZGF0YSIsInhrZXkiLCJ5a2V5cyIsImxpbmVDb2xvcnMiLCJyZXNpemUiLCJEb251dCIsImNvbG9ycyIsInhMYWJlbE1hcmdpbiIsImJhckNvbG9ycyIsIkFyZWEiLCJSaWNrc2hhdyIsInNlcmllc0RhdGEiLCJGaXh0dXJlcyIsIlJhbmRvbURhdGEiLCJhZGREYXRhIiwic2VyaWVzMSIsIm5hbWUiLCJncmFwaDEiLCJHcmFwaCIsInJlbmRlcmVyIiwicmVuZGVyIiwiZ3JhcGgyIiwic3Ryb2tlIiwiZ3JhcGgzIiwiZ3JhcGg0IiwiaW5pdFNwYXJrbGluZSIsImluaXRTcGFya0xpbmUiLCIkZWxlbWVudCIsInZhbHVlcyIsImRpc2FibGVIaWRkZW5DaGVjayIsInNwYXJrbGluZSIsImluaXRCb290c3RyYXAiLCJwb3BvdmVyIiwiY29udGFpbmVyIiwic3RvcFByb3BhZ2F0aW9uIiwiaW5pdENhcmREaXNtaXNzIiwiaW5pdENhcmRDb2xsYXBzZSIsImluaXRDYXJkUmVmcmVzaCIsImdldENhcmRQYXJlbnQiLCJ0cmlnZ2VyRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImluaXRDdXN0b21FdmVudCIsImNhcmR0b29sU2VsZWN0b3IiLCJjYXJkTGlzdCIsIkNhcmREaXNtaXNzIiwiRVZFTlRfUkVNT1ZFIiwiRVZFTlRfUkVNT1ZFRCIsImNhcmRQYXJlbnQiLCJyZW1vdmluZyIsImNsaWNrSGFuZGxlciIsImNvbmZpcm0iLCJjYW5jZWwiLCJjbGFzc05hbWUiLCJpbml0aWFsU3RhdGUiLCJoYXNBdHRyaWJ1dGUiLCJDYXJkQ29sbGFwc2UiLCJzdGFydENvbGxhcHNlZCIsIkVWRU5UX1NIT1ciLCJFVkVOVF9ISURFIiwic3RhdGUiLCJ3cmFwcGVyIiwidG9nZ2xlQ29sbGFwc2UiLCJtYXhIZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJ1cGRhdGVJY29uIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJpbml0U3R5bGVzIiwidHJhbnNpdGlvbiIsIm92ZXJmbG93IiwiQ2FyZFJlZnJlc2giLCJFVkVOVF9SRUZSRVNIIiwiV0hJUkxfQ0xBU1MiLCJERUZBVUxUX1NQSU5ORVIiLCJzcGlubmVyIiwiZGF0YXNldCIsInJlZnJlc2giLCJjYXJkIiwic2hvd1NwaW5uZXIiLCJyZW1vdmVTcGlubmVyIiwiYWRkIiwicyIsIkFQUF9NRURJQVFVRVJZIiwiaW5pdFNjcmVlbkZ1bGwiLCJzY3JlZW5mdWxsIiwiJGRvYyIsIiRmc1RvZ2dsZXIiLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwidG9nZ2xlIiwidG9nZ2xlRlNJY29uIiwiY29uc29sZSIsImxvZyIsInJhdyIsImZ1bGxzY3JlZW5jaGFuZ2UiLCJpc0Z1bGxzY3JlZW4iLCJpbml0TG9hZENTUyIsInVyaSIsImxpbmsiLCJjcmVhdGVMaW5rIiwiZXJyb3IiLCJsaW5rSWQiLCJvbGRMaW5rIiwiaW5pdFRyYW5zbGF0aW9uIiwicGF0aFByZWZpeCIsIlNUT1JBR0VLRVkiLCJzYXZlZExhbmd1YWdlIiwiU3RvcmFnZXMiLCJsb2NhbFN0b3JhZ2UiLCJnZXQiLCJpMThuZXh0IiwidXNlIiwiaTE4bmV4dFhIUkJhY2tlbmQiLCJmYWxsYmFja0xuZyIsImJhY2tlbmQiLCJsb2FkUGF0aCIsIm5zIiwiZGVmYXVsdE5TIiwiZGVidWciLCJlcnIiLCJ0IiwiYXBwbHlUcmFubGF0aW9ucyIsImF0dGFjaENoYW5nZUxpc3RlbmVyIiwibGlzdCIsImV4aXN0cyIsImlubmVySFRNTCIsInRhZ05hbWUiLCJsYW5nIiwiY2hhbmdlTGFuZ3VhZ2UiLCJzZXQiLCJhY3RpdmF0ZURyb3Bkb3duIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsImluaXROYXZiYXJTZWFyY2giLCJuYXZTZWFyY2giLCJuYXZiYXJTZWFyY2hJbnB1dCIsIiRzZWFyY2hPcGVuIiwiJHNlYXJjaERpc21pc3MiLCJpbnB1dFNlbGVjdG9yIiwia2V5Q29kZSIsImRpc21pc3MiLCJuYXZiYXJGb3JtU2VsZWN0b3IiLCJuYXZiYXJGb3JtIiwiaXNPcGVuIiwiaW5pdE5vd1RpbWVyIiwibW9tZW50IiwiZm9ybWF0IiwidXBkYXRlVGltZSIsImR0IiwiRGF0ZSIsInRleHQiLCJzZXRJbnRlcnZhbCIsImluaXRSVEwiLCJtYWluY3NzIiwiYnNjc3MiLCJjaGVja2VkIiwiaW5pdFNpZGViYXIiLCIkaHRtbCIsIiRzaWRlYmFyIiwic2lkZWJhckNvbGxhcHNlIiwiY3VycmVudEl0ZW0iLCJ1c2VBc2lkZUhvdmVyIiwiZXZlbnROYW1lIiwiaXNUb3VjaCIsInN1Yk5hdiIsImlzU2lkZWJhckNvbGxhcHNlZCIsInRvZ2dsZU1lbnVJdGVtIiwic2lkZWJhckFkZEJhY2tkcm9wIiwic2lkZWJhckFueWNsaWNrQ2xvc2UiLCIkdGFyZ2V0IiwiJGJhY2tkcm9wIiwicmVtb3ZlRmxvYXRpbmdOYXYiLCJ0b2dnbGVUb3VjaEl0ZW0iLCIkbGlzdEl0ZW0iLCJ1bCIsIiRhc2lkZSIsIiRhc2lkZUlubmVyIiwibWFyIiwiaXRlbVRvcCIsInZ3SGVpZ2h0IiwiYm9keSIsImNsaWVudEhlaWdodCIsImlzRml4ZWQiLCJib3R0b20iLCJpc1NpZGViYXJUb2dnbGVkIiwiaXNNb2JpbGUiLCJjbGllbnRXaWR0aCIsInRhYmxldCIsImluaXRTbGltc1Nyb2xsIiwic2xpbVNjcm9sbCIsImRlZmF1bHRIZWlnaHQiLCJpbml0VGFibGVDaGVja0FsbCIsIiR0aGlzIiwiY2hlY2tib3giLCJ0YWJsZSIsImluaXRUb2dnbGVTdGF0ZSIsIm5vUGVyc2lzdCIsInJlbW92ZVN0YXRlIiwiYWRkU3RhdGUiLCJFdmVudCIsInJlc2l6ZUV2ZW50IiwiaW5pdFVJRXZlbnQiLCJTVE9SQUdFX0tFWV9OQU1FIiwiQXJyYXkiLCJzcGxpY2UiLCJqb2luIiwiaW5pdFRyaWdnZXJSZXNpemUiLCJldnQiLCJGdWxsQ2FsZW5kYXIiLCJpbml0RXh0ZXJuYWxFdmVudHMiLCJpbml0RnVsbENhbGVuZGFyIiwiQ2FsZW5kYXIiLCJEcmFnZ2FibGUiLCJGdWxsQ2FsZW5kYXJJbnRlcmFjdGlvbiIsImNvbnRhaW5lckVsIiwiaXRlbVNlbGVjdG9yIiwiZXZlbnREYXRhIiwiZXZlbnRFbCIsInRpdGxlIiwiaW5uZXJUZXh0IiwidHJpbSIsImNhbGVuZGFyRWwiLCJjYWxlbmRhciIsImNyZWF0ZURlbW9FdmVudHMiLCJwbHVnaW5zIiwidGhlbWVTeXN0ZW0iLCJoZWFkZXIiLCJjZW50ZXIiLCJlZGl0YWJsZSIsImRyb3BwYWJsZSIsImV2ZW50UmVjZWl2ZSIsImluZm8iLCJzdHlsZXMiLCJkcmFnZ2VkRWwiLCJzZXRQcm9wIiwiY29sb3JTZWxlY3RvckNvbnRhaW5lciIsImFkZEV2ZW50QnV0dG9uIiwiZXZlbnROYW1lSW5wdXQiLCJjb2xvclNlbGVjdG9ycyIsImN1cnJlbnRTZWxlY3RvciIsInNlbCIsInNlbGVjdENvbG9yU2VsZWN0b3IiLCJhZGROZXdFeHRlcm5hbEV2ZW50IiwidW5zZWxlY3RBbGxDb2xvclNlbGVjdG9yIiwiZmlyc3RDaGlsZCIsImJhc2VFbGVtZW50IiwiZGF0ZSIsImdldERhdGUiLCJnZXRNb250aCIsImdldEZ1bGxZZWFyIiwic3RhcnQiLCJlbmQiLCJhbGxEYXkiLCJ1cmwiLCJpbml0V29yZENsb3VkIiwialFDbG91ZCIsIndvcmRfYXJyYXkiLCJ3ZWlnaHQiLCJzdGVwcyIsImluaXRTZWFyY2giLCJzbGlkZXIiLCJjaG9zZW4iLCJkYXRlcGlja2VyIiwib3JpZW50YXRpb24iLCJpY29ucyIsInRpbWUiLCJ1cCIsImRvd24iLCJwcmV2aW91cyIsIm5leHQiLCJ0b2RheSIsImNsZWFyIiwiaW5pdENhcmREZW1vIiwiaW5pdE5lc3RhYmxlIiwibmVzdGFibGUiLCJ1cGRhdGVPdXRwdXQiLCJvdXRwdXQiLCJncm91cCIsImluaXROb3RpZnkiLCJTZWxlY3RvciIsImF1dG9sb2FkU2VsZWN0b3IiLCJkb2MiLCJvbmxvYWQiLCJub3RpZnlOb3ciLCJtZXNzYWdlIiwibm90aWZ5IiwiY29udGFpbmVycyIsIm1lc3NhZ2VzIiwiYXJndW1lbnRzIiwic3RhdHVzIiwiTWVzc2FnZSIsImNsb3NlQWxsIiwiaW5zdGFudGx5IiwiaWQiLCJjbG9zZSIsImRlZmF1bHRzIiwidXVpZCIsImdldFRpbWUiLCJjZWlsIiwiY3VycmVudHN0YXR1cyIsInRpbW91dCIsInByZXBlbmQiLCJtYXJnaW5ib3R0b20iLCJ0aW1lb3V0IiwiY2xvc2VmbiIsImhvdmVyIiwiZmluYWxpemUiLCJoaWRlIiwiaHRtbCIsImluaXRQb3J0bGV0cyIsInNvcnRhYmxlIiwiY29ubmVjdFdpdGgiLCJpdGVtcyIsImhhbmRsZSIsInBsYWNlaG9sZGVyIiwiZm9yY2VQbGFjZWhvbGRlclNpemUiLCJpZnJhbWVGaXgiLCJ0b2xlcmFuY2UiLCJoZWxwZXIiLCJyZXZlcnQiLCJmb3JjZUhlbHBlclNpemUiLCJzYXZlUG9ydGxldE9yZGVyIiwiY3JlYXRlIiwibG9hZFBvcnRsZXRPcmRlciIsInVpIiwicG9ybGV0SWQiLCJjYXJkcyIsInBvcnRsZXQiLCJyZXNldFBvcmxldHMiLCJsb2NhdGlvbiIsInJlbG9hZCIsImluaXRTb3J0YWJsZSIsImluaXRTd2VldEFsZXJ0Iiwic3dhbCIsImljb24iLCJidXR0b25zIiwidmlzaWJsZSIsImNsb3NlTW9kYWwiLCJ0aGVuIiwiaXNDb25maXJtIiwiaW5pdENvbG9yUGlja2VyIiwiY29sb3JwaWNrZXIiLCJpbml0Rm9ybXNEZW1vIiwiaW5wdXRtYXNrIiwiZmlsZXN0eWxlIiwid3lzaXd5ZyIsImluaXRJbWFnZUNyb3BwZXIiLCJjcm9wcGVyIiwiJGltYWdlIiwiJGRhdGFYIiwiJGRhdGFZIiwiJGRhdGFIZWlnaHQiLCIkZGF0YVdpZHRoIiwiJGRhdGFSb3RhdGUiLCJhc3BlY3RSYXRpbyIsInByZXZpZXciLCJjcm9wIiwicm90YXRlIiwiZHJhZ1R5cGUiLCJyZXN1bHQiLCJvcHRpb24iLCJtb2RhbCIsImlzUGxhaW5PYmplY3QiLCJ3aGljaCIsIiRpbnB1dEltYWdlIiwiVVJMIiwid2Via2l0VVJMIiwiYmxvYlVSTCIsImNoYW5nZSIsImZpbGVzIiwiZmlsZSIsImNyZWF0ZU9iamVjdFVSTCIsIm9uZSIsInJldm9rZU9iamVjdFVSTCIsImFsZXJ0IiwiaW5pdFNlbGVjdDIiLCJzZWxlY3QyIiwidGhlbWUiLCJhbGxvd0NsZWFyIiwiRHJvcHpvbmUiLCJhdXRvRGlzY292ZXIiLCJpbml0RHJvcHpvbmUiLCJkcm9wem9uZU9wdGlvbnMiLCJhdXRvUHJvY2Vzc1F1ZXVlIiwidXBsb2FkTXVsdGlwbGUiLCJwYXJhbGxlbFVwbG9hZHMiLCJtYXhGaWxlcyIsImRpY3REZWZhdWx0TWVzc2FnZSIsInBhcmFtTmFtZSIsIm1heEZpbGVzaXplIiwiYWRkUmVtb3ZlTGlua3MiLCJhY2NlcHQiLCJkb25lIiwiZHpIYW5kbGVyIiwicHJvY2Vzc1F1ZXVlIiwiZHJvcHpvbmVBcmVhIiwiaW5pdFdpemFyZCIsInZhbGlkYXRlIiwiZm9ybSIsImVycm9yUGxhY2VtZW50IiwiYmVmb3JlIiwicnVsZXMiLCJlcXVhbFRvIiwiaGVhZGVyVGFnIiwiYm9keVRhZyIsInRyYW5zaXRpb25FZmZlY3QiLCJvblN0ZXBDaGFuZ2luZyIsImN1cnJlbnRJbmRleCIsIm5ld0luZGV4Iiwic2V0dGluZ3MiLCJpZ25vcmUiLCJ2YWxpZCIsIm9uRmluaXNoaW5nIiwib25GaW5pc2hlZCIsInN1Ym1pdCIsInN0ZXBzT3JpZW50YXRpb24iLCJpbml0WEVkaXRhYmxlIiwiZWRpdGFibGVmb3JtIiwiY2xpY2siLCJwayIsInNvdXJjZSIsInNvdXJjZURhdGEiLCJncmVwIiwibyIsImVtcHR5Iiwic2hvd2J1dHRvbnMiLCJwbGFjZW1lbnQiLCJjb21ib2RhdGUiLCJmaXJzdEl0ZW0iLCJyZWFzb24iLCIkbmV4dCIsImNsb3Nlc3QiLCJpbml0UGFyc2xleUZvclBhZ2VzIiwicGFyc2xleU9wdGlvbnMiLCJlcnJvckNsYXNzIiwic3VjY2Vzc0NsYXNzIiwiY2xhc3NIYW5kbGVyIiwiUGFyc2xleUZpZWxkIiwiZXJyb3JzQ29udGFpbmVyIiwiZXJyb3JzV3JhcHBlciIsImVycm9yVGVtcGxhdGUiLCJsb2dpbkZvcm0iLCJwYXJzbGV5IiwicmVnaXN0ZXJGb3JtIiwiaW5pdEdvb2dsZU1hcHMiLCJNYXBTdHlsZXMiLCJmZWF0dXJlVHlwZSIsInN0eWxlcnMiLCJ2aXNpYmlsaXR5IiwiZWxlbWVudFR5cGUiLCJsaWdodG5lc3MiLCJnTWFwIiwibWFwU2VsZWN0b3IiLCJnTWFwUmVmcyIsImFkZHJlc3NlcyIsInRpdGxlcyIsInpvb20iLCJtYXB0eXBlIiwibWFya2VycyIsImFkZHJlc3MiLCJwb3B1cCIsImNvbnRyb2xzIiwicGFuQ29udHJvbCIsInpvb21Db250cm9sIiwibWFwVHlwZUNvbnRyb2wiLCJzY2FsZUNvbnRyb2wiLCJzdHJlZXRWaWV3Q29udHJvbCIsIm92ZXJ2aWV3TWFwQ29udHJvbCIsInNjcm9sbHdoZWVsIiwicmVmIiwic2V0T3B0aW9ucyIsImluaXRWZWN0b3JNYXAiLCJtYXJrZXJzRGF0YSIsImxhdExuZyIsIlZlY3Rvck1hcCIsImRlZmF1bHRDb2xvcnMiLCJtYXJrZXJDb2xvciIsInNjYWxlQ29sb3JzIiwicmVnaW9uRmlsbCIsIm1hcEhlaWdodCIsIm1hcE5hbWUiLCJvcHRzIiwidmVjdG9yTWFwIiwiem9vbU1pbiIsInpvb21NYXgiLCJ6b29tT25TY3JvbGwiLCJyZWdpb25TdHlsZSIsImluaXRpYWwiLCJzZWxlY3RlZCIsInNlbGVjdGVkSG92ZXIiLCJmb2N1c09uIiwibWFya2VyU3R5bGUiLCJvblJlZ2lvbkxhYmVsU2hvdyIsImNvZGUiLCJyZWdpb25zIiwibm9ybWFsaXplRnVuY3Rpb24iLCJpbml0Qm9vdGdyaWQiLCJib290Z3JpZCIsInRlbXBsYXRlcyIsImFjdGlvbkJ1dHRvbiIsImFjdGlvbkRyb3BEb3duIiwiYWN0aW9uRHJvcERvd25JdGVtIiwiYWN0aW9uRHJvcERvd25DaGVja2JveEl0ZW0iLCJwYWdpbmF0aW9uSXRlbSIsInNlbGVjdGlvbiIsIm11bHRpU2VsZWN0Iiwicm93U2VsZWN0Iiwia2VlcFNlbGVjdGlvbiIsInNlbGVjdCIsImZvcm1hdHRlcnMiLCJjb21tYW5kcyIsImNvbHVtbiIsInJvdyIsImluaXREYXRhdGFibGVzIiwiRGF0YVRhYmxlIiwicmVzcG9uc2l2ZSIsIm9MYW5ndWFnZSIsInNTZWFyY2giLCJzTGVuZ3RoTWVudSIsInplcm9SZWNvcmRzIiwiaW5mb0VtcHR5IiwiaW5mb0ZpbHRlcmVkIiwib1BhZ2luYXRlIiwic05leHQiLCJzUHJldmlvdXMiLCJkb20iLCJpbml0Q3VzdG9tIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQWNBLFdBQUFBLE1BQUEsRUFBQUMsT0FBQSxFQUFBO0FBQ0EsTUFBQSxPQUFBQyxPQUFBLEtBQUEsUUFBQSxFQUFBO0FBQUE7QUFDQUMsSUFBQUEsTUFBQSxDQUFBRCxPQUFBLEdBQUFELE9BQUEsRUFBQTtBQUNBLEdBRkEsTUFFQTtBQUFBO0FBQ0EsUUFBQSxPQUFBRCxNQUFBLENBQUFJLE1BQUEsS0FBQSxXQUFBLEVBQ0FKLE1BQUEsQ0FBQUssQ0FBQSxHQUFBSixPQUFBLEVBQUE7QUFDQTtBQUNBLENBUEEsRUFPQUssTUFQQSxFQU9BLFlBQUE7QUFFQTtBQUNBLFdBQUFDLFNBQUEsQ0FBQUMsR0FBQSxFQUFBO0FBQ0EsV0FBQSxZQUFBQSxHQUFBLElBQUFBLEdBQUEsS0FBQUYsTUFBQSxHQUFBLEdBQUFHLEtBQUEsQ0FBQUMsSUFBQSxDQUFBRixHQUFBLENBQUEsR0FBQSxDQUFBQSxHQUFBLENBQUE7QUFDQTs7QUFFQSxXQUFBRyxNQUFBLENBQUFDLEdBQUEsRUFBQUMsRUFBQSxFQUFBO0FBQ0EsV0FBQSxHQUFBRixNQUFBLENBQUFELElBQUEsQ0FBQUUsR0FBQSxFQUFBQyxFQUFBLENBQUE7QUFDQTs7QUFFQSxXQUFBQyxHQUFBLENBQUFGLEdBQUEsRUFBQUMsRUFBQSxFQUFBO0FBQ0EsV0FB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QUNBQyxNQUFBQSxZQUFBLEVBQUEsSUFGQTtBQUdBQyxNQUFBQSxPQUFBLEVBQUFDLFVBQUEsQ0FBQSxNQUFBO0FBSEEsS0FBQTtBQUtBdkssSUFBQUEsQ0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBa0ssSUFBQSxDQUFBQyxrQkFBQTtBQUVBLFFBQUFLLGtCQUFBLEdBQUE7QUFDQUosTUFBQUEsS0FBQSxFQUFBLEtBREE7QUFDQTtBQUNBQyxNQUFBQSxZQUFBLEVBQUEsSUFGQTtBQUdBQyxNQUFBQSxPQUFBLEVBQUFDLFVBQUEsQ0FBQSxRQUFBLENBSEE7QUFJQUUsTUFBQUEsUUFBQSxFQUFBO0FBSkEsS0FBQTtBQU1BekssSUFBQUEsQ0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBa0ssSUFBQSxDQUFBTSxrQkFBQTtBQUVBLFFBQUFFLGtCQUFBLEdBQUE7QUFDQU4sTUFBQUEsS0FBQSxFQUFBLEtBREE7QUFDQTtBQUNBQyxNQUFBQSxZQUFBLEVBQUEsSUFGQTtBQUdBQyxNQUFBQSxPQUFBLEVBQUFDLFVBQUEsQ0FBQSxNQUFBLENBSEE7QUFJQUksTUFBQUEsT0FBQSxFQUFBSixVQUFBLENBQUEsTUFBQSxDQUpBO0FBS0FLLE1BQUFBLFdBQUEsRUFBQSxDQUFBLEdBTEE7QUFNQUMsTUFBQUEsUUFBQSxFQUFBO0FBTkEsS0FBQTtBQVFBN0ssSUFBQUEsQ0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBa0ssSUFBQSxDQUFBUSxrQkFBQTtBQUVBLFFBQUFJLGtCQUFBLEdBQUE7QUFDQVYsTUFBQUEsS0FBQSxFQUFBLEtBREE7QUFDQTtBQUNBQyxNQUFBQSxZQUFBLEVBQUEsSUFGQTtBQUdBQyxNQUFBQSxPQUFBLEVBQUFDLFVBQUEsQ0FBQSxNQUFBLENBSEE7QUFJQVEsTUFBQUEsZUFBQSxFQUFBLElBSkE7QUFLQUMsTUFBQUEsU0FBQSxFQUFBLEdBTEE7QUFNQUMsTUFBQUEsT0FBQSxFQUFBO0FBTkEsS0FBQTtBQVFBakwsSUFBQUEsQ0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBa0ssSUFBQSxDQUFBWSxrQkFBQTtBQUVBO0FBRUEsQ0E5Q0EsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBOUssRUFBQUEsQ0FBQSxDQUFBa0wsV0FBQSxDQUFBOztBQUVBLFdBQUFBLFdBQUEsR0FBQTtBQUVBLFFBQUEsT0FBQUMsS0FBQSxLQUFBLFdBQUEsRUFBQSxPQUZBLENBSUE7O0FBQ0EsUUFBQUMsT0FBQSxHQUFBLFlBQUE7QUFDQSxhQUFBQyxJQUFBLENBQUFDLEtBQUEsQ0FBQUQsSUFBQSxDQUFBRSxNQUFBLEtBQUEsR0FBQSxDQUFBO0FBQ0EsS0FGQSxDQUxBLENBU0E7QUFDQTs7O0FBRUEsUUFBQUMsUUFBQSxHQUFBO0FBQ0FDLE1BQUFBLE1BQUEsRUFBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsQ0FEQTtBQUVBQyxNQUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBQyxRQUFBQSxLQUFBLEVBQUEsa0JBREE7QUFFQUMsUUFBQUEsZUFBQSxFQUFBLHVCQUZBO0FBR0FDLFFBQUFBLFdBQUEsRUFBQSxxQkFIQTtBQUlBQyxRQUFBQSxnQkFBQSxFQUFBLE1BSkE7QUFLQTdELFFBQUFBLElBQUEsRUFBQSxDQUFBbUQsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBO0FBTEEsT0FBQSxFQU1BO0FBQ0FPLFFBQUFBLEtBQUEsRUFBQSxtQkFEQTtBQUVBQyxRQUFBQSxlQUFBLEVBQUEsc0JBRkE7QUFHQUMsUUFBQUEsV0FBQSxFQUFBLG9CQUhBO0FBSUFDLFFBQUFBLGdCQUFBLEVBQUEsTUFKQTtBQUtBN0QsUUFBQUEsSUFBQSxFQUFBLENBQUFtRCxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUE7QUFMQSxPQU5BO0FBRkEsS0FBQTtBQWlCQSxRQUFBVyxXQUFBLEdBQUE7QUFDQUMsTUFBQUEsTUFBQSxFQUFBO0FBQ0FDLFFBQUFBLE9BQUEsRUFBQTtBQURBO0FBREEsS0FBQTtBQUtBLFFBQUFDLE9BQUEsR0FBQTVKLFFBQUEsQ0FBQTZKLGNBQUEsQ0FBQSxtQkFBQSxFQUFBQyxVQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQUMsU0FBQSxHQUFBLElBQUFsQixLQUFBLENBQUFlLE9BQUEsRUFBQTtBQUNBakUsTUFBQUEsSUFBQSxFQUFBdUQsUUFEQTtBQUVBbEssTUFBQUEsSUFBQSxFQUFBLE1BRkE7QUFHQWdMLE1BQUFBLE9BQUEsRUFBQVA7QUFIQSxLQUFBLENBQUEsQ0FuQ0EsQ0F5Q0E7QUFDQTs7QUFFQSxRQUFBUSxPQUFBLEdBQUE7QUFDQWQsTUFBQUEsTUFBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxDQURBO0FBRUFDLE1BQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0FFLFFBQUFBLGVBQUEsRUFBQSxTQURBO0FBRUFDLFFBQUFBLFdBQUEsRUFBQSxTQUZBO0FBR0E1RCxRQUFBQSxJQUFBLEVBQUEsQ0FBQW1ELE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQTtBQUhBLE9BQUEsRUFJQTtBQUNBUSxRQUFBQSxlQUFBLEVBQUEsU0FEQTtBQUVBQyxRQUFBQSxXQUFBLEVBQUEsU0FGQTtBQUdBNUQsUUFBQUEsSUFBQSxFQUFBLENBQUFtRCxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUEsRUFBQUEsT0FBQSxFQUFBLEVBQUFBLE9BQUEsRUFBQSxFQUFBQSxPQUFBLEVBQUE7QUFIQSxPQUpBO0FBRkEsS0FBQTtBQWFBLFFBQUFvQixVQUFBLEdBQUE7QUFDQVIsTUFBQUEsTUFBQSxFQUFBO0FBQ0FDLFFBQUFBLE9BQUEsRUFBQTtBQURBO0FBREEsS0FBQTtBQUtBLFFBQUFRLE1BQUEsR0FBQW5LLFFBQUEsQ0FBQTZKLGNBQUEsQ0FBQSxrQkFBQSxFQUFBQyxVQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQU0sUUFBQSxHQUFBLElBQUF2QixLQUFBLENBQUFzQixNQUFBLEVBQUE7QUFDQXhFLE1BQUFBLElBQUEsRUFBQXNFLE9BREE7QUFFQWpMLE1BQUFBLElBQUEsRUFBQSxLQUZBO0FBR0FnTCxNQUFBQSxPQUFBLEVBQUFFO0FBSEEsS0FBQSxDQUFBLENBL0RBLENBcUVBO0FBQ0E7O0FBRUEsUUFBQUcsWUFBQSxHQUFBO0FBQ0FsQixNQUFBQSxNQUFBLEVBQUEsQ0FDQSxRQURBLEVBRUEsUUFGQSxFQUdBLE1BSEEsQ0FEQTtBQU1BQyxNQUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBekQsUUFBQUEsSUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLENBREE7QUFFQTJELFFBQUFBLGVBQUEsRUFBQSxDQUNBLFNBREEsRUFFQSxTQUZBLEVBR0EsU0FIQSxDQUZBO0FBT0FnQixRQUFBQSxvQkFBQSxFQUFBLENBQ0EsU0FEQSxFQUVBLFNBRkEsRUFHQSxTQUhBO0FBUEEsT0FBQTtBQU5BLEtBQUE7QUFxQkEsUUFBQUMsZUFBQSxHQUFBO0FBQ0FiLE1BQUFBLE1BQUEsRUFBQTtBQUNBQyxRQUFBQSxPQUFBLEVBQUE7QUFEQTtBQURBLEtBQUE7QUFLQSxRQUFBYSxXQUFBLEdBQUF4SyxRQUFBLENBQUE2SixjQUFBLENBQUEsdUJBQUEsRUFBQUMsVUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUFXLGFBQUEsR0FBQSxJQUFBNUIsS0FBQSxDQUFBMkIsV0FBQSxFQUFBO0FBQ0E3RSxNQUFBQSxJQUFBLEVBQUEwRSxZQURBO0FBRUFyTCxNQUFBQSxJQUFBLEVBQUEsVUFGQTtBQUdBZ0wsTUFBQUEsT0FBQSxFQUFBTztBQUhBLEtBQUEsQ0FBQSxDQW5HQSxDQXlHQTtBQUNBOztBQUVBLFFBQUFHLE9BQUEsR0FBQTtBQUNBdkIsTUFBQUEsTUFBQSxFQUFBLENBQ0EsUUFEQSxFQUVBLFFBRkEsRUFHQSxNQUhBLENBREE7QUFNQUMsTUFBQUEsUUFBQSxFQUFBLENBQUE7QUFDQXpELFFBQUFBLElBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxDQURBO0FBRUEyRCxRQUFBQSxlQUFBLEVBQUEsQ0FDQSxTQURBLEVBRUEsU0FGQSxFQUdBLFNBSEEsQ0FGQTtBQU9BZ0IsUUFBQUEsb0JBQUEsRUFBQSxDQUNBLFNBREEsRUFFQSxTQUZBLEVBR0EsU0FIQTtBQVBBLE9BQUE7QUFOQSxLQUFBO0FBcUJBLFFBQUFLLFVBQUEsR0FBQTtBQUNBakIsTUFBQUEsTUFBQSxFQUFBO0FBQ0FDLFFBQUFBLE9BQUEsRUFBQTtBQURBO0FBREEsS0FBQTtBQUtBLFFBQUFpQixNQUFBLEdBQUE1SyxRQUFBLENBQUE2SixjQUFBLENBQUEsa0JBQUEsRUFBQUMsVUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUFlLFFBQUEsR0FBQSxJQUFBaEMsS0FBQSxDQUFBK0IsTUFBQSxFQUFBO0FBQ0FqRixNQUFBQSxJQUFBLEVBQUErRSxPQURBO0FBRUExTCxNQUFBQSxJQUFBLEVBQUEsS0FGQTtBQUdBZ0wsTUFBQUEsT0FBQSxFQUFBVztBQUhBLEtBQUEsQ0FBQSxDQXZJQSxDQTZJQTtBQUNBOztBQUVBLFFBQUFHLFNBQUEsR0FBQTtBQUNBMUIsTUFBQUEsUUFBQSxFQUFBLENBQUE7QUFDQXpELFFBQUFBLElBQUEsRUFBQSxDQUNBLEVBREEsRUFFQSxFQUZBLEVBR0EsQ0FIQSxFQUlBLENBSkEsQ0FEQTtBQU9BMkQsUUFBQUEsZUFBQSxFQUFBLENBQ0EsU0FEQSxFQUVBLFNBRkEsRUFHQSxTQUhBLEVBSUEsU0FKQSxDQVBBO0FBYUFELFFBQUFBLEtBQUEsRUFBQSxZQWJBLENBYUE7O0FBYkEsT0FBQSxDQURBO0FBZ0JBRixNQUFBQSxNQUFBLEVBQUEsQ0FDQSxTQURBLEVBRUEsU0FGQSxFQUdBLFNBSEEsRUFJQSxTQUpBO0FBaEJBLEtBQUE7QUF3QkEsUUFBQTRCLFlBQUEsR0FBQTtBQUNBckIsTUFBQUEsTUFBQSxFQUFBO0FBQ0FDLFFBQUFBLE9BQUEsRUFBQTtBQURBO0FBREEsS0FBQTtBQUtBLFFBQUFxQixRQUFBLEdBQUFoTCxRQUFBLENBQUE2SixjQUFBLENBQUEsb0JBQUEsRUFBQUMsVUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUFtQixVQUFBLEdBQUEsSUFBQXBDLEtBQUEsQ0FBQW1DLFFBQUEsRUFBQTtBQUNBckYsTUFBQUEsSUFBQSxFQUFBbUYsU0FEQTtBQUVBOUwsTUFBQUEsSUFBQSxFQUFBLFdBRkE7QUFHQWdMLE1BQUFBLE9BQUEsRUFBQWU7QUFIQSxLQUFBLENBQUEsQ0E5S0EsQ0FvTEE7QUFDQTs7QUFFQSxRQUFBRyxTQUFBLEdBQUE7QUFDQS9CLE1BQUFBLE1BQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsQ0FEQTtBQUVBQyxNQUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBQyxRQUFBQSxLQUFBLEVBQUEsa0JBREE7QUFFQUMsUUFBQUEsZUFBQSxFQUFBLHVCQUZBO0FBR0FDLFFBQUFBLFdBQUEsRUFBQSxxQkFIQTtBQUlBNUQsUUFBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQTtBQUpBLE9BQUEsRUFLQTtBQUNBMEQsUUFBQUEsS0FBQSxFQUFBLG1CQURBO0FBRUFDLFFBQUFBLGVBQUEsRUFBQSx1QkFGQTtBQUdBQyxRQUFBQSxXQUFBLEVBQUEscUJBSEE7QUFJQTVELFFBQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUE7QUFKQSxPQUxBO0FBRkEsS0FBQTtBQWVBLFFBQUF3RixZQUFBLEdBQUE7QUFDQXpCLE1BQUFBLE1BQUEsRUFBQTtBQUNBQyxRQUFBQSxPQUFBLEVBQUE7QUFEQTtBQURBLEtBQUE7QUFLQSxRQUFBeUIsUUFBQSxHQUFBcEwsUUFBQSxDQUFBNkosY0FBQSxDQUFBLG9CQUFBLEVBQUFDLFVBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBdUIsVUFBQSxHQUFBLElBQUF4QyxLQUFBLENBQUF1QyxRQUFBLEVBQUE7QUFDQXpGLE1BQUFBLElBQUEsRUFBQXVGLFNBREE7QUFFQWxNLE1BQUFBLElBQUEsRUFBQSxPQUZBO0FBR0FnTCxNQUFBQSxPQUFBLEVBQUFtQjtBQUhBLEtBQUEsQ0FBQTtBQU1BO0FBRUEsQ0F6TkEsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBek4sRUFBQUEsQ0FBQSxDQUFBNE4sYUFBQSxDQUFBOztBQUVBLFdBQUFBLGFBQUEsR0FBQTtBQUVBLFFBQUEsT0FBQUMsUUFBQSxLQUFBLFdBQUEsRUFBQSxPQUZBLENBSUE7QUFDQTs7QUFDQSxRQUFBQyxLQUFBLEdBQUE7QUFDQXJDLE1BQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsQ0FEQTtBQUVBc0MsTUFBQUEsTUFBQSxFQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQURBO0FBRkEsS0FBQTtBQU9BLFFBQUFDLFFBQUEsR0FBQTtBQUNBQyxNQUFBQSxJQUFBLEVBQUEsRUFEQTtBQUVBQyxNQUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUZBO0FBR0FDLE1BQUFBLE1BQUEsRUFBQSxHQUhBO0FBSUFDLE1BQUFBLEtBQUEsRUFBQTtBQUNBQyxRQUFBQSxxQkFBQSxFQUFBLFVBQUFwSyxLQUFBLEVBQUFrQyxLQUFBLEVBQUE7QUFDQSxpQkFBQUEsS0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLEdBQUFsQyxLQUFBLEdBQUEsSUFBQTtBQUNBO0FBSEE7QUFKQSxLQUFBO0FBV0EsUUFBQTRKLFFBQUEsQ0FBQVMsR0FBQSxDQUFBLFVBQUEsRUFBQVIsS0FBQSxFQUFBRSxRQUFBLEVBeEJBLENBMEJBO0FBQ0E7O0FBQ0EsUUFBQUgsUUFBQSxDQUFBUyxHQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0E3QyxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxRQUFBLENBREE7QUFFQXNDLE1BQUFBLE1BQUEsRUFBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFGQSxLQUFBLEVBTUE7QUFDQVEsTUFBQUEsaUJBQUEsRUFBQSxFQURBO0FBRUFDLE1BQUFBLFdBQUEsRUFBQSxJQUZBO0FBR0FDLE1BQUFBLGNBQUEsRUFBQSxJQUhBO0FBSUFOLE1BQUFBLE1BQUEsRUFBQSxHQUpBO0FBS0FPLE1BQUFBLEtBQUEsRUFBQTtBQUNBQyxRQUFBQSxNQUFBLEVBQUE7QUFEQTtBQUxBLEtBTkEsRUE1QkEsQ0E0Q0E7QUFDQTs7QUFDQSxRQUFBZCxRQUFBLENBQUFlLElBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQW5ELE1BQUFBLE1BQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQSxRQUFBLENBREE7QUFFQXNDLE1BQUFBLE1BQUEsRUFBQSxDQUNBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUZBLEtBQUEsRUFPQTtBQUNBYyxNQUFBQSxTQUFBLEVBQUEsSUFEQTtBQUVBVixNQUFBQSxNQUFBLEVBQUEsR0FGQTtBQUdBVyxNQUFBQSxZQUFBLEVBQUE7QUFDQUMsUUFBQUEsS0FBQSxFQUFBO0FBREE7QUFIQSxLQVBBLEVBOUNBLENBOERBO0FBQ0E7O0FBRUEsUUFBQUMsTUFBQSxHQUFBLElBQUFuQixRQUFBLENBQUFlLElBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQW5ELE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxDQURBO0FBRUFzQyxNQUFBQSxNQUFBLEVBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLENBSEE7QUFGQSxLQUFBLEVBT0E7QUFDQUcsTUFBQUEsR0FBQSxFQUFBLENBREE7QUFFQWUsTUFBQUEsUUFBQSxFQUFBLElBRkE7QUFHQUMsTUFBQUEsU0FBQSxFQUFBLEtBSEE7QUFJQUwsTUFBQUEsU0FBQSxFQUFBLElBSkE7QUFLQVYsTUFBQUEsTUFBQSxFQUFBO0FBTEEsS0FQQSxDQUFBO0FBZUFhLElBQUFBLE1BQUEsQ0FBQWpHLEVBQUEsQ0FBQSxNQUFBLEVBQUEsVUFBQWQsSUFBQSxFQUFBO0FBQ0EsVUFBQUEsSUFBQSxDQUFBM0csSUFBQSxLQUFBLE1BQUEsSUFBQTJHLElBQUEsQ0FBQTNHLElBQUEsS0FBQSxNQUFBLEVBQUE7QUFDQTJHLFFBQUFBLElBQUEsQ0FBQWtILE9BQUEsQ0FBQUMsT0FBQSxDQUFBO0FBQ0FDLFVBQUFBLENBQUEsRUFBQTtBQUNBQyxZQUFBQSxLQUFBLEVBQUEsT0FBQXJILElBQUEsQ0FBQTlCLEtBREE7QUFFQW9KLFlBQUFBLEdBQUEsRUFBQSxJQUZBO0FBR0FDLFlBQUFBLElBQUEsRUFBQXZILElBQUEsQ0FBQXdILElBQUEsQ0FBQTVILEtBQUEsR0FBQTZILEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBQyxTQUFBLENBQUEsQ0FBQSxFQUFBMUgsSUFBQSxDQUFBMkgsU0FBQSxDQUFBekIsTUFBQSxFQUFBLEVBQUEwQixTQUFBLEVBSEE7QUFJQUMsWUFBQUEsRUFBQSxFQUFBN0gsSUFBQSxDQUFBd0gsSUFBQSxDQUFBNUgsS0FBQSxHQUFBZ0ksU0FBQSxFQUpBO0FBS0FFLFlBQUFBLE1BQUEsRUFBQWxDLFFBQUEsQ0FBQW1DLEdBQUEsQ0FBQUMsTUFBQSxDQUFBQztBQUxBO0FBREEsU0FBQTtBQVNBO0FBQ0EsS0FaQSxFQWhGQSxDQStGQTtBQUNBOztBQUdBLFFBQUFDLEtBQUEsR0FBQSxJQUFBdEMsUUFBQSxDQUFBZSxJQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0FuRCxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FEQTtBQUVBc0MsTUFBQUEsTUFBQSxFQUFBLENBQ0EsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQTtBQUZBLEtBQUEsRUFRQTtBQUNBRyxNQUFBQSxHQUFBLEVBQUEsQ0FEQTtBQUVBQyxNQUFBQSxNQUFBLEVBQUE7QUFGQSxLQVJBLENBQUEsQ0FuR0EsQ0FnSEE7O0FBQ0EsUUFBQWlDLEdBQUEsR0FBQSxDQUFBO0FBQUEsUUFDQUMsTUFBQSxHQUFBLEVBREE7QUFBQSxRQUVBQyxTQUFBLEdBQUEsR0FGQSxDQWpIQSxDQXFIQTs7QUFDQUgsSUFBQUEsS0FBQSxDQUFBcEgsRUFBQSxDQUFBLFNBQUEsRUFBQSxZQUFBO0FBQ0FxSCxNQUFBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLEtBRkEsRUF0SEEsQ0EwSEE7O0FBQ0FELElBQUFBLEtBQUEsQ0FBQXBILEVBQUEsQ0FBQSxNQUFBLEVBQUEsVUFBQWQsSUFBQSxFQUFBO0FBQ0FtSSxNQUFBQSxHQUFBOztBQUVBLFVBQUFuSSxJQUFBLENBQUEzRyxJQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0E7QUFDQTJHLFFBQUFBLElBQUEsQ0FBQWtILE9BQUEsQ0FBQUMsT0FBQSxDQUFBO0FBQ0FtQixVQUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBakIsWUFBQUEsS0FBQSxFQUFBYyxHQUFBLEdBQUFDLE1BQUEsR0FBQSxJQUZBO0FBR0E7QUFDQWQsWUFBQUEsR0FBQSxFQUFBZSxTQUpBO0FBS0E7QUFDQWQsWUFBQUEsSUFBQSxFQUFBLENBTkE7QUFPQTtBQUNBTSxZQUFBQSxFQUFBLEVBQUE7QUFSQTtBQURBLFNBQUE7QUFZQSxPQWRBLE1BY0EsSUFBQTdILElBQUEsQ0FBQTNHLElBQUEsS0FBQSxPQUFBLElBQUEyRyxJQUFBLENBQUF1SSxJQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0F2SSxRQUFBQSxJQUFBLENBQUFrSCxPQUFBLENBQUFDLE9BQUEsQ0FBQTtBQUNBcUIsVUFBQUEsQ0FBQSxFQUFBO0FBQ0FuQixZQUFBQSxLQUFBLEVBQUFjLEdBQUEsR0FBQUMsTUFEQTtBQUVBZCxZQUFBQSxHQUFBLEVBQUFlLFNBRkE7QUFHQWQsWUFBQUEsSUFBQSxFQUFBdkgsSUFBQSxDQUFBd0ksQ0FBQSxHQUFBLEdBSEE7QUFJQVgsWUFBQUEsRUFBQSxFQUFBN0gsSUFBQSxDQUFBd0ksQ0FKQTtBQUtBO0FBQ0FWLFlBQUFBLE1BQUEsRUFBQTtBQU5BO0FBREEsU0FBQTtBQVVBLE9BWEEsTUFXQSxJQUFBOUgsSUFBQSxDQUFBM0csSUFBQSxLQUFBLE9BQUEsSUFBQTJHLElBQUEsQ0FBQXVJLElBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQXZJLFFBQUFBLElBQUEsQ0FBQWtILE9BQUEsQ0FBQUMsT0FBQSxDQUFBO0FBQ0FzQixVQUFBQSxDQUFBLEVBQUE7QUFDQXBCLFlBQUFBLEtBQUEsRUFBQWMsR0FBQSxHQUFBQyxNQURBO0FBRUFkLFlBQUFBLEdBQUEsRUFBQWUsU0FGQTtBQUdBZCxZQUFBQSxJQUFBLEVBQUF2SCxJQUFBLENBQUF5SSxDQUFBLEdBQUEsR0FIQTtBQUlBWixZQUFBQSxFQUFBLEVBQUE3SCxJQUFBLENBQUF5SSxDQUpBO0FBS0FYLFlBQUFBLE1BQUEsRUFBQTtBQUxBO0FBREEsU0FBQTtBQVNBLE9BVkEsTUFVQSxJQUFBOUgsSUFBQSxDQUFBM0csSUFBQSxLQUFBLE9BQUEsRUFBQTtBQUNBMkcsUUFBQUEsSUFBQSxDQUFBa0gsT0FBQSxDQUFBQyxPQUFBLENBQUE7QUFDQXVCLFVBQUFBLEVBQUEsRUFBQTtBQUNBckIsWUFBQUEsS0FBQSxFQUFBYyxHQUFBLEdBQUFDLE1BREE7QUFFQWQsWUFBQUEsR0FBQSxFQUFBZSxTQUZBO0FBR0FkLFlBQUFBLElBQUEsRUFBQXZILElBQUEsQ0FBQXlJLENBQUEsR0FBQSxFQUhBO0FBSUFaLFlBQUFBLEVBQUEsRUFBQTdILElBQUEsQ0FBQXlJLENBSkE7QUFLQVgsWUFBQUEsTUFBQSxFQUFBO0FBTEEsV0FEQTtBQVFBYSxVQUFBQSxFQUFBLEVBQUE7QUFDQXRCLFlBQUFBLEtBQUEsRUFBQWMsR0FBQSxHQUFBQyxNQURBO0FBRUFkLFlBQUFBLEdBQUEsRUFBQWUsU0FGQTtBQUdBZCxZQUFBQSxJQUFBLEVBQUF2SCxJQUFBLENBQUF5SSxDQUFBLEdBQUEsRUFIQTtBQUlBWixZQUFBQSxFQUFBLEVBQUE3SCxJQUFBLENBQUF5SSxDQUpBO0FBS0FYLFlBQUFBLE1BQUEsRUFBQTtBQUxBLFdBUkE7QUFlQVEsVUFBQUEsT0FBQSxFQUFBO0FBQ0FqQixZQUFBQSxLQUFBLEVBQUFjLEdBQUEsR0FBQUMsTUFEQTtBQUVBZCxZQUFBQSxHQUFBLEVBQUFlLFNBRkE7QUFHQWQsWUFBQUEsSUFBQSxFQUFBLENBSEE7QUFJQU0sWUFBQUEsRUFBQSxFQUFBLENBSkE7QUFLQUMsWUFBQUEsTUFBQSxFQUFBO0FBTEE7QUFmQSxTQUFBO0FBdUJBLE9BeEJBLE1Bd0JBLElBQUE5SCxJQUFBLENBQUEzRyxJQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0E7QUFDQSxZQUFBdVAsYUFBQSxHQUFBO0FBQ0F2QixVQUFBQSxLQUFBLEVBQUFjLEdBQUEsR0FBQUMsTUFEQTtBQUVBZCxVQUFBQSxHQUFBLEVBQUFlLFNBRkE7QUFHQWQsVUFBQUEsSUFBQSxFQUFBdkgsSUFBQSxDQUFBQSxJQUFBLENBQUF1SSxJQUFBLENBQUFNLEtBQUEsQ0FBQUMsR0FBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBLEVBSEE7QUFJQWpCLFVBQUFBLEVBQUEsRUFBQTdILElBQUEsQ0FBQUEsSUFBQSxDQUFBdUksSUFBQSxDQUFBTSxLQUFBLENBQUFDLEdBQUEsR0FBQSxHQUFBLENBSkE7QUFLQWhCLFVBQUFBLE1BQUEsRUFBQTtBQUxBLFNBQUE7QUFRQSxZQUFBaUIsYUFBQSxHQUFBO0FBQ0ExQixVQUFBQSxLQUFBLEVBQUFjLEdBQUEsR0FBQUMsTUFEQTtBQUVBZCxVQUFBQSxHQUFBLEVBQUFlLFNBRkE7QUFHQWQsVUFBQUEsSUFBQSxFQUFBdkgsSUFBQSxDQUFBQSxJQUFBLENBQUF1SSxJQUFBLENBQUFNLEtBQUEsQ0FBQUMsR0FBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBLEdBSEE7QUFJQWpCLFVBQUFBLEVBQUEsRUFBQTdILElBQUEsQ0FBQUEsSUFBQSxDQUFBdUksSUFBQSxDQUFBTSxLQUFBLENBQUFDLEdBQUEsR0FBQSxHQUFBLENBSkE7QUFLQWhCLFVBQUFBLE1BQUEsRUFBQTtBQUxBLFNBQUE7QUFRQSxZQUFBa0IsVUFBQSxHQUFBLEVBQUE7QUFDQUEsUUFBQUEsVUFBQSxDQUFBaEosSUFBQSxDQUFBdUksSUFBQSxDQUFBTSxLQUFBLENBQUFDLEdBQUEsR0FBQSxHQUFBLENBQUEsR0FBQUYsYUFBQTtBQUNBSSxRQUFBQSxVQUFBLENBQUFoSixJQUFBLENBQUF1SSxJQUFBLENBQUFNLEtBQUEsQ0FBQUMsR0FBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBQyxhQUFBO0FBQ0FDLFFBQUFBLFVBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQTtBQUNBM0IsVUFBQUEsS0FBQSxFQUFBYyxHQUFBLEdBQUFDLE1BREE7QUFFQWQsVUFBQUEsR0FBQSxFQUFBZSxTQUZBO0FBR0FkLFVBQUFBLElBQUEsRUFBQSxDQUhBO0FBSUFNLFVBQUFBLEVBQUEsRUFBQSxD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LEVBS0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBO0FBSEEsS0FaQSxDQUFBO0FBMEJBLFFBQUFtSyxNQUFBLEdBQUEsQ0FBQTtBQUNBLGVBQUEsT0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEEsRUFVQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVkEsRUFXQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBWEEsRUFZQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBWkE7QUFIQSxLQUFBLEVBaUJBO0FBQ0EsZUFBQSxTQURBO0FBRUEsZUFBQSxTQUZBO0FBR0EsY0FBQSxDQUNBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FEQSxFQUVBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FGQSxFQUdBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FIQSxFQUlBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FKQSxFQUtBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FMQSxFQU1BLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FOQSxFQU9BLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FQQSxFQVFBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FSQSxFQVNBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FUQSxFQVVBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FWQSxFQVdBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FYQSxFQVlBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FaQTtBQUhBLEtBakJBLENBQUE7QUFvQ0EsUUFBQUMsTUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLE1BREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUpBLEVBS0EsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQVBBLEVBUUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQVRBLEVBVUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQVZBLEVBV0EsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQVpBLEVBYUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQWJBLEVBY0EsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQWRBLEVBZUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQWZBO0FBSEEsS0FBQSxFQW9CQTtBQUNBLGVBQUEsU0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBTEEsRUFNQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBTkEsRUFPQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEdBQUEsRUFBQSxH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WUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FqQkEsRUFrQ0E7QUFDQSxlQUFBLElBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FsQ0EsQ0FBQTtBQXFEQSxRQUFBbUssTUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLFNBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVRBLEVBVUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQVZBLEVBV0EsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQVpBLEVBYUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQWJBO0FBSEEsS0FBQSxFQWtCQTtBQUNBLGVBQUEsVUFEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEEsRUFVQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBVkEsRUFXQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWEEsRUFZQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWkEsRUFhQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBYkE7QUFIQSxLQWxCQSxFQW9DQTtBQUNBLGVBQUEsV0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEEsRUFVQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWEEsRUFZQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWkEsRUFhQSxDQUFBLE1BQUEsRUFB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WUFBQSxDQUFBOztBQUVBLFdBQUFBLFlBQUEsR0FBQTtBQUVBLFFBQUF4TSxJQUFBLEdBQUEsQ0FBQTtBQUNBLGVBQUEsVUFEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEE7QUFIQSxLQUFBLEVBY0E7QUFDQSxlQUFBLGFBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBO0FBSEEsS0FkQSxFQTRCQTtBQUNBLGVBQUEsV0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBTEEs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QSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsQ0FEQTtBQUVBcUUsUUFBQUEsS0FBQSxFQUFBO0FBRkEsT0FBQSxFQUdBO0FBQ0E3TSxRQUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBeUksVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsQ0FEQTtBQUVBcUUsUUFBQUEsS0FBQSxFQUFBO0FBRkEsT0FIQTtBQUpBLEtBQUEsQ0FBQTtBQWFBMkIsSUFBQUEsTUFBQSxDQUFBRCxNQUFBLEdBdERBLENBd0RBO0FBQ0E7O0FBR0EsUUFBQUcsTUFBQSxHQUFBLElBQUFiLFFBQUEsQ0FBQVEsS0FBQSxDQUFBO0FBQ0FuSCxNQUFBQSxPQUFBLEVBQUE3TSxRQUFBLENBQUFvRixhQUFBLENBQUEsWUFBQSxDQURBO0FBRUE2TyxNQUFBQSxRQUFBLEVBQUEsTUFGQTtBQUdBeEksTUFBQUEsTUFBQSxFQUFBLENBQUE7QUFDQTlGLFFBQUFBLElBQUEsRUFBQSxDQUFBO0FBQUF5SSxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxDQURBO0FBRUFxRSxRQUFBQSxLQUFBLEVBQUE7QUFGQSxPQUFBLEVBR0E7QUFDQTdNLFFBQUFBLElBQUEsRUFBQSxDQUFBO0FBQUF5SSxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxDQURBO0FBRUFxRSxRQUFBQSxLQUFBLEVBQUE7QUFGQSxPQUhBO0FBSEEsS0FBQSxDQUFBO0FBV0E2QixJQUFBQSxNQUFBLENBQUFILE1BQUEsR0F2RUEsQ0EwRUE7QUFDQTs7QUFHQSxRQUFBSSxNQUFBLEdBQUEsSUFBQWQsUUFBQSxDQUFBUSxLQUFBLENBQUE7QUFDQW5ILE1BQUFBLE9BQUEsRUFBQTdNLFFBQUEsQ0FBQW9GLGFBQUEsQ0FBQSxZQUFBLENBREE7QUFFQTZPLE1BQUFBLFFBQUEsRUFBQSxLQUZBO0FBR0F4SSxNQUFBQSxNQUFBLEVBQUEsQ0FBQTtBQUNBOUYsUUFBQUEsSUFBQSxFQUFBLENBQUE7QUFBQXlJLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLENBREE7QUFFQXFFLFFBQUFBLEtBQUEsRUFBQTtBQUZBLE9BQUEsRUFHQTtBQUNBN00sUUFBQUEsSUFBQSxFQUFBLENBQUE7QUFBQXlJLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLENBREE7QUFFQXFFLFFBQUFBLEtBQUEsRUFBQTtBQUZBLE9BSEE7QUFIQSxLQUFBLENBQUE7QUFZQThCLElBQUFBLE1BQUEsQ0FBQUosTUFBQTtBQUVBO0FBRUEsQ0FuR0EsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBeFcsRUFBQUEsQ0FBQSxDQUFBNlcsYUFBQSxDQUFBOztBQUVBLFdBQUFBLGFBQUEsR0FBQTtBQUVBN1csSUFBQUEsQ0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQThELElBQUEsQ0FBQWdULGFBQUE7O0FBRUEsYUFBQUEsYUFBQSxHQUFBO0FBQ0EsVUFBQUMsUUFBQSxHQUFBL1csQ0FBQSxDQUFBLElBQUEsQ0FBQTtBQUFBLFVBQ0FzTSxPQUFBLEdBQUF5SyxRQUFBLENBQUE5TyxJQUFBLEVBREE7QUFBQSxVQUVBK08sTUFBQSxHQUFBMUssT0FBQSxDQUFBMEssTUFBQSxJQUFBMUssT0FBQSxDQUFBMEssTUFBQSxDQUFBelYsS0FBQSxDQUFBLEdBQUEsQ0FGQTtBQUlBK0ssTUFBQUEsT0FBQSxDQUFBaEwsSUFBQSxHQUFBZ0wsT0FBQSxDQUFBaEwsSUFBQSxJQUFBLEtBQUEsQ0FMQSxDQUtBOztBQUNBZ0wsTUFBQUEsT0FBQSxDQUFBMkssa0JBQUEsR0FBQSxJQUFBO0FBRUFGLE1BQUFBLFFBQUEsQ0FBQUcsU0FBQSxDQUFBRixNQUFBLEVBQUExSyxPQUFBOztBQUVBLFVBQUFBLE9BQUEsQ0FBQWtKLE1BQUEsRUFBQTtBQUNBeFYsUUFBQUEsQ0FBQSxDQUFBQyxNQUFBLENBQUEsQ0FBQXVWLE1BQUEsQ0FBQSxZQUFBO0FBQ0F1QixVQUFBQSxRQUFBLENBQUFHLFNBQUEsQ0FBQUYsTUFBQSxFQUFBMUssT0FBQTtBQUNBLFNBRkE7QUFHQTtBQUNBO0FBQ0E7QUFFQSxDQTNCQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUF0TSxFQUFBQSxDQUFBLENBQUFtWCxhQUFBLENBQUE7O0FBRUEsV0FBQUEsYUFBQSxHQUFBO0FBRUE7QUFDQSxRQUFBLENBQUFuWCxDQUFBLENBQUFRLEVBQUEsSUFBQSxDQUFBUixDQUFBLENBQUFRLEVBQUEsQ0FBQXdTLE9BQUEsSUFBQSxDQUFBaFQsQ0FBQSxDQUFBUSxFQUFBLENBQUE0VyxPQUFBLEVBQUEsT0FIQSxDQUtBO0FBQ0E7O0FBRUFwWCxJQUFBQSxDQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBb1gsT0FBQSxHQVJBLENBVUE7QUFDQTs7QUFFQXBYLElBQUFBLENBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUFnVCxPQUFBLENBQUE7QUFDQXFFLE1BQUFBLFNBQUEsRUFBQTtBQURBLEtBQUEsRUFiQSxDQWlCQTtBQUNBOztBQUNBclgsSUFBQUEsQ0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQStJLEVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQTVILEtBQUEsRUFBQTtBQUNBQSxNQUFBQSxLQUFBLENBQUFtVyxlQUFBO0FBQ0EsS0FGQTtBQUlBO0FBRUEsQ0E5QkEsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBdFgsRUFBQUEsQ0FBQSxDQUFBdVgsZUFBQSxDQUFBO0FBQ0F2WCxFQUFBQSxDQUFBLENBQUF3WCxnQkFBQSxDQUFBO0FBQ0F4WCxFQUFBQSxDQUFBLENBQUF5WCxlQUFBLENBQUE7QUFHQTs7Ozs7QUFJQSxXQUFBQyxhQUFBLENBQUEvVyxJQUFBLEVBQUE7QUFDQSxRQUFBcUIsRUFBQSxHQUFBckIsSUFBQSxDQUFBb0csYUFBQTs7QUFDQSxXQUFBL0UsRUFBQSxJQUFBLENBQUFBLEVBQUEsQ0FBQTRCLFNBQUEsQ0FBQUMsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUNBN0IsRUFBQSxHQUFBQSxFQUFBLENBQUErRSxhQUFBOztBQUNBLFdBQUEvRSxFQUFBO0FBQ0E7QUFDQTs7Ozs7QUFHQSxXQUFBMlYsWUFBQSxDQUFBclcsSUFBQSxFQUFBWCxJQUFBLEVBQUFzSCxJQUFBLEVBQUE7QUFDQSxRQUFBZ0IsRUFBQTs7QUFDQSxRQUFBLE9BQUEyTyxXQUFBLEtBQUEsVUFBQSxFQUFBO0FBQ0EzTyxNQUFBQSxFQUFBLEdBQUEsSUFBQTJPLFdBQUEsQ0FBQXRXLElBQUEsRUFBQTtBQUFBdVcsUUFBQUEsTUFBQSxFQUFBNVA7QUFBQSxPQUFBLENBQUE7QUFDQSxLQUZBLE1BRUE7QUFDQWdCLE1BQUFBLEVBQUEsR0FBQTNHLFFBQUEsQ0FBQW9HLFdBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQU8sTUFBQUEsRUFBQSxDQUFBNk8sZUFBQSxDQUFBeFcsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEyRyxJQUFBO0FBQ0E7O0FBQ0F0SCxJQUFBQSxJQUFBLENBQUFpSSxhQUFBLENBQUFLLEVBQUE7QUFDQTtBQUVBOzs7Ozs7QUFJQSxXQUFBc08sZUFBQSxHQUFBO0FBQ0EsUUFBQVEsZ0JBQUEsR0FBQSw0QkFBQTtBQUVBLFFBQUFDLFFBQUEsR0FBQSxHQUFBNVgsS0FBQSxDQUFBQyxJQUFBLENBQUFpQyxRQUFBLENBQUFDLGdCQUFBLENBQUF3VixnQkFBQSxDQUFBLENBQUE7QUFFQUMsSUFBQUEsUUFBQSxDQUFBclUsT0FBQSxDQUFBLFVBQUFoRCxJQUFBLEVBQUE7QUFDQSxVQUFBc1gsV0FBQSxDQUFBdFgsSUFBQTtBQUNBLEtBRkE7O0FBSUEsYUFBQXNYLFdBQUEsQ0FBQXRYLElBQUEsRUFBQTtBQUNBLFVBQUF1WCxZQUFBLEdBQUEsYUFBQTtBQUNBLFVBQUFDLGFBQUEsR0FBQSxjQUFBO0FBRUEsV0FBQXhYLElBQUEsR0FBQUEsSUFBQTtBQUNBLFdBQUF5WCxVQUFBLEdBQUFWLGFBQUEsQ0FBQSxLQUFBL1csSUFBQSxDQUFBO0FBQ0EsV0FBQTBYLFFBQUEsR0FBQSxLQUFBLENBTkEsQ0FNQTs7QUFFQSxXQUFBQyxZQUFBLEdBQUEsVUFBQXhULENBQUEsRUFBQTtBQUNBLFlBQUEsS0FBQXVULFFBQUEsRUFBQTtBQUNBLGFBQUFBLFFBQUEsR0FBQSxJQUFBLENBRkEsQ0FHQTs7QUFDQVYsUUFBQUEsWUFBQSxDQUFBTyxZQUFBLEVBQUEsS0FBQUUsVUFBQSxFQUFBO0FBQ0FHLFVBQUFBLE9BQUEsRUFBQSxLQUFBQSxPQUFBLENBQUFyWCxJQUFBLENBQUEsSUFBQSxDQURBO0FBRUFzWCxVQUFBQSxNQUFBLEVBQUEsS0FBQUEsTUFBQSxDQUFBdFgsSUFBQSxDQUFBLElBQUE7QUFGQSxTQUFBLENBQUE7QUFJQSxPQVJBOztBQVNBLFdBQUFxWCxPQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUFuSixPQUFBLENBQUEsS0FBQWdKLFVBQUEsRUFBQSxZQUFBO0FBQ0FULFVBQUFBLFlBQUEsQ0FBQVEsYUFBQSxFQUFBLEtBQUFDLFVBQUEsQ0FBQTtBQUNBLGVBQUFwUSxNQUFBLENBQUEsS0FBQW9RLFVBQUE7QUFDQSxTQUhBO0FBSUEsT0FMQTs7QUFNQSxXQUFBSSxNQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUFILFFBQUEsR0FBQSxLQUFBO0FBQ0EsT0FGQTs7QUFHQSxXQUFBakosT0FBQSxHQUFBLFVBQUF6TyxJQUFBLEVBQUF5QyxFQUFBLEVBQUE7QUFDQSxZQUFBLG9CQUFBbkQsTUFBQSxFQUFBO0FBQUE7QUFDQVUsVUFBQUEsSUFBQSxDQUFBYSxnQkFBQSxDQUFBLGNBQUEsRUFBQTRCLEVBQUEsQ0FBQWxDLElBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQVAsVUFBQUEsSUFBQSxDQUFBOFgsU0FBQSxJQUFBLHFCQUFBLENBRkEsQ0FFQTtBQUNBLFNBSEEsTUFHQXJWLEVBQUEsQ0FBQS9DLElBQUEsQ0FBQSxJQUFBLEVBSkEsQ0FJQTs7QUFDQSxPQUxBOztBQU1BLFdBQUEySCxNQUFBLEdBQUEsVUFBQXJILElBQUEsRUFBQTtBQUNBQSxRQUFBQSxJQUFBLENBQUF5RixVQUFBLENBQUE4QixXQUFBLENBQUF2SCxJQUFBO0FBQ0EsT0FGQSxDQWhDQSxDQW1DQTs7O0FBQ0FBLE1BQUFBLElBQUEsQ0FBQWEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQThXLFlBQUEsQ0FBQXBYLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxLQUFBO0FBQ0E7QUFDQTtBQUdBOzs7Ozs7O0FBS0EsV0FBQXNXLGdCQUFBLEdBQUE7QUFDQSxRQUFBTyxnQkFBQSxHQUFBLDZCQUFBO0FBQ0EsUUFBQUMsUUFBQSxHQUFBLEdBQUE1WCxLQUFBLENBQUFDLElBQUEsQ0FBQWlDLFFBQUEsQ0FBQUMsZ0JBQUEsQ0FBQXdWLGdCQUFBLENBQUEsQ0FBQTtBQUVBQyxJQUFBQSxRQUFBLENBQUFyVSxPQUFBLENBQUEsVUFBQWhELElBQUEsRUFBQTtBQUNBLFVBQUErWCxZQUFBLEdBQUEvWCxJQUFBLENBQUFnWSxZQUFBLENBQUEsc0JBQUEsQ0FBQTtBQUNBLFVBQUFDLFlBQUEsQ0FBQWpZLElBQUEsRUFBQStYLFlBQUE7QUFDQSxLQUhBOztBQUtBLGFBQUFFLFlBQUEsQ0FBQWpZLElBQUEsRUFBQWtZLGNBQUEsRUFBQTtBQUNBLFVBQUFDLFVBQUEsR0FBQSxvQkFBQTtBQUNBLFVBQUFDLFVBQUEsR0FBQSxvQkFBQTtBQUVBLFdBQUFDLEtBQUEsR0FBQSxJQUFBLENBSkEsQ0FJQTs7QUFDQSxXQUFBclksSUFBQSxHQUFBQSxJQUFBO0FBQ0EsV0FBQXlYLFVBQUEsR0FBQVYsYUFBQSxDQUFBLEtBQUEvVyxJQUFBLENBQUE7QUFDQSxXQUFBc1ksT0FBQSxHQUFBLEtBQUFiLFVBQUEsQ0FBQTFRLGFBQUEsQ0FBQSxlQUFBLENBQUE7O0FBRUEsV0FBQXdSLGNBQUEsR0FBQSxVQUFBMVAsTUFBQSxFQUFBO0FBQ0FtTyxRQUFBQSxZQUFBLENBQUFuTyxNQUFBLEdBQUFzUCxVQUFBLEdBQUFDLFVBQUEsRUFBQSxLQUFBWCxVQUFBLENBQUE7QUFDQSxhQUFBYSxPQUFBLENBQUFsVSxLQUFBLENBQUFvVSxTQUFBLEdBQUEsQ0FBQTNQLE1BQUEsR0FBQSxLQUFBeVAsT0FBQSxDQUFBRyxZQUFBLEdBQUEsQ0FBQSxJQUFBLElBQUE7QUFDQSxhQUFBSixLQUFBLEdBQUF4UCxNQUFBO0FBQ0EsYUFBQTZQLFVBQUEsQ0FBQTdQLE1BQUE7QUFDQSxPQUxBOztBQU1BLFdBQUE2UCxVQUFBLEdBQUEsVUFBQTdQLE1BQUEsRUFBQTtBQUNBLGFBQUE3SSxJQUFBLENBQUEyWSxpQkFBQSxDQUFBYixTQUFBLEdBQUFqUCxNQUFBLEdBQUEsYUFBQSxHQUFBLFlBQUE7QUFDQSxPQUZBOztBQUdBLFdBQUE4TyxZQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUFZLGNBQUEsQ0FBQSxDQUFBLEtBQUFGLEtBQUE7QUFDQSxPQUZBOztBQUdBLFdBQUFPLFVBQUEsR0FBQSxZQUFBO0FBQ0EsYUFBQU4sT0FBQSxDQUFBbFUsS0FBQSxDQUFBb1UsU0FBQSxHQUFBLEtBQUFGLE9BQUEsQ0FBQUcsWUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBSCxPQUFBLENBQUFsVSxLQUFBLENBQUF5VSxVQUFBLEdBQUEsaUJBQUE7QUFDQSxhQUFBUCxPQUFBLENBQUFsVSxLQUFBLENBQUEwVSxRQUFBLEdBQUEsUUFBQTtBQUNBLE9BSkEsQ0FyQkEsQ0EyQkE7OztBQUNBLFdBQUFGLFVBQUEsR0E1QkEsQ0E2QkE7O0FBQ0EsVUFBQVYsY0FBQSxFQUFBO0FBQ0EsYUFBQUssY0FBQSxDQUFBLEtBQUE7QUFDQSxPQWhDQSxDQWlDQTs7O0FBQ0EsV0FBQXZZLElBQUEsQ0FBQWEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQThXLFlBQUEsQ0FBQXBYLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxLQUFBO0FBRUE7QUFDQTtBQUdBOzs7Ozs7O0FBS0EsV0FBQXVXLGVBQUEsR0FBQTtBQUVBLFFBQUFNLGdCQUFBLEdBQUEsNEJBQUE7QUFDQSxRQUFBQyxRQUFBLEdBQUEsR0FBQTVYLEtBQUEsQ0FBQUMsSUFBQSxDQUFBaUMsUUFBQSxDQUFBQyxnQkFBQSxDQUFBd1YsZ0JBQUEsQ0FBQSxDQUFBO0FBRUFDLElBQUFBLFFBQUEsQ0FBQXJVLE9BQUEsQ0FBQSxVQUFBaEQsSUFBQSxFQUFBO0FBQ0EsVUFBQStZLFdBQUEsQ0FBQS9ZLElBQUE7QUFDQSxLQUZBOztBQUlBLGFBQUErWSxXQUFBLENBQUEvWSxJQUFBLEVBQUE7QUFDQSxVQUFBZ1osYUFBQSxHQUFBLGNBQUE7QUFDQSxVQUFBQyxXQUFBLEdBQUEsT0FBQTtBQUNBLFVBQUFDLGVBQUEsR0FBQSxVQUFBO0FBRUEsV0FBQWxaLElBQUEsR0FBQUEsSUFBQTtBQUNBLFdBQUF5WCxVQUFBLEdBQUFWLGFBQUEsQ0FBQSxLQUFBL1csSUFBQSxDQUFBO0FBQ0EsV0FBQW1aLE9BQUEsR0FBQSxDQUFBLENBQUEsS0FBQW5aLElBQUEsQ0FBQW9aLE9BQUEsSUFBQSxFQUFBLEVBQUFELE9BQUEsSUFBQUQsZUFBQSxFQUFBdFksS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQVBBLENBT0E7O0FBRUEsV0FBQXlZLE9BQUEsR0FBQSxVQUFBbFYsQ0FBQSxFQUFBO0FBQ0EsWUFBQW1WLElBQUEsR0FBQSxLQUFBN0IsVUFBQSxDQURBLENBRUE7O0FBQ0EsYUFBQThCLFdBQUEsQ0FBQUQsSUFBQSxFQUFBLEtBQUFILE9BQUEsRUFIQSxDQUlBOztBQUNBRyxRQUFBQSxJQUFBLENBQUFFLGFBQUEsR0FBQSxLQUFBQSxhQUFBLENBQUFqWixJQUFBLENBQUEsSUFBQSxDQUFBLENBTEEsQ0FNQTs7QUFDQXlXLFFBQUFBLFlBQUEsQ0FBQWdDLGFBQUEsRUFBQU0sSUFBQSxFQUFBO0FBQUFBLFVBQUFBLElBQUEsRUFBQUE7QUFBQSxTQUFBLENBQUE7QUFDQSxPQVJBOztBQVNBLFdBQUFDLFdBQUEsR0FBQSxVQUFBRCxJQUFBLEVBQUFILE9BQUEsRUFBQTtBQUNBRyxRQUFBQSxJQUFBLENBQUFyVyxTQUFBLENBQUF3VyxHQUFBLENBQUFSLFdBQUE7QUFDQUUsUUFBQUEsT0FBQSxDQUFBblcsT0FBQSxDQUFBLFVBQUEwVyxDQUFBLEVBQUE7QUFBQUosVUFBQUEsSUFBQSxDQUFBclcsU0FBQSxDQUFBd1csR0FBQSxDQUFBQyxDQUFBO0FBQUEsU0FBQTtBQUNBLE9BSEE7O0FBSUEsV0FBQUYsYUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBL0IsVUFBQSxDQUFBeFUsU0FBQSxDQUFBb0UsTUFBQSxDQUFBNFIsV0FBQTtBQUNBLE9BRkEsQ0F0QkEsQ0EwQkE7OztBQUNBLFdBQUFqWixJQUFBLENBQUFhLGdCQUFBLENBQUEsT0FBQSxFQUFBLEtBQUF3WSxPQUFBLENBQUE5WSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQTtBQUVBO0FBQ0E7QUFFQSxDQTFMQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBRUFqQixFQUFBQSxNQUFBLENBQUFzSyxVQUFBLEdBQUE7QUFDQSxlQUFBLFNBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxZQUFBLFNBSEE7QUFJQSxlQUFBLFNBSkE7QUFLQSxjQUFBLFNBTEE7QUFNQSxlQUFBLFNBTkE7QUFPQSxhQUFBLFNBUEE7QUFRQSxZQUFBLFNBUkE7QUFTQSxjQUFBLFNBVEE7QUFVQSxZQUFBLFNBVkE7QUFXQSxjQUFBLFNBWEE7QUFZQSxtQkFBQSxTQVpBO0FBYUEsaUJBQUEsU0FiQTtBQWNBLFlBQUEsU0FkQTtBQWVBLGtCQUFBLFNBZkE7QUFnQkEsb0JBQUE7QUFoQkEsR0FBQTtBQW1CQXRLLEVBQUFBLE1BQUEsQ0FBQXFhLGNBQUEsR0FBQTtBQUNBLGlCQUFBLElBREE7QUFFQSxlQUFBLEdBRkE7QUFHQSxjQUFBLEdBSEE7QUFJQSxjQUFBO0FBSkEsR0FBQTtBQU9BLENBNUJBLEksQ0NIQTtBQUNBOzs7QUFFQSxDQUFBLFlBQUE7QUFDQTs7QUFFQXRhLEVBQUFBLENBQUEsQ0FBQXVhLGNBQUEsQ0FBQTs7QUFFQSxXQUFBQSxjQUFBLEdBQUE7QUFDQSxRQUFBLE9BQUFDLFVBQUEsS0FBQSxXQUFBLEVBQUE7QUFFQSxRQUFBQyxJQUFBLEdBQUF6YSxDQUFBLENBQUFzQyxRQUFBLENBQUE7QUFDQSxRQUFBb1ksVUFBQSxHQUFBMWEsQ0FBQSxDQUFBLDBCQUFBLENBQUEsQ0FKQSxDQU1BOztBQUNBLFFBQUEyYSxFQUFBLEdBQUExYSxNQUFBLENBQUEyYSxTQUFBLENBQUFDLFNBQUE7O0FBQ0EsUUFBQUYsRUFBQSxDQUFBOVgsT0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOFgsRUFBQSxDQUFBRyxLQUFBLENBQUEsbUJBQUEsQ0FBQSxFQUFBO0FBQ0FKLE1BQUFBLFVBQUEsQ0FBQXRSLFFBQUEsQ0FBQSxRQUFBLEVBREEsQ0FDQTs7QUFDQSxhQUZBLENBRUE7QUFDQTs7QUFFQXNSLElBQUFBLFVBQUEsQ0FBQTNSLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQWpFLENBQUEsRUFBQTtBQUNBQSxNQUFBQSxDQUFBLENBQUE2RSxjQUFBOztBQUVBLFVBQUE2USxVQUFBLENBQUE3SSxPQUFBLEVBQUE7QUFFQTZJLFFBQUFBLFVBQUEsQ0FBQU8sTUFBQSxHQUZBLENBSUE7O0FBQ0FDLFFBQUFBLFlBQUEsQ0FBQU4sVUFBQSxDQUFBO0FBRUEsT0FQQSxNQU9BO0FBQ0FPLFFBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBLHdCQUFBO0FBQ0E7QUFDQSxLQWJBO0FBZUEsUUFBQVYsVUFBQSxDQUFBVyxHQUFBLElBQUFYLFVBQUEsQ0FBQVcsR0FBQSxDQUFBQyxnQkFBQSxFQUNBWCxJQUFBLENBQUExUixFQUFBLENBQUF5UixVQUFBLENBQUFXLEdBQUEsQ0FBQUMsZ0JBQUEsRUFBQSxZQUFBO0FBQ0FKLE1BQUFBLFlBQUEsQ0FBQU4sVUFBQSxDQUFBO0FBQ0EsS0FGQTs7QUFJQSxhQUFBTSxZQUFBLENBQUFqRSxRQUFBLEVBQUE7QUFDQSxVQUFBeUQsVUFBQSxDQUFBYSxZQUFBLEVBQ0F0RSxRQUFBLENBQUExUSxRQUFBLENBQUEsSUFBQSxFQUFBZ0QsV0FBQSxDQUFBLFdBQUEsRUFBQUQsUUFBQSxDQUFBLGFBQUEsRUFEQSxLQUdBMk4sUUFBQSxDQUFBMVEsUUFBQSxDQUFBLElBQUEsRUFBQWdELFdBQUEsQ0FBQSxhQUFBLEVBQUFELFFBQUEsQ0FBQSxXQUFBO0FBQ0E7QUFFQTtBQUVBLENBL0NBLEksQ0NIQTtBQUNBOzs7QUFFQSxDQUFBLFlBQUE7QUFDQTs7QUFFQXBKLEVBQUFBLENBQUEsQ0FBQXNiLFdBQUEsQ0FBQTs7QUFFQSxXQUFBQSxXQUFBLEdBQUE7QUFFQXRiLElBQUFBLENBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUErSSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFFQSxVQUFBcUssT0FBQSxHQUFBblAsQ0FBQSxDQUFBLElBQUEsQ0FBQTtBQUVBLFVBQUFtUCxPQUFBLENBQUE5SCxFQUFBLENBQUEsR0FBQSxDQUFBLEVBQ0F2QyxDQUFBLENBQUE2RSxjQUFBO0FBRUEsVUFBQTRSLEdBQUEsR0FBQXBNLE9BQUEsQ0FBQWxILElBQUEsQ0FBQSxTQUFBLENBQUE7QUFBQSxVQUNBdVQsSUFEQTs7QUFHQSxVQUFBRCxHQUFBLEVBQUE7QUFDQUMsUUFBQUEsSUFBQSxHQUFBQyxVQUFBLENBQUFGLEdBQUEsQ0FBQTs7QUFDQSxZQUFBLENBQUFDLElBQUEsRUFBQTtBQUNBeGIsVUFBQUEsQ0FBQSxDQUFBMGIsS0FBQSxDQUFBLHlDQUFBO0FBQ0E7QUFDQSxPQUxBLE1BS0E7QUFDQTFiLFFBQUFBLENBQUEsQ0FBQTBiLEtBQUEsQ0FBQSxpQ0FBQTtBQUNBO0FBRUEsS0FuQkE7QUFvQkE7O0FBRUEsV0FBQUQsVUFBQSxDQUFBRixHQUFBLEVBQUE7QUFDQSxRQUFBSSxNQUFBLEdBQUEsdUJBQUE7QUFBQSxRQUNBQyxPQUFBLEdBQUE1YixDQUFBLENBQUEsTUFBQTJiLE1BQUEsQ0FBQSxDQUFBdFosSUFBQSxDQUFBLElBQUEsRUFBQXNaLE1BQUEsR0FBQSxNQUFBLENBREE7QUFHQTNiLElBQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQXdILE1BQUEsQ0FBQXhILENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQXFDLElBQUEsQ0FBQTtBQUNBLFlBQUFzWixNQURBO0FBRUEsYUFBQSxZQUZBO0FBR0EsY0FBQUo7QUFIQSxLQUFBLENBQUE7O0FBTUEsUUFBQUssT0FBQSxDQUFBMVksTUFBQSxFQUFBO0FBQ0EwWSxNQUFBQSxPQUFBLENBQUE1VCxNQUFBO0FBQ0E7O0FBRUEsV0FBQWhJLENBQUEsQ0FBQSxNQUFBMmIsTUFBQSxDQUFBO0FBQ0E7QUFFQSxDQTlDQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUEzYixFQUFBQSxDQUFBLENBQUE2YixlQUFBLENBQUE7QUFHQSxNQUFBQyxVQUFBLEdBQUEsZUFBQSxDQU5BLENBTUE7O0FBQ0EsTUFBQUMsVUFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBQyxhQUFBLEdBQUFDLFFBQUEsQ0FBQUMsWUFBQSxDQUFBQyxHQUFBLENBQUFKLFVBQUEsQ0FBQTs7QUFFQSxXQUFBRixlQUFBLEdBQUE7QUFDQU8sSUFBQUEsT0FBQSxDQUNBQyxHQURBLENBQ0FDLGlCQURBLEVBRUE7QUFGQSxLQUdBcmEsSUFIQSxDQUdBO0FBQ0FzYSxNQUFBQSxXQUFBLEVBQUFQLGFBQUEsSUFBQSxJQURBO0FBRUFRLE1BQUFBLE9BQUEsRUFBQTtBQUNBQyxRQUFBQSxRQUFBLEVBQUFYLFVBQUEsR0FBQTtBQURBLE9BRkE7QUFLQVksTUFBQUEsRUFBQSxFQUFBLENBQUEsTUFBQSxDQUxBO0FBTUFDLE1BQUFBLFNBQUEsRUFBQSxNQU5BO0FBT0FDLE1BQUFBLEtBQUEsRUFBQTtBQVBBLEtBSEEsRUFXQSxVQUFBQyxHQUFBLEVBQUFDLENBQUEsRUFBQTtBQUNBO0FBQ0FDLE1BQUFBLGdCQUFBLEdBRkEsQ0FHQTs7QUFDQUMsTUFBQUEsb0JBQUE7QUFDQSxLQWhCQTs7QUFrQkEsYUFBQUQsZ0JBQUEsR0FBQTtBQUNBLFVBQUFFLElBQUEsR0FBQSxHQUFBN2MsS0FBQSxDQUFBQyxJQUFBLENBQUFpQyxRQUFBLENBQUFDLGdCQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EwYSxNQUFBQSxJQUFBLENBQUF0WixPQUFBLENBQUEsVUFBQWhELElBQUEsRUFBQTtBQUNBLFlBQUFxRCxHQUFBLEdBQUFyRCxJQUFBLENBQUF3RSxZQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsWUFBQWlYLE9BQUEsQ0FBQWMsTUFBQSxDQUFBbFosR0FBQSxDQUFBLEVBQUFyRCxJQUFBLENBQUF3YyxTQUFBLEdBQUFmLE9BQUEsQ0FBQVUsQ0FBQSxDQUFBOVksR0FBQSxDQUFBO0FBQ0EsT0FIQTtBQUlBOztBQUVBLGFBQUFnWixvQkFBQSxHQUFBO0FBQ0EsVUFBQUMsSUFBQSxHQUFBLEdBQUE3YyxLQUFBLENBQUFDLElBQUEsQ0FBQWlDLFFBQUEsQ0FBQUMsZ0JBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7QUFDQTBhLE1BQUFBLElBQUEsQ0FBQXRaLE9BQUEsQ0FBQSxVQUFBaEQsSUFBQSxFQUFBO0FBRUFBLFFBQUFBLElBQUEsQ0FBQWEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQXNELENBQUEsRUFBQTtBQUNBLGNBQUFBLENBQUEsQ0FBQXpELE1BQUEsQ0FBQStiLE9BQUEsS0FBQSxHQUFBLEVBQUF0WSxDQUFBLENBQUE2RSxjQUFBO0FBQ0EsY0FBQTBULElBQUEsR0FBQTFjLElBQUEsQ0FBQXdFLFlBQUEsQ0FBQSxlQUFBLENBQUE7O0FBQ0EsY0FBQWtZLElBQUEsRUFBQTtBQUNBakIsWUFBQUEsT0FBQSxDQUFBa0IsY0FBQSxDQUFBRCxJQUFBLEVBQUEsVUFBQVIsR0FBQSxFQUFBO0FBQ0Esa0JBQUFBLEdBQUEsRUFBQTVCLE9BQUEsQ0FBQUMsR0FBQSxDQUFBMkIsR0FBQSxFQUFBLEtBQ0E7QUFDQUUsZ0JBQUFBLGdCQUFBO0FBQ0FkLGdCQUFBQSxRQUFBLENBQUFDLFlBQUEsQ0FBQXFCLEdBQUEsQ0FBQXhCLFVBQUEsRUFBQXNCLElBQUE7QUFDQTtBQUNBLGFBTkE7QUFPQTs7QUFDQUcsVUFBQUEsZ0JBQUEsQ0FBQTdjLElBQUEsQ0FBQTtBQUNBLFNBYkE7QUFlQSxPQWpCQTtBQWtCQTs7QUFFQSxhQUFBNmMsZ0JBQUEsQ0FBQTdjLElBQUEsRUFBQTtBQUNBLFVBQUFBLElBQUEsQ0FBQWlELFNBQUEsQ0FBQUMsUUFBQSxDQUFBLGVBQUEsQ0FBQSxFQUFBO0FBQ0FsRCxRQUFBQSxJQUFBLENBQUFvRyxhQUFBLENBQUEwVyxzQkFBQSxDQUFBTixTQUFBLEdBQUF4YyxJQUFBLENBQUF3YyxTQUFBO0FBQ0E7QUFDQTtBQUVBO0FBR0EsQ0FwRUEsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBbmQsRUFBQUEsQ0FBQSxDQUFBMGQsZ0JBQUEsQ0FBQTs7QUFFQSxXQUFBQSxnQkFBQSxHQUFBO0FBRUEsUUFBQUMsU0FBQSxHQUFBLElBQUFDLGlCQUFBLEVBQUEsQ0FGQSxDQUlBOztBQUNBLFFBQUFDLFdBQUEsR0FBQTdkLENBQUEsQ0FBQSxvQkFBQSxDQUFBO0FBRUE2ZCxJQUFBQSxXQUFBLENBQ0E5VSxFQURBLENBQ0EsT0FEQSxFQUNBLFVBQUFqRSxDQUFBLEVBQUE7QUFBQUEsTUFBQUEsQ0FBQSxDQUFBd1MsZUFBQTtBQUFBLEtBREEsRUFFQXZPLEVBRkEsQ0FFQSxPQUZBLEVBRUE0VSxTQUFBLENBQUE1QyxNQUZBLEVBUEEsQ0FXQTs7QUFDQSxRQUFBK0MsY0FBQSxHQUFBOWQsQ0FBQSxDQUFBLHVCQUFBLENBQUE7QUFDQSxRQUFBK2QsYUFBQSxHQUFBLGlDQUFBO0FBRUEvZCxJQUFBQSxDQUFBLENBQUErZCxhQUFBLENBQUEsQ0FDQWhWLEVBREEsQ0FDQSxPQURBLEVBQ0EsVUFBQWpFLENBQUEsRUFBQTtBQUFBQSxNQUFBQSxDQUFBLENBQUF3UyxlQUFBO0FBQUEsS0FEQSxFQUVBdk8sRUFGQSxDQUVBLE9BRkEsRUFFQSxVQUFBakUsQ0FBQSxFQUFBO0FBQ0EsVUFBQUEsQ0FBQSxDQUFBa1osT0FBQSxJQUFBLEVBQUEsRUFBQTtBQUNBTCxRQUFBQSxTQUFBLENBQUFNLE9BQUE7QUFDQSxLQUxBLEVBZkEsQ0FzQkE7O0FBQ0FqZSxJQUFBQSxDQUFBLENBQUFzQyxRQUFBLENBQUEsQ0FBQXlHLEVBQUEsQ0FBQSxPQUFBLEVBQUE0VSxTQUFBLENBQUFNLE9BQUEsRUF2QkEsQ0F3QkE7O0FBQ0FILElBQUFBLGNBQUEsQ0FDQS9VLEVBREEsQ0FDQSxPQURBLEVBQ0EsVUFBQWpFLENBQUEsRUFBQTtBQUFBQSxNQUFBQSxDQUFBLENBQUF3UyxlQUFBO0FBQUEsS0FEQSxFQUVBdk8sRUFGQSxDQUVBLE9BRkEsRUFFQTRVLFNBQUEsQ0FBQU0sT0FGQTtBQUlBOztBQUVBLE1BQUFMLGlCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUFNLGtCQUFBLEdBQUEsa0JBQUE7QUFDQSxXQUFBO0FBQ0FuRCxNQUFBQSxNQUFBLEVBQUEsWUFBQTtBQUVBLFlBQUFvRCxVQUFBLEdBQUFuZSxDQUFBLENBQUFrZSxrQkFBQSxDQUFBO0FBRUFDLFFBQUFBLFVBQUEsQ0FBQWhWLFdBQUEsQ0FBQSxNQUFBO0FBRUEsWUFBQWlWLE1BQUEsR0FBQUQsVUFBQSxDQUFBN1UsUUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUVBNlUsUUFBQUEsVUFBQSxDQUFBbFgsSUFBQSxDQUFBLE9BQUEsRUFBQW1YLE1BQUEsR0FBQSxPQUFBLEdBQUEsTUFBQTtBQUVBLE9BWEE7QUFhQUgsTUFBQUEsT0FBQSxFQUFBLFlBQUE7QUFDQWplLFFBQUFBLENBQUEsQ0FBQWtlLGtCQUFBLENBQUEsQ0FDQTdVLFdBREEsQ0FDQSxNQURBLEVBQ0E7QUFEQSxTQUVBcEMsSUFGQSxDQUVBLG9CQUZBLEVBRUE0QixJQUZBLEdBRUE7QUFDQTtBQUhBO0FBS0E7QUFuQkEsS0FBQTtBQXNCQSxHQXhCQTtBQTBCQSxDQTlEQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUE3SSxFQUFBQSxDQUFBLENBQUFxZSxZQUFBLENBQUE7O0FBRUEsV0FBQUEsWUFBQSxHQUFBO0FBRUEsUUFBQSxPQUFBQyxNQUFBLEtBQUEsV0FBQSxFQUFBO0FBRUF0ZSxJQUFBQSxDQUFBLENBQUEsWUFBQSxDQUFBLENBQUE4RCxJQUFBLENBQUEsWUFBQTtBQUNBLFVBQUFxTCxPQUFBLEdBQUFuUCxDQUFBLENBQUEsSUFBQSxDQUFBO0FBQUEsVUFDQXVlLE1BQUEsR0FBQXBQLE9BQUEsQ0FBQWxILElBQUEsQ0FBQSxRQUFBLENBREE7O0FBR0EsZUFBQXVXLFVBQUEsR0FBQTtBQUNBLFlBQUFDLEVBQUEsR0FBQUgsTUFBQSxDQUFBLElBQUFJLElBQUEsRUFBQSxDQUFBLENBQUFILE1BQUEsQ0FBQUEsTUFBQSxDQUFBO0FBQ0FwUCxRQUFBQSxPQUFBLENBQUF3UCxJQUFBLENBQUFGLEVBQUE7QUFDQTs7QUFFQUQsTUFBQUEsVUFBQTtBQUNBSSxNQUFBQSxXQUFBLENBQUFKLFVBQUEsRUFBQSxJQUFBLENBQUE7QUFFQSxLQVpBO0FBYUE7QUFFQSxDQXhCQSxJLENDSEE7QUFDQTs7O0FBR0EsQ0FBQSxZQUFBO0FBQ0E7O0FBRUF4ZSxFQUFBQSxDQUFBLENBQUE2ZSxPQUFBLENBQUE7O0FBRUEsV0FBQUEsT0FBQSxHQUFBO0FBQ0EsUUFBQUMsT0FBQSxHQUFBOWUsQ0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUErZSxLQUFBLEdBQUEvZSxDQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0FBLElBQUFBLENBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQStJLEVBQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQTtBQUNBO0FBQ0ErVixNQUFBQSxPQUFBLENBQUF6YyxJQUFBLENBQUEsTUFBQSxFQUFBLEtBQUEyYyxPQUFBLEdBQUEsMEJBQUEsR0FBQSxzQkFBQSxFQUZBLENBR0E7O0FBQ0FELE1BQUFBLEtBQUEsQ0FBQTFjLElBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQTJjLE9BQUEsR0FBQSxnQ0FBQSxHQUFBLDRCQUFBO0FBQ0EsS0FMQTtBQU1BO0FBRUEsQ0FoQkEsSSxDQ0pBO0FBQ0E7OztBQUdBLENBQUEsWUFBQTtBQUNBOztBQUVBaGYsRUFBQUEsQ0FBQSxDQUFBaWYsV0FBQSxDQUFBO0FBRUEsTUFBQUMsS0FBQTtBQUNBLE1BQUFwVixLQUFBO0FBQ0EsTUFBQXFWLFFBQUE7O0FBRUEsV0FBQUYsV0FBQSxHQUFBO0FBRUFDLElBQUFBLEtBQUEsR0FBQWxmLENBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQThKLElBQUFBLEtBQUEsR0FBQTlKLENBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQW1mLElBQUFBLFFBQUEsR0FBQW5mLENBQUEsQ0FBQSxVQUFBLENBQUEsQ0FKQSxDQU1BO0FBQ0E7O0FBRUEsUUFBQW9mLGVBQUEsR0FBQUQsUUFBQSxDQUFBbFksSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBbVksSUFBQUEsZUFBQSxDQUFBclcsRUFBQSxDQUFBLGtCQUFBLEVBQUEsVUFBQTVILEtBQUEsRUFBQTtBQUVBQSxNQUFBQSxLQUFBLENBQUFtVyxlQUFBO0FBQ0EsVUFBQXRYLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTZHLE9BQUEsQ0FBQSxXQUFBLEVBQUEzRCxNQUFBLEtBQUEsQ0FBQSxFQUNBa2MsZUFBQSxDQUFBOWUsTUFBQSxDQUFBLE9BQUEsRUFBQWlKLFFBQUEsQ0FBQSxNQUFBO0FBRUEsS0FOQSxFQVZBLENBa0JBO0FBQ0E7QUFFQTs7QUFDQSxRQUFBOFYsV0FBQSxHQUFBcmYsQ0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTZHLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0F0QkEsQ0F3QkE7O0FBQ0EsUUFBQSxDQUFBeVksYUFBQSxFQUFBLEVBQ0FELFdBQUEsQ0FDQWpXLFFBREEsQ0FDQSxRQURBLEVBQ0E7QUFEQSxLQUVBL0MsUUFGQSxDQUVBLFdBRkEsRUFFQTtBQUZBLEtBR0FrRCxRQUhBLENBR0EsTUFIQSxFQTFCQSxDQTZCQTtBQUVBOztBQUNBNFYsSUFBQUEsUUFBQSxDQUFBbFksSUFBQSxDQUFBLGFBQUEsRUFBQThCLEVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFDQSxVQUFBd2EsYUFBQSxFQUFBLEVBQUF4YSxDQUFBLENBQUE2RSxjQUFBO0FBQ0EsS0FGQSxFQWhDQSxDQW9DQTtBQUNBOztBQUdBLFFBQUE0VixTQUFBLEdBQUFDLE9BQUEsS0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUFDLE1BQUEsR0FBQXpmLENBQUEsRUFBQTtBQUNBbWYsSUFBQUEsUUFBQSxDQUFBbFksSUFBQSxDQUFBLG1CQUFBLEVBQUE4QixFQUFBLENBQUF3VyxTQUFBLEVBQUEsVUFBQXphLENBQUEsRUFBQTtBQUVBLFVBQUE0YSxrQkFBQSxNQUFBSixhQUFBLEVBQUEsRUFBQTtBQUVBRyxRQUFBQSxNQUFBLENBQUFoWCxPQUFBLENBQUEsWUFBQTtBQUNBZ1gsUUFBQUEsTUFBQSxHQUFBRSxjQUFBLENBQUEzZixDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FIQSxDQUtBOztBQUNBNGYsUUFBQUEsa0JBQUE7QUFDQTtBQUVBLEtBWEE7QUFhQSxRQUFBQyxvQkFBQSxHQUFBVixRQUFBLENBQUFsWCxJQUFBLENBQUEsc0JBQUEsQ0FBQSxDQXZEQSxDQXlEQTs7QUFDQSxRQUFBLE9BQUE0WCxvQkFBQSxLQUFBLFdBQUEsRUFBQTtBQUVBN2YsTUFBQUEsQ0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBK0ksRUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBakUsQ0FBQSxFQUFBO0FBQ0E7QUFDQSxZQUFBLENBQUFnRixLQUFBLENBQUFSLFFBQUEsQ0FBQSxlQUFBLENBQUEsRUFBQTtBQUVBLFlBQUF3VyxPQUFBLEdBQUE5ZixDQUFBLENBQUE4RSxDQUFBLENBQUF6RCxNQUFBLENBQUE7O0FBQ0EsWUFBQSxDQUFBeWUsT0FBQSxDQUFBalosT0FBQSxDQUFBLGtCQUFBLEVBQUEzRCxNQUFBLElBQUE7QUFDQSxTQUFBNGMsT0FBQSxDQUFBelksRUFBQSxDQUFBLG9CQUFBLENBREEsSUFDQTtBQUNBLFNBQUF5WSxPQUFBLENBQUFuWixNQUFBLEdBQUFVLEVBQUEsQ0FBQSxvQkFBQSxDQUZBLENBRUE7QUFGQSxVQUdBO0FBQ0F5QyxZQUFBQSxLQUFBLENBQUFULFdBQUEsQ0FBQSxlQUFBO0FBQ0E7QUFFQSxPQVpBO0FBYUE7QUFDQTs7QUFFQSxXQUFBdVcsa0JBQUEsR0FBQTtBQUNBLFFBQUFHLFNBQUEsR0FBQS9mLENBQUEsQ0FBQSxRQUFBLEVBQUE7QUFBQSxlQUFBO0FBQUEsS0FBQSxDQUFBO0FBQ0ErZixJQUFBQSxTQUFBLENBQUF0WSxXQUFBLENBQUEsa0JBQUEsRUFBQXNCLEVBQUEsQ0FBQSxrQkFBQSxFQUFBLFlBQUE7QUFDQWlYLE1BQUFBLGlCQUFBO0FBQ0EsS0FGQTtBQUdBLEdBMUZBLENBNEZBO0FBQ0E7OztBQUNBLFdBQUFDLGVBQUEsQ0FBQWxKLFFBQUEsRUFBQTtBQUNBQSxJQUFBQSxRQUFBLENBQ0F2USxRQURBLENBQ0EsSUFEQSxFQUVBNkMsV0FGQSxDQUVBLE1BRkE7QUFHQTBOLElBQUFBLFFBQUEsQ0FDQTVOLFdBREEsQ0FDQSxNQURBO0FBRUEsR0FwR0EsQ0FzR0E7QUFDQTs7O0FBQ0EsV0FBQXdXLGNBQUEsQ0FBQU8sU0FBQSxFQUFBO0FBRUFGLElBQUFBLGlCQUFBO0FBRUEsUUFBQUcsRUFBQSxHQUFBRCxTQUFBLENBQUE3WixRQUFBLENBQUEsSUFBQSxDQUFBO0FBRUEsUUFBQSxDQUFBOFosRUFBQSxDQUFBamQsTUFBQSxFQUFBLE9BQUFsRCxDQUFBLEVBQUE7O0FBQ0EsUUFBQWtnQixTQUFBLENBQUE1VyxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUE7QUFDQTJXLE1BQUFBLGVBQUEsQ0FBQUMsU0FBQSxDQUFBO0FBQ0EsYUFBQWxnQixDQUFBLEVBQUE7QUFDQTs7QUFFQSxRQUFBb2dCLE1BQUEsR0FBQXBnQixDQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUFxZ0IsV0FBQSxHQUFBcmdCLENBQUEsQ0FBQSxjQUFBLENBQUEsQ0FiQSxDQWFBO0FBQ0E7O0FBQ0EsUUFBQXNnQixHQUFBLEdBQUF2YSxRQUFBLENBQUFzYSxXQUFBLENBQUF6YixHQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEdBQUFtQixRQUFBLENBQUFxYSxNQUFBLENBQUF4YixHQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBRUEsUUFBQTZhLE1BQUEsR0FBQVUsRUFBQSxDQUFBdFksS0FBQSxHQUFBUCxRQUFBLENBQUE4WSxNQUFBLENBQUE7QUFFQUgsSUFBQUEsZUFBQSxDQUFBQyxTQUFBLENBQUE7QUFFQSxRQUFBSyxPQUFBLEdBQUFMLFNBQUEsQ0FBQTVhLFFBQUEsR0FBQUcsR0FBQSxHQUFBNmEsR0FBQSxHQUFBbkIsUUFBQSxDQUFBeFosU0FBQSxFQUFBO0FBQ0EsUUFBQTZhLFFBQUEsR0FBQWxlLFFBQUEsQ0FBQW1lLElBQUEsQ0FBQUMsWUFBQTtBQUVBakIsSUFBQUEsTUFBQSxDQUNBclcsUUFEQSxDQUNBLGNBREEsRUFFQXhFLEdBRkEsQ0FFQTtBQUNBVSxNQUFBQSxRQUFBLEVBQUFxYixPQUFBLEtBQUEsT0FBQSxHQUFBLFVBREE7QUFFQWxiLE1BQUFBLEdBQUEsRUFBQThhLE9BRkE7QUFHQUssTUFBQUEsTUFBQSxFQUFBbkIsTUFBQSxDQUFBN1osV0FBQSxDQUFBLElBQUEsSUFBQTJhLE9BQUEsR0FBQUMsUUFBQSxHQUFBLENBQUEsR0FBQTtBQUhBLEtBRkE7QUFRQWYsSUFBQUEsTUFBQSxDQUFBMVcsRUFBQSxDQUFBLFlBQUEsRUFBQSxZQUFBO0FBQ0FrWCxNQUFBQSxlQUFBLENBQUFDLFNBQUEsQ0FBQTtBQUNBVCxNQUFBQSxNQUFBLENBQUF6WCxNQUFBO0FBQ0EsS0FIQTtBQUtBLFdBQUF5WCxNQUFBO0FBQ0E7O0FBRUEsV0FBQU8saUJBQUEsR0FBQTtBQUNBaGdCLElBQUFBLENBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUFnSSxNQUFBO0FBQ0FoSSxJQUFBQSxDQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBZ0ksTUFBQTtBQUNBaEksSUFBQUEsQ0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQXFKLFdBQUEsQ0FBQSxNQUFBO0FBQ0E7O0FBRUEsV0FBQW1XLE9BQUEsR0FBQTtBQUNBLFdBQUFOLEtBQUEsQ0FBQTVWLFFBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQTs7QUFFQSxXQUFBb1csa0JBQUEsR0FBQTtBQUNBLFdBQUE1VixLQUFBLENBQUFSLFFBQUEsQ0FBQSxpQkFBQSxLQUFBUSxLQUFBLENBQUFSLFFBQUEsQ0FBQSxzQkFBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQXVYLGdCQUFBLEdBQUE7QUFDQSxXQUFBL1csS0FBQSxDQUFBUixRQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQXdYLFFBQUEsR0FBQTtBQUNBLFdBQUF4ZSxRQUFBLENBQUFtZSxJQUFBLENBQUFNLFdBQUEsR0FBQXpHLGNBQUEsQ0FBQTBHLE1BQUE7QUFDQTs7QUFFQSxXQUFBTCxPQUFBLEdBQUE7QUFDQSxXQUFBN1csS0FBQSxDQUFBUixRQUFBLENBQUEsY0FBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQWdXLGFBQUEsR0FBQTtBQUNBLFdBQUF4VixLQUFBLENBQUFSLFFBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQTtBQUVBLENBOUtBLEksQ0NKQTtBQUNBOzs7QUFFQSxDQUFBLFlBQUE7QUFDQTs7QUFFQXRKLEVBQUFBLENBQUEsQ0FBQWloQixjQUFBLENBQUE7O0FBRUEsV0FBQUEsY0FBQSxHQUFBO0FBRUEsUUFBQSxDQUFBamhCLENBQUEsQ0FBQVEsRUFBQSxJQUFBLENBQUFSLENBQUEsQ0FBQVEsRUFBQSxDQUFBMGdCLFVBQUEsRUFBQTtBQUVBbGhCLElBQUFBLENBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE4RCxJQUFBLENBQUEsWUFBQTtBQUVBLFVBQUFxTCxPQUFBLEdBQUFuUCxDQUFBLENBQUEsSUFBQSxDQUFBO0FBQUEsVUFDQW1oQixhQUFBLEdBQUEsR0FEQTtBQUdBaFMsTUFBQUEsT0FBQSxDQUFBK1IsVUFBQSxDQUFBO0FBQ0EvUyxRQUFBQSxNQUFBLEVBQUFnQixPQUFBLENBQUFsSCxJQUFBLENBQUEsUUFBQSxLQUFBa1o7QUFEQSxPQUFBO0FBSUEsS0FUQTtBQVVBO0FBRUEsQ0FyQkEsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBbmhCLEVBQUFBLENBQUEsQ0FBQW9oQixpQkFBQSxDQUFBOztBQUVBLFdBQUFBLGlCQUFBLEdBQUE7QUFFQXBoQixJQUFBQSxDQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBK0ksRUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsVUFBQXNZLEtBQUEsR0FBQXJoQixDQUFBLENBQUEsSUFBQSxDQUFBO0FBQUEsVUFDQW1HLEtBQUEsR0FBQWtiLEtBQUEsQ0FBQWxiLEtBQUEsS0FBQSxDQURBO0FBQUEsVUFFQW1iLFFBQUEsR0FBQUQsS0FBQSxDQUFBcGEsSUFBQSxDQUFBLHdCQUFBLENBRkE7QUFBQSxVQUdBc2EsS0FBQSxHQUFBRixLQUFBLENBQUF4YSxPQUFBLENBQUEsT0FBQSxDQUhBLENBREEsQ0FLQTs7QUFDQTBhLE1BQUFBLEtBQUEsQ0FBQXRhLElBQUEsQ0FBQSwrQkFBQWQsS0FBQSxHQUFBLDBCQUFBLEVBQ0FkLElBREEsQ0FDQSxTQURBLEVBQ0FpYyxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUF0QyxPQURBO0FBR0EsS0FUQTtBQVdBO0FBRUEsQ0FwQkEsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBaGYsRUFBQUEsQ0FBQSxDQUFBd2hCLGVBQUEsQ0FBQTs7QUFFQSxXQUFBQSxlQUFBLEdBQUE7QUFFQSxRQUFBMVgsS0FBQSxHQUFBOUosQ0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUErYSxNQUFBLEdBQUEsSUFBQWhSLFlBQUEsRUFBQTtBQUVBL0osSUFBQUEsQ0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FDQStJLEVBREEsQ0FDQSxPQURBLEVBQ0EsVUFBQWpFLENBQUEsRUFBQTtBQUNBO0FBQ0FBLE1BQUFBLENBQUEsQ0FBQXdTLGVBQUE7QUFDQSxVQUFBbkksT0FBQSxHQUFBblAsQ0FBQSxDQUFBLElBQUEsQ0FBQTtBQUFBLFVBQ0F5RCxTQUFBLEdBQUEwTCxPQUFBLENBQUFsSCxJQUFBLENBQUEsYUFBQSxDQURBO0FBQUEsVUFFQTVHLE1BQUEsR0FBQThOLE9BQUEsQ0FBQWxILElBQUEsQ0FBQSxRQUFBLENBRkE7QUFBQSxVQUdBd1osU0FBQSxHQUFBdFMsT0FBQSxDQUFBOU0sSUFBQSxDQUFBLGlCQUFBLE1BQUE4QixTQUhBLENBSEEsQ0FRQTtBQUNBOztBQUNBLFVBQUEyYixPQUFBLEdBQUF6ZSxNQUFBLEdBQUFyQixDQUFBLENBQUFxQixNQUFBLENBQUEsR0FBQXlJLEtBQUE7O0FBRUEsVUFBQXJHLFNBQUEsRUFBQTtBQUNBLFlBQUFxYyxPQUFBLENBQUF4VyxRQUFBLENBQUE3RixTQUFBLENBQUEsRUFBQTtBQUNBcWMsVUFBQUEsT0FBQSxDQUFBelcsV0FBQSxDQUFBNUYsU0FBQTtBQUNBLGNBQUEsQ0FBQWdlLFNBQUEsRUFDQTFHLE1BQUEsQ0FBQTJHLFdBQUEsQ0FBQWplLFNBQUE7QUFDQSxTQUpBLE1BSUE7QUFDQXFjLFVBQUFBLE9BQUEsQ0FBQTFXLFFBQUEsQ0FBQTNGLFNBQUE7QUFDQSxjQUFBLENBQUFnZSxTQUFBLEVBQ0ExRyxNQUFBLENBQUE0RyxRQUFBLENBQUFsZSxTQUFBO0FBQ0E7QUFFQSxPQXZCQSxDQXlCQTs7O0FBQ0EsVUFBQSxPQUFBbWUsS0FBQSxLQUFBLFVBQUEsRUFBQTtBQUFBO0FBQ0EzaEIsUUFBQUEsTUFBQSxDQUFBMkksYUFBQSxDQUFBLElBQUFnWixLQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsT0FGQSxNQUVBO0FBQUE7QUFDQSxZQUFBQyxXQUFBLEdBQUE1aEIsTUFBQSxDQUFBcUMsUUFBQSxDQUFBb0csV0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBbVosUUFBQUEsV0FBQSxDQUFBQyxXQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUE3aEIsTUFBQSxFQUFBLENBQUE7QUFDQUEsUUFBQUEsTUFBQSxDQUFBMkksYUFBQSxDQUFBaVosV0FBQTtBQUNBO0FBQ0EsS0FsQ0E7QUFvQ0EsR0E5Q0EsQ0FnREE7OztBQUNBLE1BQUE5WCxZQUFBLEdBQUEsWUFBQTtBQUVBLFFBQUFnWSxnQkFBQSxHQUFBLGdCQUFBO0FBRUE7O0FBQ0EsU0FBQUosUUFBQSxHQUFBLFVBQUFsZSxTQUFBLEVBQUE7QUFDQSxVQUFBd0UsSUFBQSxHQUFBZ1UsUUFBQSxDQUFBQyxZQUFBLENBQUFDLEdBQUEsQ0FBQTRGLGdCQUFBLENBQUE7QUFDQSxVQUFBOVosSUFBQSxZQUFBK1osS0FBQSxFQUFBL1osSUFBQSxDQUFBakIsSUFBQSxDQUFBdkQsU0FBQSxFQUFBLEtBQ0F3RSxJQUFBLEdBQUEsQ0FBQXhFLFNBQUEsQ0FBQTtBQUNBd1ksTUFBQUEsUUFBQSxDQUFBQyxZQUFBLENBQUFxQixHQUFBLENBQUF3RSxnQkFBQSxFQUFBOVosSUFBQTtBQUNBLEtBTEE7QUFNQTs7O0FBQ0EsU0FBQXlaLFdBQUEsR0FBQSxVQUFBamUsU0FBQSxFQUFBO0FBQ0EsVUFBQXdFLElBQUEsR0FBQWdVLFFBQUEsQ0FBQUMsWUFBQSxDQUFBQyxHQUFBLENBQUE0RixnQkFBQSxDQUFBOztBQUNBLFVBQUE5WixJQUFBLEVBQUE7QUFDQSxZQUFBOUIsS0FBQSxHQUFBOEIsSUFBQSxDQUFBcEYsT0FBQSxDQUFBWSxTQUFBLENBQUE7QUFDQSxZQUFBMEMsS0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBOEIsSUFBQSxDQUFBZ2EsTUFBQSxDQUFBOWIsS0FBQSxFQUFBLENBQUE7QUFDQThWLFFBQUFBLFFBQUEsQ0FBQUMsWUFBQSxDQUFBcUIsR0FBQSxDQUFBd0UsZ0JBQUEsRUFBQTlaLElBQUE7QUFDQTtBQUNBLEtBUEE7QUFRQTs7O0FBQ0EsU0FBQStCLFlBQUEsR0FBQSxVQUFBd0gsS0FBQSxFQUFBO0FBQ0EsVUFBQXZKLElBQUEsR0FBQWdVLFFBQUEsQ0FBQUMsWUFBQSxDQUFBQyxHQUFBLENBQUE0RixnQkFBQSxDQUFBO0FBQ0EsVUFBQTlaLElBQUEsWUFBQStaLEtBQUEsRUFDQXhRLEtBQUEsQ0FBQXBJLFFBQUEsQ0FBQW5CLElBQUEsQ0FBQWlhLElBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxLQUpBO0FBS0EsR0ExQkE7O0FBNEJBamlCLEVBQUFBLE1BQUEsQ0FBQThKLFlBQUEsR0FBQUEsWUFBQTtBQUVBLENBL0VBO0FDSEE7Ozs7OztBQUtBLENBQUEsWUFBQTtBQUNBOztBQUVBL0osRUFBQUEsQ0FBQSxDQUFBbWlCLGlCQUFBLENBQUE7O0FBRUEsV0FBQUEsaUJBQUEsR0FBQTtBQUNBLFFBQUFoVCxPQUFBLEdBQUFuUCxDQUFBLENBQUEsdUJBQUEsQ0FBQTtBQUNBLFFBQUFpRSxLQUFBLEdBQUFrTCxPQUFBLENBQUFsSCxJQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0FrSCxJQUFBQSxPQUFBLENBQUFwRyxFQUFBLENBQUEsT0FBQSxFQUFBLFlBQUE7QUFDQXFJLE1BQUFBLFVBQUEsQ0FBQSxZQUFBO0FBQ0E7QUFDQSxZQUFBZ1IsR0FBQSxHQUFBOWYsUUFBQSxDQUFBb0csV0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBMFosUUFBQUEsR0FBQSxDQUFBTixXQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUE3aEIsTUFBQSxFQUFBLENBQUE7QUFDQUEsUUFBQUEsTUFBQSxDQUFBMkksYUFBQSxDQUFBd1osR0FBQSxFQUpBLENBS0E7QUFDQTtBQUNBLE9BUEEsRUFPQW5lLEtBQUEsSUFBQSxHQVBBLENBQUE7QUFRQSxLQVRBO0FBVUE7QUFFQSxDQXBCQSxJLENDTEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUEsTUFBQSxPQUFBb2UsWUFBQSxLQUFBLFdBQUEsRUFBQSxPQUhBLENBS0E7O0FBQ0FyaUIsRUFBQUEsQ0FBQSxDQUFBc2lCLGtCQUFBLENBQUE7QUFDQXRpQixFQUFBQSxDQUFBLENBQUF1aUIsZ0JBQUEsQ0FBQTs7QUFFQSxXQUFBQSxnQkFBQSxHQUFBO0FBRUEsUUFBQUMsUUFBQSxHQUFBSCxZQUFBLENBQUFHLFFBQUE7QUFDQSxRQUFBQyxTQUFBLEdBQUFDLHVCQUFBLENBQUFELFNBQUE7QUFFQTs7QUFDQSxRQUFBRSxXQUFBLEdBQUFyZ0IsUUFBQSxDQUFBNkosY0FBQSxDQUFBLHNCQUFBLENBQUE7QUFDQSxRQUFBc1csU0FBQSxDQUFBRSxXQUFBLEVBQUE7QUFDQUMsTUFBQUEsWUFBQSxFQUFBLFlBREE7QUFFQUMsTUFBQUEsU0FBQSxFQUFBLFVBQUFDLE9BQUEsRUFBQTtBQUNBLGVBQUE7QUFDQUMsVUFBQUEsS0FBQSxFQUFBRCxPQUFBLENBQUFFLFNBQUEsQ0FBQUMsSUFBQTtBQURBLFNBQUE7QUFHQTtBQU5BLEtBQUE7QUFTQTs7QUFDQSxRQUFBQyxVQUFBLEdBQUE1Z0IsUUFBQSxDQUFBNkosY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUFnWCxRQUFBLEdBQUEsSUFBQVgsUUFBQSxDQUFBVSxVQUFBLEVBQUE7QUFDQWppQixNQUFBQSxNQUFBLEVBQUFtaUIsZ0JBQUEsRUFEQTtBQUVBQyxNQUFBQSxPQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxDQUZBO0FBR0FDLE1BQUFBLFdBQUEsRUFBQSxXQUhBO0FBSUFDLE1BQUFBLE1BQUEsRUFBQTtBQUNBaGUsUUFBQUEsSUFBQSxFQUFBLGlCQURBO0FBRUFpZSxRQUFBQSxNQUFBLEVBQUEsT0FGQTtBQUdBelUsUUFBQUEsS0FBQSxFQUFBO0FBSEEsT0FKQTtBQVNBMFUsTUFBQUEsUUFBQSxFQUFBLElBVEE7QUFVQUMsTUFBQUEsU0FBQSxFQUFBLElBVkE7QUFVQTtBQUNBQyxNQUFBQSxZQUFBLEVBQUEsVUFBQUMsSUFBQSxFQUFBO0FBQ0EsWUFBQUMsTUFBQSxHQUFBN2UsZ0JBQUEsQ0FBQTRlLElBQUEsQ0FBQUUsU0FBQSxDQUFBO0FBQ0FGLFFBQUFBLElBQUEsQ0FBQXppQixLQUFBLENBQUE0aUIsT0FBQSxDQUFBLGlCQUFBLEVBQUFGLE1BQUEsQ0FBQWpZLGVBQUE7QUFDQWdZLFFBQUFBLElBQUEsQ0FBQXppQixLQUFBLENBQUE0aUIsT0FBQSxDQUFBLGFBQUEsRUFBQUYsTUFBQSxDQUFBaFksV0FBQSxFQUhBLENBS0E7O0FBQ0EsWUFBQXZKLFFBQUEsQ0FBQTZKLGNBQUEsQ0FBQSxhQUFBLEVBQUE2UyxPQUFBLEVBQUE7QUFDQTtBQUNBNEUsVUFBQUEsSUFBQSxDQUFBRSxTQUFBLENBQUExZCxVQUFBLENBQUE4QixXQUFBLENBQUEwYixJQUFBLENBQUFFLFNBQUE7QUFDQTtBQUNBO0FBckJBLEtBQUEsQ0FBQTtBQXVCQVgsSUFBQUEsUUFBQSxDQUFBM00sTUFBQTtBQUNBOztBQUVBLFdBQUE4TCxrQkFBQSxHQUFBO0FBQ0EsUUFBQTBCLHNCQUFBLEdBQUExaEIsUUFBQSxDQUFBNkosY0FBQSxDQUFBLCtCQUFBLENBQUE7QUFDQSxRQUFBOFgsY0FBQSxHQUFBM2hCLFFBQUEsQ0FBQTZKLGNBQUEsQ0FBQSx3QkFBQSxDQUFBO0FBQ0EsUUFBQStYLGNBQUEsR0FBQTVoQixRQUFBLENBQUE2SixjQUFBLENBQUEscUJBQUEsQ0FBQTtBQUNBLFFBQUFnWSxjQUFBLEdBQUEsR0FBQS9qQixLQUFBLENBQUFDLElBQUEsQ0FBQTJqQixzQkFBQSxDQUFBemhCLGdCQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBNmhCLGVBQUEsR0FBQUosc0JBQUEsQ0FBQXRjLGFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FMQSxDQUtBOztBQUNBLFFBQUFpYixXQUFBLEdBQUFyZ0IsUUFBQSxDQUFBNkosY0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FOQSxDQVFBOztBQUNBZ1ksSUFBQUEsY0FBQSxDQUFBeGdCLE9BQUEsQ0FBQSxVQUFBMGdCLEdBQUEsRUFBQTtBQUNBQSxNQUFBQSxHQUFBLENBQUE3aUIsZ0JBQUEsQ0FBQSxPQUFBLEVBQUE4aUIsbUJBQUEsQ0FBQUQsR0FBQSxDQUFBO0FBQ0EsS0FGQSxFQVRBLENBWUE7O0FBQ0FKLElBQUFBLGNBQUEsQ0FBQXppQixnQkFBQSxDQUFBLE9BQUEsRUFBQStpQixtQkFBQTs7QUFFQSxhQUFBRCxtQkFBQSxDQUFBRCxHQUFBLEVBQUE7QUFDQSxhQUFBLFVBQUF2ZixDQUFBLEVBQUE7QUFDQTtBQUNBcWYsUUFBQUEsY0FBQSxDQUFBeGdCLE9BQUEsQ0FBQTZnQix3QkFBQSxFQUZBLENBR0E7O0FBQ0FILFFBQUFBLEdBQUEsQ0FBQXpnQixTQUFBLENBQUF3VyxHQUFBLENBQUEsVUFBQTtBQUNBZ0ssUUFBQUEsZUFBQSxHQUFBQyxHQUFBO0FBQ0EsT0FOQTtBQU9BOztBQUVBLGFBQUFHLHdCQUFBLENBQUF4aUIsRUFBQSxFQUFBO0FBQ0FBLE1BQUFBLEVBQUEsQ0FBQTRCLFNBQUEsQ0FBQW9FLE1BQUEsQ0FBQSxVQUFBO0FBQ0E7O0FBRUEsYUFBQXVjLG1CQUFBLEdBQUE7QUFDQSxVQUFBbk8sSUFBQSxHQUFBOE4sY0FBQSxDQUFBamdCLEtBQUE7O0FBQ0EsVUFBQW1TLElBQUEsRUFBQTtBQUNBLFlBQUFwVSxFQUFBLEdBQUFlLGFBQUEsQ0FBQXFoQixlQUFBLENBQUE7QUFDQXBpQixRQUFBQSxFQUFBLENBQUFnaEIsU0FBQSxHQUFBNU0sSUFBQTtBQUNBdU0sUUFBQUEsV0FBQSxDQUFBaGIsWUFBQSxDQUFBM0YsRUFBQSxFQUFBMmdCLFdBQUEsQ0FBQThCLFVBQUEsRUFIQSxDQUdBO0FBQ0E7QUFDQTs7QUFFQSxhQUFBMWhCLGFBQUEsQ0FBQTJoQixXQUFBLEVBQUE7QUFDQSxVQUFBYixNQUFBLEdBQUE3ZSxnQkFBQSxDQUFBb2YsZUFBQSxDQUFBO0FBQ0EsVUFBQWpWLE9BQUEsR0FBQTdNLFFBQUEsQ0FBQVMsYUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBb00sTUFBQUEsT0FBQSxDQUFBcEssS0FBQSxDQUFBNkcsZUFBQSxHQUFBaVksTUFBQSxDQUFBalksZUFBQTtBQUNBdUQsTUFBQUEsT0FBQSxDQUFBcEssS0FBQSxDQUFBOEcsV0FBQSxHQUFBZ1ksTUFBQSxDQUFBaFksV0FBQTtBQUNBc0QsTUFBQUEsT0FBQSxDQUFBcEssS0FBQSxDQUFBK1AsS0FBQSxHQUFBLE1BQUE7QUFDQTNGLE1BQUFBLE9BQUEsQ0FBQXNKLFNBQUEsR0FBQSxXQUFBLENBTkEsQ0FNQTs7QUFDQSxhQUFBdEosT0FBQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7OztBQUtBLFdBQUFpVSxnQkFBQSxHQUFBO0FBQ0E7QUFDQSxRQUFBdUIsSUFBQSxHQUFBLElBQUFqRyxJQUFBLEVBQUE7QUFDQSxRQUFBclAsQ0FBQSxHQUFBc1YsSUFBQSxDQUFBQyxPQUFBLEVBQUE7QUFBQSxRQUNBbmdCLENBQUEsR0FBQWtnQixJQUFBLENBQUFFLFFBQUEsRUFEQTtBQUFBLFFBRUFwVSxDQUFBLEdBQUFrVSxJQUFBLENBQUFHLFdBQUEsRUFGQTtBQUlBLFdBQUEsQ0FDQTtBQUNBL0IsTUFBQUEsS0FBQSxFQUFBLGVBREE7QUFFQWdDLE1BQUFBLEtBQUEsRUFBQSxJQUFBckcsSUFBQSxDQUFBak8sQ0FBQSxFQUFBaE0sQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBbUgsTUFBQUEsZUFBQSxFQUFBLFNBSEE7QUFHQTtBQUNBQyxNQUFBQSxXQUFBLEVBQUEsU0FKQSxDQUlBOztBQUpBLEtBREEsRUFPQTtBQUNBa1gsTUFBQUEsS0FBQSxFQUFBLFlBREE7QUFFQWdDLE1BQUFBLEtBQUEsRUFBQSxJQUFBckcsSUFBQSxDQUFBak8sQ0FBQSxFQUFBaE0sQ0FBQSxFQUFBNEssQ0FBQSxHQUFBLENBQUEsQ0FGQTtBQUdBMlYsTUFBQUEsR0FBQSxFQUFBLElBQUF0RyxJQUFBLENBQUFqTyxDQUFBLEVBQUFoTSxDQUFBLEVBQUE0SyxDQUFBLEdBQUEsQ0FBQSxDQUhBO0FBSUF6RCxNQUFBQSxlQUFBLEVBQUEsU0FKQTtBQUlBO0FBQ0FDLE1BQUFBLFdBQUEsRUFBQSxTQUxBLENBS0E7O0FBTEEsS0FQQSxFQWNBO0FBQ0FrWCxNQUFBQSxLQUFBLEVBQUEsU0FEQTtBQUVBZ0MsTUFBQUEsS0FBQSxFQUFBLElBQUFyRyxJQUFBLENBQUFqTyxDQUFBLEVBQUFoTSxDQUFBLEVBQUE0SyxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FGQTtBQUdBNFYsTUFBQUEsTUFBQSxFQUFBLEtBSEE7QUFJQXJaLE1BQUFBLGVBQUEsRUFBQSxTQUpBO0FBSUE7QUFDQUMsTUFBQUEsV0FBQSxFQUFBLFNBTEEsQ0FLQTs7QUFMQSxLQWRBLEVBcUJBO0FBQ0FrWCxNQUFBQSxLQUFBLEVBQUEsT0FEQTtBQUVBZ0MsTUFBQUEsS0FBQSxFQUFBLElBQUFyRyxJQUFBLENBQUFqTyxDQUFBLEVBQUFoTSxDQUFBLEVBQUE0SyxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsQ0FGQTtBQUdBMlYsTUFBQUEsR0FBQSxFQUFBLElBQUF0RyxJQUFBLENBQUFqTyxDQUFBLEVBQUFoTSxDQUFBLEVBQUE0SyxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsQ0FIQTtBQUlBNFYsTUFBQUEsTUFBQSxFQUFBLEtBSkE7QUFLQXJaLE1BQUFBLGVBQUEsRUFBQSxTQUxBO0FBS0E7QUFDQUMsTUFBQUEsV0FBQSxFQUFBLFNBTkEsQ0FNQTs7QUFOQSxLQXJCQSxFQTZCQTtBQUNBa1gsTUFBQUEsS0FBQSxFQUFBLGdCQURBO0FBRUFnQyxNQUFBQSxLQUFBLEVBQUEsSUFBQXJHLElBQUEsQ0FBQWpPLENBQUEsRUFBQWhNLENBQUEsRUFBQTRLLENBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsQ0FGQTtBQUdBMlYsTUFBQUEsR0FBQSxFQUFBLElBQUF0RyxJQUFBLENBQUFqTyxDQUFBLEVBQUFoTSxDQUFBLEVBQUE0SyxDQUFBLEdBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBSEE7QUFJQTRWLE1BQUFBLE1BQUEsRUFBQSxLQUpBO0FBS0FyWixNQUFBQSxlQUFBLEVBQUEsU0FMQTtBQUtBO0FBQ0FDLE1BQUFBLFdBQUEsRUFBQSxTQU5BLENBTUE7O0FBTkEsS0E3QkEsRUFxQ0E7QUFDQWtYLE1BQUFBLEtBQUEsRUFBQSxhQURBO0FBRUFnQyxNQUFBQSxLQUFBLEVBQUEsSUFBQXJHLElBQUEsQ0FBQWpPLENBQUEsRUFBQWhNLENBQUEsRUFBQSxFQUFBLENBRkE7QUFHQXVnQixNQUFBQSxHQUFBLEVBQUEsSUFBQXRHLElBQUEsQ0FBQWpPLENBQUEsRUFBQWhNLENBQUEsRUFBQSxFQUFBLENBSEE7QUFJQXlnQixNQUFBQSxHQUFBLEVBQUEsZUFKQTtBQUtBdFosTUFBQUEsZUFBQSxFQUFBLFNBTEE7QUFLQTtBQUNBQyxNQUFBQSxXQUFBLEVBQUEsU0FOQSxDQU1BOztBQU5BLEtBckNBLENBQUE7QUE4Q0E7QUFDQSxDQWpLQSxJLENDSEE7QUFDQTs7O0FBR0EsQ0FBQSxZQUFBO0FBQ0E7O0FBRUE3TCxFQUFBQSxDQUFBLENBQUFtbEIsYUFBQSxDQUFBOztBQUVBLFdBQUFBLGFBQUEsR0FBQTtBQUVBLFFBQUEsQ0FBQW5sQixDQUFBLENBQUFRLEVBQUEsQ0FBQTRrQixPQUFBLEVBQUEsT0FGQSxDQUlBOztBQUNBLFFBQUFDLFVBQUEsR0FBQSxDQUNBO0FBQUExRyxNQUFBQSxJQUFBLEVBQUEsT0FBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUE7O0FBQUEsS0FEQSxFQUVBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsT0FBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FGQSxFQUdBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsT0FBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FIQSxFQUlBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsS0FBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FKQSxFQUtBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsTUFBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FMQSxFQU1BO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsYUFBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FOQSxFQU9BO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsWUFBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FQQSxFQVFBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsS0FBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FSQSxFQVNBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsTUFBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FUQSxFQVVBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsYUFBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FWQSxFQVdBO0FBQUEzRyxNQUFBQSxJQUFBLEVBQUEsWUFBQTtBQUFBMkcsTUFBQUEsTUFBQSxFQUFBO0FBQUEsS0FYQSxDQUFBO0FBY0F0bEIsSUFBQUEsQ0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBb2xCLE9BQUEsQ0FBQUMsVUFBQSxFQUFBO0FBQ0FqYixNQUFBQSxLQUFBLEVBQUEsR0FEQTtBQUVBK0QsTUFBQUEsTUFBQSxFQUFBLEdBRkE7QUFHQW9YLE1BQUFBLEtBQUEsRUFBQTtBQUhBLEtBQUE7QUFNQTtBQUVBLENBaENBLEksQ0NKQTtBQUNBOzs7QUFHQSxDQUFBLFlBQUE7QUFDQTs7QUFFQXZsQixFQUFBQSxDQUFBLENBQUF3bEIsVUFBQSxDQUFBOztBQUVBLFdBQUFBLFVBQUEsR0FBQTtBQUVBLFFBQUEsQ0FBQXhsQixDQUFBLENBQUFRLEVBQUEsQ0FBQWlsQixNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUF6bEIsQ0FBQSxDQUFBUSxFQUFBLENBQUFrbEIsTUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBMWxCLENBQUEsQ0FBQVEsRUFBQSxDQUFBbWxCLFVBQUEsRUFBQSxPQUpBLENBTUE7QUFDQTs7QUFFQTNsQixJQUFBQSxDQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBeWxCLE1BQUEsR0FUQSxDQVdBO0FBQ0E7O0FBRUF6bEIsSUFBQUEsQ0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTBsQixNQUFBLEdBZEEsQ0FnQkE7QUFDQTs7QUFFQTFsQixJQUFBQSxDQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBMmxCLFVBQUEsQ0FBQTtBQUNBQyxNQUFBQSxXQUFBLEVBQUEsUUFEQTtBQUVBQyxNQUFBQSxLQUFBLEVBQUE7QUFDQUMsUUFBQUEsSUFBQSxFQUFBLGVBREE7QUFFQW5CLFFBQUFBLElBQUEsRUFBQSxnQkFGQTtBQUdBb0IsUUFBQUEsRUFBQSxFQUFBLGtCQUhBO0FBSUFDLFFBQUFBLElBQUEsRUFBQSxvQkFKQTtBQUtBQyxRQUFBQSxRQUFBLEVBQUEsb0JBTEE7QUFNQUMsUUFBQUEsSUFBQSxFQUFBLHFCQU5BO0FBT0FDLFFBQUFBLEtBQUEsRUFBQSxrQkFQQTtBQVFBQyxRQUFBQSxLQUFBLEVBQUE7QUFSQTtBQUZBLEtBQUE7QUFjQTtBQUVBLENBeENBLEksQ0NKQTtBQUNBOzs7QUFFQSxDQUFBLFlBQUE7QUFDQTs7QUFFQXBtQixFQUFBQSxDQUFBLENBQUFxbUIsWUFBQSxDQUFBOztBQUVBLFdBQUFBLFlBQUEsR0FBQTtBQUVBOzs7O0FBSUEsUUFBQXJPLFFBQUEsR0FBQSxHQUFBNVgsS0FBQSxDQUFBQyxJQUFBLENBQUFpQyxRQUFBLENBQUFDLGdCQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0F5VixJQUFBQSxRQUFBLENBQUFyVSxPQUFBLENBQUEsVUFBQWhELElBQUEsRUFBQTtBQUVBQSxNQUFBQSxJQUFBLENBQUFhLGdCQUFBLENBQUEsY0FBQSxFQUFBLFVBQUFMLEtBQUEsRUFBQTtBQUNBO0FBQ0EsWUFBQThZLElBQUEsR0FBQTlZLEtBQUEsQ0FBQTBXLE1BQUEsQ0FBQW9DLElBQUEsQ0FGQSxDQUdBO0FBQ0E7QUFDQTs7QUFDQTdJLFFBQUFBLFVBQUEsQ0FBQTZJLElBQUEsQ0FBQUUsYUFBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLE9BUEE7QUFRQXhaLE1BQUFBLElBQUEsQ0FBQWEsZ0JBQUEsQ0FBQSxvQkFBQSxFQUFBLFlBQUE7QUFDQXlaLFFBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBLG9CQUFBO0FBQ0EsT0FGQTtBQUdBdmEsTUFBQUEsSUFBQSxDQUFBYSxnQkFBQSxDQUFBLG9CQUFBLEVBQUEsWUFBQTtBQUNBeVosUUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUEsb0JBQUE7QUFDQSxPQUZBO0FBR0F2YSxNQUFBQSxJQUFBLENBQUFhLGdCQUFBLENBQUEsYUFBQSxFQUFBLFVBQUFMLEtBQUEsRUFBQTtBQUNBLFlBQUFvWCxPQUFBLEdBQUFwWCxLQUFBLENBQUEwVyxNQUFBLENBQUFVLE9BQUE7QUFDQSxZQUFBQyxNQUFBLEdBQUFyWCxLQUFBLENBQUEwVyxNQUFBLENBQUFXLE1BQUEsQ0FGQSxDQUdBOztBQUNBeUMsUUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUEsZUFBQSxFQUpBLENBS0E7QUFDQTs7QUFDQTNDLFFBQUFBLE9BQUE7QUFDQSxPQVJBO0FBU0E1WCxNQUFBQSxJQUFBLENBQUFhLGdCQUFBLENBQUEsY0FBQSxFQUFBLFVBQUFMLEtBQUEsRUFBQTtBQUNBOFosUUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUEsY0FBQTtBQUNBLE9BRkE7QUFJQSxLQTdCQTtBQStCQTtBQUVBLENBN0NBLEksQ0NIQTtBQUNBOzs7QUFFQSxDQUFBLFlBQUE7QUFDQTs7QUFFQWxiLEVBQUFBLENBQUEsQ0FBQXNtQixZQUFBLENBQUE7O0FBRUEsV0FBQUEsWUFBQSxHQUFBO0FBRUEsUUFBQSxDQUFBdG1CLENBQUEsQ0FBQVEsRUFBQSxDQUFBK2xCLFFBQUEsRUFBQTs7QUFFQSxRQUFBQyxZQUFBLEdBQUEsVUFBQTFoQixDQUFBLEVBQUE7QUFDQSxVQUFBbVksSUFBQSxHQUFBblksQ0FBQSxDQUFBNUIsTUFBQSxHQUFBNEIsQ0FBQSxHQUFBOUUsQ0FBQSxDQUFBOEUsQ0FBQSxDQUFBekQsTUFBQSxDQUFBO0FBQUEsVUFDQW9sQixNQUFBLEdBQUF4SixJQUFBLENBQUFoVixJQUFBLENBQUEsUUFBQSxDQURBOztBQUVBLFVBQUFoSSxNQUFBLENBQUFzSSxJQUFBLEVBQUE7QUFDQWtlLFFBQUFBLE1BQUEsQ0FBQXhoQixHQUFBLENBQUFoRixNQUFBLENBQUFzSSxJQUFBLENBQUFzSCxTQUFBLENBQUFvTixJQUFBLENBQUFzSixRQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsRUFEQSxDQUNBO0FBQ0EsT0FGQSxNQUVBO0FBQ0FFLFFBQUFBLE1BQUEsQ0FBQXhoQixHQUFBLENBQUEsOENBQUE7QUFDQTtBQUNBLEtBUkEsQ0FKQSxDQWNBOzs7QUFDQWpGLElBQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQXVtQixRQUFBLENBQUE7QUFDQUcsTUFBQUEsS0FBQSxFQUFBO0FBREEsS0FBQSxFQUdBM2QsRUFIQSxDQUdBLFFBSEEsRUFHQXlkLFlBSEEsRUFmQSxDQW9CQTs7QUFDQXhtQixJQUFBQSxDQUFBLENBQUEsWUFBQSxDQUFBLENBQUF1bUIsUUFBQSxDQUFBO0FBQ0FHLE1BQUFBLEtBQUEsRUFBQTtBQURBLEtBQUEsRUFHQTNkLEVBSEEsQ0FHQSxRQUhBLEVBR0F5ZCxZQUhBLEVBckJBLENBMEJBOztBQUNBQSxJQUFBQSxZQUFBLENBQUF4bUIsQ0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBaUksSUFBQSxDQUFBLFFBQUEsRUFBQWpJLENBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBd21CLElBQUFBLFlBQUEsQ0FBQXhtQixDQUFBLENBQUEsWUFBQSxDQUFBLENBQUFpSSxJQUFBLENBQUEsUUFBQSxFQUFBakksQ0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxDQUFBO0FBRUFBLElBQUFBLENBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUErSSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFDQSxVQUFBekQsTUFBQSxHQUFBckIsQ0FBQSxDQUFBOEUsQ0FBQSxDQUFBekQsTUFBQSxDQUFBO0FBQUEsVUFDQW1JLE1BQUEsR0FBQW5JLE1BQUEsQ0FBQTRHLElBQUEsQ0FBQSxRQUFBLENBREE7O0FBRUEsVUFBQXVCLE1BQUEsS0FBQSxZQUFBLEVBQUE7QUFDQXhKLFFBQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQXVtQixRQUFBLENBQUEsV0FBQTtBQUNBOztBQUNBLFVBQUEvYyxNQUFBLEtBQUEsY0FBQSxFQUFBO0FBQ0F4SixRQUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUF1bUIsUUFBQSxDQUFBLGFBQUE7QUFDQTtBQUNBLEtBVEE7QUFXQTtBQUVBLENBaERBO0FDSEE7Ozs7Ozs7OztBQVFBLENBQUEsWUFBQTtBQUNBOztBQUVBdm1CLEVBQUFBLENBQUEsQ0FBQTJtQixVQUFBLENBQUE7O0FBRUEsV0FBQUEsVUFBQSxHQUFBO0FBRUEsUUFBQUMsUUFBQSxHQUFBLGVBQUE7QUFBQSxRQUNBQyxnQkFBQSxHQUFBLGVBREE7QUFBQSxRQUVBQyxHQUFBLEdBQUE5bUIsQ0FBQSxDQUFBc0MsUUFBQSxDQUZBO0FBSUF0QyxJQUFBQSxDQUFBLENBQUE0bUIsUUFBQSxDQUFBLENBQUE5aUIsSUFBQSxDQUFBLFlBQUE7QUFFQSxVQUFBdWQsS0FBQSxHQUFBcmhCLENBQUEsQ0FBQSxJQUFBLENBQUE7QUFBQSxVQUNBK21CLE1BQUEsR0FBQTFGLEtBQUEsQ0FBQXBaLElBQUEsQ0FBQSxRQUFBLENBREE7O0FBR0EsVUFBQThlLE1BQUEsS0FBQTVpQixTQUFBLEVBQUE7QUFDQWlOLFFBQUFBLFVBQUEsQ0FBQSxZQUFBO0FBQ0E0VixVQUFBQSxTQUFBLENBQUEzRixLQUFBLENBQUE7QUFDQSxTQUZBLEVBRUEsR0FGQSxDQUFBO0FBR0E7O0FBRUFBLE1BQUFBLEtBQUEsQ0FBQXRZLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQWpFLENBQUEsRUFBQTtBQUNBQSxRQUFBQSxDQUFBLENBQUE2RSxjQUFBO0FBQ0FxZCxRQUFBQSxTQUFBLENBQUEzRixLQUFBLENBQUE7QUFDQSxPQUhBO0FBS0EsS0FoQkE7QUFrQkE7O0FBRUEsV0FBQTJGLFNBQUEsQ0FBQWpRLFFBQUEsRUFBQTtBQUNBLFFBQUFrUSxPQUFBLEdBQUFsUSxRQUFBLENBQUE5TyxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQUEsUUFDQXFFLE9BQUEsR0FBQXlLLFFBQUEsQ0FBQTlPLElBQUEsQ0FBQSxTQUFBLENBREE7QUFHQSxRQUFBLENBQUFnZixPQUFBLEVBQ0FqbkIsQ0FBQSxDQUFBMGIsS0FBQSxDQUFBLDhCQUFBO0FBRUExYixJQUFBQSxDQUFBLENBQUFrbkIsTUFBQSxDQUFBRCxPQUFBLEVBQUEzYSxPQUFBLElBQUEsRUFBQTtBQUNBO0FBR0EsQ0ExQ0E7QUE2Q0E7Ozs7Ozs7QUFNQSxhQUFBO0FBRUEsTUFBQTZhLFVBQUEsR0FBQSxFQUFBO0FBQUEsTUFDQUMsUUFBQSxHQUFBLEVBREE7QUFBQSxNQUdBRixNQUFBLEdBQUEsVUFBQTVhLE9BQUEsRUFBQTtBQUVBLFFBQUF0TSxDQUFBLENBQUFzQixJQUFBLENBQUFnTCxPQUFBLEtBQUEsUUFBQSxFQUFBO0FBQ0FBLE1BQUFBLE9BQUEsR0FBQTtBQUFBMmEsUUFBQUEsT0FBQSxFQUFBM2E7QUFBQSxPQUFBO0FBQ0E7O0FBRUEsUUFBQSthLFNBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBL2EsTUFBQUEsT0FBQSxHQUFBdE0sQ0FBQSxDQUFBcUUsTUFBQSxDQUFBaUksT0FBQSxFQUFBdE0sQ0FBQSxDQUFBc0IsSUFBQSxDQUFBK2xCLFNBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxRQUFBLEdBQUE7QUFBQUMsUUFBQUEsTUFBQSxFQUFBRCxTQUFBLENBQUEsQ0FBQTtBQUFBLE9BQUEsR0FBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQSxJQUFBRSxPQUFBLENBQUFqYixPQUFBLENBQUEsQ0FBQWlHLElBQUEsRUFBQTtBQUNBLEdBZEE7QUFBQSxNQWVBaVYsUUFBQSxHQUFBLFVBQUFkLEtBQUEsRUFBQWUsU0FBQSxFQUFBO0FBQ0EsUUFBQWYsS0FBQSxFQUFBO0FBQ0EsV0FBQSxJQUFBZ0IsRUFBQSxJQUFBTixRQUFBLEVBQUE7QUFBQSxZQUFBVixLQUFBLEtBQUFVLFFBQUEsQ0FBQU0sRUFBQSxDQUFBLENBQUFoQixLQUFBLEVBQUFVLFFBQUEsQ0FBQU0sRUFBQSxDQUFBLENBQUFDLEtBQUEsQ0FBQUYsU0FBQTtBQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0EsV0FBQSxJQUFBQyxFQUFBLElBQUFOLFFBQUEsRUFBQTtBQUFBQSxRQUFBQSxRQUFBLENBQUFNLEVBQUEsQ0FBQSxDQUFBQyxLQUFBLENBQUFGLFNBQUE7QUFBQTtBQUNBO0FBQ0EsR0FyQkE7O0FBdUJBLE1BQUFGLE9BQUEsR0FBQSxVQUFBamIsT0FBQSxFQUFBO0FBRUEsUUFBQStVLEtBQUEsR0FBQSxJQUFBO0FBRUEsU0FBQS9VLE9BQUEsR0FBQXRNLENBQUEsQ0FBQXFFLE1BQUEsQ0FBQSxFQUFBLEVBQUFrakIsT0FBQSxDQUFBSyxRQUFBLEVBQUF0YixPQUFBLENBQUE7QUFFQSxTQUFBdWIsSUFBQSxHQUFBLE9BQUEsSUFBQW5KLElBQUEsR0FBQW9KLE9BQUEsRUFBQSxHQUFBLE1BQUEsR0FBQXpjLElBQUEsQ0FBQTBjLElBQUEsQ0FBQTFjLElBQUEsQ0FBQUUsTUFBQSxLQUFBLE1BQUEsQ0FBQTtBQUNBLFNBQUE0RCxPQUFBLEdBQUFuUCxDQUFBLENBQUEsQ0FDQTtBQUNBLHVEQUZBLEVBR0EsOEJBSEEsRUFJQSxVQUFBLEtBQUFzTSxPQUFBLENBQUEyYSxPQUFBLEdBQUEsUUFKQSxFQUtBLFFBTEEsRUFPQS9FLElBUEEsQ0FPQSxFQVBBLENBQUEsQ0FBQSxDQU9BamEsSUFQQSxDQU9BLGVBUEEsRUFPQSxJQVBBLENBQUEsQ0FQQSxDQWdCQTs7QUFDQSxRQUFBLEtBQUFxRSxPQUFBLENBQUFnYixNQUFBLEVBQUE7QUFDQSxXQUFBblksT0FBQSxDQUFBL0YsUUFBQSxDQUFBLGlCQUFBLEtBQUFrRCxPQUFBLENBQUFnYixNQUFBO0FBQ0EsV0FBQVUsYUFBQSxHQUFBLEtBQUExYixPQUFBLENBQUFnYixNQUFBO0FBQ0E7O0FBRUEsU0FBQVosS0FBQSxHQUFBLEtBQUFwYSxPQUFBLENBQUFvYSxLQUFBO0FBRUFVLElBQUFBLFFBQUEsQ0FBQSxLQUFBUyxJQUFBLENBQUEsR0FBQSxJQUFBOztBQUVBLFFBQUEsQ0FBQVYsVUFBQSxDQUFBLEtBQUE3YSxPQUFBLENBQUF5RSxHQUFBLENBQUEsRUFBQTtBQUNBb1csTUFBQUEsVUFBQSxDQUFBLEtBQUE3YSxPQUFBLENBQUF5RSxHQUFBLENBQUEsR0FBQS9RLENBQUEsQ0FBQSxxQ0FBQSxLQUFBc00sT0FBQSxDQUFBeUUsR0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBekosUUFBQSxDQUFBLE1BQUEsRUFBQXlCLEVBQUEsQ0FBQSxPQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBO0FBQ0EvSSxRQUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUFpSSxJQUFBLENBQUEsZUFBQSxFQUFBMGYsS0FBQTtBQUNBLE9BRkEsQ0FBQTtBQUdBO0FBQ0EsR0EvQkE7O0FBa0NBM25CLEVBQUFBLENBQUEsQ0FBQXFFLE1BQUEsQ0FBQWtqQixPQUFBLENBQUF6bUIsU0FBQSxFQUFBO0FBRUErbUIsSUFBQUEsSUFBQSxFQUFBLEtBRkE7QUFHQTFZLElBQUFBLE9BQUEsRUFBQSxLQUhBO0FBSUE4WSxJQUFBQSxNQUFBLEVBQUEsS0FKQTtBQUtBRCxJQUFBQSxhQUFBLEVBQUEsRUFMQTtBQU1BdEIsSUFBQUEsS0FBQSxFQUFBLEtBTkE7QUFRQW5VLElBQUFBLElBQUEsRUFBQSxZQUFBO0FBRUEsVUFBQSxLQUFBcEQsT0FBQSxDQUFBOUgsRUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBO0FBRUEsVUFBQWdhLEtBQUEsR0FBQSxJQUFBO0FBRUE4RixNQUFBQSxVQUFBLENBQUEsS0FBQTdhLE9BQUEsQ0FBQXlFLEdBQUEsQ0FBQSxDQUFBd0IsSUFBQSxHQUFBMlYsT0FBQSxDQUFBLEtBQUEvWSxPQUFBO0FBRUEsVUFBQWdaLFlBQUEsR0FBQXBpQixRQUFBLENBQUEsS0FBQW9KLE9BQUEsQ0FBQXZLLEdBQUEsQ0FBQSxlQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7QUFFQSxXQUFBdUssT0FBQSxDQUFBdkssR0FBQSxDQUFBO0FBQUEsbUJBQUEsQ0FBQTtBQUFBLHNCQUFBLENBQUEsQ0FBQSxHQUFBLEtBQUF1SyxPQUFBLENBQUF2SixXQUFBLEVBQUE7QUFBQSx5QkFBQTtBQUFBLE9BQUEsRUFBQXdKLE9BQUEsQ0FBQTtBQUFBLG1CQUFBLENBQUE7QUFBQSxzQkFBQSxDQUFBO0FBQUEseUJBQUErWTtBQUFBLE9BQUEsRUFBQSxZQUFBO0FBRUEsWUFBQTlHLEtBQUEsQ0FBQS9VLE9BQUEsQ0FBQThiLE9BQUEsRUFBQTtBQUVBLGNBQUFDLE9BQUEsR0FBQSxZQUFBO0FBQUFoSCxZQUFBQSxLQUFBLENBQUFzRyxLQUFBO0FBQUEsV0FBQTs7QUFFQXRHLFVBQUFBLEtBQUEsQ0FBQStHLE9BQUEsR0FBQWhYLFVBQUEsQ0FBQWlYLE9BQUEsRUFBQWhILEtBQUEsQ0FBQS9VLE9BQUEsQ0FBQThiLE9BQUEsQ0FBQTtBQUVBL0csVUFBQUEsS0FBQSxDQUFBbFMsT0FBQSxDQUFBbVosS0FBQSxDQUNBLFlBQUE7QUFBQW5YLFlBQUFBLFlBQUEsQ0FBQWtRLEtBQUEsQ0FBQStHLE9BQUEsQ0FBQTtBQUFBLFdBREEsRUFFQSxZQUFBO0FBQUEvRyxZQUFBQSxLQUFBLENBQUErRyxPQUFBLEdBQUFoWCxVQUFBLENBQUFpWCxPQUFBLEVBQUFoSCxLQUFBLENBQUEvVSxPQUFBLENBQUE4YixPQUFBLENBQUE7QUFBQSxXQUZBO0FBSUE7QUFFQSxPQWRBO0FBZ0JBLGFBQUEsSUFBQTtBQUNBLEtBbkNBO0FBcUNBVCxJQUFBQSxLQUFBLEVBQUEsVUFBQUYsU0FBQSxFQUFBO0FBRUEsVUFBQXBHLEtBQUEsR0FBQSxJQUFBO0FBQUEsVUFDQWtILFFBQUEsR0FBQSxZQUFBO0FBQ0FsSCxRQUFBQSxLQUFBLENBQUFsUyxPQUFBLENBQUFuSCxNQUFBOztBQUVBLFlBQUEsQ0FBQW1mLFVBQUEsQ0FBQTlGLEtBQUEsQ0FBQS9VLE9BQUEsQ0FBQXlFLEdBQUEsQ0FBQSxDQUFBMUssUUFBQSxHQUFBbkQsTUFBQSxFQUFBO0FBQ0Fpa0IsVUFBQUEsVUFBQSxDQUFBOUYsS0FBQSxDQUFBL1UsT0FBQSxDQUFBeUUsR0FBQSxDQUFBLENBQUF5WCxJQUFBO0FBQ0E7O0FBRUEsZUFBQXBCLFFBQUEsQ0FBQS9GLEtBQUEsQ0FBQXdHLElBQUEsQ0FBQTtBQUNBLE9BVEE7O0FBV0EsVUFBQSxLQUFBTyxPQUFBLEVBQUFqWCxZQUFBLENBQUEsS0FBQWlYLE9BQUEsQ0FBQTs7QUFFQSxVQUFBWCxTQUFBLEVBQUE7QUFDQWMsUUFBQUEsUUFBQTtBQUNBLE9BRkEsTUFFQTtBQUNBLGFBQUFwWixPQUFBLENBQUFDLE9BQUEsQ0FBQTtBQUFBLHFCQUFBLENBQUE7QUFBQSx3QkFBQSxDQUFBLENBQUEsR0FBQSxLQUFBRCxPQUFBLENBQUF2SixXQUFBLEVBQUE7QUFBQSwyQkFBQTtBQUFBLFNBQUEsRUFBQSxZQUFBO0FBQ0EyaUIsVUFBQUEsUUFBQTtBQUNBLFNBRkE7QUFHQTtBQUNBLEtBM0RBO0FBNkRBclYsSUFBQUEsT0FBQSxFQUFBLFVBQUF1VixJQUFBLEVBQUE7QUFFQSxVQUFBcFIsU0FBQSxHQUFBLEtBQUFsSSxPQUFBLENBQUFsSSxJQUFBLENBQUEsTUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQXdoQixJQUFBLEVBQUE7QUFDQSxlQUFBcFIsU0FBQSxDQUFBb1IsSUFBQSxFQUFBO0FBQ0E7O0FBRUFwUixNQUFBQSxTQUFBLENBQUFvUixJQUFBLENBQUFBLElBQUE7QUFFQSxhQUFBLElBQUE7QUFDQSxLQXhFQTtBQTBFQW5CLElBQUFBLE1BQUEsRUFBQSxVQUFBQSxNQUFBLEVBQUE7QUFFQSxVQUFBLENBQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsS0FBQVUsYUFBQTtBQUNBOztBQUVBLFdBQUE3WSxPQUFBLENBQUE5RixXQUFBLENBQUEsaUJBQUEsS0FBQTJlLGFBQUEsRUFBQTVlLFFBQUEsQ0FBQSxpQkFBQWtlLE1BQUE7QUFFQSxXQUFBVSxhQUFBLEdBQUFWLE1BQUE7QUFFQSxhQUFBLElBQUE7QUFDQTtBQXJGQSxHQUFBO0FBd0ZBQyxFQUFBQSxPQUFBLENBQUFLLFFBQUEsR0FBQTtBQUNBWCxJQUFBQSxPQUFBLEVBQUEsRUFEQTtBQUVBSyxJQUFBQSxNQUFBLEVBQUEsUUFGQTtBQUdBYyxJQUFBQSxPQUFBLEVBQUEsSUFIQTtBQUlBMUIsSUFBQUEsS0FBQSxFQUFBLElBSkE7QUFLQTNWLElBQUFBLEdBQUEsRUFBQTtBQUxBLEdBQUE7QUFTQS9RLEVBQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQWtuQixNQUFBO0FBQ0FsbkIsRUFBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBaW5CLE9BQUEsR0FBQU0sT0FBQTtBQUNBdm5CLEVBQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQXduQixRQUFBLEdBQUFBLFFBQUE7QUFFQSxTQUFBTixNQUFBO0FBRUEsQ0FsS0EsR0FBQTtBQzNEQTs7Ozs7Ozs7QUFPQSxDQUFBLFlBQUE7QUFDQTs7QUFFQSxNQUFBbkYsZ0JBQUEsR0FBQSxpQkFBQTtBQUVBL2hCLEVBQUFBLENBQUEsQ0FBQTBvQixZQUFBLENBQUE7O0FBRUEsV0FBQUEsWUFBQSxHQUFBO0FBRUE7QUFDQSxRQUFBLENBQUExb0IsQ0FBQSxDQUFBUSxFQUFBLENBQUFtb0IsUUFBQSxFQUFBO0FBRUEsUUFBQS9CLFFBQUEsR0FBQSx5QkFBQTtBQUVBNW1CLElBQUFBLENBQUEsQ0FBQTRtQixRQUFBLENBQUEsQ0FBQStCLFFBQUEsQ0FBQTtBQUNBQyxNQUFBQSxXQUFBLEVBQUFoQyxRQURBO0FBRUFpQyxNQUFBQSxLQUFBLEVBQUEsVUFGQTtBQUdBQyxNQUFBQSxNQUFBLEVBQUEsa0JBSEE7QUFJQXZZLE1BQUFBLE9BQUEsRUFBQSxHQUpBO0FBS0F3WSxNQUFBQSxXQUFBLEVBQUEseUJBTEE7QUFNQXZRLE1BQUFBLE1BQUEsRUFBQSxpQkFOQTtBQU9Bd1EsTUFBQUEsb0JBQUEsRUFBQSxJQVBBO0FBUUFDLE1BQUFBLFNBQUEsRUFBQSxLQVJBO0FBU0FDLE1BQUFBLFNBQUEsRUFBQSxTQVRBO0FBVUFDLE1BQUFBLE1BQUEsRUFBQSxVQVZBO0FBV0FDLE1BQUFBLE1BQUEsRUFBQSxHQVhBO0FBWUFDLE1BQUFBLGVBQUEsRUFBQSxJQVpBO0FBYUFoWSxNQUFBQSxNQUFBLEVBQUFpWSxnQkFiQTtBQWNBQyxNQUFBQSxNQUFBLEVBQUFDO0FBZEEsS0FBQSxFQWdCQTtBQUNBO0FBakJBO0FBb0JBOztBQUVBLFdBQUFGLGdCQUFBLENBQUFub0IsS0FBQSxFQUFBc29CLEVBQUEsRUFBQTtBQUVBLFFBQUF4aEIsSUFBQSxHQUFBZ1UsUUFBQSxDQUFBQyxZQUFBLENBQUFDLEdBQUEsQ0FBQTRGLGdCQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBOVosSUFBQSxFQUFBO0FBQUFBLE1BQUFBLElBQUEsR0FBQSxFQUFBO0FBQUE7O0FBRUFBLElBQUFBLElBQUEsQ0FBQSxLQUFBeWYsRUFBQSxDQUFBLEdBQUExbkIsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBMm9CLFFBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsUUFBQTFnQixJQUFBLEVBQUE7QUFDQWdVLE1BQUFBLFFBQUEsQ0FBQUMsWUFBQSxDQUFBcUIsR0FBQSxDQUFBd0UsZ0JBQUEsRUFBQTlaLElBQUE7QUFDQTtBQUVBOztBQUVBLFdBQUF1aEIsZ0JBQUEsR0FBQTtBQUVBLFFBQUF2aEIsSUFBQSxHQUFBZ1UsUUFBQSxDQUFBQyxZQUFBLENBQUFDLEdBQUEsQ0FBQTRGLGdCQUFBLENBQUE7O0FBRUEsUUFBQTlaLElBQUEsRUFBQTtBQUVBLFVBQUF5aEIsUUFBQSxHQUFBLEtBQUFoQyxFQUFBO0FBQUEsVUFDQWlDLEtBQUEsR0FBQTFoQixJQUFBLENBQUF5aEIsUUFBQSxDQURBOztBQUdBLFVBQUFDLEtBQUEsRUFBQTtBQUNBLFlBQUFDLE9BQUEsR0FBQTVwQixDQUFBLENBQUEsTUFBQTBwQixRQUFBLENBQUE7QUFFQTFwQixRQUFBQSxDQUFBLENBQUE4RCxJQUFBLENBQUE2bEIsS0FBQSxFQUFBLFVBQUF4akIsS0FBQSxFQUFBbEMsS0FBQSxFQUFBO0FBQ0FqRSxVQUFBQSxDQUFBLENBQUEsTUFBQWlFLEtBQUEsQ0FBQSxDQUFBcUQsUUFBQSxDQUFBc2lCLE9BQUE7QUFDQSxTQUZBO0FBR0E7QUFFQTtBQUVBLEdBckVBLENBdUVBOzs7QUFDQTNwQixFQUFBQSxNQUFBLENBQUE0cEIsWUFBQSxHQUFBLFVBQUEva0IsQ0FBQSxFQUFBO0FBQ0FtWCxJQUFBQSxRQUFBLENBQUFDLFlBQUEsQ0FBQWxVLE1BQUEsQ0FBQStaLGdCQUFBLEVBREEsQ0FFQTs7QUFDQTloQixJQUFBQSxNQUFBLENBQUE2cEIsUUFBQSxDQUFBQyxNQUFBO0FBQ0EsR0FKQTtBQU1BLENBOUVBLEksQ0NQQTtBQUNBOzs7QUFFQSxDQUFBLFlBQUE7QUFDQTs7QUFFQS9wQixFQUFBQSxDQUFBLENBQUFncUIsWUFBQSxDQUFBOztBQUVBLFdBQUFBLFlBQUEsR0FBQTtBQUVBLFFBQUEsT0FBQXJCLFFBQUEsS0FBQSxXQUFBLEVBQUE7QUFFQUEsSUFBQUEsUUFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBSyxNQUFBQSxvQkFBQSxFQUFBLElBREE7QUFFQUQsTUFBQUEsV0FBQSxFQUFBO0FBRkEsS0FBQSxDQUFBO0FBS0E7QUFFQSxDQWhCQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUEvb0IsRUFBQUEsQ0FBQSxDQUFBaXFCLGNBQUEsQ0FBQTs7QUFFQSxXQUFBQSxjQUFBLEdBQUE7QUFFQWpxQixJQUFBQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUErSSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFDQUEsTUFBQUEsQ0FBQSxDQUFBNkUsY0FBQTtBQUNBdWdCLE1BQUFBLElBQUEsQ0FBQSxtQkFBQSxDQUFBO0FBQ0EsS0FIQTtBQUtBbHFCLElBQUFBLENBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQStJLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQWpFLENBQUEsRUFBQTtBQUNBQSxNQUFBQSxDQUFBLENBQUE2RSxjQUFBO0FBQ0F1Z0IsTUFBQUEsSUFBQSxDQUFBLG1CQUFBLEVBQUEsd0JBQUEsQ0FBQTtBQUNBLEtBSEE7QUFLQWxxQixJQUFBQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUErSSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFDQUEsTUFBQUEsQ0FBQSxDQUFBNkUsY0FBQTtBQUNBdWdCLE1BQUFBLElBQUEsQ0FBQSxXQUFBLEVBQUEseUJBQUEsRUFBQSxTQUFBLENBQUE7QUFDQSxLQUhBO0FBS0FscUIsSUFBQUEsQ0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBK0ksRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBakUsQ0FBQSxFQUFBO0FBQ0FBLE1BQUFBLENBQUEsQ0FBQTZFLGNBQUE7QUFDQXVnQixNQUFBQSxJQUFBLENBQUE7QUFDQW5ILFFBQUFBLEtBQUEsRUFBQSxlQURBO0FBRUFwRSxRQUFBQSxJQUFBLEVBQUEsdURBRkE7QUFHQXdMLFFBQUFBLElBQUEsRUFBQSxTQUhBO0FBSUFDLFFBQUFBLE9BQUEsRUFBQTtBQUNBNVIsVUFBQUEsTUFBQSxFQUFBLElBREE7QUFFQUQsVUFBQUEsT0FBQSxFQUFBO0FBQ0FvRyxZQUFBQSxJQUFBLEVBQUEsaUJBREE7QUFFQTFhLFlBQUFBLEtBQUEsRUFBQSxJQUZBO0FBR0FvbUIsWUFBQUEsT0FBQSxFQUFBLElBSEE7QUFJQTVSLFlBQUFBLFNBQUEsRUFBQSxXQUpBO0FBS0E2UixZQUFBQSxVQUFBLEVBQUE7QUFMQTtBQUZBO0FBSkEsT0FBQSxDQUFBLENBY0FDLElBZEEsQ0FjQSxZQUFBO0FBQ0FMLFFBQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxPQWhCQTtBQWtCQSxLQXBCQTtBQXNCQWxxQixJQUFBQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUErSSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFDQUEsTUFBQUEsQ0FBQSxDQUFBNkUsY0FBQTtBQUNBdWdCLE1BQUFBLElBQUEsQ0FBQTtBQUNBbkgsUUFBQUEsS0FBQSxFQUFBLGVBREE7QUFFQXBFLFFBQUFBLElBQUEsRUFBQSx1REFGQTtBQUdBd0wsUUFBQUEsSUFBQSxFQUFBLFNBSEE7QUFJQUMsUUFBQUEsT0FBQSxFQUFBO0FBQ0E1UixVQUFBQSxNQUFBLEVBQUE7QUFDQW1HLFlBQUFBLElBQUEsRUFBQSxpQkFEQTtBQUVBMWEsWUFBQUEsS0FBQSxFQUFBLElBRkE7QUFHQW9tQixZQUFBQSxPQUFBLEVBQUEsSUFIQTtBQUlBNVIsWUFBQUEsU0FBQSxFQUFBLEVBSkE7QUFLQTZSLFlBQUFBLFVBQUEsRUFBQTtBQUxBLFdBREE7QUFRQS9SLFVBQUFBLE9BQUEsRUFBQTtBQUNBb0csWUFBQUEsSUFBQSxFQUFBLGlCQURBO0FBRUExYSxZQUFBQSxLQUFBLEVBQUEsSUFGQTtBQUdBb21CLFlBQUFBLE9BQUEsRUFBQSxJQUhBO0FBSUE1UixZQUFBQSxTQUFBLEVBQUEsV0FKQTtBQUtBNlIsWUFBQUEsVUFBQSxFQUFBO0FBTEE7QUFSQTtBQUpBLE9BQUEsQ0FBQSxDQW9CQUMsSUFwQkEsQ0FvQkEsVUFBQUMsU0FBQSxFQUFBO0FBQ0EsWUFBQUEsU0FBQSxFQUFBO0FBQ0FOLFVBQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUEsdUNBQUEsRUFBQSxTQUFBLENBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQUEsVUFBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQSxnQ0FBQSxFQUFBLE9BQUEsQ0FBQTtBQUNBO0FBQ0EsT0ExQkE7QUE0QkEsS0E5QkE7QUFnQ0E7QUFFQSxDQTlFQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUFscUIsRUFBQUEsQ0FBQSxDQUFBeXFCLGVBQUEsQ0FBQTs7QUFFQSxXQUFBQSxlQUFBLEdBQUE7QUFFQSxRQUFBLENBQUF6cUIsQ0FBQSxDQUFBUSxFQUFBLENBQUFrcUIsV0FBQSxFQUFBO0FBRUExcUIsSUFBQUEsQ0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTBxQixXQUFBO0FBRUExcUIsSUFBQUEsQ0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTBxQixXQUFBLENBQUE7QUFDQXZHLE1BQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLFNBREE7QUFFQSxtQkFBQTVaLFVBQUEsQ0FBQSxTQUFBLENBRkE7QUFHQSxtQkFBQUEsVUFBQSxDQUFBLFNBQUEsQ0FIQTtBQUlBLGdCQUFBQSxVQUFBLENBQUEsTUFBQSxDQUpBO0FBS0EsbUJBQUFBLFVBQUEsQ0FBQSxTQUFBLENBTEE7QUFNQSxrQkFBQUEsVUFBQSxDQUFBLFFBQUE7QUFOQTtBQURBLEtBQUE7QUFXQTtBQUVBLENBeEJBLEksQ0NIQTtBQUNBOzs7QUFHQSxDQUFBLFlBQUE7QUFDQTs7QUFFQXZLLEVBQUFBLENBQUEsQ0FBQTJxQixhQUFBLENBQUE7O0FBRUEsV0FBQUEsYUFBQSxHQUFBO0FBRUEsUUFBQSxDQUFBM3FCLENBQUEsQ0FBQVEsRUFBQSxDQUFBaWxCLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQXpsQixDQUFBLENBQUFRLEVBQUEsQ0FBQWtsQixNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUExbEIsQ0FBQSxDQUFBUSxFQUFBLENBQUFvcUIsU0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBNXFCLENBQUEsQ0FBQVEsRUFBQSxDQUFBcXFCLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQTdxQixDQUFBLENBQUFRLEVBQUEsQ0FBQXNxQixPQUFBLEVBQUE7QUFDQSxRQUFBLENBQUE5cUIsQ0FBQSxDQUFBUSxFQUFBLENBQUFtbEIsVUFBQSxFQUFBLE9BUEEsQ0FTQTtBQUNBOztBQUVBM2xCLElBQUFBLENBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUF5bEIsTUFBQSxHQVpBLENBY0E7QUFDQTs7QUFFQXpsQixJQUFBQSxDQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBMGxCLE1BQUEsR0FqQkEsQ0FtQkE7QUFDQTs7QUFFQTFsQixJQUFBQSxDQUFBLENBQUEsZUFBQSxDQUFBLENBQUE0cUIsU0FBQSxHQXRCQSxDQXdCQTtBQUNBOztBQUVBNXFCLElBQUFBLENBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTZxQixTQUFBLEdBM0JBLENBNkJBO0FBQ0E7O0FBRUE3cUIsSUFBQUEsQ0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBOHFCLE9BQUEsR0FoQ0EsQ0FtQ0E7QUFDQTs7QUFFQTlxQixJQUFBQSxDQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBMmxCLFVBQUEsQ0FBQTtBQUNBQyxNQUFBQSxXQUFBLEVBQUEsUUFEQTtBQUVBQyxNQUFBQSxLQUFBLEVBQUE7QUFDQUMsUUFBQUEsSUFBQSxFQUFBLGVBREE7QUFFQW5CLFFBQUFBLElBQUEsRUFBQSxnQkFGQTtBQUdBb0IsUUFBQUEsRUFBQSxFQUFBLGtCQUhBO0FBSUFDLFFBQUFBLElBQUEsRUFBQSxvQkFKQTtBQUtBQyxRQUFBQSxRQUFBLEVBQUEsb0JBTEE7QUFNQUMsUUFBQUEsSUFBQSxFQUFBLHFCQU5BO0FBT0FDLFFBQUFBLEtBQUEsRUFBQSxrQkFQQTtBQVFBQyxRQUFBQSxLQUFBLEVBQUE7QUFSQTtBQUZBLEtBQUEsRUF0Q0EsQ0FtREE7O0FBQ0FwbUIsSUFBQUEsQ0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTJsQixVQUFBLENBQUE7QUFDQXBILE1BQUFBLE1BQUEsRUFBQTtBQURBLEtBQUE7QUFJQTtBQUVBLENBL0RBO0FDSkE7Ozs7O0FBSUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUF2ZSxFQUFBQSxDQUFBLENBQUErcUIsZ0JBQUEsQ0FBQTs7QUFFQSxXQUFBQSxnQkFBQSxHQUFBO0FBRUEsUUFBQSxDQUFBL3FCLENBQUEsQ0FBQVEsRUFBQSxDQUFBd3FCLE9BQUEsRUFBQTtBQUVBLFFBQUFDLE1BQUEsR0FBQWpyQixDQUFBLENBQUEsc0JBQUEsQ0FBQTtBQUFBLFFBQ0FrckIsTUFBQSxHQUFBbHJCLENBQUEsQ0FBQSxRQUFBLENBREE7QUFBQSxRQUVBbXJCLE1BQUEsR0FBQW5yQixDQUFBLENBQUEsUUFBQSxDQUZBO0FBQUEsUUFHQW9yQixXQUFBLEdBQUFwckIsQ0FBQSxDQUFBLGFBQUEsQ0FIQTtBQUFBLFFBSUFxckIsVUFBQSxHQUFBcnJCLENBQUEsQ0FBQSxZQUFBLENBSkE7QUFBQSxRQUtBc3JCLFdBQUEsR0FBQXRyQixDQUFBLENBQUEsYUFBQSxDQUxBO0FBQUEsUUFNQXNNLE9BQUEsR0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUFpZixNQUFBQSxXQUFBLEVBQUEsS0FBQSxDQTNDQTtBQTRDQUMsTUFBQUEsT0FBQSxFQUFBLGNBNUNBO0FBNkNBQyxNQUFBQSxJQUFBLEVBQUEsVUFBQXhqQixJQUFBLEVBQUE7QUFDQWlqQixRQUFBQSxNQUFBLENBQUFqbUIsR0FBQSxDQUFBb0csSUFBQSxDQUFBQyxLQUFBLENBQUFyRCxJQUFBLENBQUF5SSxDQUFBLENBQUE7QUFDQXlhLFFBQUFBLE1BQUEsQ0FBQWxtQixHQUFBLENBQUFvRyxJQUFBLENBQUFDLEtBQUEsQ0FBQXJELElBQUEsQ0FBQXdJLENBQUEsQ0FBQTtBQUNBMmEsUUFBQUEsV0FBQSxDQUFBbm1CLEdBQUEsQ0FBQW9HLElBQUEsQ0FBQUMsS0FBQSxDQUFBckQsSUFBQSxDQUFBa0csTUFBQSxDQUFBO0FBQ0FrZCxRQUFBQSxVQUFBLENBQUFwbUIsR0FBQSxDQUFBb0csSUFBQSxDQUFBQyxLQUFBLENBQUFyRCxJQUFBLENBQUFtQyxLQUFBLENBQUE7QUFDQWtoQixRQUFBQSxXQUFBLENBQUFybUIsR0FBQSxDQUFBb0csSUFBQSxDQUFBQyxLQUFBLENBQUFyRCxJQUFBLENBQUF5akIsTUFBQSxDQUFBO0FBQ0E7QUFuREEsS0FOQTtBQTREQVQsSUFBQUEsTUFBQSxDQUFBbGlCLEVBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUFqRSxDQUFBLEVBQUE7QUFDQW1XLFFBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBcFcsQ0FBQSxDQUFBeEQsSUFBQTtBQUNBLE9BSEE7QUFJQSx1QkFBQSxVQUFBd0QsQ0FBQSxFQUFBO0FBQ0FtVyxRQUFBQSxPQUFBLENBQUFDLEdBQUEsQ0FBQXBXLENBQUEsQ0FBQXhELElBQUE7QUFDQSxPQU5BO0FBT0EsMkJBQUEsVUFBQXdELENBQUEsRUFBQTtBQUNBbVcsUUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUFwVyxDQUFBLENBQUF4RCxJQUFBLEVBQUF3RCxDQUFBLENBQUE2bUIsUUFBQTtBQUNBLE9BVEE7QUFVQSwwQkFBQSxVQUFBN21CLENBQUEsRUFBQTtBQUNBbVcsUUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUFwVyxDQUFBLENBQUF4RCxJQUFBLEVBQUF3RCxDQUFBLENBQUE2bUIsUUFBQTtBQUNBLE9BWkE7QUFhQSx5QkFBQSxVQUFBN21CLENBQUEsRUFBQTtBQUNBbVcsUUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUFwVyxDQUFBLENBQUF4RCxJQUFBLEVBQUF3RCxDQUFBLENBQUE2bUIsUUFBQTtBQUNBLE9BZkE7QUFnQkEsd0JBQUEsVUFBQTdtQixDQUFBLEVBQUE7QUFDQW1XLFFBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBcFcsQ0FBQSxDQUFBeEQsSUFBQTtBQUNBLE9BbEJBO0FBbUJBLHlCQUFBLFVBQUF3RCxDQUFBLEVBQUE7QUFDQW1XLFFBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBcFcsQ0FBQSxDQUFBeEQsSUFBQTtBQUNBLE9BckJBO0FBc0JBLHdCQUFBLFVBQUF3RCxDQUFBLEVBQUE7QUFDQW1XLFFBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBcFcsQ0FBQSxDQUFBeEQsSUFBQTtBQUNBO0FBeEJBLEtBQUEsRUF5QkEwcEIsT0F6QkEsQ0F5QkExZSxPQXpCQSxFQWhFQSxDQTRGQTs7QUFDQXRNLElBQUFBLENBQUEsQ0FBQXNDLFFBQUEsQ0FBQW1lLElBQUEsQ0FBQSxDQUFBMVgsRUFBQSxDQUFBLE9BQUEsRUFBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFVBQUFkLElBQUEsR0FBQWpJLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQWlJLElBQUEsRUFBQTtBQUFBLFVBQ0E2WCxPQURBO0FBQUEsVUFFQThMLE1BRkE7O0FBSUEsVUFBQSxDQUFBWCxNQUFBLENBQUFoakIsSUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQTs7QUFFQSxVQUFBQSxJQUFBLENBQUF6RSxNQUFBLEVBQUE7QUFDQXlFLFFBQUFBLElBQUEsR0FBQWpJLENBQUEsQ0FBQXFFLE1BQUEsQ0FBQSxFQUFBLEVBQUE0RCxJQUFBLENBQUEsQ0FEQSxDQUNBOztBQUVBLFlBQUEsT0FBQUEsSUFBQSxDQUFBNUcsTUFBQSxLQUFBLFdBQUEsRUFBQTtBQUNBeWUsVUFBQUEsT0FBQSxHQUFBOWYsQ0FBQSxDQUFBaUksSUFBQSxDQUFBNUcsTUFBQSxDQUFBOztBQUVBLGNBQUEsT0FBQTRHLElBQUEsQ0FBQTRqQixNQUFBLEtBQUEsV0FBQSxFQUFBO0FBQ0EsZ0JBQUE7QUFDQTVqQixjQUFBQSxJQUFBLENBQUE0akIsTUFBQSxHQUFBdGpCLElBQUEsQ0FBQUMsS0FBQSxDQUFBc1gsT0FBQSxDQUFBN2EsR0FBQSxFQUFBLENBQUE7QUFDQSxhQUZBLENBRUEsT0FBQUgsQ0FBQSxFQUFBO0FBQ0FtVyxjQUFBQSxPQUFBLENBQUFDLEdBQUEsQ0FBQXBXLENBQUEsQ0FBQW1pQixPQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUVBMkUsUUFBQUEsTUFBQSxHQUFBWCxNQUFBLENBQUFELE9BQUEsQ0FBQS9pQixJQUFBLENBQUF6RSxNQUFBLEVBQUF5RSxJQUFBLENBQUE0akIsTUFBQSxDQUFBOztBQUVBLFlBQUE1akIsSUFBQSxDQUFBekUsTUFBQSxLQUFBLGtCQUFBLEVBQUE7QUFDQXhELFVBQUFBLENBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE4ckIsS0FBQSxHQUFBN2tCLElBQUEsQ0FBQSxhQUFBLEVBQUF3aEIsSUFBQSxDQUFBbUQsTUFBQTtBQUNBOztBQUVBLFlBQUE1ckIsQ0FBQSxDQUFBK3JCLGFBQUEsQ0FBQUgsTUFBQSxLQUFBOUwsT0FBQSxFQUFBO0FBQ0EsY0FBQTtBQUNBQSxZQUFBQSxPQUFBLENBQUE3YSxHQUFBLENBQUFzRCxJQUFBLENBQUFzSCxTQUFBLENBQUErYixNQUFBLENBQUE7QUFDQSxXQUZBLENBRUEsT0FBQTltQixDQUFBLEVBQUE7QUFDQW1XLFlBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBcFcsQ0FBQSxDQUFBbWlCLE9BQUE7QUFDQTtBQUNBO0FBRUE7QUFDQSxLQXZDQSxFQXVDQWxlLEVBdkNBLENBdUNBLFNBdkNBLEVBdUNBLFVBQUFqRSxDQUFBLEVBQUE7QUFFQSxVQUFBLENBQUFtbUIsTUFBQSxDQUFBaGpCLElBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQTtBQUNBO0FBQ0E7O0FBRUEsY0FBQW5ELENBQUEsQ0FBQWtuQixLQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0FsbkIsVUFBQUEsQ0FBQSxDQUFBNkUsY0FBQTtBQUNBc2hCLFVBQUFBLE1BQUEsQ0FBQUQsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0E7O0FBRUEsYUFBQSxFQUFBO0FBQ0FsbUIsVUFBQUEsQ0FBQSxDQUFBNkUsY0FBQTtBQUNBc2hCLFVBQUFBLE1BQUEsQ0FBQUQsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7O0FBRUEsYUFBQSxFQUFBO0FBQ0FsbUIsVUFBQUEsQ0FBQSxDQUFBNkUsY0FBQTtBQUNBc2hCLFVBQUFBLE1BQUEsQ0FBQUQsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBOztBQUVBLGFBQUEsRUFBQTtBQUNBbG1CLFVBQUFBLENBQUEsQ0FBQTZFLGNBQUE7QUFDQXNoQixVQUFBQSxNQUFBLENBQUFELE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQW5CQTtBQXNCQSxLQW5FQSxFQTdGQSxDQW1LQTs7QUFDQSxRQUFBaUIsV0FBQSxHQUFBanNCLENBQUEsQ0FBQSxhQUFBLENBQUE7QUFBQSxRQUNBa3NCLEdBQUEsR0FBQWpzQixNQUFBLENBQUFpc0IsR0FBQSxJQUFBanNCLE1BQUEsQ0FBQWtzQixTQURBO0FBQUEsUUFFQUMsT0FGQTs7QUFJQSxRQUFBRixHQUFBLEVBQUE7QUFDQUQsTUFBQUEsV0FBQSxDQUFBSSxNQUFBLENBQUEsWUFBQTtBQUNBLFlBQUFDLEtBQUEsR0FBQSxLQUFBQSxLQUFBO0FBQUEsWUFDQUMsSUFEQTs7QUFHQSxZQUFBLENBQUF0QixNQUFBLENBQUFoakIsSUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQTs7QUFFQSxZQUFBcWtCLEtBQUEsSUFBQUEsS0FBQSxDQUFBcHBCLE1BQUEsRUFBQTtBQUNBcXBCLFVBQUFBLElBQUEsR0FBQUQsS0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxjQUFBLGVBQUFoa0IsSUFBQSxDQUFBaWtCLElBQUEsQ0FBQWpyQixJQUFBLENBQUEsRUFBQTtBQUNBOHFCLFlBQUFBLE9BQUEsR0FBQUYsR0FBQSxDQUFBTSxlQUFBLENBQUFELElBQUEsQ0FBQTtBQUNBdEIsWUFBQUEsTUFBQSxDQUFBd0IsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0FQLGNBQUFBLEdBQUEsQ0FBQVEsZUFBQSxDQUFBTixPQUFBLEVBREEsQ0FDQTtBQUNBLGFBRkEsRUFFQXBCLE9BRkEsQ0FFQSxPQUZBLEVBRUFBLE9BRkEsQ0FFQSxTQUZBLEVBRUFvQixPQUZBO0FBR0FILFlBQUFBLFdBQUEsQ0FBQWhuQixHQUFBLENBQUEsRUFBQTtBQUNBLFdBTkEsTUFNQTtBQUNBMG5CLFlBQUFBLEtBQUEsQ0FBQSw4QkFBQSxDQUFBO0FBQ0E7QUFDQTtBQUNBLE9BckJBO0FBc0JBLEtBdkJBLE1BdUJBO0FBQ0FWLE1BQUFBLFdBQUEsQ0FBQXRsQixNQUFBLEdBQUFxQixNQUFBO0FBQ0EsS0FqTUEsQ0FvTUE7OztBQUNBaEksSUFBQUEsQ0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQStJLEVBQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFVBQUFzWSxLQUFBLEdBQUFyaEIsQ0FBQSxDQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUFpckIsTUFBQSxDQUFBaGpCLElBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQTtBQUNBO0FBQ0E7O0FBRUFxRSxNQUFBQSxPQUFBLENBQUErVSxLQUFBLENBQUFwYyxHQUFBLEVBQUEsQ0FBQSxHQUFBb2MsS0FBQSxDQUFBaGMsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBNGxCLE1BQUFBLE1BQUEsQ0FBQUQsT0FBQSxDQUFBLFNBQUEsRUFBQUEsT0FBQSxDQUFBMWUsT0FBQTtBQUNBLEtBVEEsRUFyTUEsQ0FpTkE7O0FBQ0F0TSxJQUFBQSxDQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBZ1QsT0FBQTtBQUVBO0FBRUEsQ0EzTkEsSSxDQ0pBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBaFQsRUFBQUEsQ0FBQSxDQUFBNHNCLFdBQUEsQ0FBQTs7QUFFQSxXQUFBQSxXQUFBLEdBQUE7QUFFQSxRQUFBLENBQUE1c0IsQ0FBQSxDQUFBUSxFQUFBLENBQUFxc0IsT0FBQSxFQUFBLE9BRkEsQ0FJQTs7QUFFQTdzQixJQUFBQSxDQUFBLENBQUEsWUFBQSxDQUFBLENBQUE2c0IsT0FBQSxDQUFBO0FBQ0FDLE1BQUFBLEtBQUEsRUFBQTtBQURBLEtBQUE7QUFHQTlzQixJQUFBQSxDQUFBLENBQUEsWUFBQSxDQUFBLENBQUE2c0IsT0FBQSxDQUFBO0FBQ0FDLE1BQUFBLEtBQUEsRUFBQTtBQURBLEtBQUE7QUFHQTlzQixJQUFBQSxDQUFBLENBQUEsWUFBQSxDQUFBLENBQUE2c0IsT0FBQSxDQUFBO0FBQ0FDLE1BQUFBLEtBQUEsRUFBQTtBQURBLEtBQUE7QUFHQTlzQixJQUFBQSxDQUFBLENBQUEsWUFBQSxDQUFBLENBQUE2c0IsT0FBQSxDQUFBO0FBQ0E5RCxNQUFBQSxXQUFBLEVBQUEsZ0JBREE7QUFFQWdFLE1BQUFBLFVBQUEsRUFBQSxJQUZBO0FBR0FELE1BQUFBLEtBQUEsRUFBQTtBQUhBLEtBQUE7QUFNQTtBQUVBLENBNUJBOztBQ0hBLENBQUEsWUFBQTtBQUNBOztBQUVBLE1BQUEsT0FBQUUsUUFBQSxLQUFBLFdBQUEsRUFBQSxPQUhBLENBS0E7QUFDQTtBQUNBOztBQUNBQSxFQUFBQSxRQUFBLENBQUFDLFlBQUEsR0FBQSxLQUFBO0FBRUFqdEIsRUFBQUEsQ0FBQSxDQUFBa3RCLFlBQUEsQ0FBQTs7QUFFQSxXQUFBQSxZQUFBLEdBQUE7QUFFQTtBQUNBLFFBQUFDLGVBQUEsR0FBQTtBQUNBQyxNQUFBQSxnQkFBQSxFQUFBLEtBREE7QUFFQUMsTUFBQUEsY0FBQSxFQUFBLElBRkE7QUFHQUMsTUFBQUEsZUFBQSxFQUFBLEdBSEE7QUFJQUMsTUFBQUEsUUFBQSxFQUFBLEdBSkE7QUFLQUMsTUFBQUEsa0JBQUEsRUFBQSx3RUFMQTtBQUtBO0FBQ0FDLE1BQUFBLFNBQUEsRUFBQSxNQU5BO0FBTUE7QUFDQUMsTUFBQUEsV0FBQSxFQUFBLENBUEE7QUFPQTtBQUNBQyxNQUFBQSxjQUFBLEVBQUEsSUFSQTtBQVNBQyxNQUFBQSxNQUFBLEVBQUEsVUFBQXJCLElBQUEsRUFBQXNCLElBQUEsRUFBQTtBQUNBLFlBQUF0QixJQUFBLENBQUFuVyxJQUFBLEtBQUEsa0JBQUEsRUFBQTtBQUNBeVgsVUFBQUEsSUFBQSxDQUFBLG9CQUFBLENBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQUEsVUFBQUEsSUFBQTtBQUNBO0FBQ0EsT0FmQTtBQWdCQTVyQixNQUFBQSxJQUFBLEVBQUEsWUFBQTtBQUNBLFlBQUE2ckIsU0FBQSxHQUFBLElBQUE7QUFFQSxhQUFBM2UsT0FBQSxDQUFBekgsYUFBQSxDQUFBLHFCQUFBLEVBQUFsRyxnQkFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBc0QsQ0FBQSxFQUFBO0FBQ0FBLFVBQUFBLENBQUEsQ0FBQTZFLGNBQUE7QUFDQTdFLFVBQUFBLENBQUEsQ0FBQXdTLGVBQUE7QUFDQXdXLFVBQUFBLFNBQUEsQ0FBQUMsWUFBQTtBQUNBLFNBSkE7QUFLQSxhQUFBaGxCLEVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQXdqQixJQUFBLEVBQUE7QUFDQXRSLFVBQUFBLE9BQUEsQ0FBQUMsR0FBQSxDQUFBLGlCQUFBcVIsSUFBQSxDQUFBblcsSUFBQTtBQUNBLFNBRkE7QUFHQSxhQUFBck4sRUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBd2pCLElBQUEsRUFBQTtBQUNBdFIsVUFBQUEsT0FBQSxDQUFBQyxHQUFBLENBQUEsbUJBQUFxUixJQUFBLENBQUFuVyxJQUFBO0FBQ0EsU0FGQTtBQUdBLGFBQUFyTixFQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBLENBRUEsQ0FGQTtBQUdBLGFBQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUFBO0FBQUE7QUFBQSxTQUVBLENBRkE7QUFHQSxhQUFBQSxFQUFBLENBQUEsZUFBQSxFQUFBO0FBQUE7QUFBQSxTQUVBLENBRkE7QUFHQTtBQXZDQSxLQUFBO0FBMkNBLFFBQUFpbEIsWUFBQSxHQUFBLElBQUFoQixRQUFBLENBQUEsZ0JBQUEsRUFBQUcsZUFBQSxDQUFBO0FBRUE7QUFFQSxDQTlEQSxJLENDQUE7QUFDQTs7O0FBR0EsQ0FBQSxZQUFBO0FBQ0E7O0FBRUFudEIsRUFBQUEsQ0FBQSxDQUFBaXVCLFVBQUEsQ0FBQTs7QUFFQSxXQUFBQSxVQUFBLEdBQUE7QUFFQSxRQUFBLENBQUFqdUIsQ0FBQSxDQUFBUSxFQUFBLENBQUEwdEIsUUFBQSxFQUFBLE9BRkEsQ0FJQTtBQUNBOztBQUNBLFFBQUFDLElBQUEsR0FBQW51QixDQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0FtdUIsSUFBQUEsSUFBQSxDQUFBRCxRQUFBLENBQUE7QUFDQUUsTUFBQUEsY0FBQSxFQUFBLFNBQUFBLGNBQUEsQ0FBQTFTLEtBQUEsRUFBQXZNLE9BQUEsRUFBQTtBQUFBQSxRQUFBQSxPQUFBLENBQUFrZixNQUFBLENBQUEzUyxLQUFBO0FBQUEsT0FEQTtBQUVBNFMsTUFBQUEsS0FBQSxFQUFBO0FBQ0EvVixRQUFBQSxPQUFBLEVBQUE7QUFDQWdXLFVBQUFBLE9BQUEsRUFBQTtBQURBO0FBREE7QUFGQSxLQUFBO0FBUUFKLElBQUFBLElBQUEsQ0FBQTluQixRQUFBLENBQUEsS0FBQSxFQUFBa2YsS0FBQSxDQUFBO0FBQ0FpSixNQUFBQSxTQUFBLEVBQUEsSUFEQTtBQUVBQyxNQUFBQSxPQUFBLEVBQUEsVUFGQTtBQUdBQyxNQUFBQSxnQkFBQSxFQUFBLFdBSEE7QUFJQUMsTUFBQUEsY0FBQSxFQUFBLFVBQUF4dEIsS0FBQSxFQUFBeXRCLFlBQUEsRUFBQUMsUUFBQSxFQUFBO0FBQ0FWLFFBQUFBLElBQUEsQ0FBQUQsUUFBQSxHQUFBWSxRQUFBLENBQUFDLE1BQUEsR0FBQSxtQkFBQTtBQUNBLGVBQUFaLElBQUEsQ0FBQWEsS0FBQSxFQUFBO0FBQ0EsT0FQQTtBQVFBQyxNQUFBQSxXQUFBLEVBQUEsVUFBQTl0QixLQUFBLEVBQUF5dEIsWUFBQSxFQUFBO0FBQ0FULFFBQUFBLElBQUEsQ0FBQUQsUUFBQSxHQUFBWSxRQUFBLENBQUFDLE1BQUEsR0FBQSxXQUFBO0FBQ0EsZUFBQVosSUFBQSxDQUFBYSxLQUFBLEVBQUE7QUFDQSxPQVhBO0FBWUFFLE1BQUFBLFVBQUEsRUFBQSxVQUFBL3RCLEtBQUEsRUFBQXl0QixZQUFBLEVBQUE7QUFDQWpDLFFBQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsQ0FEQSxDQUdBOztBQUNBM3NCLFFBQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQW12QixNQUFBO0FBQ0E7QUFqQkEsS0FBQSxFQWZBLENBbUNBO0FBQ0E7O0FBRUFudkIsSUFBQUEsQ0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQXVsQixLQUFBLENBQUE7QUFDQWlKLE1BQUFBLFNBQUEsRUFBQSxJQURBO0FBRUFDLE1BQUFBLE9BQUEsRUFBQSxTQUZBO0FBR0FDLE1BQUFBLGdCQUFBLEVBQUEsV0FIQTtBQUlBVSxNQUFBQSxnQkFBQSxFQUFBO0FBSkEsS0FBQTtBQU9BO0FBRUEsQ0FwREEsSSxDQ0pBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBcHZCLEVBQUFBLENBQUEsQ0FBQXF2QixhQUFBLENBQUE7O0FBRUEsV0FBQUEsYUFBQSxHQUFBO0FBRUEsUUFBQSxDQUFBcnZCLENBQUEsQ0FBQVEsRUFBQSxDQUFBaWpCLFFBQUEsRUFBQSxPQUZBLENBSUE7O0FBQ0F6akIsSUFBQUEsQ0FBQSxDQUFBUSxFQUFBLENBQUE4dUIsWUFBQSxDQUFBbEYsT0FBQSxHQUNBLDBFQUNBLG1DQURBLEdBRUEsV0FGQSxHQUdBLHVFQUhBLEdBSUEsbUNBSkEsR0FLQSxXQU5BLENBTEEsQ0FhQTtBQUNBO0FBRUE7O0FBQ0FwcUIsSUFBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBdXZCLEtBQUEsQ0FBQSxZQUFBO0FBQ0F2dkIsTUFBQUEsQ0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQXlqQixRQUFBLENBQUEsZ0JBQUE7QUFDQSxLQUZBLEVBakJBLENBcUJBOztBQUNBempCLElBQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQXlqQixRQUFBLENBQUE7QUFDQTtBQUNBbmlCLE1BQUFBLElBQUEsRUFBQSxNQUZBO0FBR0FrdUIsTUFBQUEsRUFBQSxFQUFBLENBSEE7QUFJQXBaLE1BQUFBLElBQUEsRUFBQSxVQUpBO0FBS0EyTSxNQUFBQSxLQUFBLEVBQUEsZ0JBTEE7QUFNQTFQLE1BQUFBLElBQUEsRUFBQTtBQU5BLEtBQUE7QUFTQXJULElBQUFBLENBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQXlqQixRQUFBLENBQUE7QUFDQXlLLE1BQUFBLFFBQUEsRUFBQSxVQUFBanFCLEtBQUEsRUFBQTtBQUNBLFlBQUFqRSxDQUFBLENBQUFpakIsSUFBQSxDQUFBaGYsS0FBQSxNQUFBLEVBQUEsRUFBQSxPQUFBLHdCQUFBO0FBQ0EsT0FIQTtBQUlBb1AsTUFBQUEsSUFBQSxFQUFBO0FBSkEsS0FBQTtBQU9BclQsSUFBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBeWpCLFFBQUEsQ0FBQTtBQUNBeUUsTUFBQUEsT0FBQSxFQUFBLGNBREE7QUFFQXVILE1BQUFBLE1BQUEsRUFBQSxDQUNBO0FBQUF4ckIsUUFBQUEsS0FBQSxFQUFBLENBQUE7QUFBQTBhLFFBQUFBLElBQUEsRUFBQTtBQUFBLE9BREEsRUFFQTtBQUFBMWEsUUFBQUEsS0FBQSxFQUFBLENBQUE7QUFBQTBhLFFBQUFBLElBQUEsRUFBQTtBQUFBLE9BRkEsQ0FGQTtBQU1BMVMsTUFBQUEsT0FBQSxFQUFBLFVBQUFoSSxLQUFBLEVBQUF5ckIsVUFBQSxFQUFBO0FBQ0EsWUFBQWhhLE1BQUEsR0FBQTtBQUFBLGNBQUEsTUFBQTtBQUFBLGFBQUEsT0FBQTtBQUFBLGFBQUE7QUFBQSxTQUFBO0FBQUEsWUFDQXZULElBQUEsR0FBQW5DLENBQUEsQ0FBQTJ2QixJQUFBLENBQUFELFVBQUEsRUFBQSxVQUFBRSxDQUFBLEVBQUE7QUFBQSxpQkFBQUEsQ0FBQSxDQUFBM3JCLEtBQUEsSUFBQUEsS0FBQTtBQUFBLFNBQUEsQ0FEQTs7QUFHQSxZQUFBOUIsSUFBQSxDQUFBZSxNQUFBLEVBQUE7QUFDQWxELFVBQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTJlLElBQUEsQ0FBQXhjLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQXdjLElBQUEsRUFBQS9aLEdBQUEsQ0FBQSxPQUFBLEVBQUE4USxNQUFBLENBQUF6UixLQUFBLENBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQWpFLFVBQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTZ2QixLQUFBO0FBQ0E7QUFDQSxPQWZBO0FBZ0JBeGMsTUFBQUEsSUFBQSxFQUFBO0FBaEJBLEtBQUE7QUFtQkFyVCxJQUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUF5akIsUUFBQSxDQUFBO0FBQ0FwUSxNQUFBQSxJQUFBLEVBQUE7QUFEQSxLQUFBO0FBSUFyVCxJQUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUF5akIsUUFBQSxDQUFBO0FBQ0FxTSxNQUFBQSxXQUFBLEVBQUEsS0FEQTtBQUVBemMsTUFBQUEsSUFBQSxFQUFBO0FBRkEsS0FBQTtBQUtBclQsSUFBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBeWpCLFFBQUEsQ0FBQTtBQUNBcFEsTUFBQUEsSUFBQSxFQUFBO0FBREEsS0FBQTtBQUlBclQsSUFBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBeWpCLFFBQUEsQ0FBQTtBQUNBc00sTUFBQUEsU0FBQSxFQUFBLE9BREE7QUFFQUMsTUFBQUEsU0FBQSxFQUFBO0FBQ0FDLFFBQUFBLFNBQUEsRUFBQTtBQURBLE9BRkE7QUFLQTVjLE1BQUFBLElBQUEsRUFBQTtBQUxBLEtBQUE7QUFRQXJULElBQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQXlqQixRQUFBLENBQUE7QUFDQXFNLE1BQUFBLFdBQUEsRUFBQSxRQURBO0FBRUF6YyxNQUFBQSxJQUFBLEVBQUE7QUFGQSxLQUFBO0FBS0FyVCxJQUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLENBQUF5akIsUUFBQSxDQUFBO0FBQ0FwUSxNQUFBQSxJQUFBLEVBQUE7QUFEQSxLQUFBO0FBR0FyVCxJQUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUF1dkIsS0FBQSxDQUFBLFVBQUF6cUIsQ0FBQSxFQUFBO0FBQ0FBLE1BQUFBLENBQUEsQ0FBQXdTLGVBQUE7QUFDQXhTLE1BQUFBLENBQUEsQ0FBQTZFLGNBQUE7QUFDQTNKLE1BQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQXlqQixRQUFBLENBQUEsUUFBQTtBQUNBLEtBSkE7QUFNQXpqQixJQUFBQSxDQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBK0ksRUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBakUsQ0FBQSxFQUFBb3JCLE1BQUEsRUFBQTtBQUNBLFVBQUFBLE1BQUEsS0FBQSxNQUFBLElBQUFBLE1BQUEsS0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBQyxLQUFBLEdBQUFud0IsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBb3dCLE9BQUEsQ0FBQSxJQUFBLEVBQUFsSyxJQUFBLEdBQUFqZixJQUFBLENBQUEsV0FBQSxDQUFBOztBQUNBLFlBQUFqSCxDQUFBLENBQUEsV0FBQSxDQUFBLENBQUFxSCxFQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQStKLFVBQUFBLFVBQUEsQ0FBQSxZQUFBO0FBQ0ErZSxZQUFBQSxLQUFBLENBQUExTSxRQUFBLENBQUEsTUFBQTtBQUNBLFdBRkEsRUFFQSxHQUZBLENBQUE7QUFHQSxTQUpBLE1BSUE7QUFDQTBNLFVBQUFBLEtBQUEsQ0FBQXJuQixLQUFBO0FBQ0E7QUFDQTtBQUNBLEtBWEEsRUE1RkEsQ0F5R0E7QUFDQTs7QUFFQTlJLElBQUFBLENBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQXlqQixRQUFBLENBQUE7QUFDQW5pQixNQUFBQSxJQUFBLEVBQUEsTUFEQTtBQUVBOFUsTUFBQUEsSUFBQSxFQUFBLFVBRkE7QUFHQTJNLE1BQUFBLEtBQUEsRUFBQSxnQkFIQTtBQUlBMVAsTUFBQUEsSUFBQSxFQUFBO0FBSkEsS0FBQTtBQU9BO0FBRUEsQ0ExSEE7QUNIQTs7Ozs7O0FBSUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUFyVCxFQUFBQSxDQUFBLENBQUFxd0IsbUJBQUEsQ0FBQTs7QUFFQSxXQUFBQSxtQkFBQSxHQUFBO0FBRUE7QUFDQSxRQUFBQyxjQUFBLEdBQUE7QUFDQUMsTUFBQUEsVUFBQSxFQUFBLFlBREE7QUFFQUMsTUFBQUEsWUFBQSxFQUFBLFVBRkE7QUFHQUMsTUFBQUEsWUFBQSxFQUFBLFVBQUFDLFlBQUEsRUFBQTtBQUNBLFlBQUExdUIsRUFBQSxHQUFBMHVCLFlBQUEsQ0FBQTNaLFFBQUEsQ0FBQWxRLE9BQUEsQ0FBQSxhQUFBLEVBQUFJLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLENBQUFqRixFQUFBLENBQUFrQixNQUFBLEVBQUE7QUFDQWxCLFVBQUFBLEVBQUEsR0FBQTB1QixZQUFBLENBQUEzWixRQUFBLENBQUFsUSxPQUFBLENBQUEsYUFBQSxFQUFBSSxJQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsZUFBQWpGLEVBQUE7QUFDQSxPQVJBO0FBU0EydUIsTUFBQUEsZUFBQSxFQUFBLFVBQUFELFlBQUEsRUFBQTtBQUNBLGVBQUFBLFlBQUEsQ0FBQTNaLFFBQUEsQ0FBQWxRLE9BQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSxPQVhBO0FBWUErcEIsTUFBQUEsYUFBQSxFQUFBLHlCQVpBO0FBYUFDLE1BQUFBLGFBQUEsRUFBQTtBQWJBLEtBQUEsQ0FIQSxDQW1CQTs7QUFDQSxRQUFBQyxTQUFBLEdBQUE5d0IsQ0FBQSxDQUFBLFlBQUEsQ0FBQTtBQUNBLFFBQUE4d0IsU0FBQSxDQUFBNXRCLE1BQUEsRUFDQTR0QixTQUFBLENBQUFDLE9BQUEsQ0FBQVQsY0FBQSxFQXRCQSxDQXdCQTs7QUFDQSxRQUFBVSxZQUFBLEdBQUFoeEIsQ0FBQSxDQUFBLGVBQUEsQ0FBQTtBQUNBLFFBQUFneEIsWUFBQSxDQUFBOXRCLE1BQUEsRUFDQTh0QixZQUFBLENBQUFELE9BQUEsQ0FBQVQsY0FBQTtBQUVBO0FBRUEsQ0FwQ0E7QUNKQTs7Ozs7O0FBS0EsQ0FBQSxZQUFBO0FBQ0E7O0FBRUF0d0IsRUFBQUEsQ0FBQSxDQUFBaXhCLGNBQUEsQ0FBQSxDQUhBLENBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxNQUFBQyxTQUFBLEdBQUEsQ0FBQTtBQUFBQyxJQUFBQSxXQUFBLEVBQUEsT0FBQTtBQUFBQyxJQUFBQSxPQUFBLEVBQUEsQ0FBQTtBQUFBQyxNQUFBQSxVQUFBLEVBQUE7QUFBQSxLQUFBLEVBQUE7QUFBQXZjLE1BQUFBLEtBQUEsRUFBQTtBQUFBLEtBQUE7QUFBQSxHQUFBLEVBQUE7QUFBQXFjLElBQUFBLFdBQUEsRUFBQSxLQUFBO0FBQUFHLElBQUFBLFdBQUEsRUFBQSxrQkFBQTtBQUFBRixJQUFBQSxPQUFBLEVBQUEsQ0FBQTtBQUFBdGMsTUFBQUEsS0FBQSxFQUFBO0FBQUEsS0FBQTtBQUFBLEdBQUEsRUFBQTtBQUFBcWMsSUFBQUEsV0FBQSxFQUFBLFdBQUE7QUFBQUMsSUFBQUEsT0FBQSxFQUFBLENBQUE7QUFBQXRjLE1BQUFBLEtBQUEsRUFBQTtBQUFBLEtBQUE7QUFBQSxHQUFBLEVBQUE7QUFBQXFjLElBQUFBLFdBQUEsRUFBQSxjQUFBO0FBQUFHLElBQUFBLFdBQUEsRUFBQSxVQUFBO0FBQUFGLElBQUFBLE9BQUEsRUFBQSxDQUFBO0FBQUF0YyxNQUFBQSxLQUFBLEVBQUE7QUFBQSxLQUFBO0FBQUEsR0FBQSxFQUFBO0FBQUFxYyxJQUFBQSxXQUFBLEVBQUEsZUFBQTtBQUFBRyxJQUFBQSxXQUFBLEVBQUEsVUFBQTtBQUFBRixJQUFBQSxPQUFBLEVBQUEsQ0FBQTtBQUFBdGMsTUFBQUEsS0FBQSxFQUFBO0FBQUEsS0FBQTtBQUFBLEdBQUEsRUFBQTtBQUFBcWMsSUFBQUEsV0FBQSxFQUFBLFlBQUE7QUFBQUcsSUFBQUEsV0FBQSxFQUFBLFVBQUE7QUFBQUYsSUFBQUEsT0FBQSxFQUFBLENBQUE7QUFBQXRjLE1BQUFBLEtBQUEsRUFBQTtBQUFBLEtBQUE7QUFBQSxHQUFBLEVBQUE7QUFBQXFjLElBQUFBLFdBQUEsRUFBQSxTQUFBO0FBQUFHLElBQUFBLFdBQUEsRUFBQSxVQUFBO0FBQUFGLElBQUFBLE9BQUEsRUFBQSxDQUFBO0FBQUF0YyxNQUFBQSxLQUFBLEVBQUE7QUFBQSxLQUFBO0FBQUEsR0FBQSxFQUFBO0FBQUFxYyxJQUFBQSxXQUFBLEVBQUEsS0FBQTtBQUFBRyxJQUFBQSxXQUFBLEVBQUEsVUFBQTtBQUFBRixJQUFBQSxPQUFBLEVBQUEsQ0FBQTtBQUFBdGMsTUFBQUEsS0FBQSxFQUFBO0FBQUEsS0FBQTtBQUFBLEdBQUEsRUFBQTtBQUFBcWMsSUFBQUEsV0FBQSxFQUFBLGdCQUFBO0FBQUFDLElBQUFBLE9BQUEsRUFBQSxDQUFBO0FBQUFDLE1BQUFBLFVBQUEsRUFBQTtBQUFBLEtBQUEsRUFBQTtBQUFBRSxNQUFBQSxTQUFBLEVBQUE7QUFBQSxLQUFBO0FBQUEsR0FBQSxFQUFBO0FBQUFKLElBQUFBLFdBQUEsRUFBQSxVQUFBO0FB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QUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBO0FBQUExYyxNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQUxBLEVBTUE7QUFBQTBjLE1BQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUFBMWMsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FOQSxFQU9BO0FBQUEwYyxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBO0FBQUExYyxNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVBBLEVBUUE7QUFBQTBjLE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLENBQUE7QUFBQTFjLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBUkEsRUFTQTtBQUFBMGMsTUFBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsS0FBQSxDQUFBO0FBQUExYyxNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVRBLEVBVUE7QUFBQTBjLE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUFBMWMsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FWQSxFQVdBO0FBQUEwYyxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUE7QUFBQTFjLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBWEEsRUFZQTtBQUFBMGMsTUFBQUEsTUFBQSxFQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBO0FBQUExYyxNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVpBLEVBYUE7QUFBQTBjLE1BQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQTtBQUFBMWMsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FiQSxFQWNBO0FBQUEwYyxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBO0FBQUExYyxNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQWRBLEVBZUE7QUFBQTBjLE1BQUFBLE1BQUEsRUFBQSxDQUFBLElB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QSxFQUFBLFVBQUE7QUFBQXNLLFFBQUFBLEtBQUEsRUFBQS9pQixDQUFBLENBQUEsT0FBQSxDQUFBLENBQUEyZSxJQUFBO0FBQUEsT0FKQSxFQUtBO0FBQUF0YSxRQUFBQSxNQUFBLEVBQUEsT0FBQTtBQUFBb1UsUUFBQUEsU0FBQSxFQUFBO0FBQUEsT0FMQTtBQXJCQSxLQUFBO0FBOEJBelksSUFBQUEsQ0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBdTFCLFNBQUEsQ0FBQTtBQUNBLGdCQUFBLElBREE7QUFDQTtBQUNBLGtCQUFBLElBRkE7QUFFQTtBQUNBLGNBQUEsSUFIQTtBQUdBO0FBQ0FDLE1BQUFBLFVBQUEsRUFBQSxJQUpBO0FBS0E7QUFDQTtBQUNBQyxNQUFBQSxTQUFBLEVBQUE7QUFDQUMsUUFBQUEsT0FBQSxFQUFBLHFCQURBO0FBRUFDLFFBQUFBLFdBQUEsRUFBQSx5QkFGQTtBQUdBL1IsUUFBQUEsSUFBQSxFQUFBLGdDQUhBO0FBSUFnUyxRQUFBQSxXQUFBLEVBQUEsdUJBSkE7QUFLQUMsUUFBQUEsU0FBQSxFQUFBLHNCQUxBO0FBTUFDLFFBQUFBLFlBQUEsRUFBQSxxQ0FOQTtBQU9BQyxRQUFBQSxTQUFBLEVBQUE7QUFDQUMsVUFBQUEsS0FBQSxFQUFBLHFDQURBO0FBRUFDLFVBQUFBLFNBQUEsRUFBQTtBQUZBO0FBUEEsT0FQQTtBQW1CQTtBQUNBenhCLE1BQUFBLElBQUEsRUFBQTtBQXBCQSxLQUFBO0FBdUJBO0FBRUEsQ0ExRkEsSSxDQ0hBO0FBQ0E7OztBQUVBLENBQUEsWUFBQTtBQUNBOztBQUVBeEUsRUFBQUEsQ0FBQSxDQUFBbTJCLFVBQUEsQ0FBQTs7QUFFQSxXQUFBQSxVQUFBLEdBQUEsQ0FFQTtBQUVBO0FBRUEsQ0FYQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVGhpcyBsaWJyYXJ5IHdhcyBjcmVhdGVkIHRvIGVtdWxhdGUgc29tZSBqUXVlcnkgZmVhdHVyZXNcclxuICogdXNlZCBpbiB0aGlzIHRlbXBsYXRlIG9ubHkgd2l0aCBKYXZhc2NyaXB0IGFuZCBET01cclxuICogbWFuaXB1bGF0aW9uIGZ1bmN0aW9ucyAoSUUxMCspLlxyXG4gKiBBbGwgbWV0aG9kcyB3ZXJlIGRlc2lnbmVkIGZvciBhbiBhZGVxdWF0ZSBhbmQgc3BlY2lmaWMgdXNlXHJcbiAqIGFuZCBkb24ndCBwZXJmb3JtIGEgZGVlcCB2YWxpZGF0aW9uIG9uIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQuXHJcbiAqXHJcbiAqIElNUE9SVEFOVDpcclxuICogPT09PT09PT09PVxyXG4gKiBJdCdzIHN1Z2dlc3RlZCBOT1QgdG8gdXNlIHRoaXMgbGlicmFyeSBleHRlbnNpdmVseSB1bmxlc3MgeW91XHJcbiAqIHVuZGVyc3RhbmQgd2hhdCBlYWNoIG1ldGhvZCBkb2VzLiBJbnN0ZWFkLCB1c2Ugb25seSBKUyBvclxyXG4gKiB5b3UgbWlnaHQgZXZlbiBuZWVkIGpRdWVyeS5cclxuICovXHJcblxyXG4oZnVuY3Rpb24oZ2xvYmFsLCBmYWN0b3J5KSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7IC8vIENvbW1vbkpTLWxpa2VcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuICAgIH0gZWxzZSB7IC8vIEJyb3dzZXJcclxuICAgICAgICBpZiAodHlwZW9mIGdsb2JhbC5qUXVlcnkgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICBnbG9iYWwuJCA9IGZhY3RvcnkoKTtcclxuICAgIH1cclxufSh3aW5kb3csIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEhFTFBFUlNcclxuICAgIGZ1bmN0aW9uIGFycmF5RnJvbShvYmopIHtcclxuICAgICAgICByZXR1cm4gKCdsZW5ndGgnIGluIG9iaikgJiYgKG9iaiAhPT0gd2luZG93KSA/IFtdLnNsaWNlLmNhbGwob2JqKSA6IFtvYmpdO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZpbHRlcihjdHgsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdLmZpbHRlci5jYWxsKGN0eCwgZm4pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hcChjdHgsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdLm1hcC5jYWxsKGN0eCwgZm4pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hdGNoZXMoaXRlbSwgc2VsZWN0b3IpIHtcclxuICAgICAgICByZXR1cm4gKEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgfHwgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IpLmNhbGwoaXRlbSwgc2VsZWN0b3IpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gRXZlbnRzIGhhbmRsZXIgd2l0aCBzaW1wbGUgc2NvcGVkIGV2ZW50cyBzdXBwb3J0XHJcbiAgICB2YXIgRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuICAgIH1cclxuICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgLy8gZXZlbnQgYWNjZXB0czogJ2NsaWNrJyBvciAnY2xpY2suc2NvcGUnXHJcbiAgICAgICAgYmluZDogZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyLCB0YXJnZXQpIHtcclxuICAgICAgICAgICAgdmFyIHR5cGUgPSBldmVudC5zcGxpdCgnLicpWzBdO1xyXG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24oZXZlbnQsIHRhcmdldCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQgaW4gdGhpcy5ldmVudHMpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnRzW2V2ZW50XS50eXBlLCB0aGlzLmV2ZW50c1tldmVudF0ubGlzdGVuZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmV2ZW50c1tldmVudF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT2JqZWN0IERlZmluaXRpb25cclxuICAgIHZhciBXcmFwID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKFtdKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDT05TVFJVQ1RPUlxyXG4gICAgV3JhcC5Db25zdHJ1Y3RvciA9IGZ1bmN0aW9uKHBhcmFtLCBhdHRycykge1xyXG4gICAgICAgIHZhciBlbCA9IG5ldyBXcmFwKHBhcmFtKTtcclxuICAgICAgICByZXR1cm4gZWwuaW5pdChhdHRycyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENvcmUgbWV0aG9kc1xyXG4gICAgV3JhcC5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgY29uc3RydWN0b3I6IFdyYXAsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5pdGlhbGl6ZSB0aGUgb2JqZWN0IGRlcGVuZGluZyBvbiBwYXJhbSB0eXBlXHJcbiAgICAgICAgICogW2F0dHJzXSBvbmx5IHRvIGhhbmRsZSAkKGh0bWxTdHJpbmcsIHthdHRyaWJ1dGVzfSlcclxuICAgICAgICAgKi9cclxuICAgICAgICBpbml0OiBmdW5jdGlvbihhdHRycykge1xyXG4gICAgICAgICAgICAvLyBlbXB0eSBvYmplY3RcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9yKSByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgLy8gc2VsZWN0b3IgPT09IHN0cmluZ1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiBsb29rcyBsaWtlIG1hcmt1cCwgdHJ5IHRvIGNyZWF0ZSBhbiBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RvclswXSA9PT0gJzwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW0gPSB0aGlzLl9zZXR1cChbdGhpcy5fY3JlYXRlKHRoaXMuc2VsZWN0b3IpXSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXR0cnMgPyBlbGVtLmF0dHIoYXR0cnMpIDogZWxlbTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXR1cChhcnJheUZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gc2VsZWN0b3IgPT09IERPTUVsZW1lbnRcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3Iubm9kZVR5cGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0dXAoW3RoaXMuc2VsZWN0b3JdKVxyXG4gICAgICAgICAgICBlbHNlIC8vIHNob3J0aGFuZCBmb3IgRE9NUmVhZHlcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5zZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0dXAoW2RvY3VtZW50XSkucmVhZHkodGhpcy5zZWxlY3RvcilcclxuICAgICAgICAgICAgLy8gQXJyYXkgbGlrZSBvYmplY3RzIChlLmcuIE5vZGVMaXN0L0hUTUxDb2xsZWN0aW9uKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0dXAoYXJyYXlGcm9tKHRoaXMuc2VsZWN0b3IpKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhIERPTSBlbGVtZW50IGZyb20gYSBzdHJpbmdcclxuICAgICAgICAgKiBTdHJpY3RseSBzdXBwb3J0cyB0aGUgZm9ybTogJzx0YWc+JyBvciAnPHRhZy8+J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9jcmVhdGU6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICB2YXIgbm9kZU5hbWUgPSBzdHIuc3Vic3RyKHN0ci5pbmRleE9mKCc8JykgKyAxLCBzdHIuaW5kZXhPZignPicpIC0gMSkucmVwbGFjZSgnLycsICcnKVxyXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogc2V0dXAgcHJvcGVydGllcyBhbmQgYXJyYXkgdG8gZWxlbWVudCBzZXQgKi9cclxuICAgICAgICBfc2V0dXA6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICAgICAgZm9yICg7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgZGVsZXRlIHRoaXNbaV07IC8vIGNsZWFuIHVwIG9sZCBzZXRcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB0aGlzW2ldID0gZWxlbWVudHNbaV0gLy8gbmV3IHNldFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9maXJzdDogZnVuY3Rpb24oY2IsIHJldCkge1xyXG4gICAgICAgICAgICB2YXIgZiA9IHRoaXMuZWxlbWVudHNbMF07XHJcbiAgICAgICAgICAgIHJldHVybiBmID8gKGNiID8gY2IuY2FsbCh0aGlzLCBmKSA6IGYpIDogcmV0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIENvbW1vbiBmdW5jdGlvbiBmb3IgY2xhc3MgbWFuaXB1bGF0aW9uICAqL1xyXG4gICAgICAgIF9jbGFzc2VzOiBmdW5jdGlvbihtZXRob2QsIGNsYXNzbmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgY2xzID0gY2xhc3NuYW1lLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgIGlmIChjbHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgY2xzLmZvckVhY2godGhpcy5fY2xhc3Nlcy5iaW5kKHRoaXMsIG1ldGhvZCkpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWV0aG9kID09PSAnY29udGFpbnMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW0gPSB0aGlzLl9maXJzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtID8gZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NuYW1lKSA6IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChjbGFzc25hbWUgPT09ICcnKSA/IHRoaXMgOiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0W21ldGhvZF0oY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE11bHRpIHB1cnBvc2UgZnVuY3Rpb24gdG8gc2V0IG9yIGdldCBhIChrZXksIHZhbHVlKVxyXG4gICAgICAgICAqIElmIG5vIHZhbHVlLCB3b3JrcyBhcyBhIGdldHRlciBmb3IgdGhlIGdpdmVuIGtleVxyXG4gICAgICAgICAqIGtleSBjYW4gYmUgYW4gb2JqZWN0IGluIHRoZSBmb3JtIHtrZXk6IHZhbHVlLCAuLi59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX2FjY2VzczogZnVuY3Rpb24oa2V5LCB2YWx1ZSwgZm4pIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FjY2VzcyhrLCBrZXlba10sIGZuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3QoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbihlbGVtLCBrZXkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBmbihpdGVtLCBrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYWNoOiBmdW5jdGlvbihmbiwgYXJyKSB7XHJcbiAgICAgICAgICAgIGFyciA9IGFyciA/IGFyciA6IHRoaXMuZWxlbWVudHM7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm4uY2FsbChhcnJbaV0sIGksIGFycltpXSkgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWxsb3dzIHRvIGV4dGVuZCB3aXRoIG5ldyBtZXRob2RzICovXHJcbiAgICBXcmFwLmV4dGVuZCA9IGZ1bmN0aW9uKG1ldGhvZHMpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKGZ1bmN0aW9uKG0pIHtcclxuICAgICAgICAgICAgV3JhcC5wcm90b3R5cGVbbV0gPSBtZXRob2RzW21dXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBET00gUkVBRFlcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oZm4pIHtcclxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmF0dGFjaEV2ZW50ID8gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyA6IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJykge1xyXG4gICAgICAgICAgICAgICAgZm4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIEFDQ0VTU1xyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIC8qKiBHZXQgb3Igc2V0IGEgY3NzIHZhbHVlICovXHJcbiAgICAgICAgY3NzOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBnZXRTdHlsZSA9IGZ1bmN0aW9uKGUsIGspIHsgcmV0dXJuIGUuc3R5bGVba10gfHwgZ2V0Q29tcHV0ZWRTdHlsZShlKVtrXTsgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjY2VzcyhrZXksIHZhbHVlLCBmdW5jdGlvbihpdGVtLCBrLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciB1bml0ID0gKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSA/ICdweCcgOiAnJztcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/IGdldFN0eWxlKGl0ZW0sIGspIDogKGl0ZW0uc3R5bGVba10gPSB2YWwgKyB1bml0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBHZXQgYW4gYXR0cmlidXRlIG9yIHNldCBpdCAqL1xyXG4gICAgICAgIGF0dHI6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjY2VzcyhrZXksIHZhbHVlLCBmdW5jdGlvbihpdGVtLCBrLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/IGl0ZW0uZ2V0QXR0cmlidXRlKGspIDogaXRlbS5zZXRBdHRyaWJ1dGUoaywgdmFsKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIEdldCBhIHByb3BlcnR5IG9yIHNldCBpdCAqL1xyXG4gICAgICAgIHByb3A6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjY2VzcyhrZXksIHZhbHVlLCBmdW5jdGlvbihpdGVtLCBrLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/IGl0ZW1ba10gOiAoaXRlbVtrXSA9IHZhbCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwb3NpdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maXJzdChmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsZWZ0OiBlbGVtLm9mZnNldExlZnQsIHRvcDogZWxlbS5vZmZzZXRUb3AgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjcm9sbFRvcDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FjY2Vzcygnc2Nyb2xsVG9wJywgdmFsdWUsIGZ1bmN0aW9uKGl0ZW0sIGssIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCA9PT0gdW5kZWZpbmVkID8gaXRlbVtrXSA6IChpdGVtW2tdID0gdmFsKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIG91dGVySGVpZ2h0OiBmdW5jdGlvbihpbmNsdWRlTWFyZ2luKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maXJzdChmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbnMgPSBpbmNsdWRlTWFyZ2luID8gKHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCwgMTApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tLCAxMCkpIDogMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLm9mZnNldEhlaWdodCArIG1hcmdpbnM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmluZCB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldFxyXG4gICAgICAgICAqIHJlbGF0aXZlIHRvIGl0cyBzaWJsaW5nIGVsZW1lbnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGluZGV4OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0KGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXlGcm9tKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoZWwpXHJcbiAgICAgICAgICAgIH0sIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgLy8gTE9PS1VQXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgY2hpbGRyZW46IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZHMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcyA9IGNoaWxkcy5jb25jYXQobWFwKGl0ZW0uY2hpbGRyZW4sIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVxyXG4gICAgICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBXcmFwLkNvbnN0cnVjdG9yKGNoaWxkcykuZmlsdGVyKHNlbGVjdG9yKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNpYmxpbmdzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHNpYnMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgc2licyA9IHNpYnMuY29uY2F0KGZpbHRlcihpdGVtLnBhcmVudE5vZGUuY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkICE9PSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBXcmFwLkNvbnN0cnVjdG9yKHNpYnMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBwYXJlbnQgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjdXJyZW50IHNldCAqL1xyXG4gICAgICAgIHBhcmVudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXIgPSBtYXAodGhpcy5lbGVtZW50cywgZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IocGFyKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIFJldHVybiBBTEwgcGFyZW50cyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgc2V0ICovXHJcbiAgICAgICAgcGFyZW50czogZnVuY3Rpb24oc2VsZWN0b3IpIHtcclxuICAgICAgICAgICAgdmFyIHBhciA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IGl0ZW0ucGFyZW50RWxlbWVudDsgcDsgcCA9IHAucGFyZW50RWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBwYXIucHVzaChwKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IocGFyKS5maWx0ZXIoc2VsZWN0b3IpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZXQgdGhlIGRlc2NlbmRhbnRzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgc2V0LCBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yXHJcbiAgICAgICAgICogU2VsZWN0b3IgY2FuJ3Qgc3RhcnQgd2l0aCBcIj5cIiAoOnNjb3BlIG5vdCBzdXBwb3J0ZWQgb24gSUUpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZpbmQ6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBmb3VuZCA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IGZvdW5kLmNvbmNhdChtYXAoaXRlbS5xdWVyeVNlbGVjdG9yQWxsKCAvKic6c2NvcGUgJyArICovIHNlbGVjdG9yKSwgZnVuY3Rpb24oZml0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZml0ZW1cclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3Rvcihmb3VuZClcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBmaWx0ZXIgdGhlIGFjdHVhbCBzZXQgYmFzZWQgb24gZ2l2ZW4gc2VsZWN0b3IgKi9cclxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIGlmICghc2VsZWN0b3IpIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgcmVzID0gZmlsdGVyKHRoaXMuZWxlbWVudHMsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzKGl0ZW0sIHNlbGVjdG9yKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvcihyZXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogV29ya3Mgb25seSB3aXRoIGEgc3RyaW5nIHNlbGVjdG9yICovXHJcbiAgICAgICAgaXM6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICEoZm91bmQgPSBtYXRjaGVzKGl0ZW0sIHNlbGVjdG9yKSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy8gRUxFTUVOVFNcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhcHBlbmQgY3VycmVudCBzZXQgdG8gZ2l2ZW4gbm9kZVxyXG4gICAgICAgICAqIGV4cGVjdHMgYSBkb20gbm9kZSBvciBzZXRcclxuICAgICAgICAgKiBpZiBlbGVtZW50IGlzIGEgc2V0LCBwcmVwZW5kcyBvbmx5IHRoZSBmaXJzdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFwcGVuZFRvOiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgIGVsZW0gPSBlbGVtLm5vZGVUeXBlID8gZWxlbSA6IGVsZW0uX2ZpcnN0KClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtLmFwcGVuZENoaWxkKGl0ZW0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQXBwZW5kIGEgZG9tTm9kZSB0byBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldFxyXG4gICAgICAgICAqIGlmIGVsZW1lbnQgaXMgYSBzZXQsIGFwcGVuZCBvbmx5IHRoZSBmaXJzdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFwcGVuZDogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICBlbGVtID0gZWxlbS5ub2RlVHlwZSA/IGVsZW0gOiBlbGVtLl9maXJzdCgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChlbGVtKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluc2VydCB0aGUgY3VycmVudCBzZXQgb2YgZWxlbWVudHMgYWZ0ZXIgdGhlIGVsZW1lbnRcclxuICAgICAgICAgKiB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yIGluIHBhcmFtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaW5zZXJ0QWZ0ZXI6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbSwgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENsb25lcyBhbGwgZWxlbWVudCBpbiB0aGUgc2V0XHJcbiAgICAgICAgICogcmV0dXJucyBhIG5ldyBzZXQgd2l0aCB0aGUgY2xvbmVkIGVsZW1lbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgY2xvbmVzID0gbWFwKHRoaXMuZWxlbWVudHMsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvcihjbG9uZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIFJlbW92ZSBhbGwgbm9kZSBpbiB0aGUgc2V0IGZyb20gRE9NLiAqL1xyXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbS5ldmVudHM7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ucGFyZW50Tm9kZSkgaXRlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGl0ZW0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLl9zZXR1cChbXSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgLy8gREFUQVNFVFNcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeHBlY3RlZCBrZXkgaW4gY2FtZWxDYXNlIGZvcm1hdFxyXG4gICAgICAgICAqIGlmIHZhbHVlIHByb3ZpZGVkIHNhdmUgZGF0YSBpbnRvIGVsZW1lbnQgc2V0XHJcbiAgICAgICAgICogaWYgbm90LCByZXR1cm4gZGF0YSBmb3IgdGhlIGZpcnN0IGVsZW1lbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBoYXNKU09OID0gL14oPzpcXHtbXFx3XFxXXSpcXH18XFxbW1xcd1xcV10qXFxdKSQvLFxyXG4gICAgICAgICAgICAgICAgZGF0YUF0dHIgPSAnZGF0YS0nICsga2V5LnJlcGxhY2UoL1tBLVpdL2csICctJCYnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0KGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsLmRhdGEgJiYgZWwuZGF0YVtrZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuZGF0YVtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGVsLmdldEF0dHJpYnV0ZShkYXRhQXR0cilcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09ICd0cnVlJykgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSAnZmFsc2UnKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSArZGF0YSArICcnKSByZXR1cm4gK2RhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXNKU09OLnRlc3QoZGF0YSkpIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSA9IGl0ZW0uZGF0YSB8fCB7fTtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGFba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgLy8gRVZFTlRTXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICAgICB0eXBlID0gdHlwZS5zcGxpdCgnLicpWzBdOyAvLyBpZ25vcmUgbmFtZXNwYWNlXHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJyk7XHJcbiAgICAgICAgICAgIGV2ZW50LmluaXRFdmVudCh0eXBlLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmlnZ2VyKCdibHVyJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmICghaXRlbS5ldmVudHMpIGl0ZW0uZXZlbnRzID0gbmV3IEV2ZW50SGFuZGxlcigpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5ldmVudHMuYmluZChldiwgY2FsbGJhY2ssIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5ldmVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmV2ZW50cy51bmJpbmQoZXZlbnQsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBpdGVtLmV2ZW50cztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgLy8gQ0xBU1NFU1xyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NsYXNzZXMoJ3RvZ2dsZScsIGNsYXNzbmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRDbGFzczogZnVuY3Rpb24oY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbGFzc2VzKCdhZGQnLCBjbGFzc25hbWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGNsYXNzbmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xhc3NlcygncmVtb3ZlJywgY2xhc3NuYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhhc0NsYXNzOiBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NsYXNzZXMoJ2NvbnRhaW5zJywgY2xhc3NuYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNvbWUgYmFzaWMgZmVhdHVyZXMgaW4gdGhpcyB0ZW1wbGF0ZSByZWxpZXMgb24gQm9vdHN0cmFwXHJcbiAgICAgKiBwbHVnaW5zLCBsaWtlIENvbGxhcHNlLCBEcm9wZG93biBhbmQgVGFiLlxyXG4gICAgICogQmVsb3cgY29kZSBlbXVsYXRlcyBwbHVnaW5zIGJlaGF2aW9yIGJ5IHRvZ2dsaW5nIGNsYXNzZXNcclxuICAgICAqIGZyb20gZWxlbWVudHMgdG8gYWxsb3cgYSBtaW5pbXVtIGludGVyYWN0aW9uIHdpdGhvdXQgYW5pbWF0aW9uLlxyXG4gICAgICogLSBPbmx5IENvbGxhcHNlIGlzIHJlcXVpcmVkIHdoaWNoIGlzIHVzZWQgYnkgdGhlIHNpZGViYXIuXHJcbiAgICAgKiAtIFRhYiBhbmQgRHJvcGRvd24gYXJlIG9wdGlvbmFsIGZlYXR1cmVzLlxyXG4gICAgICovXHJcblxyXG4gICAgLy8gRW11bGF0ZSBqUXVlcnkgc3ltYm9sIHRvIHNpbXBsaWZ5IHVzYWdlXHJcbiAgICB2YXIgJCA9IFdyYXAuQ29uc3RydWN0b3I7XHJcblxyXG4gICAgLy8gRW11bGF0ZXMgQ29sbGFwc2UgcGx1Z2luXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgY29sbGFwc2U6IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoaXRlbSkudHJpZ2dlcihhY3Rpb24gKyAnLmJzLmNvbGxhcHNlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uID09PSAndG9nZ2xlJykgJGl0ZW0uY29sbGFwc2UoJGl0ZW0uaGFzQ2xhc3MoJ3Nob3cnKSA/ICdoaWRlJyA6ICdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlICRpdGVtW2FjdGlvbiA9PT0gJ3Nob3cnID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdzaG93Jyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIEluaXRpYWxpemF0aW9uc1xyXG4gICAgJCgnW2RhdGEtdG9nZ2xlXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIGlmICh0YXJnZXQuaXMoJ2EnKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0LmRhdGEoJ3RvZ2dsZScpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NvbGxhcHNlJzpcclxuICAgICAgICAgICAgICAgICQodGFyZ2V0LmF0dHIoJ2hyZWYnKSkuY29sbGFwc2UoJ3RvZ2dsZScpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RhYic6XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFiUGFuZSA9ICQodGFyZ2V0LmF0dHIoJ2hyZWYnKSk7XHJcbiAgICAgICAgICAgICAgICB0YWJQYW5lLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZSBzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICB0YWJQYW5lLmFkZENsYXNzKCdhY3RpdmUgc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Ryb3Bkb3duJzpcclxuICAgICAgICAgICAgICAgIHZhciBkZCA9IHRhcmdldC5wYXJlbnQoKS50b2dnbGVDbGFzcygnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgZGQuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS50b2dnbGVDbGFzcygnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuXHJcbiAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvclxyXG5cclxufSkpOyIsIi8qIVxyXG4gKlxyXG4gKiBBbmdsZSAtIEJvb3RzdHJhcCBBZG1pbiBUZW1wbGF0ZVxyXG4gKlxyXG4gKiBWZXJzaW9uOiA0LjcuOFxyXG4gKiBBdXRob3I6IEB0aGVtaWNvbl9jb1xyXG4gKiBXZWJzaXRlOiBodHRwOi8vdGhlbWljb24uY29cclxuICogTGljZW5zZTogaHR0cHM6Ly93cmFwYm9vdHN0cmFwLmNvbS9oZWxwL2xpY2Vuc2VzXHJcbiAqXHJcbiAqL1xyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIGJvZHkgY2xhc3Nlc1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xyXG4gICAgICAgIG5ldyBTdGF0ZVRvZ2dsZXIoKS5yZXN0b3JlU3RhdGUoJGJvZHkpO1xyXG5cclxuICAgICAgICAvLyBlbmFibGUgc2V0dGluZ3MgdG9nZ2xlIGFmdGVyIHJlc3RvcmVcclxuICAgICAgICAkKCcjY2hrLWZpeGVkJykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdsYXlvdXQtZml4ZWQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1jb2xsYXBzZWQnKS5wcm9wKCdjaGVja2VkJywgJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWNvbGxhcHNlZCcpKTtcclxuICAgICAgICAkKCcjY2hrLWNvbGxhcHNlZC10ZXh0JykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdhc2lkZS1jb2xsYXBzZWQtdGV4dCcpKTtcclxuICAgICAgICAkKCcjY2hrLWJveGVkJykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdsYXlvdXQtYm94ZWQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1mbG9hdCcpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnYXNpZGUtZmxvYXQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1ob3ZlcicpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnYXNpZGUtaG92ZXInKSk7XHJcblxyXG4gICAgICAgIC8vIFdoZW4gcmVhZHkgZGlzcGxheSB0aGUgb2Zmc2lkZWJhclxyXG4gICAgICAgICQoJy5vZmZzaWRlYmFyLmQtbm9uZScpLnJlbW92ZUNsYXNzKCdkLW5vbmUnKTtcclxuXHJcbiAgICB9KTsgLy8gZG9jIHJlYWR5XHJcblxyXG59KSgpOyIsIi8vIEtub2IgY2hhcnRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRLbm9iKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0S25vYigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmtub2IpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGtub2JMb2FkZXJPcHRpb25zMSA9IHtcclxuICAgICAgICAgICAgd2lkdGg6ICc1MCUnLCAvLyByZXNwb25zaXZlXHJcbiAgICAgICAgICAgIGRpc3BsYXlJbnB1dDogdHJ1ZSxcclxuICAgICAgICAgICAgZmdDb2xvcjogQVBQX0NPTE9SU1snaW5mbyddXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcja25vYi1jaGFydDEnKS5rbm9iKGtub2JMb2FkZXJPcHRpb25zMSk7XHJcblxyXG4gICAgICAgIHZhciBrbm9iTG9hZGVyT3B0aW9uczIgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnNTAlJywgLy8gcmVzcG9uc2l2ZVxyXG4gICAgICAgICAgICBkaXNwbGF5SW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgIGZnQ29sb3I6IEFQUF9DT0xPUlNbJ3B1cnBsZSddLFxyXG4gICAgICAgICAgICByZWFkT25seTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2tub2ItY2hhcnQyJykua25vYihrbm9iTG9hZGVyT3B0aW9uczIpO1xyXG5cclxuICAgICAgICB2YXIga25vYkxvYWRlck9wdGlvbnMzID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogJzUwJScsIC8vIHJlc3BvbnNpdmVcclxuICAgICAgICAgICAgZGlzcGxheUlucHV0OiB0cnVlLFxyXG4gICAgICAgICAgICBmZ0NvbG9yOiBBUFBfQ09MT1JTWydpbmZvJ10sXHJcbiAgICAgICAgICAgIGJnQ29sb3I6IEFQUF9DT0xPUlNbJ2dyYXknXSxcclxuICAgICAgICAgICAgYW5nbGVPZmZzZXQ6IC0xMjUsXHJcbiAgICAgICAgICAgIGFuZ2xlQXJjOiAyNTBcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNrbm9iLWNoYXJ0MycpLmtub2Ioa25vYkxvYWRlck9wdGlvbnMzKTtcclxuXHJcbiAgICAgICAgdmFyIGtub2JMb2FkZXJPcHRpb25zNCA9IHtcclxuICAgICAgICAgICAgd2lkdGg6ICc1MCUnLCAvLyByZXNwb25zaXZlXHJcbiAgICAgICAgICAgIGRpc3BsYXlJbnB1dDogdHJ1ZSxcclxuICAgICAgICAgICAgZmdDb2xvcjogQVBQX0NPTE9SU1sncGluayddLFxyXG4gICAgICAgICAgICBkaXNwbGF5UHJldmlvdXM6IHRydWUsXHJcbiAgICAgICAgICAgIHRoaWNrbmVzczogMC4xLFxyXG4gICAgICAgICAgICBsaW5lQ2FwOiAncm91bmQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcja25vYi1jaGFydDQnKS5rbm9iKGtub2JMb2FkZXJPcHRpb25zNCk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBDaGFydCBKU1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdENoYXJ0SlMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRDaGFydEpTKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIENoYXJ0ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyByYW5kb20gdmFsdWVzIGZvciBkZW1vXHJcbiAgICAgICAgdmFyIHJGYWN0b3IgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gTGluZSBjaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciBsaW5lRGF0YSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseSddLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgRmlyc3QgZGF0YXNldCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDExNCwxMDIsMTg2LDAuMiknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZ2JhKDExNCwxMDIsMTg2LDEpJyxcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgU2Vjb25kIGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgzNSwxODMsMjI5LDAuMiknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZ2JhKDM1LDE4MywyMjksMSknLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW3JGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKV1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbGluZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGxpbmVjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnRqcy1saW5lY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciBsaW5lQ2hhcnQgPSBuZXcgQ2hhcnQobGluZWN0eCwge1xyXG4gICAgICAgICAgICBkYXRhOiBsaW5lRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBsaW5lT3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCYXIgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgYmFyRGF0YSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseSddLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMyM2I3ZTUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMjNiN2U1JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyM1ZDljZWMnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjNWQ5Y2VjJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGJhck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGJhcmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydGpzLWJhcmNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgYmFyQ2hhcnQgPSBuZXcgQ2hhcnQoYmFyY3R4LCB7XHJcbiAgICAgICAgICAgIGRhdGE6IGJhckRhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdiYXInLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBiYXJPcHRpb25zXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vICBEb3VnaG51dCBjaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciBkb3VnaG51dERhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogW1xyXG4gICAgICAgICAgICAgICAgJ1B1cnBsZScsXHJcbiAgICAgICAgICAgICAgICAnWWVsbG93JyxcclxuICAgICAgICAgICAgICAgICdCbHVlJ1xyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFszMDAsIDUwLCAxMDBdLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAgICAgICAgICAgICAnIzIzYjdlNSdcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAgICAgICAgICAgICAnI2ZhZDczMicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyMyM2I3ZTUnXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGRvdWdobnV0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZG91Z2hudXRjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnRqcy1kb3VnaG51dGNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgZG91Z2hudXRDaGFydCA9IG5ldyBDaGFydChkb3VnaG51dGN0eCwge1xyXG4gICAgICAgICAgICBkYXRhOiBkb3VnaG51dERhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdkb3VnaG51dCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IGRvdWdobnV0T3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBQaWUgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgcGllRGF0YSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbXHJcbiAgICAgICAgICAgICAgICAnUHVycGxlJyxcclxuICAgICAgICAgICAgICAgICdZZWxsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ0JsdWUnXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGRhdGFzZXRzOiBbe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogWzMwMCwgNTAsIDEwMF0sXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFtcclxuICAgICAgICAgICAgICAgICAgICAnIzcyNjZiYScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyNmYWQ3MzInLFxyXG4gICAgICAgICAgICAgICAgICAgICcjMjNiN2U1J1xyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAgICAgICAgICAgICAnIzIzYjdlNSdcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcGllT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgcGllY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0anMtcGllY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciBwaWVDaGFydCA9IG5ldyBDaGFydChwaWVjdHgsIHtcclxuICAgICAgICAgICAgZGF0YTogcGllRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ3BpZScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHBpZU9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUG9sYXIgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgcG9sYXJEYXRhID0ge1xyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgICAgICAgICAxMSxcclxuICAgICAgICAgICAgICAgICAgICAxNixcclxuICAgICAgICAgICAgICAgICAgICA3LFxyXG4gICAgICAgICAgICAgICAgICAgIDNcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFtcclxuICAgICAgICAgICAgICAgICAgICAnI2Y1MzJlNScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZjUzMmU1JyxcclxuICAgICAgICAgICAgICAgICAgICAnIzcyNjZiYSdcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IGRhdGFzZXQnIC8vIGZvciBsZWdlbmRcclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIGxhYmVsczogW1xyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDEnLFxyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDInLFxyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDMnLFxyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDQnXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcG9sYXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBwb2xhcmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydGpzLXBvbGFyY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciBwb2xhckNoYXJ0ID0gbmV3IENoYXJ0KHBvbGFyY3R4LCB7XHJcbiAgICAgICAgICAgIGRhdGE6IHBvbGFyRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ3BvbGFyQXJlYScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHBvbGFyT3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSYWRhciBjaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciByYWRhckRhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWydFYXRpbmcnLCAnRHJpbmtpbmcnLCAnU2xlZXBpbmcnLCAnRGVzaWduaW5nJywgJ0NvZGluZycsICdDeWNsaW5nJywgJ1J1bm5pbmcnXSxcclxuICAgICAgICAgICAgZGF0YXNldHM6IFt7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IEZpcnN0IGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgxMTQsMTAyLDE4NiwwLjIpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSgxMTQsMTAyLDE4NiwxKScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbNjUsIDU5LCA5MCwgODEsIDU2LCA1NSwgNDBdXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgU2Vjb25kIGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgxNTEsMTg3LDIwNSwwLjIpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSgxNTEsMTg3LDIwNSwxKScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbMjgsIDQ4LCA0MCwgMTksIDk2LCAyNywgMTAwXVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciByYWRhck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHJhZGFyY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0anMtcmFkYXJjaGFydCcpLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdmFyIHJhZGFyQ2hhcnQgPSBuZXcgQ2hhcnQocmFkYXJjdHgsIHtcclxuICAgICAgICAgICAgZGF0YTogcmFkYXJEYXRhLFxyXG4gICAgICAgICAgICB0eXBlOiAncmFkYXInLFxyXG4gICAgICAgICAgICBvcHRpb25zOiByYWRhck9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIENoYXJ0aXN0XHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q2hhcnRpc3RzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q2hhcnRpc3RzKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIENoYXJ0aXN0ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBCYXIgYmlwb2xhclxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgdmFyIGRhdGExID0ge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnVzEnLCAnVzInLCAnVzMnLCAnVzQnLCAnVzUnLCAnVzYnLCAnVzcnLCAnVzgnLCAnVzknLCAnVzEwJ10sXHJcbiAgICAgICAgICAgIHNlcmllczogW1xyXG4gICAgICAgICAgICAgICAgWzEsIDIsIDQsIDgsIDYsIC0yLCAtMSwgLTQsIC02LCAtMl1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zMSA9IHtcclxuICAgICAgICAgICAgaGlnaDogMTAsXHJcbiAgICAgICAgICAgIGxvdzogLTEwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI4MCxcclxuICAgICAgICAgICAgYXhpc1g6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ICUgMiA9PT0gMCA/IHZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG5ldyBDaGFydGlzdC5CYXIoJyNjdC1iYXIxJywgZGF0YTEsIG9wdGlvbnMxKTtcclxuXHJcbiAgICAgICAgLy8gQmFyIEhvcml6b250YWxcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIG5ldyBDaGFydGlzdC5CYXIoJyNjdC1iYXIyJywge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXSxcclxuICAgICAgICAgICAgc2VyaWVzOiBbXHJcbiAgICAgICAgICAgICAgICBbNSwgNCwgMywgNywgNSwgMTAsIDNdLFxyXG4gICAgICAgICAgICAgICAgWzMsIDIsIDksIDUsIDQsIDYsIDRdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHNlcmllc0JhckRpc3RhbmNlOiAxMCxcclxuICAgICAgICAgICAgcmV2ZXJzZURhdGE6IHRydWUsXHJcbiAgICAgICAgICAgIGhvcml6b250YWxCYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI4MCxcclxuICAgICAgICAgICAgYXhpc1k6IHtcclxuICAgICAgICAgICAgICAgIG9mZnNldDogNzBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBMaW5lXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBuZXcgQ2hhcnRpc3QuTGluZSgnI2N0LWxpbmUxJywge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheSddLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFtcclxuICAgICAgICAgICAgICAgIFsxMiwgOSwgNywgOCwgNV0sXHJcbiAgICAgICAgICAgICAgICBbMiwgMSwgMy41LCA3LCAzXSxcclxuICAgICAgICAgICAgICAgIFsxLCAzLCA0LCA1LCA2XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjgwLFxyXG4gICAgICAgICAgICBjaGFydFBhZGRpbmc6IHtcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiA0MFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAvLyBTVkcgQW5pbWF0aW9uXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0MSA9IG5ldyBDaGFydGlzdC5MaW5lKCcjY3QtbGluZTMnLCB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWydNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFtcclxuICAgICAgICAgICAgICAgIFsxLCA1LCAyLCA1LCA0LCAzXSxcclxuICAgICAgICAgICAgICAgIFsyLCAzLCA0LCA4LCAxLCAyXSxcclxuICAgICAgICAgICAgICAgIFs1LCA0LCAzLCAyLCAxLCAwLjVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxvdzogMCxcclxuICAgICAgICAgICAgc2hvd0FyZWE6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dQb2ludDogZmFsc2UsXHJcbiAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAzMDBcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY2hhcnQxLm9uKCdkcmF3JywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnbGluZScgfHwgZGF0YS50eXBlID09PSAnYXJlYScpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiAyMDAwICogZGF0YS5pbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyOiAyMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnBhdGguY2xvbmUoKS5zY2FsZSgxLCAwKS50cmFuc2xhdGUoMCwgZGF0YS5jaGFydFJlY3QuaGVpZ2h0KCkpLnN0cmluZ2lmeSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogZGF0YS5wYXRoLmNsb25lKCkuc3RyaW5naWZ5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogQ2hhcnRpc3QuU3ZnLkVhc2luZy5lYXNlT3V0UXVpbnRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgLy8gU2xpbSBhbmltYXRpb25cclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJyNjdC1saW5lMicsIHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzEwJywgJzExJywgJzEyJ10sXHJcbiAgICAgICAgICAgIHNlcmllczogW1xyXG4gICAgICAgICAgICAgICAgWzEyLCA5LCA3LCA4LCA1LCA0LCA2LCAyLCAzLCAzLCA0LCA2XSxcclxuICAgICAgICAgICAgICAgIFs0LCA1LCAzLCA3LCAzLCA1LCA1LCAzLCA0LCA0LCA1LCA1XSxcclxuICAgICAgICAgICAgICAgIFs1LCAzLCA0LCA1LCA2LCAzLCAzLCA0LCA1LCA2LCAzLCA0XSxcclxuICAgICAgICAgICAgICAgIFszLCA0LCA1LCA2LCA3LCA2LCA0LCA1LCA2LCA3LCA2LCAzXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsb3c6IDAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMzAwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIExldCdzIHB1dCBhIHNlcXVlbmNlIG51bWJlciBhc2lkZSBzbyB3ZSBjYW4gdXNlIGl0IGluIHRoZSBldmVudCBjYWxsYmFja3NcclxuICAgICAgICB2YXIgc2VxID0gMCxcclxuICAgICAgICAgICAgZGVsYXlzID0gODAsXHJcbiAgICAgICAgICAgIGR1cmF0aW9ucyA9IDUwMDtcclxuXHJcbiAgICAgICAgLy8gT25jZSB0aGUgY2hhcnQgaXMgZnVsbHkgY3JlYXRlZCB3ZSByZXNldCB0aGUgc2VxdWVuY2VcclxuICAgICAgICBjaGFydC5vbignY3JlYXRlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXEgPSAwO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBPbiBlYWNoIGRyYXduIGVsZW1lbnQgYnkgQ2hhcnRpc3Qgd2UgdXNlIHRoZSBDaGFydGlzdC5TdmcgQVBJIHRvIHRyaWdnZXIgU01JTCBhbmltYXRpb25zXHJcbiAgICAgICAgY2hhcnQub24oJ2RyYXcnLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIHNlcSsrO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ2xpbmUnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZHJhd24gZWxlbWVudCBpcyBhIGxpbmUgd2UgZG8gYSBzaW1wbGUgb3BhY2l0eSBmYWRlIGluLiBUaGlzIGNvdWxkIGFsc28gYmUgYWNoaWV2ZWQgdXNpbmcgQ1NTMyBhbmltYXRpb25zLlxyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGRlbGF5IHdoZW4gd2UgbGlrZSB0byBzdGFydCB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMgKyAxMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdmFsdWUgd2hlcmUgdGhlIGFuaW1hdGlvbiBzaG91bGQgc3RhcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHZhbHVlIHdoZXJlIGl0IHNob3VsZCBlbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdsYWJlbCcgJiYgZGF0YS5heGlzID09PSAneCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnkgKyAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBkYXRhLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGNhbiBzcGVjaWZ5IGFuIGVhc2luZyBmdW5jdGlvbiBmcm9tIENoYXJ0aXN0LlN2Zy5FYXNpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ2xhYmVsJyAmJiBkYXRhLmF4aXMgPT09ICd5Jykge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyOiBkdXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGRhdGEueCAtIDEwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGRhdGEueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ3BvaW50Jykge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHgxOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnggLSAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGRhdGEueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeDI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyOiBkdXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGRhdGEueCAtIDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogZGF0YS54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhcnQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ2dyaWQnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBVc2luZyBkYXRhLmF4aXMgd2UgZ2V0IHggb3IgeSB3aGljaCB3ZSBjYW4gdXNlIHRvIGNvbnN0cnVjdCBvdXIgYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgdmFyIHBvczFBbmltYXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMSddIC0gMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG86IGRhdGFbZGF0YS5heGlzLnVuaXRzLnBvcyArICcxJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcG9zMkFuaW1hdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb206IGRhdGFbZGF0YS5heGlzLnVuaXRzLnBvcyArICcyJ10gLSAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG86IGRhdGFbZGF0YS5heGlzLnVuaXRzLnBvcyArICcyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgYW5pbWF0aW9ucyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uc1tkYXRhLmF4aXMudW5pdHMucG9zICsgJzEnXSA9IHBvczFBbmltYXRpb247XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25zW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMiddID0gcG9zMkFuaW1hdGlvbjtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbnNbJ29wYWNpdHknXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb206IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG86IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLmVsZW1lbnQuYW5pbWF0ZShhbmltYXRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBGb3IgdGhlIHNha2Ugb2YgdGhlIGV4YW1wbGUgd2UgdXBkYXRlIHRoZSBjaGFydCBldmVyeSB0aW1lIGl0J3MgY3JlYXRlZCB3aXRoIGEgZGVsYXkgb2YgMTAgc2Vjb25kc1xyXG4gICAgICAgIGNoYXJ0Lm9uKCdjcmVhdGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuX19leGFtcGxlQW5pbWF0ZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh3aW5kb3cuX19leGFtcGxlQW5pbWF0ZVRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93Ll9fZXhhbXBsZUFuaW1hdGVUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aW5kb3cuX19leGFtcGxlQW5pbWF0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGNoYXJ0LnVwZGF0ZS5iaW5kKGNoYXJ0KSwgMTIwMDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRWFzeXBpZSBjaGFydCBMb2FkZXJcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRFYXN5UGllQ2hhcnQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRFYXN5UGllQ2hhcnQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5lYXN5UGllQ2hhcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVXNhZ2UgdmlhIGRhdGEgYXR0cmlidXRlc1xyXG4gICAgICAgIC8vIDxkaXYgY2xhc3M9XCJlYXN5cGllLWNoYXJ0XCIgZGF0YS1lYXN5cGllY2hhcnQgZGF0YS1wZXJjZW50PVwiWFwiIGRhdGEtb3B0aW9uTmFtZT1cInZhbHVlXCI+PC9kaXY+XHJcbiAgICAgICAgJCgnW2RhdGEtZWFzeXBpZWNoYXJ0XScpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gJGVsZW0uZGF0YSgpO1xyXG4gICAgICAgICAgICAkZWxlbS5lYXN5UGllQ2hhcnQob3B0aW9ucyB8fCB7fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHByb2dyYW1tYXRpYyB1c2FnZVxyXG4gICAgICAgIHZhciBwaWVPcHRpb25zMSA9IHtcclxuICAgICAgICAgICAgYW5pbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmFyQ29sb3I6IEFQUF9DT0xPUlNbJ3N1Y2Nlc3MnXSxcclxuICAgICAgICAgICAgdHJhY2tDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjYWxlQ29sb3I6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5lV2lkdGg6IDEwLFxyXG4gICAgICAgICAgICBsaW5lQ2FwOiAnY2lyY2xlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2Vhc3lwaWUxJykuZWFzeVBpZUNoYXJ0KHBpZU9wdGlvbnMxKTtcclxuXHJcbiAgICAgICAgdmFyIHBpZU9wdGlvbnMyID0ge1xyXG4gICAgICAgICAgICBhbmltYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogODAwLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiYXJDb2xvcjogQVBQX0NPTE9SU1snd2FybmluZyddLFxyXG4gICAgICAgICAgICB0cmFja0NvbG9yOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NhbGVDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogNCxcclxuICAgICAgICAgICAgbGluZUNhcDogJ2NpcmNsZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNlYXN5cGllMicpLmVhc3lQaWVDaGFydChwaWVPcHRpb25zMik7XHJcblxyXG4gICAgICAgIHZhciBwaWVPcHRpb25zMyA9IHtcclxuICAgICAgICAgICAgYW5pbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmFyQ29sb3I6IEFQUF9DT0xPUlNbJ2RhbmdlciddLFxyXG4gICAgICAgICAgICB0cmFja0NvbG9yOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NhbGVDb2xvcjogQVBQX0NPTE9SU1snZ3JheSddLFxyXG4gICAgICAgICAgICBsaW5lV2lkdGg6IDE1LFxyXG4gICAgICAgICAgICBsaW5lQ2FwOiAnY2lyY2xlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2Vhc3lwaWUzJykuZWFzeVBpZUNoYXJ0KHBpZU9wdGlvbnMzKTtcclxuXHJcbiAgICAgICAgdmFyIHBpZU9wdGlvbnM0ID0ge1xyXG4gICAgICAgICAgICBhbmltYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogODAwLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiYXJDb2xvcjogQVBQX0NPTE9SU1snZGFuZ2VyJ10sXHJcbiAgICAgICAgICAgIHRyYWNrQ29sb3I6IEFQUF9DT0xPUlNbJ3llbGxvdyddLFxyXG4gICAgICAgICAgICBzY2FsZUNvbG9yOiBBUFBfQ09MT1JTWydncmF5LWRhcmsnXSxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiAxNSxcclxuICAgICAgICAgICAgbGluZUNhcDogJ2NpcmNsZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNlYXN5cGllNCcpLmVhc3lQaWVDaGFydChwaWVPcHRpb25zNCk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBDSEFSVCBTUExJTkVcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEZsb3RTcGxpbmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90U3BsaW5lKCkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJVbmlxdWVzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNzY4Mjk0XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDg1XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCA1OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgOTNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDY2XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA4Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNjBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJSZWN1cnJlbnRcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiMxZjkyZmVcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCAyMV0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMTJdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDI3XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCAyNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDM5XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCAxNV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgZGF0YXYyID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkhvdXJzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjMjNiN2U1XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDIwXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA3MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgODVdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDU5XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA5M10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgNjZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDg2XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA2MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgNjBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDEyXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCA1MF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNvbW1pdHNcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM3MjY2YmFcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIkphblwiLCAyMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJGZWJcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDMwXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCA1MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgODVdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDQzXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCA5Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMzZdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDgwXSxcclxuICAgICAgICAgICAgICAgIFtcIk9jdFwiLCAxMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJOb3ZcIiwgNzJdLFxyXG4gICAgICAgICAgICAgICAgW1wiRGVjXCIsIDMxXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBkYXRhdjMgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiSG9tZVwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzFiYTNjZFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiMVwiLCAzOF0sXHJcbiAgICAgICAgICAgICAgICBbXCIyXCIsIDQwXSxcclxuICAgICAgICAgICAgICAgIFtcIjNcIiwgNDJdLFxyXG4gICAgICAgICAgICAgICAgW1wiNFwiLCA0OF0sXHJcbiAgICAgICAgICAgICAgICBbXCI1XCIsIDUwXSxcclxuICAgICAgICAgICAgICAgIFtcIjZcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiN1wiLCAxNDVdLFxyXG4gICAgICAgICAgICAgICAgW1wiOFwiLCA3MF0sXHJcbiAgICAgICAgICAgICAgICBbXCI5XCIsIDU5XSxcclxuICAgICAgICAgICAgICAgIFtcIjEwXCIsIDQ4XSxcclxuICAgICAgICAgICAgICAgIFtcIjExXCIsIDM4XSxcclxuICAgICAgICAgICAgICAgIFtcIjEyXCIsIDI5XSxcclxuICAgICAgICAgICAgICAgIFtcIjEzXCIsIDMwXSxcclxuICAgICAgICAgICAgICAgIFtcIjE0XCIsIDIyXSxcclxuICAgICAgICAgICAgICAgIFtcIjE1XCIsIDI4XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiT3ZlcmFsbFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzNhM2Y1MVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiMVwiLCAxNl0sXHJcbiAgICAgICAgICAgICAgICBbXCIyXCIsIDE4XSxcclxuICAgICAgICAgICAgICAgIFtcIjNcIiwgMTddLFxyXG4gICAgICAgICAgICAgICAgW1wiNFwiLCAxNl0sXHJcbiAgICAgICAgICAgICAgICBbXCI1XCIsIDMwXSxcclxuICAgICAgICAgICAgICAgIFtcIjZcIiwgMTEwXSxcclxuICAgICAgICAgICAgICAgIFtcIjdcIiwgMTldLFxyXG4gICAgICAgICAgICAgICAgW1wiOFwiLCAxOF0sXHJcbiAgICAgICAgICAgICAgICBbXCI5XCIsIDExMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMFwiLCAxOV0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMVwiLCAxNl0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMlwiLCAxMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxM1wiLCAyMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxNFwiLCAxMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxNVwiLCAyMF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgc2VyaWVzOiB7XHJcbiAgICAgICAgICAgICAgICBsaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzcGxpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB0ZW5zaW9uOiAwLjQsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuNVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDE1MCwgLy8gb3B0aW9uYWw6IHVzZSBpdCBmb3IgYSBjbGVhciByZXByZXNldGF0aW9uXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIC8vcG9zaXRpb246ICdyaWdodCcgb3IgJ2xlZnQnLFxyXG4gICAgICAgICAgICAgICAgdGlja0Zvcm1hdHRlcjogZnVuY3Rpb24odikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2IC8qICsgJyB2aXNpdG9ycycqLyA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtc3BsaW5lJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0djIgPSAkKCcuY2hhcnQtc3BsaW5ldjInKTtcclxuICAgICAgICBpZiAoY2hhcnR2Mi5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydHYyLCBkYXRhdjIsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB2YXIgY2hhcnR2MyA9ICQoJy5jaGFydC1zcGxpbmV2MycpO1xyXG4gICAgICAgIGlmIChjaGFydHYzLmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0djMsIGRhdGF2Mywgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIENIQVJUIEFSRUFcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90QXJlYSlcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdEFyZWEoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlVuaXF1ZXNcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNhYWQ4NzRcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA1MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgODRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDUyXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA4OF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgNjldLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDkyXSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA1OF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlJlY3VycmVudFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzdkYzdkZlwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDEzXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCA0NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDI3XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAzOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMTFdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDM5XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIGxpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAwLjhcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwb2ludHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uOiAncmlnaHQnIG9yICdsZWZ0J1xyXG4gICAgICAgICAgICAgICAgdGlja0Zvcm1hdHRlcjogZnVuY3Rpb24odikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2ICsgJyB2aXNpdG9ycyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtYXJlYScpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIENIQVJUIEJBUlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAgICQoaW5pdEZsb3RCYXIpXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZsb3RCYXIoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNhbGVzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjOWNkMTU5XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgMjddLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDgyXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA1Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDI4XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA3N10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMjNdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA4MV0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgMjBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgYmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aDogMC42LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuOVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtYmFyJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbi8vIENIQVJUIEJBUiBTVEFDS0VEXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gICAgJChpbml0RmxvdEJhclN0YWNrZWQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90QmFyU3RhY2tlZCgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiVHdlZXRzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNTFiZmYyXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgNTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDgxXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA5N10sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDI0XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA4NV0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgOTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDc4XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA1Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgMTddLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDkwXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCA2Ml1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkxpa2VzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNGE4ZWYxXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgNjldLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDEzNV0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgMTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDEwMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgMTAwXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA2Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMTE1XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCAyMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgMTA0XSxcclxuICAgICAgICAgICAgICAgIFtcIk9jdFwiLCAxMzJdLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDcyXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCA2MV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIisxXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZjA2OTNhXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgMjldLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDM2XSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA0N10sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDVdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAzN10sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDI4XSxcclxuICAgICAgICAgICAgICAgIFtcIk9jdFwiLCA5XSxcclxuICAgICAgICAgICAgICAgIFtcIk5vdlwiLCAxMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJEZWNcIiwgMzVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGF2MiA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJQZW5kaW5nXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjOTI4OWNhXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJQajFcIiwgODZdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoyXCIsIDEzNl0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajNcIiwgOTddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo0XCIsIDExMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajVcIiwgNjJdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo2XCIsIDg1XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqN1wiLCAxMTVdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo4XCIsIDc4XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqOVwiLCAxMDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMFwiLCA4Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajExXCIsIDk3XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTJcIiwgMTEwXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTNcIiwgNjJdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJBc3NpZ25lZFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzcyNjZiYVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiUGoxXCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMlwiLCA4MV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajNcIiwgNDddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo0XCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNVwiLCAxMDBdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo2XCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqN1wiLCA5NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajhcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo5XCIsIDUyXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTBcIiwgMTddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMVwiLCA0N10sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEyXCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTNcIiwgMTAwXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQ29tcGxldGVkXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNTY0YWEzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJQajFcIiwgMjldLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoyXCIsIDU2XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqM1wiLCAxNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajRcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo1XCIsIDVdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo2XCIsIDI0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqN1wiLCAzN10sXHJcbiAgICAgICAgICAgICAgICBbXCJQajhcIiwgMjJdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo5XCIsIDI4XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTBcIiwgOV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajExXCIsIDE0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTJcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxM1wiLCA1XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIHN0YWNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aDogMC42LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuOVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtYmFyLXN0YWNrZWQnKTtcclxuICAgICAgICBpZiAoY2hhcnQubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnQsIGRhdGEsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB2YXIgY2hhcnR2MiA9ICQoJy5jaGFydC1iYXItc3RhY2tlZHYyJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0djIubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnR2MiwgZGF0YXYyLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuLy8gQ0hBUlQgRE9OVVRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90RG9udXQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90RG9udXQoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiMzOUM1NThcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDYwLFxyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQ29mZmVlXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjMDBiNGZmXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA5MCxcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNTU1wiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI0ZGQkU0MVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogNTAsXHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJMRVNTXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZmYzZTQzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA4MCxcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkphZGVcIlxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM5MzdmYzdcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDExNixcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkFuZ3VsYXJKU1wiXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIHBpZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJSYWRpdXM6IDAuNSAvLyBUaGlzIG1ha2VzIHRoZSBkb251dCBzaGFwZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LWRvbnV0Jyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuLy8gQ0hBUlQgTElORVxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAgICQoaW5pdEZsb3RMaW5lKVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90TGluZSgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQ29tcGxldGVcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1YWIxZWZcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIkphblwiLCAxODhdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDE4M10sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgMTg1XSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCAxOTldLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDE5MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgMTk0XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAxOTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDE4NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNzRdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJJbiBQcm9ncmVzc1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2Y1OTk0ZVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDE1M10sXHJcbiAgICAgICAgICAgICAgICBbXCJGZWJcIiwgMTE2XSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCAxMzZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDExOV0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgMTQ4XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCAxMzNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDExOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMTYxXSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA1OV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNhbmNlbGxlZFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2Q4N2E4MFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDExMV0sXHJcbiAgICAgICAgICAgICAgICBbXCJGZWJcIiwgOTddLFxyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDkzXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCAxMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDEwMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgOTNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDkyXSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA5Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNDRdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgbGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuMDFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwb2ludHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtbGluZScpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4vLyBDSEFSVCBQSUVcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90UGllKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdFBpZSgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwialF1ZXJ5XCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNGFjYWI0XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiAzMFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNTU1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2ZmZWE4OFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogNDBcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJMRVNTXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZmY4MTUzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA5MFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNBU1NcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM4NzhiYjZcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDc1XHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiSmFkZVwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2IyZDc2N1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogMTIwXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIHBpZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJSYWRpdXM6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24obGFiZWwsIHNlcmllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZmxvdC1waWUtbGFiZWxcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xhYmVsICsgJyA6ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQoc2VyaWVzLnBlcmNlbnQpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJTwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzIyMidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjaGFydCA9ICQoJy5jaGFydC1waWUnKTtcclxuICAgICAgICBpZiAoY2hhcnQubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnQsIGRhdGEsIG9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTW9ycmlzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0TW9ycmlzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TW9ycmlzKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIE1vcnJpcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ZGF0YSA9IFtcclxuICAgICAgICAgICAgeyB5OiBcIjIwMDZcIiwgYTogMTAwLCBiOiA5MCB9LFxyXG4gICAgICAgICAgICB7IHk6IFwiMjAwN1wiLCBhOiA3NSwgYjogNjUgfSxcclxuICAgICAgICAgICAgeyB5OiBcIjIwMDhcIiwgYTogNTAsIGI6IDQwIH0sXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDA5XCIsIGE6IDc1LCBiOiA2NSB9LFxyXG4gICAgICAgICAgICB7IHk6IFwiMjAxMFwiLCBhOiA1MCwgYjogNDAgfSxcclxuICAgICAgICAgICAgeyB5OiBcIjIwMTFcIiwgYTogNzUsIGI6IDY1IH0sXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDEyXCIsIGE6IDEwMCwgYjogOTAgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHZhciBkb251dGRhdGEgPSBbXHJcbiAgICAgICAgICAgIHsgbGFiZWw6IFwiRG93bmxvYWQgU2FsZXNcIiwgdmFsdWU6IDEyIH0sXHJcbiAgICAgICAgICAgIHsgbGFiZWw6IFwiSW4tU3RvcmUgU2FsZXNcIiwgdmFsdWU6IDMwIH0sXHJcbiAgICAgICAgICAgIHsgbGFiZWw6IFwiTWFpbC1PcmRlciBTYWxlc1wiLCB2YWx1ZTogMjAgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIC8vIExpbmUgQ2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICBuZXcgTW9ycmlzLkxpbmUoe1xyXG4gICAgICAgICAgICBlbGVtZW50OiAnbW9ycmlzLWxpbmUnLFxyXG4gICAgICAgICAgICBkYXRhOiBjaGFydGRhdGEsXHJcbiAgICAgICAgICAgIHhrZXk6ICd5JyxcclxuICAgICAgICAgICAgeWtleXM6IFtcImFcIiwgXCJiXCJdLFxyXG4gICAgICAgICAgICBsYWJlbHM6IFtcIlNlcmllIEFcIiwgXCJTZXJpZSBCXCJdLFxyXG4gICAgICAgICAgICBsaW5lQ29sb3JzOiBbXCIjMzFDMEJFXCIsIFwiIzdhOTJhM1wiXSxcclxuICAgICAgICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERvbnV0IENoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBuZXcgTW9ycmlzLkRvbnV0KHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1kb251dCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGRvbnV0ZGF0YSxcclxuICAgICAgICAgICAgY29sb3JzOiBbJyNmMDUwNTAnLCAnI2ZhZDczMicsICcjZmY5MDJiJ10sXHJcbiAgICAgICAgICAgIHJlc2l6ZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCYXIgQ2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIG5ldyBNb3JyaXMuQmFyKHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1iYXInLFxyXG4gICAgICAgICAgICBkYXRhOiBjaGFydGRhdGEsXHJcbiAgICAgICAgICAgIHhrZXk6ICd5JyxcclxuICAgICAgICAgICAgeWtleXM6IFtcImFcIiwgXCJiXCJdLFxyXG4gICAgICAgICAgICBsYWJlbHM6IFtcIlNlcmllcyBBXCIsIFwiU2VyaWVzIEJcIl0sXHJcbiAgICAgICAgICAgIHhMYWJlbE1hcmdpbjogMixcclxuICAgICAgICAgICAgYmFyQ29sb3JzOiBbJyMyM2I3ZTUnLCAnI2YwNTA1MCddLFxyXG4gICAgICAgICAgICByZXNpemU6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXJlYSBDaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgbmV3IE1vcnJpcy5BcmVhKHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1hcmVhJyxcclxuICAgICAgICAgICAgZGF0YTogY2hhcnRkYXRhLFxyXG4gICAgICAgICAgICB4a2V5OiAneScsXHJcbiAgICAgICAgICAgIHlrZXlzOiBbXCJhXCIsIFwiYlwiXSxcclxuICAgICAgICAgICAgbGFiZWxzOiBbXCJTZXJpZSBBXCIsIFwiU2VyaWUgQlwiXSxcclxuICAgICAgICAgICAgbGluZUNvbG9yczogWycjNzI2NmJhJywgJyMyM2I3ZTUnXSxcclxuICAgICAgICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBSaWNrc2hhd1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE1vcnJpcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1vcnJpcygpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBSaWNrc2hhdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIHNlcmllc0RhdGEgPSBbXHJcbiAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgW11cclxuICAgICAgICBdO1xyXG4gICAgICAgIHZhciByYW5kb20gPSBuZXcgUmlja3NoYXcuRml4dHVyZXMuUmFuZG9tRGF0YSgxNTApO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE1MDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJhbmRvbS5hZGREYXRhKHNlcmllc0RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHNlcmllczEgPSBbe1xyXG4gICAgICAgICAgICBjb2xvcjogXCIjYzA1MDIwXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHNlcmllc0RhdGFbMF0sXHJcbiAgICAgICAgICAgIG5hbWU6ICdOZXcgWW9yaydcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiMzMGMwMjBcIixcclxuICAgICAgICAgICAgZGF0YTogc2VyaWVzRGF0YVsxXSxcclxuICAgICAgICAgICAgbmFtZTogJ0xvbmRvbidcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiM2MDYwYzBcIixcclxuICAgICAgICAgICAgZGF0YTogc2VyaWVzRGF0YVsyXSxcclxuICAgICAgICAgICAgbmFtZTogJ1Rva3lvJ1xyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgZ3JhcGgxID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcclxuICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyaWNrc2hhdzFcIiksXHJcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzMSxcclxuICAgICAgICAgICAgcmVuZGVyZXI6ICdhcmVhJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBncmFwaDEucmVuZGVyKCk7XHJcblxyXG5cclxuICAgICAgICAvLyBHcmFwaCAyXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIGdyYXBoMiA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmlja3NoYXcyXCIpLFxyXG4gICAgICAgICAgICByZW5kZXJlcjogJ2FyZWEnLFxyXG4gICAgICAgICAgICBzdHJva2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNlcmllczogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNmMDUwNTAnXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNmYWQ3MzInXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyYXBoMi5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gR3JhcGggM1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgICAgICB2YXIgZ3JhcGgzID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcclxuICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyaWNrc2hhdzNcIiksXHJcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnbGluZScsXHJcbiAgICAgICAgICAgIHNlcmllczogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM3MjY2YmEnXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDIwIH0sIHsgeDogMSwgeTogMjQgfSwgeyB4OiAyLCB5OiAxOSB9LCB7IHg6IDMsIHk6IDE1IH0sIHsgeDogNCwgeTogMTYgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMyM2I3ZTUnXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JhcGgzLnJlbmRlcigpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gR3JhcGggNFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgICAgICB2YXIgZ3JhcGg0ID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcclxuICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyaWNrc2hhdzRcIiksXHJcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnYmFyJyxcclxuICAgICAgICAgICAgc2VyaWVzOiBbe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogW3sgeDogMCwgeTogNDAgfSwgeyB4OiAxLCB5OiA0OSB9LCB7IHg6IDIsIHk6IDM4IH0sIHsgeDogMywgeTogMzAgfSwgeyB4OiA0LCB5OiAzMiB9XSxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnI2ZhZDczMidcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogW3sgeDogMCwgeTogMjAgfSwgeyB4OiAxLCB5OiAyNCB9LCB7IHg6IDIsIHk6IDE5IH0sIHsgeDogMywgeTogMTUgfSwgeyB4OiA0LCB5OiAxNiB9XSxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnI2ZmOTAyYidcclxuXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JhcGg0LnJlbmRlcigpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gU1BBUktMSU5FXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U3BhcmtsaW5lKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U3BhcmtsaW5lKCkge1xyXG5cclxuICAgICAgICAkKCdbZGF0YS1zcGFya2xpbmVdJykuZWFjaChpbml0U3BhcmtMaW5lKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdFNwYXJrTGluZSgpIHtcclxuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkZWxlbWVudC5kYXRhKCksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBvcHRpb25zLnZhbHVlcyAmJiBvcHRpb25zLnZhbHVlcy5zcGxpdCgnLCcpO1xyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy50eXBlID0gb3B0aW9ucy50eXBlIHx8ICdiYXInOyAvLyBkZWZhdWx0IGNoYXJ0IGlzIGJhclxyXG4gICAgICAgICAgICBvcHRpb25zLmRpc2FibGVIaWRkZW5DaGVjayA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAkZWxlbWVudC5zcGFya2xpbmUodmFsdWVzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJlc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5zcGFya2xpbmUodmFsdWVzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTdGFydCBCb290c3RyYXAgSlNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRCb290c3RyYXApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRCb290c3RyYXAoKSB7XHJcblxyXG4gICAgICAgIC8vIG5lY2Vzc2FyeSBjaGVjayBhdCBsZWFzdCB0aWwgQlMgZG9lc24ndCByZXF1aXJlIGpRdWVyeVxyXG4gICAgICAgIGlmICghJC5mbiB8fCAhJC5mbi50b29sdGlwIHx8ICEkLmZuLnBvcG92ZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gUE9QT1ZFUlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInBvcG92ZXJcIl0nKS5wb3BvdmVyKCk7XHJcblxyXG4gICAgICAgIC8vIFRPT0xUSVBcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCh7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcjogJ2JvZHknXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERST1BET1dOIElOUFVUU1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgJCgnLmRyb3Bkb3duIGlucHV0Jykub24oJ2NsaWNrIGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBNb2R1bGU6IGNhcmQtdG9vbHNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRDYXJkRGlzbWlzcyk7XHJcbiAgICAkKGluaXRDYXJkQ29sbGFwc2UpO1xyXG4gICAgJChpbml0Q2FyZFJlZnJlc2gpO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBmaW5kIHRoZSBjbG9zZXN0XHJcbiAgICAgKiBhc2NlbmRpbmcgLmNhcmQgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRDYXJkUGFyZW50KGl0ZW0pIHtcclxuICAgICAgICB2YXIgZWwgPSBpdGVtLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgd2hpbGUgKGVsICYmICFlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2NhcmQnKSlcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50XHJcbiAgICAgICAgcmV0dXJuIGVsXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciB0byB0cmlnZ2VyIGN1c3RvbSBldmVudFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0cmlnZ2VyRXZlbnQodHlwZSwgaXRlbSwgZGF0YSkge1xyXG4gICAgICAgIHZhciBldjtcclxuICAgICAgICBpZiAodHlwZW9mIEN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGV2ID0gbmV3IEN1c3RvbUV2ZW50KHR5cGUsIHsgZGV0YWlsOiBkYXRhIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XHJcbiAgICAgICAgICAgIGV2LmluaXRDdXN0b21FdmVudCh0eXBlLCB0cnVlLCBmYWxzZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uZGlzcGF0Y2hFdmVudChldik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNtaXNzIGNhcmRzXHJcbiAgICAgKiBbZGF0YS10b29sPVwiY2FyZC1kaXNtaXNzXCJdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRDYXJkRGlzbWlzcygpIHtcclxuICAgICAgICB2YXIgY2FyZHRvb2xTZWxlY3RvciA9ICdbZGF0YS10b29sPVwiY2FyZC1kaXNtaXNzXCJdJ1xyXG5cclxuICAgICAgICB2YXIgY2FyZExpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2FyZHRvb2xTZWxlY3RvcikpXHJcblxyXG4gICAgICAgIGNhcmRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBuZXcgQ2FyZERpc21pc3MoaXRlbSk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQ2FyZERpc21pc3MoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfUkVNT1ZFID0gJ2NhcmQucmVtb3ZlJztcclxuICAgICAgICAgICAgdmFyIEVWRU5UX1JFTU9WRUQgPSAnY2FyZC5yZW1vdmVkJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbSA9IGl0ZW07XHJcbiAgICAgICAgICAgIHRoaXMuY2FyZFBhcmVudCA9IGdldENhcmRQYXJlbnQodGhpcy5pdGVtKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmluZyA9IGZhbHNlOyAvLyBwcmV2ZW50cyBkb3VibGUgZXhlY3V0aW9uXHJcblxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlbW92aW5nKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIHBhc3MgY2FsbGJhY2tzIHZpYSBldmVudC5kZXRhaWwgdG8gY29uZmlybS9jYW5jZWwgdGhlIHJlbW92YWxcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudChFVkVOVF9SRU1PVkUsIHRoaXMuY2FyZFBhcmVudCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm06IHRoaXMuY29uZmlybS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbDogdGhpcy5jYW5jZWwuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb25maXJtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGUodGhpcy5jYXJkUGFyZW50LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRXZlbnQoRVZFTlRfUkVNT1ZFRCwgdGhpcy5jYXJkUGFyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSh0aGlzLmNhcmRQYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGZ1bmN0aW9uKGl0ZW0sIGNiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJ29uYW5pbWF0aW9uZW5kJyBpbiB3aW5kb3cpIHsgLy8gYW5pbWF0aW9uIHN1cHBvcnRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uZW5kJywgY2IuYmluZCh0aGlzKSlcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTmFtZSArPSAnIGFuaW1hdGVkIGJvdW5jZU91dCc7IC8vIHJlcXVpcmVzIGFuaW1hdGUuY3NzXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgY2IuY2FsbCh0aGlzKSAvLyBubyBhbmltYXRpb24sIGp1c3QgcmVtb3ZlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYXR0YWNoIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29sbGFwc2VkIGNhcmRzXHJcbiAgICAgKiBbZGF0YS10b29sPVwiY2FyZC1jb2xsYXBzZVwiXVxyXG4gICAgICogW2RhdGEtc3RhcnQtY29sbGFwc2VkXVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0Q2FyZENvbGxhcHNlKCkge1xyXG4gICAgICAgIHZhciBjYXJkdG9vbFNlbGVjdG9yID0gJ1tkYXRhLXRvb2w9XCJjYXJkLWNvbGxhcHNlXCJdJztcclxuICAgICAgICB2YXIgY2FyZExpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2FyZHRvb2xTZWxlY3RvcikpXHJcblxyXG4gICAgICAgIGNhcmRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgaW5pdGlhbFN0YXRlID0gaXRlbS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQtY29sbGFwc2VkJylcclxuICAgICAgICAgICAgbmV3IENhcmRDb2xsYXBzZShpdGVtLCBpbml0aWFsU3RhdGUpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIENhcmRDb2xsYXBzZShpdGVtLCBzdGFydENvbGxhcHNlZCkge1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfU0hPVyA9ICdjYXJkLmNvbGxhcHNlLnNob3cnO1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfSElERSA9ICdjYXJkLmNvbGxhcHNlLmhpZGUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHRydWU7IC8vIHRydWUgLT4gc2hvdyAvIGZhbHNlIC0+IGhpZGVcclxuICAgICAgICAgICAgdGhpcy5pdGVtID0gaXRlbTtcclxuICAgICAgICAgICAgdGhpcy5jYXJkUGFyZW50ID0gZ2V0Q2FyZFBhcmVudCh0aGlzLml0ZW0pO1xyXG4gICAgICAgICAgICB0aGlzLndyYXBwZXIgPSB0aGlzLmNhcmRQYXJlbnQucXVlcnlTZWxlY3RvcignLmNhcmQtd3JhcHBlcicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KGFjdGlvbiA/IEVWRU5UX1NIT1cgOiBFVkVOVF9ISURFLCB0aGlzLmNhcmRQYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGUubWF4SGVpZ2h0ID0gKGFjdGlvbiA/IHRoaXMud3JhcHBlci5zY3JvbGxIZWlnaHQgOiAwKSArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBhY3Rpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUljb24oYWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSWNvbiA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTmFtZSA9IGFjdGlvbiA/ICdmYSBmYS1taW51cycgOiAnZmEgZmEtcGx1cydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZSghdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pbml0U3R5bGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGUubWF4SGVpZ2h0ID0gdGhpcy53cmFwcGVyLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGUudHJhbnNpdGlvbiA9ICdtYXgtaGVpZ2h0IDAuNXMnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHByZXBhcmUgc3R5bGVzIGZvciBjb2xsYXBzZSBhbmltYXRpb25cclxuICAgICAgICAgICAgdGhpcy5pbml0U3R5bGVzKClcclxuICAgICAgICAgICAgLy8gc2V0IGluaXRpYWwgc3RhdGUgaWYgcHJvdmlkZWRcclxuICAgICAgICAgICAgaWYgKHN0YXJ0Q29sbGFwc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNvbGxhcHNlKGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGF0dGFjaCBsaXN0ZW5lclxyXG4gICAgICAgICAgICB0aGlzLml0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSlcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZnJlc2ggY2FyZHNcclxuICAgICAqIFtkYXRhLXRvb2w9XCJjYXJkLXJlZnJlc2hcIl1cclxuICAgICAqIFtkYXRhLXNwaW5uZXI9XCJzdGFuZGFyZFwiXVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0Q2FyZFJlZnJlc2goKSB7XHJcblxyXG4gICAgICAgIHZhciBjYXJkdG9vbFNlbGVjdG9yID0gJ1tkYXRhLXRvb2w9XCJjYXJkLXJlZnJlc2hcIl0nO1xyXG4gICAgICAgIHZhciBjYXJkTGlzdCA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChjYXJkdG9vbFNlbGVjdG9yKSlcclxuXHJcbiAgICAgICAgY2FyZExpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIG5ldyBDYXJkUmVmcmVzaChpdGVtKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBDYXJkUmVmcmVzaChpdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBFVkVOVF9SRUZSRVNIID0gJ2NhcmQucmVmcmVzaCc7XHJcbiAgICAgICAgICAgIHZhciBXSElSTF9DTEFTUyA9ICd3aGlybCc7XHJcbiAgICAgICAgICAgIHZhciBERUZBVUxUX1NQSU5ORVIgPSAnc3RhbmRhcmQnXHJcblxyXG4gICAgICAgICAgICB0aGlzLml0ZW0gPSBpdGVtO1xyXG4gICAgICAgICAgICB0aGlzLmNhcmRQYXJlbnQgPSBnZXRDYXJkUGFyZW50KHRoaXMuaXRlbSlcclxuICAgICAgICAgICAgdGhpcy5zcGlubmVyID0gKCh0aGlzLml0ZW0uZGF0YXNldCB8fCB7fSkuc3Bpbm5lciB8fCBERUZBVUxUX1NQSU5ORVIpLnNwbGl0KCcgJyk7IC8vIHN1cHBvcnQgc3BhY2Ugc2VwYXJhdGVkIGNsYXNzZXNcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjYXJkID0gdGhpcy5jYXJkUGFyZW50O1xyXG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgc2hvd2luZyB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U3Bpbm5lcihjYXJkLCB0aGlzLnNwaW5uZXIpXHJcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggYXMgcHVibGljIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgY2FyZC5yZW1vdmVTcGlubmVyID0gdGhpcy5yZW1vdmVTcGlubmVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIHRoZSBldmVudCBhbmQgc2VuZCB0aGUgY2FyZFxyXG4gICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KEVWRU5UX1JFRlJFU0gsIGNhcmQsIHsgY2FyZDogY2FyZCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNob3dTcGlubmVyID0gZnVuY3Rpb24oY2FyZCwgc3Bpbm5lcikge1xyXG4gICAgICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKFdISVJMX0NMQVNTKTtcclxuICAgICAgICAgICAgICAgIHNwaW5uZXIuZm9yRWFjaChmdW5jdGlvbihzKSB7IGNhcmQuY2xhc3NMaXN0LmFkZChzKSB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkUGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoV0hJUkxfQ0xBU1MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhdHRhY2ggbGlzdGVuZXJcclxuICAgICAgICAgICAgdGhpcy5pdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5yZWZyZXNoLmJpbmQodGhpcyksIGZhbHNlKVxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEdMT0JBTCBDT05TVEFOVFNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuQVBQX0NPTE9SUyA9IHtcclxuICAgICAgICAncHJpbWFyeSc6ICAgICAgICAgICAgICAgICcjNWQ5Y2VjJyxcclxuICAgICAgICAnc3VjY2Vzcyc6ICAgICAgICAgICAgICAgICcjMjdjMjRjJyxcclxuICAgICAgICAnaW5mbyc6ICAgICAgICAgICAgICAgICAgICcjMjNiN2U1JyxcclxuICAgICAgICAnd2FybmluZyc6ICAgICAgICAgICAgICAgICcjZmY5MDJiJyxcclxuICAgICAgICAnZGFuZ2VyJzogICAgICAgICAgICAgICAgICcjZjA1MDUwJyxcclxuICAgICAgICAnaW52ZXJzZSc6ICAgICAgICAgICAgICAgICcjMTMxZTI2JyxcclxuICAgICAgICAnZ3JlZW4nOiAgICAgICAgICAgICAgICAgICcjMzdiYzliJyxcclxuICAgICAgICAncGluayc6ICAgICAgICAgICAgICAgICAgICcjZjUzMmU1JyxcclxuICAgICAgICAncHVycGxlJzogICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAnZGFyayc6ICAgICAgICAgICAgICAgICAgICcjM2EzZjUxJyxcclxuICAgICAgICAneWVsbG93JzogICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAnZ3JheS1kYXJrZXInOiAgICAgICAgICAgICcjMjMyNzM1JyxcclxuICAgICAgICAnZ3JheS1kYXJrJzogICAgICAgICAgICAgICcjM2EzZjUxJyxcclxuICAgICAgICAnZ3JheSc6ICAgICAgICAgICAgICAgICAgICcjZGRlNmU5JyxcclxuICAgICAgICAnZ3JheS1saWdodCc6ICAgICAgICAgICAgICcjZTRlYWVjJyxcclxuICAgICAgICAnZ3JheS1saWdodGVyJzogICAgICAgICAgICcjZWRmMWYyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuQVBQX01FRElBUVVFUlkgPSB7XHJcbiAgICAgICAgJ2Rlc2t0b3BMRyc6ICAgICAgICAgICAgIDEyMDAsXHJcbiAgICAgICAgJ2Rlc2t0b3AnOiAgICAgICAgICAgICAgICA5OTIsXHJcbiAgICAgICAgJ3RhYmxldCc6ICAgICAgICAgICAgICAgICA3NjgsXHJcbiAgICAgICAgJ21vYmlsZSc6ICAgICAgICAgICAgICAgICA0ODBcclxuICAgIH07XHJcblxyXG59KSgpOyIsIi8vIEZVTExTQ1JFRU5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTY3JlZW5GdWxsKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2NyZWVuRnVsbCgpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHNjcmVlbmZ1bGwgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciAkZG9jID0gJChkb2N1bWVudCk7XHJcbiAgICAgICAgdmFyICRmc1RvZ2dsZXIgPSAkKCdbZGF0YS10b2dnbGUtZnVsbHNjcmVlbl0nKTtcclxuXHJcbiAgICAgICAgLy8gTm90IHN1cHBvcnRlZCB1bmRlciBJRVxyXG4gICAgICAgIHZhciB1YSA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgICAgIGlmICh1YS5pbmRleE9mKFwiTVNJRSBcIikgPiAwIHx8ICEhdWEubWF0Y2goL1RyaWRlbnQuKnJ2XFw6MTFcXC4vKSkge1xyXG4gICAgICAgICAgICAkZnNUb2dnbGVyLmFkZENsYXNzKCdkLW5vbmUnKTsgLy8gaGlkZSBlbGVtZW50XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gYW5kIGFib3J0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkZnNUb2dnbGVyLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNjcmVlbmZ1bGwuZW5hYmxlZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHNjcmVlbmZ1bGwudG9nZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3dpdGNoIGljb24gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVGU0ljb24oJGZzVG9nZ2xlcik7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Z1bGxzY3JlZW4gbm90IGVuYWJsZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2NyZWVuZnVsbC5yYXcgJiYgc2NyZWVuZnVsbC5yYXcuZnVsbHNjcmVlbmNoYW5nZSlcclxuICAgICAgICAgICAgJGRvYy5vbihzY3JlZW5mdWxsLnJhdy5mdWxsc2NyZWVuY2hhbmdlLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUZTSWNvbigkZnNUb2dnbGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHRvZ2dsZUZTSWNvbigkZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoc2NyZWVuZnVsbC5pc0Z1bGxzY3JlZW4pXHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbignZW0nKS5yZW1vdmVDbGFzcygnZmEtZXhwYW5kJykuYWRkQ2xhc3MoJ2ZhLWNvbXByZXNzJyk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCdlbScpLnJlbW92ZUNsYXNzKCdmYS1jb21wcmVzcycpLmFkZENsYXNzKCdmYS1leHBhbmQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBMT0FEIENVU1RPTSBDU1NcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRMb2FkQ1NTKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TG9hZENTUygpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtbG9hZC1jc3NdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ2EnKSlcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB1cmkgPSBlbGVtZW50LmRhdGEoJ2xvYWRDc3MnKSxcclxuICAgICAgICAgICAgICAgIGxpbms7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJpKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5rID0gY3JlYXRlTGluayh1cmkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5lcnJvcignRXJyb3IgY3JlYXRpbmcgc3R5bGVzaGVldCBsaW5rIGVsZW1lbnQuJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkLmVycm9yKCdObyBzdHlsZXNoZWV0IGxvY2F0aW9uIGRlZmluZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTGluayh1cmkpIHtcclxuICAgICAgICB2YXIgbGlua0lkID0gJ2F1dG9sb2FkZWQtc3R5bGVzaGVldCcsXHJcbiAgICAgICAgICAgIG9sZExpbmsgPSAkKCcjJyArIGxpbmtJZCkuYXR0cignaWQnLCBsaW5rSWQgKyAnLW9sZCcpO1xyXG5cclxuICAgICAgICAkKCdoZWFkJykuYXBwZW5kKCQoJzxsaW5rLz4nKS5hdHRyKHtcclxuICAgICAgICAgICAgJ2lkJzogbGlua0lkLFxyXG4gICAgICAgICAgICAncmVsJzogJ3N0eWxlc2hlZXQnLFxyXG4gICAgICAgICAgICAnaHJlZic6IHVyaVxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgaWYgKG9sZExpbmsubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIG9sZExpbmsucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJCgnIycgKyBsaW5rSWQpO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBUUkFOU0xBVElPTlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRyYW5zbGF0aW9uKTtcclxuXHJcblxyXG4gICAgdmFyIHBhdGhQcmVmaXggPSAnL0NvbnRlbnQvaTE4bic7IC8vIGZvbGRlciBvZiBqc29uIGZpbGVzXHJcbiAgICB2YXIgU1RPUkFHRUtFWSA9ICdqcS1hcHBMYW5nJztcclxuICAgIHZhciBzYXZlZExhbmd1YWdlID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFS0VZKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VHJhbnNsYXRpb24oKSB7XHJcbiAgICAgICAgaTE4bmV4dFxyXG4gICAgICAgICAgICAudXNlKGkxOG5leHRYSFJCYWNrZW5kKVxyXG4gICAgICAgICAgICAvLyAudXNlKExhbmd1YWdlRGV0ZWN0b3IpXHJcbiAgICAgICAgICAgIC5pbml0KHtcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrTG5nOiBzYXZlZExhbmd1YWdlIHx8ICdlbicsXHJcbiAgICAgICAgICAgICAgICBiYWNrZW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZFBhdGg6IHBhdGhQcmVmaXggKyAnL3t7bnN9fS17e2xuZ319Lmpzb24nLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5zOiBbJ3NpdGUnXSxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHROUzogJ3NpdGUnLFxyXG4gICAgICAgICAgICAgICAgZGVidWc6IGZhbHNlXHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVyciwgdCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgYXBwbHlUcmFubGF0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgLy8gbGlzdGVuIHRvIGxhbmd1YWdlIGNoYW5nZXNcclxuICAgICAgICAgICAgICAgIGF0dGFjaENoYW5nZUxpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5VHJhbmxhdGlvbnMoKSB7XHJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1sb2NhbGl6ZV0nKSlcclxuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2NhbGl6ZScpXHJcbiAgICAgICAgICAgICAgICBpZiAoaTE4bmV4dC5leGlzdHMoa2V5KSkgaXRlbS5pbm5lckhUTUwgPSBpMThuZXh0LnQoa2V5KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGF0dGFjaENoYW5nZUxpc3RlbmVyKCkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2V0LWxhbmddJykpXHJcbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnKSBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhbmcgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbGFuZycpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaTE4bmV4dC5jaGFuZ2VMYW5ndWFnZShsYW5nLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5VHJhbmxhdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdG9yYWdlcy5sb2NhbFN0b3JhZ2Uuc2V0KFNUT1JBR0VLRVksIGxhbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVEcm9wZG93bihpdGVtKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGVEcm9wZG93bihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24taXRlbScpKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnBhcmVudEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZy5pbm5lckhUTUwgPSBpdGVtLmlubmVySFRNTDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cclxufSkoKTsiLCIvLyBOQVZCQVIgU0VBUkNIXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0TmF2YmFyU2VhcmNoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TmF2YmFyU2VhcmNoKCkge1xyXG5cclxuICAgICAgICB2YXIgbmF2U2VhcmNoID0gbmV3IG5hdmJhclNlYXJjaElucHV0KCk7XHJcblxyXG4gICAgICAgIC8vIE9wZW4gc2VhcmNoIGlucHV0XHJcbiAgICAgICAgdmFyICRzZWFyY2hPcGVuID0gJCgnW2RhdGEtc2VhcmNoLW9wZW5dJyk7XHJcblxyXG4gICAgICAgICRzZWFyY2hPcGVuXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IH0pXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBuYXZTZWFyY2gudG9nZ2xlKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2Ugc2VhcmNoIGlucHV0XHJcbiAgICAgICAgdmFyICRzZWFyY2hEaXNtaXNzID0gJCgnW2RhdGEtc2VhcmNoLWRpc21pc3NdJyk7XHJcbiAgICAgICAgdmFyIGlucHV0U2VsZWN0b3IgPSAnLm5hdmJhci1mb3JtIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJztcclxuXHJcbiAgICAgICAgJChpbnB1dFNlbGVjdG9yKVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAyNykgLy8gRVNDXHJcbiAgICAgICAgICAgICAgICAgICAgbmF2U2VhcmNoLmRpc21pc3MoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNsaWNrIGFueXdoZXJlIGNsb3NlcyB0aGUgc2VhcmNoXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgbmF2U2VhcmNoLmRpc21pc3MpO1xyXG4gICAgICAgIC8vIGRpc21pc3NhYmxlIG9wdGlvbnNcclxuICAgICAgICAkc2VhcmNoRGlzbWlzc1xyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgbmF2U2VhcmNoLmRpc21pc3MpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmF2YmFyU2VhcmNoSW5wdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmF2YmFyRm9ybVNlbGVjdG9yID0gJ2Zvcm0ubmF2YmFyLWZvcm0nO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG5hdmJhckZvcm0gPSAkKG5hdmJhckZvcm1TZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgICAgICAgbmF2YmFyRm9ybS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpc09wZW4gPSBuYXZiYXJGb3JtLmhhc0NsYXNzKCdvcGVuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgbmF2YmFyRm9ybS5maW5kKCdpbnB1dCcpW2lzT3BlbiA/ICdmb2N1cycgOiAnYmx1ciddKCk7XHJcblxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGlzbWlzczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKG5hdmJhckZvcm1TZWxlY3RvcilcclxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ29wZW4nKSAvLyBDbG9zZSBjb250cm9sXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykuYmx1cigpIC8vIHJlbW92ZSBmb2N1c1xyXG4gICAgICAgICAgICAgICAgLy8gLnZhbCgnJykgICAgICAgICAgICAgICAgICAgIC8vIEVtcHR5IGlucHV0XHJcbiAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTk9XIFRJTUVSXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Tm93VGltZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXROb3dUaW1lcigpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBtb21lbnQgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLW5vd10nKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBlbGVtZW50LmRhdGEoJ2Zvcm1hdCcpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlVGltZSgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkdCA9IG1vbWVudChuZXcgRGF0ZSgpKS5mb3JtYXQoZm9ybWF0KTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQudGV4dChkdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZVRpbWUoKTtcclxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwodXBkYXRlVGltZSwgMTAwMCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBUb2dnbGUgUlRMIG1vZGUgZm9yIGRlbW9cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0UlRMKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UlRMKCkge1xyXG4gICAgICAgIHZhciBtYWluY3NzID0gJCgnI21haW5jc3MnKTtcclxuICAgICAgICB2YXIgYnNjc3MgPSAkKCcjYnNjc3MnKTtcclxuICAgICAgICAkKCcjY2hrLXJ0bCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gYXBwIHJ0bCBjaGVja1xyXG4gICAgICAgICAgICBtYWluY3NzLmF0dHIoJ2hyZWYnLCB0aGlzLmNoZWNrZWQgPyAnL0NvbnRlbnQvY3NzL2FwcC1ydGwuY3NzJyA6ICcvQ29udGVudC9jc3MvYXBwLmNzcycpO1xyXG4gICAgICAgICAgICAvLyBib290c3RyYXAgcnRsIGNoZWNrXHJcbiAgICAgICAgICAgIGJzY3NzLmF0dHIoJ2hyZWYnLCB0aGlzLmNoZWNrZWQgPyAnL0NvbnRlbnQvY3NzL2Jvb3RzdHJhcC1ydGwuY3NzJyA6ICcvQ29udGVudC9jc3MvYm9vdHN0cmFwLmNzcycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTSURFQkFSXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFNpZGViYXIpO1xyXG5cclxuICAgIHZhciAkaHRtbDtcclxuICAgIHZhciAkYm9keTtcclxuICAgIHZhciAkc2lkZWJhcjtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2lkZWJhcigpIHtcclxuXHJcbiAgICAgICAgJGh0bWwgPSAkKCdodG1sJyk7XHJcbiAgICAgICAgJGJvZHkgPSAkKCdib2R5Jyk7XHJcbiAgICAgICAgJHNpZGViYXIgPSAkKCcuc2lkZWJhcicpO1xyXG5cclxuICAgICAgICAvLyBBVVRPQ09MTEFQU0UgSVRFTVNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgc2lkZWJhckNvbGxhcHNlID0gJHNpZGViYXIuZmluZCgnLmNvbGxhcHNlJyk7XHJcbiAgICAgICAgc2lkZWJhckNvbGxhcHNlLm9uKCdzaG93LmJzLmNvbGxhcHNlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wYXJlbnRzKCcuY29sbGFwc2UnKS5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICBzaWRlYmFyQ29sbGFwc2UuZmlsdGVyKCcuc2hvdycpLmNvbGxhcHNlKCdoaWRlJyk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTSURFQkFSIEFDVElWRSBTVEFURVxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIC8vIEZpbmQgY3VycmVudCBhY3RpdmUgaXRlbVxyXG4gICAgICAgIHZhciBjdXJyZW50SXRlbSA9ICQoJy5zaWRlYmFyIC5hY3RpdmUnKS5wYXJlbnRzKCdsaScpO1xyXG5cclxuICAgICAgICAvLyBob3ZlciBtb2RlIGRvbid0IHRyeSB0byBleHBhbmQgYWN0aXZlIGNvbGxhcHNlXHJcbiAgICAgICAgaWYgKCF1c2VBc2lkZUhvdmVyKCkpXHJcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJykgLy8gYWN0aXZhdGUgdGhlIHBhcmVudFxyXG4gICAgICAgICAgICAuY2hpbGRyZW4oJy5jb2xsYXBzZScpIC8vIGZpbmQgdGhlIGNvbGxhcHNlXHJcbiAgICAgICAgICAgIC5jb2xsYXBzZSgnc2hvdycpOyAvLyBhbmQgc2hvdyBpdFxyXG5cclxuICAgICAgICAvLyByZW1vdmUgdGhpcyBpZiB5b3UgdXNlIG9ubHkgY29sbGFwc2libGUgc2lkZWJhciBpdGVtc1xyXG4gICAgICAgICRzaWRlYmFyLmZpbmQoJ2xpID4gYSArIHVsJykub24oJ3Nob3cuYnMuY29sbGFwc2UnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VBc2lkZUhvdmVyKCkpIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU0lERUJBUiBDT0xMQVBTRUQgSVRFTSBIQU5ETEVSXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgICAgIHZhciBldmVudE5hbWUgPSBpc1RvdWNoKCkgPyAnY2xpY2snIDogJ21vdXNlZW50ZXInO1xyXG4gICAgICAgIHZhciBzdWJOYXYgPSAkKCk7XHJcbiAgICAgICAgJHNpZGViYXIuZmluZCgnLnNpZGViYXItbmF2ID4gbGknKS5vbihldmVudE5hbWUsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc1NpZGViYXJDb2xsYXBzZWQoKSB8fCB1c2VBc2lkZUhvdmVyKCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzdWJOYXYudHJpZ2dlcignbW91c2VsZWF2ZScpO1xyXG4gICAgICAgICAgICAgICAgc3ViTmF2ID0gdG9nZ2xlTWVudUl0ZW0oJCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXNlZCB0byBkZXRlY3QgY2xpY2sgYW5kIHRvdWNoIGV2ZW50cyBvdXRzaWRlIHRoZSBzaWRlYmFyXHJcbiAgICAgICAgICAgICAgICBzaWRlYmFyQWRkQmFja2Ryb3AoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHNpZGViYXJBbnljbGlja0Nsb3NlID0gJHNpZGViYXIuZGF0YSgnc2lkZWJhckFueWNsaWNrQ2xvc2UnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsb3dzIHRvIGNsb3NlXHJcbiAgICAgICAgaWYgKHR5cGVvZiBzaWRlYmFyQW55Y2xpY2tDbG9zZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHJcbiAgICAgICAgICAgICQoJy53cmFwcGVyJykub24oJ2NsaWNrLnNpZGViYXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBjaGVjayBpZiBzaWRlYmFyIG5vdCB2aXNpYmxlXHJcbiAgICAgICAgICAgICAgICBpZiAoISRib2R5Lmhhc0NsYXNzKCdhc2lkZS10b2dnbGVkJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkdGFyZ2V0LnBhcmVudHMoJy5hc2lkZS1jb250YWluZXInKS5sZW5ndGggJiYgLy8gaWYgbm90IGNoaWxkIG9mIHNpZGViYXJcclxuICAgICAgICAgICAgICAgICAgICAhJHRhcmdldC5pcygnI3VzZXItYmxvY2stdG9nZ2xlJykgJiYgLy8gdXNlciBibG9jayB0b2dnbGUgYW5jaG9yXHJcbiAgICAgICAgICAgICAgICAgICAgISR0YXJnZXQucGFyZW50KCkuaXMoJyN1c2VyLWJsb2NrLXRvZ2dsZScpIC8vIHVzZXIgYmxvY2sgdG9nZ2xlIGljb25cclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICRib2R5LnJlbW92ZUNsYXNzKCdhc2lkZS10b2dnbGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2lkZWJhckFkZEJhY2tkcm9wKCkge1xyXG4gICAgICAgIHZhciAkYmFja2Ryb3AgPSAkKCc8ZGl2Lz4nLCB7ICdjbGFzcyc6ICdzaWRlYWJyLWJhY2tkcm9wJyB9KTtcclxuICAgICAgICAkYmFja2Ryb3AuaW5zZXJ0QWZ0ZXIoJy5hc2lkZS1jb250YWluZXInKS5vbihcImNsaWNrIG1vdXNlZW50ZXJcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUZsb2F0aW5nTmF2KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3BlbiB0aGUgY29sbGFwc2Ugc2lkZWJhciBzdWJtZW51IGl0ZW1zIHdoZW4gb24gdG91Y2ggZGV2aWNlc1xyXG4gICAgLy8gLSBkZXNrdG9wIG9ubHkgb3BlbnMgb24gaG92ZXJcclxuICAgIGZ1bmN0aW9uIHRvZ2dsZVRvdWNoSXRlbSgkZWxlbWVudCkge1xyXG4gICAgICAgICRlbGVtZW50XHJcbiAgICAgICAgICAgIC5zaWJsaW5ncygnbGknKVxyXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gICAgICAgICRlbGVtZW50XHJcbiAgICAgICAgICAgIC50b2dnbGVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZXMgaG92ZXIgdG8gb3BlbiBpdGVtcyB1bmRlciBjb2xsYXBzZWQgbWVudVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIGZ1bmN0aW9uIHRvZ2dsZU1lbnVJdGVtKCRsaXN0SXRlbSkge1xyXG5cclxuICAgICAgICByZW1vdmVGbG9hdGluZ05hdigpO1xyXG5cclxuICAgICAgICB2YXIgdWwgPSAkbGlzdEl0ZW0uY2hpbGRyZW4oJ3VsJyk7XHJcblxyXG4gICAgICAgIGlmICghdWwubGVuZ3RoKSByZXR1cm4gJCgpO1xyXG4gICAgICAgIGlmICgkbGlzdEl0ZW0uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgICAgICB0b2dnbGVUb3VjaEl0ZW0oJGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuICQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciAkYXNpZGUgPSAkKCcuYXNpZGUtY29udGFpbmVyJyk7XHJcbiAgICAgICAgdmFyICRhc2lkZUlubmVyID0gJCgnLmFzaWRlLWlubmVyJyk7IC8vIGZvciB0b3Agb2Zmc2V0IGNhbGN1bGF0aW9uXHJcbiAgICAgICAgLy8gZmxvYXQgYXNpZGUgdXNlcyBleHRyYSBwYWRkaW5nIG9uIGFzaWRlXHJcbiAgICAgICAgdmFyIG1hciA9IHBhcnNlSW50KCRhc2lkZUlubmVyLmNzcygncGFkZGluZy10b3AnKSwgMCkgKyBwYXJzZUludCgkYXNpZGUuY3NzKCdwYWRkaW5nLXRvcCcpLCAwKTtcclxuXHJcbiAgICAgICAgdmFyIHN1Yk5hdiA9IHVsLmNsb25lKCkuYXBwZW5kVG8oJGFzaWRlKTtcclxuXHJcbiAgICAgICAgdG9nZ2xlVG91Y2hJdGVtKCRsaXN0SXRlbSk7XHJcblxyXG4gICAgICAgIHZhciBpdGVtVG9wID0gKCRsaXN0SXRlbS5wb3NpdGlvbigpLnRvcCArIG1hcikgLSAkc2lkZWJhci5zY3JvbGxUb3AoKTtcclxuICAgICAgICB2YXIgdndIZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcclxuXHJcbiAgICAgICAgc3ViTmF2XHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnbmF2LWZsb2F0aW5nJylcclxuICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogaXNGaXhlZCgpID8gJ2ZpeGVkJyA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6IGl0ZW1Ub3AsXHJcbiAgICAgICAgICAgICAgICBib3R0b206IChzdWJOYXYub3V0ZXJIZWlnaHQodHJ1ZSkgKyBpdGVtVG9wID4gdndIZWlnaHQpID8gMCA6ICdhdXRvJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc3ViTmF2Lm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRvZ2dsZVRvdWNoSXRlbSgkbGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICBzdWJOYXYucmVtb3ZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdWJOYXY7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlRmxvYXRpbmdOYXYoKSB7XHJcbiAgICAgICAgJCgnLnNpZGViYXItc3VibmF2Lm5hdi1mbG9hdGluZycpLnJlbW92ZSgpO1xyXG4gICAgICAgICQoJy5zaWRlYWJyLWJhY2tkcm9wJykucmVtb3ZlKCk7XHJcbiAgICAgICAgJCgnLnNpZGViYXIgbGkub3BlbicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNUb3VjaCgpIHtcclxuICAgICAgICByZXR1cm4gJGh0bWwuaGFzQ2xhc3MoJ3RvdWNoJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNTaWRlYmFyQ29sbGFwc2VkKCkge1xyXG4gICAgICAgIHJldHVybiAkYm9keS5oYXNDbGFzcygnYXNpZGUtY29sbGFwc2VkJykgfHwgJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWNvbGxhcHNlZC10ZXh0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNTaWRlYmFyVG9nZ2xlZCgpIHtcclxuICAgICAgICByZXR1cm4gJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLXRvZ2dsZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc01vYmlsZSgpIHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCA8IEFQUF9NRURJQVFVRVJZLnRhYmxldDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0ZpeGVkKCkge1xyXG4gICAgICAgIHJldHVybiAkYm9keS5oYXNDbGFzcygnbGF5b3V0LWZpeGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXNlQXNpZGVIb3ZlcigpIHtcclxuICAgICAgICByZXR1cm4gJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWhvdmVyJyk7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFNMSU1TQ1JPTExcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTbGltc1Nyb2xsKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2xpbXNTcm9sbCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuIHx8ICEkLmZuLnNsaW1TY3JvbGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtc2Nyb2xsYWJsZV0nKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdEhlaWdodCA9IDI1MDtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2xpbVNjcm9sbCh7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IChlbGVtZW50LmRhdGEoJ2hlaWdodCcpIHx8IGRlZmF1bHRIZWlnaHQpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gVGFibGUgQ2hlY2sgQWxsXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0VGFibGVDaGVja0FsbCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFRhYmxlQ2hlY2tBbGwoKSB7XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLWNoZWNrLWFsbF0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBpbmRleCA9ICR0aGlzLmluZGV4KCkgKyAxLFxyXG4gICAgICAgICAgICAgICAgY2hlY2tib3ggPSAkdGhpcy5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSxcclxuICAgICAgICAgICAgICAgIHRhYmxlID0gJHRoaXMucGFyZW50cygndGFibGUnKTtcclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGFmZmVjdCBvbmx5IHRoZSBjb3JyZWN0IGNoZWNrYm94IGNvbHVtblxyXG4gICAgICAgICAgICB0YWJsZS5maW5kKCd0Ym9keSA+IHRyID4gdGQ6bnRoLWNoaWxkKCcgKyBpbmRleCArICcpIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpXHJcbiAgICAgICAgICAgICAgICAucHJvcCgnY2hlY2tlZCcsIGNoZWNrYm94WzBdLmNoZWNrZWQpO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFRPR0dMRSBTVEFURVxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRvZ2dsZVN0YXRlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VG9nZ2xlU3RhdGUoKSB7XHJcblxyXG4gICAgICAgIHZhciAkYm9keSA9ICQoJ2JvZHknKTtcclxuICAgICAgICB2YXIgdG9nZ2xlID0gbmV3IFN0YXRlVG9nZ2xlcigpO1xyXG5cclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtc3RhdGVdJylcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NuYW1lID0gZWxlbWVudC5kYXRhKCd0b2dnbGVTdGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IGVsZW1lbnQuZGF0YSgndGFyZ2V0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgbm9QZXJzaXN0ID0gKGVsZW1lbnQuYXR0cignZGF0YS1uby1wZXJzaXN0JykgIT09IHVuZGVmaW5lZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3BlY2lmeSBhIHRhcmdldCBzZWxlY3RvciB0byB0b2dnbGUgY2xhc3NuYW1lXHJcbiAgICAgICAgICAgICAgICAvLyB1c2UgYm9keSBieSBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9IHRhcmdldCA/ICQodGFyZ2V0KSA6ICRib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhjbGFzc25hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MoY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub1BlcnNpc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGUucmVtb3ZlU3RhdGUoY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbm9QZXJzaXN0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlLmFkZFN0YXRlKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzb21lIGVsZW1lbnRzIG1heSBuZWVkIHRoaXMgd2hlbiB0b2dnbGVkIGNsYXNzIGNoYW5nZSB0aGUgY29udGVudCBzaXplXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKEV2ZW50KSA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBtb2Rlcm4gYnJvd3NlcnNcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Jlc2l6ZScpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIG9sZCBicm93c2VycyBhbmQgSUVcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzaXplRXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1VJRXZlbnRzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplRXZlbnQuaW5pdFVJRXZlbnQoJ3Jlc2l6ZScsIHRydWUsIGZhbHNlLCB3aW5kb3csIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlc2l6ZUV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBzdGF0ZXMgdG8vZnJvbSBsb2NhbHN0b3JhZ2VcclxuICAgIHZhciBTdGF0ZVRvZ2dsZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIFNUT1JBR0VfS0VZX05BTUUgPSAnanEtdG9nZ2xlU3RhdGUnO1xyXG5cclxuICAgICAgICAvKiogQWRkIGEgc3RhdGUgdG8gdGhlIGJyb3dzZXIgc3RvcmFnZSB0byBiZSByZXN0b3JlZCBsYXRlciAqL1xyXG4gICAgICAgIHRoaXMuYWRkU3RhdGUgPSBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBTdG9yYWdlcy5sb2NhbFN0b3JhZ2UuZ2V0KFNUT1JBR0VfS0VZX05BTUUpO1xyXG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSBkYXRhLnB1c2goY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgZWxzZSBkYXRhID0gW2NsYXNzbmFtZV07XHJcbiAgICAgICAgICAgIFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5zZXQoU1RPUkFHRV9LRVlfTkFNRSwgZGF0YSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKiogUmVtb3ZlIGEgc3RhdGUgZnJvbSB0aGUgYnJvd3NlciBzdG9yYWdlICovXHJcbiAgICAgICAgdGhpcy5yZW1vdmVTdGF0ZSA9IGZ1bmN0aW9uKGNsYXNzbmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5nZXQoU1RPUkFHRV9LRVlfTkFNRSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmluZGV4T2YoY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIGRhdGEuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5zZXQoU1RPUkFHRV9LRVlfTkFNRSwgZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKiBMb2FkIHRoZSBzdGF0ZSBzdHJpbmcgYW5kIHJlc3RvcmUgdGhlIGNsYXNzbGlzdCAqL1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVN0YXRlID0gZnVuY3Rpb24oJGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBTdG9yYWdlcy5sb2NhbFN0b3JhZ2UuZ2V0KFNUT1JBR0VfS0VZX05BTUUpO1xyXG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KVxyXG4gICAgICAgICAgICAgICAgJGVsZW0uYWRkQ2xhc3MoZGF0YS5qb2luKCcgJykpO1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5TdGF0ZVRvZ2dsZXIgPSBTdGF0ZVRvZ2dsZXI7XHJcblxyXG59KSgpOyIsIi8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBNb2R1bGU6IHRyaWdnZXItcmVzaXplLmpzXHJcbiAqIFRyaWdnZXJzIGEgd2luZG93IHJlc2l6ZSBldmVudCBmcm9tIGFueSBlbGVtZW50XHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRyaWdnZXJSZXNpemUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUcmlnZ2VyUmVzaXplKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gJCgnW2RhdGEtdHJpZ2dlci1yZXNpemVdJyk7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gZWxlbWVudC5kYXRhKCd0cmlnZ2VyUmVzaXplJylcclxuICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWxsIElFIGZyaWVuZGx5IGRpc3BhdGNoRXZlbnRcclxuICAgICAgICAgICAgICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVUlFdmVudHMnKTtcclxuICAgICAgICAgICAgICAgIGV2dC5pbml0VUlFdmVudCgncmVzaXplJywgdHJ1ZSwgZmFsc2UsIHdpbmRvdywgMCk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gbW9kZXJuIGRpc3BhdGNoRXZlbnQgd2F5XHJcbiAgICAgICAgICAgICAgICAvLyB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Jlc2l6ZScpKTtcclxuICAgICAgICAgICAgfSwgdmFsdWUgfHwgMzAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRnVsbCBDYWxlbmRhclxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGlmICh0eXBlb2YgRnVsbENhbGVuZGFyID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gZG9tIHJlYWR5LCBpbml0IGNhbGVuZGFyIGFuZCBldmVudHNcclxuICAgICQoaW5pdEV4dGVybmFsRXZlbnRzKTtcclxuICAgICQoaW5pdEZ1bGxDYWxlbmRhcik7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZ1bGxDYWxlbmRhcigpIHtcclxuXHJcbiAgICAgICAgdmFyIENhbGVuZGFyID0gRnVsbENhbGVuZGFyLkNhbGVuZGFyO1xyXG4gICAgICAgIHZhciBEcmFnZ2FibGUgPSBGdWxsQ2FsZW5kYXJJbnRlcmFjdGlvbi5EcmFnZ2FibGU7XHJcblxyXG4gICAgICAgIC8qIGluaXRpYWxpemUgdGhlIGV4dGVybmFsIGV2ZW50cyAqL1xyXG4gICAgICAgIHZhciBjb250YWluZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHRlcm5hbC1ldmVudHMtbGlzdCcpO1xyXG4gICAgICAgIG5ldyBEcmFnZ2FibGUoY29udGFpbmVyRWwsIHtcclxuICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLmZjZS1ldmVudCcsXHJcbiAgICAgICAgICAgIGV2ZW50RGF0YTogZnVuY3Rpb24oZXZlbnRFbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZXZlbnRFbC5pbm5lclRleHQudHJpbSgpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qIGluaXRpYWxpemUgdGhlIGNhbGVuZGFyICovXHJcbiAgICAgICAgdmFyIGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FsZW5kYXInKTtcclxuICAgICAgICB2YXIgY2FsZW5kYXIgPSBuZXcgQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xyXG4gICAgICAgICAgICBldmVudHM6IGNyZWF0ZURlbW9FdmVudHMoKSxcclxuICAgICAgICAgICAgcGx1Z2luczogWydpbnRlcmFjdGlvbicsICdkYXlHcmlkJywgJ3RpbWVHcmlkJywgJ2xpc3QnLCAnYm9vdHN0cmFwJ10sXHJcbiAgICAgICAgICAgIHRoZW1lU3lzdGVtOiAnYm9vdHN0cmFwJyxcclxuICAgICAgICAgICAgaGVhZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAncHJldixuZXh0IHRvZGF5JyxcclxuICAgICAgICAgICAgICAgIGNlbnRlcjogJ3RpdGxlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnZGF5R3JpZE1vbnRoLHRpbWVHcmlkV2Vlayx0aW1lR3JpZERheSxsaXN0V2VlaydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRyb3BwYWJsZTogdHJ1ZSwgLy8gdGhpcyBhbGxvd3MgdGhpbmdzIHRvIGJlIGRyb3BwZWQgb250byB0aGUgY2FsZW5kYXJcclxuICAgICAgICAgICAgZXZlbnRSZWNlaXZlOiBmdW5jdGlvbihpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZShpbmZvLmRyYWdnZWRFbCk7XHJcbiAgICAgICAgICAgICAgICBpbmZvLmV2ZW50LnNldFByb3AoJ2JhY2tncm91bmRDb2xvcicsIHN0eWxlcy5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgICAgICAgICAgICAgaW5mby5ldmVudC5zZXRQcm9wKCdib3JkZXJDb2xvcicsIHN0eWxlcy5ib3JkZXJDb2xvcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gaXMgdGhlIFwicmVtb3ZlIGFmdGVyIGRyb3BcIiBjaGVja2JveCBjaGVja2VkP1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcm9wLXJlbW92ZScpLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBzbywgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gdGhlIFwiRHJhZ2dhYmxlIEV2ZW50c1wiIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICBpbmZvLmRyYWdnZWRFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGluZm8uZHJhZ2dlZEVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNhbGVuZGFyLnJlbmRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRFeHRlcm5hbEV2ZW50cygpIHtcclxuICAgICAgICB2YXIgY29sb3JTZWxlY3RvckNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHRlcm5hbC1ldmVudC1jb2xvci1zZWxlY3RvcicpO1xyXG4gICAgICAgIHZhciBhZGRFdmVudEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHRlcm5hbC1ldmVudC1hZGQtYnRuJyk7XHJcbiAgICAgICAgdmFyIGV2ZW50TmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50LW5hbWUnKTtcclxuICAgICAgICB2YXIgY29sb3JTZWxlY3RvcnMgPSBbXS5zbGljZS5jYWxsKGNvbG9yU2VsZWN0b3JDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmNpcmNsZScpKTtcclxuICAgICAgICB2YXIgY3VycmVudFNlbGVjdG9yID0gY29sb3JTZWxlY3RvckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY2lyY2xlJyk7IC8vIHNlbGVjdCBmaXJzdCBhcyBkZWZhdWx0XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50cy1saXN0Jyk7XHJcblxyXG4gICAgICAgIC8vIGNvbnRyb2wgdGhlIGNvbG9yIHNlbGVjdG9yIHNlbGVjdGFibGUgYmVoYXZpb3JcclxuICAgICAgICBjb2xvclNlbGVjdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHNlbCkge1xyXG4gICAgICAgICAgICBzZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxlY3RDb2xvclNlbGVjdG9yKHNlbCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIGEgbmV3IGV2ZW50IHRvIHRoZSBsaXN0XHJcbiAgICAgICAgYWRkRXZlbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGROZXdFeHRlcm5hbEV2ZW50KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0Q29sb3JTZWxlY3RvcihzZWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRlc2VsZWN0IGFsbFxyXG4gICAgICAgICAgICAgICAgY29sb3JTZWxlY3RvcnMuZm9yRWFjaCh1bnNlbGVjdEFsbENvbG9yU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0IGN1cnJlbnRcclxuICAgICAgICAgICAgICAgIHNlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlbGVjdG9yID0gc2VsO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdW5zZWxlY3RBbGxDb2xvclNlbGVjdG9yKGVsKSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGROZXdFeHRlcm5hbEV2ZW50KCkge1xyXG4gICAgICAgICAgICB2YXIgbmFtZSA9IGV2ZW50TmFtZUlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gY3JlYXRlRWxlbWVudChjdXJyZW50U2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gbmFtZTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckVsLmluc2VydEJlZm9yZShlbCwgY29udGFpbmVyRWwuZmlyc3RDaGlsZCk7IC8vIHByZXBwZW5kXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoYmFzZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0eWxlcyA9IGdldENvbXB1dGVkU3R5bGUoY3VycmVudFNlbGVjdG9yKTtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzdHlsZXMuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmJvcmRlckNvbG9yID0gc3R5bGVzLmJvcmRlckNvbG9yO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmNvbG9yID0gJyNmZmYnO1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdmY2UtZXZlbnQnOyAvLyBtYWtlIGRyYWdnYWJsZVxyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGV2ZW50cyB0byBkaXNwbGF5IGluIHRoZSBmaXJzdCBsb2FkIG9mIHRoZSBjYWxlbmRhclxyXG4gICAgICogV3JhcCBpbnRvIHRoaXMgZnVuY3Rpb24gYSByZXF1ZXN0IHRvIGEgc291cmNlIHRvIGdldCB2aWEgYWpheCB0aGUgc3RvcmVkIGV2ZW50c1xyXG4gICAgICogQHJldHVybiBBcnJheSBUaGUgYXJyYXkgd2l0aCB0aGUgZXZlbnRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZURlbW9FdmVudHMoKSB7XHJcbiAgICAgICAgLy8gRGF0ZSBmb3IgdGhlIGNhbGVuZGFyIGV2ZW50cyAoZHVtbXkgZGF0YSlcclxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdmFyIGQgPSBkYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgbSA9IGRhdGUuZ2V0TW9udGgoKSxcclxuICAgICAgICAgICAgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBbGwgRGF5IEV2ZW50JyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCAxKSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmNTY5NTQnLCAvL3JlZFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZjU2OTU0JyAvL3JlZFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0xvbmcgRXZlbnQnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIGQgLSA1KSxcclxuICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoeSwgbSwgZCAtIDIpLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2YzOWMxMicsIC8veWVsbG93XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmMzljMTInIC8veWVsbG93XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnTWVldGluZycsXHJcbiAgICAgICAgICAgICAgICBzdGFydDogbmV3IERhdGUoeSwgbSwgZCwgMTAsIDMwKSxcclxuICAgICAgICAgICAgICAgIGFsbERheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDA3M2I3JywgLy9CbHVlXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMwMDczYjcnIC8vQmx1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0x1bmNoJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCBkLCAxMiwgMCksXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKHksIG0sIGQsIDE0LCAwKSxcclxuICAgICAgICAgICAgICAgIGFsbERheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDBjMGVmJywgLy9JbmZvIChhcXVhKVxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMDBjMGVmJyAvL0luZm8gKGFxdWEpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQmlydGhkYXkgUGFydHknLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIGQgKyAxLCAxOSwgMCksXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKHksIG0sIGQgKyAxLCAyMiwgMzApLFxyXG4gICAgICAgICAgICAgICAgYWxsRGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMGE2NWEnLCAvL1N1Y2Nlc3MgKGdyZWVuKVxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMDBhNjVhJyAvL1N1Y2Nlc3MgKGdyZWVuKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ09wZW4gR29vZ2xlJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCAyOCksXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKHksIG0sIDI5KSxcclxuICAgICAgICAgICAgICAgIHVybDogJy8vZ29vZ2xlLmNvbS8nLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNjOGRiYycsIC8vUHJpbWFyeSAobGlnaHQtYmx1ZSlcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzNjOGRiYycgLy9QcmltYXJ5IChsaWdodC1ibHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiLy8gSlFDbG91ZFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRXb3JkQ2xvdWQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRXb3JkQ2xvdWQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5qUUNsb3VkKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIGFuIGFycmF5IG9mIHdvcmQgb2JqZWN0cywgZWFjaCByZXByZXNlbnRpbmcgYSB3b3JkIGluIHRoZSBjbG91ZFxyXG4gICAgICAgIHZhciB3b3JkX2FycmF5ID0gW1xyXG4gICAgICAgICAgICB7IHRleHQ6ICdMb3JlbScsIHdlaWdodDogMTMsIC8qbGluazogJ2h0dHA6Ly90aGVtaWNvbi5jbycqLyB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdJcHN1bScsIHdlaWdodDogMTAuNSB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdEb2xvcicsIHdlaWdodDogOS40IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ1NpdCcsIHdlaWdodDogOCB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdBbWV0Jywgd2VpZ2h0OiA2LjIgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQ29uc2VjdGV0dXInLCB3ZWlnaHQ6IDUgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQWRpcGlzY2luZycsIHdlaWdodDogNSB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdTaXQnLCB3ZWlnaHQ6IDggfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQW1ldCcsIHdlaWdodDogNi4yIH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0NvbnNlY3RldHVyJywgd2VpZ2h0OiA1IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0FkaXBpc2NpbmcnLCB3ZWlnaHQ6IDUgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgICQoXCIjanFjbG91ZFwiKS5qUUNsb3VkKHdvcmRfYXJyYXksIHtcclxuICAgICAgICAgICAgd2lkdGg6IDI0MCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyMDAsXHJcbiAgICAgICAgICAgIHN0ZXBzOiA3XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTZWFyY2ggUmVzdWx0c1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTZWFyY2gpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWFyY2goKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5zbGlkZXIpIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4uY2hvc2VuKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmRhdGVwaWNrZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gQk9PVFNUUkFQIFNMSURFUiBDVFJMXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdWktc2xpZGVyXScpLnNsaWRlcigpO1xyXG5cclxuICAgICAgICAvLyBDSE9TRU5cclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcuY2hvc2VuLXNlbGVjdCcpLmNob3NlbigpO1xyXG5cclxuICAgICAgICAvLyBEQVRFVElNRVBJQ0tFUlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJyNkYXRldGltZXBpY2tlcicpLmRhdGVwaWNrZXIoe1xyXG4gICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgIGljb25zOiB7XHJcbiAgICAgICAgICAgICAgICB0aW1lOiAnZmEgZmEtY2xvY2stbycsXHJcbiAgICAgICAgICAgICAgICBkYXRlOiAnZmEgZmEtY2FsZW5kYXInLFxyXG4gICAgICAgICAgICAgICAgdXA6ICdmYSBmYS1jaGV2cm9uLXVwJyxcclxuICAgICAgICAgICAgICAgIGRvd246ICdmYSBmYS1jaGV2cm9uLWRvd24nLFxyXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6ICdmYSBmYS1jaGV2cm9uLWxlZnQnLFxyXG4gICAgICAgICAgICAgICAgbmV4dDogJ2ZhIGZhLWNoZXZyb24tcmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgdG9kYXk6ICdmYSBmYS1jcm9zc2hhaXJzJyxcclxuICAgICAgICAgICAgICAgIGNsZWFyOiAnZmEgZmEtdHJhc2gnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIERlbW8gQ2FyZHNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRDYXJkRGVtbyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdENhcmREZW1vKCkge1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9ucyBzaG93IGEgZGVtb25zdHJhdGlvbiBvZiBob3cgdG8gdXNlXHJcbiAgICAgICAgICogdGhlIGNhcmQgdG9vbHMgc3lzdGVtIHZpYSBjdXN0b20gZXZlbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGNhcmRMaXN0ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2FyZC5jYXJkLWRlbW8nKSk7XHJcbiAgICAgICAgY2FyZExpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQucmVmcmVzaCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGNhcmQgZWxlbWVudCB0aGF0IGlzIHJlZnJlc2hpbmdcclxuICAgICAgICAgICAgICAgIHZhciBjYXJkID0gZXZlbnQuZGV0YWlsLmNhcmQ7XHJcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtIGFueSBhY3Rpb24gaGVyZSwgd2hlbiBpdCBpcyBkb25lLFxyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBzcGlubmVyIGNhbGxpbmcgXCJyZW1vdmVTcGlubmVyXCJcclxuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQgdXNlZCB0byBzaW11bGF0ZSBhc3luYyBvcGVyYXRpb25cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2FyZC5yZW1vdmVTcGlubmVyLCAzMDAwKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjYXJkLmNvbGxhcHNlLmhpZGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYXJkIENvbGxhcHNlIEhpZGUnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjYXJkLmNvbGxhcHNlLnNob3cnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYXJkIENvbGxhcHNlIFNob3cnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjYXJkLnJlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybSA9IGV2ZW50LmRldGFpbC5jb25maXJtO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhbmNlbCA9IGV2ZW50LmRldGFpbC5jYW5jZWw7XHJcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtIGFueSBhY3Rpb24gIGhlcmVcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmluZyBDYXJkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBDYWxsIGNvbmZpcm0oKSB0byBjb250aW51ZSByZW1vdmluZyBjYXJkXHJcbiAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgY2FsbCBjYW5jZWwoKVxyXG4gICAgICAgICAgICAgICAgY29uZmlybSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQucmVtb3ZlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZlZCBDYXJkJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTmVzdGFibGUgZGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE5lc3RhYmxlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TmVzdGFibGUoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5uZXN0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgdXBkYXRlT3V0cHV0ID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdCA9IGUubGVuZ3RoID8gZSA6ICQoZS50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gbGlzdC5kYXRhKCdvdXRwdXQnKTtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5KU09OKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQudmFsKHdpbmRvdy5KU09OLnN0cmluZ2lmeShsaXN0Lm5lc3RhYmxlKCdzZXJpYWxpemUnKSkpOyAvLywgbnVsbCwgMikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnZhbCgnSlNPTiBicm93c2VyIHN1cHBvcnQgcmVxdWlyZWQgZm9yIHRoaXMgZGVtby4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGFjdGl2YXRlIE5lc3RhYmxlIGZvciBsaXN0IDFcclxuICAgICAgICAkKCcjbmVzdGFibGUnKS5uZXN0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICBncm91cDogMVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NoYW5nZScsIHVwZGF0ZU91dHB1dCk7XHJcblxyXG4gICAgICAgIC8vIGFjdGl2YXRlIE5lc3RhYmxlIGZvciBsaXN0IDJcclxuICAgICAgICAkKCcjbmVzdGFibGUyJykubmVzdGFibGUoe1xyXG4gICAgICAgICAgICAgICAgZ3JvdXA6IDFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCB1cGRhdGVPdXRwdXQpO1xyXG5cclxuICAgICAgICAvLyBvdXRwdXQgaW5pdGlhbCBzZXJpYWxpc2VkIGRhdGFcclxuICAgICAgICB1cGRhdGVPdXRwdXQoJCgnI25lc3RhYmxlJykuZGF0YSgnb3V0cHV0JywgJCgnI25lc3RhYmxlLW91dHB1dCcpKSk7XHJcbiAgICAgICAgdXBkYXRlT3V0cHV0KCQoJyNuZXN0YWJsZTInKS5kYXRhKCdvdXRwdXQnLCAkKCcjbmVzdGFibGUyLW91dHB1dCcpKSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1uZXN0YWJsZS1hY3Rpb24nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbiA9IHRhcmdldC5kYXRhKCdhY3Rpb24nKTtcclxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2V4cGFuZC1hbGwnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZGQnKS5uZXN0YWJsZSgnZXhwYW5kQWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2NvbGxhcHNlLWFsbCcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5kZCcpLm5lc3RhYmxlKCdjb2xsYXBzZUFsbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiBub3RpZnkuanNcclxuICogQ3JlYXRlIHRvZ2dsZWFibGUgbm90aWZpY2F0aW9ucyB0aGF0IGZhZGUgb3V0IGF1dG9tYXRpY2FsbHkuXHJcbiAqIEJhc2VkIG9uIE5vdGlmeSBhZGRvbiBmcm9tIFVJS2l0IChodHRwOi8vZ2V0dWlraXQuY29tL2RvY3MvYWRkb25zX25vdGlmeS5odG1sKVxyXG4gKiBbZGF0YS10b2dnbGU9XCJub3RpZnlcIl1cclxuICogW2RhdGEtb3B0aW9ucz1cIm9wdGlvbnMgaW4ganNvbiBmb3JtYXRcIiBdXHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE5vdGlmeSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE5vdGlmeSgpIHtcclxuXHJcbiAgICAgICAgdmFyIFNlbGVjdG9yID0gJ1tkYXRhLW5vdGlmeV0nLFxyXG4gICAgICAgICAgICBhdXRvbG9hZFNlbGVjdG9yID0gJ1tkYXRhLW9ubG9hZF0nLFxyXG4gICAgICAgICAgICBkb2MgPSAkKGRvY3VtZW50KTtcclxuXHJcbiAgICAgICAgJChTZWxlY3RvcikuZWFjaChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvbmxvYWQgPSAkdGhpcy5kYXRhKCdvbmxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvbmxvYWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZnlOb3coJHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfSwgODAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHRoaXMub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgbm90aWZ5Tm93KCR0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBub3RpZnlOb3coJGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9ICRlbGVtZW50LmRhdGEoJ21lc3NhZ2UnKSxcclxuICAgICAgICAgICAgb3B0aW9ucyA9ICRlbGVtZW50LmRhdGEoJ29wdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKCFtZXNzYWdlKVxyXG4gICAgICAgICAgICAkLmVycm9yKCdOb3RpZnk6IE5vIG1lc3NhZ2Ugc3BlY2lmaWVkJyk7XHJcblxyXG4gICAgICAgICQubm90aWZ5KG1lc3NhZ2UsIG9wdGlvbnMgfHwge30pO1xyXG4gICAgfVxyXG5cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuLyoqXHJcbiAqIE5vdGlmeSBBZGRvbiBkZWZpbml0aW9uIGFzIGpRdWVyeSBwbHVnaW5cclxuICogQWRhcHRlZCB2ZXJzaW9uIHRvIHdvcmsgd2l0aCBCb290c3RyYXAgY2xhc3Nlc1xyXG4gKiBNb3JlIGluZm9ybWF0aW9uIGh0dHA6Ly9nZXR1aWtpdC5jb20vZG9jcy9hZGRvbnNfbm90aWZ5Lmh0bWxcclxuICovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGNvbnRhaW5lcnMgPSB7fSxcclxuICAgICAgICBtZXNzYWdlcyA9IHt9LFxyXG5cclxuICAgICAgICBub3RpZnkgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC50eXBlKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0geyBtZXNzYWdlOiBvcHRpb25zIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMV0pIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZChvcHRpb25zLCAkLnR5cGUoYXJndW1lbnRzWzFdKSA9PSAnc3RyaW5nJyA/IHsgc3RhdHVzOiBhcmd1bWVudHNbMV0gfSA6IGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAobmV3IE1lc3NhZ2Uob3B0aW9ucykpLnNob3coKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlQWxsID0gZnVuY3Rpb24oZ3JvdXAsIGluc3RhbnRseSkge1xyXG4gICAgICAgICAgICBpZiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGlkIGluIG1lc3NhZ2VzKSB7IGlmIChncm91cCA9PT0gbWVzc2FnZXNbaWRdLmdyb3VwKSBtZXNzYWdlc1tpZF0uY2xvc2UoaW5zdGFudGx5KTsgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaWQgaW4gbWVzc2FnZXMpIHsgbWVzc2FnZXNbaWRdLmNsb3NlKGluc3RhbnRseSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgdmFyIE1lc3NhZ2UgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBNZXNzYWdlLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy51dWlkID0gXCJJRFwiICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSArIFwiUkFORFwiICsgKE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogMTAwMDAwKSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gJChbXHJcbiAgICAgICAgICAgIC8vIGFsZXJ0LWRpc21pc3NhYmxlIGVuYWJsZXMgYnMgY2xvc2UgaWNvblxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInVrLW5vdGlmeS1tZXNzYWdlIGFsZXJ0LWRpc21pc3NhYmxlXCI+JyxcclxuICAgICAgICAgICAgJzxhIGNsYXNzPVwiY2xvc2VcIj4mdGltZXM7PC9hPicsXHJcbiAgICAgICAgICAgICc8ZGl2PicgKyB0aGlzLm9wdGlvbnMubWVzc2FnZSArICc8L2Rpdj4nLFxyXG4gICAgICAgICAgICAnPC9kaXY+J1xyXG5cclxuICAgICAgICBdLmpvaW4oJycpKS5kYXRhKFwibm90aWZ5TWVzc2FnZVwiLCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gc3RhdHVzXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGF0dXMpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKCdhbGVydCBhbGVydC0nICsgdGhpcy5vcHRpb25zLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudHN0YXR1cyA9IHRoaXMub3B0aW9ucy5zdGF0dXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gdGhpcy5vcHRpb25zLmdyb3VwO1xyXG5cclxuICAgICAgICBtZXNzYWdlc1t0aGlzLnV1aWRdID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCFjb250YWluZXJzW3RoaXMub3B0aW9ucy5wb3NdKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcnNbdGhpcy5vcHRpb25zLnBvc10gPSAkKCc8ZGl2IGNsYXNzPVwidWstbm90aWZ5IHVrLW5vdGlmeS0nICsgdGhpcy5vcHRpb25zLnBvcyArICdcIj48L2Rpdj4nKS5hcHBlbmRUbygnYm9keScpLm9uKFwiY2xpY2tcIiwgXCIudWstbm90aWZ5LW1lc3NhZ2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoXCJub3RpZnlNZXNzYWdlXCIpLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgICQuZXh0ZW5kKE1lc3NhZ2UucHJvdG90eXBlLCB7XHJcblxyXG4gICAgICAgIHV1aWQ6IGZhbHNlLFxyXG4gICAgICAgIGVsZW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgIHRpbW91dDogZmFsc2UsXHJcbiAgICAgICAgY3VycmVudHN0YXR1czogXCJcIixcclxuICAgICAgICBncm91cDogZmFsc2UsXHJcblxyXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyc1t0aGlzLm9wdGlvbnMucG9zXS5zaG93KCkucHJlcGVuZCh0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcmdpbmJvdHRvbSA9IHBhcnNlSW50KHRoaXMuZWxlbWVudC5jc3MoXCJtYXJnaW4tYm90dG9tXCIpLCAxMCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHsgXCJvcGFjaXR5XCI6IDAsIFwibWFyZ2luLXRvcFwiOiAtMSAqIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpLCBcIm1hcmdpbi1ib3R0b21cIjogMCB9KS5hbmltYXRlKHsgXCJvcGFjaXR5XCI6IDEsIFwibWFyZ2luLXRvcFwiOiAwLCBcIm1hcmdpbi1ib3R0b21cIjogbWFyZ2luYm90dG9tIH0sIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkdGhpcy5vcHRpb25zLnRpbWVvdXQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb3NlZm4gPSBmdW5jdGlvbigpIHsgJHRoaXMuY2xvc2UoKTsgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoY2xvc2VmbiwgJHRoaXMub3B0aW9ucy50aW1lb3V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZWxlbWVudC5ob3ZlcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IGNsZWFyVGltZW91dCgkdGhpcy50aW1lb3V0KTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7ICR0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsb3NlZm4sICR0aGlzLm9wdGlvbnMudGltZW91dCk7IH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oaW5zdGFudGx5KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZmluYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lcnNbJHRoaXMub3B0aW9ucy5wb3NdLmNoaWxkcmVuKCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnNbJHRoaXMub3B0aW9ucy5wb3NdLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNzYWdlc1skdGhpcy51dWlkXTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnN0YW50bHkpIHtcclxuICAgICAgICAgICAgICAgIGZpbmFsaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYW5pbWF0ZSh7IFwib3BhY2l0eVwiOiAwLCBcIm1hcmdpbi10b3BcIjogLTEgKiB0aGlzLmVsZW1lbnQub3V0ZXJIZWlnaHQoKSwgXCJtYXJnaW4tYm90dG9tXCI6IDAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29udGVudDogZnVuY3Rpb24oaHRtbCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5maW5kKFwiPmRpdlwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghaHRtbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5odG1sKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RhdHVzOiBmdW5jdGlvbihzdGF0dXMpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50c3RhdHVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FsZXJ0IGFsZXJ0LScgKyB0aGlzLmN1cnJlbnRzdGF0dXMpLmFkZENsYXNzKCdhbGVydCBhbGVydC0nICsgc3RhdHVzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudHN0YXR1cyA9IHN0YXR1cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIE1lc3NhZ2UuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgbWVzc2FnZTogXCJcIixcclxuICAgICAgICBzdGF0dXM6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgdGltZW91dDogNTAwMCxcclxuICAgICAgICBncm91cDogbnVsbCxcclxuICAgICAgICBwb3M6ICd0b3AtY2VudGVyJ1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgJFtcIm5vdGlmeVwiXSA9IG5vdGlmeTtcclxuICAgICRbXCJub3RpZnlcIl0ubWVzc2FnZSA9IE1lc3NhZ2U7XHJcbiAgICAkW1wibm90aWZ5XCJdLmNsb3NlQWxsID0gY2xvc2VBbGw7XHJcblxyXG4gICAgcmV0dXJuIG5vdGlmeTtcclxuXHJcbn0oKSk7IiwiLyoqPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIE1vZHVsZTogcG9ydGxldC5qc1xyXG4gKiBEcmFnIGFuZCBkcm9wIGFueSBjYXJkIHRvIGNoYW5nZSBpdHMgcG9zaXRpb25cclxuICogVGhlIFNlbGVjdG9yIHNob3VsZCBjb3VsZCBiZSBhcHBsaWVkIHRvIGFueSBvYmplY3QgdGhhdCBjb250YWluc1xyXG4gKiBjYXJkLCBzbyAuY29sLSogZWxlbWVudCBhcmUgaWRlYWwuXHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBTVE9SQUdFX0tFWV9OQU1FID0gJ2pxLXBvcnRsZXRTdGF0ZSc7XHJcblxyXG4gICAgJChpbml0UG9ydGxldHMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3J0bGV0cygpIHtcclxuXHJcbiAgICAgICAgLy8gQ29tcG9uZW50IGlzIE5PVCBvcHRpb25hbFxyXG4gICAgICAgIGlmICghJC5mbi5zb3J0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgU2VsZWN0b3IgPSAnW2RhdGEtdG9nZ2xlPVwicG9ydGxldFwiXSc7XHJcblxyXG4gICAgICAgICQoU2VsZWN0b3IpLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgY29ubmVjdFdpdGg6ICAgICAgICAgIFNlbGVjdG9yLFxyXG4gICAgICAgICAgICBpdGVtczogICAgICAgICAgICAgICAgJ2Rpdi5jYXJkJyxcclxuICAgICAgICAgICAgaGFuZGxlOiAgICAgICAgICAgICAgICcucG9ydGxldC1oYW5kbGVyJyxcclxuICAgICAgICAgICAgb3BhY2l0eTogICAgICAgICAgICAgIDAuNyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICAgICAgICAgICdwb3J0bGV0IGJveC1wbGFjZWhvbGRlcicsXHJcbiAgICAgICAgICAgIGNhbmNlbDogICAgICAgICAgICAgICAnLnBvcnRsZXQtY2FuY2VsJyxcclxuICAgICAgICAgICAgZm9yY2VQbGFjZWhvbGRlclNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIGlmcmFtZUZpeDogICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgdG9sZXJhbmNlOiAgICAgICAgICAgICdwb2ludGVyJyxcclxuICAgICAgICAgICAgaGVscGVyOiAgICAgICAgICAgICAgICdvcmlnaW5hbCcsXHJcbiAgICAgICAgICAgIHJldmVydDogICAgICAgICAgICAgICAyMDAsXHJcbiAgICAgICAgICAgIGZvcmNlSGVscGVyU2l6ZTogICAgICB0cnVlLFxyXG4gICAgICAgICAgICB1cGRhdGU6ICAgICAgICAgICAgICAgc2F2ZVBvcnRsZXRPcmRlcixcclxuICAgICAgICAgICAgY3JlYXRlOiAgICAgICAgICAgICAgIGxvYWRQb3J0bGV0T3JkZXJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC8vIG9wdGlvbmFsbHkgZGlzYWJsZXMgbW91c2Ugc2VsZWN0aW9uXHJcbiAgICAgICAgLy8uZGlzYWJsZVNlbGVjdGlvbigpXHJcbiAgICAgICAgO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlUG9ydGxldE9yZGVyKGV2ZW50LCB1aSkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5nZXQoU1RPUkFHRV9LRVlfTkFNRSk7XHJcblxyXG4gICAgICAgIGlmICghZGF0YSkgeyBkYXRhID0ge307IH1cclxuXHJcbiAgICAgICAgZGF0YVt0aGlzLmlkXSA9ICQodGhpcykuc29ydGFibGUoJ3RvQXJyYXknKTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICAgICAgU3RvcmFnZXMubG9jYWxTdG9yYWdlLnNldChTVE9SQUdFX0tFWV9OQU1FLCBkYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvYWRQb3J0bGV0T3JkZXIoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFX0tFWV9OQU1FKTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBwb3JsZXRJZCA9IHRoaXMuaWQsXHJcbiAgICAgICAgICAgICAgICBjYXJkcyA9IGRhdGFbcG9ybGV0SWRdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNhcmRzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcG9ydGxldCA9ICQoJyMnICsgcG9ybGV0SWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChjYXJkcywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnIycgKyB2YWx1ZSkuYXBwZW5kVG8ocG9ydGxldCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHBvcmxldCBzYXZlIHN0YXRlXHJcbiAgICB3aW5kb3cucmVzZXRQb3JsZXRzID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5yZW1vdmUoU1RPUkFHRV9LRVlfTkFNRSk7XHJcbiAgICAgICAgLy8gcmVsb2FkIHRoZSBwYWdlXHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBIVE1MNSBTb3J0YWJsZSBkZW1vXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U29ydGFibGUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTb3J0YWJsZSgpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBzb3J0YWJsZSA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgc29ydGFibGUoJy5zb3J0YWJsZScsIHtcclxuICAgICAgICAgICAgZm9yY2VQbGFjZWhvbGRlclNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnPGRpdiBjbGFzcz1cImJveC1wbGFjZWhvbGRlciBwMCBtMFwiPjxkaXY+PC9kaXY+PC9kaXY+J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gU3dlZXQgQWxlcnRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTd2VldEFsZXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U3dlZXRBbGVydCgpIHtcclxuXHJcbiAgICAgICAgJCgnI3N3YWwtZGVtbzEnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc3dhbChcIkhlcmUncyBhIG1lc3NhZ2UhXCIpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzd2FsLWRlbW8yJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHN3YWwoXCJIZXJlJ3MgYSBtZXNzYWdlIVwiLCBcIkl0J3MgcHJldHR5LCBpc24ndCBpdD9cIilcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3N3YWwtZGVtbzMnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc3dhbChcIkdvb2Qgam9iIVwiLCBcIllvdSBjbGlja2VkIHRoZSBidXR0b24hXCIsIFwic3VjY2Vzc1wiKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjc3dhbC1kZW1vNCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQXJlIHlvdSBzdXJlPycsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnWW91ciB3aWxsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgdGhpcyBpbWFnaW5hcnkgZmlsZSEnLFxyXG4gICAgICAgICAgICAgICAgaWNvbjogJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAgICAgYnV0dG9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdZZXMsIGRlbGV0ZSBpdCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJnLWRhbmdlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc3dhbCgnQm9veWFoIScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzd2FsLWRlbW81Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBcmUgeW91IHN1cmU/JyxcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdZb3VyIHdpbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciB0aGlzIGltYWdpbmFyeSBmaWxlIScsXHJcbiAgICAgICAgICAgICAgICBpY29uOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICBidXR0b25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdObywgY2FuY2VsIHBseCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlybToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnWWVzLCBkZWxldGUgaXQhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJiZy1kYW5nZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbDogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oaXNDb25maXJtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNDb25maXJtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhbCgnRGVsZXRlZCEnLCAnWW91ciBpbWFnaW5hcnkgZmlsZSBoYXMgYmVlbiBkZWxldGVkLicsICdzdWNjZXNzJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YWwoJ0NhbmNlbGxlZCcsICdZb3VyIGltYWdpbmFyeSBmaWxlIGlzIHNhZmUgOiknLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gQ29sb3IgcGlja2VyXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q29sb3JQaWNrZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRDb2xvclBpY2tlcigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmNvbG9ycGlja2VyKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJy5kZW1vLWNvbG9ycGlja2VyJykuY29sb3JwaWNrZXIoKTtcclxuXHJcbiAgICAgICAgJCgnI2RlbW9fc2VsZWN0b3JzJykuY29sb3JwaWNrZXIoe1xyXG4gICAgICAgICAgICBjb2xvclNlbGVjdG9yczoge1xyXG4gICAgICAgICAgICAgICAgJ2RlZmF1bHQnOiAnIzc3Nzc3NycsXHJcbiAgICAgICAgICAgICAgICAncHJpbWFyeSc6IEFQUF9DT0xPUlNbJ3ByaW1hcnknXSxcclxuICAgICAgICAgICAgICAgICdzdWNjZXNzJzogQVBQX0NPTE9SU1snc3VjY2VzcyddLFxyXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBBUFBfQ09MT1JTWydpbmZvJ10sXHJcbiAgICAgICAgICAgICAgICAnd2FybmluZyc6IEFQUF9DT0xPUlNbJ3dhcm5pbmcnXSxcclxuICAgICAgICAgICAgICAgICdkYW5nZXInOiBBUFBfQ09MT1JTWydkYW5nZXInXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBGb3JtcyBEZW1vXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEZvcm1zRGVtbyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZvcm1zRGVtbygpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLnNsaWRlcikgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi5jaG9zZW4pIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4uaW5wdXRtYXNrKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmZpbGVzdHlsZSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi53eXNpd3lnKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmRhdGVwaWNrZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gQk9PVFNUUkFQIFNMSURFUiBDVFJMXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdWktc2xpZGVyXScpLnNsaWRlcigpO1xyXG5cclxuICAgICAgICAvLyBDSE9TRU5cclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcuY2hvc2VuLXNlbGVjdCcpLmNob3NlbigpO1xyXG5cclxuICAgICAgICAvLyBNQVNLRURcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCdbZGF0YS1tYXNrZWRdJykuaW5wdXRtYXNrKCk7XHJcblxyXG4gICAgICAgIC8vIEZJTEVTVFlMRVxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJy5maWxlc3R5bGUnKS5maWxlc3R5bGUoKTtcclxuXHJcbiAgICAgICAgLy8gV1lTSVdZR1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJy53eXNpd3lnJykud3lzaXd5ZygpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gREFURVRJTUVQSUNLRVJcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXIxJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICAgICAgaWNvbnM6IHtcclxuICAgICAgICAgICAgICAgIHRpbWU6ICdmYSBmYS1jbG9jay1vJyxcclxuICAgICAgICAgICAgICAgIGRhdGU6ICdmYSBmYS1jYWxlbmRhcicsXHJcbiAgICAgICAgICAgICAgICB1cDogJ2ZhIGZhLWNoZXZyb24tdXAnLFxyXG4gICAgICAgICAgICAgICAgZG93bjogJ2ZhIGZhLWNoZXZyb24tZG93bicsXHJcbiAgICAgICAgICAgICAgICBwcmV2aW91czogJ2ZhIGZhLWNoZXZyb24tbGVmdCcsXHJcbiAgICAgICAgICAgICAgICBuZXh0OiAnZmEgZmEtY2hldnJvbi1yaWdodCcsXHJcbiAgICAgICAgICAgICAgICB0b2RheTogJ2ZhIGZhLWNyb3NzaGFpcnMnLFxyXG4gICAgICAgICAgICAgICAgY2xlYXI6ICdmYSBmYS10cmFzaCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIG9ubHkgdGltZVxyXG4gICAgICAgICQoJyNkYXRldGltZXBpY2tlcjInKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZm9ybWF0OiAnbW0tZGQteXl5eSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBNb2R1bGU6IEltYWdlIENyb3BwZXJcclxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0SW1hZ2VDcm9wcGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SW1hZ2VDcm9wcGVyKCkge1xyXG5cclxuICAgICAgICBpZiAoISQuZm4uY3JvcHBlcikgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgJGltYWdlID0gJCgnLmltZy1jb250YWluZXIgPiBpbWcnKSxcclxuICAgICAgICAgICAgJGRhdGFYID0gJCgnI2RhdGFYJyksXHJcbiAgICAgICAgICAgICRkYXRhWSA9ICQoJyNkYXRhWScpLFxyXG4gICAgICAgICAgICAkZGF0YUhlaWdodCA9ICQoJyNkYXRhSGVpZ2h0JyksXHJcbiAgICAgICAgICAgICRkYXRhV2lkdGggPSAkKCcjZGF0YVdpZHRoJyksXHJcbiAgICAgICAgICAgICRkYXRhUm90YXRlID0gJCgnI2RhdGFSb3RhdGUnKSxcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIC8vIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIC8vICAgeDogNDIwLFxyXG4gICAgICAgICAgICAgICAgLy8gICB5OiA2MCxcclxuICAgICAgICAgICAgICAgIC8vICAgd2lkdGg6IDY0MCxcclxuICAgICAgICAgICAgICAgIC8vICAgaGVpZ2h0OiAzNjBcclxuICAgICAgICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAgICAgICAvLyBzdHJpY3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gcmVzcG9uc2l2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBjaGVja0ltYWdlT3JpZ2luOiBmYWxzZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1vZGFsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGd1aWRlczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBoaWdobGlnaHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja2dyb3VuZDogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYXV0b0Nyb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gYXV0b0Nyb3BBcmVhOiAwLjUsXHJcbiAgICAgICAgICAgICAgICAvLyBkcmFnQ3JvcDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIHJvdGF0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyB6b29tYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3VjaERyYWdab29tOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIG1vdXNlV2hlZWxab29tOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGNyb3BCb3hNb3ZhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGNyb3BCb3hSZXNpemFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gZG91YmxlQ2xpY2tUb2dnbGU6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1pbkNhbnZhc1dpZHRoOiAzMjAsXHJcbiAgICAgICAgICAgICAgICAvLyBtaW5DYW52YXNIZWlnaHQ6IDE4MCxcclxuICAgICAgICAgICAgICAgIC8vIG1pbkNyb3BCb3hXaWR0aDogMTYwLFxyXG4gICAgICAgICAgICAgICAgLy8gbWluQ3JvcEJveEhlaWdodDogOTAsXHJcbiAgICAgICAgICAgICAgICAvLyBtaW5Db250YWluZXJXaWR0aDogMzIwLFxyXG4gICAgICAgICAgICAgICAgLy8gbWluQ29udGFpbmVySGVpZ2h0OiAxODAsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYnVpbGQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAvLyBidWlsdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIGRyYWdzdGFydDogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIGRyYWdtb3ZlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgLy8gZHJhZ2VuZDogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIHpvb21pbjogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIHpvb21vdXQ6IG51bGwsXHJcblxyXG4gICAgICAgICAgICAgICAgYXNwZWN0UmF0aW86IDE2IC8gOSxcclxuICAgICAgICAgICAgICAgIHByZXZpZXc6ICcuaW1nLXByZXZpZXcnLFxyXG4gICAgICAgICAgICAgICAgY3JvcDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRkYXRhWC52YWwoTWF0aC5yb3VuZChkYXRhLngpKTtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVkudmFsKE1hdGgucm91bmQoZGF0YS55KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFIZWlnaHQudmFsKE1hdGgucm91bmQoZGF0YS5oZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVdpZHRoLnZhbChNYXRoLnJvdW5kKGRhdGEud2lkdGgpKTtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVJvdGF0ZS52YWwoTWF0aC5yb3VuZChkYXRhLnJvdGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAkaW1hZ2Uub24oe1xyXG4gICAgICAgICAgICAnYnVpbGQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdidWlsdC5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydC5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlLCBlLmRyYWdUeXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlLmNyb3BwZXInOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnR5cGUsIGUuZHJhZ1R5cGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ2VuZC5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlLCBlLmRyYWdUeXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3pvb21pbi5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3pvb21vdXQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdjaGFuZ2UuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5jcm9wcGVyKG9wdGlvbnMpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gTWV0aG9kc1xyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkub24oJ2NsaWNrJywgJ1tkYXRhLW1ldGhvZF0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSAkKHRoaXMpLmRhdGEoKSxcclxuICAgICAgICAgICAgICAgICR0YXJnZXQsXHJcbiAgICAgICAgICAgICAgICByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoISRpbWFnZS5kYXRhKCdjcm9wcGVyJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEubWV0aG9kKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gJC5leHRlbmQoe30sIGRhdGEpOyAvLyBDbG9uZSBhIG5ldyBvbmVcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEudGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXQgPSAkKGRhdGEudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhLm9wdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEub3B0aW9uID0gSlNPTi5wYXJzZSgkdGFyZ2V0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAkaW1hZ2UuY3JvcHBlcihkYXRhLm1ldGhvZCwgZGF0YS5vcHRpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLm1ldGhvZCA9PT0gJ2dldENyb3BwZWRDYW52YXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2dldENyb3BwZWRDYW52YXNNb2RhbCcpLm1vZGFsKCkuZmluZCgnLm1vZGFsLWJvZHknKS5odG1sKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCQuaXNQbGFpbk9iamVjdChyZXN1bHQpICYmICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LnZhbChKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCEkaW1hZ2UuZGF0YSgnY3JvcHBlcicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzNzpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAtMSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAwLCAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOTpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAxLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkaW1hZ2UuY3JvcHBlcignbW92ZScsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgLy8gSW1wb3J0IGltYWdlXHJcbiAgICAgICAgdmFyICRpbnB1dEltYWdlID0gJCgnI2lucHV0SW1hZ2UnKSxcclxuICAgICAgICAgICAgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMLFxyXG4gICAgICAgICAgICBibG9iVVJMO1xyXG5cclxuICAgICAgICBpZiAoVVJMKSB7XHJcbiAgICAgICAgICAgICRpbnB1dEltYWdlLmNoYW5nZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlcyA9IHRoaXMuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoISRpbWFnZS5kYXRhKCdjcm9wcGVyJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGUgPSBmaWxlc1swXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eaW1hZ2VcXC9cXHcrJC8udGVzdChmaWxlLnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2JVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW1hZ2Uub25lKCdidWlsdC5jcm9wcGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGJsb2JVUkwpOyAvLyBSZXZva2Ugd2hlbiBsb2FkIGNvbXBsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNyb3BwZXIoJ3Jlc2V0JykuY3JvcHBlcigncmVwbGFjZScsIGJsb2JVUkwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW5wdXRJbWFnZS52YWwoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdQbGVhc2UgY2hvb3NlIGFuIGltYWdlIGZpbGUuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkaW5wdXRJbWFnZS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBPcHRpb25zXHJcbiAgICAgICAgJCgnLmRvY3Mtb3B0aW9ucyA6Y2hlY2tib3gnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoISRpbWFnZS5kYXRhKCdjcm9wcGVyJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9uc1skdGhpcy52YWwoKV0gPSAkdGhpcy5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICRpbWFnZS5jcm9wcGVyKCdkZXN0cm95JykuY3JvcHBlcihvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIFRvb2x0aXBzXHJcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFNlbGVjdDJcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTZWxlY3QyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2VsZWN0MigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLnNlbGVjdDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gU2VsZWN0IDJcclxuXHJcbiAgICAgICAgJCgnI3NlbGVjdDItMScpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2Jvb3RzdHJhcDQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3NlbGVjdDItMicpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2Jvb3RzdHJhcDQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3NlbGVjdDItMycpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2Jvb3RzdHJhcDQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3NlbGVjdDItNCcpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1NlbGVjdCBhIHN0YXRlJyxcclxuICAgICAgICAgICAgYWxsb3dDbGVhcjogdHJ1ZSxcclxuICAgICAgICAgICAgdGhlbWU6ICdib290c3RyYXA0J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGlmICh0eXBlb2YgRHJvcHpvbmUgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgLy8gUHJldmVudCBEcm9wem9uZSBmcm9tIGF1dG8gZGlzY292ZXJpbmdcclxuICAgIC8vIFRoaXMgaXMgdXNlZnVsIHdoZW4geW91IHdhbnQgdG8gY3JlYXRlIHRoZVxyXG4gICAgLy8gRHJvcHpvbmUgcHJvZ3JhbW1hdGljYWxseSBsYXRlclxyXG4gICAgRHJvcHpvbmUuYXV0b0Rpc2NvdmVyID0gZmFsc2U7XHJcblxyXG4gICAgJChpbml0RHJvcHpvbmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXREcm9wem9uZSgpIHtcclxuXHJcbiAgICAgICAgLy8gRHJvcHpvbmUgc2V0dGluZ3NcclxuICAgICAgICB2YXIgZHJvcHpvbmVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBhdXRvUHJvY2Vzc1F1ZXVlOiBmYWxzZSxcclxuICAgICAgICAgICAgdXBsb2FkTXVsdGlwbGU6IHRydWUsXHJcbiAgICAgICAgICAgIHBhcmFsbGVsVXBsb2FkczogMTAwLFxyXG4gICAgICAgICAgICBtYXhGaWxlczogMTAwLFxyXG4gICAgICAgICAgICBkaWN0RGVmYXVsdE1lc3NhZ2U6ICc8ZW0gY2xhc3M9XCJmYSBmYS11cGxvYWQgdGV4dC1tdXRlZFwiPjwvZW0+PGJyPkRyb3AgZmlsZXMgaGVyZSB0byB1cGxvYWQnLCAvLyBkZWZhdWx0IG1lc3NhZ2VzIGJlZm9yZSBmaXJzdCBkcm9wXHJcbiAgICAgICAgICAgIHBhcmFtTmFtZTogJ2ZpbGUnLCAvLyBUaGUgbmFtZSB0aGF0IHdpbGwgYmUgdXNlZCB0byB0cmFuc2ZlciB0aGUgZmlsZVxyXG4gICAgICAgICAgICBtYXhGaWxlc2l6ZTogMiwgLy8gTUJcclxuICAgICAgICAgICAgYWRkUmVtb3ZlTGlua3M6IHRydWUsXHJcbiAgICAgICAgICAgIGFjY2VwdDogZnVuY3Rpb24oZmlsZSwgZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUubmFtZSA9PT0gJ2p1c3RpbmJpZWJlci5qcGcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgnTmFoYSwgeW91IGRvbnQuIDopJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHpIYW5kbGVyID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9c3VibWl0XScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGR6SGFuZGxlci5wcm9jZXNzUXVldWUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbignYWRkZWRmaWxlJywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBZGRlZCBmaWxlOiAnICsgZmlsZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbigncmVtb3ZlZGZpbGUnLCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgZmlsZTogJyArIGZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMub24oJ3NlbmRpbmdtdWx0aXBsZScsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbignc3VjY2Vzc211bHRpcGxlJywgZnVuY3Rpb24oIC8qZmlsZXMsIHJlc3BvbnNlKi8gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uKCdlcnJvcm11bHRpcGxlJywgZnVuY3Rpb24oIC8qZmlsZXMsIHJlc3BvbnNlKi8gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGRyb3B6b25lQXJlYSA9IG5ldyBEcm9wem9uZSgnI2Ryb3B6b25lLWFyZWEnLCBkcm9wem9uZU9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRm9ybXMgRGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRXaXphcmQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRXaXphcmQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi52YWxpZGF0ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBGT1JNIEVYQU1QTEVcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciBmb3JtID0gJChcIiNleGFtcGxlLWZvcm1cIik7XHJcbiAgICAgICAgZm9ybS52YWxpZGF0ZSh7XHJcbiAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiBlcnJvclBsYWNlbWVudChlcnJvciwgZWxlbWVudCkgeyBlbGVtZW50LmJlZm9yZShlcnJvcik7IH0sXHJcbiAgICAgICAgICAgIHJ1bGVzOiB7XHJcbiAgICAgICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXF1YWxUbzogXCIjcGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZm9ybS5jaGlsZHJlbihcImRpdlwiKS5zdGVwcyh7XHJcbiAgICAgICAgICAgIGhlYWRlclRhZzogXCJoNFwiLFxyXG4gICAgICAgICAgICBib2R5VGFnOiBcImZpZWxkc2V0XCIsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25FZmZlY3Q6IFwic2xpZGVMZWZ0XCIsXHJcbiAgICAgICAgICAgIG9uU3RlcENoYW5naW5nOiBmdW5jdGlvbihldmVudCwgY3VycmVudEluZGV4LCBuZXdJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgZm9ybS52YWxpZGF0ZSgpLnNldHRpbmdzLmlnbm9yZSA9IFwiOmRpc2FibGVkLDpoaWRkZW5cIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtLnZhbGlkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRmluaXNoaW5nOiBmdW5jdGlvbihldmVudCwgY3VycmVudEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBmb3JtLnZhbGlkYXRlKCkuc2V0dGluZ3MuaWdub3JlID0gXCI6ZGlzYWJsZWRcIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtLnZhbGlkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGZ1bmN0aW9uKGV2ZW50LCBjdXJyZW50SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiU3VibWl0dGVkIVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdWJtaXQgZm9ybVxyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5zdWJtaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBWRVJUSUNBTFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoXCIjZXhhbXBsZS12ZXJ0aWNhbFwiKS5zdGVwcyh7XHJcbiAgICAgICAgICAgIGhlYWRlclRhZzogXCJoNFwiLFxyXG4gICAgICAgICAgICBib2R5VGFnOiBcInNlY3Rpb25cIixcclxuICAgICAgICAgICAgdHJhbnNpdGlvbkVmZmVjdDogXCJzbGlkZUxlZnRcIixcclxuICAgICAgICAgICAgc3RlcHNPcmllbnRhdGlvbjogXCJ2ZXJ0aWNhbFwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBYZWRpdGFibGUgRGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFhFZGl0YWJsZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFhFZGl0YWJsZSgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmVkaXRhYmxlKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8gRm9udCBBd2Vzb21lIHN1cHBvcnRcclxuICAgICAgICAkLmZuLmVkaXRhYmxlZm9ybS5idXR0b25zID1cclxuICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0YWJsZS1zdWJtaXRcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtZncgZmEtY2hlY2tcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L2J1dHRvbj4nICtcclxuICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBlZGl0YWJsZS1jYW5jZWxcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtZncgZmEtdGltZXNcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L2J1dHRvbj4nO1xyXG5cclxuICAgICAgICAvL2RlZmF1bHRzXHJcbiAgICAgICAgLy8kLmZuLmVkaXRhYmxlLmRlZmF1bHRzLnVybCA9ICd1cmwvdG8vc2VydmVyJztcclxuXHJcbiAgICAgICAgLy9lbmFibGUgLyBkaXNhYmxlXHJcbiAgICAgICAgJCgnI2VuYWJsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjdXNlciAuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlRGlzYWJsZWQnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9lZGl0YWJsZXNcclxuICAgICAgICAkKCcjdXNlcm5hbWUnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIC8vIHVybDogJ3VybC90by9zZXJ2ZXInLFxyXG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgIHBrOiAxLFxyXG4gICAgICAgICAgICBuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0VudGVyIHVzZXJuYW1lJyxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI2ZpcnN0bmFtZScpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgdmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC50cmltKHZhbHVlKSA9PT0gJycpIHJldHVybiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzZXgnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIHByZXBlbmQ6IFwibm90IHNlbGVjdGVkXCIsXHJcbiAgICAgICAgICAgIHNvdXJjZTogW1xyXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogMSwgdGV4dDogJ01hbGUnIH0sXHJcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAyLCB0ZXh0OiAnRmVtYWxlJyB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKHZhbHVlLCBzb3VyY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JzID0geyBcIlwiOiBcImdyYXlcIiwgMTogXCJncmVlblwiLCAyOiBcImJsdWVcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0gPSAkLmdyZXAoc291cmNlRGF0YSwgZnVuY3Rpb24obykgeyByZXR1cm4gby52YWx1ZSA9PSB2YWx1ZTsgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KGVsZW1bMF0udGV4dCkuY3NzKFwiY29sb3JcIiwgY29sb3JzW3ZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3N0YXR1cycpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI2dyb3VwJykuZWRpdGFibGUoe1xyXG4gICAgICAgICAgICBzaG93YnV0dG9uczogZmFsc2UsXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNkb2InKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNldmVudCcpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgcGxhY2VtZW50OiAncmlnaHQnLFxyXG4gICAgICAgICAgICBjb21ib2RhdGU6IHtcclxuICAgICAgICAgICAgICAgIGZpcnN0SXRlbTogJ25hbWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNjb21tZW50cycpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgc2hvd2J1dHRvbnM6ICdib3R0b20nLFxyXG4gICAgICAgICAgICBtb2RlOiAnaW5saW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjbm90ZScpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcjcGVuY2lsJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQoJyNub3RlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjdXNlciAuZWRpdGFibGUnKS5vbignaGlkZGVuJywgZnVuY3Rpb24oZSwgcmVhc29uKSB7XHJcbiAgICAgICAgICAgIGlmIChyZWFzb24gPT09ICdzYXZlJyB8fCByZWFzb24gPT09ICdub2NoYW5nZScpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkbmV4dCA9ICQodGhpcykuY2xvc2VzdCgndHInKS5uZXh0KCkuZmluZCgnLmVkaXRhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnI2F1dG9vcGVuJykuaXMoJzpjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV4dC5lZGl0YWJsZSgnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRuZXh0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVEFCTEVcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcjdXNlcnMgYScpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0VudGVyIHVzZXJuYW1lJyxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8qKlxyXG4gKiBVc2VkIGZvciB1c2VyIHBhZ2VzXHJcbiAqIExvZ2luIGFuZCBSZWdpc3RlclxyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFBhcnNsZXlGb3JQYWdlcylcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFyc2xleUZvclBhZ2VzKCkge1xyXG5cclxuICAgICAgICAvLyBQYXJzbGV5IG9wdGlvbnMgc2V0dXAgZm9yIGJvb3RzdHJhcCB2YWxpZGF0aW9uIGNsYXNzZXNcclxuICAgICAgICB2YXIgcGFyc2xleU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkJyxcclxuICAgICAgICAgICAgc3VjY2Vzc0NsYXNzOiAnaXMtdmFsaWQnLFxyXG4gICAgICAgICAgICBjbGFzc0hhbmRsZXI6IGZ1bmN0aW9uKFBhcnNsZXlGaWVsZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gUGFyc2xleUZpZWxkLiRlbGVtZW50LnBhcmVudHMoJy5mb3JtLWdyb3VwJykuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGlmICghZWwubGVuZ3RoKSAvLyBzdXBwb3J0IGN1c3RvbSBjaGVja2JveFxyXG4gICAgICAgICAgICAgICAgICAgIGVsID0gUGFyc2xleUZpZWxkLiRlbGVtZW50LnBhcmVudHMoJy5jLWNoZWNrYm94JykuZmluZCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3JzQ29udGFpbmVyOiBmdW5jdGlvbihQYXJzbGV5RmllbGQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzbGV5RmllbGQuJGVsZW1lbnQucGFyZW50cygnLmZvcm0tZ3JvdXAnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3JzV3JhcHBlcjogJzxkaXYgY2xhc3M9XCJ0ZXh0LWhlbHBcIj4nLFxyXG4gICAgICAgICAgICBlcnJvclRlbXBsYXRlOiAnPGRpdj48L2Rpdj4nXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gTG9naW4gZm9ybSB2YWxpZGF0aW9uIHdpdGggUGFyc2xleVxyXG4gICAgICAgIHZhciBsb2dpbkZvcm0gPSAkKFwiI2xvZ2luRm9ybVwiKTtcclxuICAgICAgICBpZiAobG9naW5Gb3JtLmxlbmd0aClcclxuICAgICAgICAgICAgbG9naW5Gb3JtLnBhcnNsZXkocGFyc2xleU9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBSZWdpc3RlciBmb3JtIHZhbGlkYXRpb24gd2l0aCBQYXJzbGV5XHJcbiAgICAgICAgdmFyIHJlZ2lzdGVyRm9ybSA9ICQoXCIjcmVnaXN0ZXJGb3JtXCIpO1xyXG4gICAgICAgIGlmIChyZWdpc3RlckZvcm0ubGVuZ3RoKVxyXG4gICAgICAgICAgICByZWdpc3RlckZvcm0ucGFyc2xleShwYXJzbGV5T3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiBnbWFwLmpzXHJcbiAqIEluaXQgR29vZ2xlIE1hcCBwbHVnaW5cclxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0R29vZ2xlTWFwcyk7XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gTWFwIFN0eWxlIGRlZmluaXRpb25cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEdldCBtb3JlIHN0eWxlcyBmcm9tIGh0dHA6Ly9zbmF6enltYXBzLmNvbS9zdHlsZS8yOS9saWdodC1tb25vY2hyb21lXHJcbiAgICAvLyAtIEp1c3QgcmVwbGFjZSBhbmQgYXNzaWduIHRvICdNYXBTdHlsZXMnIHRoZSBuZXcgc3R5bGUgYXJyYXlcclxuICAgIHZhciBNYXBTdHlsZXMgPSBbeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29uJyB9LCB7IGNvbG9yOiAnI2JkZDFmOScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ2FsbCcsIGVsZW1lbnRUeXBlOiAnbGFiZWxzLnRleHQuZmlsbCcsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzMzNDE2NScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ2xhbmRzY2FwZScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnI2U5ZWJmMScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQuaGlnaHdheScsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNjNWM2YzYnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkLmFydGVyaWFsJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnI2ZmZicgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQubG9jYWwnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjZmZmJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAndHJhbnNpdCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNkOGRiZTAnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdwb2knLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjY2ZkNWUwJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWRtaW5pc3RyYXRpdmUnLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb24nIH0sIHsgbGlnaHRuZXNzOiAzMyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncG9pLnBhcmsnLCBlbGVtZW50VHlwZTogJ2xhYmVscycsIHN0eWxlcnM6IFt7IHZpc2liaWxpdHk6ICdvbicgfSwgeyBsaWdodG5lc3M6IDIwIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkJywgc3R5bGVyczogW3sgY29sb3I6ICcjZDhkYmUwJywgbGlnaHRuZXNzOiAyMCB9XSB9XTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdvb2dsZU1hcHMoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5nTWFwKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBtYXBTZWxlY3RvciA9ICdbZGF0YS1nbWFwXSc7XHJcbiAgICAgICAgdmFyIGdNYXBSZWZzID0gW107XHJcblxyXG4gICAgICAgICQobWFwU2VsZWN0b3IpLmVhY2goZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzc2VzID0gJHRoaXMuZGF0YSgnYWRkcmVzcycpICYmICR0aGlzLmRhdGEoJ2FkZHJlc3MnKS5zcGxpdCgnOycpLFxyXG4gICAgICAgICAgICAgICAgdGl0bGVzID0gJHRoaXMuZGF0YSgndGl0bGUnKSAmJiAkdGhpcy5kYXRhKCd0aXRsZScpLnNwbGl0KCc7JyksXHJcbiAgICAgICAgICAgICAgICB6b29tID0gJHRoaXMuZGF0YSgnem9vbScpIHx8IDE0LFxyXG4gICAgICAgICAgICAgICAgbWFwdHlwZSA9ICR0aGlzLmRhdGEoJ21hcHR5cGUnKSB8fCAnUk9BRE1BUCcsIC8vIG9yICdURVJSQUlOJ1xyXG4gICAgICAgICAgICAgICAgbWFya2VycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFkZHJlc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYSBpbiBhZGRyZXNzZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1thXSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogYWRkcmVzc2VzW2FdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogKHRpdGxlcyAmJiB0aXRsZXNbYV0pIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXA6IHRydWUgLyogQWx3YXlzIHBvcHVwICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5Db250cm9sOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tQ29udHJvbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUNvbnRyb2w6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlQ29udHJvbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0Vmlld0NvbnRyb2w6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ2aWV3TWFwQ29udHJvbDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcHR5cGU6IG1hcHR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyczogbWFya2VycyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiB6b29tXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTW9yZSBvcHRpb25zIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJpb2VzdHJhZGEvalF1ZXJ5LWdNYXBcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGdNYXAgPSAkdGhpcy5nTWFwKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByZWYgPSBnTWFwLmRhdGEoJ2dNYXAucmVmZXJlbmNlJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBzYXZlIGluIHRoZSBtYXAgcmVmZXJlbmNlcyBsaXN0XHJcbiAgICAgICAgICAgICAgICBnTWFwUmVmcy5wdXNoKHJlZik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBzdHlsZXNcclxuICAgICAgICAgICAgICAgIGlmICgkdGhpcy5kYXRhKCdzdHlsZWQnKSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlZi5zZXRPcHRpb25zKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBNYXBTdHlsZXNcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7IC8vZWFjaFxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8galZlY3Rvck1hcFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRWZWN0b3JNYXApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWZWN0b3JNYXAoKSB7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gJCgnW2RhdGEtdmVjdG9yLW1hcF0nKTtcclxuXHJcbiAgICAgICAgdmFyIHNlcmllc0RhdGEgPSB7XHJcbiAgICAgICAgICAgICdDQSc6IDExMTAwLCAvLyBDYW5hZGFcclxuICAgICAgICAgICAgJ0RFJzogMjUxMCwgLy8gR2VybWFueVxyXG4gICAgICAgICAgICAnRlInOiAzNzEwLCAvLyBGcmFuY2VcclxuICAgICAgICAgICAgJ0FVJzogNTcxMCwgLy8gQXVzdHJhbGlhXHJcbiAgICAgICAgICAgICdHQic6IDgzMTAsIC8vIEdyZWF0IEJyaXRhaW5cclxuICAgICAgICAgICAgJ1JVJzogOTMxMCwgLy8gUnVzc2lhXHJcbiAgICAgICAgICAgICdCUic6IDY2MTAsIC8vIEJyYXppbFxyXG4gICAgICAgICAgICAnSU4nOiA3ODEwLCAvLyBJbmRpYVxyXG4gICAgICAgICAgICAnQ04nOiA0MzEwLCAvLyBDaGluYVxyXG4gICAgICAgICAgICAnVVMnOiA4MzksIC8vIFVTQVxyXG4gICAgICAgICAgICAnU0EnOiA0MTAgLy8gU2F1ZGkgQXJhYmlhXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIG1hcmtlcnNEYXRhID0gW1xyXG4gICAgICAgICAgICB7IGxhdExuZzogWzQxLjkwLCAxMi40NV0sIG5hbWU6ICdWYXRpY2FuIENpdHknIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNDMuNzMsIDcuNDFdLCBuYW1lOiAnTW9uYWNvJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWy0wLjUyLCAxNjYuOTNdLCBuYW1lOiAnTmF1cnUnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbLTguNTEsIDE3OS4yMV0sIG5hbWU6ICdUdXZhbHUnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNy4xMSwgMTcxLjA2XSwgbmFtZTogJ01hcnNoYWxsIElzbGFuZHMnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbMTcuMywgLTYyLjczXSwgbmFtZTogJ1NhaW50IEtpdHRzIGFuZCBOZXZpcycgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFszLjIsIDczLjIyXSwgbmFtZTogJ01hbGRpdmVzJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzM1Ljg4LCAxNC41XSwgbmFtZTogJ01hbHRhJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzQxLjAsIC03MS4wNl0sIG5hbWU6ICdOZXcgRW5nbGFuZCcgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFsxMi4wNSwgLTYxLjc1XSwgbmFtZTogJ0dyZW5hZGEnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbMTMuMTYsIC01OS41NV0sIG5hbWU6ICdCYXJiYWRvcycgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFsxNy4xMSwgLTYxLjg1XSwgbmFtZTogJ0FudGlndWEgYW5kIEJhcmJ1ZGEnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbLTQuNjEsIDU1LjQ1XSwgbmFtZTogJ1NleWNoZWxsZXMnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNy4zNSwgMTM0LjQ2XSwgbmFtZTogJ1BhbGF1JyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzQyLjUsIDEuNTFdLCBuYW1lOiAnQW5kb3JyYScgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIG5ldyBWZWN0b3JNYXAoZWxlbWVudCwgc2VyaWVzRGF0YSwgbWFya2Vyc0RhdGEpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gSlZFQ1RPUiBNQVBcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBBbGxvdyBHbG9iYWwgYWNjZXNzXHJcbiAgICB3aW5kb3cuVmVjdG9yTWFwID0gVmVjdG9yTWFwXHJcblxyXG4gICAgdmFyIGRlZmF1bHRDb2xvcnMgPSB7XHJcbiAgICAgICAgbWFya2VyQ29sb3I6ICcjMjNiN2U1JywgLy8gdGhlIG1hcmtlciBwb2ludHNcclxuICAgICAgICBiZ0NvbG9yOiAndHJhbnNwYXJlbnQnLCAvLyB0aGUgYmFja2dyb3VuZFxyXG4gICAgICAgIHNjYWxlQ29sb3JzOiBbJyM4NzhjOWEnXSwgLy8gdGhlIGNvbG9yIG9mIHRoZSByZWdpb24gaW4gdGhlIHNlcmllXHJcbiAgICAgICAgcmVnaW9uRmlsbDogJyNiYmJlYzYnIC8vIHRoZSBiYXNlIHJlZ2lvbiBjb2xvclxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBWZWN0b3JNYXAoZWxlbWVudCwgc2VyaWVzRGF0YSwgbWFya2Vyc0RhdGEpIHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgYXR0cnMgPSBlbGVtZW50LmRhdGEoKSxcclxuICAgICAgICAgICAgbWFwSGVpZ2h0ID0gYXR0cnMuaGVpZ2h0IHx8ICczMDAnLFxyXG4gICAgICAgICAgICBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgbWFya2VyQ29sb3I6IGF0dHJzLm1hcmtlckNvbG9yIHx8IGRlZmF1bHRDb2xvcnMubWFya2VyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiZ0NvbG9yOiBhdHRycy5iZ0NvbG9yIHx8IGRlZmF1bHRDb2xvcnMuYmdDb2xvcixcclxuICAgICAgICAgICAgICAgIHNjYWxlOiBhdHRycy5zY2FsZSB8fCAxLFxyXG4gICAgICAgICAgICAgICAgc2NhbGVDb2xvcnM6IGF0dHJzLnNjYWxlQ29sb3JzIHx8IGRlZmF1bHRDb2xvcnMuc2NhbGVDb2xvcnMsXHJcbiAgICAgICAgICAgICAgICByZWdpb25GaWxsOiBhdHRycy5yZWdpb25GaWxsIHx8IGRlZmF1bHRDb2xvcnMucmVnaW9uRmlsbCxcclxuICAgICAgICAgICAgICAgIG1hcE5hbWU6IGF0dHJzLm1hcE5hbWUgfHwgJ3dvcmxkX21pbGxfZW4nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBtYXBIZWlnaHQpO1xyXG5cclxuICAgICAgICBpbml0KGVsZW1lbnQsIG9wdGlvbnMsIHNlcmllc0RhdGEsIG1hcmtlcnNEYXRhKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgkZWxlbWVudCwgb3B0cywgc2VyaWVzLCBtYXJrZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWN0b3JNYXAoe1xyXG4gICAgICAgICAgICAgICAgbWFwOiBvcHRzLm1hcE5hbWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IG9wdHMuYmdDb2xvcixcclxuICAgICAgICAgICAgICAgIHpvb21NaW46IDEsXHJcbiAgICAgICAgICAgICAgICB6b29tTWF4OiA4LFxyXG4gICAgICAgICAgICAgICAgem9vbU9uU2Nyb2xsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvblN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmlsbCc6IG9wdHMucmVnaW9uRmlsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2UnOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDFcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLjhcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6ICdibHVlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRIb3Zlcjoge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uOiB7IHg6IDAuNCwgeTogMC42LCBzY2FsZTogb3B0cy5zY2FsZSB9LFxyXG4gICAgICAgICAgICAgICAgbWFya2VyU3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IG9wdHMubWFya2VyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogb3B0cy5tYXJrZXJDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblJlZ2lvbkxhYmVsU2hvdzogZnVuY3Rpb24oZSwgZWwsIGNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWVzICYmIHNlcmllc1tjb2RlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuaHRtbChlbC5odG1sKCkgKyAnOiAnICsgc2VyaWVzW2NvZGVdICsgJyB2aXNpdG9ycycpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcmtlcnM6IG1hcmtlcnMsXHJcbiAgICAgICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHNlcmllcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IG9wdHMuc2NhbGVDb2xvcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZUZ1bmN0aW9uOiAncG9seW5vbWlhbCdcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0gLy8gZW5kIGluaXRcclxuICAgIH07XHJcblxyXG59KSgpOyIsIi8vIEJPT1RHUklEXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Qm9vdGdyaWQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRCb290Z3JpZCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmJvb3RncmlkKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJyNib290Z3JpZC1iYXNpYycpLmJvb3RncmlkKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyB0ZW1wbGF0ZXMgZm9yIEJTNFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uQnV0dG9uOiAnPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCIgdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwie3tjdHgudGV4dH19XCI+e3tjdHguY29udGVudH19PC9idXR0b24+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duOiAnPGRpdiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudX19XCI+PGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGRyb3Bkb3duLXRvZ2dsZSBkcm9wZG93bi10b2dnbGUtbm9jYXJldFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVUZXh0fX1cIj57e2N0eC5jb250ZW50fX08L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51SXRlbXN9fVwiIHJvbGU9XCJtZW51XCI+PC91bD48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25JdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxhIGhyZWY9XCJcIiBkYXRhLWFjdGlvbj1cInt7Y3R4LmFjdGlvbn19XCIgY2xhc3M9XCJkcm9wZG93bi1saW5rIHt7Y3NzLmRyb3BEb3duSXRlbUJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duQ2hlY2tib3hJdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxsYWJlbCBjbGFzcz1cImRyb3Bkb3duLWl0ZW0gcC0wXCI+PGlucHV0IG5hbWU9XCJ7e2N0eC5uYW1lfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIjFcIiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duSXRlbUNoZWNrYm94fX1cIiB7e2N0eC5jaGVja2VkfX0gLz4ge3tjdHgubGFiZWx9fTwvbGFiZWw+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkl0ZW06ICc8bGkgY2xhc3M9XCJwYWdlLWl0ZW0ge3tjdHguY3NzfX1cIj48YSBocmVmPVwiXCIgZGF0YS1wYWdlPVwie3tjdHgucGFnZX19XCIgY2xhc3M9XCJwYWdlLWxpbmsge3tjc3MucGFnaW5hdGlvbkJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjYm9vdGdyaWQtc2VsZWN0aW9uJykuYm9vdGdyaWQoe1xyXG4gICAgICAgICAgICBzZWxlY3Rpb246IHRydWUsXHJcbiAgICAgICAgICAgIG11bHRpU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICByb3dTZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGtlZXBTZWxlY3Rpb246IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlczoge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0OlxyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY3VzdG9tLWNvbnRyb2wgY3VzdG9tLWNoZWNrYm94XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ7e2N0eC50eXBlfX1cIiBjbGFzcz1cImN1c3RvbS1jb250cm9sLWlucHV0IHt7Y3NzLnNlbGVjdEJveH19XCIgaWQ9XCJjdXN0b21DaGVjazFcIiB2YWx1ZT1cInt7Y3R4LnZhbHVlfX1cIiB7e2N0eC5jaGVja2VkfX0+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiY3VzdG9tLWNvbnRyb2wtbGFiZWxcIiBmb3I9XCJjdXN0b21DaGVjazFcIj48L2xhYmVsPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAvLyB0ZW1wbGF0ZXMgZm9yIEJTNFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uQnV0dG9uOiAnPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCIgdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwie3tjdHgudGV4dH19XCI+e3tjdHguY29udGVudH19PC9idXR0b24+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duOiAnPGRpdiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudX19XCI+PGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGRyb3Bkb3duLXRvZ2dsZSBkcm9wZG93bi10b2dnbGUtbm9jYXJldFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVUZXh0fX1cIj57e2N0eC5jb250ZW50fX08L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51SXRlbXN9fVwiIHJvbGU9XCJtZW51XCI+PC91bD48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25JdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxhIGhyZWY9XCJcIiBkYXRhLWFjdGlvbj1cInt7Y3R4LmFjdGlvbn19XCIgY2xhc3M9XCJkcm9wZG93bi1saW5rIHt7Y3NzLmRyb3BEb3duSXRlbUJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duQ2hlY2tib3hJdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxsYWJlbCBjbGFzcz1cImRyb3Bkb3duLWl0ZW0gcC0wXCI+PGlucHV0IG5hbWU9XCJ7e2N0eC5uYW1lfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIjFcIiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duSXRlbUNoZWNrYm94fX1cIiB7e2N0eC5jaGVja2VkfX0gLz4ge3tjdHgubGFiZWx9fTwvbGFiZWw+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkl0ZW06ICc8bGkgY2xhc3M9XCJwYWdlLWl0ZW0ge3tjdHguY3NzfX1cIj48YSBocmVmPVwiXCIgZGF0YS1wYWdlPVwie3tjdHgucGFnZX19XCIgY2xhc3M9XCJwYWdlLWxpbmsge3tjc3MucGFnaW5hdGlvbkJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgZ3JpZCA9ICQoJyNib290Z3JpZC1jb21tYW5kJykuYm9vdGdyaWQoe1xyXG4gICAgICAgICAgICBmb3JtYXR0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kczogZnVuY3Rpb24oY29sdW1uLCByb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4taW5mbyBtci0yIGNvbW1hbmQtZWRpdFwiIGRhdGEtcm93LWlkPVwiJyArIHJvdy5pZCArICdcIj48ZW0gY2xhc3M9XCJmYSBmYS1lZGl0IGZhLWZ3XCI+PC9lbT48L2J1dHRvbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyIGNvbW1hbmQtZGVsZXRlXCIgZGF0YS1yb3ctaWQ9XCInICsgcm93LmlkICsgJ1wiPjxlbSBjbGFzcz1cImZhIGZhLXRyYXNoIGZhLWZ3XCI+PC9lbT48L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZXM6IHtcclxuICAgICAgICAgICAgICAgIC8vIHRlbXBsYXRlcyBmb3IgQlM0XHJcbiAgICAgICAgICAgICAgICBhY3Rpb25CdXR0b246ICc8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIiB0eXBlPVwiYnV0dG9uXCIgdGl0bGU9XCJ7e2N0eC50ZXh0fX1cIj57e2N0eC5jb250ZW50fX08L2J1dHRvbj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd246ICc8ZGl2IGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51fX1cIj48YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgZHJvcGRvd24tdG9nZ2xlIGRyb3Bkb3duLXRvZ2dsZS1ub2NhcmV0XCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIj48c3BhbiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudVRleHR9fVwiPnt7Y3R4LmNvbnRlbnR9fTwvc3Bhbj48L2J1dHRvbj48dWwgY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVJdGVtc319XCIgcm9sZT1cIm1lbnVcIj48L3VsPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25Ecm9wRG93bkl0ZW06ICc8bGkgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCI+PGEgaHJlZj1cIlwiIGRhdGEtYWN0aW9uPVwie3tjdHguYWN0aW9ufX1cIiBjbGFzcz1cImRyb3Bkb3duLWxpbmsge3tjc3MuZHJvcERvd25JdGVtQnV0dG9ufX1cIj57e2N0eC50ZXh0fX08L2E+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25DaGVja2JveEl0ZW06ICc8bGkgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCI+PGxhYmVsIGNsYXNzPVwiZHJvcGRvd24taXRlbSBwLTBcIj48aW5wdXQgbmFtZT1cInt7Y3R4Lm5hbWV9fVwiIHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiMVwiIGNsYXNzPVwie3tjc3MuZHJvcERvd25JdGVtQ2hlY2tib3h9fVwiIHt7Y3R4LmNoZWNrZWR9fSAvPiB7e2N0eC5sYWJlbH19PC9sYWJlbD48L2xpPicsXHJcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uSXRlbTogJzxsaSBjbGFzcz1cInBhZ2UtaXRlbSB7e2N0eC5jc3N9fVwiPjxhIGhyZWY9XCJcIiBkYXRhLXBhZ2U9XCJ7e2N0eC5wYWdlfX1cIiBjbGFzcz1cInBhZ2UtbGluayB7e2Nzcy5wYWdpbmF0aW9uQnV0dG9ufX1cIj57e2N0eC50ZXh0fX08L2E+PC9saT4nLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkub24oJ2xvYWRlZC5ycy5qcXVlcnkuYm9vdGdyaWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLyogRXhlY3V0ZXMgYWZ0ZXIgZGF0YSBpcyBsb2FkZWQgYW5kIHJlbmRlcmVkICovXHJcbiAgICAgICAgICAgIGdyaWQuZmluZCgnLmNvbW1hbmQtZWRpdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBwcmVzc2VkIGVkaXQgb24gcm93OiAnICsgJCh0aGlzKS5kYXRhKCdyb3ctaWQnKSk7XHJcbiAgICAgICAgICAgIH0pLmVuZCgpLmZpbmQoJy5jb21tYW5kLWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBwcmVzc2VkIGRlbGV0ZSBvbiByb3c6ICcgKyAkKHRoaXMpLmRhdGEoJ3Jvdy1pZCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBEQVRBVEFCTEVTXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0RGF0YXRhYmxlcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdERhdGF0YWJsZXMoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5EYXRhVGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gWmVybyBjb25maWd1cmF0aW9uXHJcblxyXG4gICAgICAgICQoJyNkYXRhdGFibGUxJykuRGF0YVRhYmxlKHtcclxuICAgICAgICAgICAgJ3BhZ2luZyc6IHRydWUsIC8vIFRhYmxlIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgJ29yZGVyaW5nJzogdHJ1ZSwgLy8gQ29sdW1uIG9yZGVyaW5nXHJcbiAgICAgICAgICAgICdpbmZvJzogdHJ1ZSwgLy8gQm90dG9tIGxlZnQgc3RhdHVzIHRleHRcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgLy8gVGV4dCB0cmFuc2xhdGlvbiBvcHRpb25zXHJcbiAgICAgICAgICAgIC8vIE5vdGUgdGhlIHJlcXVpcmVkIGtleXdvcmRzIGJldHdlZW4gdW5kZXJzY29yZXMgKGUuZyBfTUVOVV8pXHJcbiAgICAgICAgICAgIG9MYW5ndWFnZToge1xyXG4gICAgICAgICAgICAgICAgc1NlYXJjaDogJzxlbSBjbGFzcz1cImZhcyBmYS1zZWFyY2hcIj48L2VtPicsXHJcbiAgICAgICAgICAgICAgICBzTGVuZ3RoTWVudTogJ19NRU5VXyByZWNvcmRzIHBlciBwYWdlJyxcclxuICAgICAgICAgICAgICAgIGluZm86ICdTaG93aW5nIHBhZ2UgX1BBR0VfIG9mIF9QQUdFU18nLFxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICdOb3RoaW5nIGZvdW5kIC0gc29ycnknLFxyXG4gICAgICAgICAgICAgICAgaW5mb0VtcHR5OiAnTm8gcmVjb3JkcyBhdmFpbGFibGUnLFxyXG4gICAgICAgICAgICAgICAgaW5mb0ZpbHRlcmVkOiAnKGZpbHRlcmVkIGZyb20gX01BWF8gdG90YWwgcmVjb3JkcyknLFxyXG4gICAgICAgICAgICAgICAgb1BhZ2luYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc05leHQ6ICc8ZW0gY2xhc3M9XCJmYSBmYS1jYXJldC1yaWdodFwiPjwvZW0+JyxcclxuICAgICAgICAgICAgICAgICAgICBzUHJldmlvdXM6ICc8ZW0gY2xhc3M9XCJmYSBmYS1jYXJldC1sZWZ0XCI+PC9lbT4nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIEZpbHRlclxyXG5cclxuICAgICAgICAkKCcjZGF0YXRhYmxlMicpLkRhdGFUYWJsZSh7XHJcbiAgICAgICAgICAgICdwYWdpbmcnOiB0cnVlLCAvLyBUYWJsZSBwYWdpbmF0aW9uXHJcbiAgICAgICAgICAgICdvcmRlcmluZyc6IHRydWUsIC8vIENvbHVtbiBvcmRlcmluZ1xyXG4gICAgICAgICAgICAnaW5mbyc6IHRydWUsIC8vIEJvdHRvbSBsZWZ0IHN0YXR1cyB0ZXh0XHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIC8vIFRleHQgdHJhbnNsYXRpb24gb3B0aW9uc1xyXG4gICAgICAgICAgICAvLyBOb3RlIHRoZSByZXF1aXJlZCBrZXl3b3JkcyBiZXR3ZWVuIHVuZGVyc2NvcmVzIChlLmcgX01FTlVfKVxyXG4gICAgICAgICAgICBvTGFuZ3VhZ2U6IHtcclxuICAgICAgICAgICAgICAgIHNTZWFyY2g6ICdTZWFyY2ggYWxsIGNvbHVtbnM6JyxcclxuICAgICAgICAgICAgICAgIHNMZW5ndGhNZW51OiAnX01FTlVfIHJlY29yZHMgcGVyIHBhZ2UnLFxyXG4gICAgICAgICAgICAgICAgaW5mbzogJ1Nob3dpbmcgcGFnZSBfUEFHRV8gb2YgX1BBR0VTXycsXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJ05vdGhpbmcgZm91bmQgLSBzb3JyeScsXHJcbiAgICAgICAgICAgICAgICBpbmZvRW1wdHk6ICdObyByZWNvcmRzIGF2YWlsYWJsZScsXHJcbiAgICAgICAgICAgICAgICBpbmZvRmlsdGVyZWQ6ICcoZmlsdGVyZWQgZnJvbSBfTUFYXyB0b3RhbCByZWNvcmRzKScsXHJcbiAgICAgICAgICAgICAgICBvUGFnaW5hdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzTmV4dDogJzxlbSBjbGFzcz1cImZhIGZhLWNhcmV0LXJpZ2h0XCI+PC9lbT4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNQcmV2aW91czogJzxlbSBjbGFzcz1cImZhIGZhLWNhcmV0LWxlZnRcIj48L2VtPidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gRGF0YXRhYmxlIEJ1dHRvbnMgc2V0dXBcclxuICAgICAgICAgICAgZG9tOiAnQmZydGlwJyxcclxuICAgICAgICAgICAgYnV0dG9uczogW1xyXG4gICAgICAgICAgICAgICAgeyBleHRlbmQ6ICdjb3B5JywgY2xhc3NOYW1lOiAnYnRuLWluZm8nIH0sXHJcbiAgICAgICAgICAgICAgICB7IGV4dGVuZDogJ2NzdicsIGNsYXNzTmFtZTogJ2J0bi1pbmZvJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBleHRlbmQ6ICdleGNlbCcsIGNsYXNzTmFtZTogJ2J0bi1pbmZvJywgdGl0bGU6ICdYTFMtRmlsZScgfSxcclxuICAgICAgICAgICAgICAgIHsgZXh0ZW5kOiAncGRmJywgY2xhc3NOYW1lOiAnYnRuLWluZm8nLCB0aXRsZTogJCgndGl0bGUnKS50ZXh0KCkgfSxcclxuICAgICAgICAgICAgICAgIHsgZXh0ZW5kOiAncHJpbnQnLCBjbGFzc05hbWU6ICdidG4taW5mbycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNkYXRhdGFibGUzJykuRGF0YVRhYmxlKHtcclxuICAgICAgICAgICAgJ3BhZ2luZyc6IHRydWUsIC8vIFRhYmxlIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgJ29yZGVyaW5nJzogdHJ1ZSwgLy8gQ29sdW1uIG9yZGVyaW5nXHJcbiAgICAgICAgICAgICdpbmZvJzogdHJ1ZSwgLy8gQm90dG9tIGxlZnQgc3RhdHVzIHRleHRcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgLy8gVGV4dCB0cmFuc2xhdGlvbiBvcHRpb25zXHJcbiAgICAgICAgICAgIC8vIE5vdGUgdGhlIHJlcXVpcmVkIGtleXdvcmRzIGJldHdlZW4gdW5kZXJzY29yZXMgKGUuZyBfTUVOVV8pXHJcbiAgICAgICAgICAgIG9MYW5ndWFnZToge1xyXG4gICAgICAgICAgICAgICAgc1NlYXJjaDogJ1NlYXJjaCBhbGwgY29sdW1uczonLFxyXG4gICAgICAgICAgICAgICAgc0xlbmd0aE1lbnU6ICdfTUVOVV8gcmVjb3JkcyBwZXIgcGFnZScsXHJcbiAgICAgICAgICAgICAgICBpbmZvOiAnU2hvd2luZyBwYWdlIF9QQUdFXyBvZiBfUEFHRVNfJyxcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnTm90aGluZyBmb3VuZCAtIHNvcnJ5JyxcclxuICAgICAgICAgICAgICAgIGluZm9FbXB0eTogJ05vIHJlY29yZHMgYXZhaWxhYmxlJyxcclxuICAgICAgICAgICAgICAgIGluZm9GaWx0ZXJlZDogJyhmaWx0ZXJlZCBmcm9tIF9NQVhfIHRvdGFsIHJlY29yZHMpJyxcclxuICAgICAgICAgICAgICAgIG9QYWdpbmF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNOZXh0OiAnPGVtIGNsYXNzPVwiZmEgZmEtY2FyZXQtcmlnaHRcIj48L2VtPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc1ByZXZpb3VzOiAnPGVtIGNsYXNzPVwiZmEgZmEtY2FyZXQtbGVmdFwiPjwvZW0+J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBEYXRhdGFibGUga2V5IHNldHVwXHJcbiAgICAgICAgICAgIGtleXM6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEN1c3RvbSBDb2RlXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q3VzdG9tKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q3VzdG9tKCkge1xyXG5cclxuICAgICAgICAvLyBjdXN0b20gY29kZVxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7Il19
