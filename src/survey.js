var Vue = require('vue');
var insertCss = require('insert-css');
var bind = require('component-bind');
var escape = require('escape-html');
var is = require('is');

var MESSAGES = require('nps-translations');

insertCss(require('./index.scss'));

var RATING_STATE = 'rating';
var FEEDBACK_STATE = 'feedback';
var THANKS_STATE = 'thanks';
var FILLED_STATE = 'filled';

var DIALOG_SKIN = 'dialog';
var PANEL_SKIN = 'panel';

var Survey = Vue.extend({
  template: require('./survey.html'),
  partials: {
    rating: require('./rating.html'),
    feedback: require('./feedback.html'),
    scale: require('./scale.html'),
    thanks: require('./thanks.html'),
    filled: require('./filled.html'),
    'powered-by': require('./powered-by.html')
  },
  components: {
    dialog: require('./dialog'),
    panel: require('./panel')
  },
  replace: true,
  data: function() {
    return {
      // model
      rating: null,
      feedback: '',
      reason: '',

      // state
      visible: false,
      state: RATING_STATE,
      translation: null,

      // settings
      language: 'en',
      serviceName: null,
      poweredBy: true,
      skin: DIALOG_SKIN,
      theme: 'pink',
      preview: false, // preview mode - positioned inside a preview div
      position: 'cr' // tl (top-right), tr, bl, br
    };
  },
  ready: function() {
    if (this.showFeedbackText) {
      this.focusFeedback();
    }
  },
  computed: {
    showCloseIcon: function() {
      return this.state === FEEDBACK_STATE || this.state === RATING_STATE;
    },
    showFeedbackText: function() {
      return this.state === FEEDBACK_STATE;
    },
    ratings: function() {
      var selectedRating = this.rating;
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(rating) {
        return {
          selected: selectedRating !== null && rating <= selectedRating
        };
      });
    },
    likelyHtml: function() {
      var serviceName = is.string(this.serviceName) ? this.serviceName.trim() : null;
      var us = this.t('US');
      var serviceHtml = serviceName ? '<b>' + escape(serviceName) + '</b>' : us;
      return escape(this.t('HOW_LIKELY')).replace('%s', serviceHtml);
    },
    hasReasons: function() {
      var reasons = this.t('REASONS');
      return reasons && reasons.length > 0;
    }
  },
  methods: {
    nextTick: function(fn) {
      Vue.nextTick(bind(this, function() {
        if (this._isDestroyed) {
          return;
        }
        fn.call(this);
      }));
    },
    setTimeout: function(fn, timeout) {
      setTimeout(bind(this, function() {
        if (this._isDestroyed) {
          return;
        }
        fn.call(this);
      }), timeout);
    },
    t: function(key, param) {
      if (this.translation) {
        if (this.translation[key]) {
          return this.translation[key];
        }
        if (key === 'FOLLOWUP' && this.translation['IMPROVE']) {
          return this.translation['IMPROVE'];
        }
      }
      var shortLanguage = is.string(this.language) ? this.language.split('_')[0] : '';
      var messages = MESSAGES[this.language] || MESSAGES[shortLanguage] || MESSAGES.en;
      return messages[key];
    },
    selectRating: function (rating) {
      this.rating = rating;
      this.state = FEEDBACK_STATE;
      this.focusFeedback();
    },
    focusFeedback: function() {
      this.nextTick(function () {
        var $feedback = this.$el.querySelector('input') || this.$el.querySelector('textarea');
        if ($feedback) {
          this.nextTick(function() {
            $feedback.focus();
          });
        }
      });
    },
    show: function() {
      this.visible = true;
    },
    hide: function() {
      this.visible = false;
    },
    submit: function() {
      this.$emit('submit');
      this.state = THANKS_STATE;
      if (this.skin === DIALOG_SKIN) {
        this.setTimeout(function() {
          this.hide();
        }, 800);
      }
    },
    onClose: function() {
      this.hide();
      this.$emit('dismiss');
    }
  }
});

module.exports = Survey;
