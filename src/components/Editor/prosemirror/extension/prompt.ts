const prefix = 'ProseMirror-prompt'

// FIXME !!!
// eslint-disable-next-line sonarjs/cognitive-complexity
export function openPrompt(options) {
  const domFields = []
  const submitButton = document.createElement('button')
  const cancelButton = document.createElement('button')
  const wrapper = document.body.appendChild(document.createElement('div'))
  const form = wrapper.appendChild(document.createElement('form'))
  const buttons = form.appendChild(document.createElement('div'))
  const box = wrapper.getBoundingClientRect()
  wrapper.className = prefix
  const mouseOutside = (e: MouseEvent) => {
    if (!wrapper.contains(e.target as Node)) close()
  }
  setTimeout(() => window.addEventListener('mousedown', mouseOutside), 50) // FIXME
  const close = () => {
    window.removeEventListener('mousedown', mouseOutside)
    if (wrapper.parentNode) wrapper.remove()
  }
  options.fields.forEach((name) => domFields.push(options.fields[name].render()))
  submitButton.type = 'submit'
  submitButton.className = prefix + '-submit'
  submitButton.textContent = 'OK'
  cancelButton.type = 'button'
  cancelButton.className = prefix + '-cancel'
  cancelButton.textContent = 'Cancel'
  cancelButton.addEventListener('click', close)
  if (options.title) {
    const headel = form.appendChild(document.createElement('h5'))
    headel.textContent = options.title
  }
  domFields.forEach((fld) => form.appendChild(document.createElement('div')).append(fld))
  buttons.className = prefix + '-buttons'
  buttons.append(submitButton)
  buttons.append(document.createTextNode(' '))
  buttons.append(cancelButton)
  wrapper.style.top = (window.innerHeight - box.height) / 2 + 'px'
  wrapper.style.left = (window.innerWidth - box.width) / 2 + 'px'
  const submit = () => {
    const params = getValues(options.fields, domFields)
    if (params) {
      close()
      options.callback(params)
    }
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    submit()
  })
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault()
      submit()
    } else if (e.key === 'Tab') {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) close()
      }, 500)
    }
  })
  const input = form.elements[0] as HTMLInputElement
  if (input) input.focus()
}

function getValues(fields, domFields) {
  const result = Object.create(null)
  let i = 0
  fields.forEarch((name) => {
    const field = fields[name]
    const dom = domFields[i++]
    const value = field.read(dom)
    const bad = field.validate(value)
    if (bad) {
      reportInvalid(dom, bad)
      return null
    }
    result[name] = field.clean(value)
  })
  return result
}

function reportInvalid(dom, message) {
  const parent = dom.parentNode
  const msg = parent.appendChild(document.createElement('div'))
  msg.style.left = dom.offsetLeft + dom.offsetWidth + 2 + 'px'
  msg.style.top = dom.offsetTop - 5 + 'px'
  msg.className = 'ProseMirror-invalid'
  msg.textContent = message
  setTimeout(() => msg.remove(), 1500)
}

export class Field {
  options: { required: boolean; validate; clean; label: string; value: string }
  constructor(options) {
    this.options = options
  }

  read(dom) {
    return dom.value
  }
  // :: (any) → ?string
  // A field-type-specific validation function.
  validateType(_value) {
    return typeof _value === typeof ''
  }

  validate(value) {
    if (!value && this.options.required) return 'Required field'
    return this.validateType(value) || (this.options.validate && this.options.validate(value))
  }

  clean(value) {
    return this.options.clean ? this.options.clean(value) : value
  }
}

export class TextField extends Field {
  render() {
    const input: HTMLInputElement = document.createElement('input')
    input.type = 'text'
    input.placeholder = this.options.label
    input.value = this.options.value || ''
    input.autocomplete = 'off'
    return input
  }
}
