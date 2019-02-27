import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';

// import * as os from 'os';
// import * as path from 'path';
// import * as fs from 'fs';
import { clipboard } from 'electron';
// import { shell } from 'electron';
import { remote } from 'electron';
// import { spawn } from 'child_process';
import { DOCUMENT } from '@angular/common';
import { MenuItem } from 'primeng/primeng';
import { HttpClient } from '@angular/common/http';
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

  devtoolsURL = DEVTOOLS_URL_PREFIX;
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
        console.error(error);
      }
    );
  }

  launchDevtools(event) {
    document.querySelector('#devtools-view')
      .setAttribute('src',
        // tslint:disable-next-line:max-line-length
        this.devtoolsURL + DEVTOOLS_URL_SUFFIX + this.inpsectablePage.webSocketDebuggerUrl.substring(4));
  }

  copyDevtoolsURL() {
    clipboard.writeText(this.devtoolsURL + DEVTOOLS_URL_SUFFIX + this.inpsectablePage.webSocketDebuggerUrl.substring(4));
  }

  clear(event?) {
    this.inpsectablePages = [];
    this.inpsectablePage = undefined;
    document.querySelector('#devtools-view')
      .setAttribute('src', 'about:blank');
  }

  showApi(event) {
    if (this.api.trim().length > 0) {
      document.querySelector('#api-view')
      .setAttribute('src', API_URL_PREFIX + this.api);
    }
  }

  quit(event) {
    remote.getCurrentWindow().close();
  }

  ngOnDestroy(): void { }
}
