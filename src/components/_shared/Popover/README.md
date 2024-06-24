## Usage Example

```JS
import Popover from './Popover';

<Popover content={'This is popover text'}>
  {(triggerRef: (el: HTMLElement) => void) => (
    <Button value="Hover me" ref={triggerRef} />
  )}
</Popover>
```
### or

```JS
import Popover from './Popover';

<Popover content={'This is popover text'}>
  {(triggerRef: (el: HTMLElement) => void) => (
    <div ref={triggerRef}>Hover me</div>
  )}
</Popover>
```
