'use babel';

const {TextEditor, CompositeDisposable, Disposable, Emitter } = require('atom');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const touch = require('touch');

const createFileInstantly = true;

export default class MeteorFileGeneratorView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('removethis');

    // Create message element
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();

    this.element = document.createElement('div');
    this.element.classList.add('tree-view-dialog');

    this.promptText = document.createElement('label');
    this.promptText.classList.add('icon');
    this.promptText.textContent = "Enter the name of your template";
    this.element.appendChild(this.promptText);

    this.miniEditor = new TextEditor({mini: true});
    const blurHandler = () => {
      if (document.hasFocus()) { return this.close(); }
    };
    this.miniEditor.element.addEventListener('blur', blurHandler);
    this.disposables.add(new Disposable(() => this.miniEditor.element.removeEventListener('blur', blurHandler)));
    this.disposables.add(this.miniEditor.onDidChange(() => this.showError()));
    this.element.appendChild(this.miniEditor.element);

    let dir = path.dirname("/imports/useless");
    this.info = document.createElement('div');
    this.info.classList.add('icon');
    this.info.textContent = "Files will be created in " + dir;
    this.element.appendChild(this.info);

    this.errorMessage = document.createElement('div');
    this.errorMessage.classList.add('error-message');
    this.element.appendChild(this.errorMessage);

    atom.commands.add(this.element, {
      'core:confirm': () => this.onConfirm(this.miniEditor.getText(), dir),
    }
    );
  }

  attach() {
    this.modalPanel = atom.workspace.addModalPanel({item: this, visible: false});
  }

  giveFocus() {
        this.miniEditor.element.focus();
  }

  close() {
    this.miniEditor.setText('');
    this.modalPanel.hide();
  }

  onConfirm(templateName, pathFromRoot) {
    let pathToCreate = path.join(pathFromRoot, "/", templateName);
    let createWithin = path.dirname(pathToCreate);

    try {
      if (/\/$/.test(pathToCreate)) {
            mkdirp(pathToCreate, function (err) {
                if (err) { atom.notifications.addError(err) }
            });
            } else {
              if (createFileInstantly) {
                if (!fs.existsSync(createWithin) || !fs.statSync(createWithin)) { mkdirp(createWithin); }
                touch(pathToCreate + ".html");
                fs.writeFile(pathToCreate + ".html", "<template name=" + templateName +">\n\n</template>", (err) => {
                  if (err) {
                    atom.notifications.addError(err);
                  } else {
                      atom.notifications.addSuccess('File ' + pathToCreate + '.html successfully created!');
                  }
                });
                touch(pathToCreate + ".js");
                fs.writeFile(pathToCreate + ".js", "import './" + templateName + ".html';\n\nTemplate." + templateName + ".onCreated(function(){\n\n});\n\nTemplate." + templateName + ".onRendered(function(){\n\n});\n\nTemplate." + templateName + ".helpers(function(){\n\n});", (err) => {
                  if (err) {
                    atom.notifications.addError(err);
                  } else {
                      atom.notifications.addSuccess('File ' + pathToCreate + '.js successfully created!');
                  }
                });
              }
              atom.workspace.open(pathToCreate + ".js");
            }
          } catch (error) {
            atom.notifications.addError(error.message);
          }
        }

  showError(message) {
    if (message == null) { message = ''; }
    this.errorMessage.textContent = message;
    if (message) {
      this.element.classList.add('error');
      return window.setTimeout((() => this.element.classList.remove('error')), 300);
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }


}
