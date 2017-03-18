import { Component, isNil } from 'substance'

export default
class CellValueComponent extends Component {
  didMount() {
    const node = this.props.node
    if (node) {
      node.on('value:updated', this.rerender, this)
    }
  }
  dispose() {
    const node = this.props.node
    if (node) {
      node.off(this)
    }
  }
  render($$) {
    const node = this.props.node
    let el = $$('div').addClass('sc-cell-value')
    // EXPERIMENTAL: caching the value data so that
    // we can render something while the engine is updating
    // still, not sure yet if this is the right place to do
    let value, valueType
    let pending = false
    if (!isNil(node.value)) {
      value = this._oldValue = node.value
      valueType = this._oldValueType = node.valueType
    } else if (!isNil(this._oldValue)) {
      value = this._oldValue
      valueType = this._oldValueType
      pending = true
    }
    if (!isNil(value)) {
      const registry = this.context.componentRegistry
      let ValueDisplay = registry.get('value:'+valueType)
      if (ValueDisplay) {
        el.append(
          $$(ValueDisplay, {value}).ref('value')
        )
      } else {
        let valueStr = String(value)
        if (valueStr.length > 10000) {
          valueStr = valueStr.slice(0, 10000)+'...'
        }
        el.append(
          $$('div').addClass('se-value').append(
            String(valueType), ':', valueStr
          )
        )
      }
    }
    if (pending) el.addClass('sm-pending')
    if (node.errors && node.errors.length){
      node.errors.forEach((error) => {
        el.append(
          $$('div').addClass('se-error').text(String(error))
        )
      })
    }
    return el
  }
}