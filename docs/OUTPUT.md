# Design Tokens JSON Format

## Structure

A token belongs to a **Set** and may be organized into one or more nested folders.

```text
Set
 └── Folder*
      └── Folder*
           └── Token
                ├── value
                ├── type
                └── description (optional)
```

### Definitions

| Element     | Description                                           |
| ----------- | ----------------------------------------------------- |
| Set         | Top-level container (e.g. `global`, `brandA`, `dark`) |
| Folder      | Organizational grouping used to structure tokens      |
| Token       | Final node containing a `value` and `type`            |
| Description | Optional metadata for documentation                   |

A token is always the **leaf node** of the hierarchy.

---

## Token Studio Export Structure

When tokens are exported from Tokens Studio, the JSON may include token sets,
theme definitions, and metadata in the same file.

```text
Root
 ├── <token-set-name>
 │    └── Folder* / Token*
 ├── $themes
 │    └── Theme[]
 │         ├── id
 │         ├── name
 │         ├── group
 │         ├── selectedTokenSets
 │         ├── $figmaStyleReferences
 │         └── $figmaVariableReferences
 └── $metadata
      └── tokenSetOrder
```

### Example Export

From `demo/tokens.json`:

```json
{
  "global": {
    "Primary": {
      "value": "#000",
      "type": "color"
    },
    "red": {
      "value": "#444",
      "type": "color"
    },
    "aa": {
      "value": "4px",
      "type": "spacing"
    },
    "hero section": {
      "value": {
        "minWidth": "8",
        "maxWidth": "8"
      },
      "type": "composition"
    },
    "border 1": {
      "value": {
        "color": "#711818",
        "width": "8",
        "style": "solid"
      },
      "type": "border"
    }
  },
  "dark": {
    "sm": {
      "value": "8px",
      "type": "spacing"
    },
    "ekino - sm": {
      "value": "4",
      "type": "spacing"
    },
    "ccifv-sm": {
      "value": "4",
      "type": "spacing"
    },
    "Composition 1": {
      "value": {
        "minWidth": "14px",
        "height": "560"
      },
      "description": "test composition",
      "type": "composition"
    }
  },
  "light": {
    "red": {
      "value": "#ada",
      "type": "color"
    },
    "light": {
      "primary": {
        "value": "8",
        "type": "spacing"
      },
      "secondary": {
        "value": "12",
        "type": "spacing"
      }
    },
    "sm": {
      "value": "12",
      "type": "spacing"
    }
  },
  "brand A": {},
  "$themes": [
    {
      "id": "d12ba13f5d0441576197a603bc5078c7d49db20a",
      "name": "CCIFV",
      "$figmaStyleReferences": {},
      "$figmaVariableReferences": {},
      "selectedTokenSets": {
        "dark": "enabled",
        "light": "enabled",
        "brand A": "enabled"
      },
      "group": "Think Design"
    },
    {
      "id": "4a70bb1dc7a39a7ef369917efae08715b98df68f",
      "name": "Ekino",
      "$figmaStyleReferences": {},
      "$figmaVariableReferences": {},
      "selectedTokenSets": {
        "dark": "enabled",
        "light": "enabled"
      },
      "group": "Think Design"
    }
  ],
  "$metadata": {
    "tokenSetOrder": ["global", "dark", "light", "brand A"]
  }
}
```

### Token Sets

Every top-level key that does not start with `$` is treated as a token set.

```text
global
dark
light
brand A
```

Each set can contain flat tokens, nested folders, or no tokens. In the example
above, `brand A` is an empty token set.

### `$themes`

`$themes` is a Tokens Studio-specific array that describes named theme builds.
Each theme selects which token sets are active for that theme.

```json
{
  "name": "CCIFV",
  "selectedTokenSets": {
    "dark": "enabled",
    "light": "enabled",
    "brand A": "enabled"
  },
  "group": "Think Design"
}
```

The build script reads each theme and creates a separate CSS file:

```text
CCIFV → build/demo/css/vars-CCIFV.css
Ekino → build/demo/css/vars-Ekino.css
```

### `selectedTokenSets`

`selectedTokenSets` maps token set names to their state in a theme.

| State      | Meaning                                  |
| ---------- | ---------------------------------------- |
| `enabled`  | Include this token set in the theme      |
| `disabled` | Exclude this token set from the theme    |
| `source`   | Use as a source set for theme references |

In this project, any state other than `disabled` is included in the generated
CSS output.

The `global` set is added automatically during the build if a theme does not
explicitly list it.

### `$metadata`

`$metadata` stores file-level metadata for the Tokens Studio export.

```json
{
  "$metadata": {
    "tokenSetOrder": ["global", "dark", "light", "brand A"]
  }
}
```

`tokenSetOrder` preserves the set order from Tokens Studio. This order is useful
for display, editing, and deterministic processing.

---

## Basic Token Format

```json
{
  "global": {
    "color": {
      "brand": {
        "primary": {
          "value": "#0066FF",
          "type": "color"
        },
        "secondary": {
          "value": "#FF6600",
          "type": "color"
        }
      }
    }
  }
}
```

### Token Paths

```text
global
 └── color
      └── brand
           ├── primary
           └── secondary
```

Displayed in the UI as:

```text
brand.primary → #0066FF
brand.secondary → #FF6600
```

---

## CSS Variable Generation

Style Dictionary converts the token path into CSS variables.

### Rule

```text
<folder-path>.<token-name>

↓

--<folder-path>-<token-name>
```

Example:

```json
{
  "color": {
    "brand": {
      "primary": {
        "value": "#0066FF",
        "type": "color"
      }
    }
  }
}
```

Generated CSS:

```css
:root {
  --color-brand-primary: #0066ff;
}
```

---

# Border Tokens

## Token Format

```json
{
  "button": {
    "border": {
      "value": {
        "color": "#0066FF",
        "width": "1px",
        "style": "solid"
      },
      "type": "border"
    }
  }
}
```

---

## Export Option 1: Shorthand Variable

```css
:root {
  --button-border: 1px solid #0066ff;
}
```

Usage:

```css
.button {
  border: var(--button-border);
}
```

---

## Export Option 2: Individual Variables

```css
:root {
  --button-border-width: 1px;
  --button-border-style: solid;
  --button-border-color: #0066ff;
}
```

Usage:

```css
.button {
  border-width: var(--button-border-width);
  border-style: var(--button-border-style);
  border-color: var(--button-border-color);
}
```

---

# Composition Tokens

Composition tokens group multiple design decisions into a single token.

## Token Format

```json
{
  "global": {
    "color": {
      "brand": {
        "primary": {
          "value": "#0066FF",
          "type": "color"
        }
      }
    },
    "spacing": {
      "md": {
        "value": "16px",
        "type": "spacing"
      }
    },
    "radius": {
      "sm": {
        "value": "4px",
        "type": "borderRadius"
      }
    },
    "component": {
      "button": {
        "primary": {
          "value": {
            "backgroundColor": "{color.brand.primary}",
            "paddingX": "{spacing.md}",
            "paddingY": "8px",
            "borderRadius": "{radius.sm}",
            "fontWeight": "600"
          },
          "type": "composition",
          "description": "Primary button style"
        }
      }
    }
  }
}
```

---

## Reference Resolution

Composition properties may reference other tokens.

```json
{
  "backgroundColor": "{color.brand.primary}"
}
```

is resolved to:

```css
var(--color-brand-primary)
```

---

## Generated CSS

```css
:root {
  --color-brand-primary: #0066ff;
  --spacing-md: 16px;
  --radius-sm: 4px;

  --component-button-primary-background-color: var(--color-brand-primary);
  --component-button-primary-padding-x: var(--spacing-md);
  --component-button-primary-padding-y: 8px;
  --component-button-primary-border-radius: var(--radius-sm);
  --component-button-primary-font-weight: 600;
}
```

---

## Naming Conventions

### Folder Names

Use lowercase kebab-case whenever possible.

```text
color
spacing
typography
component
```

### Token Names

Recommended:

```text
primary
secondary
md
lg
button-primary
```

Avoid:

```text
Primary Color
Button Primary Token
```

### CSS Variable Convention

```text
color.brand.primary
↓
--color-brand-primary

component.button.primary.backgroundColor
↓
--component-button-primary-background-color
```

---

## Summary

- Sets are top-level containers.
- Tokens Studio exports may also include top-level `$themes` and `$metadata`.
- `$themes` defines named themes and the token sets enabled for each theme.
- `$metadata.tokenSetOrder` preserves the token set order from Tokens Studio.
- Folders provide hierarchy and organization.
- Tokens are leaf nodes containing `value` and `type`.
- References use DTCG syntax (`{token.path}`).
- Simple tokens generate a single CSS variable.
- Border tokens may generate shorthand or multiple variables.
- Composition tokens generate one CSS variable per property.
- CSS variable names are derived from the token path.
