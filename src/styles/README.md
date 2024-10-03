# _grid.scss - a Minimalistic Bootstrap-Compatible Grid System

This grid system is a lightweight alternative to Bootstrap's grid, providing essential features for responsive design. It includes a set of SCSS mixins and classes to create flexible layouts.

## Supported Classes in _grid.scss

### Container

- **`.container`**: Creates a fixed-width container and centers it on the page.
- **`.container-fluid`**: Creates a full-width container that spans the entire width of the viewport.

### Row

- **`.row`**: Creates a flexbox container for columns, with negative margins to offset column padding.

### Columns

- **`.col-xx-#`**: Defines the width of a column for a specific breakpoint (`xx` can be `xs`, `sm`, `md`, `lg`, `xl`, `xxl`). Replace `#` with a number from 1 to 24 (based on `$grid-columns`).

### Offsets

- **`.offset-xx-#`**: Adds left margin to a column, effectively moving it to the right by the specified number of columns. Replace `xx` with the breakpoint and `#` with the number of columns to offset.

## Mixins

### `media-breakpoint-up($breakpoint)`

Applies styles at a minimum width of the specified breakpoint.

### `media-breakpoint-down($breakpoint)`

Applies styles at a maximum width of the specified breakpoint.

### `media-breakpoint-between($lower, $upper)`

Applies styles between two breakpoints.

### `make-container($max-widths, $gutter)`

Creates a container with specified maximum widths and gutter.

### `make-row($gutter)`

Creates a flexbox row with specified gutter.

### `make-col($size, $columns)`

Defines a column with a specific size and total number of columns.

### `make-col-offset($size, $columns)`

Offsets a column by a specific size.

### `row-cols($count)`

Sets the number of columns in a row, each taking an equal width.

## Customization

You can customize the grid system by modifying the variables in `_globals.scss`:

- **`$grid-columns`**: Total number of columns in the grid.
- **`$grid-gutter-width`**: Width of the gutter between columns.
- **`$grid-breakpoints`**: Map of breakpoints for responsive design.
- **`$container-max-widths`**: Maximum widths for containers at each breakpoint.
