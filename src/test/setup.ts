import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom has no layout engine / scroll APIs.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}
