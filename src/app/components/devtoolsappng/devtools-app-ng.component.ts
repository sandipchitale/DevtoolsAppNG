import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';

import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { clipboard, WebviewTag } from 'electron';
import { remote } from 'electron';
import { MenuItem } from 'primeng/api';

import { InspectablePage } from './inspectable-page.model';

// tslint:disable-next-line:max-line-length
// https://sandipchitale.github.io/gotomemberallfiles/devtools/front_end/inspector.html?experiments=true&ws=ws://localhost:9222/devtools/page/080B033BF6FC26E7270F3483FDDF5A62
const DEVTOOLS_URL_PREFIX =
  'https://sandipchitale.github.io/gotomemberallfiles/devtools/front_end/inspector.html';
const DEVTOOLS_URL_SUFFIX =
  '?experiments=true&ws=';

const API_URL_PREFIX = 'https://developer.mozilla.org/en-US/search?q=';

@Component({
  selector: 'app-regexp-renamer',
  templateUrl: './devtools-app-ng.component.html',
  styleUrls: ['./devtools-app-ng.component.scss']
})
export class DevtoolsAppNGComponent implements OnInit, OnDestroy {
  version;

  tabs: MenuItem[];
  activeTab: MenuItem;
  @ViewChild('tabsMenu') tabsMenu: MenuItem[];

  chromeHost = 'localhost';
  chromePort = '9222';

  inpsectablePages: InspectablePage[] = [];
  inpsectablePage: InspectablePage;

  devtoolsConnected = false;

  devtoolsURL = DEVTOOLS_URL_PREFIX;
  devtoolsURLs = [
    { label: 'Sandip\'s enhanced devtools with Go to member all files', value: DEVTOOLS_URL_PREFIX },
    // tslint:disable-next-line:max-line-length
    { label: 'Sandip\'s forked Chrome devtools master branch', value: 'https://sandipchitale.github.io/devtools-frontend/front_end/inspector.html' }
  ];
  devtoolsURLArgs = DEVTOOLS_URL_SUFFIX;

  api = '';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient) {
    this.version = remote.app.getVersion();

    document.addEventListener('keydown', (e) => {
      if (e.which === 123) {
        this.toggleDevtools();
      }
    });

    this.tabs = [
      { id: 'devtools', label: 'Devtools' },
      { id: 'info', label: 'Info' },
      { id: 'blog', label: 'Blog' },
      { id: 'github', label: 'Github'},
      { id: 'api', label: 'API'}
    ];
    this.activeTab = this.tabs[0];
  }

  ngOnInit() { }

  toggleDevtools() {
    if (remote.getCurrentWebContents().isDevToolsOpened()) {
      remote.getCurrentWebContents().closeDevTools();
    } else {
      remote.getCurrentWebContents().openDevTools({ mode: 'detach' });
    }
  }

  activateTab() {
    this.activeTab = this.tabsMenu['activeItem'];
  }

  connect(event) {
    this.clear();
    this.http.get<InspectablePage[]>('http://' + this.chromeHost + ':' + this.chromePort + '/json').subscribe(
      (inpsectablePages) => {
        this.inpsectablePages = inpsectablePages;
        if (this.inpsectablePages && this.inpsectablePages.length > 0) {
          this.inpsectablePage = this.inpsectablePages[0];
        }
      },
      (error) => {
        remote.dialog.showErrorBox('Remote Debugger Error',
          'Cannot connecto to Chrome debugger.\n' +
          'Make sure to run Chrome with flags:\n' +
          '--remote-debugging-port=9222 --no-first-run --no-default-browser-check');
      }
    );
  }

  launchDevtools(event) {
    this.devtoolsConnected = true;
    const devtoolsView: WebviewTag = document.querySelector('#devtools-view');
    devtoolsView.setAttribute('src',
      // tslint:disable-next-line:max-line-length
      this.devtoolsURL + DEVTOOLS_URL_SUFFIX + this.inpsectablePage.webSocketDebuggerUrl.substring(4));
    if (event.ctrlKey && event.shiftKey) {
      setTimeout(() => {
        devtoolsView.reloadIgnoringCache();
      }, 500);
    }
  }

  launchDevtoolsOnDevtools(event) {
    const devtoolsView: WebviewTag = document.querySelector('#devtools-view');
    devtoolsView.openDevTools();
  }

  copyDevtoolsURL() {
    clipboard.writeText(this.devtoolsURL + DEVTOOLS_URL_SUFFIX + this.inpsectablePage.webSocketDebuggerUrl.substring(4));
  }

  undo(event) {
    this.devtoolsURL = DEVTOOLS_URL_PREFIX;
  }

  disconnect(event?) {
    this.devtoolsConnected = false;
    document.querySelector('#devtools-view').setAttribute('src', 'about:blank');
  }

  clear(event?) {
    this.inpsectablePages = [];
    this.inpsectablePage = undefined;
  }

  showApi(event) {
    if (this.api.trim().length > 0) {
      document.querySelector('#api-view')
      .setAttribute('src', API_URL_PREFIX + this.api);
    }
  }

  isMaximized(): boolean {
    return remote.getCurrentWindow().isMaximized();
  }

  toggle(event?) {
    if (remote.getCurrentWindow().isMaximized()) {
      remote.getCurrentWindow().restore();
    } else {
      remote.getCurrentWindow().maximize();
    }
  }

  quit(event) {
    remote.getCurrentWindow().close();
  }

  ngOnDestroy(): void { }
}
