const prefix = 'ProseMirror-prompt'

// eslint-disable-next-line sonarjs/cognitive-complexity
export function openPrompt(options) {
  const wrapper = document.body.appendChild(document.createElement('div'))
  wrapper.className = prefix
  const mouseOutside = (e: MouseEvent) => {
    if (!wrapper.contains(e.target as Node)) close()
  }
  setTimeout(() => window.addEventListener('mousedown', mouseOutside), 50)
  const close = () => {
    window.removeEventListener('mousedown', mouseOutside)
    if (wrapper.parentNode) wrapper.remove()
  }

  const domFields = []
  options.fields.forEach((name) => {
    domFields.push(options.fields[name].render())
  })

  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.className = prefix + '-submit'
  submitButton.textContent = 'OK'
  const cancelButton = document.createElement('button')
  cancelButton.type = 'button'
  cancelButton.className = prefix + '-cancel'
  cancelButton.textContent = 'Cancel'
  cancelButton.addEventListener('click', close)

  const form = wrapper.appendChild(document.createElement('form'))
  if (options.title) {
    form.appendChild(document.createElement('h5')).textContent = options.title
  }
  domFields.forEach((field) => {
    form.appendChild(document.createElement('div')).appendChild(field)
  })
  const buttons = form.appendChild(document.createElement('div'))
  buttons.className = prefix + '-buttons'
  buttons.appendChild(submitButton)
  buttons.appendChild(document.createTextNode(' '))
  buttons.appendChild(cancelButton)

  const box = wrapper.getBoundingClientRect()
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
      // eslint-disable-next-line unicorn/prefer-keyboard-event-key
    } else if (e.keyCode === 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault()
      submit()
    } else if (e.key === 'Tab') {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) close()
      }, 500)
    }
  })

  const inpel = form.elements[0] as HTMLInputElement
  if (inpel) inpel.focus()
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

function reportInvalid(dom: HTMLElement, message: string) {
  const parent = dom.parentNode
  const msg = parent.appendChild(document.createElement('div'))
  msg.style.left = dom.offsetLeft + dom.offsetWidth + 2 + 'px'
  msg.style.top = dom.offsetTop - 5 + 'px'
  msg.className = 'ProseMirror-invalid'
  msg.textContent = message
  // eslint-disable-next-line unicorn/prefer-dom-node-remove
  setTimeout(() => parent.removeChild(msg), 1500)
}

interface FieldOptions {
  options: { value: string; label: string }[]
  required: boolean
  label: string
  value: string
  validateType: (v) => boolean
  validate: (v) => boolean
  read: (v) => string
  clean: (v) => boolean
}

export class Field {
  options: FieldOptions
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

export class SelectField extends Field {
  render() {
    const select = document.createElement('select')
    this.options.options.forEach((o) => {
      const opt = select.appendChild(document.createElement('option'))
      opt.value = o.value
      opt.selected = o.value === this.options.value
      opt.label = o.label
    })
    return select
  }
}
