// Custom Element label code instead of neo-blessed's default

Element.prototype.setLabel = function (options) {
    var self = this;
    var Box = require('./box');

    if (typeof options === 'string') {
        options = { text: options };
    }

    if (this._label) {
        this._label.setContent(options.text);
        if (options.side !== 'right') {
            this._label.rleft = 2 + (this.border ? -1 : 0);
            this._label.position.right = undefined;
            if (!this.screen.autoPadding) {
                this._label.rleft = 2;
            }
        } else {
            this._label.rright = 2 + (this.border ? -1 : 0);
            this._label.position.left = undefined;
            if (!this.screen.autoPadding) {
                this._label.rright = 2;
            }
        }
        return;
    }

    this._label = new Box({
        screen: this.screen,
        parent: this,
        content: options.text,
        top: -this.itop,
        tags: this.parseTags,
        shrink: true,
        style: this.style.label
    });

    if (options.side !== 'right') {
        this._label.rleft = Math.round(this._getWidth() / 2 - (this._label.content.length / 2));
    } else {
        this._label.rright = 2 - this.iright;
    }

    this._label._isLabel = true;

    if (!this.screen.autoPadding) {
        if (options.side !== 'right') {
            this._label.rleft = Math.round(this._getWidth() / 2 - (this._label.content.length / 2));
        } else {
            this._label.rright = 2;
        }
        this._label.rtop = 0;
    }

    var reposition = function () {
        self._label.rtop = (self.childBase || 0) - self.itop;
        self._label.rleft = Math.round(self.screen.width / 2 - (self._label.content.length / 2));
        if (!self.screen.autoPadding) {
            self._label.rtop = (self.childBase || 0);
        }
        self.screen.render();
    };

    this.on('scroll', this._labelScroll = function () {
        reposition();
    });

    this.on('resize', this._labelResize = function () {
        nextTick(function () {
            reposition();
        });
    });
};