## Usage Example

```JS
import Popover from './Popover';

<Popover content="This is a popover">
  {(setReferenceEl: (el: HTMLElement | null) => void) => (
    <button ref={setReferenceEl}>Hover me</button>
  )}
</Popover>
```
