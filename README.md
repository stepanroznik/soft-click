# Soft Click

Want to copy something from a window that's half hidden behind another one? Hold **Alt** and click or drag in it. Soft Click focuses that window so you can select text, scroll or type, but doesn't bring it to the front. The windows on top stay where they are. Let go of Alt and clicking works normally again.

## Install

Soft Click targets GNOME Shell 45 through 51. It was tested on GNOME Shell 46 on Wayland. Compatibility with the other versions was checked against GNOME and Mutter source. Download the ZIP from [GitHub Releases](https://github.com/stepanroznik/soft-click/releases/latest), then run this from your download folder.

```sh
gnome-extensions install soft-click@stepanroznik.github.io.shell-extension.zip
```

Log out and back in, then enable **Soft Click** in the Extensions app. To hold Super, Ctrl or Shift instead of Alt, open Soft Click's preferences.

## How it works

GNOME already has a setting that stops clicks from raising windows (`raise-on-click`). Soft Click turns it off while you hold the key and turns it back on when you let go. If the hold key is also the key GNOME uses for dragging windows (Super by default), Soft Click moves window dragging to another key while you hold it, so dragging selects text.

If GNOME Shell stops while the key is held, Soft Click puts both settings back the next time it starts.

## Limits

- Apps still see the key, so their own shortcuts keep working. For example, Alt+click adds a cursor in VS Code and downloads a link in browsers.
- You can only click the visible part of a background window.
- Some apps that draw their own title bars may still come to the front.
