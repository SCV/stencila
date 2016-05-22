'use strict';

var oo = require('substance/util/oo');
var Component = require('substance/ui/Component');
var $$ = Component.$$;

function StencilDefaultNodeComponent() {
  Component.apply(this, arguments);
}

StencilDefaultNodeComponent.Prototype = function() {
  this.render = function() {
    return $$('div')
      .attr('contenteditable', false)
      .attr("data-id", this.props.node.id)
      .addClass('sc-stencil-default-node')
      .html(this.props.node.html);
  };
};

oo.inherit(StencilDefaultNodeComponent, Component);

module.exports = StencilDefaultNodeComponent;
