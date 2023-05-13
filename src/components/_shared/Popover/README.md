## Usage Example

```JS
import Popover from './Popover';

<Popover content="This is a popover">
  {(setReferenceEl: (el: HTMLElement | null) => void) => (
    <div ref={setReferenceEl}>Hover me</div>
  )}
</Popover>
```
