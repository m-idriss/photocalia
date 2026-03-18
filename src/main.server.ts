/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context?: { platformRef?: unknown }) =>
  bootstrapApplication(App, config, context as Parameters<typeof bootstrapApplication>[2]);

export default bootstrap;
