# Discours.io Grid System and Styles

This document outlines the grid system and styles used in the Discours.io project. It's a lightweight, customizable system inspired by Bootstrap, providing essential features for responsive design.

## Grid System (_grid.scss)

### Container Classes
- `.container`: Fixed-width, centered container
- `.container-fluid`: Full-width container

### Row Class
- `.row`: Flexbox container for columns with negative margins

### Column Classes
- `.col-{breakpoint}`: Flexible column
- `.col-{breakpoint}-auto`: Auto-width column
- `.col-{breakpoint}-{1-24}`: Fixed-width column (1 to 24 based on $grid-columns)

### Display Classes
- `.d-flex`: Display flex
- `.d-none`: Display none

### Justify Content Class
- `.justify-content-between`: Justify content space-between

### Gutter Classes
- `.g-{breakpoint}-{0-5}`: Sets both horizontal and vertical gutters
- `.gx-{breakpoint}-{0-5}`: Sets horizontal gutters
- `.gy-{breakpoint}-{0-5}`: Sets vertical gutters

## Mixins

### Media Queries
- `media-breakpoint-up($breakpoint)`
- `media-breakpoint-down($breakpoint)`
- `media-breakpoint-between($lower, $upper)`

### Grid Mixins
- `make-container($max-widths, $gutter)`
- `make-row($gutter)`
- `make-col-ready()`
- `make-col($size, $columns)`

## Variables (_global.scss)

- `$grid-columns`: 24
- `$grid-gutter-width`: 4rem
- `$grid-breakpoints`: xs, sm, md, lg, xl, xxl
- `$container-max-widths`: Same as $grid-breakpoints
- `$container-padding-x`: Half of $grid-gutter-width
- `$gutters`: 0, 1, 2, 3, 4, 5 with corresponding rem values
