// SPDX-License-Identifier: GPL-2.0-or-later

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const MODIFIERS = [
    ['alt', 'Alt'],
    ['super', 'Super'],
    ['control', 'Ctrl'],
    ['shift', 'Shift'],
];

export default class SoftClickPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const group = new Adw.PreferencesGroup({
            description: 'Hold the key and click a window to focus it without bringing it to the front. Apps still see the key, so their own shortcuts, like Alt+click, keep working.',
        });

        const row = new Adw.ComboRow({
            title: 'Hold key',
            model: Gtk.StringList.new(MODIFIERS.map(([, label]) => label)),
        });
        const current = settings.get_string('activation-modifier');
        row.selected = Math.max(0, MODIFIERS.findIndex(([nick]) => nick === current));
        row.connect('notify::selected', () => {
            settings.set_string('activation-modifier', MODIFIERS[row.selected][0]);
        });
        group.add(row);

        const page = new Adw.PreferencesPage();
        page.add(group);
        window.add(page);
    }
}
