## Usage Example

```JS
import Popover from './Popover';

<Popover content={'This is popover text'}>
  {(triggerRef: (el) => void) => (
    <Button value="Hover me" ref={triggerRef} />
  )}
</Popover>
```
### or

```JS
import Popover from './Popover';

<Popover content={'This is popover text'}>
  {(triggerRef: (el) => void) => (
    <div ref={triggerRef}>Hover me</div>
  )}
</Popover>
```
