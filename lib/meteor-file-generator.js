'use babel';

import MeteorFileGeneratorView from './meteor-file-generator-view';
import { CompositeDisposable } from 'atom';

export default {

  meteorFileGeneratorView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.meteorFileGeneratorView = new MeteorFileGeneratorView(state.meteorFileGeneratorViewState);
    this.meteorFileGeneratorView.attach();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'meteor-file-generator:toggle': () => this.toggle(),
      'core:cancel': () => this.hideModal()
    }));
  },

  deactivate() {
    this.meteorFileGeneratorView.close();
    this.meteorFileGeneratorView.modalPanel.destroy();
    this.subscriptions.dispose();
    this.meteorFileGeneratorView.destroy();
  },

  serialize() {
    return {
      meteorFileGeneratorViewState: this.meteorFileGeneratorView.serialize()
    };
  },

  toggle() {
    console.log('MeteorFileGenerator was toggled!');

    if (this.meteorFileGeneratorView.modalPanel.isVisible()) {
      this.hideModal()
    } else {
      this.showModal();
    }
  },

    showModal() {
      this.meteorFileGeneratorView.modalPanel.show();
      this.meteorFileGeneratorView.giveFocus();
    },

    hideModal() {
      this.meteorFileGeneratorView.close();
    }
  };
