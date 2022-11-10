const prefix = 'ProseMirror-prompt'

const createButton = ({
  textContent,
  type = 'button',
  className,
  onClick
}: {
  textContent: string
  type?: 'button' | 'submit'
  className: string
  onClick?: () => void
}) => {
  const button = document.createElement('button')
  button.type = type
  button.className = className
  button.textContent = textContent

  if (onClick) {
    button.addEventListener('click', onClick)
  }

  return button
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function openPrompt(options: {
  title?: string
  fields: Record<string, Field>
  onSubmit: (values: Record<string, string>) => void
}) {
  const wrapper = document.body.appendChild(document.createElement('div'))
  wrapper.className = prefix

  const mouseOutside = (ev: MouseEvent & { target: Node }) => {
    if (!wrapper.contains(ev.target)) {
      close()
    }
  }

  setTimeout(() => window.addEventListener('mousedown', mouseOutside), 50)

  const close = () => {
    window.removeEventListener('mousedown', mouseOutside)
    if (wrapper.parentNode) wrapper.remove()
  }

  const domFields: HTMLElement[] = []

  Object.keys(options.fields).forEach((name) => {
    domFields.push(options.fields[name].render())
  })

  const submitButton = createButton({ textContent: 'OK', type: 'submit', className: prefix + '-submit' })
  const cancelButton = createButton({
    className: prefix + '-cancel',
    textContent: 'Cancel',
    onClick: close
  })

  const form = wrapper.appendChild(document.createElement('form'))

  if (options.title) {
    form.appendChild(document.createElement('h5')).textContent = options.title
  }

  domFields.forEach((fieldEl: HTMLElement) => {
    form.appendChild(document.createElement('div')).appendChild(fieldEl)
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
    const values = getValues(options.fields, domFields)
    if (values) {
      close()
      options.onSubmit(values)
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

  form.querySelector('input')?.focus()
}

function getValues(fields: Record<string, Field>, domFields: HTMLElement[]) {
  const result = {}

  // TODO: make field read its own value, maybe move to SolidJS
  const fieldNames = Object.keys(fields)

  for (const [i, fieldName] of fieldNames.entries()) {
    const field = fields[fieldName]

    const dom = domFields[i]
    const value = field.read(dom)
    const bad = field.validate(value)

    if (bad) {
      reportInvalid(dom, bad)
      return null
    }

    result[fieldName] = field.clean(value)
  }

  return result
}

function reportInvalid(dom: HTMLElement, message: string) {
  const msg: HTMLElement = dom.parentNode.appendChild(document.createElement('div'))
  msg.style.left = dom.offsetLeft + dom.offsetWidth + 2 + 'px'
  msg.style.top = dom.offsetTop - 5 + 'px'
  msg.className = 'ProseMirror-invalid'
  msg.textContent = message
  setTimeout(msg.remove, 1500)
}

export abstract class Field {
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

  abstract render(): HTMLElement
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
      opt.selected = o.value === this.options.value
      opt.label = o.label
    })
    return select
  }
}
