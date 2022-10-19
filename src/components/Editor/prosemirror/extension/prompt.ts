const prefix = 'ProseMirror-prompt'

export function openPrompt(options: any) {
  const wrapper = document.body.appendChild(document.createElement('div'))
  wrapper.className = prefix

  const mouseOutside = (e: any) => {
    if (!wrapper.contains(e.target)) close()
  }
  setTimeout(() => window.addEventListener('mousedown', mouseOutside), 50)
  const close = () => {
    window.removeEventListener('mousedown', mouseOutside)
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper)
  }

  const domFields: any = []
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
  domFields.forEach((field: any) => {
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
    if (e.keyCode == 27) {
      e.preventDefault()
      close()
    } else if (e.keyCode == 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault()
      submit()
    } else if (e.keyCode == 9) {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) close()
      }, 500)
    }
  })

  const input: any = form.elements[0]
  if (input) input.focus()
}

function getValues(fields: any, domFields: any) {
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

function reportInvalid(dom: any, message: any) {
  const parent = dom.parentNode
  const msg = parent.appendChild(document.createElement('div'))
  msg.style.left = dom.offsetLeft + dom.offsetWidth + 2 + 'px'
  msg.style.top = dom.offsetTop - 5 + 'px'
  msg.className = 'ProseMirror-invalid'
  msg.textContent = message
  setTimeout(() => parent.removeChild(msg), 1500)
}

export class Field {
  options: any
  constructor(options: any) {
    this.options = options
  }

  read(dom: any) {
    return dom.value
  }
  // :: (any) → ?string
  // A field-type-specific validation function.
  validateType(_value) {
    return typeof _value === typeof ''
  }

  validate(value: any) {
    if (!value && this.options.required) return 'Required field'

    return this.validateType(value) || (this.options.validate && this.options.validate(value))
  }

  clean(value: any) {
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
    this.options.options.forEach((o: { value: string; label: string }) => {
      const opt = select.appendChild(document.createElement('option'))
      opt.value = o.value
      opt.selected = o.value == this.options.value
      opt.label = o.label
    })
    return select
  }
}
