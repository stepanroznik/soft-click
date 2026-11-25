// SPDX-License-Identifier: GPL-2.0-or-later

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Extensions cannot see key events sent to applications on Wayland, but the
// pointer query reports which modifiers are held, so we check it on a timer.
const POLL_INTERVAL_MS = 20;

const MODIFIER_MASKS = {
    super: Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK,
    alt: Clutter.ModifierType.MOD1_MASK,
    control: Clutter.ModifierType.CONTROL_MASK,
    shift: Clutter.ModifierType.SHIFT_MASK,
};

// Accelerator names Mutter accepts for each modifier.
const ACCEL_NAMES = {
    super: ['<super>', '<mod4>'],
    alt: ['<alt>', '<mod1>'],
    control: ['<control>', '<ctrl>', '<primary>'],
    shift: ['<shift>'],
};

function accelUses(accel, modifier) {
    const lower = accel.toLowerCase();
    return ACCEL_NAMES[modifier].some(name => lower.includes(name));
}

export default class SoftClickExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._wmSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.wm.preferences'});
        this._overriding = false;

        // GNOME Shell stopped while the hold key was down last time.
        if (this._settings.get_boolean('active'))
            this._restoreWmSettings();

        this._modifierChangedId = this._settings.connect(
            'changed::activation-modifier', () => this._stopOverride());

        this._pollId = GLib.timeout_add(GLib.PRIORITY_HIGH, POLL_INTERVAL_MS, () => {
            this._poll();
            return GLib.SOURCE_CONTINUE;
        });
        GLib.Source.set_name_by_id(this._pollId, '[soft-click] poll modifiers');
    }

    disable() {
        GLib.source_remove(this._pollId);
        this._pollId = 0;

        this._stopOverride();

        this._settings.disconnect(this._modifierChangedId);
        this._settings = null;
        this._wmSettings = null;
    }

    _modifier() {
        const modifier = this._settings.get_string('activation-modifier');
        return modifier in MODIFIER_MASKS ? modifier : 'alt';
    }

    _poll() {
        const [, , mods] = global.get_pointer();
        const held = (mods & MODIFIER_MASKS[this._modifier()]) !== 0;

        if (held && !this._overriding)
            this._startOverride();
        else if (!held && this._overriding)
            this._stopOverride();
    }

    _startOverride() {
        // Clicks already do not raise windows, so there is nothing to change.
        if (!this._wmSettings.get_boolean('raise-on-click'))
            return;

        const dragModifier = this._wmSettings.get_string('mouse-button-modifier');
        const modifier = this._modifier();

        // Save before changing anything, so enable() can undo it after a crash.
        this._settings.set_boolean('saved-raise-on-click', true);
        this._settings.set_string('saved-mouse-button-modifier', dragModifier);
        this._settings.set_boolean('active', true);
        this._overriding = true;

        // If the hold key is also the window drag key, holding it and dragging
        // would move the window instead of selecting text. Use another key.
        if (accelUses(dragModifier, modifier))
            this._wmSettings.set_string('mouse-button-modifier', modifier === 'alt' ? '<Super>' : '<Alt>');

        this._wmSettings.set_boolean('raise-on-click', false);
    }

    _stopOverride() {
        if (!this._overriding)
            return;

        this._overriding = false;
        this._restoreWmSettings();
    }

    _restoreWmSettings() {
        this._wmSettings.set_boolean('raise-on-click',
            this._settings.get_boolean('saved-raise-on-click'));
        this._wmSettings.set_string('mouse-button-modifier',
            this._settings.get_string('saved-mouse-button-modifier'));
        this._settings.set_boolean('active', false);
    }
}
