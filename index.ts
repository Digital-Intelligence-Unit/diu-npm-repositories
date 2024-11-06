/*
|--------------------------------------------------------------------------
| Package entrypoint
|--------------------------------------------------------------------------
|
| Export values from the package entrypoint as you see fit.
|
*/

// Package configuration
export { configure } from './configure.js'

// Share app instance
import { setApp } from '@adonisjs/core/services/app';
export const shareApplicationIoc = setApp;