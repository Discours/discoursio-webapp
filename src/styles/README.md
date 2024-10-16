# Discours.io Styling System

This document outlines the styling system used in the Discours.io project. It's a lightweight, customizable system inspired by Bootstrap, providing essential features for responsive design and theming.

## Grid System (_grid.scss)

### Container Classes
- `.container`: Fixed-width, centered container
- `.container-fluid`: Full-width container
- `.wide-container`: Custom container with max-width

### Row Class
- `.row`: Flexbox container for columns with negative margins

### Column Classes
- `.col-{breakpoint}`: Flexible column
- `.col-{breakpoint}-auto`: Auto-width column
- `.col-{breakpoint}-{1-24}`: Fixed-width column (1 to 24 based on $grid-columns)

### Utility Classes
- Display: `.d-flex`, `.d-none`
- Justify Content: `.justify-content-between`
- Order: `.order-{breakpoint}-{first|last|0-24}`
- Offset: `.offset-{breakpoint}-{1-23}`

### Gutter Classes
- `.g-{breakpoint}-{0-5}`: Sets both horizontal and vertical gutters
- `.gx-{breakpoint}-{0-5}`: Sets horizontal gutters
- `.gy-{breakpoint}-{0-5}`: Sets vertical gutters

## Mixins (_global.scss)

### Media Queries
- `media-breakpoint-up($breakpoint)`
- `media-breakpoint-down($breakpoint)`
- `media-breakpoint-between($lower, $upper)`

### Grid Mixins
- `make-container($max-widths, $gutter)`
- `make-row($gutter)`
- `make-col-ready()`
- `make-col($size, $columns)`
- `make-col-offset($size, $columns)`

## Variables (_global.scss)

- `$grid-columns`: 24
- `$grid-gutter-width`: 4rem
- `$grid-breakpoints`: xs, sm, md, lg, xl, xxl
- `$container-max-widths`: Same as $grid-breakpoints
- `$container-padding-x`: Half of $grid-gutter-width
- `$gutters`: 0, 1, 2, 3, 4, 5 with corresponding rem values

## Theming (_theme.scss)

The project uses CSS custom properties for theming, supporting both light and dark modes.

### Usage
```scss
.my-element {
  background-color: var(--background-color);
  color: var(--default-color);
}
```

### Key Theme Variables
- `--background-color`
- `--default-color`
- `--link-color`
- `--secondary-color`

## Typography (app.scss)

The project uses the Muller font family and defines base styles for typography.

### Base Font
- Family: Muller, Arial, Helvetica, sans-serif
- Size: 2rem (20px assuming a 10px root font size)
- Line Height: 1.6

### Headings
- `h1`: 4.8rem
- `h2`: 4rem
- `h3`: 3.2rem
- `h4`: 2.6rem
- `h5`: 2.2rem
